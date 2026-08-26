<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { ArrowLeft, Check, PaperPlaneTilt, Receipt, Buildings } from 'phosphor-svelte';

	interface Props {
		data: {
			user: { role: string };
			payrollRun: {
				id: string;
				periodStart: string;
				periodEnd: string;
				status: string;
				createdAt: string;
				company: { name: string; tin: string };
				payslips: Array<{
					id: string;
					grossPay: string;
					netPay: string;
					deductions: Array<{ type: string; amount: number }>;
					employee: {
						id: string;
						fullName: string;
						role: string;
						baseSalary: string;
						bankAccount: string | null;
					};
				}>;
			};
		};
	}

	let { data }: Props = $props();

	let isUpdating = $state(false);
	let updateError = $state('');

	const canApprove = $derived(data.user.role === 'owner' || data.user.role === 'hr_admin' || data.user.role === 'manager');
	const canDisburse = $derived(data.user.role === 'owner' || data.user.role === 'hr_admin');

	function formatCurrency(amount: number | string): string {
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

	// Compute breakdown totals
	const totals = $derived.by(() => {
		let totalGross = 0;
		let totalTax = 0;
		let totalPension = 0;
		let totalNet = 0;

		for (const slip of data.payrollRun.payslips) {
			totalGross += Number(slip.grossPay);
			totalNet += Number(slip.netPay);

			for (const d of slip.deductions) {
				if (d.type.toLowerCase().includes('tax')) {
					totalTax += d.amount;
				} else if (d.type.toLowerCase().includes('pension')) {
					totalPension += d.amount;
				}
			}
		}

		const totalEmployerPension = Math.round(totalGross * 0.11 * 100) / 100;

		return {
			totalGross,
			totalTax,
			totalPension,
			totalEmployerPension,
			totalNet
		};
	});

	async function updateStatus(newStatus: 'pending_approval' | 'disbursed') {
		isUpdating = true;
		updateError = '';

		try {
			const res = await fetch(`/api/payroll/${data.payrollRun.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});

			if (!res.ok) {
				const err = await res.json();
				updateError = err.message || 'Failed to update payroll status';
				return;
			}

			await invalidateAll();
		} catch {
			updateError = 'An error occurred while updating payroll status';
		} finally {
			isUpdating = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header and Actions -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-3">
				<h1 class="text-xl font-semibold text-text-primary">
					Payroll for {formatDate(data.payrollRun.periodStart)} &mdash; {formatDate(data.payrollRun.periodEnd)}
				</h1>
				<StatusBadge status={data.payrollRun.status} size="md" />
			</div>
			<p class="text-sm text-text-muted mt-1 flex items-center gap-1.5">
				<Buildings size={16} />
				{data.payrollRun.company.name} &bull; TIN: {data.payrollRun.company.tin}
			</p>
		</div>

		<div class="flex items-center gap-3">
			{#if updateError}
				<p class="text-xs text-danger">{updateError}</p>
			{/if}

			{#if data.payrollRun.status === 'draft' && canApprove}
				<Button
					variant="primary"
					onclick={() => updateStatus('pending_approval')}
					disabled={isUpdating}
				>
					<PaperPlaneTilt size={16} />
					{isUpdating ? 'Submitting...' : 'Submit for Approval'}
				</Button>
			{:else if data.payrollRun.status === 'pending_approval' && canDisburse}
				<Button
					variant="primary"
					onclick={() => updateStatus('disbursed')}
					disabled={isUpdating}
				>
					<Check size={16} weight="bold" />
					{isUpdating ? 'Disbursing...' : 'Approve & Disburse'}
				</Button>
			{/if}
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg border border-border bg-white p-5">
			<p class="text-xs font-medium text-text-muted">Total Gross Pay</p>
			<p class="mt-2 text-xl font-semibold font-mono text-text-primary">{formatCurrency(totals.totalGross)}</p>
			<p class="mt-1 text-xs text-text-muted">{data.payrollRun.payslips.length} employees</p>
		</div>
		<div class="rounded-lg border border-border bg-white p-5">
			<p class="text-xs font-medium text-text-muted">Total Income Tax</p>
			<p class="mt-2 text-xl font-semibold font-mono text-text-primary">{formatCurrency(totals.totalTax)}</p>
			<p class="mt-1 text-xs text-text-muted">Ethiopian bracket schedule</p>
		</div>
		<div class="rounded-lg border border-border bg-white p-5">
			<p class="text-xs font-medium text-text-muted">Employee Pension (7%)</p>
			<p class="mt-2 text-xl font-semibold font-mono text-text-primary">{formatCurrency(totals.totalPension)}</p>
			<p class="mt-1 text-xs text-text-muted">Employer (11%): {formatCurrency(totals.totalEmployerPension)}</p>
		</div>
		<div class="rounded-lg border border-brand-200 bg-brand-50 p-5">
			<p class="text-xs font-medium text-brand-800">Total Net Payout</p>
			<p class="mt-2 text-xl font-bold font-mono text-brand-900">{formatCurrency(totals.totalNet)}</p>
			<p class="mt-1 text-xs text-brand-700">Ready for bank transfer</p>
		</div>
	</div>

	<!-- Payslips Breakdown Table -->
	<div class="rounded-lg border border-border bg-white">
		<div class="border-b border-border px-5 py-4 flex items-center justify-between">
			<div>
				<h2 class="text-base font-semibold text-text-primary">Employee Payslips Breakdown</h2>
				<p class="text-xs text-text-muted">Detailed itemized deductions per employee</p>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-surface-dim">
						<th class="px-4 py-3 text-left font-medium text-text-secondary">Employee</th>
						<th class="px-4 py-3 text-left font-medium text-text-secondary">Role</th>
						<th class="px-4 py-3 text-right font-medium text-text-secondary">Base Salary</th>
						<th class="px-4 py-3 text-right font-medium text-text-secondary">Pension (7%)</th>
						<th class="px-4 py-3 text-right font-medium text-text-secondary">Income Tax</th>
						<th class="px-4 py-3 text-right font-medium text-text-secondary">Total Deductions</th>
						<th class="px-4 py-3 text-right font-medium text-text-secondary">Net Pay</th>
						<th class="px-4 py-3 text-right font-medium text-text-secondary">Payslip</th>
					</tr>
				</thead>
				<tbody>
					{#each data.payrollRun.payslips as slip}
						{@const pension = slip.deductions.find((d) => d.type.toLowerCase().includes('pension'))?.amount || 0}
						{@const tax = slip.deductions.find((d) => d.type.toLowerCase().includes('tax'))?.amount || 0}
						{@const totalDed = slip.deductions.reduce((s, d) => s + d.amount, 0)}
						<tr class="border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors">
							<td class="px-4 py-3 font-medium text-text-primary">
								{slip.employee.fullName}
							</td>
							<td class="px-4 py-3">
								<StatusBadge status={slip.employee.role} />
							</td>
							<td class="px-4 py-3 text-right font-mono text-text-primary">
								{formatCurrency(slip.grossPay)}
							</td>
							<td class="px-4 py-3 text-right font-mono text-text-muted">
								{formatCurrency(pension)}
							</td>
							<td class="px-4 py-3 text-right font-mono text-text-muted">
								{formatCurrency(tax)}
							</td>
							<td class="px-4 py-3 text-right font-mono text-danger">
								-{formatCurrency(totalDed)}
							</td>
							<td class="px-4 py-3 text-right font-mono font-semibold text-text-primary">
								{formatCurrency(slip.netPay)}
							</td>
							<td class="px-4 py-3 text-right">
								<a
									href="/payslips/{slip.id}"
									class="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
								>
									<Receipt size={14} />
									View Slip
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
