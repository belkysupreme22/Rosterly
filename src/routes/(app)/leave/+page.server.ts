import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { leaveRequest, employee } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// Get all leave requests with employee info
	const requests = await db.query.leaveRequest.findMany({
		with: { employee: true },
		orderBy: [desc(leaveRequest.createdAt)]
	});

	// Get employees list for the leave request form
	const employees = await db.query.employee.findMany({
		orderBy: (emp, { asc }) => [asc(emp.fullName)]
	});

	return { requests, employees };
};
