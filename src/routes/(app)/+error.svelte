<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import {
		MagnifyingGlass,
		WarningCircle,
		House,
		LockKey,
		ArrowUUpLeft
	} from 'phosphor-svelte';

	const status = $derived(page.status || 404);
	const message = $derived(page.error?.message || 'An error occurred.');

	const is403 = $derived(status === 403);
	const is404 = $derived(status === 404);

	function goBack() {
		if (typeof window !== 'undefined') {
			window.history.back();
		}
	}
</script>

<div class="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center p-4 sm:p-6 text-center">
	<div class="w-full max-w-lg space-y-6">
		<!-- Error Icon Badge with Aesthetic Glow -->
		<div class="relative mx-auto flex h-24 w-24 items-center justify-center">
			{#if is403}
				<div class="absolute inset-0 rounded-full bg-amber-400/20 blur-xl"></div>
				<div class="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 border border-amber-200/80 text-amber-600 shadow-sm">
					<LockKey size={40} weight="duotone" />
				</div>
			{:else if is404}
				<div class="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl"></div>
				<div class="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 border border-emerald-200/80 text-[#00C48C] shadow-sm">
					<MagnifyingGlass size={40} weight="duotone" />
				</div>
			{:else}
				<div class="absolute inset-0 rounded-full bg-rose-400/20 blur-xl"></div>
				<div class="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 border border-rose-200/80 text-rose-600 shadow-sm">
					<WarningCircle size={40} weight="duotone" />
				</div>
			{/if}
		</div>

		<!-- Status Code & Title -->
		<div>
			<span
				class="inline-block rounded-full px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase shadow-2xs mb-3
					   {is403
					? 'bg-amber-100/80 text-amber-900 border border-amber-200'
					: is404
						? 'bg-emerald-100/80 text-emerald-900 border border-emerald-200'
						: 'bg-rose-100/80 text-rose-900 border border-rose-200'}"
			>
				HTTP Error {status}
			</span>

			<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
				{#if is403}
					Access Restricted &bull; Insufficient Clearance
				{:else if is404}
					Page or Resource Not Found
				{:else}
					Unexpected Application Error
				{/if}
			</h1>

			<p class="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
				{#if is403}
					You do not have administrative clearance to access this financial or workforce module.
				{:else if is404}
					The page, employee profile, or department record you requested does not exist or has been moved.
				{:else}
					An internal error occurred while processing your request. Please try again later.
				{/if}
			</p>
		</div>

		<!-- Error Message Banner -->
		{#if message}
			<div
				class="rounded-2xl p-4 text-xs font-semibold text-left border flex items-start gap-3 shadow-2xs
					   {is403
					? 'bg-amber-50/70 border-amber-200 text-amber-950'
					: is404
						? 'bg-slate-50 border-slate-200 text-slate-700'
						: 'bg-rose-50 border-rose-200 text-rose-900'}"
			>
				<span class="text-base shrink-0 mt-0.5">
					{#if is403}🔒{:else if is404}🔍{:else}⚠️{/if}
				</span>
				<div class="flex-1">
					<p class="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-0.5">Server Message</p>
					<p class="font-mono text-[11px] leading-relaxed">{message}</p>
				</div>
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
			<Button variant="primary" onclick={() => (window.location.href = '/dashboard')}>
				<House size={16} weight="bold" />
				Return to Dashboard
			</Button>

			<Button variant="secondary" onclick={goBack}>
				<ArrowUUpLeft size={16} weight="bold" />
				Go Back
			</Button>
		</div>
	</div>
</div>
