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
		title = 'Team Attendance & Shift Compliance',
		metricValue = '94.8%',
		trendText = '+3.2% vs last month',
		timeframe = 'This Month',
		height = 200,
		class: className = ''
	}: Props = $props();

	// Smooth wave path data points (30-day timeline across 6 sampled weeks/points)
	// Points for "Actual Attendance" wave: (0, 75), (80, 50), (160, 65), (240, 30), (320, 45), (400, 20), (480, 35), (560, 15)
	const actualPoints = 'M 0 85 C 50 65, 70 45, 110 50 C 160 55, 180 80, 230 40 C 280 15, 310 45, 360 25 C 410 10, 440 35, 490 20 C 530 10, 560 25, 600 15';
	const actualArea = `${actualPoints} L 600 130 L 0 130 Z`;

	// Target benchmark line (dashed subtle curve)
	const targetPoints = 'M 0 45 C 100 40, 200 45, 300 35 C 400 28, 500 32, 600 25';

	// Highlight dots
	const markers = [
		{ cx: 110, cy: 50, label: '92%' },
		{ cx: 230, cy: 40, label: '94%' },
		{ cx: 360, cy: 25, label: '96%' },
		{ cx: 490, cy: 20, label: '97%' },
		{ cx: 600, cy: 15, label: '98.5%', active: true }
	];

	const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Today'];
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
			<!-- Dual Legend -->
			<div class="flex items-center gap-3 text-[11px] font-semibold">
				<div class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-[#00C48C]"></span>
					<span class="text-slate-600">Actual Rate</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="h-1.5 w-3 border-b-2 border-dashed border-emerald-300"></span>
					<span class="text-slate-400 font-normal">Target (95%)</span>
				</div>
			</div>

			<!-- Timeframe filter -->
			<button class="flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/70">
				<span>{timeframe}</span>
				<CaretDown size={11} weight="bold" />
			</button>
		</div>
	</div>

	<!-- Wave Chart SVG -->
	<div class="relative w-full pt-2">
		<!-- Y-axis Guidelines -->
		<div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
			<div class="border-b border-dashed border-slate-100 w-full flex justify-end">
				<span class="text-[9px] font-mono text-slate-300 -mt-2.5 pr-1">100%</span>
			</div>
			<div class="border-b border-dashed border-slate-100 w-full flex justify-end">
				<span class="text-[9px] font-mono text-slate-300 -mt-2.5 pr-1">90%</span>
			</div>
			<div class="border-b border-dashed border-slate-100 w-full flex justify-end">
				<span class="text-[9px] font-mono text-slate-300 -mt-2.5 pr-1">80%</span>
			</div>
			<div class="border-b border-slate-100 w-full flex justify-end">
				<span class="text-[9px] font-mono text-slate-300 -mt-2.5 pr-1">70%</span>
			</div>
		</div>

		<svg viewBox="0 0 600 130" class="w-full h-36 overflow-visible">
			<defs>
				<linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#00C48C" stop-opacity="0.35" />
					<stop offset="70%" stop-color="#00C48C" stop-opacity="0.06" />
					<stop offset="100%" stop-color="#00C48C" stop-opacity="0" />
				</linearGradient>
			</defs>

			<!-- Gradient Area Fill -->
			<path d={actualArea} fill="url(#waveGradient)" />

			<!-- Target Benchmark Line -->
			<path d={targetPoints} fill="none" stroke="#A7F3D0" stroke-width="2" stroke-dasharray="4 4" />

			<!-- Actual Rate Wave Line -->
			<path d={actualPoints} fill="none" stroke="#00C48C" stroke-width="3" stroke-linecap="round" />

			<!-- Interactive Wave Markers -->
			{#each markers as m}
				<circle
					cx={m.cx}
					cy={m.cy}
					r={m.active ? '6' : '4'}
					class="{m.active ? 'fill-[#00C48C] stroke-white stroke-2 shadow-sm' : 'fill-white stroke-[#00C48C] stroke-2'}"
				/>
				{#if m.active}
					<!-- Active Marker Tooltip Callout -->
					<g transform="translate({m.cx - 22}, {m.cy - 30})">
						<rect width="44" height="20" rx="6" fill="#064E3B" />
						<text x="22" y="14" fill="#ffffff" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">
							{m.label}
						</text>
					</g>
				{/if}
			{/each}
		</svg>

		<!-- Bottom X-Axis Labels -->
		<div class="flex justify-between items-center text-[10px] font-semibold text-slate-400 font-mono pt-2 border-t border-slate-100">
			{#each labels as l}
				<span>{l}</span>
			{/each}
		</div>
	</div>
</div>
