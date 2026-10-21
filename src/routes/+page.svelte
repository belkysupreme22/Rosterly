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
		QrCode,
		Buildings,
		CheckCircle,
		Lightning,
		Play,
		Code,
		GitBranch,
		Cpu,
		Clock,
		ArrowsClockwise
	} from 'phosphor-svelte';
	import { authClient } from '$lib/auth-client';

	const GITHUB_URL = 'https://github.com/belkysupreme22/Rosterly';

	// ── Inngest-Style Workflow Pipeline Visualizer (Interactive Switcher) ────
	let pipelineMode = $state<'visual' | 'code'>('visual');
	let activePipelineStep = $state<number>(3); // default highlight on approval step

	const workflowSteps = [
		{
			id: 1,
			type: 'trigger',
			name: 'Event: payroll/monthly.cutoff',
			badge: 'Trigger',
			badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
			duration: '09:00:00 EAT',
			status: 'Dispatched',
			description: 'Fired on the 25th of every month. Freezes attendance, unpaid absences, and salary advances.',
			meta: {
				payload: '{ companyId: "ETH-ROSTERLY-01", cycle: "2026-09", cutoffDay: 25 }'
			}
		},
		{
			id: 2,
			type: 'step',
			name: 'step.run("compute-mor-statutory-taxes")',
			badge: 'Pure Engine',
			badgeColor: 'bg-emerald-500/10 text-[#00C48C] border-emerald-500/20',
			duration: '1.4ms',
			status: 'Completed',
			description: 'Evaluates all 18 staff against the 7 Ministry of Revenue progressive income tax brackets.',
			meta: {
				engine: '@rosterly/payroll-engine (zero-dependency pure TypeScript)',
				output: 'Gross: ETB 378,300.00 • MoR Tax Pool: ETB 68,410.00'
			}
		},
		{
			id: 3,
			type: 'step',
			name: 'step.run("compute-pension-contributions")',
			badge: 'Directive 979',
			badgeColor: 'bg-emerald-500/10 text-[#00C48C] border-emerald-500/20',
			duration: '0.8ms',
			status: 'Completed',
			description: 'Applies mandatory 7% employee contribution (tax-exempt) + 11% employer match.',
			meta: {
				employeeFund: '7% (ETB 26,481.00)',
				employerFund: '11% (ETB 41,613.00)',
				totalFiling: 'ETB 68,094.00 to Private Organization Pension Agency'
			}
		},
		{
			id: 4,
			type: 'gate',
			name: 'step.waitForApproval("fiduciary-signoff")',
			badge: 'RBAC Gate',
			badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
			duration: 'Pending',
			status: 'Awaiting Owner Authorization',
			description: 'Separation of duties: Finance has drafted the cycle; waiting for Managing Director sole approval.',
			meta: {
				authorizedRole: 'Owner (owner@acme.com)',
				fiduciaryAction: 'Audit draft run & release wire disbursement'
			}
		},
		{
			id: 5,
			type: 'step',
			name: 'step.run("generate-cbe-bulk-batch")',
			badge: 'Wire Batch',
			badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
			duration: 'Queued',
			status: 'Ready on Authorization',
			description: 'Exports Commercial Bank of Ethiopia CSV file ready for corporate banking batch portal.',
			meta: {
				format: 'CBE Corporate Wire Batch CSV (ISO 20022 formatted)',
				beneficiaries: '18 CBE account transfers'
			}
		}
	];

	const selectedStepObj = $derived(workflowSteps.find((s) => s.id === activePipelineStep) || workflowSteps[0]);

	const sampleWorkflowCode = `// src/lib/server/payroll/workflow.ts
import { inngest } from '$lib/server/inngest';
import { calculatePayroll } from '@rosterly/payroll-engine';

export const processPayrollCycle = inngest.createFunction(
  { id: "process-monthly-payroll", concurrency: 1 },
  { event: "payroll/monthly.cutoff" },
  async ({ event, step }) => {
    // 1. Calculate statutory Ethiopian tax and 7% pension
    const calculations = await step.run("calculate-statutory-taxes", async () => {
      const staff = await db.query.employee.findMany();
      return staff.map(emp => calculatePayroll({ employee: emp }));
    });

    // 2. Fiduciary governance gate: Wait for Owner executive authorization
    const authorization = await step.waitForEvent("wait-for-owner-approval", {
      event: "payroll/cycle.authorized",
      timeout: "48h",
      match: "data.companyId"
    });

    // 3. Generate Commercial Bank of Ethiopia (CBE) bulk wire export
    await step.run("generate-cbe-batch", async () => {
      return generateCbeBatchExport(authorization.data.payrollRunId);
    });
  }
);`;

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
			replyTitle: '📜 Official Employment & Salary Certificate',
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

<!-- Deep Matte Obsidian Canvas (#0c0a09) with Inngest Neutral Surfaces (#1c1c1c) and Accent (#f65c4f) -->
<div class="min-h-screen bg-[#0c0a09] text-[#ffffff] selection:bg-[#f65c4f]/30 selection:text-white relative overflow-hidden font-sans">
	<!-- Inngest Micro Grid Pattern -->
	<div class="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:36px_36px]"></div>

	<!-- Top Bar -->
	<header class="sticky top-0 z-50 border-b border-[#1f1e1d] bg-[#0c0a09]/90 backdrop-blur-xl h-[88px] flex items-center">
		<div class="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 sm:px-12">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 group">
				<div class="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#1c1c1c] border border-[#1f1e1d] text-[#ffffff] shadow-[rgb(28,28,28)_0px_0px_0px_2px]">
					<TreeStructure size={18} weight="fill" class="text-[#f65c4f]" />
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm font-semibold tracking-tight text-[#ffffff]">Rosterly</span>
					<span class="text-[10px] uppercase tracking-widest font-mono font-medium px-2 py-0.5 rounded-full bg-[#1c1c1c] text-[#b3b3b3] border border-[#1f1e1d]">v2.4</span>
				</div>
			</a>

			<!-- Actions -->
			<div class="flex items-center gap-3">
				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noreferrer"
					class="hidden sm:inline-flex items-center gap-1.5 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#b3b3b3] hover:text-white hover:border-[#ffffff2e] transition-all"
				>
					<GithubLogo size={14} weight="bold" />
					<span>GitHub</span>
				</a>
				<a
					href="/login"
					class="inline-flex items-center gap-2 rounded-[6px] bg-[#f65c4f] hover:bg-[#d94a2b] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
				>
					<span>Open Workspace</span>
					<ArrowRight size={14} weight="bold" />
				</a>
			</div>
		</div>
	</header>

	<main class="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-12 pt-16 pb-36">
		<!-- ── INNGEST-STYLE HERO ─────────────────────────────────────────── -->
		<div class="text-center max-w-4xl mx-auto mb-20">
			<!-- Announcement Pill -->
			<a
				href="/login"
				class="inline-flex items-center gap-2 rounded-full border border-[#1f1e1d] bg-[#1c1c1c] hover:border-[#ffffff2e] px-4 py-1.5 text-xs font-mono text-[#ffffff] mb-8 transition-all"
			>
				<span class="h-2 w-2 rounded-full bg-[#f65c4f] animate-pulse"></span>
				<span class="font-medium text-[#ffffff]">Ethiopian MoR Proclamation 979/2016</span>
				<span class="text-[#b3b3b3]">|</span>
				<span class="text-[#b3b3b3]">Private Pension Directive →</span>
			</a>

			<!-- Main Headline -->
			<h1 class="text-4xl sm:text-6xl lg:text-7xl font-normal tracking-[-0.035em] text-[#ffffff] leading-[1.08] mb-6">
				The durable workforce &amp; payroll engine for Ethiopia.
			</h1>

			<!-- Subtext -->
			<p class="text-base sm:text-lg text-[#b3b3b3] max-w-2xl mx-auto leading-relaxed mb-10">
				Replace fragile Excel sheets and manual chat approvals with an audited, deterministic platform. Calculate progressive taxes, stream CBE wire batches, and empower staff over Telegram.
			</p>

			<!-- Action Buttons -->
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
				<a
					href="/login"
					class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-[6px] bg-[#f65c4f] hover:bg-[#d94a2b] text-white font-semibold text-xs uppercase tracking-wider h-[42px] px-6 transition-all cursor-pointer"
				>
					<span>Explore Pre-Seeded Company</span>
					<ArrowRight size={14} weight="bold" />
				</a>
				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noreferrer"
					class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] hover:border-[#ffffff2e] text-[#ffffff] font-semibold text-xs uppercase tracking-wider h-[42px] px-6 transition-all cursor-pointer"
				>
					<GithubLogo size={14} weight="bold" />
					<span>Inspect Code on GitHub</span>
				</a>
			</div>
		</div>

		<!-- ── SIGNATURE FEATURE: INNGEST-STYLE PIPELINE OBSERVER ─────────── -->
		<section class="rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-8 mb-24 relative overflow-hidden shadow-[rgb(28,28,28)_0px_0px_0px_2px]">
			<!-- Header & Mode Switcher (Visual Tree vs Code) -->
			<div class="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-[#1f1e1d] gap-4">
				<div>
					<div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#f65c4f] mb-1">
						<GitBranch size={15} />
						<span>Workflow Execution Pipeline</span>
					</div>
					<h2 class="text-xl sm:text-2xl font-normal tracking-[-0.02em] text-[#ffffff]">How Rosterly Runs a Compliance Cycle</h2>
					<p class="text-xs text-[#b3b3b3] mt-1">Deterministic state transitions from monthly cutoff to CBE bank batch release.</p>
				</div>

				<!-- Visual vs Code Tab Switcher -->
				<div class="inline-flex rounded-full border border-[#1f1e1d] bg-[#0c0a09] p-1 self-start md:self-auto">
					<button
						onclick={() => (pipelineMode = 'visual')}
						class="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-mono font-medium transition-all cursor-pointer
							   {pipelineMode === 'visual' ? 'bg-[#f65c4f] text-white' : 'text-[#b3b3b3] hover:text-white'}"
					>
						<Cpu size={14} />
						<span>Pipeline Tree</span>
					</button>
					<button
						onclick={() => (pipelineMode = 'code')}
						class="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-mono font-medium transition-all cursor-pointer
							   {pipelineMode === 'code' ? 'bg-[#f65c4f] text-white' : 'text-[#b3b3b3] hover:text-white'}"
					>
						<Code size={14} />
						<span>Workflow Code</span>
					</button>
				</div>
			</div>

			{#if pipelineMode === 'visual'}
				<!-- Inngest-style Step Node Graph -->
				<div class="grid grid-cols-1 lg:grid-cols-5 gap-3 relative mb-6">
					{#each workflowSteps as step, idx}
						{@const isSelected = activePipelineStep === step.id}
						<button
							onclick={() => (activePipelineStep = step.id)}
							class="text-left rounded-[6px] border p-4 transition-all duration-200 cursor-pointer relative group
								   {isSelected
									 ? 'border-[#f65c4f] bg-[#0c0a09] shadow-[rgb(246,92,79)_2px_0px_0px_0px_inset]'
									 : 'border-[#1f1e1d] bg-[#1c1c1c] hover:border-[#ffffff2e]'}"
						>
							<!-- Step Number & Status Indicator -->
							<div class="flex items-center justify-between mb-2">
								<span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full border border-[#1f1e1d] bg-[#0c0a09] text-[#b3b3b3]">
									{step.badge}
								</span>
								<span class="text-[10px] font-mono text-[#b3b3b3]">
									{step.duration}
								</span>
							</div>

							<!-- Step Name -->
							<div class="text-xs font-mono text-[#ffffff] line-clamp-1 mb-1">
								{step.name}
							</div>

							<!-- Status pill -->
							<div class="flex items-center gap-1.5 text-[11px] {isSelected ? 'text-[#f65c4f]' : 'text-[#b3b3b3]'}">
								{#if step.status.includes('Completed')}
									<CheckCircle size={12} weight="fill" class="text-[#f65c4f]" />
								{:else if step.status.includes('Awaiting')}
									<span class="h-2 w-2 rounded-full bg-[#f65c4f] animate-ping"></span>
								{:else}
									<Clock size={12} class="text-[#b3b3b3]" />
								{/if}
								<span class="truncate">{step.status}</span>
							</div>
						</button>
					{/each}
				</div>

				<!-- Step Detail Inspector (Inngest Log Inspection Panel) -->
				{@const selectedStepObj = workflowSteps.find(s => s.id === activePipelineStep) || workflowSteps[0]}
				<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4 sm:p-5 font-mono text-xs">
					<div class="flex items-center justify-between pb-3 mb-3 border-b border-[#1f1e1d]">
						<div class="flex items-center gap-2">
							<span class="h-2 w-2 rounded-full bg-[#f65c4f]"></span>
							<span class="text-[#ffffff] font-bold">{selectedStepObj.name}</span>
						</div>
						<span class="text-[#b3b3b3] text-[11px]">Step ID: #{selectedStepObj.id}</span>
					</div>

					<p class="text-[#b3b3b3] text-xs mb-3 font-sans leading-relaxed">
						{selectedStepObj.description}
					</p>

					<div class="bg-[#1c1c1c] border border-[#1f1e1d] rounded-[6px] p-3 text-[11px] space-y-1 text-[#b3b3b3]">
						{#each Object.entries(selectedStepObj.meta) as [key, val]}
							<div class="flex items-start gap-2">
								<span class="text-[#b3b3b3] min-w-28 capitalize">{key}:</span>
								<span class="text-[#ffffff] font-medium">{val}</span>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Inngest Workflow Code Viewer -->
				<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-5 font-mono text-xs text-[#b3b3b3] overflow-x-auto relative">
					<div class="flex items-center justify-between pb-3 mb-3 border-b border-[#1f1e1d] text-[11px] text-[#b3b3b3]">
						<span>TypeScript Workflow Definition</span>
						<span>packages/payroll-engine/src/index.ts</span>
					</div>
					<pre class="leading-relaxed text-[11px]"><code class="text-[#f65c4f]">{sampleWorkflowCode}</code></pre>
				</div>
			{/if}
		</section>

		<!-- ── THE ASYMMETRIC BENTO GRID (INNGEST STYLE) ───────────────────── -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
			<!-- BENTO CARD 1 (SPAN 2): Interactive Ethiopian Tax Simulator -->
			<div class="md:col-span-2 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-8 relative overflow-hidden shadow-[rgb(28,28,28)_0px_0px_0px_2px] hover:border-[#ffffff2e] transition-all">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-[#1f1e1d] gap-3">
					<div>
						<div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#f65c4f] mb-1">
							<Terminal size={14} />
							<span>Zero-Dependency Engine</span>
						</div>
						<h3 class="text-xl font-normal text-[#ffffff] tracking-[-0.02em]">Live Ethiopian Gross-to-Net Simulator</h3>
					</div>

					<!-- Tier Badge & Period Toggle -->
					<div class="flex items-center gap-2">
						<div class="inline-flex rounded-full border border-[#1f1e1d] bg-[#0c0a09] p-0.5 text-xs">
							<button
								onclick={() => (period = 'monthly')}
								class="rounded-full px-3 py-1 font-semibold transition-all cursor-pointer {period === 'monthly' ? 'bg-[#f65c4f] text-white' : 'text-[#b3b3b3] hover:text-white'}"
							>
								Monthly
							</button>
							<button
								onclick={() => (period = 'annual')}
								class="rounded-full px-3 py-1 font-semibold transition-all cursor-pointer {period === 'annual' ? 'bg-[#f65c4f] text-white' : 'text-[#b3b3b3] hover:text-white'}"
							>
								Annual
							</button>
						</div>

						<div class="px-2.5 py-1 rounded-full border border-[#1f1e1d] bg-[#0c0a09] text-[11px] font-mono text-[#ffffff] font-medium">
							{calc.bracketLabel}
						</div>
					</div>
				</div>

				<!-- Quick Presets -->
				<div class="mb-5 flex flex-wrap items-center gap-1.5">
					<span class="text-xs text-[#b3b3b3] mr-1">Presets:</span>
					{#each salaryPresets as p}
						<button
							onclick={() => (baseSalaryInput = p.amount)}
							class="rounded-[6px] border px-3 py-1 text-xs font-mono transition-all cursor-pointer
								   {baseSalaryInput === p.amount
									 ? 'border-[#f65c4f] bg-[#0c0a09] text-[#f65c4f] font-semibold'
									 : 'border-[#1f1e1d] bg-[#0c0a09] text-[#b3b3b3] hover:text-white hover:border-[#ffffff2e]'}"
						>
							{p.label} ({p.amount.toLocaleString()} ETB)
						</button>
					{/each}
				</div>

				<!-- Slider -->
				<div class="mb-6">
					<div class="flex items-center justify-between mb-2">
						<label for="salary-slider" class="text-xs font-semibold text-[#ffffff] flex items-center gap-2">
							<Sliders size={14} class="text-[#f65c4f]" />
							<span>Monthly Base Gross Salary</span>
						</label>
						<div class="flex items-center gap-1 bg-[#0c0a09] border border-[#1f1e1d] rounded-[6px] px-3 py-1 font-mono text-sm font-semibold text-[#ffffff]">
							<span class="text-[#b3b3b3] text-xs">ETB</span>
							<input
								id="salary-number"
								type="number"
								bind:value={baseSalaryInput}
								min="0"
								max="250000"
								step="1000"
								class="w-24 bg-transparent text-right text-white focus:outline-none"
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
						class="w-full h-2 bg-[#0c0a09] rounded-lg appearance-none cursor-pointer accent-[#f65c4f]"
					/>
				</div>

				<!-- Visual Distribution Bar -->
				<div class="mb-6 p-4 rounded-[6px] bg-[#0c0a09] border border-[#1f1e1d]">
					<div class="flex items-center justify-between text-xs font-mono mb-2">
						<span class="text-[#b3b3b3] text-[11px]">Salary Split Breakdown</span>
						<div class="flex items-center gap-3 text-[10px]">
							<span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-[#ffffff]"></span>Net ({calc.netPercent}%)</span>
							<span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-[#f65c4f]"></span>Tax ({calc.taxPercent}%)</span>
							<span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-[#737373]"></span>Pension ({calc.pensionPercent}%)</span>
						</div>
					</div>
					<div class="h-2.5 w-full rounded-full bg-[#1c1c1c] overflow-hidden flex">
						<div class="h-full bg-[#ffffff] transition-all duration-300" style="width: {calc.netPercent}%"></div>
						<div class="h-full bg-[#f65c4f] transition-all duration-300" style="width: {calc.taxPercent}%"></div>
						<div class="h-full bg-[#737373] transition-all duration-300" style="width: {calc.pensionPercent}%"></div>
					</div>
				</div>

				<!-- 4 Stat Metrics -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3.5">
						<div class="text-[10px] text-[#b3b3b3] font-mono">7% Pension</div>
						<div class="text-sm font-mono font-semibold text-white mt-1">{formatETB(calc.employeePension)}</div>
					</div>
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3.5">
						<div class="text-[10px] text-[#b3b3b3] font-mono">Taxable Base</div>
						<div class="text-sm font-mono font-semibold text-[#b3b3b3] mt-1">{formatETB(calc.base - calc.employeePension)}</div>
					</div>
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3.5">
						<div class="text-[10px] text-[#f65c4f] font-mono">Income Tax</div>
						<div class="text-sm font-mono font-semibold text-[#f65c4f] mt-1">{formatETB(calc.incomeTax)}</div>
					</div>
					<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3.5">
						<div class="text-[10px] text-[#ffffff] font-mono">Net Take-Home</div>
						<div class="text-sm font-mono font-bold text-white mt-1">{formatETB(calc.netPay)}</div>
					</div>
				</div>
			</div>

			<!-- BENTO CARD 2 (SPAN 1): CBE Bulk Wire Exporter -->
			<div class="rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-8 shadow-[rgb(28,28,28)_0px_0px_0px_2px] flex flex-col justify-between hover:border-[#ffffff2e] transition-all">
				<div>
					<div class="flex items-center justify-between mb-4">
						<div class="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#0c0a09] border border-[#1f1e1d] text-white">
							<Coins size={20} weight="duotone" />
						</div>
						<div class="flex items-center gap-1.5">
							<button
								onclick={copyBatchCSV}
								class="text-[11px] font-mono text-[#b3b3b3] hover:text-white flex items-center gap-1 bg-[#0c0a09] px-2.5 py-1 rounded-[6px] border border-[#1f1e1d] transition-colors cursor-pointer"
							>
								{#if copiedBatch}
									<Check size={12} class="text-[#f65c4f]" />
									<span class="text-[#f65c4f]">Copied</span>
								{:else}
									<Copy size={12} />
									<span>Copy</span>
								{/if}
							</button>
							<button
								onclick={downloadBatchCSV}
								class="text-[11px] font-mono text-white hover:bg-[#d94a2b] flex items-center gap-1 bg-[#f65c4f] px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer"
								title="Download CSV"
							>
								<DownloadSimple size={12} />
								<span>CSV</span>
							</button>
						</div>
					</div>
					<h3 class="text-lg font-normal text-white mb-1.5 tracking-[-0.02em]">CBE Wire Batch Exporter</h3>
					<p class="text-xs text-[#b3b3b3] leading-relaxed mb-4">
						Generates upload-ready CSV files for Commercial Bank of Ethiopia bulk portal disbursement.
					</p>
				</div>

				<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-3 font-mono text-[10px] text-[#b3b3b3] overflow-x-auto space-y-1">
					<div class="text-[#737373]"># CBE Wire Transfer Batch</div>
					<div class="text-[#f65c4f] font-semibold">Account,Beneficiary,ETB,Curr</div>
					<div class="text-[#ffffff]">1000188923456,"Abebe Kebede",38200.00</div>
					<div class="text-[#ffffff]">1000299481203,"Hana Mulugeta",22657.50</div>
					<div class="text-[#ffffff]">1000344810294,"Yonas Alemu",17821.50</div>
				</div>
			</div>

			<!-- BENTO CARD 3 (SPAN 1): Telegram Worker Self-Service -->
			<div class="rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-8 shadow-[rgb(28,28,28)_0px_0px_0px_2px] flex flex-col justify-between hover:border-[#ffffff2e] transition-all">
				<div>
					<div class="flex items-center justify-between mb-4">
						<div class="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#0c0a09] border border-[#1f1e1d] text-white">
							<PaperPlaneRight size={20} weight="duotone" />
						</div>
						<span class="text-[10px] font-mono text-[#b3b3b3] bg-[#0c0a09] px-2 py-0.5 rounded-full border border-[#1f1e1d]">Telegram API</span>
					</div>
					<h3 class="text-lg font-normal text-white mb-1.5 tracking-[-0.02em]">Telegram Mobile Worker</h3>
					<p class="text-xs text-[#b3b3b3] leading-relaxed mb-3">
						Interactive simulation: click command pills below to test bot responses:
					</p>

					<!-- Command Pills -->
					<div class="flex flex-wrap gap-1.5 mb-3">
						{#each (['/payslip', '/leave', '/status', '/letter'] as const) as cmd}
							<button
								onclick={() => (activeCommand = cmd)}
								class="px-2.5 py-1 rounded-full font-mono text-[10px] transition-all cursor-pointer
									   {activeCommand === cmd
										 ? 'bg-[#f65c4f] text-white font-semibold'
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
								<span class="font-mono font-medium {d.highlight ? 'text-[#f65c4f]' : 'text-[#ffffff]'}">{d.val}</span>
							</div>
						{/each}
						<div class="border-t border-[#1f1e1d] mt-1.5 pt-1 text-[9px] text-[#737373] font-mono">
							{currentBot.footer}
						</div>
					</div>
				</div>
			</div>

			<!-- BENTO CARD 4 (SPAN 2): Separation of Duties Role Perspectives -->
			<div class="md:col-span-2 rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-6 sm:p-8 shadow-[rgb(28,28,28)_0px_0px_0px_2px] relative overflow-hidden group hover:border-[#ffffff2e] transition-all">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-[#1f1e1d] gap-3">
					<div>
						<div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#f65c4f] mb-1">
							<Shield size={14} />
							<span>Corporate Governance</span>
						</div>
						<h3 class="text-xl font-normal text-white tracking-[-0.02em]">Separation-of-Duties Role Perspectives</h3>
					</div>

					<button
						onclick={() => launchAsRole(currentRole.email)}
						disabled={isLoggingIn}
						class="inline-flex items-center gap-2 rounded-[6px] bg-[#f65c4f] hover:bg-[#d94a2b] text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
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
							class="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer
								   {activeRole === r
									 ? 'bg-[#f65c4f] text-white shadow-xs'
									 : 'bg-[#0c0a09] text-[#b3b3b3] hover:text-white border border-[#1f1e1d]'}"
						>
							<span>{roleMeta[r].title}</span>
							<span class="text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase {activeRole === r ? 'bg-black/20 text-white' : 'bg-[#1c1c1c] text-[#737373]'}">
								{roleMeta[r].badge}
							</span>
						</button>
					{/each}
				</div>

				<!-- Role Preview Box -->
				<div class="rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] p-4">
					<div class="flex items-center justify-between text-xs mb-3">
						<span class="font-medium text-white">{currentRole.headline}</span>
						<span class="font-mono text-[10px] text-[#f65c4f] bg-[#1c1c1c] px-2.5 py-0.5 rounded-full border border-[#1f1e1d]">
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
		</div>

		<!-- ── CALL TO ACTION BANNER ──────────────────────────────────────── -->
		<section class="rounded-[6px] border border-[#1f1e1d] bg-[#1c1c1c] p-8 sm:p-16 text-center relative overflow-hidden shadow-[rgb(28,28,28)_0px_0px_0px_2px]">
			<div class="max-w-2xl mx-auto">
				<h2 class="text-2xl sm:text-4xl font-normal text-white tracking-[-0.035em] mb-4">
					Test the complete workforce platform
				</h2>
				<p class="text-sm text-[#b3b3b3] mb-8 leading-relaxed">
					All roles, progressive tax schedules, CBE export files, and pre-seeded mock employees are live and ready to explore in your browser.
				</p>
				<div class="flex flex-col sm:flex-row items-center justify-center gap-3">
					<a
						href="/login"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#f65c4f] hover:bg-[#d94a2b] text-white font-semibold text-xs uppercase tracking-wider h-[42px] px-6 transition-all"
					>
						<span>Open Role Selector</span>
						<ArrowRight size={14} weight="bold" />
					</a>
					<a
						href={GITHUB_URL}
						target="_blank"
						rel="noreferrer"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#1f1e1d] bg-[#0c0a09] hover:border-[#ffffff2e] text-white font-semibold text-xs uppercase tracking-wider h-[42px] px-6 transition-all"
					>
						<GithubLogo size={14} weight="bold" />
						<span>View on GitHub</span>
					</a>
				</div>
			</div>
		</section>
	</main>

	<!-- Inngest-style Footer -->
	<footer class="border-t border-[#1f1e1d] bg-[#0c0a09] py-10 text-center text-xs text-[#b3b3b3] font-mono">
		<div class="mx-auto max-w-[1440px] px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2 text-[#b3b3b3]">
				<TreeStructure size={16} class="text-[#f65c4f]" weight="fill" />
				<span class="font-medium text-white">Rosterly</span>
				<span>·</span>
				<span>Ethiopian Compliance-First Payroll Engine</span>
			</div>
			<div>
				Built with SvelteKit (Svelte 5), Drizzle ORM &bull;
				<a href={GITHUB_URL} target="_blank" rel="noreferrer" class="text-white hover:text-[#f65c4f] underline ml-1">GitHub Repository</a>
			</div>
		</div>
	</footer>
</div>
