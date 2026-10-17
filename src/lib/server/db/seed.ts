/**
 * Seed script for development data.
 *
 * Run with: npm run db:seed
 * Requires DATABASE_URL to be set in .env
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { auth } from '../auth';
import {
	company,
	department,
	employee,
	userAccount,
	leaveRequest,
	payrollRun,
	payslip,
	deductionRule,
	salaryAdvance,
	companyAsset,
	notice,
	noticeAcknowledgment,
	documentRequest,
	user
} from './schema';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL not set in .env');
	process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function seed() {
	console.log('Seeding database with full operational test suite (Departments & Finance Role)...');

	// Schema DDL migration
	try {
		await client`ALTER TYPE employee_role ADD VALUE IF NOT EXISTS 'finance'`;
	} catch {}

	await client`
		CREATE TABLE IF NOT EXISTS "department" (
			"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			"company_id" uuid NOT NULL REFERENCES "company"("id") ON DELETE CASCADE,
			"name" varchar(255) NOT NULL,
			"code" varchar(50) NOT NULL,
			"description" text,
			"lead_id" uuid,
			"budget_monthly" numeric(12, 2) DEFAULT 0,
			"color" varchar(50) DEFAULT '#00C48C',
			"created_at" timestamp with time zone DEFAULT now() NOT NULL,
			"updated_at" timestamp with time zone DEFAULT now() NOT NULL
		)
	`;

	try {
		await client`ALTER TABLE "employee" ADD COLUMN IF NOT EXISTS "department_id" uuid REFERENCES "department"("id") ON DELETE SET NULL`;
	} catch {}

	// Clean up old tables
	await client`TRUNCATE "session", "account", "verification", "user", "payslip", "leave_request", "salary_advance", "company_asset", "notice_acknowledgment", "notice", "document_request", "payroll_run", "deduction_rule", "user_account", "employee", "department", "company" CASCADE`;

	// ── 1. Company ──────────────────────────────────────────────────────────
	const [acmeCo] = await db
		.insert(company)
		.values({
			name: 'Rosterly Technologies Ltd.',
			tin: 'ETH-TIN-009876543',
			payrollCutoffDay: 25,
			payrollDisbursalDay: 30
		})
		.returning();

	console.log(`  Created company: ${acmeCo.name} (${acmeCo.id})`);

	// ── 2. Departments (Seed initial skeletons before linking leads) ─────────
	const deptData = [
		{
			name: 'Executive Office & Strategy',
			code: 'EXEC',
			description: 'Corporate leadership, board governance, capital allocation, and entity compliance.',
			budgetMonthly: '250000.00',
			color: '#F59E0B',
			companyId: acmeCo.id
		},
		{
			name: 'Finance & Treasury',
			code: 'FIN',
			description: 'Statutory Ethiopian tax filings (MoR), pension fund compliance, payroll execution, and CBE wire disbursements.',
			budgetMonthly: '180000.00',
			color: '#00C48C',
			companyId: acmeCo.id
		},
		{
			name: 'People & Culture',
			code: 'HR',
			description: 'Talent management, labor standards, staff onboarding, benefit programs, and company broadcasts.',
			budgetMonthly: '140000.00',
			color: '#10B981',
			companyId: acmeCo.id
		},
		{
			name: 'Engineering & Architecture',
			code: 'ENG',
			description: 'Cloud systems, core backend engines, mobile clients, DevOps infrastructure, and API services.',
			budgetMonthly: '350000.00',
			color: '#064E3B',
			companyId: acmeCo.id
		},
		{
			name: 'Product Design & UX',
			code: 'DES',
			description: 'User experience research, design systems, interactive prototypes, and usability testing.',
			budgetMonthly: '120000.00',
			color: '#67E8F9',
			companyId: acmeCo.id
		}
	];

	const depts = await db.insert(department).values(deptData).returning();
	const execDept = depts.find((d) => d.code === 'EXEC')!;
	const finDept = depts.find((d) => d.code === 'FIN')!;
	const hrDept = depts.find((d) => d.code === 'HR')!;
	const engDept = depts.find((d) => d.code === 'ENG')!;
	const desDept = depts.find((d) => d.code === 'DES')!;

	console.log(`  Created ${depts.length} company departments`);

	// ── 3. Employees (Assigned to Departments) ──────────────────────────────
	const employeeData = [
		{
			fullName: 'Abebe Kebede',
			role: 'owner' as const,
			departmentId: execDept.id,
			employmentType: 'full_time' as const,
			positionLevel: 'principal' as const,
			jobDescription: 'Strategic executive leadership, investor relations, board governance, and final payroll authorization sign-off.',
			workStatus: 'in_office' as const,
			contractStartDate: '2022-01-01',
			contractEndDate: null,
			baseSalary: '85000.00',
			bankAccount: '1000123456789'
		},
		{
			fullName: 'Sara Tesfaye',
			role: 'hr_admin' as const,
			departmentId: hrDept.id,
			employmentType: 'full_time' as const,
			positionLevel: 'lead' as const,
			jobDescription: 'Head of People Operations, talent acquisition, labor compliance, department creation, and team performance matrices.',
			workStatus: 'in_office' as const,
			contractStartDate: '2023-03-15',
			contractEndDate: null,
			baseSalary: '55000.00',
			bankAccount: '1000234567890'
		},
		{
			fullName: 'Dawit Bekele',
			role: 'finance' as const,
			departmentId: finDept.id,
			employmentType: 'full_time' as const,
			positionLevel: 'lead' as const,
			jobDescription: 'Head of Finance & Treasury. Initiates monthly payroll runs, calculates Ethiopian income tax (MoR) and 7% pension, and executes CBE wire batch files.',
			workStatus: 'in_office' as const,
			contractStartDate: '2023-04-01',
			contractEndDate: null,
			baseSalary: '62000.00',
			bankAccount: '1000555556666'
		},
		{
			fullName: 'Daniel Hailu',
			role: 'manager' as const,
			departmentId: engDept.id,
			employmentType: 'full_time' as const,
			positionLevel: 'senior' as const,
			jobDescription: 'Engineering Manager leading full-stack product development squad, sprint velocity, and team leave approvals.',
			workStatus: 'remote' as const,
			contractStartDate: '2023-06-01',
			contractEndDate: null,
			baseSalary: '50000.00',
			bankAccount: '1000345678901'
		},
		{
			fullName: 'Hana Mulugeta',
			role: 'employee' as const,
			departmentId: desDept.id,
			employmentType: 'full_time' as const,
			positionLevel: 'senior' as const,
			jobDescription: 'Lead Product Designer crafting mobile interfaces, design systems, and user experience telemetry.',
			workStatus: 'in_office' as const,
			contractStartDate: '2024-01-10',
			contractEndDate: null,
			baseSalary: '38000.00',
			bankAccount: '1000456789012'
		},
		{
			fullName: 'Yonas Bekele',
			role: 'employee' as const,
			departmentId: engDept.id,
			employmentType: 'contractual' as const,
			positionLevel: 'mid' as const,
			jobDescription: 'Frontend Development Contractor assisting with client portal components and responsive views.',
			workStatus: 'remote' as const,
			contractStartDate: '2026-03-20',
			contractEndDate: '2026-09-20', // Expiring in ~24 days
			baseSalary: '32000.00',
			bankAccount: '1000567890123'
		},
		{
			fullName: 'Tigist Alemayehu',
			role: 'employee' as const,
			departmentId: hrDept.id,
			employmentType: 'part_time' as const,
			positionLevel: 'mid' as const,
			jobDescription: 'Brand & Content Specialist managing social community channels, newsletters, and visual copy.',
			workStatus: 'in_meeting' as const,
			contractStartDate: '2025-05-01',
			contractEndDate: null,
			baseSalary: '22000.00',
			bankAccount: '1000678901234'
		}
	];

	const employees = await db
		.insert(employee)
		.values(employeeData.map((e) => ({ ...e, companyId: acmeCo.id })))
		.returning();

	console.log(`  Created ${employees.length} employees`);

	// ── 4. Appoint Representative Leads for Departments ──────────────────────
	await db.update(department).set({ leadId: employees[0].id }).where(eq(department.id, execDept.id));
	await db.update(department).set({ leadId: employees[2].id }).where(eq(department.id, finDept.id));
	await db.update(department).set({ leadId: employees[1].id }).where(eq(department.id, hrDept.id));
	await db.update(department).set({ leadId: employees[3].id }).where(eq(department.id, engDept.id));
	await db.update(department).set({ leadId: employees[4].id }).where(eq(department.id, desDept.id));

	console.log(`  Assigned Department Representative Leads`);

	// ── 5. Better Auth Users & User Accounts (5 Dedicated Accounts) ───────────
	const authUsers = [
		{
			email: 'owner@acme.com',
			password: 'password123',
			name: 'Abebe Kebede',
			role: 'owner',
			employeeId: employees[0].id,
			phone: '+251911000001'
		},
		{
			email: 'hr@acme.com',
			password: 'password123',
			name: 'Sara Tesfaye',
			role: 'hr_admin',
			employeeId: employees[1].id,
			phone: '+251911000002'
		},
		{
			email: 'finance@acme.com',
			password: 'password123',
			name: 'Dawit Bekele',
			role: 'finance',
			employeeId: employees[2].id,
			phone: '+251911000005'
		},
		{
			email: 'manager@acme.com',
			password: 'password123',
			name: 'Daniel Hailu',
			role: 'manager',
			employeeId: employees[3].id,
			phone: '+251911000003'
		},
		{
			email: 'hana@acme.com',
			password: 'password123',
			name: 'Hana Mulugeta',
			role: 'employee',
			employeeId: employees[4].id,
			phone: '+251911000004'
		}
	];

	for (const u of authUsers) {
		try {
			await auth.api.signUpEmail({
				body: {
					email: u.email,
					password: u.password,
					name: u.name
				}
			});
			await db.update(user).set({ role: u.role }).where(eq(user.email, u.email));
		} catch (err) {
			console.error(`  Sign up error for ${u.email}:`, err);
		}

		await db.insert(userAccount).values({
			employeeId: u.employeeId,
			phone: u.phone,
			authRole: u.role as any
		});
	}

	console.log(`  Created ${authUsers.length} user accounts with login credentials`);

	// ── 6. Company Assets ───────────────────────────────────────────────────
	const assets = await db
		.insert(companyAsset)
		.values([
			{
				employeeId: employees[4].id, // Hana
				name: 'MacBook Pro 16" (M3 Max, 36GB)',
				category: 'laptop',
				serialNumber: 'C02G89XYMD6T',
				assignedDate: '2024-01-15',
				status: 'assigned',
				notes: 'Issued brand new with charger and protective sleeve.'
			},
			{
				employeeId: employees[4].id, // Hana
				name: 'Safaricom Corporate SIM',
				category: 'sim_card',
				serialNumber: '892510100987654',
				assignedDate: '2024-01-15',
				status: 'assigned',
				notes: 'Monthly unlimited 4G data allowance.'
			},
			{
				employeeId: employees[2].id, // Dawit (Finance)
				name: 'ThinkPad T14s Gen 4 (Financial Workstation)',
				category: 'laptop',
				serialNumber: 'FIN-TP-88912',
				assignedDate: '2023-04-10',
				status: 'assigned',
				notes: 'Equipped with hardware security key for bank wire authorization.'
			},
			{
				employeeId: employees[3].id, // Daniel (Manager)
				name: 'ThinkPad X1 Carbon Gen 11',
				category: 'laptop',
				serialNumber: 'PF-398XLA',
				assignedDate: '2023-06-05',
				status: 'assigned',
				notes: 'Encrypted BitLocker drive for security compliance.'
			},
			{
				employeeId: employees[5].id, // Yonas
				name: 'Dell UltraSharp 27" 4K Monitor',
				category: 'other',
				serialNumber: 'CN-0K78X-72872',
				assignedDate: '2026-03-25',
				status: 'assigned',
				notes: 'Remote contractor home office equipment.'
			}
		])
		.returning();

	console.log(`  Created ${assets.length} assigned company assets`);

	// ── 7. Salary Advances ──────────────────────────────────────────────────
	const advances = await db
		.insert(salaryAdvance)
		.values([
			{
				employeeId: employees[4].id, // Hana
				amount: '4000.00',
				reason: 'Emergency Medical Expenses (Private Hospital Clinic)',
				status: 'approved'
			},
			{
				employeeId: employees[5].id, // Yonas
				amount: '2500.00',
				reason: 'Relocation & Fiber Setup in Addis Ababa',
				status: 'approved'
			}
		])
		.returning();

	console.log(`  Created ${advances.length} salary advance applications`);

	// ── 8. QR-Verifiable Document Requests ──────────────────────────────────
	const docRequests = await db
		.insert(documentRequest)
		.values([
			{
				employeeId: employees[4].id, // Hana
				type: 'embassy_letter',
				purpose: 'Schengen Business Visa Application',
				recipientOrganization: 'Embassy of France, Addis Ababa',
				verificationCode: 'ETH-VERIFY-2026-HANA-8892'
			},
			{
				employeeId: employees[3].id, // Daniel
				type: 'bank_letter',
				purpose: 'Commercial Bank of Ethiopia Mortgage Verification',
				recipientOrganization: 'Commercial Bank of Ethiopia',
				verificationCode: 'ETH-VERIFY-2026-DAN-4102'
			}
		])
		.returning();

	console.log(`  Created ${docRequests.length} QR-verifiable documents`);

	// ── 9. Ethiopian Statutory Deduction Rules ──────────────────────────────
	const rules = await db
		.insert(deductionRule)
		.values([
			{
				companyId: acmeCo.id,
				name: 'Ethiopian Employee Pension (Private Organization Pension Directive)',
				type: 'pension',
				rate: '0.070000',
				effectiveFrom: '2020-01-01'
			},
			{
				companyId: acmeCo.id,
				name: 'Employer Pension Contribution',
				type: 'employer_pension',
				rate: '0.110000',
				effectiveFrom: '2020-01-01'
			}
		])
		.returning();

	console.log(`  Created ${rules.length} deduction rules`);

	// ── 10. Notices (Company Broadcasts) ────────────────────────────────────
	const [newYearNotice, paydayNotice, policyNotice] = await db
		.insert(notice)
		.values([
			{
				companyId: acmeCo.id,
				title: '🎉 Enkutatash (Ethiopian New Year 2019) Public Holiday Notice',
				category: 'holiday',
				priority: 'high',
				eventDate: '2026-09-11',
				content: `Dear Team,\n\nIn celebration of Enkutatash (Ethiopian New Year 2019 E.C.), Rosterly offices will be closed on Friday, September 11, 2026.\n\nAll automated payroll processes and wire disbursements for the September cycle will proceed as scheduled on the 30th.\n\nMelkam Addis Amet to all our staff and their families!`,
				requiresAcknowledgment: true
			},
			{
				companyId: acmeCo.id,
				title: '💰 Monthly Payroll Cycle & Cutoff Reminder (25th)',
				category: 'payroll',
				priority: 'normal',
				eventDate: '2026-08-25',
				content: `Please be reminded that attendance logs, unpaid absence adjustments, and emergency salary advance applications must be submitted by the 25th of every month. Disbursals will execute via Commercial Bank of Ethiopia on the 30th.`,
				requiresAcknowledgment: false
			},
			{
				companyId: acmeCo.id,
				title: '🛡️ Information Security & Asset Custody Handbook 2026',
				category: 'policy',
				priority: 'urgent',
				eventDate: null,
				content: `All employees with company-assigned MacBooks, ThinkPads, and corporate SIM cards are required to review the updated 2026 Custody & Data Encryption Directive.\n\nPlease click 'Read & Acknowledged' below.`,
				requiresAcknowledgment: true
			}
		])
		.returning();

	await db.insert(noticeAcknowledgment).values([
		{ noticeId: newYearNotice.id, employeeId: employees[4].id },
		{ noticeId: paydayNotice.id, employeeId: employees[4].id }
	]);

	console.log(`  Created broadcast notices and acknowledgment ledger`);

	// ── 11. Leave Requests ──────────────────────────────────────────────────
	await db.insert(leaveRequest).values([
		{
			employeeId: employees[4].id, // Hana
			startDate: '2026-09-14',
			endDate: '2026-09-18',
			status: 'approved'
		},
		{
			employeeId: employees[5].id, // Yonas
			startDate: '2026-09-01',
			endDate: '2026-09-03',
			status: 'pending'
		}
	]);

	console.log('Seeding completed successfully!');
	process.exit(0);
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
