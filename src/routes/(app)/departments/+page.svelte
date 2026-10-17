<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import SlideOver from '$lib/components/SlideOver.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import {
		Buildings,
		Plus,
		Users,
		UserCircle,
		Crown,
		Money,
		Briefcase,
		ShieldCheck,
		Sparkle,
		ArrowRight,
		Palette
	} from 'phosphor-svelte';

	interface Props {
		data: {
			userRole: string;
			canManage: boolean;
			departments: Array<{
				id: string;
				name: string;
				code: string;
				description: string | null;
				budgetMonthly: string;
				color: string | null;
				createdAt: string;
				lead: {
					id: string;
					fullName: string;
					role: string;
					positionLevel: string;
				} | null;
				members: Array<{
					id: string;
					fullName: string;
					role: string;
				}>;
			}>;
			employees: Array<{
				id: string;
				fullName: string;
				role: string;
			}>;
			companies: Array<{ id: string; name: string }>;
		};
	}

	let { data }: Props = $props();

	let searchQuery = $state('');
	let showCreateModal = $state(false);
	let isSubmitting = $state(false);
	let formError = $state('');

	// Form fields
	let deptName = $state('');
	let deptCode = $state('');
	let deptDesc = $state('');
	let leadId = $state('');
	let budgetMonthly = $state('150000');
	let deptColor = $state('#00C48C');

	const colorPresets = ['#00C48C', '#064E3B', '#10B981', '#67E8F9', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

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

	const filteredDepartments = $derived(
		data.departments.filter(
			(d) =>
				d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(d.lead && d.lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	const totalHeadcount = $derived(
		data.departments.reduce((acc, d) => acc + d.members.length, 0)
	);

	const totalBudget = $derived(
		data.departments.reduce((acc, d) => acc + Number(d.budgetMonthly || 0), 0)
	);

	async function handleCreateDepartment(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		formError = '';

		try {
			const res = await fetch('/api/departments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: deptName,
					code: deptCode,
					description: deptDesc,
					leadId: leadId || null,
					budgetMonthly: Number(budgetMonthly),
					color: deptColor
				})
			});

			if (!res.ok) {
				const err = await res.json();
				formError = err.message || 'Failed to create department';
				return;
			}

			deptName = '';
			deptCode = '';
			deptDesc = '';
			leadId = '';
			budgetMonthly = '150000';
			showCreateModal = false;
			await invalidateAll();
		} catch {
			formError = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- 1. Top Summary KPI Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
		<!-- KPI 1: Total Units -->
		<div class="rounded-3xl border border-emerald-200/70 bg-[#E8F8EE] p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-emerald-950">Active Departments</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">{data.departments.length}</p>
				<span class="text-[11px] text-emerald-700 font-medium block mt-1">Cross-functional units</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00C48C] shadow-xs">
				<Buildings size={24} weight="fill" />
			</div>
		</div>

		<!-- KPI 2: Total Staff Allocated -->
		<div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Allocated Staff</span>
				<p class="text-3xl font-bold text-slate-900 font-mono mt-1">{totalHeadcount}</p>
				<span class="text-[11px] text-slate-400 font-medium block mt-1">Across all departments</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
				<Users size={24} weight="fill" />
			</div>
		</div>

		<!-- KPI 3: Total Department Spend -->
		<div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
			<div>
				<span class="text-xs font-semibold text-slate-500">Monthly Budget Pool</span>
				<p class="text-2xl sm:text-3xl font-bold text-slate-900 font-mono mt-1">{formatCurrency(totalBudget)}</p>
				<span class="text-[11px] text-[#00C48C] font-semibold block mt-1">Ethiopian Birr (ETB)</span>
			</div>
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00C48C]">
				<Money size={24} weight="fill" />
			</div>
		</div>
	</div>

	<!-- 2. Action Bar & Search -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="relative w-full sm:w-80">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search department or lead..."
				class="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00C48C] focus:outline-none focus:ring-4 focus:ring-[#00C48C]/15 transition-all shadow-2xs"
			/>
		</div>

		{#if data.canManage}
			<Button variant="primary" onclick={() => (showCreateModal = true)}>
				<Plus size={16} weight="bold" />
				Add Department
			</Button>
		{/if}
	</div>

	<!-- 3. Departments Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each filteredDepartments as dept (dept.id)}
			<div
				class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all space-y-5 cursor-pointer group"
				onclick={() => goto(`/departments/${dept.id}`)}
			>
				<div>
					<!-- Header: Code Pill + Department Name -->
					<div class="flex items-start justify-between gap-3 mb-2">
						<div class="flex items-center gap-2.5">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-2xl text-white font-bold text-sm shadow-xs"
								style="background-color: {dept.color || '#00C48C'};"
							>
								{dept.code}
							</div>
							<div>
								<h3 class="text-base font-bold text-slate-900 leading-tight group-hover:text-[#00C48C] transition-colors">{dept.name}</h3>
								<span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
									CODE: {dept.code}
								</span>
							</div>
						</div>
					</div>

					<p class="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
						{dept.description || 'No description provided for this organizational unit.'}
					</p>

					<!-- Designated Representative Lead Card -->
					<div class="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60 flex items-center justify-between">
						<div class="flex items-center gap-3">
							{#if dept.lead}
								<div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00C48C] text-white font-bold text-xs shadow-xs">
									{getInitials(dept.lead.fullName)}
								</div>
								<div>
									<div class="flex items-center gap-1.5">
										<Crown size={12} class="text-amber-500" weight="fill" />
										<p class="text-xs font-bold text-slate-900 leading-tight">{dept.lead.fullName}</p>
									</div>
									<p class="text-[10px] text-slate-400 capitalize mt-0.5">
										Representative Lead &bull; {dept.lead.role.replace('_', ' ')}
									</p>
								</div>
							{:else}
								<div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-200 text-slate-500 font-bold text-xs">
									?
								</div>
								<div>
									<p class="text-xs font-bold text-slate-700">No Lead Appointed</p>
									<p class="text-[10px] text-slate-400">Awaiting assignment</p>
								</div>
							{/if}
						</div>

						<span class="text-slate-400 group-hover:text-[#00C48C] transition-colors p-1">
							<ArrowRight size={15} weight="bold" />
						</span>
					</div>
				</div>

				<!-- Footer: Headcount & Budget Allocation -->
				<div class="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
					<!-- Members Stack -->
					<div class="flex items-center gap-2">
						<div class="flex -space-x-2 overflow-hidden">
							{#each dept.members.slice(0, 3) as mem}
								<div
									class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-bold text-slate-700 shadow-2xs"
									title={mem.fullName}
								>
									{getInitials(mem.fullName)}
								</div>
							{/each}
						</div>
						<span class="text-[11px] font-bold text-slate-700">
							{dept.members.length} Member{dept.members.length !== 1 ? 's' : ''}
						</span>
					</div>

					<!-- Budget & Details Link -->
					<div class="text-right flex items-center gap-3">
						<div>
							<span class="text-[10px] font-medium text-slate-400 block">Monthly Budget</span>
							<span class="text-xs font-bold font-mono text-slate-900">{formatCurrency(dept.budgetMonthly)}</span>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
				<Buildings size={40} class="mx-auto mb-2 opacity-50" />
				<p class="text-sm font-semibold">No departments found matching search query.</p>
			</div>
		{/each}
	</div>
</div>

<!-- Add Department SlideOver -->
<SlideOver
	bind:open={showCreateModal}
	title="Create Company Department"
	subtitle="Define functional organizational unit, appoint representative lead, and allocate budget"
>
	<form onsubmit={handleCreateDepartment} class="space-y-5">
		{#if formError}
			<div class="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
				<span>⚠️</span>
				<span>{formError}</span>
			</div>
		{/if}

		<!-- Group 1: Identity & Scope -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-3.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Department Identity</span>

			<Input
				label="Department Name"
				name="deptName"
				bind:value={deptName}
				required
				placeholder="e.g. Sales & Business Development"
			/>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<Input
					label="Short Code"
					name="deptCode"
					bind:value={deptCode}
					required
					placeholder="e.g. SLS"
					hint="Max 4 characters"
				/>

				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-slate-700 tracking-tight">Theme Color</label>
					<div class="flex items-center gap-2 pt-1">
						{#each colorPresets as col}
							<button
								type="button"
								onclick={() => (deptColor = col)}
								class="h-6 w-6 rounded-full transition-all cursor-pointer ring-offset-2
									   {deptColor === col ? 'ring-2 ring-slate-900 scale-110' : 'hover:scale-105'}"
								style="background-color: {col};"
							></button>
						{/each}
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="dept-desc" class="text-xs font-bold text-slate-700">Department Mission &amp; Scope</label>
				<textarea
					id="dept-desc"
					rows={3}
					bind:value={deptDesc}
					placeholder="Outline primary deliverables and functional objectives..."
					class="w-full rounded-2xl border border-slate-200/80 bg-white p-3 text-xs text-slate-800 focus:border-[#00C48C] focus:outline-none focus:ring-4 focus:ring-[#00C48C]/15 transition-all shadow-2xs"
				></textarea>
			</div>
		</div>

		<!-- Group 2: Appoint Lead & Budget -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-3.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2. Leadership &amp; Budget Allocation</span>

			<Select
				label="Appoint Representative Lead"
				name="leadId"
				bind:value={leadId}
				options={data.employees.map((e) => ({
					value: e.id,
					label: `${e.fullName} (${e.role.replace('_', ' ')})`
				}))}
				placeholder="Select Department Representative Lead..."
			/>

			<Input
				label="Monthly Salary Allocation Pool"
				name="budgetMonthly"
				type="number"
				prefixText="ETB"
				bind:value={budgetMonthly}
				required
				placeholder="150000.00"
			/>
		</div>

		<div class="flex gap-3 pt-4 border-t border-slate-100">
			<Button type="submit" variant="primary" class="flex-1" disabled={isSubmitting}>
				{isSubmitting ? 'Creating Department...' : 'Create Department'}
			</Button>
			<Button type="button" variant="secondary" onclick={() => (showCreateModal = false)}>
				Cancel
			</Button>
		</div>
	</form>
</SlideOver>
