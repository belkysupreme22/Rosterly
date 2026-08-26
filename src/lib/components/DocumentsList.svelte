<script lang="ts">
	import { DotsThree, FilePdf } from 'phosphor-svelte';

	interface DocItem {
		name: string;
		type: string;
		size: string;
	}

	const docs: DocItem[] = [
		{ name: 'Performance Evaluatio...', type: 'PDF', size: '1.24 MB' },
		{ name: 'Contract Agreement.pdf', type: 'PDF', size: '895 KB' },
		{ name: 'Curriculum Vitae.pdf', type: 'PDF', size: '1.27 MB' },
		{ name: 'Portfolio.pdf', type: 'PDF', size: '3.68 MB' }
	];
</script>

<div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
	<!-- Header -->
	<div class="flex items-center justify-between mb-3">
		<h4 class="text-xs font-bold text-slate-900">Documents</h4>
		<button class="text-slate-400 hover:text-slate-700 transition-colors p-1">
			<DotsThree size={18} weight="bold" />
		</button>
	</div>

	<!-- Document Rows -->
	<div class="space-y-2.5">
		{#each docs as doc}
			<div class="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
				<!-- Green PDF Icon Box -->
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F8EE] text-[#00C48C]">
					<FilePdf size={20} weight="fill" />
				</div>

				<div class="min-w-0 flex-1">
					<p class="truncate text-xs font-semibold text-slate-800">{doc.name}</p>
					<p class="text-[10px] text-slate-400 font-medium mt-0.5">{doc.type} &bull; {doc.size}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
