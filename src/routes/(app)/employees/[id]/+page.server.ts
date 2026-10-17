import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee, department } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const emp = await db.query.employee.findFirst({
		where: eq(employee.id, params.id),
		with: {
			company: true,
			department: {
				with: { lead: true }
			},
			assets: {
				orderBy: (a, { desc }) => [desc(a.createdAt)]
			},
			salaryAdvances: {
				orderBy: (adv, { desc }) => [desc(adv.createdAt)]
			},
			documentRequests: {
				orderBy: (doc, { desc }) => [desc(doc.createdAt)]
			},
			leaveRequests: {
				orderBy: (lr, { desc }) => [desc(lr.createdAt)],
				limit: 10
			}
		}
	});

	if (!emp) throw error(404, 'Employee not found');

	const departments = await db.query.department.findMany();

	return {
		employee: emp,
		departments,
		userRole: user.role
	};
};
