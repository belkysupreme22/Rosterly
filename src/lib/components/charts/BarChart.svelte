<script lang="ts">
	import { CaretDown } from 'phosphor-svelte';

	interface BarData {
		day: string;
		timeStr: string;
		hours: number;
		isPeak?: boolean;
	}

	interface Props {
		title?: string;
		metricValue?: string;
		timeframe?: string;
	}

	let {
		title = 'Hours Logged',
		metricValue = '34h 30m',
		timeframe = 'This Week'
	}: Props = $props();

	const bars: BarData[] = [
		{ day: 'M', timeStr: '8:00', hours: 8.0 },
		{ day: 'T', timeStr: '7:30', hours: 7.5 },
		{ day: 'W', timeStr: '4:00', hours: 4.0 },
		{ day: 'T', timeStr: '8:00', hours: 8.0, isPeak: true },
		{ day: 'F', timeStr: '7:00', hours: 7.0 },
		{ day: 'S', timeStr: '0:00', hours: 0 },
		{ day: 'S', timeStr: '0:00', hours: 0 }
	];

	const maxHours = 9.0;
</script>

<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
	<!-- Header -->
	<div class="flex items-center justify-between mb-2">
		<h4 class="text-xs font-bold text-slate-900">{title}</h4>
		<button class="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/70 transition-colors">
			<span>{timeframe}</span>
			<CaretDown size={11} weight="bold" />
		</button>
	</div>

	<p class="text-2xl font-bold text-slate-900 font-mono tracking-tight mb-3">{metricValue}</p>

	<!-- Bars Layout -->
	<div class="flex items-end justify-between gap-2 h-28 pt-2">
		{#each bars as bar}
			{@const heightPct = bar.hours > 0 ? Math.max(15, (bar.hours / maxHours) * 100) : 8}
			<div class="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
				<!-- Time Label above bar -->
				<span class="text-[9px] font-mono text-slate-400 font-medium select-none">
					{bar.timeStr}
				</span>

				<!-- Bar -->
				<div class="w-full flex items-end justify-center h-16">
					<div
						class="w-full max-w-[22px] rounded-t-lg transition-all duration-300
							   {bar.isPeak
								 ? 'bg-[#064E3B] shadow-xs'
								 : bar.hours > 0
									? 'bg-[#00C48C]'
									: 'bg-[#E8F8EE]'}"
						style="height: {heightPct}%;"
					></div>
				</div>

				<!-- Day Label below bar -->
				<span class="text-[10px] font-semibold text-slate-400 select-none">
					{bar.day}
				</span>
			</div>
		{/each}
	</div>
</div>
