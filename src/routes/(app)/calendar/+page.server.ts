import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { leaveRequest, employee } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const approvedLeaves = await db.query.leaveRequest.findMany({
		with: { employee: true },
		orderBy: [desc(leaveRequest.startDate)]
	});

	const employees = await db.query.employee.findMany({
		orderBy: (emp, { asc }) => [asc(emp.fullName)]
	});

	return { approvedLeaves, employees };
};
