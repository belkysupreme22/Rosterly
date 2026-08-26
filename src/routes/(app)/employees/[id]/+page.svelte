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
	import InternalNotes from '$lib/components/InternalNotes.svelte';
	import PayrollSummaryCard from '$lib/components/PayrollSummaryCard.svelte';
	import {
		ArrowLeft,
		PencilSimple,
		DotsThree,
		GenderFemale,
		CalendarBlank,
		EnvelopeSimple,
		Phone,
		MapPin,
		LinkedinLogo,
		XLogo,
		InstagramLogo,
		Globe,
		YoutubeLogo,
		Bank,
		FirstAid,
		ShieldCheck,
		IdentificationCard,
		CheckCircle
	} from 'phosphor-svelte';

	interface Props {
		data: {
			user: { role: string };
			employee: {
				id: string;
				fullName: string;
				role: string;
				baseSalary: string;
				bankAccount: string | null;
				createdAt: string;
				company: { name: string; tin: string };
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

	const canEdit = $derived(data.user.role === 'hr_admin' || data.user.role === 'owner');
	let showEditForm = $state(false);
	let isSubmitting = $state(false);
	let formError = $state('');

	// Edit form fields
	let editName = $state('');
	let editRole = $state('employee');
	let editSalary = $state('');
	let editBank = $state('');

	$effect(() => {
		if (data.employee) {
			editName = data.employee.fullName;
			editRole = data.employee.role;
			editSalary = data.employee.baseSalary;
			editBank = data.employee.bankAccount || '';
		}
	});

	const roleOptions = [
		{ value: 'employee', label: 'Employee' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'hr_admin', label: 'HR Admin' },
		{ value: 'owner', label: 'Owner' }
	];

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function maskAccount(account: string | null): string {
		if (!account) return '•••• •••• •••• 4892';
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
	<!-- Exact 3-Column Layout with Perfectly Aligned Bottom Baselines (items-stretch) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
		<!-- Left Column: Profile Card, Personal Info & Bank/Emergency (3 cols, Full Height) -->
		<div class="lg:col-span-3 flex flex-col justify-between space-y-6 h-full">
			<!-- Card 1: Main Profile Card -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs text-center">
				<!-- Large Avatar Photo Box in Solid Mint/Teal Green -->
				<div class="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl bg-[#00C48C] text-white font-bold text-4xl shadow-sm mb-4">
					{getInitials(data.employee.fullName)}
				</div>

				<h2 class="text-base font-bold text-slate-900">{data.employee.fullName}</h2>
				<p class="text-xs text-slate-400 font-medium mt-0.5">HR Officer &bull; Human Resources</p>

				<!-- Pills -->
				<div class="flex items-center justify-center gap-2 mt-3">
					<span class="rounded-full bg-slate-100 px-3 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
						EMP-0289
					</span>
					<span class="rounded-full bg-[#E8F8EE] px-3 py-0.5 text-[11px] font-semibold text-[#00C48C]">
						Active
					</span>
				</div>

				{#if canEdit}
					<button
						onclick={() => (showEditForm = true)}
						class="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#00C48C] bg-slate-50 hover:bg-[#E8F8EE] px-3 py-1 rounded-xl border border-slate-200/70 transition-colors"
					>
						<PencilSimple size={12} />
						Edit Profile
					</button>
				{/if}

				<!-- Key-Value Meta Rows -->
				<div class="mt-6 pt-5 border-t border-slate-100 space-y-3 text-xs text-left">
					<div class="flex justify-between">
						<span class="text-slate-400">Employment Type</span>
						<span class="font-semibold text-slate-800">Full-Time</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-400">Work Model</span>
						<span class="font-semibold text-slate-800">Hybrid</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-400">Join Date</span>
						<span class="font-semibold text-slate-800">14 February 2033</span>
					</div>
				</div>

				<!-- Social Media Row -->
				<div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
					<span class="text-slate-400 font-medium">Social Media:</span>
					<div class="flex items-center gap-1.5">
						<button class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors">
							<LinkedinLogo size={14} weight="bold" />
						</button>
						<button class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors">
							<XLogo size={14} weight="bold" />
						</button>
						<button class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors">
							<InstagramLogo size={14} weight="bold" />
						</button>
					</div>
				</div>
			</div>

			<!-- Card 2: Personal Info Card -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
				<!-- Header -->
				<div class="flex items-center justify-between border-b border-slate-100 pb-3">
					<h3 class="text-xs font-bold text-slate-900">Personal Info</h3>
					<button class="text-slate-400 hover:text-slate-700 transition-colors p-1">
						<DotsThree size={18} weight="bold" />
					</button>
				</div>

				<div class="space-y-4 text-xs">
					<!-- Gender -->
					<div class="flex items-start gap-3">
						<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50">
							<GenderFemale size={16} />
						</div>
						<div>
							<span class="text-[10px] text-slate-400 font-medium block">Gender</span>
							<span class="font-semibold text-slate-800">Female</span>
						</div>
					</div>

					<!-- Date of Birth -->
					<div class="flex items-start gap-3">
						<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50">
							<CalendarBlank size={16} />
						</div>
						<div>
							<span class="text-[10px] text-slate-400 font-medium block">Date of Birth</span>
							<span class="font-semibold text-slate-800">28 March 1993</span>
						</div>
					</div>

					<!-- Email -->
					<div class="flex items-start gap-3">
						<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50">
							<EnvelopeSimple size={16} />
						</div>
						<div class="min-w-0">
							<span class="text-[10px] text-slate-400 font-medium block">Email Address</span>
							<span class="font-semibold text-slate-800 truncate block">mia.torres@company.com</span>
						</div>
					</div>

					<!-- Phone -->
					<div class="flex items-start gap-3">
						<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50">
							<Phone size={16} />
						</div>
						<div>
							<span class="text-[10px] text-slate-400 font-medium block">Phone</span>
							<span class="font-semibold text-slate-800 font-mono">+62 812-3456-7890</span>
						</div>
					</div>

					<!-- Address -->
					<div class="flex items-start gap-3">
						<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50">
							<MapPin size={16} />
						</div>
						<div>
							<span class="text-[10px] text-slate-400 font-medium block">Address</span>
							<span class="font-medium text-slate-700 leading-relaxed block">
								Jl. Melati No. 45, Sleman, Yogyakarta, Indonesia
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Card 3: Bank & Emergency Contact (Flex-1 to Perfect Baseline Alignment) -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex-1 flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
						<h3 class="text-xs font-bold text-slate-900">Bank & Emergency Contact</h3>
						<button class="text-slate-400 hover:text-slate-700 transition-colors p-1">
							<DotsThree size={18} weight="bold" />
						</button>
					</div>

					<div class="space-y-4 text-xs">
						<!-- Bank Account -->
						<div class="flex items-start gap-3">
							<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50">
								<Bank size={16} />
							</div>
							<div>
								<span class="text-[10px] text-slate-400 font-medium block">Disbursement Bank</span>
								<span class="font-semibold text-slate-800">Commercial Bank of Ethiopia</span>
								<span class="font-mono text-slate-500 block text-[11px] mt-0.5">{maskAccount(data.employee.bankAccount)}</span>
							</div>
						</div>

						<!-- Emergency Contact -->
						<div class="flex items-start gap-3">
							<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50">
								<FirstAid size={16} />
							</div>
							<div>
								<span class="text-[10px] text-slate-400 font-medium block">Emergency Contact</span>
								<span class="font-semibold text-slate-800">Dawit Torres</span>
								<span class="text-slate-500 block text-[11px]">Brother &bull; +251 911 234 567</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Middle Column: Top 4 Circular Stats, Performance Overview, Hours & Docs, Internal Notes (6 cols, Full Height) -->
		<div class="lg:col-span-6 flex flex-col justify-between space-y-6 h-full">
			<!-- Top 4 Circular Stat Cards in 4 columns -->
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<!-- Card 1: All Leaves (Highlighted Pastel Green) -->
				<CircularStat
					label="All Leaves"
					numerator="14"
					denominator="20"
					unit="Days"
					isHighlighted={true}
					progress={70}
				/>

				<!-- Card 2: Annual Leaves -->
				<CircularStat
					label="Annual Leaves"
					numerator="10"
					denominator="15"
					unit="Days"
					isHighlighted={false}
					progress={66}
				/>

				<!-- Card 3: Casual Leaves -->
				<CircularStat
					label="Casual Leaves"
					numerator="8"
					denominator="24"
					unit="Hours"
					isHighlighted={false}
					progress={33}
				/>

				<!-- Card 4: Sick Leaves -->
				<CircularStat
					label="Sick Leaves"
					numerator="3"
					denominator="4"
					unit="Days"
					isHighlighted={false}
					progress={75}
				/>
			</div>

			<!-- Performance Overview Stepped Curve Chart -->
			<AreaChart
				title="Performance Overview"
				metricValue="86.75%"
				trendText="+2.05% Increased by last year"
				timeframe="Last Year"
				height={210}
			/>

			<!-- Split Row: Hours Logged & Documents -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<!-- Hours Logged Bar Chart -->
				<BarChart
					title="Hours Logged"
					metricValue="34h 30m"
					timeframe="This Week"
				/>

				<!-- Documents Card -->
				<DocumentsList />
			</div>

			<!-- Card 4: Internal Notes Card (Flex-1 to Perfect Baseline Alignment) -->
			<InternalNotes class="flex-1" />
		</div>

		<!-- Right Column: Calendar Widget, Payroll Summary & Tax Compliance (3 cols, Full Height) -->
		<div class="lg:col-span-3 flex flex-col justify-between space-y-6 h-full">
			<!-- Card 1: Calendar Widget (June 2035) -->
			<CalendarWidget monthLabel="June 2035" />

			<!-- Card 2: Payroll Summary Table -->
			<PayrollSummaryCard baseSalary={3200} />

			<!-- Card 3: Tax & Statutory Compliance (Flex-1 to Perfect Baseline Alignment) -->
			<div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex-1 flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
						<h3 class="text-xs font-bold text-slate-900">Tax & Pension Compliance</h3>
						<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
							<CheckCircle size={12} weight="fill" />
							Verified
						</span>
					</div>

					<div class="space-y-3 text-xs">
						<div class="flex justify-between py-0.5">
							<span class="text-slate-400">Employee TIN</span>
							<span class="font-mono font-semibold text-slate-800">0098273645</span>
						</div>
						<div class="flex justify-between py-0.5">
							<span class="text-slate-400">Pension Scheme ID</span>
							<span class="font-mono font-semibold text-slate-800">ETH-PEN-9821</span>
						</div>
						<div class="flex justify-between py-0.5">
							<span class="text-slate-400">Pension Contribution</span>
							<span class="font-semibold text-emerald-700">7% Emp / 11% Org</span>
						</div>
						<div class="flex justify-between py-0.5">
							<span class="text-slate-400">Fiscal Registration</span>
							<span class="font-semibold text-slate-800">Active (2026/27)</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Page Footer (TeamHub Reference) -->
	<footer class="pt-8 pb-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
		<div class="flex items-center gap-4 flex-wrap">
			<span>Copyright &copy; 2025 Peterdraw</span>
			<a href="/employees" class="hover:text-slate-600 transition-colors">Privacy Policy</a>
			<a href="/employees" class="hover:text-slate-600 transition-colors">Term and conditions</a>
			<a href="/employees" class="hover:text-slate-600 transition-colors">Contact</a>
		</div>

		<div class="flex items-center gap-3 text-slate-400">
			<Globe size={16} class="hover:text-slate-600 cursor-pointer" />
			<XLogo size={16} class="hover:text-slate-600 cursor-pointer" />
			<InstagramLogo size={16} class="hover:text-slate-600 cursor-pointer" />
			<YoutubeLogo size={16} class="hover:text-slate-600 cursor-pointer" />
			<LinkedinLogo size={16} class="hover:text-slate-600 cursor-pointer" />
		</div>
	</footer>
</div>

<!-- Edit Employee SlideOver -->
{#if canEdit}
	<SlideOver bind:open={showEditForm} title="Edit Employee Profile">
		<form onsubmit={handleEdit} class="space-y-4">
			{#if formError}
				<div class="rounded-xl bg-danger-light px-4 py-3 text-sm text-danger border border-red-200">
					{formError}
				</div>
			{/if}

			<Input label="Full Name" name="editName" bind:value={editName} required />
			<Select label="Role" name="editRole" bind:value={editRole} options={roleOptions} required />
			<Input label="Base Salary (ETB)" name="editSalary" type="number" bind:value={editSalary} required />
			<Input label="Bank Account" name="editBank" bind:value={editBank} placeholder="Optional" />

			<div class="flex gap-3 pt-4 border-t border-slate-100">
				<Button type="submit" variant="primary" class="flex-1" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Changes'}
				</Button>
				<Button type="button" variant="secondary" onclick={() => (showEditForm = false)}>
					Cancel
				</Button>
			</div>
		</form>
	</SlideOver>
{/if}
