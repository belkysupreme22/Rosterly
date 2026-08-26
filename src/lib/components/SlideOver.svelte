<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'phosphor-svelte';

  interface Props {
    open: boolean;
    title: string;
    children: Snippet;
  }

  let { open = $bindable(false), title, children }: Props = $props();

  function close() {
    open = false;
  }
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-black/30 transition-opacity"
    onclick={close}
    onkeydown={(e) => e.key === 'Escape' && close()}
    role="button"
    tabindex="-1"
  ></div>

  <!-- Panel -->
  <div class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-lg flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-border">
      <h2 class="text-lg font-semibold text-text-primary">{title}</h2>
      <button
        onclick={close}
        class="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
      >
        <X size={20} />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-6 py-4">
      {@render children()}
    </div>
  </div>
{/if}
