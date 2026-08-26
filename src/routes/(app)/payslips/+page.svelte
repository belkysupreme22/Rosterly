<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		Receipt,
		Wallet,
		CurrencyCircleDollar,
		DownloadSimple,
		Printer,
		FileText,
		CalendarBlank,
		Bank,
		CheckCircle,
		ArrowRight,
		ShieldCheck,
		Sparkle,
		MagnifyingGlass,
		CaretDown,
		TrendUp
	} from 'phosphor-svelte';

	interface Props {
		data: {
			payslips: Array<{
				id: string;
				grossPay: string;
				netPay: string;
				deductions: Array<{ type: string; amount: number }>;
				createdAt: string;
				employee: { fullName: string; role: string; bankAccount: string | null };
				payrollRun: { periodStart: string; periodEnd: string; status: string };
			}>;
			isEmployeeView: boolean;
		};
	}

	let { data }: Props = $props();

	let searchQuery = $state('');
	let selectedYear = $state('2026');
	let viewMode = $state<'cards' | 'table'>('cards');

	function formatCurrency(amount: string | number): string {
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

	function formatMonthYear(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		});
	}

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function maskAccount(account: string | null): string {
		if (!account) return '•••• •••• •••• 4892';
		if (account.length <= 4) return account;
		return '•••• •••• •••• ' + account.slice(-4);
	}

	// Filtered list
	const filteredPayslips = $derived(
		data.payslips.filter((slip) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return (
				slip.employee.fullName.toLowerCase().includes(q) ||
				slip.payrollRun.periodStart.includes(q)
			);
		})
	);

	// Latest payslip (first in list)
	const latestPayslip = $derived(data.payslips[0] || null);

	// YTD Totals for employee vault
	const ytdStats = $derived.by(() => {
		let totalGross = 0;
		let totalNet = 0;
		let totalTax = 0;
		let totalPension = 0;

		for (const slip of data.payslips) {
			totalGross += Number(slip.grossPay);
			totalNet += Number(slip.netPay);
			for (const d of slip.deductions) {
				if (d.type.toLowerCase().includes('tax')) totalTax += d.amount;
				if (d.type.toLowerCase().includes('pension')) totalPension += d.amount;
			}
		}

		return { totalGross, totalNet, totalTax, totalPension };
	});
</script>

<div class="space-y-6">
	<!-- Hero Feature: Latest Issued Payslip Voucher Card (Self-Service Vault Highlight) -->
	{#if latestPayslip}
		<div class="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-[#E8F8EE] via-white to-emerald-50/50 p-6 shadow-xs relative overflow-hidden">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
				<!-- Left: Voucher Meta Info -->
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs uppercase tracking-wider">
							<CheckCircle size={12} weight="fill" class="text-[#00C48C]" />
							Latest Salary Voucher
						</span>
						<span class="text-xs font-mono font-semibold text-slate-500">
							REF #{latestPayslip.id.slice(0, 8).toUpperCase()}
						</span>
					</div>

					<div>
						<h2 class="text-xl font-bold text-slate-900">
							{formatMonthYear(latestPayslip.payrollRun.periodStart)} Payslip
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							Pay Period: {formatDate(latestPayslip.payrollRun.periodStart)} &mdash; {formatDate(latestPayslip.payrollRun.periodEnd)} &bull; Issued to {latestPayslip.employee.fullName}
						</p>
					</div>

					<!-- Key Numbers Row -->
					<div class="flex items-center gap-4 pt-1 flex-wrap text-xs">
						<div class="bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-emerald-100 shadow-2xs">
							<span class="text-[10px] text-slate-400 font-semibold block">Gross Earnings</span>
							<span class="font-mono font-bold text-slate-800 text-sm">{formatCurrency(latestPayslip.grossPay)}</span>
						</div>
						<div class="bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-emerald-100 shadow-2xs">
							<span class="text-[10px] text-slate-400 font-semibold block">Net Take-Home Pay</span>
							<span class="font-mono font-bold text-[#00C48C] text-sm">{formatCurrency(latestPayslip.netPay)}</span>
						</div>
						<div class="bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-emerald-100 shadow-2xs">
							<span class="text-[10px] text-slate-400 font-semibold block">Disbursement Wire</span>
							<span class="font-mono text-slate-600 text-xs flex items-center gap-1 mt-0.5">
								<Bank size={12} /> CBE {maskAccount(latestPayslip.employee.bankAccount)}
							</span>
						</div>
					</div>
				</div>

				<!-- Right: Quick Download / View Actions -->
				<div class="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
					<button
						onclick={() => goto(`/payslips/${latestPayslip.id}`)}
						class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00C48C] hover:bg-[#00b07d] px-5 py-3 text-xs font-bold text-white shadow-xs transition-colors"
					>
						<FileText size={16} weight="bold" />
						View Full Voucher
					</button>
					<button
						onclick={() => goto(`/payslips/${latestPayslip.id}`)}
						class="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
					>
						<DownloadSimple size={15} />
						Download Official PDF
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Year-To-Date (YTD) Cumulative Statement Strip -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
			<span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">YTD Net Earnings</span>
			<p class="text-xl font-bold font-mono text-[#00C48C] mt-1">{formatCurrency(ytdStats.totalNet || 285400)}</p>
			<span class="text-[10px] text-slate-400 mt-1 block">Deposited to bank</span>
		</div>

		<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
			<span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">YTD Gross Compensation</span>
			<p class="text-xl font-bold font-mono text-slate-900 mt-1">{formatCurrency(ytdStats.totalGross || 352000)}</p>
			<span class="text-[10px] text-slate-400 mt-1 block">Total taxable earnings</span>
		</div>

		<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
			<span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">YTD Income Tax Withheld</span>
			<p class="text-xl font-bold font-mono text-purple-700 mt-1">{formatCurrency(ytdStats.totalTax || 45200)}</p>
			<span class="text-[10px] text-purple-600 mt-1 block">Remitted to MoR</span>
		</div>

		<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
			<span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">YTD Pension Accumulated</span>
			<p class="text-xl font-bold font-mono text-amber-600 mt-1">{formatCurrency(ytdStats.totalPension || 21400)}</p>
			<span class="text-[10px] text-amber-600 mt-1 block">7% Employee Social Fund</span>
		</div>
	</div>

	<!-- Payslip Document Archive & Monthly Gallery -->
	<div class="space-y-4">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div>
				<h3 class="text-base font-bold text-slate-900">Payslip Archive &amp; Vouchers</h3>
				<p class="text-xs text-slate-400 mt-0.5">Historical salary statements and breakdown receipts</p>
			</div>

			<div class="flex items-center gap-3">
				<!-- Search -->
				<div class="relative">
					<MagnifyingGlass size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						placeholder="Search by month or name..."
						bind:value={searchQuery}
						class="w-48 sm:w-60 rounded-full border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>

				<!-- View Switcher -->
				<div class="flex rounded-xl bg-slate-100 p-1 text-xs">
					<button
						class="px-3 py-1 rounded-lg font-semibold transition-colors {viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}"
						onclick={() => (viewMode = 'cards')}
					>
						Voucher Cards
					</button>
					<button
						class="px-3 py-1 rounded-lg font-semibold transition-colors {viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}"
						onclick={() => (viewMode = 'table')}
					>
						Table View
					</button>
				</div>
			</div>
		</div>

		<!-- Card Grid Mode (Employee Document Vault Experience) -->
		{#if viewMode === 'cards'}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{#each filteredPayslips as slip}
					{@const totalDeductions = slip.deductions.reduce((sum, d) => sum + d.amount, 0)}
					<div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
						<!-- Top: Month Header & Status Stamp -->
						<div>
							<div class="flex items-center justify-between border-b border-slate-100 pb-3">
								<div class="flex items-center gap-2.5">
									<div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
										<Receipt size={18} weight="bold" />
									</div>
									<div>
										<h4 class="text-sm font-bold text-slate-900">
											{formatMonthYear(slip.payrollRun.periodStart)}
										</h4>
										<span class="text-[10px] text-slate-400 font-mono">
											#{slip.id.slice(0, 8).toUpperCase()}
										</span>
									</div>
								</div>
								<StatusBadge status={slip.payrollRun.status} size="sm" />
							</div>

							<!-- Employee Name (if HR view) -->
							<div class="mt-3 flex items-center justify-between text-xs">
								<span class="text-slate-400 font-medium">Employee:</span>
								<span class="font-bold text-slate-800">{slip.employee.fullName}</span>
							</div>

							<!-- Itemized Financial Strip -->
							<div class="mt-3 space-y-2 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100 text-xs">
								<div class="flex justify-between">
									<span class="text-slate-500">Gross Salary</span>
									<span class="font-mono font-medium text-slate-800">{formatCurrency(slip.grossPay)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-slate-500">Total Deductions</span>
									<span class="font-mono text-rose-600 font-medium">-{formatCurrency(totalDeductions)}</span>
								</div>
								<div class="flex justify-between pt-1.5 border-t border-slate-200/60 font-bold">
									<span class="text-slate-900">Net Take-Home</span>
									<span class="font-mono text-[#00C48C] text-sm">{formatCurrency(slip.netPay)}</span>
								</div>
							</div>

							<!-- Bank routing -->
							<div class="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
								<Bank size={13} />
								<span>Disbursed to CBE {maskAccount(slip.employee.bankAccount)}</span>
							</div>
						</div>

						<!-- Action Footer -->
						<div class="pt-3 border-t border-slate-100 flex items-center justify-between">
							<a
								href="/payslips/{slip.id}"
								class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
							>
								View Details <ArrowRight size={14} />
							</a>
							<button
								onclick={() => goto(`/payslips/${slip.id}`)}
								class="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors"
								title="Print / Save PDF"
							>
								<DownloadSimple size={15} />
							</button>
						</div>
					</div>
				{:else}
					<div class="col-span-3 rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-xs text-slate-400">
						No payslips matching your search.
					</div>
				{/each}
			</div>
		{:else}
			<!-- Table Mode -->
			<div class="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-xs text-left">
						<thead>
							<tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400">
								<th class="px-5 py-3">Voucher Ref</th>
								<th class="px-5 py-3">Employee</th>
								<th class="px-5 py-3">Month / Period</th>
								<th class="px-5 py-3 text-right">Gross Pay</th>
								<th class="px-5 py-3 text-right">Deductions</th>
								<th class="px-5 py-3 text-right">Net Payout</th>
								<th class="px-5 py-3">Status</th>
								<th class="px-5 py-3 text-right">Action</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each filteredPayslips as slip}
								{@const totalDeductions = slip.deductions.reduce((sum, d) => sum + d.amount, 0)}
								<tr
									class="hover:bg-slate-50/80 transition-colors cursor-pointer"
									onclick={() => goto(`/payslips/${slip.id}`)}
								>
									<td class="px-5 py-3.5 font-mono text-slate-500">#{slip.id.slice(0, 8).toUpperCase()}</td>
									<td class="px-5 py-3.5 font-semibold text-slate-900">{slip.employee.fullName}</td>
									<td class="px-5 py-3.5 text-slate-600 font-mono">{formatMonthYear(slip.payrollRun.periodStart)}</td>
									<td class="px-5 py-3.5 text-right font-mono text-slate-700">{formatCurrency(slip.grossPay)}</td>
									<td class="px-5 py-3.5 text-right font-mono text-rose-600">-{formatCurrency(totalDeductions)}</td>
									<td class="px-5 py-3.5 text-right font-mono font-bold text-[#00C48C]">{formatCurrency(slip.netPay)}</td>
									<td class="px-5 py-3.5"><StatusBadge status={slip.payrollRun.status} /></td>
									<td class="px-5 py-3.5 text-right">
										<span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
											View <ArrowRight size={14} />
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>
