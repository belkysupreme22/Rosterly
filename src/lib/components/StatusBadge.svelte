<script lang="ts">
  interface Props {
    status: string;
    size?: 'sm' | 'md' | 'lg';
  }

  let { status, size = 'sm' }: Props = $props();

  // Reactive normalization and styles
  const normalized = $derived(status?.toLowerCase() || '');

  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    pending_approval: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    disbursed: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', dot: 'bg-teal-500' },
    denied: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
    draft: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
    employee: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
    manager: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
    hr_admin: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', dot: 'bg-teal-600' },
    owner: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-600' }
  };

  const currentStyle = $derived(
    styles[normalized] || {
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-400'
    }
  );

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2'
  };

  const label = $derived(normalized.replace(/_/g, ' '));
</script>

<span
  class="inline-flex items-center rounded-full font-medium capitalize border {currentStyle.bg} {currentStyle.text} {sizeClasses[size]}"
>
  <span class="h-1.5 w-1.5 rounded-full {currentStyle.dot}"></span>
  {label}
</span>
