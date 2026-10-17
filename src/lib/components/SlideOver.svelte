<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from 'phosphor-svelte';

	interface Props {
		open: boolean;
		title: string;
		subtitle?: string;
		children: Snippet;
	}

	let { open = $bindable(false), title, subtitle, children }: Props = $props();

	function close() {
		open = false;
	}
</script>

{#if open}
	<!-- Backdrop with smooth blur -->
	<div
		class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
		onclick={close}
		onkeydown={(e) => e.key === 'Escape' && close()}
		role="button"
		tabindex="-1"
	></div>

	<!-- Drawer Panel -->
	<div
		class="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200/80 sm:rounded-l-3xl overflow-hidden transition-transform duration-300 ease-out"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
			<div>
				<h2 class="text-base font-bold text-slate-900">{title}</h2>
				{#if subtitle}
					<p class="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>
				{/if}
			</div>
			<button
				onclick={close}
				class="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
				title="Close panel"
			>
				<X size={18} weight="bold" />
			</button>
		</div>

		<!-- Form / Body Content -->
		<div class="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
			{@render children()}
		</div>
	</div>
{/if}
