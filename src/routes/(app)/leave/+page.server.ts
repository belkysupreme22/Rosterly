import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { leaveRequest, employee, userAccount } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// 1. If standard employee, filter only to their personal requests
	if (user.role === 'employee') {
		const userAcc = await db.query.userAccount.findFirst({
			where: eq(userAccount.phone, (user as any).phoneNumber || '')
		});

		let emp = userAcc?.employeeId
			? await db.query.employee.findFirst({ where: eq(employee.id, userAcc.employeeId) })
			: null;

		if (!emp) {
			emp = await db.query.employee.findFirst({ where: eq(employee.role, 'employee') });
		}

		const requests = emp
			? await db.query.leaveRequest.findMany({
					where: eq(leaveRequest.employeeId, emp.id),
					with: { employee: true },
					orderBy: [desc(leaveRequest.createdAt)]
				})
			: [];

		return {
			isEmployeeView: true,
			requests,
			employees: emp ? [emp] : []
		};
	}

	// 2. For Managers / HR Admins / Owners, load all organization requests
	const requests = await db.query.leaveRequest.findMany({
		with: { employee: true },
		orderBy: [desc(leaveRequest.createdAt)]
	});

	const employees = await db.query.employee.findMany({
		orderBy: (emp, { asc }) => [asc(emp.fullName)]
	});

	return {
		isEmployeeView: false,
		requests,
		employees
	};
};
