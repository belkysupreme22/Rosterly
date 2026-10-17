import { db } from '$lib/server/db';
import {
	payrollRun,
	payslip,
	employee,
	deductionRule,
	leaveRequest,
	salaryAdvance,
	company,
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
		employmentType: string;
		positionLevel: string;
		baseSalary: string;
		bankAccount: string | null;
	};
	advances: Array<{ id: string; amount: number; reason: string }>;
	calculation: PayrollCalculation;
}

/**
 * Preview calculations for all employees of a company for a given period
 * including automated Salary Advance repayments and unpaid leave adjustments.
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

	// 4. Fetch approved salary advances that have not yet been deducted
	const activeAdvances = await db.query.salaryAdvance.findMany({
		where: eq(salaryAdvance.status, 'approved')
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
			name: r.name || r.type,
			type: r.type,
			rate: r.rate ? Number(r.rate) : undefined,
			fixedAmount: r.fixedAmount ? Number(r.fixedAmount) : undefined
		}));

		// Calculate unpaid leave days if any
		const empLeaves = approvedLeaves.filter((l) => l.employeeId === emp.id);
		let unpaidDays = 0;
		for (const leave of empLeaves) {
			if (leave.type && leave.type.toLowerCase().includes('unpaid')) {
				const start = new Date(leave.startDate);
				const end = new Date(leave.endDate);
				const diffTime = Math.abs(end.getTime() - start.getTime());
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
				unpaidDays += diffDays;
			}
		}

		// Calculate standard statutory payroll
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

		// Check for salary advances to deduct
		const empAdvances = activeAdvances.filter((a) => a.employeeId === emp.id);
		let totalAdvanceDeduction = 0;
		for (const adv of empAdvances) {
			const advAmt = Number(adv.amount);
			totalAdvanceDeduction += advAmt;
			// Add advance repayment as itemized deduction
			calc.deductions.push({
				type: `Salary Advance Repayment (${adv.reason.slice(0, 30)})`,
				amount: advAmt
			});
			calc.totalDeductions += advAmt;
		}

		// Adjust final net pay after advances
		calc.netPay = Math.max(0, calc.grossPay - calc.totalDeductions);

		totalGross += calc.grossPay;
		totalTax += calc.incomeTax;
		totalPension += calc.employeePension;
		totalNet += calc.netPay;

		items.push({
			employee: {
				id: emp.id,
				fullName: emp.fullName,
				role: emp.role,
				employmentType: emp.employmentType,
				positionLevel: emp.positionLevel,
				baseSalary: emp.baseSalary,
				bankAccount: emp.bankAccount
			},
			advances: empAdvances.map((a) => ({
				id: a.id,
				amount: Number(a.amount),
				reason: a.reason
			})),
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
 * Execute a payroll run: create the payroll_run record, frozen payslip snapshots,
 * and mark deducted salary advances as 'deducted'.
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
			grossPay: item.calculation.grossPay.toFixed(2),
			netPay: item.calculation.netPay.toFixed(2),
			deductions: item.calculation.deductions
		};
	});

	const createdPayslips = await db.insert(payslip).values(payslipValues).returning();

	// 3. Mark all included salary advances as deducted and link to this payroll run
	for (const item of preview.items) {
		for (const adv of item.advances) {
			await db
				.update(salaryAdvance)
				.set({
					status: 'deducted',
					payrollRunId: run.id
				})
				.where(eq(salaryAdvance.id, adv.id));
		}
	}

	return {
		payrollRun: run,
		payslips: createdPayslips
	};
}

/**
 * Generate a Commercial Bank of Ethiopia (CBE) compliant Bulk Wire CSV Export.
 */
export async function generateCbeBatchExport(payrollRunId: string): Promise<string> {
	const run = await db.query.payrollRun.findFirst({
		where: eq(payrollRun.id, payrollRunId),
		with: {
			company: true,
			payslips: {
				with: {
					employee: true
				}
			}
		}
	});

	if (!run) throw new Error('Payroll run not found');

	const headers = ['Beneficiary Account', 'Beneficiary Name', 'Amount (ETB)', 'Currency', 'Payment Reference', 'Remarks'];
	const rows = run.payslips.map((p) => {
		const account = p.employee.bankAccount || 'N/A';
		const name = `"${p.employee.fullName.replace(/"/g, '""')}"`;
		const amount = Number(p.netPay).toFixed(2);
		const ref = `SALARY-${run.periodStart.slice(0, 7)}`;
		const remarks = `"Salary Disbursal for ${p.employee.fullName}"`;
		return [account, name, amount, 'ETB', ref, remarks].join(',');
	});

	return [headers.join(','), ...rows].join('\n');
}
