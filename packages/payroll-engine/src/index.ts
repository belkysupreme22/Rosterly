/**
 * @rosterly/payroll-engine
 *
 * Pure payroll calculation functions. Zero imports from SvelteKit,
 * database clients, or anything outside this package.
 *
 * This package is designed to be independently publishable.
 * It takes plain data in and returns plain data out.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface EmployeeInput {
	id?: string;
	fullName?: string;
	baseSalary: number;
}

export interface DeductionRuleInput {
	id?: string;
	name?: string;
	type: string; // e.g. 'tax', 'pension_employee', 'pension_employer', 'loan', 'custom'
	rate?: number; // percentage rate e.g. 0.07 for 7%
	fixedAmount?: number; // flat deduction amount if applicable
	effectiveFrom?: string;
}

export interface AttendanceInput {
	workingDaysInMonth?: number; // defaults to 30 or 22
	daysWorked?: number;
	unpaidLeaveDays?: number;
}

export interface DeductionResult {
	type: string;
	amount: number;
}

export interface PayrollCalculation {
	baseSalary: number;
	grossPay: number;
	taxableIncome: number;
	incomeTax: number;
	employeePension: number;
	employerPension: number;
	deductions: DeductionResult[];
	totalDeductions: number;
	netPay: number;
}

export interface PayslipInput {
	payrollRunId: string;
	employeeId: string;
	calculation: PayrollCalculation;
}

export interface Payslip {
	payrollRunId: string;
	employeeId: string;
	grossPay: number;
	netPay: number;
	deductions: DeductionResult[];
}

export interface ComplianceReportInput {
	companyId: string;
	periodStart: string;
	periodEnd: string;
	payslips: Array<{
		grossPay: number;
		netPay: number;
		deductions: DeductionResult[];
	}>;
}

export interface ComplianceReport {
	companyId: string;
	periodStart: string;
	periodEnd: string;
	generatedAt: string;
	totalEmployees: number;
	totalGrossPay: number;
	totalIncomeTax: number;
	totalEmployeePension: number;
	totalEmployerPension: number;
	totalNetPay: number;
}

// ── Ethiopian Income Tax Calculation ───────────────────────────────────────

/**
 * Standard Ethiopian employment income tax brackets (monthly):
 *
 * | Monthly Taxable Income (ETB) | Rate (%) | Deduction (ETB) |
 * |:-----------------------------|:---------|:----------------|
 * | 0 – 600                      | 0%       | 0               |
 * | 601 – 1,650                  | 10%      | 60              |
 * | 1,651 – 3,200                | 15%      | 142.50          |
 * | 3,201 – 5,250                | 20%      | 302.50          |
 * | 5,251 – 7,800                | 25%      | 565             |
 * | 7,801 – 10,900               | 30%      | 955             |
 * | > 10,900                     | 35%      | 1,500           |
 */
export function calculateEthiopianIncomeTax(taxableIncome: number): number {
	if (taxableIncome <= 0) return 0;
	if (taxableIncome <= 600) return 0;
	if (taxableIncome <= 1650) return Math.round((taxableIncome * 0.10 - 60) * 100) / 100;
	if (taxableIncome <= 3200) return Math.round((taxableIncome * 0.15 - 142.50) * 100) / 100;
	if (taxableIncome <= 5250) return Math.round((taxableIncome * 0.20 - 302.50) * 100) / 100;
	if (taxableIncome <= 7800) return Math.round((taxableIncome * 0.25 - 565) * 100) / 100;
	if (taxableIncome <= 10900) return Math.round((taxableIncome * 0.30 - 955) * 100) / 100;
	return Math.round((taxableIncome * 0.35 - 1500) * 100) / 100;
}

// ── Pure Calculation Functions ─────────────────────────────────────────────

/**
 * Calculate payroll for a single employee.
 * Takes plain data in, returns plain data out.
 */
export function calculatePayroll(input: {
	employee: EmployeeInput;
	rules?: DeductionRuleInput[];
	attendance?: AttendanceInput;
}): PayrollCalculation {
	const baseSalary = Math.max(0, input.employee.baseSalary);
	const workingDays = input.attendance?.workingDaysInMonth || 30;
	const unpaidDays = input.attendance?.unpaidLeaveDays || 0;

	// Adjust gross pay for unpaid leave if any
	const dailyRate = workingDays > 0 ? baseSalary / workingDays : 0;
	const unpaidDeductionAmount = Math.min(baseSalary, Math.round(dailyRate * unpaidDays * 100) / 100);
	const grossPay = Math.max(0, Math.round((baseSalary - unpaidDeductionAmount) * 100) / 100);

	// Mandatory Ethiopian pension:
	// Employee pension is 7% of gross/base pay
	// Employer pension is 11% of gross/base pay
	const employeePension = Math.round(grossPay * 0.07 * 100) / 100;
	const employerPension = Math.round(grossPay * 0.11 * 100) / 100;

	// In Ethiopia, employee pension contribution is tax-exempt
	const taxableIncome = Math.max(0, Math.round((grossPay - employeePension) * 100) / 100);
	const incomeTax = calculateEthiopianIncomeTax(taxableIncome);

	const deductions: DeductionResult[] = [
		{ type: 'Pension (Employee 7%)', amount: employeePension },
		{ type: 'Income Tax', amount: incomeTax }
	];

	if (unpaidDeductionAmount > 0) {
		deductions.push({ type: 'Unpaid Leave Adjustment', amount: unpaidDeductionAmount });
	}

	// Apply any additional custom deduction rules
	if (input.rules) {
		for (const rule of input.rules) {
			if (rule.type === 'pension_employee' || rule.type === 'tax' || rule.type === 'income_tax') {
				// Already handled above standardly
				continue;
			}
			let amount = 0;
			if (rule.fixedAmount && rule.fixedAmount > 0) {
				amount = rule.fixedAmount;
			} else if (rule.rate && rule.rate > 0) {
				amount = Math.round(grossPay * rule.rate * 100) / 100;
			}
			if (amount > 0) {
				deductions.push({
					type: rule.name || rule.type,
					amount
				});
			}
		}
	}

	const totalDeductions = Math.round(
		deductions.reduce((sum, d) => sum + d.amount, 0) * 100
	) / 100;

	const netPay = Math.max(0, Math.round((grossPay - (employeePension + incomeTax + (input.rules ? deductions.slice(2).reduce((s, d) => d.type !== 'Unpaid Leave Adjustment' ? s + d.amount : s, 0) : 0))) * 100) / 100);

	return {
		baseSalary,
		grossPay,
		taxableIncome,
		incomeTax,
		employeePension,
		employerPension,
		deductions,
		totalDeductions,
		netPay
	};
}

/**
 * Generate a payslip record from a calculation result.
 */
export function generatePayslip(input: PayslipInput): Payslip {
	return {
		payrollRunId: input.payrollRunId,
		employeeId: input.employeeId,
		grossPay: input.calculation.grossPay,
		netPay: input.calculation.netPay,
		deductions: input.calculation.deductions
	};
}

/**
 * Generate a compliance report for a given period from a list of payslips.
 */
export function generateComplianceReport(input: ComplianceReportInput): ComplianceReport {
	let totalGrossPay = 0;
	let totalIncomeTax = 0;
	let totalEmployeePension = 0;
	let totalNetPay = 0;

	for (const slip of input.payslips) {
		totalGrossPay += slip.grossPay;
		totalNetPay += slip.netPay;

		for (const ded of slip.deductions) {
			if (ded.type.toLowerCase().includes('tax')) {
				totalIncomeTax += ded.amount;
			} else if (ded.type.toLowerCase().includes('pension')) {
				totalEmployeePension += ded.amount;
			}
		}
	}

	// Employer pension is 11/7 of employee pension (or 11% of gross)
	const totalEmployerPension = Math.round(totalGrossPay * 0.11 * 100) / 100;

	return {
		companyId: input.companyId,
		periodStart: input.periodStart,
		periodEnd: input.periodEnd,
		generatedAt: new Date().toISOString(),
		totalEmployees: input.payslips.length,
		totalGrossPay: Math.round(totalGrossPay * 100) / 100,
		totalIncomeTax: Math.round(totalIncomeTax * 100) / 100,
		totalEmployeePension: Math.round(totalEmployeePension * 100) / 100,
		totalEmployerPension,
		totalNetPay: Math.round(totalNetPay * 100) / 100
	};
}
