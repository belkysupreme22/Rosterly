<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		name: string;
		type?: string;
		value?: string | number;
		placeholder?: string;
		error?: string;
		hint?: string;
		prefixText?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		leadingIcon?: Snippet;
		trailingIcon?: Snippet;
	}

	let {
		label,
		name,
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		error,
		hint,
		prefixText,
		required = false,
		disabled = false,
		class: className = '',
		leadingIcon,
		trailingIcon
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
		{#if leadingIcon}
			<div class="pl-3.5 pr-1 text-slate-400 flex items-center justify-center">
				{@render leadingIcon()}
			</div>
		{/if}

		{#if prefixText}
			<span class="pl-3.5 pr-1 text-xs font-bold font-mono text-slate-400 select-none">
				{prefixText}
			</span>
		{/if}

		<input
			{type}
			{name}
			id={name}
			bind:value
			{placeholder}
			{required}
			{disabled}
			class="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed font-medium"
		/>

		{#if trailingIcon}
			<div class="pr-3.5 pl-1 text-slate-400 flex items-center justify-center">
				{@render trailingIcon()}
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
			<span>⚠️</span> {error}
		</p>
	{/if}
</div>
