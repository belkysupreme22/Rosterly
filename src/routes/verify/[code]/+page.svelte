<script lang="ts">
	import {
		SealCheck,
		Buildings,
		User,
		IdentificationBadge,
		Money,
		CalendarCheck,
		ShieldCheck
	} from 'phosphor-svelte';

	interface Props {
		data: {
			document: {
				id: string;
				type: string;
				purpose: string | null;
				verificationCode: string;
				recipientOrganization: string | null;
				createdAt: string;
				employee: {
					fullName: string;
					role: string;
					employmentType: string;
					positionLevel: string;
					baseSalary: string;
					company: {
						name: string;
						tin: string;
					};
				};
			};
		};
	}

	let { data }: Props = $props();

	function formatCurrency(amount: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'ETB',
			minimumFractionDigits: 2
		}).format(Number(amount));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Official Document Verification — Rosterly</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
	<div class="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">
		<!-- Verified Header Banner -->
		<div class="bg-gradient-to-r from-emerald-600 to-[#00C48C] px-6 py-6 text-white text-center relative">
			<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner mb-3">
				<SealCheck size={32} weight="fill" />
			</div>
			<span class="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
				<ShieldCheck size={14} weight="bold" />
				Officially Verified Authentic
			</span>
			<h1 class="text-xl font-bold mt-1">Official Employment &amp; Salary Certificate</h1>
			<p class="text-xs text-white/80 font-mono mt-1">Token: {data.document.verificationCode}</p>
		</div>

		<!-- Certificate Content Body -->
		<div class="p-6 sm:p-8 space-y-6">
			<!-- Company Info -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-4">
				<div>
					<span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Issuing Employer</span>
					<p class="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
						<Buildings size={18} class="text-[#00C48C]" />
						{data.document.employee.company.name}
					</p>
				</div>
				<div class="text-right">
					<span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tax Identification (TIN)</span>
					<p class="text-xs font-mono font-bold text-slate-700 mt-0.5">{data.document.employee.company.tin}</p>
				</div>
			</div>

			<!-- Employee Core Information -->
			<div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
				<div>
					<span class="text-slate-400 font-medium">Employee Full Name:</span>
					<p class="text-sm font-bold text-slate-900 mt-0.5">{data.document.employee.fullName}</p>
				</div>
				<div>
					<span class="text-slate-400 font-medium">Designated Role &amp; Level:</span>
					<p class="text-xs font-bold text-slate-800 capitalize mt-0.5">
						{data.document.employee.role.replace('_', ' ')} &bull; {data.document.employee.positionLevel}
					</p>
				</div>
				<div>
					<span class="text-slate-400 font-medium">Employment Type:</span>
					<p class="text-xs font-semibold text-slate-800 capitalize mt-0.5">
						{data.document.employee.employmentType.replace('_', ' ')}
					</p>
				</div>
				<div>
					<span class="text-slate-400 font-medium">Monthly Gross Compensation:</span>
					<p class="text-sm font-bold text-emerald-700 font-mono mt-0.5">
						{formatCurrency(data.document.employee.baseSalary)}
					</p>
				</div>
			</div>

			<!-- Verification Meta Details -->
			<div class="space-y-2 text-xs border-t border-slate-100 pt-4 text-slate-600">
				{#if data.document.purpose}
					<div class="flex justify-between">
						<span class="text-slate-400 font-medium">Certified Purpose:</span>
						<span class="font-semibold text-slate-800">{data.document.purpose}</span>
					</div>
				{/if}
				{#if data.document.recipientOrganization}
					<div class="flex justify-between">
						<span class="text-slate-400 font-medium">Addressed Recipient:</span>
						<span class="font-semibold text-slate-800">{data.document.recipientOrganization}</span>
					</div>
				{/if}
				<div class="flex justify-between">
					<span class="text-slate-400 font-medium">Date of Issue:</span>
					<span class="font-semibold text-slate-800">{formatDate(data.document.createdAt)}</span>
				</div>
			</div>

			<!-- Footer Security Notice -->
			<div class="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
				<p class="text-[11px] text-emerald-900 font-medium">
					This electronic verification record is cryptographically signed and stored on the <strong>Rosterly Cloud Engine</strong>. It confirms that the subject is currently in good standing with the issuing organization.
				</p>
			</div>
		</div>
	</div>
</div>
