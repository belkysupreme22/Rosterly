import { db } from '$lib/server/db';
import {
	payrollRun,
	payslip,
	employee,
	deductionRule,
	leaveRequest,
	type Employee,
	type DeductionRule
} from '$lib/server/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import {
	calculatePayroll,
	generatePayslip as createPayslipRecord,
	type PayrollCalculation
} from '@rosterly/payroll-engine';

export interface ProcessPayrollOptions {
	companyId: string;
	periodStart: string;
	periodEnd: string;
	payrollRunId?: string;
}

export interface EmployeePayrollItem {
	employee: {
		id: string;
		fullName: string;
		role: string;
		baseSalary: string;
		bankAccount: string | null;
	};
	calculation: PayrollCalculation;
}

/**
 * Preview calculations for all employees of a company for a given period
 * without persisting to the database.
 */
export async function previewPayrollRun(companyId: string, periodStart: string, periodEnd: string) {
	// 1. Fetch employees
	const employees = await db.query.employee.findMany({
		where: eq(employee.companyId, companyId),
		orderBy: (emp, { asc }) => [asc(emp.fullName)]
	});

	// 2. Fetch active deduction rules (effective_from <= periodEnd)
	const rules = await db.query.deductionRule.findMany({
		where: and(
			eq(deductionRule.companyId, companyId),
			lte(deductionRule.effectiveFrom, periodEnd)
		)
	});

	// 3. Fetch approved leave requests in this period
	const approvedLeaves = await db.query.leaveRequest.findMany({
		where: and(
			eq(leaveRequest.status, 'approved'),
			gte(leaveRequest.startDate, periodStart),
			lte(leaveRequest.endDate, periodEnd)
		)
	});

	const items: EmployeePayrollItem[] = [];
	let totalGross = 0;
	let totalTax = 0;
	let totalPension = 0;
	let totalNet = 0;

	for (const emp of employees) {
		const baseSalary = Number(emp.baseSalary);

		// Transform deduction rules for the payroll engine
		const deductionRuleInputs = rules.map((r) => ({
			id: r.id,
			name: r.name,
			type: r.type,
			rate: r.rate ? Number(r.rate) : undefined,
			fixedAmount: r.fixedAmount ? Number(r.fixedAmount) : undefined
		}));

		// Calculate unpaid leave days if any
		const empLeaves = approvedLeaves.filter((l) => l.employeeId === emp.id);
		let unpaidDays = 0;
		for (const leave of empLeaves) {
			const start = new Date(leave.startDate);
			const end = new Date(leave.endDate);
			const diffTime = Math.abs(end.getTime() - start.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
			// For simplicity in standard payroll, unpaid days > 0 adjust gross
			// In Layer 2, all approved leave is treated as standard leave unless marked unpaid
		}

		const calc = calculatePayroll({
			employee: {
				id: emp.id,
				fullName: emp.fullName,
				baseSalary
			},
			rules: deductionRuleInputs,
			attendance: {
				workingDaysInMonth: 30,
				unpaidLeaveDays: unpaidDays
			}
		});

		totalGross += calc.grossPay;
		totalTax += calc.incomeTax;
		totalPension += calc.employeePension;
		totalNet += calc.netPay;

		items.push({
			employee: {
				id: emp.id,
				fullName: emp.fullName,
				role: emp.role,
				baseSalary: emp.baseSalary,
				bankAccount: emp.bankAccount
			},
			calculation: calc
		});
	}

	return {
		companyId,
		periodStart,
		periodEnd,
		employeeCount: employees.length,
		summary: {
			totalGross: Math.round(totalGross * 100) / 100,
			totalTax: Math.round(totalTax * 100) / 100,
			totalPension: Math.round(totalPension * 100) / 100,
			totalNet: Math.round(totalNet * 100) / 100
		},
		items
	};
}

/**
 * Execute a payroll run: create the payroll_run record and frozen payslip snapshots.
 */
export async function executePayrollRun(options: ProcessPayrollOptions) {
	const preview = await previewPayrollRun(options.companyId, options.periodStart, options.periodEnd);

	if (preview.items.length === 0) {
		throw new Error('No employees found to process payroll.');
	}

	// 1. Create payroll run record
	const [run] = await db
		.insert(payrollRun)
		.values({
			companyId: options.companyId,
			periodStart: options.periodStart,
			periodEnd: options.periodEnd,
			status: 'draft'
		})
		.returning();

	// 2. Insert frozen payslips
	const payslipValues = preview.items.map((item) => {
		const slip = createPayslipRecord({
			payrollRunId: run.id,
			employeeId: item.employee.id,
			calculation: item.calculation
		});

		return {
			payrollRunId: run.id,
			employeeId: item.employee.id,
			grossPay: slip.grossPay.toFixed(2),
			netPay: slip.netPay.toFixed(2),
			deductions: slip.deductions
		};
	});

	const createdPayslips = await db.insert(payslip).values(payslipValues).returning();

	return {
		payrollRun: run,
		payslips: createdPayslips
	};
}
