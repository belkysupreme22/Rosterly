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
		Star
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
		{ label: 'Junior Staff', amount: 14000 },
		{ label: 'Mid Specialist', amount: 38000 },
		{ label: 'Senior Lead', amount: 72000 },
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
			category: 'STATUTORY TAXES',
			title: 'Progressive Ministry of Revenue brackets',
			description: 'Evaluates each employee across Ethiopia’s 7 progressive income tax brackets with zero rounding drift.',
			badge: 'MoR Proclamation 979'
		},
		{
			id: 2,
			number: '02',
			category: 'PENSION DIRECTIVE',
			title: 'Mandatory private organization pension',
			description: 'Calculates the 7% employee tax-exempt deduction alongside the mandatory 11% employer contribution.',
			badge: 'POESSA Directive'
		},
		{
			id: 3,
			number: '03',
			category: 'FIDUCIARY GOVERNANCE',
			title: 'Strict separation of duties sign-off gate',
			description: 'Finance prepares and audits the cycle. Managing Director holds sole authority to authorize disbursement.',
			badge: 'Executive Gate'
		},
		{
			id: 4,
			number: '04',
			category: 'BANKING DISBURSEMENT',
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
			headline: 'Payroll Run Cycle #2026-09 • 18 Employees',
			stats: [
				{ label: 'Gross Disbursal', value: 'ETB 378,300.00' },
				{ label: 'MoR Tax Withholding', value: 'ETB 68,410.00' },
				{ label: 'Pension Pool (7%+11%)', value: 'ETB 68,094.00' }
			],
			actionText: 'Instant Launch as Finance',
			badge: 'Disbursement Controller'
		},
		owner: {
			title: 'Managing Director (Owner)',
			email: 'owner@acme.com',
			tagline: 'Fiduciary sign-off authority. Sole role permitted to authorize bank disbursements.',
			workflowState: 'Awaiting Authorization',
			headline: 'Monthly Wire Disbursal Review',
			stats: [
				{ label: 'Authorized Runs', value: '12 / 12 Cycles' },
				{ label: 'Compliance Status', value: '100% Certified' },
				{ label: 'Pending Approval', value: '1 Cycle' }
			],
			actionText: 'Instant Launch as Owner',
			badge: 'Sole Authorization'
		},
		hr: {
			title: 'People & Culture',
			email: 'hr@acme.com',
			tagline: 'Staff directory, organizational hierarchy, leave quotas, and corporate announcements.',
			workflowState: 'Directory Active',
			headline: 'Workforce Roster & Department Units',
			stats: [
				{ label: 'Active Team', value: '18 Across 5 Depts' },
				{ label: 'Leave Reviews', value: '4 Processed' },
				{ label: 'Hardware Assets', value: '24 Tracked Units' }
			],
			actionText: 'Instant Launch as HR Admin',
			badge: 'Directory & Policy'
		},
		manager: {
			title: 'Team Lead',
			email: 'manager@acme.com',
			tagline: 'Live attendance radar, department coverage calendar, and leave approvals.',
			workflowState: 'Coverage Nominal',
			headline: 'Engineering Team Board (8 Members)',
			stats: [
				{ label: 'On Leave Today', value: '1 Member' },
				{ label: 'Pending Requests', value: '2 Leave Reviews' },
				{ label: 'Coverage Rate', value: '94.2%' }
			],
			actionText: 'Instant Launch as Manager',
			badge: 'Team Lead'
		},
		employee: {
			title: 'Employee Portal',
			email: 'hana@acme.com',
			tagline: 'Personal payslip vouchers, annual leave tracking, and verified employment certificates.',
			workflowState: 'Portal Active',
			headline: 'Hana Mulugeta • Software Engineer',
			stats: [
				{ label: 'Annual Leave Balance', value: '14 Days Left' },
				{ label: 'Latest Net Take-Home', value: 'ETB 22,657.50' },
				{ label: 'Verified Letters', value: '1 Document Issued' }
			],
			actionText: 'Instant Launch as Employee',
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
			footer: 'Disbursal Reference: SAL-2026-09 via CBE'
		},
		'/leave': {
			cmd: '/leave',
			replyTitle: '🏖️ Personal Leave Balance',
			details: [
				{ label: 'Annual Quota', val: '20 Days' },
				{ label: 'Days Utilized', val: '6 Days' },
				{ label: 'Available Balance', val: '14 Days Remaining', highlight: true }
			],
			footer: 'Next Public Holiday: Enkutatash (Ethiopian New Year)'
		},
		'/status': {
			cmd: '/status',
			replyTitle: '🟢 Real-time Work Status Updated',
			details: [
				{ label: 'Current State', val: 'IN OFFICE', highlight: true },
				{ label: 'Office Location', val: 'Addis Ababa HQ (Bole)' },
				{ label: 'Team Calendar', val: 'Synced Across Board' }
			],
			footer: 'Status synced to department dashboard'
		},
		'/letter': {
			cmd: '/letter',
			replyTitle: '📜 Official Employment Certificate',
			details: [
				{ label: 'Verification Code', val: 'ETH-VERIFY-2026-HANA', highlight: true },
				{ label: 'Recipient', val: 'To Whom It May Concern' },
				{ label: 'Anti-Fraud Status', val: 'Cryptographically Signed' }
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

<!-- Deep Matte Obsidian Canvas (#0c0a09) with Hard Paper Tactile Texture and Brand Accent (#00C48C) -->
<div class="min-h-screen bg-[#0c0a09] inngest-paper text-[#ffffff] selection:bg-[#00C48C]/30 selection:text-white relative overflow-hidden font-sans">
	<!-- Tactile Hard Paper Grain Noise Overlay -->
	<div class="pointer-events-none fixed inset-0 inngest-grain z-0 opacity-40"></div>

	<!-- Ambient Lighting Cones (Inngest Style) -->
	<div class="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(0,196,140,0.14),transparent_70%)] blur-3xl"></div>
	<div class="pointer-events-none absolute top-[1600px] right-0 w-[700px] h-[600px] bg-[radial-gradient(circle,rgba(0,196,140,0.06),transparent_70%)] blur-3xl"></div>

	<!-- ── STICKY HEADER (88px tall with hairline border) ─────────────────── -->
	<header class="sticky top-0 z-50 border-b border-[#1f1e1d] bg-[#0c0a09]/90 backdrop-blur-xl h-[88px] flex items-center">
		<div class="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 sm:px-12">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 group">
				<div class="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#1c1c1c] border border-[#1f1e1d] text-[#ffffff] shadow-[rgb(28,28,28)_0px_0px_0px_2px]">
					<TreeStructure size={18} weight="fill" class="text-[#00C48C]" />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm font-semibold tracking-tight text-[#ffffff]">Rosterly</span>
					<span class="text-[10px] uppercase tracking-widest font-mono font-medium px-2 py-0.5 rounded-full bg-[#1c1c1c] text-[#00C48C] border border-[#00C48C]/20">v2.4</span>
				</div>
			</a>

			<!-- Center Nav Links -->
			<nav class="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#b3b3b3]">
				<a href="#pipeline" class="hover:text-white transition-colors">Pipeline</a>
				<a href="#engine" class="hover:text-white transition-colors">Tax Engine</a>
				<a href="#timeline" class="hover:text-white transition-colors">Compliance</a>
				<a href="#roles" class="hover:text-white transition-colors">Roles</a>
			</nav>

			<!-- Actions: Sole Notable GitHub Link + Open Workspace CTA -->
			<div class="flex items-center gap-3">
				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-2 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] hover:border-[#ffffff2e] px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#ffffff] transition-inngest"
				>
					<GithubLogo size={15} weight="bold" />
					<span class="hidden sm:inline">GitHub</span>
					<span class="flex items-center gap-0.5 text-[10px] text-[#00C48C] font-mono pl-1 border-l border-[#1f1e1d]">
						<Star size={11} weight="fill" />
						<span>Repo</span>
					</span>
				</a>
				<a
					href="/login"
					class="inline-flex items-center gap-2 rounded-[6px] bg-[#00C48C] hover:bg-[#00ab7a] text-[#0c0a09] font-bold px-5 py-2.5 text-xs uppercase tracking-wider transition-inngest shadow-[rgb(28,28,28)_0px_0px_0px_2px]"
				>
					<span>Open Workspace</span>
					<ArrowRight size={14} weight="bold" />
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
					class="inline-flex items-center gap-2 rounded-full border border-[#1f1e1d] bg-[#1c1c1c] hover:border-[#00C48C]/40 px-3.5 py-1 text-xs font-mono text-[#ffffff] mb-6 transition-inngest"
				>
					<span class="h-2 w-2 rounded-full bg-[#00C48C] animate-pulse"></span>
					<span class="font-medium text-[#ffffff]">Ethiopian MoR Proclamation 979/2016</span>
					<span class="text-[#b3b3b3]">|</span>
					<span class="text-[#00C48C]">Directives →</span>
				</a>

				<!-- Main Headline -->
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.035em] text-[#ffffff] leading-[1.08] mb-6">
					The durable workforce &amp; payroll engine for Ethiopia.
				</h1>

				<!-- Subtext -->
				<p class="text-base sm:text-lg text-[#b3b3b3] max-w-xl leading-relaxed mb-8">
					Replace fragile Excel sheets and manual chat approvals with an audited, deterministic platform. Calculate progressive taxes, stream CBE wire batches, and empower staff over Telegram.
				</p>

				<!-- Action Buttons (No GitHub button here; only in top header) -->
				<div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
					<a
						href="/login"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#00C48C] hover:bg-[#00ab7a] text-[#0c0a09] font-bold text-xs uppercase tracking-wider h-[42px] px-6 transition-inngest cursor-pointer shadow-[rgb(28,28,28)_0px_0px_0px_2px]"
					>
						<span>Explore Pre-Seeded Company</span>
						<ArrowRight size={14} weight="bold" />
					</a>
					<a
						href="#engine"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] hover:border-[#ffffff2e] text-[#ffffff] font-semibold text-xs uppercase tracking-wider h-[42px] px-6 transition-inngest cursor-pointer"
					>
						<Sliders size={14} class="text-[#00C48C]" />
						<span>Test Tax Simulator</span>
					</a>
				</div>
			</div>

			<!-- Hero Right Column: Inngest-Style Visual Workflow Pipeline (No Code) -->
			<div id="pipeline" class="lg:col-span-6 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-5 sm:p-6 shadow-[rgb(28,28,28)_0px_0px_0px_2px] relative overflow-hidden">
				<div class="flex items-center justify-between pb-4 mb-4 border-b border-[#1f1e1d]">
					<div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00C48C]">
						<Cpu size={15} />
						<span>Workflow Execution Pipeline</span>
					</div>
					<span class="text-[11px] font-mono text-[#b3b3b3] px-2 py-0.5 rounded-full border border-[#1f1e1d] bg-[#0c0a09]">
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
									 ? 'border-[#00C48C] bg-[#0c0a09] shadow-[rgb(0,196,140)_2px_0px_0px_0px_inset]'
									 : 'border-[#1f1e1d] bg-[#1c1c1c] hover:border-[#ffffff2e]'}"
						>
							<div class="flex items-center gap-3">
								<div class="h-2 w-2 rounded-full {isSelected ? 'bg-[#00C48C] animate-pulse' : 'bg-[#737373]'}"></div>
								<div>
									<div class="text-xs font-mono text-[#ffffff]">{step.name}</div>
									<div class="text-[10px] text-[#b3b3b3] font-mono">{step.badge} &bull; {step.duration}</div>
								</div>
							</div>
							<div class="text-[11px] font-mono {isSelected ? 'text-[#00C48C]' : 'text-[#737373]'}">
								{step.status}
							</div>
						</button>
					{/each}
				</div>

				<!-- Live Step Inspector (Visual Log Viewer) -->
				<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4 font-mono text-xs">
					<div class="flex items-center justify-between pb-2 mb-2 border-b border-[#1f1e1d]">
						<div class="flex items-center gap-2">
							<span class="h-2 w-2 rounded-full bg-[#00C48C]"></span>
							<span class="text-[#ffffff] font-medium">{selectedStepObj.name}</span>
						</div>
						<span class="text-[#b3b3b3] text-[10px]">ID: #{selectedStepObj.id}</span>
					</div>
					<p class="text-[#b3b3b3] text-xs font-sans mb-3 leading-relaxed">
						{selectedStepObj.description}
					</p>
					<div class="bg-[#1c1c1c] border border-[#1f1e1d] rounded-[6px] p-2.5 text-[11px] space-y-1">
						{#each Object.entries(selectedStepObj.meta) as [key, val]}
							<div class="flex items-start gap-2">
								<span class="text-[#737373] min-w-24 capitalize">{key}:</span>
								<span class="text-[#ffffff] font-mono">{val}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- ── ENDLESS RAIL LOGO MARQUEE (Trust & Institutional Anchors) ────── -->
		<section class="border-y border-[#1f1e1d] py-6 my-12 bg-[#0c0a09]/60 overflow-hidden relative">
			<div class="animate-inngest-marquee flex items-center gap-12 text-xs font-mono uppercase tracking-wider text-[#b3b3b3]">
				<span class="flex items-center gap-2"><Bank size={16} class="text-[#00C48C]" /> Commercial Bank of Ethiopia (CBE Direct)</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><Scales size={16} class="text-[#00C48C]" /> Ministry of Revenue (MoR Proclamation 979)</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><Shield size={16} class="text-[#00C48C]" /> Pension Agency (POESSA Directives)</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><FileText size={16} class="text-[#00C48C]" /> ISO 20022 Corporate Wire Standard</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><Coins size={16} class="text-[#00C48C]" /> Telebirr Corporate Batch Gateway</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><Bank size={16} class="text-[#00C48C]" /> Commercial Bank of Ethiopia (CBE Direct)</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><Scales size={16} class="text-[#00C48C]" /> Ministry of Revenue (MoR Proclamation 979)</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><Shield size={16} class="text-[#00C48C]" /> Pension Agency (POESSA Directives)</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><FileText size={16} class="text-[#00C48C]" /> ISO 20022 Corporate Wire Standard</span>
				<span class="text-[#1f1e1d]">&bull;</span>
				<span class="flex items-center gap-2"><Coins size={16} class="text-[#00C48C]" /> Telebirr Corporate Batch Gateway</span>
			</div>
		</section>

		<!-- ── FULL-WIDTH SHOWCASE: LIVE ETHIOPIAN TAX SIMULATOR ─────────────── -->
		<section id="engine" class="py-16 lg:py-24">
			<div class="text-center max-w-2xl mx-auto mb-12">
				<div class="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00C48C] mb-2">
					<Terminal size={14} />
					<span>Zero-Dependency Statutory Engine</span>
				</div>
				<h2 class="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#ffffff] mb-3">
					Deterministic statutory tax calculations
				</h2>
				<p class="text-sm text-[#b3b3b3]">
					Live gross-to-net computation across Ethiopia’s 7 progressive tax brackets and mandatory 7% pension deduction.
				</p>
			</div>

			<!-- Large Showcase Container (Matching Inngest frame center showcase) -->
			<div class="rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-10 shadow-[rgb(28,28,28)_0px_0px_0px_2px] relative overflow-hidden">
				<!-- Header Controls: Presets & Period -->
				<div class="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-[#1f1e1d] gap-4">
					<!-- Presets -->
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-xs text-[#b3b3b3] mr-1">Presets:</span>
						{#each salaryPresets as p}
							<button
								onclick={() => (baseSalaryInput = p.amount)}
								class="rounded-[6px] border px-3 py-1.5 text-xs font-mono transition-inngest cursor-pointer
									   {baseSalaryInput === p.amount
										 ? 'border-[#00C48C] bg-[#0c0a09] text-[#00C48C] font-semibold'
										 : 'border-[#1f1e1d] bg-[#0c0a09] text-[#b3b3b3] hover:text-white hover:border-[#ffffff2e]'}"
							>
								{p.label} ({p.amount.toLocaleString()} ETB)
							</button>
						{/each}
					</div>

					<!-- Period Switcher & Bracket Indicator -->
					<div class="flex items-center gap-3">
						<div class="inline-flex rounded-full border border-[#1f1e1d] bg-[#0c0a09] p-0.5 text-xs">
							<button
								onclick={() => (period = 'monthly')}
								class="rounded-full px-3 py-1 font-semibold transition-inngest cursor-pointer {period === 'monthly' ? 'bg-[#00C48C] text-[#0c0a09]' : 'text-[#b3b3b3] hover:text-white'}"
							>
								Monthly
							</button>
							<button
								onclick={() => (period = 'annual')}
								class="rounded-full px-3 py-1 font-semibold transition-inngest cursor-pointer {period === 'annual' ? 'bg-[#00C48C] text-[#0c0a09]' : 'text-[#b3b3b3] hover:text-white'}"
							>
								Annual
							</button>
						</div>
						<div class="px-3 py-1 rounded-full border border-[#1f1e1d] bg-[#0c0a09] text-xs font-mono text-[#00C48C] font-medium">
							{calc.bracketLabel}
						</div>
					</div>
				</div>

				<!-- Slider & Manual Input -->
				<div class="mb-8">
					<div class="flex items-center justify-between mb-3">
						<label for="salary-slider" class="text-xs font-semibold text-[#ffffff] flex items-center gap-2 uppercase tracking-wider">
							<Sliders size={14} class="text-[#00C48C]" />
							<span>Monthly Base Gross Salary</span>
						</label>
						<div class="flex items-center gap-1 bg-[#0c0a09] border border-[#1f1e1d] rounded-[6px] px-3.5 py-1.5 font-mono text-sm font-semibold text-[#ffffff]">
							<span class="text-[#b3b3b3] text-xs">ETB</span>
							<input
								id="salary-number"
								type="number"
								bind:value={baseSalaryInput}
								min="0"
								max="250000"
								step="1000"
								class="w-28 bg-transparent text-right text-white focus:outline-none"
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
						class="w-full h-2 bg-[#0c0a09] rounded-lg appearance-none cursor-pointer accent-[#00C48C]"
					/>
				</div>

				<!-- Visual Distribution Bar -->
				<div class="mb-8 p-4 rounded-[6px] bg-[#0c0a09] border border-[#1f1e1d]">
					<div class="flex items-center justify-between text-xs font-mono mb-2">
						<span class="text-[#b3b3b3] text-[11px]">Deductions Distribution</span>
						<div class="flex items-center gap-4 text-[10px]">
							<span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#00C48C]"></span>Net Take-Home ({calc.netPercent}%)</span>
							<span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#f59e0b]"></span>Income Tax ({calc.taxPercent}%)</span>
							<span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#737373]"></span>Pension ({calc.pensionPercent}%)</span>
						</div>
					</div>
					<div class="h-3 w-full rounded-full bg-[#1c1c1c] overflow-hidden flex">
						<div class="h-full bg-[#00C48C] transition-all duration-300" style="width: {calc.netPercent}%"></div>
						<div class="h-full bg-[#f59e0b] transition-all duration-300" style="width: {calc.taxPercent}%"></div>
						<div class="h-full bg-[#737373] transition-all duration-300" style="width: {calc.pensionPercent}%"></div>
					</div>
				</div>

				<!-- 4 Metric Cards -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4">
						<div class="text-[10px] text-[#b3b3b3] font-mono uppercase">7% Employee Pension</div>
						<div class="text-base font-mono font-semibold text-white mt-1">{formatETB(calc.employeePension)}</div>
					</div>
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4">
						<div class="text-[10px] text-[#b3b3b3] font-mono uppercase">Taxable Income Base</div>
						<div class="text-base font-mono font-semibold text-[#b3b3b3] mt-1">{formatETB(calc.base - calc.employeePension)}</div>
					</div>
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4">
						<div class="text-[10px] text-[#f59e0b] font-mono uppercase">MoR Income Tax</div>
						<div class="text-base font-mono font-semibold text-[#f59e0b] mt-1">{formatETB(calc.incomeTax)}</div>
					</div>
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4">
						<div class="text-[10px] text-[#00C48C] font-mono uppercase">Net Take-Home Pay</div>
						<div class="text-base font-mono font-bold text-[#00C48C] mt-1">{formatETB(calc.netPay)}</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ── VIBRANT ACCENT BAND (Matching Inngest's middle accent section) ── -->
		<section class="rounded-[6px] border border-[#00C48C]/30 bg-gradient-to-r from-[#042f2e]/90 via-[#0a3d34]/70 to-[#042f2e]/90 p-8 sm:p-14 my-16 shadow-[rgb(28,28,28)_0px_0px_0px_2px]">
			<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
				<div class="max-w-xl">
					<span class="text-xs font-mono uppercase tracking-widest text-[#00C48C] font-semibold block mb-2">
						Audited Compliance Architecture
					</span>
					<h3 class="text-2xl sm:text-3xl font-normal tracking-[-0.035em] text-[#ffffff] leading-snug">
						From monthly attendance freeze to corporate bank wire release in seconds.
					</h3>
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono">
					<div>
						<div class="text-2xl font-bold text-[#00C48C]">100%</div>
						<div class="text-[11px] text-[#b3b3b3] mt-1">Deterministic Pure TypeScript</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-white">7 Brackets</div>
						<div class="text-[11px] text-[#b3b3b3] mt-1">MoR Proclamation 979/2016</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-white">18 Staff</div>
						<div class="text-[11px] text-[#b3b3b3] mt-1">Pre-Seeded Organization</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-[#00C48C]">CBE Ready</div>
						<div class="text-[11px] text-[#b3b3b3] mt-1">ISO 20022 Wire Export</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ── ALTERNATING STEPPER TIMELINE (Matching Inngest left rail + right card) ── -->
		<section id="timeline" class="py-16 lg:py-24">
			<div class="text-center max-w-2xl mx-auto mb-16">
				<div class="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00C48C] mb-2">
					<CheckCircle size={14} weight="fill" />
					<span>End-to-End Compliance Pipeline</span>
				</div>
				<h2 class="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#ffffff] mb-3">
					How Rosterly executes a compliance cycle
				</h2>
				<p class="text-sm text-[#b3b3b3]">
					Click any phase along the stepper to inspect its statutory mechanics and operational artifacts.
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
				<!-- Left Vertical Timeline Stepper Rail -->
				<div class="lg:col-span-5 relative pl-6 border-l-2 border-[#1f1e1d] space-y-10">
					{#each timelineSteps as step}
						{@const isCurrent = activeTimelineStep === step.id}
						<button
							onclick={() => (activeTimelineStep = step.id)}
							class="text-left w-full group cursor-pointer relative transition-inngest"
						>
							<!-- Stepper Node Dot -->
							<div
								class="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 transition-inngest
									   {isCurrent ? 'bg-[#00C48C] border-[#0c0a09] ring-4 ring-[#00C48C]/20' : 'bg-[#1c1c1c] border-[#1f1e1d] group-hover:border-[#00C48C]'}"
							></div>

							<div class="flex items-center gap-2 mb-1">
								<span class="text-xs font-mono uppercase tracking-wider {isCurrent ? 'text-[#00C48C] font-semibold' : 'text-[#737373]'}">
									{step.number} / {step.category}
								</span>
								<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-[#1f1e1d] text-[#b3b3b3]">
									{step.badge}
								</span>
							</div>
							<h4 class="text-base font-normal tracking-tight text-white mb-1.5 {isCurrent ? 'text-[#00C48C]' : 'group-hover:text-white'}">
								{step.title}
							</h4>
							<p class="text-xs text-[#b3b3b3] leading-relaxed">
								{step.description}
							</p>
						</button>
					{/each}
				</div>

				<!-- Right Interactive Showcase Card for Active Step -->
				<div class="lg:col-span-7 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-8 shadow-[rgb(28,28,28)_0px_0px_0px_2px]">
					{#if activeTimelineStep === 1}
						<!-- Step 1: 7-Tier Tax Schedule Inspector -->
						<div>
							<div class="flex items-center justify-between pb-4 mb-4 border-b border-[#1f1e1d]">
								<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
									<Scales size={16} />
									<span>MoR 7-Tier Statutory Tax Schedule</span>
								</div>
								<span class="text-[10px] font-mono text-[#b3b3b3]">Proclamation 979/2016</span>
							</div>
							<p class="text-xs text-[#b3b3b3] leading-relaxed mb-4">
								Every Birr is calculated deterministically with statutory deductibles applied per income bracket:
							</p>
							<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] overflow-hidden font-mono text-xs">
								<div class="grid grid-cols-3 bg-[#1c1c1c] p-2.5 text-[11px] font-semibold text-[#b3b3b3] border-b border-[#1f1e1d]">
									<span>Monthly Taxable Bracket</span>
									<span class="text-center">Rate</span>
									<span class="text-right">Deduction (ETB)</span>
								</div>
								<div class="divide-y divide-[#1f1e1d] text-[11px]">
									<div class="grid grid-cols-3 p-2.5 text-[#b3b3b3]">
										<span>0 – 600 ETB</span>
										<span class="text-center text-[#00C48C]">0%</span>
										<span class="text-right">0.00</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-[#b3b3b3]">
										<span>601 – 1,650 ETB</span>
										<span class="text-center text-white">10%</span>
										<span class="text-right">60.00</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-[#b3b3b3]">
										<span>1,651 – 3,200 ETB</span>
										<span class="text-center text-white">15%</span>
										<span class="text-right">142.50</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-[#b3b3b3]">
										<span>3,201 – 5,250 ETB</span>
										<span class="text-center text-white">20%</span>
										<span class="text-right">302.50</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-[#b3b3b3]">
										<span>5,251 – 7,800 ETB</span>
										<span class="text-center text-white">25%</span>
										<span class="text-right">565.00</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-[#b3b3b3]">
										<span>7,801 – 10,900 ETB</span>
										<span class="text-center text-white">30%</span>
										<span class="text-right">955.00</span>
									</div>
									<div class="grid grid-cols-3 p-2.5 text-[#b3b3b3] bg-[#042f2e]/20">
										<span class="text-[#00C48C]">&gt; 10,900 ETB</span>
										<span class="text-center text-[#00C48C] font-bold">35%</span>
										<span class="text-right text-[#00C48C]">1,500.00</span>
									</div>
								</div>
							</div>
						</div>
					{:else if activeTimelineStep === 2}
						<!-- Step 2: Pension Agency Remittance Voucher -->
						<div>
							<div class="flex items-center justify-between pb-4 mb-4 border-b border-[#1f1e1d]">
								<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
									<Shield size={16} />
									<span>POESSA Mandatory Pension Remittance</span>
								</div>
								<span class="text-[10px] font-mono text-[#b3b3b3]">Private Org Pension</span>
							</div>
							<p class="text-xs text-[#b3b3b3] leading-relaxed mb-4">
								Statutory split deposited to the Private Organization Employees’ Pension Agency:
							</p>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
								<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4">
									<div class="text-[10px] font-mono text-[#b3b3b3] uppercase">Employee 7% Deduction</div>
									<div class="text-lg font-mono font-bold text-[#00C48C] mt-1">ETB 26,481.00</div>
									<div class="text-[11px] text-[#737373] mt-1 font-sans">Exempt from monthly income tax base</div>
								</div>
								<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4">
									<div class="text-[10px] font-mono text-[#b3b3b3] uppercase">Employer 11% Match</div>
									<div class="text-lg font-mono font-bold text-white mt-1">ETB 41,613.00</div>
									<div class="text-[11px] text-[#737373] mt-1 font-sans">Mandatory corporate social security</div>
								</div>
							</div>
							<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3 text-xs font-mono flex items-center justify-between text-[#b3b3b3]">
								<span>Total Remittance Voucher Due:</span>
								<span class="text-white font-bold">ETB 68,094.00</span>
							</div>
						</div>
					{:else if activeTimelineStep === 3}
						<!-- Step 3: Governance Gate Sign-Off -->
						<div>
							<div class="flex items-center justify-between pb-4 mb-4 border-b border-[#1f1e1d]">
								<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
									<Shield size={16} />
									<span>Fiduciary Separation of Duties Gate</span>
								</div>
								<span class="text-[10px] font-mono text-[#00C48C] bg-[#0c0a09] px-2 py-0.5 rounded-full border border-[#1f1e1d]">
									Strict RBAC
								</span>
							</div>
							<p class="text-xs text-[#b3b3b3] leading-relaxed mb-4">
								Disbursement integrity prevents rogue or fraudulent wire executions:
							</p>
							<div class="space-y-3 font-mono text-xs">
								<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<CheckCircle size={16} class="text-[#00C48C]" weight="fill" />
										<span class="text-white">Finance & Treasury</span>
									</div>
									<span class="text-[11px] text-[#00C48C]">Drafted &amp; Audited</span>
								</div>
								<div class="rounded-[6px] border border-[#00C48C]/40 bg-[#042f2e]/20 p-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="h-2 w-2 rounded-full bg-[#00C48C] animate-ping"></span>
										<span class="text-white">Managing Director (Owner)</span>
									</div>
									<span class="text-[11px] text-[#00C48C] font-semibold">Sole Authorization Authority</span>
								</div>
							</div>
						</div>
					{:else}
						<!-- Step 4: CBE Direct Batch Exporter -->
						<div>
							<div class="flex items-center justify-between pb-4 mb-4 border-b border-[#1f1e1d]">
								<div class="flex items-center gap-2 text-xs font-mono text-[#00C48C]">
									<Bank size={16} />
									<span>Commercial Bank of Ethiopia (CBE) Batch</span>
								</div>
								<div class="flex items-center gap-1.5">
									<button
										onclick={copyBatchCSV}
										class="text-[11px] font-mono text-[#b3b3b3] hover:text-white flex items-center gap-1 bg-[#0c0a09] px-2.5 py-1 rounded-[6px] border border-[#1f1e1d] transition-colors cursor-pointer"
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
										class="text-[11px] font-mono text-[#0c0a09] font-bold hover:bg-[#00ab7a] flex items-center gap-1 bg-[#00C48C] px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer"
										title="Download CSV"
									>
										<DownloadSimple size={12} />
										<span>CSV</span>
									</button>
								</div>
							</div>
							<p class="text-xs text-[#b3b3b3] leading-relaxed mb-3">
								ISO 20022 compliant corporate batch file ready for upload to CBE Corporate Portal:
							</p>
							<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3 font-mono text-[11px] space-y-1 overflow-x-auto text-[#b3b3b3]">
								<div class="text-[#737373]"># CBE Wire Transfer Batch (Cycle 2026-09)</div>
								<div class="text-[#00C48C] font-semibold">Account,Beneficiary,Amount_ETB,Ref</div>
								<div class="text-white">1000188923456,"Abebe Kebede",38200.00,SAL-09</div>
								<div class="text-white">1000299481203,"Hana Mulugeta",22657.50,SAL-09</div>
								<div class="text-white">1000344810294,"Yonas Alemu",17821.50,SAL-09</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- ── PERSONA PERSPECTIVES & TELEGRAM WORKER BENTO ──────────────────── -->
		<section id="roles" class="py-16 lg:py-24">
			<div class="text-center max-w-2xl mx-auto mb-14">
				<div class="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00C48C] mb-2">
					<Shield size={14} />
					<span>Role Perspectives &amp; Self-Service</span>
				</div>
				<h2 class="text-3xl sm:text-4xl font-normal tracking-[-0.035em] text-[#ffffff] mb-3">
					Built for every stakeholder in the organization
				</h2>
				<p class="text-sm text-[#b3b3b3]">
					Test authentic permission scopes with 1-click live demo logins or interact with the Telegram bot simulator.
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- BENTO CARD 1 (SPAN 2): Separation of Duties Role Switcher -->
				<div class="lg:col-span-2 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-8 shadow-[rgb(28,28,28)_0px_0px_0px_2px]">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-[#1f1e1d] gap-3">
						<div>
							<span class="text-xs font-mono uppercase tracking-wider text-[#00C48C] block mb-1">Interactive RBAC</span>
							<h3 class="text-xl font-normal text-white tracking-[-0.02em]">Role-Based Access Matrix</h3>
						</div>

						<button
							onclick={() => launchAsRole(currentRole.email)}
							disabled={isLoggingIn}
							class="inline-flex items-center gap-2 rounded-[6px] bg-[#00C48C] hover:bg-[#00ab7a] text-[#0c0a09] font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-inngest disabled:opacity-50 cursor-pointer self-start sm:self-auto"
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
										 ? 'bg-[#00C48C] text-[#0c0a09] font-bold'
										 : 'bg-[#0c0a09] text-[#b3b3b3] hover:text-white border border-[#1f1e1d]'}"
							>
								<span>{roleMeta[r].title}</span>
								<span class="text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase {activeRole === r ? 'bg-black/20 text-[#0c0a09]' : 'bg-[#1c1c1c] text-[#737373]'}">
									{roleMeta[r].badge}
								</span>
							</button>
						{/each}
					</div>

					<!-- Role Preview Box -->
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4">
						<div class="flex items-center justify-between text-xs mb-3">
							<span class="font-medium text-white">{currentRole.headline}</span>
							<span class="font-mono text-[10px] text-[#00C48C] bg-[#1c1c1c] px-2.5 py-0.5 rounded-full border border-[#1f1e1d]">
								Scope: {currentRole.workflowState}
							</span>
						</div>
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
							{#each currentRole.stats as stat}
								<div class="rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-3">
									<div class="text-[10px] text-[#b3b3b3] uppercase font-mono">{stat.label}</div>
									<div class="text-sm font-mono font-medium text-white mt-1">{stat.value}</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- BENTO CARD 2 (SPAN 1): Telegram Mobile Worker Simulator -->
				<div class="rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-8 shadow-[rgb(28,28,28)_0px_0px_0px_2px] flex flex-col justify-between">
					<div>
						<div class="flex items-center justify-between mb-4">
							<div class="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#0c0a09] border border-[#1f1e1d] text-white">
								<PaperPlaneRight size={20} weight="duotone" class="text-[#00C48C]" />
							</div>
							<span class="text-[10px] font-mono text-[#00C48C] bg-[#0c0a09] px-2 py-0.5 rounded-full border border-[#1f1e1d]">Telegram API</span>
						</div>
						<h3 class="text-lg font-normal text-white mb-1.5 tracking-[-0.02em]">Telegram Mobile Worker</h3>
						<p class="text-xs text-[#b3b3b3] leading-relaxed mb-3">
							Interactive bot simulator for staff self-service and payslip queries:
						</p>

						<!-- Command Pills -->
						<div class="flex flex-wrap gap-1.5 mb-3">
							{#each (['/payslip', '/leave', '/status', '/letter'] as const) as cmd}
								<button
									onclick={() => (activeCommand = cmd)}
									class="px-2.5 py-1 rounded-full font-mono text-[10px] transition-inngest cursor-pointer
										   {activeCommand === cmd
											 ? 'bg-[#00C48C] text-[#0c0a09] font-bold'
											 : 'bg-[#0c0a09] text-[#b3b3b3] hover:text-white border border-[#1f1e1d]'}"
								>
									{cmd}
								</button>
							{/each}
						</div>
					</div>

					<!-- Simulated Bot Thread -->
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3 space-y-2 text-xs">
						<div class="bg-[#1c1c1c] border border-[#1f1e1d] text-white rounded-[6px] py-1 px-2.5 text-[11px] font-mono text-right">
							{currentBot.cmd}
						</div>
						<div class="bg-[#1c1c1c] border border-[#1f1e1d] text-[#ffffff] rounded-[6px] p-2.5 text-[11px]">
							<span class="font-medium text-white block mb-1 text-[11px]">{currentBot.replyTitle}</span>
							{#each currentBot.details as d}
								<div class="flex items-center justify-between text-[10px] py-0.5">
									<span class="text-[#b3b3b3]">{d.label}:</span>
									<span class="font-mono font-medium {d.highlight ? 'text-[#00C48C]' : 'text-[#ffffff]'}">{d.val}</span>
								</div>
							{/each}
							<div class="border-t border-[#1f1e1d] mt-1.5 pt-1 text-[9px] text-[#737373] font-mono">
								{currentBot.footer}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ── CALL TO ACTION BANNER (No duplicate GitHub buttons) ──────────── -->
		<section class="rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-8 sm:p-16 text-center my-16 shadow-[rgb(28,28,28)_0px_0px_0px_2px]">
			<div class="max-w-2xl mx-auto">
				<h2 class="text-3xl sm:text-4xl font-normal text-white tracking-[-0.035em] mb-4">
					Test the complete workforce platform
				</h2>
				<p class="text-sm text-[#b3b3b3] mb-8 leading-relaxed">
					All roles, progressive tax schedules, CBE export files, and pre-seeded mock employees are live and ready to explore in your browser.
				</p>
				<a
					href="/login"
					class="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#00C48C] hover:bg-[#00ab7a] text-[#0c0a09] font-bold text-xs uppercase tracking-wider h-[42px] px-8 transition-inngest shadow-[rgb(28,28,28)_0px_0px_0px_2px]"
				>
					<span>Open Role Selector</span>
					<ArrowRight size={14} weight="bold" />
				</a>
			</div>
		</section>
	</main>

	<!-- ── FOOTER ───────────────────────────────────────────────────────── -->
	<footer class="border-t border-[#1f1e1d] bg-[#0c0a09] py-10 text-center text-xs text-[#b3b3b3] font-mono">
		<div class="mx-auto max-w-[1440px] px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2 text-[#b3b3b3]">
				<TreeStructure size={16} class="text-[#00C48C]" weight="fill" />
				<span class="font-medium text-white">Rosterly</span>
				<span>&bull;</span>
				<span>Ethiopian Compliance-First Payroll Engine</span>
			</div>
			<div>
				Built with SvelteKit (Svelte 5) &bull; Drizzle ORM &bull; Proclamation 979/2016
			</div>
		</div>
	</footer>
</div>
