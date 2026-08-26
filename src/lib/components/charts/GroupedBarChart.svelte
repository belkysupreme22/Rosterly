<script lang="ts">
	import { CaretDown, ArrowUpRight } from 'phosphor-svelte';

	interface Props {
		title?: string;
		metricValue?: string;
		trendText?: string;
		timeframe?: string;
		height?: number;
		class?: string;
	}

	let {
		title = 'Monthly Payroll Expenditure (Gross vs Net)',
		metricValue = 'ETB 352,000',
		trendText = '+4.2% vs last quarter',
		timeframe = 'Year 2026',
		height = 200,
		class: className = ''
	}: Props = $props();

	// Monthly paired data (Gross vs Net in thousands ETB)
	const monthlyData = [
		{ month: 'Jan', gross: 280, net: 220 },
		{ month: 'Feb', gross: 290, net: 230 },
		{ month: 'Mar', gross: 310, net: 245 },
		{ month: 'Apr', gross: 305, net: 240 },
		{ month: 'May', gross: 325, net: 260 },
		{ month: 'Jun', gross: 335, net: 270 },
		{ month: 'Jul', gross: 340, net: 275 },
		{ month: 'Aug', gross: 352, net: 285, isCurrent: true }
	];

	const maxVal = 400; // max scale in k ETB
</script>

<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between h-full {className}">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
		<div>
			<div class="flex items-center gap-2">
				<h4 class="text-xs font-bold text-slate-900">{title}</h4>
				{#if trendText}
					<span class="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
						<ArrowUpRight size={10} weight="bold" />
						{trendText}
					</span>
				{/if}
			</div>
			<p class="text-2xl font-bold font-mono text-slate-900 mt-1">{metricValue}</p>
		</div>

		<div class="flex items-center gap-3">
			<!-- Legend -->
			<div class="flex items-center gap-3 text-[11px] font-semibold">
				<div class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-xs bg-[#064E3B]"></span>
					<span class="text-slate-600">Gross Pay</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-xs bg-[#00C48C]"></span>
					<span class="text-slate-600">Net Take-Home</span>
				</div>
			</div>

			<!-- Timeframe filter -->
			<button class="flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/70">
				<span>{timeframe}</span>
				<CaretDown size={11} weight="bold" />
			</button>
		</div>
	</div>

	<!-- Grouped Columns Chart Area -->
	<div class="relative w-full pt-2">
		<!-- Y-Axis Grid Guidelines -->
		<div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
			<div class="border-b border-dashed border-slate-100 w-full flex justify-end">
				<span class="text-[9px] font-mono text-slate-300 -mt-2.5 pr-1">400k</span>
			</div>
			<div class="border-b border-dashed border-slate-100 w-full flex justify-end">
				<span class="text-[9px] font-mono text-slate-300 -mt-2.5 pr-1">300k</span>
			</div>
			<div class="border-b border-dashed border-slate-100 w-full flex justify-end">
				<span class="text-[9px] font-mono text-slate-300 -mt-2.5 pr-1">200k</span>
			</div>
			<div class="border-b border-slate-100 w-full flex justify-end">
				<span class="text-[9px] font-mono text-slate-300 -mt-2.5 pr-1">0k</span>
			</div>
		</div>

		<!-- Bars Container -->
		<div class="flex items-end justify-between gap-2 h-44 z-10 relative pb-6 px-1">
			{#each monthlyData as item}
				{@const grossHeight = (item.gross / maxVal) * 100}
				{@const netHeight = (item.net / maxVal) * 100}
				<div class="flex-1 flex flex-col items-center justify-end h-full group">
					<div class="w-full flex items-end justify-center gap-1 h-36">
						<!-- Gross Bar -->
						<div
							class="w-full max-w-[14px] rounded-t-sm bg-[#064E3B] transition-all duration-300 group-hover:brightness-110"
							style="height: {grossHeight}%;"
							title="{item.month} Gross: ETB {item.gross}k"
						></div>
						<!-- Net Bar -->
						<div
							class="w-full max-w-[14px] rounded-t-sm bg-[#00C48C] transition-all duration-300 group-hover:brightness-110"
							style="height: {netHeight}%;"
							title="{item.month} Net: ETB {item.net}k"
						></div>
					</div>
					<!-- Month Label -->
					<span class="text-[10px] font-semibold text-slate-500 mt-2 block font-mono">
						{item.month}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
