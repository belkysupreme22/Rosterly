<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import {
		ShieldWarning,
		MagnifyingGlass,
		WarningCircle,
		House,
		LockKey,
		ArrowUUpLeft,
		TreeStructure
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

<div class="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 text-center">
	<div class="w-full max-w-md space-y-6">
		<!-- Brand Logo Header -->
		<div class="mb-4">
			<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[#00C48C] text-white shadow-md mb-2">
				<TreeStructure size={28} weight="fill" />
			</div>
			<span class="text-xl font-bold tracking-tight text-slate-900">Rosterly</span>
		</div>

		<!-- Error Card -->
		<div class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
			<!-- Icon -->
			<div class="relative mx-auto flex h-20 w-20 items-center justify-center">
				{#if is403}
					<div class="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 shadow-xs">
						<LockKey size={32} weight="duotone" />
					</div>
				{:else if is404}
					<div class="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 border border-emerald-200 text-[#00C48C] shadow-xs">
						<MagnifyingGlass size={32} weight="duotone" />
					</div>
				{:else}
					<div class="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 shadow-xs">
						<WarningCircle size={32} weight="duotone" />
					</div>
				{/if}
			</div>

			<!-- Status & Title -->
			<div>
				<span class="inline-block rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-600 mb-2">
					HTTP Error {status}
				</span>
				<h1 class="text-xl font-bold text-slate-900">
					{#if is403}
						Access Denied
					{:else if is404}
						Page Not Found
					{:else}
						Something Went Wrong
					{/if}
				</h1>
				<p class="mt-1 text-xs text-slate-500">
					{#if is403}
						You don't have permission to view this resource.
					{:else if is404}
						The page or link you followed could not be located.
					{:else}
						An unexpected server error occurred.
					{/if}
				</p>
			</div>

			<!-- Message -->
			{#if message}
				<div class="rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700 font-mono border border-slate-200 text-left">
					{message}
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
				<Button variant="primary" class="w-full sm:w-auto" onclick={() => (window.location.href = '/dashboard')}>
					<House size={16} weight="bold" />
					Go to Dashboard
				</Button>
				<Button variant="secondary" class="w-full sm:w-auto" onclick={goBack}>
					<ArrowUUpLeft size={16} weight="bold" />
					Go Back
				</Button>
			</div>
		</div>
	</div>
</div>
