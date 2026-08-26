<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import {
		CaretLeft,
		CaretRight,
		Plus,
		CalendarBlank,
		Clock,
		Users,
		Sparkle,
		CheckCircle,
		CaretDown,
		DotsThree
	} from 'phosphor-svelte';

	interface Props {
		data: {
			approvedLeaves: Array<{
				id: string;
				startDate: string;
				endDate: string;
				status: string;
				employee: { fullName: string };
			}>;
			employees: Array<{ id: string; fullName: string }>;
		};
	}

	let { data }: Props = $props();

	let currentMonth = $state('June 2035');

	// Calendar grid days (June 2035)
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// 5 weeks of June 2035 matrix
	const calendarDays = [
		// Week 1 (May 27 - Jun 2)
		{ day: 27, isPrevMonth: true, events: [] },
		{ day: 28, isPrevMonth: true, events: [] },
		{ day: 29, isPrevMonth: true, events: [] },
		{ day: 30, isPrevMonth: true, events: [] },
		{ day: 31, isPrevMonth: true, events: [] },
		{ day: 1, events: [{ title: 'Q2 Planning', time: '09:00 AM', color: 'bg-emerald-100 text-emerald-800' }] },
		{ day: 2, events: [] },

		// Week 2 (Jun 3 - Jun 9)
		{ day: 3, events: [] },
		{ day: 4, events: [{ title: 'Team Standup', time: '10:00 AM', color: 'bg-slate-100 text-slate-700' }] },
		{ day: 5, events: [{ title: 'UI Review', time: '02:00 PM', color: 'bg-teal-100 text-teal-800' }] },
		{ day: 6, events: [] },
		{ day: 7, events: [{ title: 'Payroll Run Deadline', time: '05:00 PM', color: 'bg-amber-100 text-amber-800' }] },
		{ day: 8, events: [] },
		{ day: 9, events: [] },

		// Week 3 (Jun 10 - Jun 16)
		{ day: 10, events: [] },
		{ day: 11, events: [] },
		{ day: 12, events: [{ title: 'Mia Torres - Leave', time: 'All Day', color: 'bg-[#E8F8EE] text-[#00C48C]' }] },
		{ day: 13, events: [{ title: 'Mia Torres - Leave', time: 'All Day', color: 'bg-[#E8F8EE] text-[#00C48C]' }] },
		{ day: 14, events: [{ title: 'Mia Torres - Leave', time: 'All Day', color: 'bg-[#E8F8EE] text-[#00C48C]' }] },
		{ day: 15, isToday: true, events: [{ title: 'All-Hands Meeting', time: '11:00 AM', color: 'bg-[#064E3B] text-white' }] },
		{ day: 16, events: [] },

		// Week 4 (Jun 17 - Jun 23)
		{ day: 17, events: [] },
		{ day: 18, events: [{ title: 'Product Launch', time: '03:00 PM', color: 'bg-purple-100 text-purple-800' }] },
		{ day: 19, events: [] },
		{ day: 20, events: [{ title: 'Sara - Sick Leave', time: 'All Day', color: 'bg-rose-100 text-rose-800' }] },
		{ day: 21, events: [] },
		{ day: 22, events: [] },
		{ day: 23, events: [] },

		// Week 5 (Jun 24 - Jun 30)
		{ day: 24, events: [] },
		{ day: 25, events: [{ title: 'Monthly Retrospective', time: '04:00 PM', color: 'bg-slate-100 text-slate-700' }] },
		{ day: 26, events: [] },
		{ day: 27, events: [] },
		{ day: 28, events: [{ title: 'Tax Filing Deadline', time: '12:00 PM', color: 'bg-amber-100 text-amber-800' }] },
		{ day: 29, events: [] },
		{ day: 30, events: [] }
	];

	// Today's schedule list matching reference
	const todaysSchedule = [
		{ title: 'All-Hands Company Meeting', time: '11:00 AM - 12:00 PM', location: 'Main Conference & Zoom', type: 'Meeting' },
		{ title: 'Design System Polish', time: '02:00 PM - 03:30 PM', location: 'Design Room 3', type: 'Work Session' },
		{ title: 'Payroll Preview Review', time: '04:30 PM - 05:00 PM', location: 'Finance Hub', type: 'Compliance' }
	];
</script>

<div class="space-y-6">
	<!-- Top Action Bar -->
	<div class="flex items-center justify-end">
		<Button variant="primary" size="sm">
			<Plus size={14} weight="bold" />
			Schedule Event
		</Button>
	</div>

	<!-- Top 4 Mini Stats -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
		<div class="rounded-2xl border border-emerald-200/70 bg-[#E8F8EE] p-4 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-emerald-950">Active Events</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-0.5">8</p>
			</div>
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#00C48C] shadow-xs">
				<CalendarBlank size={20} weight="fill" />
			</div>
		</div>

		<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Upcoming Leaves</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-0.5">3</p>
			</div>
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
				<Clock size={20} weight="fill" />
			</div>
		</div>

		<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Team Meetings</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-0.5">4</p>
			</div>
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
				<Users size={20} weight="fill" />
			</div>
		</div>

		<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Public Holidays</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-0.5">1</p>
			</div>
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
				<Sparkle size={20} weight="fill" />
			</div>
		</div>
	</div>

	<!-- Main Grid: Full Matrix (8 cols) + Agenda Sidebar (4 cols) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left: Month Calendar Matrix (8 cols) -->
		<div class="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
			<!-- Month Header Controls -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-4">
				<div class="flex items-center gap-3">
					<h2 class="text-base font-bold text-slate-900">{currentMonth}</h2>
					<span class="rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#00C48C]">
						Current Month
					</span>
				</div>

				<div class="flex items-center gap-2">
					<button class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
						<CaretLeft size={16} weight="bold" />
					</button>
					<button class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
						<CaretRight size={16} weight="bold" />
					</button>
				</div>
			</div>

			<!-- Days of Week Header -->
			<div class="grid grid-cols-7 gap-px text-center">
				{#each daysOfWeek as day}
					<div class="py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						{day}
					</div>
				{/each}
			</div>

			<!-- 7x5 Days Matrix -->
			<div class="grid grid-cols-7 gap-2">
				{#each calendarDays as d}
					<div
						class="min-h-[88px] rounded-xl border p-2 flex flex-col justify-between transition-colors
							   {d.isToday
								 ? 'border-[#00C48C] bg-[#E8F8EE]/40 ring-1 ring-[#00C48C]/40'
								 : d.isPrevMonth
									? 'border-transparent bg-slate-50/40 text-slate-300'
									: 'border-slate-100 bg-white hover:border-slate-300'}"
					>
						<div class="flex items-center justify-between">
							<span
								class="text-xs font-mono font-bold
									   {d.isToday
										 ? 'flex h-6 w-6 items-center justify-center rounded-full bg-[#00C48C] text-white'
										 : d.isPrevMonth
											? 'text-slate-300'
											: 'text-slate-800'}"
							>
								{d.day}
							</span>
						</div>

						<!-- Events in Day -->
						<div class="space-y-1 mt-1">
							{#each d.events as ev}
								<div class="rounded-md px-1.5 py-0.5 text-[9px] font-semibold truncate {ev.color}">
									{ev.title}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Right: Today's Agenda & Categories (4 cols) -->
		<div class="lg:col-span-4 space-y-6">
			<!-- Today's Schedule Card -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3">
					<h3 class="text-xs font-bold text-slate-900">Today's Schedule</h3>
					<span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
						15 June 2035
					</span>
				</div>

				<div class="space-y-3">
					{#each todaysSchedule as item}
						<div class="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/60 transition-colors">
							<div class="flex items-center justify-between">
								<span class="text-xs font-bold text-slate-900">{item.title}</span>
								<span class="text-[10px] font-semibold text-slate-400">{item.type}</span>
							</div>
							<div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-1">
								<Clock size={12} class="text-emerald-600" />
								<span>{item.time}</span>
							</div>
							<p class="text-[10px] text-slate-400 mt-0.5">{item.location}</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- Categories Card -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
				<h3 class="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Event Categories</h3>
				<div class="space-y-2 text-xs">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="h-2.5 w-2.5 rounded-full bg-[#00C48C]"></span>
							<span class="text-slate-700 font-medium">Approved Leaves</span>
						</div>
						<span class="font-mono text-slate-400">3 events</span>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="h-2.5 w-2.5 rounded-full bg-[#064E3B]"></span>
							<span class="text-slate-700 font-medium">Company Meetings</span>
						</div>
						<span class="font-mono text-slate-400">4 events</span>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
							<span class="text-slate-700 font-medium">Payroll Deadlines</span>
						</div>
						<span class="font-mono text-slate-400">2 events</span>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
							<span class="text-slate-700 font-medium">Sprint Launches</span>
						</div>
						<span class="font-mono text-slate-400">1 event</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
