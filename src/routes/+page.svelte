<script lang="ts">
	import {
		TreeStructure,
		ArrowRight,
		GithubLogo,
		Check,
		Copy,
		Terminal,
		Sliders,
		Shield,
		Coins,
		DownloadSimple,
		PaperPlaneRight,
		Buildings,
		CheckCircle,
		Lightning,
		Cpu,
		Clock,
		ArrowsClockwise,
		Bank,
		Scales,
		FileText,
		CaretDown
	} from 'phosphor-svelte';
	import { authClient } from '$lib/auth-client';

	const GITHUB_URL = 'https://github.com/belkysupreme22/Rosterly';

	// ── Inngest-Style Workflow Pipeline Visualizer (Visual Only, No Code) ──
	let activePipelineStep = $state<number>(3); // default highlight on approval step

	const workflowSteps = [
		{
			id: 1,
			type: 'trigger',
			name: 'payroll/monthly.cutoff',
			badge: 'Trigger',
			duration: '09:00:00 EAT',
			status: 'Dispatched',
			description: 'Fired on the 25th of every month. Freezes attendance, unpaid absences, and salary advances.',
			meta: {
				payload: '{ companyId: "ETH-ROSTERLY-01", cycle: "2026-09", cutoffDay: 25 }',
				scope: 'Automated Event Trigger'
			}
		},
		{
			id: 2,
			type: 'step',
			name: 'compute-mor-statutory-taxes',
			badge: 'Pure Engine',
			duration: '1.4ms',
			status: 'Completed',
			description: 'Evaluates all 18 staff against the 7 Ministry of Revenue progressive income tax brackets.',
			meta: {
				engine: '@rosterly/payroll-engine (deterministic TypeScript)',
				output: 'Gross: ETB 378,300.00 • MoR Tax Pool: ETB 68,410.00'
			}
		},
		{
			id: 3,
			type: 'step',
			name: 'compute-pension-contributions',
			badge: 'Directive 979',
			duration: '0.8ms',
			status: 'Completed',
			description: 'Applies mandatory 7% employee contribution (tax-exempt) + 11% employer match.',
			meta: {
				employeeFund: '7% (ETB 26,481.00)',
				employerFund: '11% (ETB 41,613.00)',
				totalFiling: 'ETB 68,094.00 to Pension Agency (POESSA)'
			}
		},
		{
			id: 4,
			type: 'gate',
			name: 'fiduciary-signoff-gate',
			badge: 'RBAC Gate',
			duration: 'Pending',
			status: 'Awaiting Owner Authorization',
			description: 'Separation of duties: Finance has drafted the cycle; waiting for Managing Director sole approval.',
			meta: {
				authorizedRole: 'Managing Director (owner@acme.com)',
				fiduciaryAction: 'Audit draft run & authorize bank wire release'
			}
		},
		{
			id: 5,
			type: 'step',
			name: 'generate-cbe-bulk-batch',
			badge: 'Wire Batch',
			duration: 'Queued',
			status: 'Ready on Authorization',
			description: 'Exports Commercial Bank of Ethiopia CSV file ready for corporate banking batch portal.',
			meta: {
				format: 'CBE Corporate Wire Batch CSV (ISO 20022 compliant)',
				beneficiaries: '18 CBE account transfers'
			}
		}
	];

	const selectedStepObj = $derived(workflowSteps.find((s) => s.id === activePipelineStep) || workflowSteps[0]);

	// ── Live Interactive Tax Engine Simulator ────────────────────────────────
	let baseSalaryInput = $state(38000);
	let period = $state<'monthly' | 'annual'>('monthly');

	const salaryPresets = [
		{ label: 'Junior staff', amount: 14000 },
		{ label: 'Mid specialist', amount: 38000 },
		{ label: 'Senior lead', amount: 72000 },
		{ label: 'Director', amount: 120000 }
	];

	const calc = $derived.by(() => {
		const multiplier = period === 'annual' ? 12 : 1;
		const base = Math.max(0, Number(baseSalaryInput) || 0);

		// Monthly calculation baseline
		const monthlyPension = Math.round(base * 0.07 * 100) / 100;
		const monthlyEmployerPension = Math.round(base * 0.11 * 100) / 100;
		const taxableIncome = Math.max(0, base - monthlyPension);

		let monthlyTax = 0;
		let bracketLabel = '0% (Exempt)';
		if (taxableIncome <= 600) {
			monthlyTax = 0;
			bracketLabel = '0 – 600 ETB (0%)';
		} else if (taxableIncome <= 1650) {
			monthlyTax = taxableIncome * 0.1 - 60;
			bracketLabel = '601 – 1,650 ETB (10%)';
		} else if (taxableIncome <= 3200) {
			monthlyTax = taxableIncome * 0.15 - 142.5;
			bracketLabel = '1,651 – 3,200 ETB (15%)';
		} else if (taxableIncome <= 5250) {
			monthlyTax = taxableIncome * 0.2 - 302.5;
			bracketLabel = '3,201 – 5,250 ETB (20%)';
		} else if (taxableIncome <= 7800) {
			monthlyTax = taxableIncome * 0.25 - 565;
			bracketLabel = '5,251 – 7,800 ETB (25%)';
		} else if (taxableIncome <= 10900) {
			monthlyTax = taxableIncome * 0.3 - 955;
			bracketLabel = '7,801 – 10,900 ETB (30%)';
		} else {
			monthlyTax = taxableIncome * 0.35 - 1500;
			bracketLabel = '> 10,900 ETB (35%)';
		}

		monthlyTax = Math.max(0, Math.round(monthlyTax * 100) / 100);
		const monthlyNet = Math.max(0, Math.round((base - monthlyPension - monthlyTax) * 100) / 100);

		const displayBase = base * multiplier;
		const displayPension = monthlyPension * multiplier;
		const displayEmployerPension = monthlyEmployerPension * multiplier;
		const displayTax = monthlyTax * multiplier;
		const displayNet = monthlyNet * multiplier;

		const netPercent = base > 0 ? Math.round((monthlyNet / base) * 100) : 0;
		const taxPercent = base > 0 ? Math.round((monthlyTax / base) * 100) : 0;
		const pensionPercent = base > 0 ? Math.max(0, 100 - netPercent - taxPercent) : 0;

		return {
			base: displayBase,
			employeePension: displayPension,
			employerPension: displayEmployerPension,
			incomeTax: displayTax,
			bracketLabel,
			netPay: displayNet,
			netPercent,
			taxPercent,
			pensionPercent
		};
	});

	function formatETB(val: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'ETB',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(val);
	}

	// ── Feature Timeline Stepper (Left Rail + Right Interactive Panel) ─────────
	let activeTimelineStep = $state<number>(1);

	const timelineSteps = [
		{
			id: 1,
			number: '01',
			category: 'Statutory Taxes',
			title: 'Progressive Ministry of Revenue brackets',
			description: 'Evaluates each employee across Ethiopia’s 7 progressive income tax brackets with zero rounding drift.',
			badge: 'MoR Proclamation 979'
		},
		{
			id: 2,
			number: '02',
			category: 'Pension Directive',
			title: 'Mandatory private organization pension',
			description: 'Calculates the 7% employee tax-exempt deduction alongside the mandatory 11% employer contribution.',
			badge: 'POESSA Directive'
		},
		{
			id: 3,
			number: '03',
			category: 'Governance Gate',
			title: 'Strict separation of duties sign-off gate',
			description: 'Finance prepares and audits the cycle. Managing Director holds sole authority to authorize disbursement.',
			badge: 'Executive Gate'
		},
		{
			id: 4,
			number: '04',
			category: 'Banking Disbursement',
			title: 'Commercial Bank of Ethiopia direct batch',
			description: 'Generates ISO 20022 compliant corporate CSV batches directly uploadable to CBE Corporate Banking.',
			badge: 'CBE Wire Batch'
		}
	];

	// ── Interactive Role Switcher & Direct 1-Click Session Launcher ─────────
	type RoleKey = 'finance' | 'owner' | 'hr' | 'manager' | 'employee';
	let activeRole = $state<RoleKey>('finance');
	let isLoggingIn = $state(false);

	const roleMeta: Record<
		RoleKey,
		{
			title: string;
			email: string;
			tagline: string;
			workflowState: string;
			headline: string;
			stats: Array<{ label: string; value: string }>;
			actionText: string;
			badge: string;
		}
	> = {
		finance: {
			title: 'Finance & Treasury',
			email: 'finance@acme.com',
			tagline: 'Drafts payroll cycles, computes progressive tax withholdings, and exports CBE batch transfers.',
			workflowState: 'Pending Authorization',
			headline: 'Payroll run cycle #2026-09 • 18 employees',
			stats: [
				{ label: 'Gross disbursal', value: 'ETB 378,300.00' },
				{ label: 'MoR tax withholding', value: 'ETB 68,410.00' },
				{ label: 'Pension pool (7%+11%)', value: 'ETB 68,094.00' }
			],
			actionText: 'Instant launch as Finance',
			badge: 'Disbursement Controller'
		},
		owner: {
			title: 'Managing Director (Owner)',
			email: 'owner@acme.com',
			tagline: 'Fiduciary sign-off authority. Sole role permitted to authorize bank disbursements.',
			workflowState: 'Awaiting Authorization',
			headline: 'Monthly wire disbursal review',
			stats: [
				{ label: 'Authorized runs', value: '12 / 12 Cycles' },
				{ label: 'Compliance status', value: '100% Certified' },
				{ label: 'Pending approval', value: '1 Cycle' }
			],
			actionText: 'Instant launch as Owner',
			badge: 'Sole Authorization'
		},
		hr: {
			title: 'People & Culture',
			email: 'hr@acme.com',
			tagline: 'Staff directory, organizational hierarchy, leave quotas, and corporate announcements.',
			workflowState: 'Directory Active',
			headline: 'Workforce roster & department units',
			stats: [
				{ label: 'Active team', value: '18 Across 5 Depts' },
				{ label: 'Leave reviews', value: '4 Processed' },
				{ label: 'Hardware assets', value: '24 Tracked Units' }
			],
			actionText: 'Instant launch as HR Admin',
			badge: 'Directory & Policy'
		},
		manager: {
			title: 'Team Lead',
			email: 'manager@acme.com',
			tagline: 'Live attendance radar, department coverage calendar, and leave approvals.',
			workflowState: 'Coverage Nominal',
			headline: 'Engineering team board (8 members)',
			stats: [
				{ label: 'On leave today', value: '1 Member' },
				{ label: 'Pending requests', value: '2 Leave Reviews' },
				{ label: 'Coverage rate', value: '94.2%' }
			],
			actionText: 'Instant launch as Manager',
			badge: 'Team Lead'
		},
		employee: {
			title: 'Employee Portal',
			email: 'hana@acme.com',
			tagline: 'Personal payslip vouchers, annual leave tracking, and verified employment certificates.',
			workflowState: 'Portal Active',
			headline: 'Hana Mulugeta • Software Engineer',
			stats: [
				{ label: 'Annual leave balance', value: '14 Days Left' },
				{ label: 'Latest net take-home', value: 'ETB 22,657.50' },
				{ label: 'Verified letters', value: '1 Document Issued' }
			],
			actionText: 'Instant launch as Employee',
			badge: 'Self-Service'
		}
	};

	const currentRole = $derived(roleMeta[activeRole]);

	async function launchAsRole(email: string) {
		isLoggingIn = true;
		try {
			const res = await authClient.signIn.email({
				email,
				password: 'password123'
			});
			if (!res.error) {
				window.location.href = '/dashboard';
				return;
			}
		} catch (e) {
			// fallback
		}
		window.location.href = '/login';
	}

	// ── Interactive Telegram Simulator ──────────────────────────────────────
	let activeCommand = $state<'/payslip' | '/leave' | '/status' | '/letter'>('/payslip');

	const botResponses = {
		'/payslip': {
			cmd: '/payslip',
			replyTitle: '📄 September 2026 Payslip Voucher',
			details: [
				{ label: 'Base Gross', val: 'ETB 38,000.00' },
				{ label: 'Employee Pension (7%)', val: '-ETB 2,660.00' },
				{ label: 'Income Tax (MoR)', val: '-ETB 8,265.00' },
				{ label: 'Net Take-Home', val: 'ETB 27,075.00', highlight: true }
			],
			footer: 'Disbursal reference: SAL-2026-09 via CBE'
		},
		'/leave': {
			cmd: '/leave',
			replyTitle: '🏖️ Personal Leave Balance',
			details: [
				{ label: 'Annual quota', val: '20 Days' },
				{ label: 'Days utilized', val: '6 Days' },
				{ label: 'Available balance', val: '14 Days Remaining', highlight: true }
			],
			footer: 'Next public holiday: Enkutatash (Ethiopian New Year)'
		},
		'/status': {
			cmd: '/status',
			replyTitle: '🟢 Real-time Work Status Updated',
			details: [
				{ label: 'Current state', val: 'IN OFFICE', highlight: true },
				{ label: 'Office location', val: 'Addis Ababa HQ (Bole)' },
				{ label: 'Team calendar', val: 'Synced Across Board' }
			],
			footer: 'Status synced to department dashboard'
		},
		'/letter': {
			cmd: '/letter',
			replyTitle: '📜 Official Employment Certificate',
			details: [
				{ label: 'Verification code', val: 'ETH-VERIFY-2026-HANA', highlight: true },
				{ label: 'Recipient', val: 'To Whom It May Concern' },
				{ label: 'Anti-fraud status', val: 'Cryptographically Signed' }
			],
			footer: 'Scan QR or verify online: /verify/ETH-VERIFY-2026-HANA'
		}
	};

	const currentBot = $derived(botResponses[activeCommand]);

	// ── Interactive CBE Batch Clipboard ─────────────────────────────────────
	let copiedBatch = $state(false);
	function copyBatchCSV() {
		const snippet = `Beneficiary Account,Beneficiary Name,Amount (ETB),Currency,Payment Reference,Remarks
1000188923456,"Abebe Kebede",38200.00,ETB,SALARY-2026-09,"Executive Salary Disbursal"
1000299481203,"Hana Mulugeta",22657.50,ETB,SALARY-2026-09,"Engineering Staff Salary"
1000344810294,"Yonas Alemu",17821.50,ETB,SALARY-2026-09,"Operations Staff Salary"
1000455910283,"Dawit Bekele",29400.00,ETB,SALARY-2026-09,"Finance Officer Salary"`;
		navigator.clipboard.writeText(snippet);
		copiedBatch = true;
		setTimeout(() => (copiedBatch = false), 2200);
	}

	function downloadBatchCSV() {
		const snippet = `Beneficiary Account,Beneficiary Name,Amount (ETB),Currency,Payment Reference,Remarks\n1000188923456,"Abebe Kebede",38200.00,ETB,SALARY-2026-09,"Executive Salary Disbursal"\n1000299481203,"Hana Mulugeta",22657.50,ETB,SALARY-2026-09,"Engineering Staff Salary"\n1000344810294,"Yonas Alemu",17821.50,ETB,SALARY-2026-09,"Operations Staff Salary"\n1000455910283,"Dawit Bekele",29400.00,ETB,SALARY-2026-09,"Finance Officer Salary"`;
		const blob = new Blob([snippet], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('href', url);
		a.setAttribute('download', 'CBE_Payroll_Disbursal_Batch_2026_09.csv');
		a.click();
	}
</script>

<svelte:head>
	<title>Rosterly — The Durable Workforce &amp; Payroll Engine for Ethiopia</title>
	<meta
		name="description"
		content="Inngest-grade workflow observability, deterministic Ethiopian income tax brackets, CBE bulk wire transfers, and separation-of-duties governance."
	/>
</svelte:head>

<!-- Deep Matte Obsidian Canvas (#08090a) with Fine-Grit Sandpaper Feel and Controlled Brand Gradients -->
<div class="min-h-screen bg-[#08090a] inngest-paper text-[#f4f4f5] selection:bg-[#00C48C]/20 selection:text-white relative overflow-hidden font-sans">
	<!-- Fine-Grit Sandpaper Noise Overlay (Tactile Emery Tooth) -->
	<div class="pointer-events-none fixed inset-0 inngest-grain z-0 opacity-50"></div>

	<!-- Atmospheric Ambient Lighting (Controlled Soft Glows) -->
	<div class="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(0,196,140,0.06),transparent_70%)] blur-3xl"></div>
	<div class="pointer-events-none absolute top-[1800px] right-0 w-[600px] h-[500px] bg-[radial-gradient(circle,rgba(0,196,140,0.03),transparent_70%)] blur-3xl"></div>

	<!-- ── INNGEST-STYLE DOCKED HEADER (Blends seamlessly with the sandpaper background, no bottom border) ── -->
	<header class="sticky top-0 z-50 bg-transparent backdrop-blur-[6px] h-[88px] flex items-center transition-inngest">
		<div class="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 sm:px-12">
			<!-- Logo Area -->
			<div class="flex items-center gap-8">
				<a href="/" class="flex items-center gap-2.5 group">
					<div class="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#121316] border border-white/[0.08] text-white shadow-xs group-hover:border-[#00C48C]/40 transition-colors">
						<TreeStructure size={16} weight="fill" class="text-[#00C48C]" />
					</div>
					<span class="text-[15px] font-semibold tracking-tight text-zinc-100">Rosterly</span>
					<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00C48C]/[0.08] text-[#00C48C]/90 border border-[#00C48C]/20">v2.4</span>
				</a>

				<!-- Inngest Style Center Menu Items with subtle Carets -->
				<nav class="hidden lg:flex items-center gap-6 text-[13px] text-zinc-400">
					<a href="#pipeline" class="hover:text-zinc-100 flex items-center gap-1 transition-colors group">
						<span>Platform</span>
						<CaretDown size={11} class="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
					</a>
					<a href="#engine" class="hover:text-zinc-100 transition-colors">Tax engine</a>
					<a href="#timeline" class="hover:text-zinc-100 transition-colors">Compliance</a>
					<a href="#roles" class="hover:text-zinc-100 transition-colors">Governance</a>
					<a href="#roles" class="hover:text-zinc-100 transition-colors">Telegram</a>
				</nav>
			</div>

			<!-- Inngest Style Actions: GitHub Link + Open Workspace Button (No Fake Data) -->
			<div class="flex items-center gap-3">
				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white transition-inngest shadow-xs"
				>
					<GithubLogo size={14} weight="bold" />
					<span>GitHub</span>
				</a>

				<a
					href="/login"
					class="inline-flex items-center gap-1.5 rounded-[6px] bg-gradient-to-r from-[#00b884] via-[#00a876] to-[#009468] hover:brightness-105 active:scale-[0.99] text-[#051a14] font-semibold px-4 py-2 text-xs transition-inngest shadow-xs"
				>
					<span>Open workspace</span>
					<ArrowRight size={13} weight="bold" />
				</a>
			</div>
		</div>
	</header>

	<main class="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-12">
		<!-- ── INNGEST 2-COLUMN HERO (Matching Inngest desktop wireframe) ──── -->
		<section class="py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
			<!-- Hero Left Column: Headline, Subhead & Actions -->
			<div class="lg:col-span-6 flex flex-col items-start text-left">
				<!-- Announcement Pill -->
				<a
					href="#timeline"
					class="inline-flex items-center gap-2 rounded-full border border-[#00C48C]/20 bg-[#00C48C]/[0.05] hover:bg-[#00C48C]/[0.08] px-3.5 py-1 text-xs font-mono text-zinc-300 mb-6 transition-inngest"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-[#00C48C]/80 animate-pulse"></span>
					<span class="text-zinc-300 font-medium">Ethiopian MoR Proclamation 979/2016</span>
					<span class="text-zinc-600">&bull;</span>
					<span class="text-[#00C48C]">Directives &rarr;</span>
				</a>

				<!-- Main Headline -->
				<h1 class="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-[-0.035em] text-zinc-100 leading-[1.1] mb-6">
					The durable workforce &amp; payroll engine for Ethiopia.
				</h1>

				<!-- Subtext -->
				<p class="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed mb-8">
					Replace fragile Excel sheets and manual chat approvals with an audited, deterministic platform. Calculate progressive taxes, stream CBE wire batches, and empower staff over Telegram.
				</p>

				<!-- Action Buttons (Controlled contrast, soft gradients) -->
				<div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
					<a
						href="/login"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] bg-gradient-to-r from-[#00b884] via-[#00a876] to-[#009468] hover:brightness-105 active:scale-[0.99] text-[#051a14] font-semibold text-xs h-[42px] px-6 transition-inngest cursor-pointer shadow-sm"
					>
						<span>Explore pre-seeded company</span>
						<ArrowRight size={13} weight="bold" />
					</a>
					<a
						href="#engine"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] text-zinc-300 font-medium text-xs h-[42px] px-5 transition-inngest cursor-pointer"
					>
						<Sliders size={13} class="text-[#00C48C]" />
						<span>Test tax simulator</span>
					</a>
				</div>
			</div>

			<!-- Hero Right Column: Inngest-Style Visual Workflow Pipeline (Tactile Sandpaper Card in Emerald Tint) -->
			<div id="pipeline" class="lg:col-span-6 inngest-card sandpaper-card-emerald p-5 sm:p-6 relative overflow-hidden">
				<div class="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
					<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
						<Cpu size={15} />
						<span class="font-medium">Workflow execution pipeline</span>
					</div>
					<span class="text-[11px] font-mono text-zinc-400 px-2.5 py-0.5 rounded-full inngest-subcard">
						Cycle #2026-09
					</span>
				</div>

				<!-- Step Cards List -->
				<div class="space-y-2 mb-4">
					{#each workflowSteps as step}
						{@const isSelected = activePipelineStep === step.id}
						<button
							onclick={() => (activePipelineStep = step.id)}
							class="w-full text-left rounded-[6px] border p-3 transition-inngest cursor-pointer flex items-center justify-between
								   {isSelected
									 ? 'border-[#00C48C]/35 bg-[#00C48C]/[0.06] shadow-[inset_2px_0_0_0_#00C48C]'
									 : 'border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.1]'}"
						>
							<div class="flex items-center gap-3">
								<div class="h-2 w-2 rounded-full {isSelected ? 'bg-[#00C48C]/90 shadow-[0_0_8px_rgba(0,196,140,0.4)]' : 'bg-zinc-600'}"></div>
								<div>
									<div class="text-xs font-mono text-zinc-200">{step.name}</div>
									<div class="text-[10px] text-zinc-400 font-mono">{step.badge} &bull; {step.duration}</div>
								</div>
							</div>
							<div class="text-[11px] font-mono {isSelected ? 'text-[#00C48C]' : 'text-zinc-500'}">
								{step.status}
							</div>
						</button>
					{/each}
				</div>

				<!-- Live Step Inspector (Visual Log Viewer, Translucent Subcard) -->
				<div class="inngest-subcard p-4 font-mono text-xs">
					<div class="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.05]">
						<div class="flex items-center gap-2">
							<span class="h-1.5 w-1.5 rounded-full bg-[#00C48C]"></span>
							<span class="text-zinc-200 font-medium">{selectedStepObj.name}</span>
						</div>
						<span class="text-zinc-500 text-[10px]">ID: #{selectedStepObj.id}</span>
					</div>
					<p class="text-zinc-400 text-xs font-sans mb-3 leading-relaxed">
						{selectedStepObj.description}
					</p>
					<div class="bg-white/[0.02] border border-white/[0.05] rounded-[6px] p-2.5 text-[11px] space-y-1">
						{#each Object.entries(selectedStepObj.meta) as [key, val]}
							<div class="flex items-start gap-2">
								<span class="text-zinc-500 min-w-24 capitalize">{key}:</span>
								<span class="text-zinc-300 font-mono">{val}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- ── ENDLESS RAIL LOGO MARQUEE (Trust & Institutional Anchors) ────── -->
		<section class="border-y border-white/[0.05] py-5 my-12 bg-white/[0.01] overflow-hidden relative">
			<div class="animate-inngest-marquee flex items-center gap-12 text-xs font-mono text-zinc-400">
				<span class="flex items-center gap-2"><Bank size={15} class="text-[#00C48C]/70" /> Commercial Bank of Ethiopia (CBE Direct)</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><Scales size={15} class="text-[#00C48C]/70" /> Ministry of Revenue (MoR Proclamation 979)</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><Shield size={15} class="text-[#00C48C]/70" /> Pension Agency (POESSA Directives)</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><FileText size={15} class="text-[#00C48C]/70" /> ISO 20022 Corporate Wire Standard</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><Coins size={15} class="text-[#00C48C]/70" /> Telebirr Corporate Batch Gateway</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><Bank size={15} class="text-[#00C48C]/70" /> Commercial Bank of Ethiopia (CBE Direct)</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><Scales size={15} class="text-[#00C48C]/70" /> Ministry of Revenue (MoR Proclamation 979)</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><Shield size={15} class="text-[#00C48C]/70" /> Pension Agency (POESSA Directives)</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><FileText size={15} class="text-[#00C48C]/70" /> ISO 20022 Corporate Wire Standard</span>
				<span class="text-zinc-700">&bull;</span>
				<span class="flex items-center gap-2"><Coins size={15} class="text-[#00C48C]/70" /> Telebirr Corporate Batch Gateway</span>
			</div>
		</section>

		<!-- ── FULL-WIDTH SHOWCASE: LIVE ETHIOPIAN TAX SIMULATOR ─────────────── -->
		<section id="engine" class="py-16 lg:py-24">
			<div class="text-center max-w-2xl mx-auto mb-12">
				<div class="flex items-center justify-center gap-2 text-xs font-mono text-[#00C48C] mb-2">
					<Terminal size={14} />
					<span class="font-medium">Zero-dependency statutory engine</span>
				</div>
				<h2 class="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-zinc-100 mb-3">
					Deterministic statutory tax calculations
				</h2>
				<p class="text-sm text-zinc-400">
					Live gross-to-net computation across Ethiopia’s 7 progressive tax brackets and mandatory 7% pension deduction.
				</p>
			</div>

			<!-- Large Showcase Container (Tactile Sandpaper Card in Warm Amber Tint) -->
			<div class="inngest-card sandpaper-card-amber p-6 sm:p-10 relative overflow-hidden">
				<!-- Header Controls: Presets & Period -->
				<div class="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-white/[0.06] gap-4">
					<!-- Presets -->
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-xs text-zinc-400 mr-1">Presets:</span>
						{#each salaryPresets as p}
							<button
								onclick={() => (baseSalaryInput = p.amount)}
								class="rounded-[6px] border px-3 py-1.5 text-xs font-mono transition-inngest cursor-pointer
									   {baseSalaryInput === p.amount
										 ? 'border-[#00C48C]/35 bg-[#00C48C]/[0.08] text-[#00C48C] font-medium'
										 : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]'}"
							>
								{p.label} ({p.amount.toLocaleString()} ETB)
							</button>
						{/each}
					</div>

					<!-- Period Switcher & Bracket Indicator -->
					<div class="flex items-center gap-3">
						<div class="inline-flex rounded-full border border-white/[0.06] bg-white/[0.02] p-0.5 text-xs">
							<button
								onclick={() => (period = 'monthly')}
								class="rounded-full px-3 py-1 font-medium transition-inngest cursor-pointer {period === 'monthly' ? 'bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/30' : 'text-zinc-400 hover:text-zinc-200'}"
							>
								Monthly
							</button>
							<button
								onclick={() => (period = 'annual')}
								class="rounded-full px-3 py-1 font-medium transition-inngest cursor-pointer {period === 'annual' ? 'bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/30' : 'text-zinc-400 hover:text-zinc-200'}"
							>
								Annual
							</button>
						</div>
						<div class="px-3 py-1 rounded-full border border-white/[0.06] inngest-subcard text-xs font-mono text-[#00C48C] font-medium">
							{calc.bracketLabel}
						</div>
					</div>
				</div>

				<!-- Slider & Manual Input -->
				<div class="mb-8">
					<div class="flex items-center justify-between mb-3">
						<label for="salary-slider" class="text-xs font-medium text-zinc-300 flex items-center gap-2">
							<Sliders size={14} class="text-[#00C48C]" />
							<span>Monthly base gross salary</span>
						</label>
						<div class="flex items-center gap-1.5 inngest-subcard px-3.5 py-1.5 font-mono text-sm font-semibold text-zinc-200">
							<span class="text-zinc-500 text-xs">ETB</span>
							<input
								id="salary-number"
								type="number"
								bind:value={baseSalaryInput}
								min="0"
								max="250000"
								step="1000"
								class="w-28 bg-transparent text-right text-zinc-100 focus:outline-none"
							/>
						</div>
					</div>
					<input
						id="salary-slider"
						type="range"
						bind:value={baseSalaryInput}
						min="1000"
						max="150000"
						step="1000"
						class="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#00C48C]"
					/>
				</div>

				<!-- Visual Distribution Bar -->
				<div class="mb-8 p-4 rounded-[6px] inngest-subcard">
					<div class="flex items-center justify-between text-xs font-mono mb-2.5">
						<span class="text-zinc-400 text-[11px]">Deductions distribution</span>
						<div class="flex items-center gap-4 text-[10px]">
							<span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#00C48C]/90"></span>Net take-home ({calc.netPercent}%)</span>
							<span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-amber-400/80"></span>Income tax ({calc.taxPercent}%)</span>
							<span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-zinc-600"></span>Pension ({calc.pensionPercent}%)</span>
						</div>
					</div>
					<div class="h-2.5 w-full rounded-full bg-zinc-800/60 overflow-hidden flex">
						<div class="h-full bg-gradient-to-r from-[#00b884] to-[#009468] transition-inngest" style="width: {calc.netPercent}%"></div>
						<div class="h-full bg-gradient-to-r from-amber-500/80 to-amber-600/70 transition-inngest" style="width: {calc.taxPercent}%"></div>
						<div class="h-full bg-zinc-700/70 transition-inngest" style="width: {calc.pensionPercent}%"></div>
					</div>
				</div>

				<!-- 4 Metric Cards -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
					<div class="inngest-subcard p-4">
						<div class="text-[10px] text-zinc-400 font-mono">7% Employee pension</div>
						<div class="text-base font-mono font-medium text-zinc-100 mt-1">{formatETB(calc.employeePension)}</div>
					</div>
					<div class="inngest-subcard p-4">
						<div class="text-[10px] text-zinc-400 font-mono">Taxable income base</div>
						<div class="text-base font-mono font-medium text-zinc-300 mt-1">{formatETB(calc.base - calc.employeePension)}</div>
					</div>
					<div class="inngest-subcard p-4">
						<div class="text-[10px] text-amber-400/80 font-mono">MoR income tax</div>
						<div class="text-base font-mono font-medium text-amber-400/80 mt-1">{formatETB(calc.incomeTax)}</div>
					</div>
					<div class="inngest-subcard p-4">
						<div class="text-[10px] text-[#00C48C] font-mono">Net take-home pay</div>
						<div class="text-base font-mono font-semibold text-[#00C48C] mt-1">{formatETB(calc.netPay)}</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ── VIBRANT ACCENT BAND (Seamlessly Blended Sandpaper Gradient) ── -->
		<section class="rounded-[6px] border border-[#00C48C]/15 bg-gradient-to-b from-[#00C48C]/[0.03] to-transparent p-8 sm:p-12 my-16 shadow-[inset_0_1px_0_0_rgba(0,196,140,0.08)]">
			<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
				<div class="max-w-xl">
					<span class="text-xs font-mono text-[#00C48C] font-medium block mb-2">
						Audited compliance architecture
					</span>
					<h3 class="text-2xl sm:text-3xl font-normal tracking-[-0.035em] text-zinc-100 leading-snug">
						From monthly attendance freeze to corporate bank wire release in seconds.
					</h3>
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono">
					<div>
						<div class="text-2xl font-bold text-[#00C48C]">100%</div>
						<div class="text-[11px] text-zinc-400 mt-1">Deterministic TypeScript</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-zinc-100">7 Brackets</div>
						<div class="text-[11px] text-zinc-400 mt-1">MoR Proclamation 979/2016</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-zinc-100">18 Staff</div>
						<div class="text-[11px] text-zinc-400 mt-1">Pre-seeded organization</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-[#00C48C]">CBE Ready</div>
						<div class="text-[11px] text-zinc-400 mt-1">ISO 20022 wire export</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ── ALTERNATING STEPPER TIMELINE (Matching Inngest left rail + right card) ── -->
		<section id="timeline" class="py-16 lg:py-24">
			<div class="text-center max-w-2xl mx-auto mb-16">
				<div class="flex items-center justify-center gap-2 text-xs font-mono text-[#00C48C] mb-2">
					<CheckCircle size={14} weight="fill" />
					<span class="font-medium">End-to-end compliance pipeline</span>
				</div>
				<h2 class="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-zinc-100 mb-3">
					How Rosterly executes a compliance cycle
				</h2>
				<p class="text-sm text-zinc-400">
					Click any phase along the stepper to inspect its statutory mechanics and operational artifacts.
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
				<!-- Left Vertical Timeline Stepper Rail -->
				<div class="lg:col-span-5 relative pl-6 border-l-2 border-white/[0.08] space-y-10">
					{#each timelineSteps as step}
						{@const isCurrent = activeTimelineStep === step.id}
						<button
							onclick={() => (activeTimelineStep = step.id)}
							class="text-left w-full group cursor-pointer relative transition-inngest"
						>
							<!-- Stepper Node Dot -->
							<div
								class="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 transition-inngest
									   {isCurrent ? 'bg-[#00C48C]/90 border-[#08090a] ring-4 ring-[#00C48C]/15' : 'bg-zinc-800 border-zinc-700 group-hover:border-[#00C48C]'}"
							></div>

							<div class="flex items-center gap-2 mb-1">
								<span class="text-xs font-mono {isCurrent ? 'text-[#00C48C] font-medium' : 'text-zinc-500'}">
									{step.number} &bull; {step.category}
								</span>
								<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400">
									{step.badge}
								</span>
							</div>
							<h4 class="text-base font-normal tracking-tight text-zinc-100 mb-1.5 {isCurrent ? 'text-[#00C48C]' : 'group-hover:text-white'}">
								{step.title}
							</h4>
							<p class="text-xs text-zinc-400 leading-relaxed">
								{step.description}
							</p>
						</button>
					{/each}
				</div>

				<!-- Right Interactive Showcase Card for Active Step (Tactile Sandpaper Card in Emerald Tint) -->
				<div class="lg:col-span-7 inngest-card sandpaper-card-emerald p-6 sm:p-8">
					{#if activeTimelineStep === 1}
						<!-- Step 1: 7-Tier Tax Schedule Inspector -->
						<div>
							<div class="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
								<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
									<Scales size={16} />
									<span class="font-medium">MoR 7-tier statutory tax schedule</span>
								</div>
								<span class="text-[10px] font-mono text-zinc-500">Proclamation 979/2016</span>
							</div>
							<p class="text-xs text-zinc-400 leading-relaxed mb-4">
								Every Birr is calculated deterministically with statutory deductibles applied per income bracket:
							</p>
							<div class="inngest-subcard overflow-hidden font-mono text-xs">
								<div class="grid grid-cols-3 bg-white/[0.02] p-2.5 text-[11px] font-medium text-zinc-400 border-b border-white/[0.05]">
									<span>Monthly taxable bracket</span>
									<span class="text-center">Rate</span>
									<span class="text-right">Deduction (ETB)</span>
								</div>
								<div class="divide-y divide-white/[0.03] text-[11px]">
									<div class="grid grid-cols-3 p-2.5 text-zinc-400">
										<span>0 – 600 ETB</span>
										<span class="text-center text-[#00C48C]">0%</span>
										<span class="text-right">0.00</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-zinc-400">
										<span>601 – 1,650 ETB</span>
										<span class="text-center text-zinc-200">10%</span>
										<span class="text-right">60.00</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-zinc-400">
										<span>1,651 – 3,200 ETB</span>
										<span class="text-center text-zinc-200">15%</span>
										<span class="text-right">142.50</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-zinc-400">
										<span>3,201 – 5,250 ETB</span>
										<span class="text-center text-zinc-200">20%</span>
										<span class="text-right">302.50</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-zinc-400">
										<span>5,251 – 7,800 ETB</span>
										<span class="text-center text-zinc-200">25%</span>
										<span class="text-right">565.00</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-zinc-400">
										<span>7,801 – 10,900 ETB</span>
										<span class="text-center text-zinc-200">30%</span>
										<span class="text-right">955.00</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-zinc-300 bg-[#00C48C]/[0.04]">
										<span class="text-[#00C48C]">&gt; 10,900 ETB</span>
										<span class="text-center text-[#00C48C] font-semibold">35%</span>
										<span class="text-right text-[#00C48C]">1,500.00</span>
									</div>
								</div>
							</div>
						</div>
					{:else if activeTimelineStep === 2}
						<!-- Step 2: Pension Agency Remittance Voucher -->
						<div>
							<div class="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
								<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
									<Shield size={16} />
									<span class="font-medium">POESSA mandatory pension remittance</span>
								</div>
								<span class="text-[10px] font-mono text-zinc-500">Private org pension</span>
							</div>
							<p class="text-xs text-zinc-400 leading-relaxed mb-4">
								Statutory split deposited to the Private Organization Employees’ Pension Agency:
							</p>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
								<div class="inngest-subcard p-4">
									<div class="text-[10px] font-mono text-zinc-400">Employee 7% deduction</div>
									<div class="text-lg font-mono font-semibold text-[#00C48C] mt-1">ETB 26,481.00</div>
									<div class="text-[11px] text-zinc-500 mt-1 font-sans">Exempt from monthly income tax base</div>
								</div>
								<div class="inngest-subcard p-4">
									<div class="text-[10px] font-mono text-zinc-400">Employer 11% match</div>
									<div class="text-lg font-mono font-semibold text-zinc-100 mt-1">ETB 41,613.00</div>
									<div class="text-[11px] text-zinc-500 mt-1 font-sans">Mandatory corporate social security</div>
								</div>
							</div>
							<div class="inngest-subcard p-3 text-xs font-mono flex items-center justify-between text-zinc-400">
								<span>Total remittance voucher due:</span>
								<span class="text-zinc-100 font-semibold">ETB 68,094.00</span>
							</div>
						</div>
					{:else if activeTimelineStep === 3}
						<!-- Step 3: Governance Gate Sign-Off -->
						<div>
							<div class="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
								<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
									<Shield size={16} />
									<span class="font-medium">Fiduciary separation of duties gate</span>
								</div>
								<span class="text-[10px] font-mono text-[#00C48C] bg-[#00C48C]/10 px-2.5 py-0.5 rounded-full border border-[#00C48C]/20">
									Strict RBAC
								</span>
							</div>
							<p class="text-xs text-zinc-400 leading-relaxed mb-4">
								Disbursement integrity prevents rogue or fraudulent wire executions:
							</p>
							<div class="space-y-3 font-mono text-xs">
								<div class="inngest-subcard p-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<CheckCircle size={16} class="text-[#00C48C]" weight="fill" />
										<span class="text-zinc-200">Finance &amp; Treasury</span>
									</div>
									<span class="text-[11px] text-[#00C48C]">Drafted &amp; audited</span>
								</div>
								<div class="rounded-[6px] border border-[#00C48C]/25 bg-[#00C48C]/[0.05] p-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="h-2 w-2 rounded-full bg-[#00C48C] animate-ping"></span>
										<span class="text-zinc-100">Managing Director (Owner)</span>
									</div>
									<span class="text-[11px] text-[#00C48C] font-semibold">Sole authorization authority</span>
								</div>
							</div>
						</div>
					{:else}
						<!-- Step 4: CBE Direct Batch Exporter -->
						<div>
							<div class="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
								<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
									<Bank size={16} />
									<span class="font-medium">Commercial Bank of Ethiopia (CBE) batch</span>
								</div>
								<div class="flex items-center gap-1.5">
									<button
										onclick={copyBatchCSV}
										class="text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1 inngest-subcard px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer"
									>
										{#if copiedBatch}
											<Check size={12} class="text-[#00C48C]" />
											<span class="text-[#00C48C]">Copied</span>
										{:else}
											<Copy size={12} />
											<span>Copy</span>
										{/if}
									</button>
									<button
										onclick={downloadBatchCSV}
										class="text-[11px] font-mono text-[#051a14] font-semibold hover:brightness-105 flex items-center gap-1 bg-gradient-to-r from-[#00b884] to-[#009468] px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer"
										title="Download CSV"
									>
										<DownloadSimple size={12} />
										<span>CSV</span>
									</button>
								</div>
							</div>
							<p class="text-xs text-zinc-400 leading-relaxed mb-3">
								ISO 20022 compliant corporate batch file ready for upload to CBE Corporate Portal:
							</p>
							<div class="inngest-subcard p-3 font-mono text-[11px] space-y-1 overflow-x-auto text-zinc-400">
								<div class="text-zinc-500"># CBE Wire Transfer Batch (Cycle 2026-09)</div>
								<div class="text-[#00C48C] font-medium">Account,Beneficiary,Amount_ETB,Ref</div>
								<div class="text-zinc-200">1000188923456,"Abebe Kebede",38200.00,SAL-09</div>
								<div class="text-zinc-200">1000299481203,"Hana Mulugeta",22657.50,SAL-09</div>
								<div class="text-zinc-200">1000344810294,"Yonas Alemu",17821.50,SAL-09</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- ── PERSONA PERSPECTIVES & TELEGRAM WORKER BENTO ──────────────────── -->
		<section id="roles" class="py-16 lg:py-24">
			<div class="text-center max-w-2xl mx-auto mb-14">
				<div class="flex items-center justify-center gap-2 text-xs font-mono text-[#00C48C] mb-2">
					<Shield size={14} />
					<span class="font-medium">Role perspectives &amp; self-service</span>
				</div>
				<h2 class="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-zinc-100 mb-3">
					Built for every stakeholder in the organization
				</h2>
				<p class="text-sm text-zinc-400">
					Test authentic permission scopes with 1-click live demo logins or interact with the Telegram bot simulator.
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- BENTO CARD 1 (SPAN 2): Separation of Duties Role Switcher (Integrated Frosted Glass) -->
				<div class="lg:col-span-2 inngest-card p-6 sm:p-8">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-white/[0.06] gap-3">
						<div>
							<span class="text-xs font-mono text-[#00C48C] block mb-1">Interactive RBAC</span>
							<h3 class="text-xl font-normal text-zinc-100 tracking-[-0.02em]">Role-based access matrix</h3>
						</div>

						<button
							onclick={() => launchAsRole(currentRole.email)}
							disabled={isLoggingIn}
							class="inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-r from-[#00b884] via-[#00a876] to-[#009468] hover:brightness-105 active:scale-[0.99] text-[#051a14] font-semibold text-xs px-4 py-2 transition-inngest disabled:opacity-50 cursor-pointer self-start sm:self-auto shadow-sm"
						>
							<Lightning size={13} weight="fill" />
							<span>{isLoggingIn ? 'Authenticating...' : currentRole.actionText}</span>
							<ArrowRight size={13} weight="bold" />
						</button>
					</div>

					<!-- Role Selector Pills -->
					<div class="flex flex-wrap gap-2 mb-6">
						{#each (['finance', 'owner', 'hr', 'manager', 'employee'] as RoleKey[]) as r}
							<button
								onclick={() => (activeRole = r)}
								class="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-inngest cursor-pointer
									   {activeRole === r
										 ? 'bg-gradient-to-r from-[#00b884] to-[#009468] text-[#051a14] font-semibold'
										 : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'}"
							>
								<span>{roleMeta[r].title}</span>
								<span class="text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase {activeRole === r ? 'bg-black/20 text-[#051a14]' : 'bg-white/[0.05] text-zinc-500'}">
									{roleMeta[r].badge}
								</span>
							</button>
						{/each}
					</div>

					<!-- Role Preview Box -->
					<div class="inngest-subcard p-4">
						<div class="flex items-center justify-between text-xs mb-3">
							<span class="font-medium text-zinc-200">{currentRole.headline}</span>
							<span class="font-mono text-[10px] text-[#00C48C] bg-[#00C48C]/10 px-2.5 py-0.5 rounded-full border border-[#00C48C]/20">
								Scope: {currentRole.workflowState}
							</span>
						</div>
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
							{#each currentRole.stats as stat}
								<div class="inngest-subcard p-3">
									<div class="text-[10px] text-zinc-500 font-mono">{stat.label}</div>
									<div class="text-sm font-mono font-medium text-zinc-200 mt-1">{stat.value}</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- BENTO CARD 2 (SPAN 1): Telegram Mobile Worker Simulator (Integrated Frosted Glass) -->
				<div class="inngest-card p-6 sm:p-8 flex flex-col justify-between">
					<div>
						<div class="flex items-center justify-between mb-4">
							<div class="flex h-10 w-10 items-center justify-center rounded-[6px] inngest-subcard text-white">
								<PaperPlaneRight size={20} weight="duotone" class="text-[#00C48C]" />
							</div>
							<span class="text-[10px] font-mono text-[#00C48C] bg-[#00C48C]/10 px-2.5 py-0.5 rounded-full border border-[#00C48C]/20">Telegram API</span>
						</div>
						<h3 class="text-lg font-normal text-zinc-100 mb-1.5 tracking-[-0.02em]">Telegram mobile worker</h3>
						<p class="text-xs text-zinc-400 leading-relaxed mb-3">
							Interactive bot simulator for staff self-service and payslip queries:
						</p>

						<!-- Command Pills -->
						<div class="flex flex-wrap gap-1.5 mb-3">
							{#each (['/payslip', '/leave', '/status', '/letter'] as const) as cmd}
								<button
									onclick={() => (activeCommand = cmd)}
									class="px-2.5 py-1 rounded-full font-mono text-[10px] transition-inngest cursor-pointer
										   {activeCommand === cmd
											 ? 'bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/30 font-medium'
											 : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'}"
								>
									{cmd}
								</button>
							{/each}
						</div>
					</div>

					<!-- Simulated Bot Thread -->
					<div class="inngest-subcard p-3 space-y-2 text-xs">
						<div class="bg-white/[0.03] border border-white/[0.05] text-zinc-200 rounded-[6px] py-1 px-2.5 text-[11px] font-mono text-right">
							{currentBot.cmd}
						</div>
						<div class="bg-white/[0.03] border border-white/[0.05] text-zinc-200 rounded-[6px] p-2.5 text-[11px]">
							<span class="font-medium text-zinc-100 block mb-1 text-[11px]">{currentBot.replyTitle}</span>
							{#each currentBot.details as d}
								<div class="flex items-center justify-between text-[10px] py-0.5">
									<span class="text-zinc-400">{d.label}:</span>
									<span class="font-mono font-medium {d.highlight ? 'text-[#00C48C]' : 'text-zinc-200'}">{d.val}</span>
								</div>
							{/each}
							<div class="border-t border-white/[0.05] mt-1.5 pt-1 text-[9px] text-zinc-500 font-mono">
								{currentBot.footer}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ── CALL TO ACTION BANNER (No duplicate GitHub buttons) ──────────── -->
		<section class="inngest-card p-8 sm:p-14 text-center my-16">
			<div class="max-w-2xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-normal text-zinc-100 tracking-[-0.035em] mb-4">
					Test the complete workforce platform
				</h2>
				<p class="text-sm text-zinc-400 mb-8 leading-relaxed">
					All roles, progressive tax schedules, CBE export files, and pre-seeded mock employees are live and ready to explore in your browser.
				</p>
				<a
					href="/login"
					class="inline-flex items-center justify-center gap-2 rounded-[6px] bg-gradient-to-r from-[#00b884] via-[#00a876] to-[#009468] hover:brightness-105 active:scale-[0.99] text-[#051a14] font-semibold text-xs h-[42px] px-8 transition-inngest shadow-sm"
				>
					<span>Open role selector</span>
					<ArrowRight size={14} weight="bold" />
				</a>
			</div>
		</section>
	</main>

	<!-- ── FOOTER ───────────────────────────────────────────────────────── -->
	<footer class="border-t border-white/[0.05] bg-[#08090a] py-10 text-center text-xs text-zinc-500 font-mono">
		<div class="mx-auto max-w-[1440px] px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2 text-zinc-400">
				<TreeStructure size={16} class="text-[#00C48C]" weight="fill" />
				<span class="font-medium text-zinc-200">Rosterly</span>
				<span>&bull;</span>
				<span>Ethiopian Compliance-First Payroll Engine</span>
			</div>
			<div>
				Built with SvelteKit (Svelte 5) &bull; Drizzle ORM &bull; Proclamation 979/2016
			</div>
		</div>
	</footer>
</div>
