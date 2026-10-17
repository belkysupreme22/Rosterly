<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import SlideOver from '$lib/components/SlideOver.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		Plus,
		MagnifyingGlass,
		ArrowRight,
		CaretDown,
		DotsThree,
		Star,
		ArrowUpRight,
		Users,
		Sparkle
	} from 'phosphor-svelte';

	interface Props {
		data: {
			userRole: string;
			employees: Array<{
				id: string;
				fullName: string;
				role: string;
				baseSalary: string;
				bankAccount: string | null;
				company: { name: string };
				department: { name: string; code: string } | null;
			}>;
			departments: Array<{ id: string; name: string; code: string }>;
			companies: Array<{ id: string; name: string }>;
		};
	}

	let { data }: Props = $props();

	const canAdd = $derived(data.userRole === 'hr_admin' || data.userRole === 'owner');

	let searchQuery = $state('');
	let activeFilter = $state('all');
	const filters = ['all', 'employee', 'manager', 'finance', 'hr_admin'];

	let showAddForm = $state(false);
	let isSubmitting = $state(false);
	let formError = $state('');

	// Form fields
	let fullName = $state('');
	let role = $state('employee');
	let departmentId = $state('');
	let employmentType = $state('full_time');
	let positionLevel = $state('mid');
	let baseSalary = $state('');
	let bankAccount = $state('');
	let companyId = $state('');

	$effect(() => {
		if (!companyId && data.companies?.[0]?.id) {
			companyId = data.companies[0].id;
		}
	});

	const roleOptions = [
		{ value: 'employee', label: 'Employee' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'finance', label: 'Finance Officer' },
		{ value: 'hr_admin', label: 'HR Admin' },
		{ value: 'owner', label: 'Owner' }
	];

	const filteredEmployees = $derived(
		data.employees.filter((emp) => {
			const matchesFilter = activeFilter === 'all' || emp.role === activeFilter;
			const matchesSearch =
				emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				emp.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesFilter && matchesSearch;
		})
	);

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function maskAccount(account: string | null): string {
		if (!account) return '—';
		if (account.length <= 4) return account;
		return '•'.repeat(account.length - 4) + account.slice(-4);
	}

	function formatSalary(salary: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'ETB',
			minimumFractionDigits: 2
		}).format(Number(salary));
	}

	// Performance scores mock per employee
	function getPerformanceScore(name: string): number {
		let hash = 0;
		for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
		return 75 + Math.abs(hash % 23); // 75% to 98%
	}

	// Top performers list matching reference
	const topPerformers = [
		{ name: 'Sara Tesfaye', role: 'HR Admin', score: '98%', stars: 5 },
		{ name: 'Hana Girma', role: 'UI Designer', score: '95%', stars: 5 },
		{ name: 'Abebe Bikila', role: 'Dev Lead', score: '92%', stars: 4 },
		{ name: 'Dawit Bekele', role: 'Backend Eng', score: '89%', stars: 4 }
	];

	// Team performance bars
	const teamPerfBars = [
		{ day: 'M', hours: 8, isPeak: false },
		{ day: 'T', hours: 7.5, isPeak: false },
		{ day: 'W', hours: 9.5, isPeak: true },
		{ day: 'T', hours: 8, isPeak: false },
		{ day: 'F', hours: 7, isPeak: false },
		{ day: 'S', hours: 0, isPeak: false },
		{ day: 'S', hours: 0, isPeak: false }
	];

	// Performance by Category
	const categories = [
		{ name: 'Engineering', score: 94, color: '#00C48C' },
		{ name: 'Product Design', score: 88, color: '#3B82F6' },
		{ name: 'Operations & HR', score: 82, color: '#F59E0B' },
		{ name: 'Marketing', score: 76, color: '#8B5CF6' }
	];

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		formError = '';

		try {
			const res = await fetch('/api/employees', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fullName,
					role,
					departmentId: departmentId || null,
					employmentType,
					positionLevel,
					baseSalary: Number(baseSalary),
					bankAccount: bankAccount || null,
					companyId
				})
			});

			if (!res.ok) {
				const err = await res.json();
				formError = err.message || 'Failed to create employee';
				return;
			}

			// Reset form and close
			fullName = '';
			role = 'employee';
			departmentId = '';
			employmentType = 'full_time';
			positionLevel = 'mid';
			baseSalary = '';
			bankAccount = '';
			showAddForm = false;
			await invalidateAll();
		} catch {
			formError = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Top Action Bar (Aligned) -->
	{#if canAdd}
		<div class="flex items-center justify-end">
			<Button variant="primary" onclick={() => (showAddForm = true)}>
				<Plus size={16} weight="bold" />
				Add Employee
			</Button>
		</div>
	{/if}

	<!-- Top 3 Analytics Cards (Synchronized Grid Spacing & Heights) -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
		<!-- Card 1: Team Performance Bar Chart -->
		<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
			<div class="flex items-center justify-between mb-3">
				<h4 class="text-xs font-bold text-slate-900">Team Performance</h4>
				<button class="flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/70">
					<span>This Week</span>
					<CaretDown size={11} weight="bold" />
				</button>
			</div>

			<div class="flex items-end justify-between gap-2 h-28 pt-2">
				{#each teamPerfBars as bar}
					{@const heightPct = bar.hours > 0 ? (bar.hours / 10) * 100 : 8}
					<div class="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
						<span class="text-[9px] font-mono text-slate-400">{bar.hours > 0 ? `${bar.hours}h` : '0'}</span>
						<div class="w-full flex items-end justify-center h-16">
							<div
								class="w-full max-w-[20px] rounded-t-lg transition-all
									   {bar.isPeak
										 ? 'bg-[#064E3B]'
										 : bar.hours > 0
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

		<!-- Card 2: Performance by Category -->
		<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
			<div class="flex items-center justify-between mb-3">
				<h4 class="text-xs font-bold text-slate-900">Performance by Category</h4>
				<span class="text-[10px] font-semibold text-slate-400">Target 90%</span>
			</div>

			<div class="space-y-2.5 py-1">
				{#each categories as cat}
					<div>
						<div class="flex justify-between text-xs font-semibold mb-1">
							<span class="text-slate-700">{cat.name}</span>
							<span class="font-mono text-slate-900">{cat.score}%</span>
						</div>
						<div class="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
							<div
								class="h-full rounded-full transition-all duration-500"
								style="width: {cat.score}%; background-color: {cat.color};"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Card 3: Average Performance Gauge (87%) -->
		<div class="rounded-3xl border border-emerald-200/70 bg-[#E8F8EE] p-6 shadow-xs flex flex-col items-center justify-between text-center">
			<div class="w-full flex items-center justify-between">
				<span class="text-xs font-bold text-emerald-950">Average Performance</span>
				<span class="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
					<ArrowUpRight size={10} weight="bold" />
					+4.2%
				</span>
			</div>

			<!-- Semi-circle / Circular SVG gauge -->
			<div class="relative flex items-center justify-center my-2">
				<svg width="100" height="100" class="-rotate-90 transform">
					<circle
						cx="50"
						cy="50"
						r="40"
						class="text-emerald-200/70"
						stroke-width="8"
						stroke="currentColor"
						fill="transparent"
					/>
					<circle
						cx="50"
						cy="50"
						r="40"
						class="text-[#00C48C]"
						stroke-width="8"
						stroke-dasharray={2 * Math.PI * 40}
						stroke-dashoffset={2 * Math.PI * 40 * (1 - 0.87)}
						stroke-linecap="round"
						stroke="currentColor"
						fill="transparent"
					/>
				</svg>
				<div class="absolute inset-0 flex flex-col items-center justify-center font-mono">
					<span class="text-2xl font-bold text-slate-900">87%</span>
					<span class="text-[9px] text-slate-500 font-medium">Efficiency</span>
				</div>
			</div>

			<p class="text-[11px] text-emerald-800 font-medium">
				High overall staff output across all departments
			</p>
		</div>
	</div>

	<!-- Split Main Section: Directory Table (8 cols) + Top Performers (4 cols) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left: Employee Directory Table (8 cols) -->
		<div class="lg:col-span-8 rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
			<!-- Header & Controls -->
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-100 gap-4">
				<div>
					<h3 class="text-base font-bold text-slate-900">Employee List</h3>
					<p class="text-xs text-slate-400 mt-0.5">{filteredEmployees.length} active staff</p>
				</div>

				<div class="flex items-center gap-3 flex-wrap">
					<!-- Search bar -->
					<div class="relative">
						<MagnifyingGlass size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							placeholder="Search employee..."
							bind:value={searchQuery}
							class="w-44 sm:w-52 rounded-full border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
								{filter.replace('_', ' ')}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Table -->
			<div class="overflow-x-auto">
				<table class="w-full text-xs">
					<thead>
						<tr class="border-b border-slate-100 bg-slate-50/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
							<th class="px-6 py-3.5 text-left">Employee Name</th>
							<th class="px-6 py-3.5 text-left">Department</th>
							<th class="px-6 py-3.5 text-left">Role</th>
							<th class="px-6 py-3.5 text-left">Performance</th>
							<th class="px-6 py-3.5 text-right">Base Salary</th>
							<th class="px-6 py-3.5 text-right">Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each filteredEmployees as emp (emp.id)}
							{@const score = getPerformanceScore(emp.fullName)}
							<tr
								class="hover:bg-slate-50/60 transition-colors cursor-pointer"
								onclick={() => goto(`/employees/${emp.id}`)}
							>
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs">
											{getInitials(emp.fullName)}
										</div>
										<div>
											<p class="font-bold text-slate-900">{emp.fullName}</p>
											<p class="text-[10px] text-slate-400">{emp.company?.name || 'Rosterly Technologies'}</p>
										</div>
									</div>
								</td>

								<td class="px-6 py-4">
									<span class="rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-700">
										{emp.department?.code || 'GEN'}
									</span>
								</td>

								<td class="px-6 py-4">
									<StatusBadge status={emp.role} />
								</td>

								<!-- Performance Progress Bar -->
								<td class="px-6 py-4">
									<div class="flex items-center gap-2 max-w-[120px]">
										<div class="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
											<div class="h-full rounded-full bg-[#00C48C]" style="width: {score}%;"></div>
										</div>
										<span class="font-mono font-semibold text-slate-800 text-[11px]">{score}%</span>
									</div>
								</td>

								<td class="px-6 py-4 text-right font-mono font-bold text-slate-900">
									{formatSalary(emp.baseSalary)}
								</td>

								<td class="px-6 py-4 text-right">
									<span class="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700">
										View Profile <ArrowRight size={14} class="ml-1" />
									</span>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="px-6 py-12 text-center text-slate-400">
									No employees matching search.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Right: Top Performers (4 cols) -->
		<div class="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<h3 class="text-xs font-bold text-slate-900">Top Performers</h3>
				<span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
					This Month
				</span>
			</div>

			<div class="space-y-3.5">
				{#each topPerformers as perf}
					<div class="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs">
								{getInitials(perf.name)}
							</div>
							<div>
								<p class="text-xs font-bold text-slate-900">{perf.name}</p>
								<p class="text-[10px] text-slate-400">{perf.role}</p>
							</div>
						</div>

						<div class="text-right">
							<span class="text-xs font-mono font-bold text-[#00C48C]">{perf.score}</span>
							<div class="flex items-center gap-0.5 justify-end mt-0.5">
								{#each Array(perf.stars) as _}
									<Star size={10} weight="fill" class="text-amber-400" />
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Promo mini note -->
			<div class="rounded-2xl bg-[#E8F8EE] p-4 text-center border border-emerald-200/60 mt-4">
				<p class="text-xs font-semibold text-emerald-950">Quarterly Bonus Target</p>
				<p class="text-[11px] text-emerald-800/80 mt-0.5">Top 3 staff members receive +15% performance bonus in next cycle.</p>
			</div>
		</div>
	</div>
</div>

<!-- Add Employee SlideOver -->
<SlideOver
	bind:open={showAddForm}
	title="Add New Employee"
	subtitle="Create team member profile, role clearance, and statutory payroll details"
>
	<form onsubmit={handleSubmit} class="space-y-5">
		{#if formError}
			<div class="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
				<span>⚠️</span>
				<span>{formError}</span>
			</div>
		{/if}

		<!-- Group 1: Personal & Role Identity -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-3.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Role &amp; Identity</span>

			<Input
				label="Full Legal Name"
				name="fullName"
				bind:value={fullName}
				required
				placeholder="e.g. Dawit Bekele"
			/>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<Select label="System Role" name="role" bind:value={role} options={roleOptions} required />
				<Select
					label="Employment Type"
					name="employmentType"
					bind:value={employmentType}
					options={[
						{ value: 'full_time', label: 'Full-Time' },
						{ value: 'contractual', label: 'Contractual' },
						{ value: 'part_time', label: 'Part-Time' }
					]}
					required
				/>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<Select
					label="Position Level"
					name="positionLevel"
					bind:value={positionLevel}
					options={[
						{ value: 'junior', label: 'L1 — Junior Associate' },
						{ value: 'mid', label: 'L2 — Mid-Level Specialist' },
						{ value: 'senior', label: 'L3 — Senior Lead' },
						{ value: 'lead', label: 'L4 — Staff / Principal' },
						{ value: 'principal', label: 'L5 — Executive / Partner' }
					]}
					required
				/>

				{#if data.departments && data.departments.length > 0}
					<Select
						label="Department Unit"
						name="departmentId"
						bind:value={departmentId}
						options={data.departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
						placeholder="Select Department..."
					/>
				{/if}
			</div>
		</div>

		<!-- Group 2: Compensation & Wire Details -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-3.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2. Compensation &amp; Bank Account</span>

			<Input
				label="Monthly Base Salary"
				name="baseSalary"
				type="number"
				prefixText="ETB"
				bind:value={baseSalary}
				required
				placeholder="30000.00"
			/>

			<Input
				label="CBE Bank Account Number"
				name="bankAccount"
				bind:value={bankAccount}
				placeholder="1000 •••• •••• ••••"
				hint="Commercial Bank of Ethiopia"
			/>
		</div>

		{#if data.companies && data.companies.length > 1}
			<Select
				label="Assign Entity / Company"
				name="companyId"
				bind:value={companyId}
				options={data.companies.map((c) => ({ value: c.id, label: c.name }))}
				required
			/>
		{/if}

		<div class="flex gap-3 pt-4 border-t border-slate-100">
			<Button type="submit" variant="primary" class="flex-1" disabled={isSubmitting}>
				{isSubmitting ? 'Creating Profile...' : 'Create Employee'}
			</Button>
			<Button type="button" variant="secondary" onclick={() => (showAddForm = false)}>
				Cancel
			</Button>
		</div>
	</form>
</SlideOver>
