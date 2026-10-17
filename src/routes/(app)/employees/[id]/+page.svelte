<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import SlideOver from '$lib/components/SlideOver.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import CircularStat from '$lib/components/CircularStat.svelte';
	import CalendarWidget from '$lib/components/CalendarWidget.svelte';
	import AreaChart from '$lib/components/charts/AreaChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DocumentsList from '$lib/components/DocumentsList.svelte';
	import PayrollSummaryCard from '$lib/components/PayrollSummaryCard.svelte';
	import {
		ArrowLeft,
		PencilSimple,
		CalendarBlank,
		Bank,
		ShieldCheck,
		IdentificationCard,
		Laptop,
		Warning,
		SealCheck,
		FileText,
		Coins,
		QrCode,
		Buildings,
		Crown,
		UsersThree,
		CheckCircle,
		Briefcase
	} from 'phosphor-svelte';

	interface Props {
		data: {
			userRole: string;
			employee: {
				id: string;
				fullName: string;
				role: string;
				employmentType: string;
				positionLevel: string;
				jobDescription: string | null;
				workStatus: string;
				contractStartDate: string | null;
				contractEndDate: string | null;
				baseSalary: string;
				bankAccount: string | null;
				createdAt: string;
				company: { name: string; tin: string };
				assets: Array<{
					id: string;
					name: string;
					category: string;
					serialNumber: string | null;
					assignedDate: string;
					status: string;
					notes: string | null;
				}>;
				salaryAdvances: Array<{
					id: string;
					amount: string;
					reason: string;
					status: string;
					createdAt: string;
				}>;
				documentRequests: Array<{
					id: string;
					type: string;
					purpose: string | null;
					verificationCode: string;
					recipientOrganization: string | null;
					createdAt: string;
				}>;
				leaveRequests: Array<{
					id: string;
					startDate: string;
					endDate: string;
					status: string;
				}>;
			};
		};
	}

	let { data }: Props = $props();

	const isOwner = $derived(data.employee.role === 'owner');
	const isFinance = $derived(data.employee.role === 'finance');
	const isHR = $derived(data.employee.role === 'hr_admin');
	const isManager = $derived(data.employee.role === 'manager');
	const isStandardEmployee = $derived(data.employee.role === 'employee');

	const canEdit = $derived(data.userRole === 'hr_admin' || data.userRole === 'owner');
	let showEditForm = $state(false);
	let isSubmitting = $state(false);
	let formError = $state('');

	// Edit form fields
	let editName = $state('');
	let editRole = $state('employee');
	let editDeptId = $state('');
	let editType = $state('full_time');
	let editLevel = $state('mid');
	let editStatus = $state('in_office');
	let editSalary = $state('');
	let editBank = $state('');
	let editJD = $state('');

	$effect(() => {
		if (data.employee) {
			editName = data.employee.fullName;
			editRole = data.employee.role;
			editDeptId = (data.employee as any).department?.id || (data.employee as any).departmentId || '';
			editType = data.employee.employmentType || 'full_time';
			editLevel = data.employee.positionLevel || 'mid';
			editStatus = data.employee.workStatus || 'in_office';
			editSalary = data.employee.baseSalary;
			editBank = data.employee.bankAccount || '';
			editJD = data.employee.jobDescription || '';
		}
	});

	// Contract Expiry Radar calculation
	const contractRadar = $derived.by(() => {
		if (data.employee.employmentType !== 'contractual' || !data.employee.contractEndDate) {
			return null;
		}
		const end = new Date(data.employee.contractEndDate).getTime();
		const now = new Date().getTime();
		const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
		return {
			endDate: data.employee.contractEndDate,
			daysLeft,
			isExpiringSoon: daysLeft <= 30 && daysLeft >= 0,
			isExpired: daysLeft < 0
		};
	});

	const roleOptions = [
		{ value: 'employee', label: 'Employee' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'finance', label: 'Finance Officer' },
		{ value: 'hr_admin', label: 'HR Admin' },
		{ value: 'owner', label: 'Owner' }
	];

	const typeOptions = [
		{ value: 'full_time', label: 'Full-Time (Permanent)' },
		{ value: 'contractual', label: 'Contractual (Fixed Term)' },
		{ value: 'part_time', label: 'Part-Time' }
	];

	const levelOptions = [
		{ value: 'junior', label: 'L1 — Junior Associate' },
		{ value: 'mid', label: 'L2 — Mid-Level Specialist' },
		{ value: 'senior', label: 'L3 — Senior Lead' },
		{ value: 'lead', label: 'L4 — Staff / Principal' },
		{ value: 'principal', label: 'L5 — Executive / Partner' }
	];

	const statusOptions = [
		{ value: 'in_office', label: '🟢 In Office' },
		{ value: 'remote', label: '🏠 Remote / WFH' },
		{ value: 'in_meeting', label: '🗓️ In Client Meeting' },
		{ value: 'on_leave', label: '🏖️ On Approved Leave' },
		{ value: 'sick', label: '🏥 Medical / Sick' }
	];

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function formatSalary(salary: string | number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'ETB',
			minimumFractionDigits: 2
		}).format(Number(salary));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function maskAccount(account: string | null): string {
		if (!account) return '—';
		if (account.length <= 4) return account;
		return '•••• •••• •••• ' + account.slice(-4);
	}

	async function handleEdit(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		formError = '';

		try {
			const res = await fetch(`/api/employees/${data.employee.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fullName: editName,
					role: editRole,
					employmentType: editType,
					positionLevel: editLevel,
					workStatus: editStatus,
					jobDescription: editJD,
					baseSalary: Number(editSalary),
					bankAccount: editBank || null
				})
			});

			if (!res.ok) {
				const err = await res.json();
				formError = err.message || 'Failed to update employee';
				return;
			}

			showEditForm = false;
			await invalidateAll();
		} catch {
			formError = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- 1. Contract Expiry Radar Alert Banner (When Applicable for Contractual Staff) -->
	{#if contractRadar && contractRadar.isExpiringSoon}
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/50 p-5 shadow-xs">
			<div class="flex items-center gap-3.5">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
					<Warning size={20} weight="bold" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<span class="text-xs font-bold uppercase tracking-wider text-amber-800">Contract Expiry Radar</span>
						<span class="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
							{contractRadar.daysLeft} Days Remaining
						</span>
					</div>
					<p class="text-xs text-amber-900/80 mt-0.5">
						Fixed-term contract expires on <strong>{formatDate(contractRadar.endDate)}</strong>.
					</p>
				</div>
			</div>

			{#if canEdit}
				<Button variant="primary" size="sm" onclick={() => (showEditForm = true)}>
					Extend Contract
				</Button>
			{/if}
		</div>
	{/if}

	<!-- 2. Role-Aware 3-Column Profile Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left Column: Identity & Primary Employment Card (3 cols) -->
		<div class="lg:col-span-3 space-y-6">
			<!-- Main Profile Identity Card -->
			<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs text-center">
				<!-- Large Avatar Photo Box -->
				<div class="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-[#00C48C] text-white font-bold text-3xl shadow-sm mb-3">
					{getInitials(data.employee.fullName)}
				</div>

				<h2 class="text-base font-bold text-slate-900">{data.employee.fullName}</h2>
				<p class="text-xs text-slate-400 font-medium mt-0.5 capitalize">
					{#if isOwner}
						Executive Owner &bull; Managing Partner
					{:else if isHR}
						People Ops Lead &bull; HR Admin
					{:else if isManager}
						Team Lead &bull; Manager
					{:else}
						Level {data.employee.positionLevel} &bull; {data.employee.role.replace('_', ' ')}
					{/if}
				</p>

				<!-- Badges -->
				<div class="flex items-center justify-center gap-2 mt-3">
					<span class="rounded-full bg-slate-100 px-3 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
						EMP-{data.employee.id.slice(0, 4).toUpperCase()}
					</span>
					<span class="rounded-full bg-[#E8F8EE] px-3 py-0.5 text-[11px] font-semibold text-[#00C48C]">
						Active
					</span>
				</div>

				<!-- Live Work Status (Only for operational staff) -->
				{#if !isOwner}
					<div class="mt-3 flex items-center justify-center">
						<span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
							{#if data.employee.workStatus === 'remote'}
								🏠 Remote / WFH
							{:else if data.employee.workStatus === 'in_meeting'}
								🗓️ In Client Meeting
							{:else if data.employee.workStatus === 'on_leave'}
								🏖️ On Approved Leave
							{:else}
								🟢 In Office
							{/if}
						</span>
					</div>
				{/if}

				{#if canEdit}
					<button
						onclick={() => (showEditForm = true)}
						class="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-[#00C48C] bg-slate-50 hover:bg-[#E8F8EE] px-3 py-2 rounded-2xl border border-slate-200/70 transition-colors w-full justify-center"
					>
						<PencilSimple size={13} />
						Edit Profile &amp; Role
					</button>
				{/if}

				<!-- Key-Value Meta Rows -->
				<div class="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-left">
					<div class="flex justify-between">
						<span class="text-slate-400">Employment Type</span>
						<span class="font-semibold text-slate-800 capitalize">
							{data.employee.employmentType.replace('_', ' ')}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-400">Organization</span>
						<span class="font-semibold text-slate-800 truncate max-w-[140px] text-right">
							{data.employee.company.name}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-400">Since</span>
						<span class="font-semibold text-slate-800">{formatDate(data.employee.createdAt)}</span>
					</div>
				</div>
			</div>

			<!-- Card 2: Bank & Statutory ID -->
			<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs text-left">
				<h4 class="text-xs font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
					<Bank size={16} class="text-[#00C48C]" />
					{isOwner ? 'Executive Remittance Account' : 'Payroll Wire Details'}
				</h4>
				<div class="space-y-2.5 text-xs">
					<div class="flex justify-between">
						<span class="text-slate-400">Bank Partner:</span>
						<span class="font-semibold text-slate-800">Commercial Bank of Ethiopia</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-400">Account No:</span>
						<span class="font-mono font-bold text-slate-900">{maskAccount(data.employee.bankAccount)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-400">Company TIN:</span>
						<span class="font-mono font-semibold text-slate-700">{data.employee.company.tin}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Middle Column: Role-Specific Scope & Operational Overview (6 cols) -->
		<div class="lg:col-span-6 space-y-6">
			{#if isOwner}
				<!-- 👑 OWNER VIEW: Corporate Governance & Directorship Scope -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
					<div class="flex items-center justify-between border-b border-slate-100 pb-3">
						<div class="flex items-center gap-2">
							<Crown size={18} class="text-amber-500" weight="fill" />
							<h3 class="text-sm font-bold text-slate-900">Executive Authority &amp; Governance</h3>
						</div>
						<span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
							Principal Officer
						</span>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
							<span class="text-slate-400 font-medium">Signing Authority</span>
							<p class="text-sm font-bold text-slate-900 mt-1">Full Executive Power</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Authorizes all corporate disbursements &amp; tax filings.</p>
						</div>
						<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
							<span class="text-slate-400 font-medium">Legal Entity</span>
							<p class="text-sm font-bold text-slate-900 mt-1">{data.employee.company.name}</p>
							<p class="text-[11px] text-slate-500 mt-0.5">TIN: {data.employee.company.tin}</p>
						</div>
					</div>

					<div class="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/60 text-xs">
						<h4 class="font-bold text-emerald-950 flex items-center gap-1.5">
							<ShieldCheck size={16} class="text-[#00C48C]" weight="bold" />
							Company-Wide Administrative Access
						</h4>
						<p class="text-[11px] text-emerald-900/80 mt-1 leading-relaxed">
							This profile holds highest-tier ownership clearance with unrestricted visibility into the payroll engine, treasury disbursals, team calendars, and organization records.
						</p>
					</div>
				</div>

				<!-- Company Overview Note -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
					<h4 class="text-xs font-bold text-slate-900 mb-2">Executive Responsibilities</h4>
					<p class="text-xs text-slate-600 leading-relaxed">
						{data.employee.jobDescription || 'Executive leadership, corporate strategy, investor relations, and capital allocation across Ethiopian operations.'}
					</p>
				</div>
			{:else if isFinance}
				<!-- 💰 FINANCE OFFICER VIEW: Treasury & Payroll Operations -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
					<div class="flex items-center justify-between border-b border-slate-100 pb-3">
						<div class="flex items-center gap-2">
							<Coins size={18} class="text-[#00C48C]" weight="bold" />
							<h3 class="text-sm font-bold text-slate-900">Finance &amp; Treasury Operations</h3>
						</div>
						<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
							Treasury Clearance
						</span>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
							<span class="text-slate-400 font-medium">Payroll Execution</span>
							<p class="text-sm font-bold text-slate-900 mt-1">Initiator &amp; Calculation</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Calculates progressive tax, pension fund &amp; CBE wire.</p>
						</div>
						<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
							<span class="text-slate-400 font-medium">Statutory Compliance</span>
							<p class="text-sm font-bold text-slate-900 mt-1">Ministry of Revenue (MoR)</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Private Pension Directive 7%/11% &amp; Declarations.</p>
						</div>
					</div>

					<div class="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/60 text-xs">
						<h4 class="font-bold text-emerald-950 flex items-center gap-1.5">
							<ShieldCheck size={16} class="text-[#00C48C]" weight="bold" />
							Commercial Bank of Ethiopia (CBE) Wire Export Access
						</h4>
						<p class="text-[11px] text-emerald-900/80 mt-1 leading-relaxed">
							Authorized to compile, disburse, and export electronic batch files for CBE corporate direct deposits and salary advance balance reconciliations.
						</p>
					</div>
				</div>

				<!-- Assigned Assets -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
					<h4 class="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
						<Laptop size={16} class="text-[#00C48C]" />
						Assigned Equipment &amp; Financial Security Keys ({data.employee.assets.length})
					</h4>
					<div class="space-y-2 text-xs">
						{#each data.employee.assets as asset}
							<div class="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/60">
								<span class="font-bold text-slate-900">{asset.name}</span>
								<span class="font-mono text-slate-400 text-[11px]">{asset.serialNumber || 'Active'}</span>
							</div>
						{:else}
							<p class="text-slate-400 py-2">No hardware assigned.</p>
						{/each}
					</div>
				</div>
			{:else if isHR}
				<!-- 🛡️ HR ADMIN VIEW: People Ops Administration Scope -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
					<div class="flex items-center justify-between border-b border-slate-100 pb-3">
						<div class="flex items-center gap-2">
							<Briefcase size={18} class="text-[#00C48C]" weight="bold" />
							<h3 class="text-sm font-bold text-slate-900">People Operations Administration</h3>
						</div>
						<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
							HR Clearance
						</span>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
							<span class="text-slate-400 font-medium">Department Scope</span>
							<p class="text-sm font-bold text-slate-900 mt-1">All Staff &amp; Contractors</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Manages onboarding, contracts, and leave rosters.</p>
						</div>
						<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
							<span class="text-slate-400 font-medium">Compliance Authority</span>
							<p class="text-sm font-bold text-slate-900 mt-1">MoR &amp; Labor Standards</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Administers statutory policies &amp; tax declarations.</p>
						</div>
					</div>

					<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60 text-xs">
						<h4 class="font-bold text-slate-900 mb-1">Key Responsibilities</h4>
						<p class="text-xs text-slate-600 leading-relaxed">
							{data.employee.jobDescription || 'Oversees organization lifecycle, benefits administration, holiday broadcasts, and team performance matrices.'}
						</p>
					</div>
				</div>

				<!-- Assigned Assets -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
					<h4 class="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
						<Laptop size={16} class="text-[#00C48C]" />
						Assigned Equipment &amp; Assets ({data.employee.assets.length})
					</h4>
					<div class="space-y-2 text-xs">
						{#each data.employee.assets as asset}
							<div class="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/60">
								<span class="font-bold text-slate-900">{asset.name}</span>
								<span class="font-mono text-slate-400 text-[11px]">{asset.serialNumber || 'Active'}</span>
							</div>
						{:else}
							<p class="text-slate-400 py-2">No hardware assigned.</p>
						{/each}
					</div>
				</div>
			{:else if isManager}
				<!-- 👔 MANAGER VIEW: Team Leadership & Direct Reports -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
					<div class="flex items-center justify-between border-b border-slate-100 pb-3">
						<div class="flex items-center gap-2">
							<UsersThree size={18} class="text-[#00C48C]" weight="bold" />
							<h3 class="text-sm font-bold text-slate-900">Team Leadership &amp; Engineering Management</h3>
						</div>
						<span class="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
							Manager
						</span>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
							<span class="text-slate-400 font-medium">Direct Reports</span>
							<p class="text-sm font-bold text-slate-900 mt-1">4 Team Members</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Approves leave requests &amp; monitors shifts.</p>
						</div>
						<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
							<span class="text-slate-400 font-medium">Attendance &amp; Schedule</span>
							<p class="text-sm font-bold text-slate-900 mt-1">96.4% Team Attendance</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Manages weekly shift rotations.</p>
						</div>
					</div>

					<div class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60 text-xs">
						<h4 class="font-bold text-slate-900 mb-1">Leadership Scope</h4>
						<p class="text-xs text-slate-600 leading-relaxed">
							{data.employee.jobDescription || 'Leads the product development squad, sprint planning, architectural reviews, and quarterly staff assessments.'}
						</p>
					</div>
				</div>

				<!-- Assigned Assets -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
					<h4 class="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
						<Laptop size={16} class="text-[#00C48C]" />
						Assigned Equipment ({data.employee.assets.length})
					</h4>
					<div class="space-y-2 text-xs">
						{#each data.employee.assets as asset}
							<div class="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/60">
								<span class="font-bold text-slate-900">{asset.name}</span>
								<span class="font-mono text-slate-400 text-[11px]">{asset.serialNumber || 'Active'}</span>
							</div>
						{:else}
							<p class="text-slate-400 py-2">No hardware assigned.</p>
						{/each}
					</div>
				</div>
			{:else}
				<!-- 👤 STANDARD EMPLOYEE VIEW: Simple, Clean Personal Profile -->
				<!-- Row 1: Personal Leave Balances -->
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					<CircularStat label="Annual Leave" numerator={10} denominator={15} unit="Days" isHighlighted />
					<CircularStat label="Casual Leave" numerator={8} denominator={24} unit="Hours" />
					<CircularStat label="Sick Leave" numerator={3} denominator={4} unit="Days" />
				</div>

				<!-- Row 2: Role & Deliverables -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs text-left">
					<div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
						<h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
							<FileText size={16} class="text-[#00C48C]" />
							Role Deliverables &amp; Responsibilities
						</h4>
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level {data.employee.positionLevel}</span>
					</div>
					<p class="text-xs text-slate-600 leading-relaxed">
						{data.employee.jobDescription || 'Executes design deliverables, client prototypes, interface design systems, and cross-team design syncs.'}
					</p>
				</div>

				<!-- Row 3: Assigned Equipment & Custody -->
				<div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs text-left">
					<h4 class="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
						<Laptop size={16} class="text-[#00C48C]" />
						My Assigned Hardware &amp; Assets ({data.employee.assets.length})
					</h4>
					<div class="space-y-2.5 text-xs">
						{#each data.employee.assets as asset}
							<div class="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-200/60">
								<div>
									<p class="font-bold text-slate-900">{asset.name}</p>
									{#if asset.serialNumber}
										<p class="text-[10px] font-mono text-slate-400 mt-0.5">S/N: {asset.serialNumber}</p>
									{/if}
								</div>
								<span class="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full capitalize">
									{asset.status}
								</span>
							</div>
						{:else}
							<p class="text-slate-400 py-2">No hardware assigned.</p>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Right Column: Calendar & Statutory Compensation (3 cols) -->
		<div class="lg:col-span-3 space-y-6">
			<!-- Mini Calendar Widget -->
			<CalendarWidget />

			<!-- QR-Verifiable Letter Generator Card -->
			<div class="rounded-3xl border border-emerald-200 bg-[#E8F8EE] p-6 shadow-xs text-left">
				<div class="flex items-center gap-2 mb-2">
					<div class="flex h-7 w-7 items-center justify-center rounded-xl bg-[#00C48C] text-white">
						<QrCode size={16} weight="bold" />
					</div>
					<h4 class="text-xs font-bold text-emerald-950">Official Certificate (QR)</h4>
				</div>
				<p class="text-[11px] text-emerald-900/80 leading-relaxed mb-3">
					Instant QR-verified employment letter for Commercial Bank of Ethiopia (CBE) and embassy verification.
				</p>
				<a
					href="/verify/ETH-VERIFY-2026-HANA-8892"
					target="_blank"
					class="block text-center w-full rounded-2xl bg-[#00C48C] hover:bg-[#00b07d] text-white text-xs font-bold py-2.5 shadow-xs transition-colors"
				>
					View Certified Letter (QR)
				</a>
			</div>

			<!-- Payroll / Compensation Breakdown -->
			<PayrollSummaryCard baseSalary={Number(data.employee.baseSalary)} />
		</div>
	</div>
</div>

<!-- Edit Employee SlideOver -->
<SlideOver
	bind:open={showEditForm}
	title="Edit Employee Profile"
	subtitle="Update employment lifecycle, career leveling, and payroll parameters"
>
	<form onsubmit={handleEdit} class="space-y-5">
		{#if formError}
			<div class="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
				<span>⚠️</span>
				<span>{formError}</span>
			</div>
		{/if}

		<!-- Group 1: Role & Position -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-3.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Identity &amp; Leveling</span>

			<Input label="Full Name" name="editName" bind:value={editName} required />

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<Select label="System Role" name="editRole" bind:value={editRole} options={roleOptions} required />
				<Select label="Employment Type" name="editType" bind:value={editType} options={typeOptions} required />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<Select label="Career Band & Level" name="editLevel" bind:value={editLevel} options={levelOptions} required />
				<Select label="Live Work Status" name="editStatus" bind:value={editStatus} options={statusOptions} required />
			</div>
		</div>

		<!-- Group 2: Financial Details -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-3.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2. Compensation &amp; Bank Account</span>

			<Input
				label="Monthly Base Salary / Remittance"
				name="editSalary"
				type="number"
				prefixText="ETB"
				bind:value={editSalary}
				required
			/>

			<Input
				label="CBE Bank Account Number"
				name="editBank"
				bind:value={editBank}
				placeholder="1000 •••• •••• ••••"
				hint="Commercial Bank of Ethiopia"
			/>
		</div>

		<!-- Group 3: Deliverables Scope -->
		<div class="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/60 space-y-2">
			<label for="edit-jd" class="text-xs font-bold text-slate-700">Role Deliverables &amp; Scope</label>
			<textarea
				id="edit-jd"
				rows={3}
				bind:value={editJD}
				placeholder="Describe core duties and deliverables..."
				class="w-full rounded-2xl border border-slate-200/80 bg-white p-3 text-xs text-slate-800 focus:border-[#00C48C] focus:outline-none focus:ring-4 focus:ring-[#00C48C]/15 transition-all shadow-2xs"
			></textarea>
		</div>

		<div class="flex gap-3 pt-4 border-t border-slate-100">
			<Button type="submit" variant="primary" class="flex-1" disabled={isSubmitting}>
				{isSubmitting ? 'Saving Changes...' : 'Save Changes'}
			</Button>
			<Button type="button" variant="secondary" onclick={() => (showEditForm = false)}>
				Cancel
			</Button>
		</div>
	</form>
</SlideOver>
