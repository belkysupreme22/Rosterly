<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import SlideOver from '$lib/components/SlideOver.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		ArrowLeft,
		PencilSimple,
		Buildings,
		Users,
		Crown,
		Coins,
		Briefcase,
		ShieldCheck,
		ArrowRight,
		CalendarCheck,
		ChartPie,
		CheckCircle,
		Trash
	} from 'phosphor-svelte';

	interface Props {
		data: {
			userRole: string;
			canManage: boolean;
			canViewSalaries: boolean;
			department: {
				id: string;
				name: string;
				code: string;
				description: string | null;
				budgetMonthly: string;
				color: string | null;
				createdAt: string;
				company: { name: string; tin: string };
				lead: {
					id: string;
					fullName: string;
					role: string;
					positionLevel: string;
					employmentType: string;
				} | null;
				members: Array<{
					id: string;
					fullName: string;
					role: string;
					employmentType: string;
					positionLevel: string;
					workStatus: string;
					baseSalary: string;
					contractStartDate: string | null;
					leaveRequests: Array<{
						id: string;
						startDate: string;
						endDate: string;
						status: string;
					}>;
				}>;
			};
			allEmployees: Array<{
				id: string;
				fullName: string;
				role: string;
			}>;
			metrics: {
				totalMembers: number;
				totalPayrollSpend: number;
				monthlyBudget: number;
				budgetUtilizationPercent: number;
				remainingBudget: number;
			};
			departmentLeaves: Array<{
				id: string;
				startDate: string;
				endDate: string;
				status: string;
				employeeName: string;
				employeeRole: string;
			}>;
		};
	}

	let { data }: Props = $props();

	let searchQuery = $state('');
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let isDeleting = $state(false);
	let formError = $state('');

	// Edit form state
	let editName = $state('');
	let editCode = $state('');
	let editDesc = $state('');
	let editLeadId = $state('');
	let editBudget = $state('0');
	let editColor = $state('#00C48C');

	const colorPresets = ['#00C48C', '#064E3B', '#10B981', '#67E8F9', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

	$effect(() => {
		if (data.department) {
			editName = data.department.name;
			editCode = data.department.code;
			editDesc = data.department.description || '';
			editLeadId = data.department.lead?.id || '';
			editBudget = data.department.budgetMonthly;
			editColor = data.department.color || '#00C48C';
		}
	});

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function formatCurrency(amount: string | number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'ETB',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(Number(amount));
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	const filteredMembers = $derived(
		data.department.members.filter(
			(m) =>
				m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
				m.positionLevel.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	async function handleUpdateDepartment(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		formError = '';

		try {
			const res = await fetch(`/api/departments/${data.department.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: editName,
					code: editCode,
					description: editDesc,
					leadId: editLeadId || null,
					budgetMonthly: Number(editBudget),
					color: editColor
				})
			});

			if (!res.ok) {
				const err = await res.json();
				formError = err.message || 'Failed to update department';
				return;
			}

			showEditModal = false;
			await invalidateAll();
		} catch {
			formError = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteDepartment() {
		if (!confirm(`Are you sure you want to delete "${data.department.name}"? Staff will remain unassigned.`)) {
			return;
		}

		isDeleting = true;
		try {
			const res = await fetch(`/api/departments/${data.department.id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				goto('/departments');
			}
		} catch {
			alert('Failed to delete department');
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- 1. Back Navigation & Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<a
				href="/departments"
				class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors"
				title="Back to Departments"
			>
				<ArrowLeft size={18} weight="bold" />
			</a>

			<div class="flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold text-base shadow-xs ring-2 ring-emerald-100"
					style="background-color: {data.department.color || '#00C48C'};"
				>
					{data.department.code}
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl font-bold text-slate-900">{data.department.name}</h1>
						<span class="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
							{data.department.code}
						</span>
					</div>
					<p class="text-xs text-slate-400 font-medium">
						{data.department.company.name} &bull; TIN: {data.department.company.tin}
					</p>
				</div>
			</div>
		</div>

		{#if data.canManage}
			<div class="flex items-center gap-2">
				<Button variant="secondary" onclick={() => (showEditModal = true)}>
					<PencilSimple size={16} />
					Edit Department
				</Button>
				{#if data.userRole === 'owner'}
					<button
						onclick={handleDeleteDepartment}
						disabled={isDeleting}
						class="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
						title="Delete Department"
					>
						<Trash size={16} weight="bold" />
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Mission Banner -->
	{#if data.department.description}
		<div class="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs text-slate-600 leading-relaxed shadow-2xs">
			<span class="font-bold text-slate-900">Functional Scope &amp; Mission: </span>
			{data.department.description}
		</div>
	{/if}

	<!-- 2. Top Summary KPI Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
		<!-- KPI 1: Headcount -->
		<div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Department Headcount</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">{data.metrics.totalMembers}</p>
				<span class="text-[11px] text-slate-400 font-medium block mt-1">Assigned staff members</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00C48C]">
				<Users size={24} weight="fill" />
			</div>
		</div>

		<!-- KPI 2: Monthly Compensation Spend -->
		<div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Monthly Compensation</span>
				<p class="text-2xl sm:text-3xl font-bold text-slate-900 font-mono mt-1">
					{formatCurrency(data.metrics.totalPayrollSpend)}
				</p>
				<span class="text-[11px] text-[#00C48C] font-semibold block mt-1">Direct salary run cost</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
				<Coins size={24} weight="fill" />
			</div>
		</div>

		<!-- KPI 3: Budget Utilization -->
		<div class="rounded-3xl border border-emerald-200/70 bg-[#E8F8EE] p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-emerald-950">Budget Pool ({data.metrics.budgetUtilizationPercent}%)</span>
				<p class="text-2xl sm:text-3xl font-bold text-slate-900 font-mono mt-1">
					{formatCurrency(data.metrics.monthlyBudget)}
				</p>
				<span class="text-[11px] text-emerald-800 font-medium block mt-1">
					Buffer: {formatCurrency(data.metrics.remainingBudget)}
				</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00C48C] shadow-xs">
				<ChartPie size={24} weight="fill" />
			</div>
		</div>
	</div>

	<!-- 3. Two-Column Spotlight Section -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<!-- Left: Representative Lead Spotlight Card (5 cols) -->
		<div class="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
			<div>
				<div class="flex items-center justify-between border-b border-slate-100 pb-3">
					<div class="flex items-center gap-2">
						<Crown size={18} class="text-amber-500" weight="fill" />
						<h3 class="text-sm font-bold text-slate-900">Representative Lead</h3>
					</div>
					<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
						Unit Lead
					</span>
				</div>

				{#if data.department.lead}
					<div class="mt-4 flex items-center gap-4">
						<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-[#00C48C] text-white font-bold text-lg shadow-sm ring-4 ring-emerald-50">
							{getInitials(data.department.lead.fullName)}
						</div>
						<div>
							<h4 class="text-base font-bold text-slate-900 leading-tight">
								{data.department.lead.fullName}
							</h4>
							<p class="text-xs text-slate-400 capitalize font-medium mt-0.5">
								{data.department.lead.role.replace('_', ' ')} &bull; {data.department.lead.positionLevel.toUpperCase()}
							</p>
							<div class="mt-2 flex items-center gap-2">
								<StatusBadge status={data.department.lead.role} />
								<span class="text-[10px] text-slate-400 capitalize font-medium">
									{data.department.lead.employmentType.replace('_', ' ')}
								</span>
							</div>
						</div>
					</div>

					<div class="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-200/60 text-xs text-slate-600 space-y-1.5">
						<p class="font-bold text-slate-900">Leadership Responsibilities:</p>
						<p class="text-[11px] leading-relaxed text-slate-500">
							Coordinates operational deliverables, conducts sprint alignment, approves leave requests, and represents {data.department.name} in executive syncs.
						</p>
					</div>
				{:else}
					<div class="py-8 text-center text-slate-400">
						<Crown size={32} class="mx-auto mb-2 opacity-40 text-amber-500" />
						<p class="text-xs font-bold text-slate-700">No Lead Representative Appointed</p>
						<p class="text-[11px] text-slate-400 mt-1">Appoint a team lead using the Edit Department button above.</p>
					</div>
				{/if}
			</div>

			{#if data.department.lead}
				<a
					href="/employees/{data.department.lead.id}"
					class="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:text-[#00C48C] border border-slate-200/80 p-3 text-xs font-bold text-slate-700 transition-colors"
				>
					<span>View Full Profile</span>
					<ArrowRight size={14} weight="bold" />
				</a>
			{/if}
		</div>

		<!-- Right: Budget & Compensation Breakdown (7 cols) -->
		<div class="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
			<div>
				<div class="flex items-center justify-between border-b border-slate-100 pb-3">
					<div class="flex items-center gap-2">
						<Coins size={18} class="text-[#00C48C]" weight="bold" />
						<h3 class="text-sm font-bold text-slate-900">Compensation &amp; Budget Health</h3>
					</div>
					<span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
						Monthly Cycle
					</span>
				</div>

				<!-- Visual Progress Meter -->
				<div class="mt-4 space-y-2">
					<div class="flex items-center justify-between text-xs">
						<span class="font-semibold text-slate-700">Payroll Utilization</span>
						<span class="font-mono font-bold text-slate-900">{data.metrics.budgetUtilizationPercent}%</span>
					</div>
					<div class="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-0.5">
						<div
							class="h-full rounded-full transition-all duration-500 {data.metrics.budgetUtilizationPercent > 90 ? 'bg-rose-500' : 'bg-[#00C48C]'}"
							style="width: {data.metrics.budgetUtilizationPercent}%;"
						></div>
					</div>
				</div>

				<div class="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
					<div class="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
						<span class="text-slate-400 font-medium text-[11px]">Monthly Budget</span>
						<p class="text-sm font-bold font-mono text-slate-900 mt-1">{formatCurrency(data.metrics.monthlyBudget)}</p>
					</div>
					<div class="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
						<span class="text-slate-400 font-medium text-[11px]">Allocated Salaries</span>
						<p class="text-sm font-bold font-mono text-slate-900 mt-1">{formatCurrency(data.metrics.totalPayrollSpend)}</p>
					</div>
					<div class="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60 col-span-2 sm:col-span-1">
						<span class="text-slate-400 font-medium text-[11px]">Remaining Buffer</span>
						<p class="text-sm font-bold font-mono text-emerald-600 mt-1">{formatCurrency(data.metrics.remainingBudget)}</p>
					</div>
				</div>
			</div>

			<div class="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/60 text-xs text-emerald-950 flex items-center gap-2">
				<ShieldCheck size={18} class="text-[#00C48C] shrink-0" weight="bold" />
				<span>Statutory Ethiopian MoR income taxes and 7% pension rules apply across all member salaries.</span>
			</div>
		</div>
	</div>

	<!-- 4. Team Members Directory Table -->
	<div class="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-100 gap-4">
			<div>
				<h3 class="text-base font-bold text-slate-900">Department Roster ({data.department.members.length})</h3>
				<p class="text-xs text-slate-400 mt-0.5">Staff and contractors allocated to {data.department.name}</p>
			</div>

			<div class="relative w-full sm:w-64">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search member..."
					class="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]/20 transition-all shadow-2xs"
				/>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
						<th class="px-6 py-3.5 text-left">Employee Name</th>
						<th class="px-6 py-3.5 text-left">Role</th>
						<th class="px-6 py-3.5 text-left">Level &amp; Type</th>
						<th class="px-6 py-3.5 text-left">Work Status</th>
						{#if data.canViewSalaries}
							<th class="px-6 py-3.5 text-right">Base Salary</th>
						{/if}
						<th class="px-6 py-3.5 text-right">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredMembers as member (member.id)}
						<tr
							class="hover:bg-slate-50/60 transition-colors cursor-pointer"
							onclick={() => goto(`/employees/${member.id}`)}
						>
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs">
										{getInitials(member.fullName)}
									</div>
									<div>
										<div class="flex items-center gap-1.5">
											<p class="font-bold text-slate-900">{member.fullName}</p>
											{#if data.department.lead?.id === member.id}
												<span title="Department Lead">
													<Crown size={12} class="text-amber-500" weight="fill" />
												</span>
											{/if}
										</div>
										<p class="text-[10px] text-slate-400">{formatDate(member.contractStartDate)}</p>
									</div>
								</div>
							</td>

							<td class="px-6 py-4">
								<StatusBadge status={member.role} />
							</td>

							<td class="px-6 py-4">
								<p class="font-bold text-slate-700 capitalize">{member.positionLevel}</p>
								<p class="text-[10px] text-slate-400 capitalize">{member.employmentType.replace('_', ' ')}</p>
							</td>

							<td class="px-6 py-4">
								<span class="rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 capitalize">
									{member.workStatus.replace('_', ' ')}
								</span>
							</td>

							{#if data.canViewSalaries}
								<td class="px-6 py-4 text-right font-mono font-bold text-slate-900">
									{formatCurrency(member.baseSalary)}
								</td>
							{/if}

							<td class="px-6 py-4 text-right">
								<span class="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700">
									View Profile <ArrowRight size={14} class="ml-1" />
								</span>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan={data.canViewSalaries ? 6 : 5} class="px-6 py-12 text-center text-slate-400">
								No employees assigned to this department.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- 5. Recent Out-of-Office & Leave Activity -->
	<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
		<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
			<div class="flex items-center gap-2">
				<CalendarCheck size={18} class="text-[#00C48C]" weight="bold" />
				<h3 class="text-sm font-bold text-slate-900">Out-of-Office &amp; Leave Activity</h3>
			</div>
			<span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
				Team Radar
			</span>
		</div>

		<div class="space-y-2.5 text-xs">
			{#each data.departmentLeaves as req}
				<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
					<div class="flex items-center gap-3">
						<span class="font-bold text-slate-900">{req.employeeName}</span>
						<span class="text-[11px] text-slate-400 font-mono">
							{formatDate(req.startDate)} &mdash; {formatDate(req.endDate)}
						</span>
					</div>
					<StatusBadge status={req.status} />
				</div>
			{:else}
				<p class="text-slate-400 py-3 text-center">No active or pending leaves in this department.</p>
			{/each}
		</div>
	</div>
</div>

<!-- Edit Department SlideOver -->
<SlideOver
	bind:open={showEditModal}
	title="Edit Department"
	subtitle="Update department code, mission scope, representative lead, or budget pool"
>
	<form onsubmit={handleUpdateDepartment} class="space-y-5">
		{#if formError}
			<div class="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
				<span>⚠️</span>
				<span>{formError}</span>
			</div>
		{/if}

		<!-- Group 1: Identity -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-3.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Department Identity</span>

			<Input
				label="Department Name"
				name="editName"
				bind:value={editName}
				required
			/>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<Input
					label="Short Code"
					name="editCode"
					bind:value={editCode}
					required
				/>

				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-slate-700 tracking-tight">Theme Color</label>
					<div class="flex items-center gap-2 pt-1">
						{#each colorPresets as col}
							<button
								type="button"
								onclick={() => (editColor = col)}
								class="h-6 w-6 rounded-full transition-all cursor-pointer ring-offset-2
									   {editColor === col ? 'ring-2 ring-slate-900 scale-110' : 'hover:scale-105'}"
								style="background-color: {col};"
							></button>
						{/each}
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="edit-desc" class="text-xs font-bold text-slate-700">Mission &amp; Functional Scope</label>
				<textarea
					id="edit-desc"
					rows={3}
					bind:value={editDesc}
					class="w-full rounded-2xl border border-slate-200/80 bg-white p-3 text-xs text-slate-800 focus:border-[#00C48C] focus:outline-none focus:ring-4 focus:ring-[#00C48C]/15 transition-all shadow-2xs"
				></textarea>
			</div>
		</div>

		<!-- Group 2: Lead & Budget -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-3.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2. Representative Lead &amp; Budget</span>

			<Select
				label="Department Representative Lead"
				name="editLeadId"
				bind:value={editLeadId}
				options={data.allEmployees.map((e) => ({
					value: e.id,
					label: `${e.fullName} (${e.role.replace('_', ' ')})`
				}))}
				placeholder="Select Representative Lead..."
			/>

			<Input
				label="Monthly Salary Pool Allocation"
				name="editBudget"
				type="number"
				prefixText="ETB"
				bind:value={editBudget}
				required
			/>
		</div>

		<div class="flex gap-3 pt-4 border-t border-slate-100">
			<Button type="submit" variant="primary" class="flex-1" disabled={isSubmitting}>
				{isSubmitting ? 'Saving Changes...' : 'Save Changes'}
			</Button>
			<Button type="button" variant="secondary" onclick={() => (showEditModal = false)}>
				Cancel
			</Button>
		</div>
	</form>
</SlideOver>
