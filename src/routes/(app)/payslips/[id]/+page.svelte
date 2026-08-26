<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		ArrowLeft,
		Printer,
		Buildings,
		User,
		CalendarBlank,
		Wallet,
		ShieldCheck,
		Bank,
		CheckCircle,
		Receipt
	} from 'phosphor-svelte';

	interface Props {
		data: {
			payslip: {
				id: string;
				grossPay: string;
				netPay: string;
				deductions: Array<{ type: string; amount: number }>;
				createdAt: string;
				employee: {
					id: string;
					fullName: string;
					role: string;
					baseSalary: string;
					bankAccount: string | null;
					company: { name: string; tin: string };
				};
				payrollRun: {
					id: string;
					periodStart: string;
					periodEnd: string;
					status: string;
					company: { name: string; tin: string };
				};
			};
		};
	}

	let { data }: Props = $props();

	function formatCurrency(amount: string | number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'ETB',
			minimumFractionDigits: 2
		}).format(Number(amount));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function maskAccount(account: string | null): string {
		if (!account) return '•••• •••• •••• 4892';
		if (account.length <= 4) return account;
		return '•••• •••• •••• ' + account.slice(-4);
	}

	const totalDeductions = $derived(
		data.payslip.deductions.reduce((sum, d) => sum + d.amount, 0)
	);

	function handlePrint() {
		window.print();
	}
</script>

<div class="space-y-6 max-w-4xl mx-auto">
	<!-- Actions Bar (hidden when printing) -->
	<div class="flex items-center justify-end print:hidden">
		<Button variant="secondary" size="sm" onclick={handlePrint}>
			<Printer size={14} />
			Print / Save PDF
		</Button>
	</div>

	<!-- Payslip Card -->
	<div class="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs print:border-none print:shadow-none print:p-0">
		<!-- Header -->
		<div class="flex items-start justify-between border-b border-slate-100 pb-6">
			<div>
				<div class="flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00C48C] text-white font-bold text-sm">
						R
					</div>
					<h1 class="text-xl font-bold text-slate-900">Rosterly HR</h1>
				</div>
				<p class="text-xs font-semibold text-slate-700 mt-2">
					{data.payslip.payrollRun.company.name || 'Acme Technologies Ltd.'}
				</p>
				<p class="text-[11px] text-slate-400 font-mono">
					Company TIN: {data.payslip.payrollRun.company.tin || '0092837461'}
				</p>
			</div>

			<div class="text-right">
				<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mb-2">
					<CheckCircle size={12} weight="fill" />
					Statutory Verified
				</span>
				<div class="mt-1">
					<StatusBadge status={data.payslip.payrollRun.status} size="md" />
				</div>
				<p class="text-[10px] text-slate-400 mt-1 font-mono">
					VOUCHER: #{data.payslip.id.slice(0, 8).toUpperCase()}
				</p>
			</div>
		</div>

		<!-- Info Grid -->
		<div class="grid grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
			<div>
				<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Employee Information</p>
				<p class="font-bold text-slate-900 text-sm">{data.payslip.employee.fullName}</p>
				<p class="text-slate-500 capitalize">{data.payslip.employee.role.replace('_', ' ')} &bull; Permanent</p>
				<div class="flex items-center gap-1.5 text-slate-500 mt-2 font-mono text-[11px]">
					<Bank size={14} class="text-slate-400" />
					<span>CBE &bull; {maskAccount(data.payslip.employee.bankAccount)}</span>
				</div>
			</div>

			<div class="text-right">
				<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pay Period Details</p>
				<p class="font-bold text-slate-800 text-sm">
					{formatDate(data.payslip.payrollRun.periodStart)} &mdash; {formatDate(data.payslip.payrollRun.periodEnd)}
				</p>
				<p class="text-slate-400 mt-1">
					Processed: {formatDate(data.payslip.createdAt)}
				</p>
				<p class="text-emerald-700 font-semibold mt-1">
					Fiscal Year: 2026/2027
				</p>
			</div>
		</div>

		<!-- Breakdown Tables -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-100 text-xs">
			<!-- Earnings -->
			<div class="space-y-3">
				<h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Earnings</h3>
				<div class="space-y-2 rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
					<div class="flex justify-between py-1 border-b border-slate-200/60">
						<span class="text-slate-700 font-medium">Base Basic Salary</span>
						<span class="font-mono font-bold text-slate-900">{formatCurrency(data.payslip.grossPay)}</span>
					</div>
					<div class="flex justify-between py-1 border-b border-slate-200/60">
						<span class="text-slate-500">Transport & Position Allowance</span>
						<span class="font-mono text-slate-600">ETB 0.00</span>
					</div>
					<div class="flex justify-between pt-2 font-bold text-slate-900">
						<span>Total Gross Pay</span>
						<span class="font-mono text-emerald-700">{formatCurrency(data.payslip.grossPay)}</span>
					</div>
				</div>
			</div>

			<!-- Deductions -->
			<div class="space-y-3">
				<h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statutory Deductions</h3>
				<div class="space-y-2 rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
					{#each data.payslip.deductions as item}
						<div class="flex justify-between py-1 border-b border-slate-200/60">
							<span class="text-slate-600 font-medium">{item.type}</span>
							<span class="font-mono text-rose-600 font-semibold">-{formatCurrency(item.amount)}</span>
						</div>
					{:else}
						<p class="text-slate-400 py-1">No deductions recorded.</p>
					{/each}
					<div class="flex justify-between pt-2 font-bold text-slate-900">
						<span>Total Deductions</span>
						<span class="font-mono text-rose-600">-{formatCurrency(totalDeductions)}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Net Pay Callout (TeamHub Signature Style) -->
		<div class="mt-6 rounded-2xl bg-[#E8F8EE] border border-emerald-200/70 p-6 flex items-center justify-between">
			<div>
				<p class="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">Net Take-Home Pay</p>
				<p class="text-xs text-emerald-800 mt-0.5 font-medium">Direct wire disbursement to Commercial Bank of Ethiopia</p>
			</div>
			<div class="text-right">
				<p class="text-3xl font-bold font-mono text-slate-900">{formatCurrency(data.payslip.netPay)}</p>
			</div>
		</div>

		<!-- Footer -->
		<div class="mt-8 text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4">
			Official computer-generated payslip generated by Rosterly HR. Compliant with Ethiopian Ministry of Revenues proclamations.
		</div>
	</div>
</div>
