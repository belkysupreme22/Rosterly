<script lang="ts">
	import { ArrowUpRight, CaretDown } from 'phosphor-svelte';

	interface Props {
		title?: string;
		metricValue?: string;
		trendText?: string;
		timeframe?: string;
		height?: number;
	}

	let {
		title = 'Performance Overview',
		metricValue = '86.75%',
		trendText = '+2.05% Increased by last year',
		timeframe = 'Last Year',
		height = 220
	}: Props = $props();

	// 12 months data matching the reference stepped curve
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	// Stepped percentage levels across months
	const values = [70, 72, 78, 77, 75, 74, 76, 75, 80.5, 78, 82, 85];

	// SVG Dimensions
	const width = 640;
	const padding = { top: 38, right: 20, bottom: 25, left: 40 };
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = $derived(height - padding.top - padding.bottom);

	function getX(index: number): number {
		return padding.left + (index / (months.length - 1)) * chartWidth;
	}

	function getY(val: number): number {
		return padding.top + chartHeight - (val / 100) * chartHeight;
	}

	// Stepped horizontal line segments
	const pathD = $derived.by(() => {
		const stepWidth = chartWidth / (months.length - 1);
		let d = '';

		for (let i = 0; i < months.length; i++) {
			const x = getX(i);
			const y = getY(values[i]);
			const halfStep = stepWidth / 2;

			const startX = Math.max(padding.left, x - halfStep);
			const endX = Math.min(width - padding.right, x + halfStep);

			if (i === 0) {
				d += `M ${startX} ${y} L ${endX} ${y}`;
			} else {
				d += ` L ${startX} ${y} L ${endX} ${y}`;
			}
		}
		return d;
	});

	const areaD = $derived.by(() => {
		const baseLine = padding.top + chartHeight;
		return `${pathD} L ${width - padding.right} ${baseLine} L ${padding.left} ${baseLine} Z`;
	});

	// September callout (index 8)
	const sepIndex = 8;
	const sepX = $derived(getX(sepIndex));
	const sepY = $derived(getY(values[sepIndex]));
</script>

<div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
	<!-- Header -->
	<div class="flex items-start justify-between mb-2">
		<div>
			<h3 class="text-xs font-bold text-slate-900">{title}</h3>
			<div class="flex items-baseline gap-2.5 mt-1">
				<span class="text-2xl font-bold text-slate-900 font-mono tracking-tight">{metricValue}</span>
				<div class="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
					<ArrowUpRight size={12} weight="bold" />
					<span>{trendText}</span>
				</div>
			</div>
		</div>

		<button class="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/70 transition-colors">
			<span>{timeframe}</span>
			<CaretDown size={12} weight="bold" />
		</button>
	</div>

	<!-- Stepped SVG Chart with Y-Axis and Callout -->
	<div class="relative w-full overflow-hidden mt-3">
		<svg viewBox="0 0 {width} {height}" class="w-full h-auto overflow-visible" preserveAspectRatio="none">
			<defs>
				<linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#00C48C" stop-opacity="0.22" />
					<stop offset="100%" stop-color="#00C48C" stop-opacity="0.0" />
				</linearGradient>
			</defs>

			<!-- Y-Axis Grid Lines & Labels -->
			{#each [100, 75, 50, 25, 0] as pct}
				{@const y = getY(pct)}
				<line
					x1={padding.left}
					y1={y}
					x2={width - padding.right}
					y2={y}
					stroke="#F1F5F9"
					stroke-width="1"
					stroke-dasharray="3 3"
				/>
				<text
					x={padding.left - 8}
					y={y + 3}
					text-anchor="end"
					class="text-[10px] font-medium fill-slate-400 select-none font-mono"
				>
					{pct}%
				</text>
			{/each}

			<!-- Area Fill -->
			<path d={areaD} fill="url(#perfGradient)" />

			<!-- Stepped Line Stroke -->
			<path
				d={pathD}
				fill="none"
				stroke="#00C48C"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>

			<!-- September Vertical Dotted Guideline -->
			<line
				x1={sepX}
				y1={padding.top}
				x2={sepX}
				y2={padding.top + chartHeight}
				stroke="#00C48C"
				stroke-width="1.5"
				stroke-dasharray="2 2"
			/>

			<!-- Active Dot on Line -->
			<circle cx={sepX} cy={sepY} r="4.5" fill="#00C48C" stroke="#FFFFFF" stroke-width="2" />

			<!-- X-Axis Month Labels -->
			{#each months as month, i}
				{@const cx = getX(i)}
				<text
					x={cx}
					y={height - 5}
					text-anchor="middle"
					class="text-[10px] font-medium fill-slate-400 select-none"
				>
					{month}
				</text>
			{/each}
		</svg>

		<!-- September Floating Callout Box -->
		<div
			class="absolute top-0 -translate-x-1/2 flex flex-col items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm pointer-events-none"
			style="left: {(sepX / width) * 100}%"
		>
			<span class="text-[9px] text-slate-400 font-medium leading-none">Sept 2035</span>
			<span class="text-xs font-bold text-slate-900 font-mono mt-0.5">80.5%</span>
		</div>
	</div>
</div>
