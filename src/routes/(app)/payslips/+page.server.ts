import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payslip, userAccount, employee } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// If employee role, filter only to their payslips
	if (user.role === 'employee') {
		// Find employee linked via userAccount or email/name
		const phone = (user as any).phoneNumber || '';
		const userAcc = await db.query.userAccount.findFirst({
			where: eq(userAccount.phone, phone)
		});

		// Fallback: look for employee by matching email or first employee
		let emp = userAcc?.employeeId
			? await db.query.employee.findFirst({ where: eq(employee.id, userAcc.employeeId) })
			: null;

		if (!emp) {
			emp = await db.query.employee.findFirst({
				where: eq(employee.role, 'employee')
			});
		}

		if (emp) {
			const payslips = await db.query.payslip.findMany({
				where: eq(payslip.employeeId, emp.id),
				with: {
					employee: true,
					payrollRun: true
				},
				orderBy: [desc(payslip.createdAt)]
			});
			return { payslips, isEmployeeView: true };
		}
	}

	// For HR / Manager / Owner: view all payslips
	const payslips = await db.query.payslip.findMany({
		with: {
			employee: true,
			payrollRun: true
		},
		orderBy: [desc(payslip.createdAt)]
	});

	return { payslips, isEmployeeView: false };
};
