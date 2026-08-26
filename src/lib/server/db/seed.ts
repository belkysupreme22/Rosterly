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
	employee,
	userAccount,
	leaveRequest,
	payrollRun,
	payslip,
	deductionRule,
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
	console.log('Seeding database...');

	// Clean up old tables
	await client`TRUNCATE "session", "account", "verification", "user", "payslip", "leave_request", "payroll_run", "deduction_rule", "user_account", "employee", "company" CASCADE`;

	// ── Company ──────────────────────────────────────────────────────────
	const [acmeCo] = await db
		.insert(company)
		.values({
			name: 'Acme Corp Ethiopia',
			tin: 'ETH-TIN-001234567'
		})
		.returning();

	console.log(`  Created company: ${acmeCo.name} (${acmeCo.id})`);

	// ── Employees ────────────────────────────────────────────────────────
	const employeeData = [
		{
			fullName: 'Abebe Kebede',
			role: 'owner' as const,
			baseSalary: '85000.00',
			bankAccount: 'CBE-1234567890'
		},
		{
			fullName: 'Sara Tesfaye',
			role: 'hr_admin' as const,
			baseSalary: '55000.00',
			bankAccount: 'CBE-2345678901'
		},
		{
			fullName: 'Daniel Hailu',
			role: 'manager' as const,
			baseSalary: '50000.00',
			bankAccount: 'CBE-3456789012'
		},
		{
			fullName: 'Hana Mulugeta',
			role: 'employee' as const,
			baseSalary: '30000.00',
			bankAccount: 'CBE-4567890123'
		},
		{
			fullName: 'Yonas Bekele',
			role: 'employee' as const,
			baseSalary: '28000.00',
			bankAccount: 'CBE-5678901234'
		},
		{
			fullName: 'Tigist Alemayehu',
			role: 'employee' as const,
			baseSalary: '32000.00',
			bankAccount: 'CBE-6789012345'
		}
	];

	const employees = await db
		.insert(employee)
		.values(employeeData.map((e) => ({ ...e, companyId: acmeCo.id })))
		.returning();

	console.log(`  Created ${employees.length} employees`);

	// ── Better Auth Users & User Accounts (for login) ───────────────────
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
			email: 'manager@acme.com',
			password: 'password123',
			name: 'Daniel Hailu',
			role: 'manager',
			employeeId: employees[2].id,
			phone: '+251911000003'
		},
		{
			email: 'hana@acme.com',
			password: 'password123',
			name: 'Hana Mulugeta',
			role: 'employee',
			employeeId: employees[3].id,
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

	console.log(`  Created ${authUsers.length} user accounts with login access`);

	// ── Leave Requests ───────────────────────────────────────────────────
	const leaveRequests = await db
		.insert(leaveRequest)
		.values([
			{
				employeeId: employees[3].id, // Hana
				startDate: '2026-09-01',
				endDate: '2026-09-05',
				status: 'pending'
			},
			{
				employeeId: employees[4].id, // Yonas
				startDate: '2026-08-18',
				endDate: '2026-08-22',
				status: 'approved'
			},
			{
				employeeId: employees[5].id, // Tigist
				startDate: '2026-08-25',
				endDate: '2026-08-26',
				status: 'denied'
			},
			{
				employeeId: employees[3].id, // Hana — second request
				startDate: '2026-10-15',
				endDate: '2026-10-17',
				status: 'pending'
			}
		])
		.returning();

	console.log(`  Created ${leaveRequests.length} leave requests`);

	// ── Deduction Rules (stub data) ──────────────────────────────────────
	const rules = await db
		.insert(deductionRule)
		.values([
			{
				companyId: acmeCo.id,
				type: 'income_tax',
				rate: '0.15',
				effectiveFrom: '2026-01-01'
			},
			{
				companyId: acmeCo.id,
				type: 'pension',
				rate: '0.07',
				effectiveFrom: '2026-01-01'
			}
		])
		.returning();

	console.log(`  Created ${rules.length} deduction rules`);

	// ── Payroll Run + Payslips (dummy data for Layer 1 UI) ───────────────
	const [run] = await db
		.insert(payrollRun)
		.values({
			companyId: acmeCo.id,
			periodStart: '2026-08-01',
			periodEnd: '2026-08-31',
			status: 'draft'
		})
		.returning();

	const payslips = await db
		.insert(payslip)
		.values(
			employees.slice(2).map((emp) => ({
				payrollRunId: run.id,
				employeeId: emp.id,
				grossPay: emp.baseSalary,
				netPay: String(Number(emp.baseSalary) * 0.78), // dummy: 22% total deductions
				deductions: [
					{ type: 'income_tax', amount: Number(emp.baseSalary) * 0.15 },
					{ type: 'pension', amount: Number(emp.baseSalary) * 0.07 }
				]
			}))
		)
		.returning();

	console.log(`  Created 1 payroll run + ${payslips.length} payslips (dummy data)`);

	console.log('\nSeed complete!');
	await client.end();
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
