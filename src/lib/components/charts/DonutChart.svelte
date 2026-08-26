<script lang="ts">
	import { DotsThree } from 'phosphor-svelte';

	interface Segment {
		label: string;
		value: number;
		color: string;
		unit?: string;
	}

	interface Props {
		title?: string;
		centerLabel?: string;
		centerValue?: string | number;
		segments?: Segment[];
		data?: Segment[]; // alias for segments
		class?: string;
	}

	let {
		title = 'Leave Types',
		centerLabel = 'Total Leaves',
		centerValue = '6',
		segments,
		data,
		class: className = ''
	}: Props = $props();

	const activeSegments = $derived(
		data ||
		segments || [
			{ label: 'Annual Leave', value: 8, color: '#00C48C' },
			{ label: 'Sick Leave', value: 4, color: '#064E3B' },
			{ label: 'Casual Leave', value: 3, color: '#A7F3D0' },
			{ label: 'Maternity Leave', value: 2, color: '#67E8F9' }
		]
	);

	const total = $derived(activeSegments.reduce((sum, s) => sum + s.value, 0) || 1);

	// Donut geometry matching the reference design
	const size = 110;
	const strokeWidth = 12;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	// Calculate stroke offsets for each segment
	const computedSegments = $derived.by(() => {
		let accumulated = 0;
		return activeSegments.map((seg) => {
			const pct = seg.value / total;
			const dashLength = pct * circumference;
			const dashOffset = -accumulated * circumference;
			accumulated += pct;
			return {
				...seg,
				percentage: Math.round(pct * 100),
				dashArray: `${dashLength} ${circumference - dashLength}`,
				dashOffset
			};
		});
	});
</script>

<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between h-full {className}">
	<!-- Header -->
	{#if title}
		<div class="flex items-center justify-between mb-2">
			<h4 class="text-xs font-bold text-slate-900">{title}</h4>
			<button class="text-slate-400 hover:text-slate-700 p-1">
				<DotsThree size={18} weight="bold" />
			</button>
		</div>
	{/if}

	<!-- Top Centered Donut Ring -->
	<div class="flex flex-col items-center justify-center my-2">
		<div class="relative flex items-center justify-center">
			<svg width={size} height={size} class="-rotate-90 transform">
				<!-- Base Track -->
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="transparent"
					stroke="#F1F5F9"
					stroke-width={strokeWidth}
				/>
				<!-- Segments -->
				{#each computedSegments as seg}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="transparent"
						stroke={seg.color}
						stroke-width={strokeWidth}
						stroke-dasharray={seg.dashArray}
						stroke-dashoffset={seg.dashOffset}
						stroke-linecap="round"
						class="transition-all duration-500 ease-out"
					/>
				{/each}
			</svg>

			<!-- Center Metric -->
			<div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
				<span class="text-2xl font-bold font-mono text-slate-900 leading-none">{centerValue}</span>
				{#if centerLabel}
					<span class="text-[9px] font-semibold text-slate-400 mt-0.5">{centerLabel}</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Itemized Legend Rows with Color Dots and Counts -->
	<div class="space-y-2 pt-2 border-t border-slate-100">
		{#each computedSegments as seg}
			<div class="flex items-center justify-between text-xs">
				<div class="flex items-center gap-2">
					<span class="h-2 w-2 rounded-full shrink-0" style="background-color: {seg.color}"></span>
					<span class="text-slate-600 font-medium truncate">{seg.label}</span>
				</div>
				<span class="font-mono font-bold text-slate-900 ml-2">{seg.value}</span>
			</div>
		{/each}
	</div>
</div>
