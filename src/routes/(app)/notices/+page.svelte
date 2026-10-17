<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import SlideOver from '$lib/components/SlideOver.svelte';
	import {
		Megaphone,
		Plus,
		CalendarBlank,
		Confetti,
		Money,
		ShieldWarning,
		CheckCircle,
		Bell,
		Sparkle
	} from 'phosphor-svelte';

	interface Props {
		data: {
			userRole: string;
			notices: Array<{
				id: string;
				title: string;
				content: string;
				category: string;
				priority: string;
				eventDate: string | null;
				requiresAcknowledgment: boolean;
				createdAt: string;
				company: { name: string };
				acknowledgments: Array<{
					id: string;
					employee: { fullName: string };
					acknowledgedAt: string;
				}>;
			}>;
			companies: Array<{ id: string; name: string }>;
		};
	}

	let { data }: Props = $props();

	const canBroadcast = $derived(data.userRole === 'hr_admin' || data.userRole === 'owner');

	let activeFilter = $state('all');
	const filters = ['all', 'holiday', 'payroll', 'policy', 'general'];

	const filteredNotices = $derived(
		activeFilter === 'all'
			? data.notices
			: data.notices.filter((n) => n.category === activeFilter)
	);

	// Create notice form state
	let showCreateModal = $state(false);
	let isSubmitting = $state(false);
	let formError = $state('');

	let title = $state('');
	let content = $state('');
	let category = $state('holiday');
	let priority = $state('normal');
	let eventDate = $state('');
	let requiresAcknowledgment = $state(true);

	const categoryOptions = [
		{ value: 'holiday', label: 'Public Holiday Alert (Radar)' },
		{ value: 'payroll', label: 'Payroll & Disbursal Notice' },
		{ value: 'policy', label: 'Company Policy & Handbook Memo' },
		{ value: 'general', label: 'General Announcement / Townhall' }
	];

	const priorityOptions = [
		{ value: 'normal', label: 'Normal Priority' },
		{ value: 'high', label: 'High Priority (Highlighted)' },
		{ value: 'urgent', label: 'Urgent (Mandatory Read)' }
	];

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	async function handleAcknowledge(noticeId: string) {
		try {
			const res = await fetch('/api/notices', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'acknowledge', noticeId })
			});

			if (res.ok) {
				await invalidateAll();
			}
		} catch {
			// Silently fail
		}
	}

	async function handleCreateNotice(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		formError = '';

		try {
			const res = await fetch('/api/notices', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'create',
					companyId: data.companies[0]?.id,
					title,
					content,
					category,
					priority,
					eventDate: eventDate || null,
					requiresAcknowledgment
				})
			});

			if (!res.ok) {
				const err = await res.json();
				formError = err.message || 'Failed to publish notice';
				return;
			}

			// Reset form
			title = '';
			content = '';
			eventDate = '';
			showCreateModal = false;
			await invalidateAll();
		} catch {
			formError = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Top Action Bar -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<!-- Category Filter Pills -->
		<div class="flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 border border-slate-200/80 shadow-2xs">
			{#each filters as f}
				<button
					onclick={() => (activeFilter = f)}
					class="rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all
						   {activeFilter === f
							? 'bg-[#00C48C] text-white shadow-xs'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
				>
					{f === 'all' ? 'All Notices' : f}
				</button>
			{/each}
		</div>

		{#if canBroadcast}
			<Button variant="primary" onclick={() => (showCreateModal = true)}>
				<Plus size={16} weight="bold" />
				Publish Broadcast
			</Button>
		{/if}
	</div>

	<!-- Notices Stream Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		{#each filteredNotices as n (n.id)}
			<div
				class="rounded-3xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md
					   {n.priority === 'urgent'
						? 'border-rose-300 bg-rose-50/20'
						: n.category === 'holiday'
							? 'border-emerald-200 bg-gradient-to-br from-[#E8F8EE]/60 to-white'
							: 'border-slate-200/80'}"
			>
				<div>
					<!-- Card Header -->
					<div class="flex items-start justify-between gap-3 mb-3">
						<div class="flex items-center gap-2">
							{#if n.category === 'holiday'}
								<span class="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
									<Confetti size={18} weight="bold" />
								</span>
							{:else if n.category === 'payroll'}
								<span class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
									<Money size={18} weight="bold" />
								</span>
							{:else if n.category === 'policy'}
								<span class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
									<ShieldWarning size={18} weight="bold" />
								</span>
							{:else}
								<span class="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
									<Megaphone size={18} weight="bold" />
								</span>
							{/if}

							<div>
								<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									{n.category.replace('_', ' ')}
								</span>
								<p class="text-[11px] font-medium text-slate-400">
									Posted {formatDate(n.createdAt)}
								</p>
							</div>
						</div>

						<!-- Priority Pill -->
						{#if n.priority === 'urgent'}
							<span class="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200">
								Urgent Action
							</span>
						{:else if n.priority === 'high'}
							<span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
								Important
							</span>
						{/if}
					</div>

					<!-- Title & Content -->
					<h3 class="text-base font-bold text-slate-900 leading-snug mb-2">{n.title}</h3>
					<p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-4">
						{n.content}
					</p>

					<!-- Event Date Banner (e.g. Holiday Radar) -->
					{#if n.eventDate}
						<div class="flex items-center gap-2 rounded-2xl bg-white border border-emerald-200/80 px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-2xs mb-4">
							<CalendarBlank size={16} class="text-[#00C48C]" weight="bold" />
							<span>Event Date: {formatDate(n.eventDate)}</span>
						</div>
					{/if}
				</div>

				<!-- Card Footer: Acknowledgment & Actions -->
				<div class="border-t border-slate-100 pt-4 mt-2 flex items-center justify-between">
					<div class="text-[11px] text-slate-400 font-medium">
						<span>{n.acknowledgments.length} acknowledged</span>
					</div>

					{#if n.requiresAcknowledgment}
						<button
							onclick={() => handleAcknowledge(n.id)}
							class="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-[#E8F8EE] text-slate-700 hover:text-[#00C48C] px-3 py-1.5 text-xs font-bold transition-colors"
						>
							<CheckCircle size={15} weight="bold" />
							Acknowledge Read
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<div class="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
				<Megaphone size={36} class="mx-auto mb-2 opacity-50" />
				<p class="text-sm font-semibold">No notices published in this category.</p>
			</div>
		{/each}
	</div>
</div>

<!-- Publish Broadcast SlideOver -->
<SlideOver
	bind:open={showCreateModal}
	title="Publish Broadcast Announcement"
	subtitle="Send company-wide holiday alert, payday memo, or policy directive"
>
	<form onsubmit={handleCreateNotice} class="space-y-5">
		{#if formError}
			<div class="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
				<span>⚠️</span>
				<span>{formError}</span>
			</div>
		{/if}

		<Input
			label="Announcement Title"
			name="title"
			bind:value={title}
			required
			placeholder="e.g. Enkutatash Ethiopian New Year Holiday Notice"
		/>

		<!-- Category Chips -->
		<div class="space-y-2">
			<label class="text-xs font-bold text-slate-700 tracking-tight">Category *</label>
			<div class="grid grid-cols-2 gap-2">
				{#each [
					{ id: 'holiday', label: '🎉 Holiday Alert', desc: 'Radar schedule' },
					{ id: 'payroll', label: '💰 Payday Notice', desc: 'Disbursal memo' },
					{ id: 'policy', label: '🛡️ Policy & Handbook', desc: 'Compliance' },
					{ id: 'general', label: '📢 General News', desc: 'Townhall & Events' }
				] as cat}
					<button
						type="button"
						onclick={() => (category = cat.id)}
						class="flex flex-col items-start rounded-2xl border p-3 text-left transition-all cursor-pointer
							   {category === cat.id
								 ? 'border-[#00C48C] bg-[#E8F8EE] ring-2 ring-[#00C48C]/20 shadow-xs'
								 : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300'}"
					>
						<span class="text-xs font-bold text-slate-900">{cat.label}</span>
						<span class="text-[10px] text-slate-400 mt-0.5">{cat.desc}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Priority Chips -->
		<div class="space-y-2">
			<label class="text-xs font-bold text-slate-700 tracking-tight">Priority Level *</label>
			<div class="grid grid-cols-3 gap-2">
				{#each [
					{ id: 'normal', label: 'Normal', color: 'border-slate-200 text-slate-700' },
					{ id: 'high', label: 'Important', color: 'border-amber-200 bg-amber-50 text-amber-800' },
					{ id: 'urgent', label: '🚨 Urgent', color: 'border-rose-200 bg-rose-50 text-rose-800' }
				] as pri}
					<button
						type="button"
						onclick={() => (priority = pri.id)}
						class="rounded-xl border py-2 px-3 text-center text-xs font-bold transition-all cursor-pointer
							   {priority === pri.id
								 ? 'border-[#00C48C] bg-[#00C48C] text-white shadow-xs'
								 : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-white'}"
					>
						{pri.label}
					</button>
				{/each}
			</div>
		</div>

		<Input
			label="Event Date (Radar Schedule)"
			name="eventDate"
			type="date"
			bind:value={eventDate}
			hint="Optional holiday/event date"
		/>

		<!-- Content Textarea -->
		<div class="flex flex-col gap-1.5">
			<label for="notice-content" class="text-xs font-bold text-slate-700">Notice Body Content *</label>
			<textarea
				id="notice-content"
				rows={5}
				bind:value={content}
				required
				placeholder="Type full broadcast details here..."
				class="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-[#00C48C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#00C48C]/15 transition-all shadow-2xs"
			></textarea>
		</div>

		<div class="flex items-center gap-2.5 rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-200/70">
			<input
				type="checkbox"
				id="req-ack"
				bind:checked={requiresAcknowledgment}
				class="h-4 w-4 rounded-md text-[#00C48C] focus:ring-[#00C48C] accent-[#00C48C] cursor-pointer"
			/>
			<label for="req-ack" class="text-xs font-semibold text-emerald-950 cursor-pointer">
				Require staff to click "Read &amp; Acknowledged"
			</label>
		</div>

		<div class="flex gap-3 pt-4 border-t border-slate-100">
			<Button type="submit" variant="primary" class="flex-1" disabled={isSubmitting}>
				{isSubmitting ? 'Publishing...' : 'Broadcast Announcement'}
			</Button>
			<Button type="button" variant="secondary" onclick={() => (showCreateModal = false)}>
				Cancel
			</Button>
		</div>
	</form>
</SlideOver>
