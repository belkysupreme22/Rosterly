<script lang="ts">
	import { CaretDown } from 'phosphor-svelte';

	interface SelectOption {
		value: string;
		label: string;
	}

	interface Props {
		label?: string;
		name: string;
		value?: string;
		options: SelectOption[];
		placeholder?: string;
		error?: string;
		hint?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
	}

	let {
		label,
		name,
		value = $bindable(''),
		options,
		placeholder = 'Select...',
		error,
		hint,
		required = false,
		disabled = false,
		class: className = ''
	}: Props = $props();
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<div class="flex items-center justify-between">
			<label for={name} class="text-xs font-bold text-slate-700 tracking-tight">
				{label}
				{#if required}
					<span class="text-rose-500 ml-0.5">*</span>
				{/if}
			</label>
			{#if hint}
				<span class="text-[11px] text-slate-400">{hint}</span>
			{/if}
		</div>
	{/if}

	<div
		class="relative flex items-center rounded-2xl border bg-slate-50/50 hover:bg-white focus-within:bg-white transition-all shadow-2xs overflow-hidden
			   {error
				 ? 'border-rose-300 ring-4 ring-rose-500/10'
				 : 'border-slate-200/80 focus-within:border-[#00C48C] focus-within:ring-4 focus-within:ring-[#00C48C]/15'}
			   {disabled ? 'bg-slate-100/80 cursor-not-allowed opacity-75' : ''}"
	>
		<select
			{name}
			id={name}
			bind:value
			{required}
			{disabled}
			class="w-full appearance-none bg-transparent pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none disabled:cursor-not-allowed font-medium cursor-pointer"
		>
			<option value="" disabled selected={!value}>{placeholder}</option>
			{#each options as opt}
				<option value={opt.value} class="py-1 text-slate-900 bg-white">{opt.label}</option>
			{/each}
		</select>

		<div class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
			<CaretDown size={14} weight="bold" />
		</div>
	</div>

	{#if error}
		<p class="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
			<span>⚠️</span> {error}
		</p>
	{/if}
</div>
