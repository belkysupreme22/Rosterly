<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import SlideOver from '$lib/components/SlideOver.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import CalendarWidget from '$lib/components/CalendarWidget.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import {
		Plus,
		Check,
		X,
		MagnifyingGlass,
		FunnelSimple,
		CaretDown,
		DotsThree,
		CalendarCheck,
		Clock,
		CheckCircle,
		XCircle,
		ArrowUpRight
	} from 'phosphor-svelte';

	interface Props {
		data: {
			user: { role: string };
			requests: Array<{
				id: string;
				startDate: string;
				endDate: string;
				status: string;
				createdAt: string;
				employee: { id: string; fullName: string; role: string };
			}>;
			employees: Array<{ id: string; fullName: string }>;
		};
	}

	let { data }: Props = $props();

	const canApprove = $derived(
		data.user.role === 'manager' || data.user.role === 'hr_admin' || data.user.role === 'owner'
	);

	// Filters & Search state
	let searchQuery = $state('');
	let activeFilter = $state('all');
	const filters = ['all', 'pending', 'approved', 'denied'];

	const filteredRequests = $derived(
		data.requests.filter((r) => {
			const matchesFilter = activeFilter === 'all' || r.status === activeFilter;
			const matchesSearch =
				!searchQuery ||
				r.employee.fullName.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesFilter && matchesSearch;
		})
	);

	// Form state
	let showRequestForm = $state(false);
	let isSubmitting = $state(false);
	let formError = $state('');
	let employeeId = $state('');
	let selectedType = $state('Annual Leave');
	let startDate = $state('');
	let endDate = $state('');
	let leaveReason = $state('');

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getDurationDays(start: string, end: string): number {
		const s = new Date(start).getTime();
		const e = new Date(end).getTime();
		const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
		return diff;
	}

	// Mock employees currently on leave matching reference
	const activeOnLeaveEmployees = [
		{ name: 'Liam Ronald', role: 'UI Designer', dates: '12 Jun - 16 Jun', type: 'Annual Leave' },
		{ name: 'Jordi Farr', role: 'Fullstack Dev', dates: '14 Jun - 18 Jun', type: 'Sick Leave' },
		{ name: 'Reid Podgers', role: 'Product Lead', dates: '15 Jun - 22 Jun', type: 'Casual Leave' }
	];

	// Leave type distribution matching reference
	const leaveTypeBreakdown = [
		{ label: 'Annual Leave', value: 8, color: '#00C48C' },
		{ label: 'Sick Leave', value: 4, color: '#064E3B' },
		{ label: 'Casual Leave', value: 3, color: '#A7F3D0' },
		{ label: 'Maternity', value: 2, color: '#67E8F9' }
	];

	// Bar chart data for Leave Overview
	const leaveOverviewBars = [
		{ day: 'M', count: 2 },
		{ day: 'T', count: 3 },
		{ day: 'W', count: 5, isPeak: true },
		{ day: 'T', count: 4 },
		{ day: 'F', count: 2 },
		{ day: 'S', count: 0 },
		{ day: 'S', count: 0 }
	];

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		formError = '';

		try {
			const res = await fetch('/api/leave', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ employeeId, startDate, endDate })
			});

			if (!res.ok) {
				const err = await res.json();
				formError = err.message || 'Failed to submit request';
				return;
			}

			employeeId = '';
			startDate = '';
			endDate = '';
			showRequestForm = false;
			await invalidateAll();
		} catch {
			formError = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleAction(requestId: string, status: 'approved' | 'denied') {
		try {
			const res = await fetch(`/api/leave/${requestId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			});

			if (res.ok) {
				await invalidateAll();
			}
		} catch {
			// Silently fail
		}
	}
</script>

<div class="space-y-6">
	<!-- Top Action Bar -->
	<div class="flex items-center justify-end">
		<Button variant="primary" onclick={() => (showRequestForm = true)}>
			<Plus size={16} weight="bold" />
			Request Leave
		</Button>
	</div>

	<!-- Top 4 Mini Cards (TeamHub Reference) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
		<!-- Card 1: Available Leave (Highlighted Pastel Green) -->
		<div class="rounded-2xl border border-emerald-200/70 bg-[#E8F8EE] p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-emerald-950">Available Leave</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">6</p>
				<span class="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
					<ArrowUpRight size={12} weight="bold" />
					+2 days accrued this month
				</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00C48C] shadow-xs">
				<CalendarCheck size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 2: Leave Taken -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Leave Taken</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">3</p>
				<span class="text-[11px] text-slate-400 font-medium block mt-1">Annual & Casual</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
				<CheckCircle size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 3: Leave Pending -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Leave Pending</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">2</p>
				<span class="text-[11px] text-amber-600 font-medium block mt-1">Awaiting approval</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
				<Clock size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 4: Leave Rejected -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Leave Rejected</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">1</p>
				<span class="text-[11px] text-rose-500 font-medium block mt-1">This quarter</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
				<XCircle size={24} weight="fill" />
			</div>
		</div>
	</div>

	<!-- Middle 4-Card Analytics Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
		<!-- Card 1: Leave Overview Bar Chart -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
			<div class="flex items-center justify-between mb-2">
				<h4 class="text-xs font-bold text-slate-900">Leave Overview</h4>
				<button class="flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/70">
					<span>This Week</span>
					<CaretDown size={11} weight="bold" />
				</button>
			</div>

			<div class="flex items-end justify-between gap-2 h-28 pt-2">
				{#each leaveOverviewBars as bar}
					{@const heightPct = bar.count > 0 ? (bar.count / 5) * 100 : 8}
					<div class="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
						<span class="text-[9px] font-mono text-slate-400">{bar.count}</span>
						<div class="w-full flex items-end justify-center h-16">
							<div
								class="w-full max-w-[20px] rounded-t-lg transition-all
									   {bar.isPeak
										 ? 'bg-[#064E3B]'
										 : bar.count > 0
											? 'bg-[#00C48C]'
											: 'bg-[#E8F8EE]'}"
								style="height: {heightPct}%;"
							></div>
						</div>
						<span class="text-[10px] font-semibold text-slate-400">{bar.day}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Card 2: Mini Leave Calendar Widget -->
		<CalendarWidget monthLabel="June 2035" />

		<!-- Card 3: Employees on Leave -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
			<div class="flex items-center justify-between mb-3">
				<h4 class="text-xs font-bold text-slate-900">Employees on Leave</h4>
				<button class="text-slate-400 hover:text-slate-700 p-1">
					<DotsThree size={18} weight="bold" />
				</button>
			</div>

			<div class="space-y-3">
				{#each activeOnLeaveEmployees as emp}
					<div class="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors">
						<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
							{getInitials(emp.name)}
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-semibold text-slate-800">{emp.name}</p>
							<p class="text-[10px] text-slate-400 font-medium">{emp.dates} &bull; {emp.type}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Card 4: Leave Types Donut Chart -->
		<DonutChart
			title="Leave Types"
			data={leaveTypeBreakdown}
			centerLabel="Total Leaves"
			centerValue="6"
		/>
	</div>

	<!-- Bottom Section: Leave Activity Table -->
	<div class="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
		<!-- Table Header / Search & Filter Controls -->
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-100 gap-4">
			<div>
				<h3 class="text-base font-bold text-slate-900">Leave Activity</h3>
				<p class="text-xs text-slate-400 mt-0.5">{filteredRequests.length} requests listed</p>
			</div>

			<div class="flex items-center gap-3 flex-wrap">
				<!-- Search bar -->
				<div class="relative">
					<MagnifyingGlass size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						placeholder="Search employee..."
						bind:value={searchQuery}
						class="w-48 sm:w-60 rounded-full border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>

				<!-- Filter tabs -->
				<div class="flex gap-1 rounded-xl bg-slate-100 p-1">
					{#each filters as filter}
						<button
							class="rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors
								   {activeFilter === filter
									 ? 'bg-white text-slate-900 shadow-xs'
									 : 'text-slate-500 hover:text-slate-800'}"
							onclick={() => (activeFilter = filter)}
						>
							{filter}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-xs text-left">
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400">
						<th class="px-5 py-3">Employee</th>
						<th class="px-5 py-3">Leave Type</th>
						<th class="px-5 py-3">Start Date</th>
						<th class="px-5 py-3">End Date</th>
						<th class="px-5 py-3">Duration</th>
						<th class="px-5 py-3">Status</th>
						{#if canApprove}
							<th class="px-5 py-3 text-right">Actions</th>
						{/if}
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredRequests as req}
						<tr class="hover:bg-slate-50/80 transition-colors">
							<!-- Employee Avatar + Stacked Name & Role -->
							<td class="px-5 py-3.5">
								<div class="flex items-center gap-3">
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
										{getInitials(req.employee.fullName)}
									</div>
									<div>
										<p class="font-semibold text-slate-900">{req.employee.fullName}</p>
										<p class="text-[10px] text-slate-400 capitalize">{req.employee.role.replace('_', ' ')}</p>
									</div>
								</div>
							</td>

							<!-- Leave Type Badge -->
							<td class="px-5 py-3.5">
								<span class="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
									Annual Leave
								</span>
							</td>

							<!-- Dates -->
							<td class="px-5 py-3.5 text-slate-600 font-mono">{formatDate(req.startDate)}</td>
							<td class="px-5 py-3.5 text-slate-600 font-mono">{formatDate(req.endDate)}</td>

							<!-- Duration -->
							<td class="px-5 py-3.5">
								<span class="font-semibold text-slate-800 font-mono">
									{getDurationDays(req.startDate, req.endDate)} Days
								</span>
							</td>

							<!-- Status Badge -->
							<td class="px-5 py-3.5">
								<StatusBadge status={req.status} />
							</td>

							<!-- Actions -->
							{#if canApprove}
								<td class="px-5 py-3.5 text-right">
									{#if req.status === 'pending'}
										<div class="flex items-center justify-end gap-1.5">
											<button
												class="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
												onclick={() => handleAction(req.id, 'approved')}
											>
												<Check size={14} weight="bold" />
												Approve
											</button>
											<button
												class="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
												onclick={() => handleAction(req.id, 'denied')}
											>
												<X size={14} weight="bold" />
												Deny
											</button>
										</div>
									{:else}
										<span class="text-xs text-slate-400">&mdash;</span>
									{/if}
								</td>
							{/if}
						</tr>
					{:else}
						<tr>
							<td colspan={canApprove ? 7 : 6} class="px-5 py-12 text-center text-slate-400">
								No leave requests matching filter.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Request Leave SlideOver -->
<SlideOver bind:open={showRequestForm} title="Submit Leave Request" subtitle="Fill in dates and reason for manager approval">
	<form onsubmit={handleSubmit} class="space-y-5">
		{#if formError}
			<div class="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
				<span>⚠️</span>
				<span>{formError}</span>
			</div>
		{/if}

		<!-- Leave Type Selection Cards -->
		<div class="space-y-2">
			<label class="text-xs font-bold text-slate-700 tracking-tight">Leave Category *</label>
			<div class="grid grid-cols-2 gap-2">
				{#each [
					{ id: 'Annual Leave', label: '🌴 Annual Leave', desc: 'Paid Vacation' },
					{ id: 'Casual Leave', label: '⏱️ Casual Leave', desc: 'Emergency Hours' },
					{ id: 'Sick Leave', label: '🏥 Sick Leave', desc: 'Medical Off' },
					{ id: 'Unpaid Leave', label: '🏖️ Unpaid Leave', desc: 'Personal Time' }
				] as cat}
					<button
						type="button"
						onclick={() => (selectedType = cat.id)}
						class="flex flex-col items-start rounded-2xl border p-3 text-left transition-all cursor-pointer
							   {selectedType === cat.id
								 ? 'border-[#00C48C] bg-[#E8F8EE] ring-2 ring-[#00C48C]/20 shadow-xs'
								 : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300'}"
					>
						<span class="text-xs font-bold text-slate-900">{cat.label}</span>
						<span class="text-[10px] text-slate-400 mt-0.5">{cat.desc}</span>
					</button>
				{/each}
			</div>
		</div>

		{#if data.employees && data.employees.length > 1}
			<Select
				label="Applicant Employee"
				name="employeeId"
				bind:value={employeeId}
				options={data.employees.map((e) => ({ value: e.id, label: e.fullName }))}
				required
			/>
		{/if}

		<!-- Date Range Inputs (2 Columns) -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<Input
				label="Start Date"
				name="startDate"
				type="date"
				bind:value={startDate}
				required
			/>

			<Input
				label="End Date"
				name="endDate"
				type="date"
				bind:value={endDate}
				required
			/>
		</div>

		<!-- Live Duration Calculation Chip -->
		{#if startDate && endDate}
			{@const days = getDurationDays(startDate, endDate)}
			<div class="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-2.5 text-xs text-slate-700 border border-slate-200/60">
				<span class="font-medium">Calculated Leave Duration:</span>
				<span class="font-bold text-[#00C48C] font-mono">{days} Working Day{days > 1 ? 's' : ''}</span>
			</div>
		{/if}

		<!-- Reason / Notes -->
		<div class="flex flex-col gap-1.5">
			<label for="leave-reason" class="text-xs font-bold text-slate-700">Reason / Handover Notes</label>
			<textarea
				id="leave-reason"
				rows={3}
				bind:value={leaveReason}
				placeholder="State reason for absence and team handover details..."
				class="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs text-slate-800 focus:border-[#00C48C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#00C48C]/15 transition-all shadow-2xs"
			></textarea>
		</div>

		<div class="flex gap-3 pt-4 border-t border-slate-100">
			<Button type="submit" variant="primary" class="flex-1" disabled={isSubmitting}>
				{isSubmitting ? 'Submitting...' : 'Submit Request'}
			</Button>
			<Button type="button" variant="secondary" onclick={() => (showRequestForm = false)}>
				Cancel
			</Button>
		</div>
	</form>
</SlideOver>
