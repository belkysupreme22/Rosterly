import { describe, it, expect } from 'vitest';
import {
	calculateEthiopianIncomeTax,
	calculatePayroll,
	generatePayslip,
	generateComplianceReport
} from './index';

describe('calculateEthiopianIncomeTax', () => {
	it('returns 0 for income <= 600 ETB', () => {
		expect(calculateEthiopianIncomeTax(0)).toBe(0);
		expect(calculateEthiopianIncomeTax(500)).toBe(0);
		expect(calculateEthiopianIncomeTax(600)).toBe(0);
	});

	it('calculates 10% with 60 deduction for 601 - 1,650 ETB', () => {
		// 1000 * 0.10 - 60 = 40
		expect(calculateEthiopianIncomeTax(1000)).toBe(40);
		// 1650 * 0.10 - 60 = 105
		expect(calculateEthiopianIncomeTax(1650)).toBe(105);
	});

	it('calculates 15% with 142.50 deduction for 1,651 - 3,200 ETB', () => {
		// 2000 * 0.15 - 142.50 = 157.5
		expect(calculateEthiopianIncomeTax(2000)).toBe(157.5);
		// 3200 * 0.15 - 142.50 = 337.5
		expect(calculateEthiopianIncomeTax(3200)).toBe(337.5);
	});

	it('calculates 20% with 302.50 deduction for 3,201 - 5,250 ETB', () => {
		// 5000 * 0.20 - 302.50 = 697.5
		expect(calculateEthiopianIncomeTax(5000)).toBe(697.5);
	});

	it('calculates 25% with 565 deduction for 5,251 - 7,800 ETB', () => {
		// 6000 * 0.25 - 565 = 935
		expect(calculateEthiopianIncomeTax(6000)).toBe(935);
	});

	it('calculates 30% with 955 deduction for 7,801 - 10,900 ETB', () => {
		// 10000 * 0.30 - 955 = 2045
		expect(calculateEthiopianIncomeTax(10000)).toBe(2045);
	});

	it('calculates 35% with 1,500 deduction for > 10,900 ETB', () => {
		// 20000 * 0.35 - 1500 = 5500
		expect(calculateEthiopianIncomeTax(20000)).toBe(5500);
		// 50000 * 0.35 - 1500 = 16000
		expect(calculateEthiopianIncomeTax(50000)).toBe(16000);
	});
});

describe('calculatePayroll', () => {
	it('calculates standard salary with 7% pension and progressive tax', () => {
		// Base salary = 30,000 ETB
		// Employee pension (7%) = 2,100 ETB
		// Taxable income = 30,000 - 2,100 = 27,900 ETB
		// Tax = 27,900 * 0.35 - 1,500 = 8,265 ETB
		// Total deductions = 2,100 + 8,265 = 10,365 ETB
		// Net pay = 30,000 - 10,365 = 19,635 ETB
		const result = calculatePayroll({
			employee: { baseSalary: 30000 }
		});

		expect(result.baseSalary).toBe(30000);
		expect(result.grossPay).toBe(30000);
		expect(result.employeePension).toBe(2100);
		expect(result.employerPension).toBe(3300); // 11% of 30,000
		expect(result.taxableIncome).toBe(27900);
		expect(result.incomeTax).toBe(8265);
		expect(result.netPay).toBe(19635);
		expect(result.deductions).toHaveLength(2);
		expect(result.deductions[0]).toEqual({ type: 'Pension (Employee 7%)', amount: 2100 });
		expect(result.deductions[1]).toEqual({ type: 'Income Tax', amount: 8265 });
	});

	it('handles lower salary tier properly', () => {
		// Base salary = 1,000 ETB
		// Pension 7% = 70 ETB
		// Taxable = 930 ETB
		// Tax (10% - 60) = 93 - 60 = 33 ETB
		// Net = 1000 - 70 - 33 = 897 ETB
		const result = calculatePayroll({
			employee: { baseSalary: 1000 }
		});

		expect(result.employeePension).toBe(70);
		expect(result.taxableIncome).toBe(930);
		expect(result.incomeTax).toBe(33);
		expect(result.netPay).toBe(897);
	});

	it('handles unpaid leave adjustment', () => {
		// Base salary = 30,000, 30 days month, 3 unpaid days
		// Daily rate = 1,000 -> Unpaid amount = 3,000 -> Gross = 27,000
		// Pension 7% = 1,890
		// Taxable = 25,110 -> Tax (35% - 1500) = 8788.5 - 1500 = 7288.50
		// Net = 27,000 - 1890 - 7288.50 = 17,821.50
		const result = calculatePayroll({
			employee: { baseSalary: 30000 },
			attendance: { workingDaysInMonth: 30, unpaidLeaveDays: 3 }
		});

		expect(result.grossPay).toBe(27000);
		expect(result.employeePension).toBe(1890);
		expect(result.incomeTax).toBe(7288.5);
		expect(result.netPay).toBe(17821.5);
		expect(result.deductions).toContainEqual({ type: 'Unpaid Leave Adjustment', amount: 3000 });
	});

	it('handles custom deduction rules', () => {
		const result = calculatePayroll({
			employee: { baseSalary: 10000 },
			rules: [
				{ type: 'loan', name: 'Staff Loan Repayment', fixedAmount: 500 },
				{ type: 'insurance', name: 'Health Insurance', rate: 0.02 } // 2% of 10000 = 200
			]
		});

		expect(result.deductions).toContainEqual({ type: 'Staff Loan Repayment', amount: 500 });
		expect(result.deductions).toContainEqual({ type: 'Health Insurance', amount: 200 });
	});

	it('handles zero salary gracefully', () => {
		const result = calculatePayroll({
			employee: { baseSalary: 0 }
		});

		expect(result.grossPay).toBe(0);
		expect(result.incomeTax).toBe(0);
		expect(result.employeePension).toBe(0);
		expect(result.netPay).toBe(0);
	});
});

describe('generatePayslip', () => {
	it('creates frozen snapshot payslip object', () => {
		const calc = calculatePayroll({ employee: { baseSalary: 30000 } });
		const slip = generatePayslip({
			payrollRunId: 'run-123',
			employeeId: 'emp-456',
			calculation: calc
		});

		expect(slip.payrollRunId).toBe('run-123');
		expect(slip.employeeId).toBe('emp-456');
		expect(slip.grossPay).toBe(30000);
		expect(slip.netPay).toBe(19635);
		expect(slip.deductions).toEqual(calc.deductions);
	});
});

describe('generateComplianceReport', () => {
	it('aggregates company payroll tax and pension metrics', () => {
		const calc1 = calculatePayroll({ employee: { baseSalary: 30000 } });
		const calc2 = calculatePayroll({ employee: { baseSalary: 20000 } });

		const report = generateComplianceReport({
			companyId: 'co-123',
			periodStart: '2026-08-01',
			periodEnd: '2026-08-31',
			payslips: [
				{ grossPay: calc1.grossPay, netPay: calc1.netPay, deductions: calc1.deductions },
				{ grossPay: calc2.grossPay, netPay: calc2.netPay, deductions: calc2.deductions }
			]
		});

		expect(report.companyId).toBe('co-123');
		expect(report.totalEmployees).toBe(2);
		expect(report.totalGrossPay).toBe(50000);
		expect(report.totalEmployeePension).toBe(2100 + 1400); // 3500
		expect(report.totalEmployerPension).toBe(5500); // 11% of 50000
		expect(report.totalNetPay).toBe(calc1.netPay + calc2.netPay);
	});
});
