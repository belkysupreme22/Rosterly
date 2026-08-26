<script lang="ts">
	interface Props {
		label: string;
		numerator: number | string;
		denominator?: number | string;
		unit?: string;
		isHighlighted?: boolean;
		progress?: number;
	}

	let {
		label,
		numerator,
		denominator = '20',
		unit = 'Days',
		isHighlighted = false,
		progress = 70
	}: Props = $props();

	// Larger SVG circle geometry matching the reference closeup
	const size = 96;
	const strokeWidth = 7;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	const num = $derived(typeof numerator === 'number' ? numerator : parseFloat(numerator) || 0);
	const den = $derived(typeof denominator === 'number' ? denominator : parseFloat(denominator) || 1);
	const calculatedProgress = $derived(Math.min(100, Math.max(0, (num / den) * 100)));
	const strokeDashoffset = $derived(circumference - (calculatedProgress / 100) * circumference);
</script>

<div
	class="flex flex-col items-center justify-between rounded-2xl p-5 text-center transition-all h-full
		   {isHighlighted
			 ? 'bg-[#E8F8EE] border border-emerald-200/70 shadow-xs'
			 : 'bg-white border border-slate-200/80 shadow-xs'}"
>
	<span
		class="text-xs font-semibold tracking-tight mb-2
			   {isHighlighted ? 'text-emerald-950' : 'text-slate-800'}"
	>
		{label}
	</span>

	<div class="relative flex items-center justify-center h-24 w-24 my-1">
		<svg width={size} height={size} class="-rotate-90 transform">
			<!-- Background Track -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				class={isHighlighted ? 'text-emerald-200/60' : 'text-slate-100'}
				stroke-width={strokeWidth}
				stroke="currentColor"
				fill="transparent"
			/>
			<!-- Active Progress Ring with Smooth Dash Transition -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				class="text-[#00C48C] transition-all duration-700 ease-out"
				stroke-width={strokeWidth}
				stroke-dasharray={circumference}
				stroke-dashoffset={strokeDashoffset}
				stroke-linecap="round"
				stroke="currentColor"
				fill="transparent"
			/>
		</svg>

		<!-- Center Fractional Number & Unit -->
		<div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
			<div class="flex items-baseline font-mono font-bold leading-none text-slate-900">
				<span class="text-lg">{numerator}</span>
				{#if denominator}
					<span class="text-xs text-slate-400 font-normal">/{denominator}</span>
				{/if}
			</div>
			{#if unit}
				<span class="text-[10px] text-slate-400 font-medium mt-1">{unit}</span>
			{/if}
		</div>
	</div>
</div>
