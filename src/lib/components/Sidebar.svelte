<script lang="ts">
	import {
		House,
		Users,
		CalendarCheck,
		Receipt,
		CurrencyCircleDollar,
		CalendarBlank,
		TreeStructure,
		Sparkle
	} from 'phosphor-svelte';

	interface NavItem {
		label: string;
		href: string;
		icon: any;
		roles: string[];
	}

	interface Props {
		currentPath: string;
		userRole: string;
	}

	let { currentPath, userRole }: Props = $props();

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/dashboard', icon: House, roles: ['employee', 'manager', 'hr_admin', 'owner'] },
		{ label: 'Calendar', href: '/calendar', icon: CalendarBlank, roles: ['employee', 'manager', 'hr_admin', 'owner'] },
		{ label: 'Employees', href: '/employees', icon: Users, roles: ['hr_admin', 'owner'] },
		{ label: 'Payroll', href: '/payroll', icon: CurrencyCircleDollar, roles: ['manager', 'hr_admin', 'owner'] },
		{ label: 'Leave Management', href: '/leave', icon: CalendarCheck, roles: ['employee', 'manager', 'hr_admin', 'owner'] },
		{ label: 'Payslips', href: '/payslips', icon: Receipt, roles: ['employee', 'manager', 'hr_admin', 'owner'] }
	];

	const visibleItems = $derived(navItems.filter((item) => item.roles.includes(userRole)));

	function isActive(href: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<aside class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200/80 bg-white">
	<!-- Rosterly Logo Header -->
	<div class="flex h-20 items-center gap-3 px-6 border-b border-slate-100">
		<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00C48C] text-white shadow-sm font-bold text-lg">
			<TreeStructure size={22} weight="fill" />
		</div>
		<div>
			<span class="text-xl font-bold tracking-tight text-slate-900">Rosterly</span>
			<span class="block text-[10px] font-semibold text-[#00C48C] uppercase tracking-wider">Payroll &amp; HR</span>
		</div>
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
		{#each visibleItems as item}
			{@const active = isActive(item.href)}
			{@const Icon = item.icon}
			<a
				href={item.href}
				class="flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-medium transition-all
					   {active
						 ? 'bg-[#00C48C] text-white shadow-sm font-semibold'
						 : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}"
			>
				<Icon size={20} weight={active ? 'bold' : 'regular'} />
				{item.label}
			</a>
		{/each}
	</nav>

	<!-- Level Up Your HR System Promo Card -->
	<div class="p-4 border-t border-slate-100">
		<div class="rounded-2xl bg-[#E8F8EE] p-4 border border-emerald-200/70">
			<h4 class="text-xs font-bold text-emerald-950">Level Up Your HR System</h4>
			<p class="mt-1 text-[11px] text-emerald-800/80 leading-relaxed">
				Rosterly Pro gives you full control with advanced Ethiopian tax modules.
			</p>
			<a
				href="/payroll"
				class="mt-3 block w-full rounded-xl bg-[#00C48C] hover:bg-[#00b07d] text-center py-2 text-xs font-bold text-white shadow-xs transition-colors"
			>
				Get Rosterly Pro
			</a>
		</div>
	</div>
</aside>
