<script lang="ts">
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Button from '$lib/components/Button.svelte';
	import WaveLineChart from '$lib/components/charts/WaveLineChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import {
		Users,
		Clock,
		CurrencyCircleDollar,
		CalendarCheck,
		ArrowRight,
		CheckCircle,
		Sparkle,
		Plus,
		ArrowUpRight,
		ShieldCheck,
		Coins,
		Confetti,
		Megaphone,
		CalendarBlank,
		Laptop,
		Receipt
	} from 'phosphor-svelte';

	interface Props {
		data: {
			user: { name: string; role: string };
			isEmployeeView: boolean;
			stats?: {
				totalEmployees: number;
				pendingLeave: number;
				attendanceRate: string;
				totalDisbursement: string;
			};
			myStats?: {
				availableLeaveDays: number;
				totalLeaveQuota: number;
				monthlyGross: string;
				workStatus: string;
				positionLevel: string;
			};
			recentLeaveRequests?: Array<{
				id: string;
				startDate: string;
				endDate: string;
				status: string;
				createdAt: string;
				employee: { fullName: string; role: string };
			}>;
			myLeaves?: Array<{
				id: string;
				startDate: string;
				endDate: string;
				type: string;
				status: string;
				createdAt: string;
			}>;
			activeNotices?: Array<{
				id: string;
				title: string;
				category: string;
				priority: string;
				eventDate: string | null;
			}>;
		};
	}

	let { data }: Props = $props();

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatCurrency(amount: string | number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'ETB',
			minimumFractionDigits: 2
		}).format(Number(amount));
	}

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
</script>

<div class="space-y-6">
	<!-- Top 4 KPI Metric Cards (Role-Aware) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
		{#if data.isEmployeeView}
			<!-- Employee View Card 1: Available Leave -->
			<div class="rounded-2xl border border-emerald-200/70 bg-[#E8F8EE] p-5 shadow-xs flex items-center justify-between">
				<div>
					<span class="text-xs font-semibold text-emerald-950">Leave Allowance</span>
					<p class="text-3xl font-bold text-slate-900 font-mono mt-1">
						{data.myStats?.availableLeaveDays}<span class="text-sm font-normal text-slate-500">/{data.myStats?.totalLeaveQuota}d</span>
					</p>
					<span class="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
						<CalendarCheck size={12} weight="bold" />
						Annual Days Remaining
					</span>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00C48C] shadow-xs">
					<CalendarCheck size={24} weight="fill" />
				</div>
			</div>

			<!-- Employee View Card 2: Base Salary -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
				<div>
					<span class="text-xs font-semibold text-slate-500">Monthly Compensation</span>
					<p class="text-2xl font-bold text-slate-900 font-mono mt-1">
						{formatCurrency(data.myStats?.monthlyGross || 38000)}
					</p>
					<span class="text-[11px] text-slate-400 font-medium block mt-1">Gross Salary (ETB)</span>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
					<Coins size={24} weight="fill" />
				</div>
			</div>

			<!-- Employee View Card 3: Work Status & Level -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
				<div>
					<span class="text-xs font-semibold text-slate-500">Work Status &amp; Level</span>
					<p class="text-xl font-bold text-slate-900 mt-1 capitalize">
						Level {data.myStats?.positionLevel}
					</p>
					<span class="text-[11px] text-emerald-600 font-medium block mt-1">
						🟢 {data.myStats?.workStatus.replace('_', ' ')}
					</span>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
					<Sparkle size={24} weight="fill" />
				</div>
			</div>

			<!-- Employee View Card 4: Next Payday -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
				<div>
					<span class="text-xs font-semibold text-slate-500">Target Disbursal</span>
					<p class="text-xl font-bold text-slate-900 mt-1">30th Monthly</p>
					<span class="text-[11px] text-slate-400 font-medium block mt-1">CBE Direct Wire</span>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
					<Receipt size={24} weight="fill" />
				</div>
			</div>
		{:else}
			<!-- Executive/Manager View Card 1: Total Headcount -->
			<div class="rounded-2xl border border-emerald-200/70 bg-[#E8F8EE] p-5 shadow-xs flex items-center justify-between">
				<div>
					<span class="text-xs font-semibold text-emerald-950">Total Headcount</span>
					<p class="text-3xl font-bold text-slate-900 font-mono mt-1">{data.stats?.totalEmployees || 6}</p>
					<span class="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
						<ArrowUpRight size={12} weight="bold" />
						Active Team Members
					</span>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00C48C] shadow-xs">
					<Users size={24} weight="fill" />
				</div>
			</div>

			<!-- Executive View Card 2: Pending Approvals -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
				<div>
					<span class="text-xs font-semibold text-slate-500">Pending Approvals</span>
					<p class="text-3xl font-bold text-slate-900 font-mono mt-1">{data.stats?.pendingLeave || 1}</p>
					<span class="text-[11px] text-amber-600 font-medium block mt-1">Requires review</span>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
					<CalendarCheck size={24} weight="fill" />
				</div>
			</div>

			<!-- Executive View Card 3: Attendance Rate -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
				<div>
					<span class="text-xs font-semibold text-slate-500">Average Attendance</span>
					<p class="text-3xl font-bold text-slate-900 font-mono mt-1">{data.stats?.attendanceRate || '94.8%'}</p>
					<span class="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
						<ArrowUpRight size={12} weight="bold" />
						+1.2% this cycle
					</span>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
					<Clock size={24} weight="fill" />
				</div>
			</div>

			<!-- Executive View Card 4: Total Monthly Disbursement -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
				<div>
					<span class="text-xs font-semibold text-slate-500">Payroll Expenditure</span>
					<p class="text-2xl font-bold text-slate-900 font-mono mt-1">{data.stats?.totalDisbursement || 'ETB 378,300'}</p>
					<span class="text-[11px] text-slate-400 font-medium block mt-1">August 2026 Batch</span>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
					<Coins size={24} weight="fill" />
				</div>
			</div>
		{/if}
	</div>

	<!-- Charts Row: Shift Compliance Spline (8 cols) + Staff Distribution (4 cols) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
		<div class="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h3 class="text-sm font-bold text-slate-900">
						{data.isEmployeeView ? 'My Monthly Shift & Attendance Consistency' : 'Organization Shift Compliance Wave'}
					</h3>
					<p class="text-xs text-slate-400 mt-0.5">30-day tracking compared to 95% statutory target</p>
				</div>
				<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
					94.8% Actual
				</span>
			</div>
			<WaveLineChart />
		</div>

		<div class="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-bold text-slate-900">Staff Distribution</h3>
				<span class="text-xs font-semibold text-slate-400">By Department</span>
			</div>
			<DonutChart />
		</div>
	</div>

	<!-- Bottom Split: Requests Stream (8 cols) + Active Holiday & Broadcast Notices (4 cols) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left: Requests Table -->
		<div class="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
			<div class="flex items-center justify-between p-5 border-b border-slate-100">
				<div>
					<h3 class="text-base font-bold text-slate-900">
						{data.isEmployeeView ? 'My Recent Leave & Shift Bookings' : 'Recent Leave & Shift Requests'}
					</h3>
					<p class="text-xs text-slate-400 mt-0.5">Real-time status updates</p>
				</div>
				<a href="/leave" class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
					View All <ArrowRight size={14} />
				</a>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-xs">
					<thead>
						<tr class="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
							<th class="px-5 py-3 text-left">{data.isEmployeeView ? 'Booking Type' : 'Employee'}</th>
							<th class="px-5 py-3 text-left">Dates</th>
							<th class="px-5 py-3 text-left">Status</th>
							<th class="px-5 py-3 text-right">Submitted</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if data.isEmployeeView}
							{#each data.myLeaves || [] as req}
								<tr class="hover:bg-slate-50/60 transition-colors">
									<td class="px-5 py-3.5 font-bold text-slate-900">{req.type || 'Annual Leave'}</td>
									<td class="px-5 py-3.5 text-slate-600">{formatDate(req.startDate)} &mdash; {formatDate(req.endDate)}</td>
									<td class="px-5 py-3.5"><StatusBadge status={req.status} /></td>
									<td class="px-5 py-3.5 text-right text-slate-400">{formatDate(req.createdAt)}</td>
								</tr>
							{:else}
								<tr><td colspan="4" class="px-5 py-8 text-center text-slate-400">No requests submitted yet.</td></tr>
							{/each}
						{:else}
							{#each data.recentLeaveRequests || [] as req}
								<tr class="hover:bg-slate-50/60 transition-colors">
									<td class="px-5 py-3.5 font-semibold text-slate-900">{req.employee?.fullName}</td>
									<td class="px-5 py-3.5 text-slate-600">{formatDate(req.startDate)} &mdash; {formatDate(req.endDate)}</td>
									<td class="px-5 py-3.5"><StatusBadge status={req.status} /></td>
									<td class="px-5 py-3.5 text-right text-slate-400">{formatDate(req.createdAt)}</td>
								</tr>
							{:else}
								<tr><td colspan="4" class="px-5 py-8 text-center text-slate-400">No requests found.</td></tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Right: Active Notices & Holiday Radar -->
		<div class="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<div class="flex items-center gap-2">
					<Megaphone size={16} class="text-[#00C48C]" weight="bold" />
					<h3 class="text-xs font-bold text-slate-900">Notices &amp; Holiday Radar</h3>
				</div>
				<a href="/notices" class="text-[10px] font-bold text-emerald-600 hover:text-emerald-700">
					View Hub &rarr;
				</a>
			</div>

			<div class="space-y-3">
				{#each data.activeNotices || [] as n}
					<div class="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs space-y-1">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-bold uppercase tracking-wider text-[#00C48C]">{n.category}</span>
							{#if n.priority === 'urgent'}
								<span class="text-[9px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">Urgent</span>
							{/if}
						</div>
						<h4 class="font-bold text-slate-900">{n.title}</h4>
						{#if n.eventDate}
							<p class="text-[11px] text-slate-500 flex items-center gap-1 font-medium mt-1">
								<CalendarBlank size={13} class="text-[#00C48C]" />
								Date: {formatDate(n.eventDate)}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
