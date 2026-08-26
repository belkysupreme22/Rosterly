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
		Coins
	} from 'phosphor-svelte';

	interface Props {
		data: {
			user: { name: string; role: string };
			stats: { totalEmployees: number; pendingLeave: number };
			recentLeaveRequests: Array<{
				id: string;
				startDate: string;
				endDate: string;
				status: string;
				createdAt: string;
				employee: { fullName: string; role: string };
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

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	const todayFormatted = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
</script>

<div class="space-y-6">
	<!-- Top 4 KPI Metric Cards (TeamHub Style) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
		<!-- Card 1: Total Employees (Highlighted Pastel Green) -->
		<div class="rounded-2xl border border-emerald-200/70 bg-[#E8F8EE] p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-emerald-950">Total Headcount</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">{data.stats.totalEmployees}</p>
				<span class="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
					<ArrowUpRight size={12} weight="bold" />
					+2 new this month
				</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00C48C] shadow-xs">
				<Users size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 2: Pending Leave -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Pending Leave</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">{data.stats.pendingLeave}</p>
				<span class="text-[11px] text-amber-600 font-medium block mt-1">Awaiting review</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
				<Clock size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 3: Monthly Payroll Status -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Monthly Payroll</span>
				<p class="text-2xl font-bold text-slate-900 font-mono mt-1">ETB 352k</p>
				<span class="text-[11px] text-slate-400 font-medium block mt-1">Auto calculated</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
				<Coins size={24} weight="fill" />
			</div>
		</div>

		<!-- Card 4: Tax & Compliance -->
		<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Tax Compliance</span>
				<p class="text-2xl font-bold text-slate-900 mt-1">Verified</p>
				<span class="text-[11px] text-emerald-700 font-medium block mt-1">7% Pension + MoR</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
				<ShieldCheck size={24} weight="fill" />
			</div>
		</div>
	</div>

	<!-- Middle Section: Area Curve (7 cols) + Staff Distribution Donut (5 cols) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
		<div class="lg:col-span-7">
			<WaveLineChart
				title="Team Attendance & Shift Compliance"
				metricValue="94.8%"
				trendText="+3.2% vs last month"
				timeframe="This Month"
				height={210}
			/>
		</div>

		<div class="lg:col-span-5">
			<DonutChart
				title="Staff Distribution"
				centerLabel="Total Staff"
				centerValue={data.stats.totalEmployees}
				data={[
					{ label: 'Employees', value: 3, color: '#00C48C' },
					{ label: 'Managers', value: 1, color: '#064E3B' },
					{ label: 'HR Admins', value: 1, color: '#A7F3D0' },
					{ label: 'Owners', value: 1, color: '#67E8F9' }
				]}
			/>
		</div>
	</div>

	<!-- Bottom Section: Recent Leave Requests (7 cols) + Hours & Quick Hub (5 cols) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left: Recent Leave Requests Table -->
		<div class="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
			<div class="border-b border-slate-100 p-5 flex items-center justify-between">
				<div>
					<h3 class="text-base font-bold text-slate-900">Recent Leave Requests</h3>
					<p class="text-xs text-slate-400 mt-0.5">Latest leave submissions from your employees</p>
				</div>
				<a href="/leave" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
					View All <ArrowRight size={14} />
				</a>
			</div>

			<div class="divide-y divide-slate-100">
				{#each data.recentLeaveRequests as req}
					<div class="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors">
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
								{getInitials(req.employee.fullName)}
							</div>
							<div>
								<p class="text-xs font-bold text-slate-900">{req.employee.fullName}</p>
								<p class="text-[10px] text-slate-400 mt-0.5">
									{formatDate(req.startDate)} &mdash; {formatDate(req.endDate)}
								</p>
							</div>
						</div>
						<StatusBadge status={req.status} size="sm" />
					</div>
				{:else}
					<div class="p-8 text-center text-xs text-slate-400">
						No recent leave requests found.
					</div>
				{/each}
			</div>
		</div>

		<!-- Right: Weekly Hours Logged & Quick Hub -->
		<div class="lg:col-span-5 space-y-6">
			<BarChart
				title="Hours Logged (Team Average)"
				metricValue="38.5 hrs"
				timeframe="This Week"
			/>

			<!-- Quick Hub Banner -->
			<div class="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-[#064E3B] to-[#043427] p-6 text-white shadow-xs">
				<div class="flex items-center gap-2 text-emerald-300 font-semibold text-xs uppercase tracking-wider">
					<Sparkle size={16} weight="fill" />
					Payroll & Compliance Hub
				</div>
				<h3 class="text-base font-bold text-white mt-2">Ethiopian Statutory Payroll Ready</h3>
				<p class="text-xs text-emerald-100 mt-1 leading-relaxed">
					Review pending employee leave requests and calculate monthly payroll runs with automatic 7-tier income tax & 7% pension rules.
				</p>

				<div class="mt-5 flex gap-3">
					<a href="/leave" class="flex-1 text-center py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs transition-colors">
						Review Leaves
					</a>
					{#if data.user.role === 'hr_admin' || data.user.role === 'owner'}
						<a href="/payroll" class="flex-1 text-center py-2 px-3 rounded-xl bg-[#00C48C] hover:bg-[#00b07d] text-white text-xs font-bold transition-colors">
							Run Payroll
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
