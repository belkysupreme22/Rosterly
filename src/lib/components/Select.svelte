<script lang="ts">
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
    required = false,
    disabled = false,
    class: className = ''
  }: Props = $props();
</script>

<div class="flex flex-col gap-1.5 {className}">
  {#if label}
    <label for={name} class="text-sm font-medium text-text-primary">
      {label}
      {#if required}
        <span class="text-danger">*</span>
      {/if}
    </label>
  {/if}
  <select
    {name}
    id={name}
    bind:value
    {required}
    {disabled}
    class="w-full rounded-md border px-3 py-2 text-sm text-text-primary bg-white
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
           disabled:bg-surface-dim disabled:cursor-not-allowed
           {error ? 'border-danger' : 'border-border'}"
  >
    <option value="" disabled>{placeholder}</option>
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
  {#if error}
    <p class="text-xs text-danger">{error}</p>
  {/if}
</div>
