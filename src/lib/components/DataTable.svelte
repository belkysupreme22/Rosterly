<script lang="ts" generics="T extends Record<string, any>">
  import type { Snippet } from 'svelte';

  interface Column {
    key: string;
    label: string;
    class?: string;
  }

  interface Props {
    columns: Column[];
    rows: T[];
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
    renderCell?: Snippet<[{ row: T; column: Column }]>;
  }

  let {
    columns,
    rows,
    onRowClick,
    emptyMessage = 'No data to display.',
    renderCell
  }: Props = $props();
</script>

<div class="overflow-x-auto rounded-lg border border-border bg-white">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-border bg-surface-dim">
        {#each columns as col}
          <th class="px-4 py-3 text-left font-medium text-text-secondary {col.class || ''}">
            {col.label}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, i (i)}
        <tr
          class="border-b border-border last:border-b-0 transition-colors
                 {onRowClick ? 'cursor-pointer hover:bg-surface-active' : 'hover:bg-surface-hover'}"
          onclick={() => onRowClick?.(row)}
        >
          {#each columns as col}
            <td class="px-4 py-3 text-text-primary {col.class || ''}">
              {#if renderCell}
                {@render renderCell({ row, column: col })}
              {:else}
                {row[col.key] ?? '—'}
              {/if}
            </td>
          {/each}
        </tr>
      {:else}
        <tr>
          <td colspan={columns.length} class="px-4 py-8 text-center text-text-muted">
            {emptyMessage}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
