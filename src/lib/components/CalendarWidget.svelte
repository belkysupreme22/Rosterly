<script lang="ts">
	import { CaretLeft, CaretRight, CaretDown } from 'phosphor-svelte';

	interface Props {
		monthLabel?: string;
	}

	let { monthLabel = 'June 2035' }: Props = $props();

	// Calendar matrix data matching the reference image exactly
	interface DayCell {
		day: number;
		isCurrentMonth: boolean;
		status?: 'on_leave' | 'present' | 'late' | 'absent';
	}

	const daysMatrix: DayCell[] = [
		// Row 1 (May overflow -> June)
		{ day: 27, isCurrentMonth: false },
		{ day: 28, isCurrentMonth: false },
		{ day: 29, isCurrentMonth: false },
		{ day: 30, isCurrentMonth: false },
		{ day: 31, isCurrentMonth: false },
		{ day: 1, isCurrentMonth: true, status: 'on_leave' },
		{ day: 2, isCurrentMonth: true },

		// Row 2
		{ day: 3, isCurrentMonth: true },
		{ day: 4, isCurrentMonth: true, status: 'present' },
		{ day: 5, isCurrentMonth: true },
		{ day: 6, isCurrentMonth: true },
		{ day: 7, isCurrentMonth: true },
		{ day: 8, isCurrentMonth: true },
		{ day: 9, isCurrentMonth: true },

		// Row 3
		{ day: 10, isCurrentMonth: true },
		{ day: 11, isCurrentMonth: true, status: 'present' },
		{ day: 12, isCurrentMonth: true, status: 'present' },
		{ day: 13, isCurrentMonth: true, status: 'present' },
		{ day: 14, isCurrentMonth: true },
		{ day: 15, isCurrentMonth: true, status: 'absent' },
		{ day: 16, isCurrentMonth: true },

		// Row 4
		{ day: 17, isCurrentMonth: true },
		{ day: 18, isCurrentMonth: true, status: 'present' },
		{ day: 19, isCurrentMonth: true, status: 'present' },
		{ day: 20, isCurrentMonth: true, status: 'late' },
		{ day: 21, isCurrentMonth: true, status: 'late' },
		{ day: 22, isCurrentMonth: true },
		{ day: 23, isCurrentMonth: true },

		// Row 5
		{ day: 24, isCurrentMonth: true },
		{ day: 25, isCurrentMonth: true, status: 'present' },
		{ day: 26, isCurrentMonth: true, status: 'on_leave' },
		{ day: 27, isCurrentMonth: true },
		{ day: 28, isCurrentMonth: true, status: 'absent' },
		{ day: 29, isCurrentMonth: true },
		{ day: 30, isCurrentMonth: true }
	];
</script>

<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col justify-between">
	<!-- Header -->
	<div class="flex items-center justify-between mb-2">
		<button class="flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors">
			<span>{monthLabel}</span>
			<CaretDown size={12} weight="bold" />
		</button>
		<div class="flex items-center gap-1">
			<button class="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100/80 text-slate-500 hover:bg-slate-200 transition-colors">
				<CaretLeft size={12} weight="bold" />
			</button>
			<button class="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100/80 text-slate-500 hover:bg-slate-200 transition-colors">
				<CaretRight size={12} weight="bold" />
			</button>
		</div>
	</div>

	<!-- Days of week -->
	<div class="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
		<span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
	</div>

	<!-- Grid of dates -->
	<div class="grid grid-cols-7 gap-1 text-center text-[11px] font-mono">
		{#each daysMatrix as cell}
			<div
				class="flex h-7 w-full items-center justify-center rounded-lg transition-all
					   {!cell.isCurrentMonth
						 ? 'text-slate-300'
						 : cell.status === 'on_leave'
							? 'bg-[#064E3B] text-white font-bold shadow-xs'
							: cell.status === 'present'
								? 'bg-[#A7F3D0] text-emerald-950 font-bold'
								: cell.status === 'late'
									? 'bg-[#6EE7B7] text-emerald-950 font-bold'
									: cell.status === 'absent'
										? 'bg-[#67E8F9] text-cyan-950 font-bold'
										: 'text-slate-700 hover:bg-slate-50'}"
			>
				{cell.day}
			</div>
		{/each}
	</div>

	<!-- Bottom Summary Legend -->
	<div class="grid grid-cols-4 gap-1 pt-3 mt-2 border-t border-slate-100 text-center">
		<div class="flex flex-col items-center">
			<div class="flex items-center gap-1 text-[9px] font-medium text-slate-400">
				<span class="h-1.5 w-1.5 rounded-full bg-[#A7F3D0]"></span>
				<span>Present</span>
			</div>
			<span class="text-xs font-bold font-mono text-slate-800 mt-0.5">13</span>
		</div>
		<div class="flex flex-col items-center">
			<div class="flex items-center gap-1 text-[9px] font-medium text-slate-400">
				<span class="h-1.5 w-1.5 rounded-full bg-[#6EE7B7]"></span>
				<span>Late</span>
			</div>
			<span class="text-xs font-bold font-mono text-slate-800 mt-0.5">5</span>
		</div>
		<div class="flex flex-col items-center">
			<div class="flex items-center gap-1 text-[9px] font-medium text-slate-400">
				<span class="h-1.5 w-1.5 rounded-full bg-[#064E3B]"></span>
				<span>On Leave</span>
			</div>
			<span class="text-xs font-bold font-mono text-slate-800 mt-0.5">2</span>
		</div>
		<div class="flex flex-col items-center">
			<div class="flex items-center gap-1 text-[9px] font-medium text-slate-400">
				<span class="h-1.5 w-1.5 rounded-full bg-[#67E8F9]"></span>
				<span>Absent</span>
			</div>
			<span class="text-xs font-bold font-mono text-slate-800 mt-0.5">1</span>
		</div>
	</div>
</div>
