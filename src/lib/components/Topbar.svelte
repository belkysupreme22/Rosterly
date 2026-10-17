<script lang="ts">
	import {
		SignOut,
		MagnifyingGlass,
		GearSix,
		Bell,
		CaretDown,
		ArrowLeft
	} from 'phosphor-svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	interface Props {
		userName: string;
		userRole: string;
		currentPath: string;
		unreadNoticesCount?: number;
		employeeId?: string | null;
	}

	let {
		userName,
		userRole,
		currentPath,
		unreadNoticesCount = 0,
		employeeId = null
	}: Props = $props();

	async function handleSignOut() {
		await authClient.signOut();
		goto('/login');
	}

	function getInitials(name: string): string {
		if (!name) return 'U';
		const parts = name.trim().split(' ');
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	// Derived title, back link, and breadcrumb matching reference mockup
	const pageMeta = $derived.by(() => {
		if (currentPath.startsWith('/employees/') && currentPath !== '/employees') {
			return {
				title: 'Employee Details',
				breadcrumb: 'Dashboard / Employees / Employee Details',
				backHref: userRole === 'employee' ? '/dashboard' : '/employees'
			};
		}
		if (currentPath.startsWith('/payslips/') && currentPath !== '/payslips') {
			return {
				title: 'Payslip Voucher',
				breadcrumb: 'Dashboard / Payslips / Payslip Voucher',
				backHref: '/payslips'
			};
		}
		if (currentPath.startsWith('/payroll/') && currentPath !== '/payroll') {
			return {
				title: 'Payroll Run Batch',
				breadcrumb: 'Dashboard / Payroll / Run Batch',
				backHref: '/payroll'
			};
		}
		if (currentPath.startsWith('/departments/') && currentPath !== '/departments') {
			return {
				title: 'Department Unit Details',
				breadcrumb: 'Dashboard / Departments / Department Details',
				backHref: '/departments'
			};
		}
		if (currentPath === '/departments') {
			return { title: 'Departments & Organization Units', breadcrumb: 'Dashboard / Departments & Leads' };
		}
		if (currentPath === '/employees') {
			return { title: 'Employees', breadcrumb: 'Dashboard / Employees' };
		}
		if (currentPath === '/calendar') {
			return { title: 'Team Calendar', breadcrumb: 'Dashboard / Calendar & Schedule' };
		}
		if (currentPath === '/payroll') {
			return { title: 'Payroll Overview', breadcrumb: 'Dashboard / Payroll Overview' };
		}
		if (currentPath === '/leave') {
			return { title: 'Leave Management', breadcrumb: 'Dashboard / Leave Management' };
		}
		if (currentPath === '/payslips') {
			return { title: 'Payslips & Statements', breadcrumb: 'Dashboard / Payslips & Vouchers' };
		}
		if (currentPath === '/notices') {
			return { title: 'Company Notices & Hub', breadcrumb: 'Dashboard / Notifications & Notices' };
		}
		return { title: 'Dashboard', breadcrumb: 'Dashboard / Overview' };
	});
</script>

<header class="sticky top-0 z-20 flex h-20 items-center justify-between bg-surface-page/90 backdrop-blur-md px-6 lg:px-8 border-b border-slate-200/50">
	<!-- Left: Interactive Dynamic Page Title & Breadcrumb -->
	<div class="flex items-center gap-3.5">
		{#if pageMeta.backHref}
			<a
				href={pageMeta.backHref}
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors"
				title="Go back"
			>
				<ArrowLeft size={16} weight="bold" />
			</a>
		{/if}

		<div>
			<h1 class="text-xl font-bold tracking-tight text-slate-900 leading-none">
				{pageMeta.title}
			</h1>
			<p class="text-[11px] font-semibold text-slate-400 mt-1">
				{pageMeta.breadcrumb}
			</p>
		</div>
	</div>

	<!-- Right: Search Box BEFORE Settings & Notification (Exact Reference Mockup Sequence) -->
	<div class="flex items-center gap-3">
		<!-- 1. Search Box (White Pill Card with Search Icon) -->
		<div class="relative hidden sm:block w-48 sm:w-60 md:w-72">
			<MagnifyingGlass size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="Search anything"
				class="h-10 w-full rounded-2xl border border-slate-200/80 bg-white pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]/20 transition-all shadow-2xs"
			/>
		</div>

		<!-- 2. Settings Icon Button -->
		<button
			class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
			title="Settings"
		>
			<GearSix size={18} />
		</button>

		<!-- 3. Notification Bell Button with Live Unread Counter -->
		<a
			href="/notices"
			class="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 hover:text-[#00C48C] hover:border-[#00C48C] hover:bg-slate-50 transition-colors shadow-2xs"
			title="Notifications & Company Notices"
		>
			<Bell size={18} />
			{#if unreadNoticesCount > 0}
				<span class="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00C48C] px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-white">
					{unreadNoticesCount}
				</span>
			{:else}
				<span class="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#00C48C] ring-2 ring-white"></span>
			{/if}
		</a>

		<!-- 4. User Profile Widget (Clickable Link to View Profile for All Roles) -->
		<a
			href={employeeId ? `/employees/${employeeId}` : '/profile'}
			class="flex items-center gap-3 pl-1 pr-2 py-1 rounded-2xl hover:bg-white/80 hover:shadow-2xs border border-transparent hover:border-slate-200/60 transition-all cursor-pointer"
			title="View My Profile"
		>
			<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00C48C] text-white font-bold text-sm shadow-xs ring-2 ring-emerald-100">
				{getInitials(userName)}
			</div>

			<div class="text-left hidden md:block">
				<p class="text-xs font-bold text-slate-900 leading-tight">{userName}</p>
				<p class="text-[10px] text-slate-400 font-semibold capitalize mt-0.5">{userRole.replace('_', ' ')}</p>
			</div>

			<CaretDown size={13} class="text-slate-400 hidden md:block" />
		</a>

		<!-- 5. Sign Out Button -->
		<button
			onclick={handleSignOut}
			class="ml-1 flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
			title="Sign out"
		>
			<SignOut size={18} />
		</button>
	</div>
</header>
