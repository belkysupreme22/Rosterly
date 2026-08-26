<script lang="ts">
	import { DotsThree } from 'phosphor-svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between {className}">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<h4 class="text-xs font-bold text-slate-900">Internal Notes</h4>
		<button class="text-slate-400 hover:text-slate-700 transition-colors p-1">
			<DotsThree size={18} weight="bold" />
		</button>
	</div>

	<!-- Notes Grid (2 Columns) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
		<!-- Note 1 -->
		<div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
			<div>
				<span class="text-xs font-bold text-slate-900 block">Promotion Feedback</span>
				<span class="text-[10px] text-slate-400 font-medium mt-0.5 block">10 January 2035</span>
				<p class="text-xs text-slate-600 mt-2 leading-relaxed">
					Promoted from HR Assistant to HR Officer due to consistent performance and leadership in onboarding initiatives.
				</p>
			</div>
		</div>

		<!-- Note 2 -->
		<div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
			<div>
				<span class="text-xs font-bold text-slate-900 block">Employee Appreciation</span>
				<span class="text-[10px] text-slate-400 font-medium mt-0.5 block">02 May 2035</span>
				<p class="text-xs text-slate-600 mt-2 leading-relaxed">
					Recognized by the Head of HR for successfully leading the Q2 training rollout with a 98% participation rate.
				</p>
			</div>
		</div>
	</div>
</div>
