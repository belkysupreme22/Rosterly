<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import SlideOver from '$lib/components/SlideOver.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import GroupedBarChart from '$lib/components/charts/GroupedBarChart.svelte';
	import {
		Plus,
		Calculator,
		ArrowRight,
		CheckCircle,
		CurrencyCircleDollar,
		Wallet,
		ChartLineUp,
		Receipt,
		MagnifyingGlass,
		DotsThree,
		ArrowUpRight,
		Coins,
		CaretDown
	} from 'phosphor-svelte';

	interface Props {
		data: {
			user: { role: string };
			runs: Array<{
				id: string;
				periodStart: string;
				periodEnd: string;
				status: string;
				createdAt: string;
				company: { name: string };
				payslips: Array<{
					id: string;
					grossPay: string;
					netPay: string;
					deductions: Array<{ type: string; amount: number }>;
					employee: { fullName: string; role: string };
				}>;
			}>;
			totalEmployees: number;
			companies: Array<{ id: string; name: string }>;
		};
	}

	let { data }: Props = $props();

	const canCreate = $derived(data.user.role === 'hr_admin' || data.user.role === 'owner');

	// SlideOver State
	let showRunModal = $state(false);
	let isSubmitting = $state(false);
	let isPreviewing = $state(false);
	let errorMessage = $state('');

	const now = new Date();
	const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
	const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

	let periodStart = $state(firstDay);
	let periodEnd = $state(lastDay);
	let companyId = $state('');

	$effect(() => {
		if (!companyId && data.companies?.[0]?.id) {
			companyId = data.companies[0].id;
		}
	});

	let previewData = $state<any>(null);

	function formatCurrency(amount: number | string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'ETB',
			minimumFractionDigits: 2
		}).format(Number(amount));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	// Calculate grand totals across runs
	const grandTotals = $derived.by(() => {
		let totalGross = 0;
		let totalNet = 0;
		let totalDeductions = 0;
		let totalTax = 0;
		let totalPension = 0;

		for (const run of data.runs) {
			for (const slip of run.payslips) {
				totalGross += Number(slip.grossPay);
				totalNet += Number(slip.netPay);
				for (const d of slip.deductions) {
					totalDeductions += d.amount;
					if (d.type.toLowerCase().includes('tax')) {
						totalTax += d.amount;
					}
					if (d.type.toLowerCase().includes('pension')) {
						totalPension += d.amount;
					}
				}
			}
		}

		return { totalGross, totalNet, totalDeductions, totalTax, totalPension };
	});

	// Payroll breakdown figures for the segmented bar
	const breakdownItems = $derived([
		{
			label: 'Net Salary',
			pct: 74,
			amount: grandTotals.totalNet || 280000,
			color: '#00C48C'
		},
		{
			label: 'Total Tax',
			pct: 19,
			amount: grandTotals.totalTax || 71800,
			color: '#064E3B'
		},
		{
			label: 'Pension (7%)',
			pct: 5,
			amount: grandTotals.totalPension || 20500,
			color: '#A7F3D0'
		},
		{
			label: 'Allowances',
			pct: 2,
			amount: 6000,
			color: '#67E8F9'
		}
	]);

	// Flat list of payslips for the table
	let searchQuery = $state('');
	let activeFilter = $state('all');
	const filters = ['all', 'disbursed', 'pending'];

	const allPayslips = $derived.by(() => {
		const list: Array<{
			id: string;
			runId: string;
			periodStart: string;
			periodEnd: string;
			status: string;
			grossPay: string;
			netPay: string;
			tax: number;
			pension: number;
			employee: { fullName: string; role: string };
		}> = [];

		for (const run of data.runs) {
			for (const slip of run.payslips) {
				let tax = 0;
				let pension = 0;
				for (const d of slip.deductions) {
					if (d.type.toLowerCase().includes('tax')) tax += d.amount;
					if (d.type.toLowerCase().includes('pension')) pension += d.amount;
				}
				list.push({
					id: slip.id,
					runId: run.id,
					periodStart: run.periodStart,
					periodEnd: run.periodEnd,
					status: run.status,
					grossPay: slip.grossPay,
					netPay: slip.netPay,
					tax,
					pension,
					employee: slip.employee
				});
			}
		}

		return list.filter((p) => {
			const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
			const matchesSearch =
				!searchQuery ||
				p.employee.fullName.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesFilter && matchesSearch;
		});
	});

	async function handlePreview() {
		isPreviewing = true;
		errorMessage = '';
		previewData = null;

		try {
			const res = await fetch('/api/payroll', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'preview',
					periodStart,
					periodEnd,
					companyId
				})
			});

			const json = await res.json();
			if (!res.ok) {
				errorMessage = json.message || 'Failed to preview payroll calculation';
				return;
			}

			previewData = json.preview;
		} catch (e: any) {
			errorMessage = 'An error occurred while calculating payroll preview';
		} finally {
			isPreviewing = false;
		}
	}

	async function handleExecuteRun() {
		isSubmitting = true;
		errorMessage = '';

		try {
			const res = await fetch('/api/payroll', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'create',
					periodStart,
					periodEnd,
					companyId
				})
			});

			const json = await res.json();
			if (!res.ok) {
				errorMessage = json.message || 'Failed to create payroll run';
				return;
			}

			showRunModal = false;
			previewData = null;
			await invalidateAll();
			goto(`/payroll/${json.payrollRun.id}`);
		} catch (e: any) {
			errorMessage = 'An error occurred while creating payroll run';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-6">
	{#if canCreate}
		<!-- Top Action Bar -->
		<div class="flex items-center justify-end">
			<Button variant="primary" onclick={() => (showRunModal = true)}>
				<Plus size={16} weight="bold" />
				Run Payroll
			</Button>
		</div>
	{/if}

	<!-- Top 4 Metric Cards (TeamHub Reference) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
		<!-- Card 1: Total Disbursement (Highlighted Pastel Green) -->
		<div class="rounded-2xl border border-emerald-200/70 bg-[#E8F8EE] p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-emerald-950">Total Disbursement</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-1">
					{formatCurrency(grandTotals.totalGross || 352000)}
				</p>
				<span class="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
					<ArrowUpRight size={12} weight="bold" />
					+4.8% vs last month
				</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00C48C] shadow-xs">
				<Coins size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 2: Net Salary -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Net Salary Payout</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-1">
					{formatCurrency(grandTotals.totalNet || 285400)}
				</p>
				<span class="text-[11px] text-slate-400 font-medium block mt-1">Direct Bank Wire</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
				<Wallet size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 3: Total Tax Remitted -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Total Tax Remitted</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-1">
					{formatCurrency(grandTotals.totalTax || 45200)}
				</p>
				<span class="text-[11px] text-purple-600 font-medium block mt-1">MoR Compliance</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
				<Receipt size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 4: Total Pension Fund -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Total Pension Fund</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-1">
					{formatCurrency(grandTotals.totalPension || 21400)}
				</p>
				<span class="text-[11px] text-amber-600 font-medium block mt-1">7% Employee + 11% Org</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
				<ChartLineUp size={24} weight="fill" />
			</div>
		</div>
	</div>

	<!-- Middle Section: Area Curve (7 cols) + Exact TeamHub Segmented Payroll Breakdown (5 cols) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
		<div class="lg:col-span-7">
			<GroupedBarChart
				title="Payroll Expenditure (Gross vs Net)"
				metricValue={formatCurrency(grandTotals.totalGross || 352000)}
				trendText="+2.85% vs last month"
				timeframe="Year 2026"
				height={210}
			/>
		</div>

		<!-- Exact Segmented Bar Payroll Breakdown Matching Reference Mockup -->
		<div class="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between h-full">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<h4 class="text-xs font-bold text-slate-900">Payroll Breakdown</h4>
				<div class="flex items-center gap-2">
					<button class="flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-xl border border-slate-200/70">
						<span>This Year</span>
						<CaretDown size={10} weight="bold" />
					</button>
					<button class="text-slate-400 hover:text-slate-700 p-1">
						<DotsThree size={16} weight="bold" />
					</button>
				</div>
			</div>

			<!-- Large Total Amount -->
			<div class="my-2">
				<span class="text-[10px] font-semibold text-slate-400 block">Total Payroll Expenditure</span>
				<p class="text-2xl font-bold font-mono text-slate-900 mt-0.5">
					{formatCurrency(grandTotals.totalGross || 378300)}
				</p>
			</div>

			<!-- Horizontal Segmented Progress Bar (TeamHub Reference Style) -->
			<div class="my-2">
				<div class="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden gap-0.5 p-0.5 border border-slate-200/60">
					{#each breakdownItems as item}
						<div
							class="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
							style="width: {item.pct}%; background-color: {item.color};"
							title="{item.label}: {item.pct}%"
						></div>
					{/each}
				</div>
			</div>

			<!-- 2x2 Itemized Legend Breakdown Grid -->
			<div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
				{#each breakdownItems as item}
					<div class="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
						<div class="flex items-center gap-1.5">
							<span class="h-2 w-2 rounded-full shrink-0" style="background-color: {item.color}"></span>
							<span class="text-[11px] font-semibold text-slate-700 truncate">{item.label}</span>
						</div>
						<div class="flex items-baseline justify-between mt-1">
							<span class="font-mono text-xs font-bold text-slate-900">{formatCurrency(item.amount)}</span>
							<span class="font-mono text-[10px] text-slate-400 font-semibold">{item.pct}%</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Bottom Section: Payroll List Table -->
	<div class="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
		<!-- Table Header Controls -->
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-100 gap-4">
			<div>
				<h3 class="text-base font-bold text-slate-900">Payroll List</h3>
				<p class="text-xs text-slate-400 mt-0.5">{allPayslips.length} payslips recorded</p>
			</div>

			<div class="flex items-center gap-3 flex-wrap">
				<!-- Search bar -->
				<div class="relative">
					<MagnifyingGlass size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						placeholder="Search employee..."
						bind:value={searchQuery}
						class="w-48 sm:w-60 rounded-full border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>

				<!-- Filter tabs -->
				<div class="flex gap-1 rounded-xl bg-slate-100 p-1">
					{#each filters as filter}
						<button
							class="rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors
								   {activeFilter === filter
									 ? 'bg-white text-slate-900 shadow-xs'
									 : 'text-slate-500 hover:text-slate-800'}"
							onclick={() => (activeFilter = filter)}
						>
							{filter}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-xs text-left">
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400">
						<th class="px-5 py-3">Employee</th>
						<th class="px-5 py-3">Period</th>
						<th class="px-5 py-3 text-right">Gross Pay</th>
						<th class="px-5 py-3 text-right">Income Tax</th>
						<th class="px-5 py-3 text-right">Pension (7%)</th>
						<th class="px-5 py-3 text-right">Net Payout</th>
						<th class="px-5 py-3">Status</th>
						<th class="px-5 py-3 text-right">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each allPayslips as slip}
						<tr
							class="hover:bg-slate-50/80 transition-colors cursor-pointer"
							onclick={() => goto(`/payslips/${slip.id}`)}
						>
							<!-- Employee Avatar + Stacked Name & Role -->
							<td class="px-5 py-3.5">
								<div class="flex items-center gap-3">
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
										{getInitials(slip.employee.fullName)}
									</div>
									<div>
										<p class="font-semibold text-slate-900">{slip.employee.fullName}</p>
										<p class="text-[10px] text-slate-400 capitalize">{slip.employee.role.replace('_', ' ')}</p>
									</div>
								</div>
							</td>

							<!-- Period -->
							<td class="px-5 py-3.5 text-slate-600 font-mono">
								{formatDate(slip.periodStart)} &mdash; {formatDate(slip.periodEnd)}
							</td>

							<!-- Financial Figures -->
							<td class="px-5 py-3.5 text-right font-mono text-slate-700">{formatCurrency(slip.grossPay)}</td>
							<td class="px-5 py-3.5 text-right font-mono text-purple-700">-{formatCurrency(slip.tax)}</td>
							<td class="px-5 py-3.5 text-right font-mono text-amber-700">-{formatCurrency(slip.pension)}</td>
							<td class="px-5 py-3.5 text-right font-mono font-bold text-[#00C48C]">{formatCurrency(slip.netPay)}</td>

							<!-- Status Pill -->
							<td class="px-5 py-3.5">
								<StatusBadge status={slip.status} />
							</td>

							<!-- Action -->
							<td class="px-5 py-3.5 text-right">
								<span class="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700">
									View Payslip <ArrowRight size={14} class="ml-1" />
								</span>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="8" class="px-5 py-12 text-center text-slate-400">
								No payslips recorded. Run your first payroll batch to view itemized records.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Run Payroll SlideOver -->
<SlideOver bind:open={showRunModal} title="Process Monthly Payroll">
	<div class="space-y-4">
		{#if errorMessage}
			<div class="rounded-xl bg-danger-light px-4 py-3 text-sm text-danger border border-red-200">
				{errorMessage}
			</div>
		{/if}

		<div class="rounded-xl bg-emerald-50/60 p-3.5 text-xs text-emerald-950 border border-emerald-200/50">
			Calculates Ethiopian income tax brackets, 7% employee pension, and itemized deduction rules for <strong>{data.totalEmployees} active employees</strong>.
		</div>

		<Input label="Period Start Date" name="periodStart" type="date" bind:value={periodStart} required />
		<Input label="Period End Date" name="periodEnd" type="date" bind:value={periodEnd} required />

		{#if data.companies.length > 1}
			<Select
				label="Company"
				name="companyId"
				bind:value={companyId}
				options={data.companies.map((c) => ({ value: c.id, label: c.name }))}
				required
			/>
		{/if}

		<div class="pt-2">
			<Button variant="secondary" class="w-full" onclick={handlePreview} disabled={isPreviewing || isSubmitting}>
				<Calculator size={16} />
				{isPreviewing ? 'Calculating preview...' : 'Calculate Preview'}
			</Button>
		</div>

		<!-- Calculation Preview Box -->
		{#if previewData}
			<div class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
				<div class="flex items-center gap-2 text-emerald-950 font-bold text-sm">
					<CheckCircle size={18} weight="fill" class="text-[#00C48C]" />
					Calculation Preview ({previewData.employeeCount} Employees)
				</div>
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div class="bg-white p-2.5 rounded-xl border border-emerald-100">
						<span class="text-slate-400">Total Gross:</span>
						<p class="font-mono font-bold text-slate-900 text-sm mt-0.5">{formatCurrency(previewData.summary.totalGross)}</p>
					</div>
					<div class="bg-white p-2.5 rounded-xl border border-emerald-100">
						<span class="text-slate-400">Total Income Tax:</span>
						<p class="font-mono font-bold text-slate-900 text-sm mt-0.5">{formatCurrency(previewData.summary.totalTax)}</p>
					</div>
					<div class="bg-white p-2.5 rounded-xl border border-emerald-100">
						<span class="text-slate-400">Employee Pension (7%):</span>
						<p class="font-mono font-bold text-slate-900 text-sm mt-0.5">{formatCurrency(previewData.summary.totalPension)}</p>
					</div>
					<div class="bg-white p-2.5 rounded-xl border border-emerald-100">
						<span class="text-slate-400">Total Net Payout:</span>
						<p class="font-mono font-bold text-[#00C48C] text-sm mt-0.5">{formatCurrency(previewData.summary.totalNet)}</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="flex gap-3 pt-4 border-t border-slate-100">
			<Button
				type="button"
				variant="primary"
				class="flex-1"
				onclick={handleExecuteRun}
				disabled={isSubmitting || !previewData}
			>
				{isSubmitting ? 'Processing...' : 'Confirm & Process Run'}
			</Button>
			<Button type="button" variant="secondary" onclick={() => (showRunModal = false)}>
				Cancel
			</Button>
		</div>
	</div>
</SlideOver>
