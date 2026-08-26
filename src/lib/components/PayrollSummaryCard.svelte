<script lang="ts">
	import { DotsThree } from 'phosphor-svelte';

	interface Props {
		baseSalary?: number | string;
		currency?: string;
	}

	let {
		baseSalary = 3200,
		currency = '$'
	}: Props = $props();

	const baseNum = $derived(Number(baseSalary) || 3200);

	function formatVal(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Reference data
	const transportation = 120;
	const meal = 110;
	const internet = 70;
	const health = 120;
	const life = 40;
	const device = 65;
	const training = 80;
	const fitness = 50;

	const totalValue = $derived(
		baseNum + transportation + meal + internet + health + life + device + training + fitness
	);
</script>

<div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<h4 class="text-xs font-bold text-slate-900">Payroll Summary</h4>
		<button class="text-slate-400 hover:text-slate-700 transition-colors p-1">
			<DotsThree size={18} weight="bold" />
		</button>
	</div>

	<!-- Breakdown Table with Snug, Natural Reference Spacing -->
	<div class="space-y-3.5 text-xs">
		<!-- Column Headers -->
		<div class="flex justify-between text-[11px] font-semibold text-slate-400 pb-1.5 border-b border-slate-100">
			<span>Description</span>
			<span class="text-right">Amount USD/month</span>
		</div>

		<!-- Base Salary -->
		<div class="flex justify-between font-semibold text-slate-900 py-0.5">
			<span>Base Salary</span>
			<span class="font-mono">{formatVal(baseNum)}</span>
		</div>

		<!-- Allowances Section -->
		<div class="pt-1">
			<span class="text-[11px] font-bold text-slate-900 block mb-1.5">Allowances</span>
			<div class="space-y-1.5 pl-0.5 text-slate-600 text-xs">
				<div class="flex justify-between">
					<span>Transportation</span>
					<span class="font-mono text-slate-900">{formatVal(transportation)}</span>
				</div>
				<div class="flex justify-between">
					<span>Meal</span>
					<span class="font-mono text-slate-900">{formatVal(meal)}</span>
				</div>
				<div class="flex justify-between">
					<span>Internet (Hybrid)</span>
					<span class="font-mono text-slate-900">{formatVal(internet)}</span>
				</div>
			</div>
		</div>

		<!-- Benefits Section -->
		<div class="pt-1">
			<span class="text-[11px] font-bold text-slate-900 block mb-1.5">Benefits</span>
			<div class="space-y-1.5 pl-0.5 text-slate-600 text-xs">
				<div class="flex justify-between">
					<span>Health Insurance</span>
					<span class="font-mono text-slate-900">{formatVal(health)}</span>
				</div>
				<div class="flex justify-between">
					<span>Life Insurance</span>
					<span class="font-mono text-slate-900">{formatVal(life)}</span>
				</div>
				<div class="flex justify-between">
					<span>Company Device</span>
					<span class="font-mono text-slate-900">{formatVal(device)}</span>
				</div>
				<div class="flex justify-between">
					<span>Training Program</span>
					<span class="font-mono text-slate-900">{formatVal(training)}</span>
				</div>
				<div class="flex justify-between">
					<span>Fitness Membership</span>
					<span class="font-mono text-slate-900">{formatVal(fitness)}</span>
				</div>
			</div>
		</div>

		<!-- Total Monthly Value Footer -->
		<div class="flex justify-between items-baseline pt-3.5 mt-2 border-t border-slate-100 font-bold text-slate-900">
			<span class="text-xs">Total Monthly Value</span>
			<span class="text-sm font-mono text-slate-900">{formatVal(totalValue)}</span>
		</div>
	</div>
</div>
