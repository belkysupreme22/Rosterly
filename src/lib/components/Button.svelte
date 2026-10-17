<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-[#00C48C]/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

	const variantClasses = {
		primary: 'bg-[#00C48C] hover:bg-[#00b07d] active:bg-[#009b6e] text-white font-bold shadow-xs active:scale-[0.99]',
		secondary:
			'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 font-semibold shadow-2xs active:scale-[0.99]',
		danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold shadow-xs active:scale-[0.99]',
		ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
	};

	const sizeClasses = {
		sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
		md: 'px-4.5 py-2.5 text-xs sm:text-sm rounded-2xl gap-2',
		lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5'
	};
</script>

<button
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}"
	{...rest}
>
	{@render children()}
</button>
