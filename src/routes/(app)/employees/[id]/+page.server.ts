import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const emp = await db.query.employee.findFirst({
		where: eq(employee.id, params.id),
		with: {
			company: true,
			leaveRequests: {
				orderBy: (lr, { desc }) => [desc(lr.createdAt)],
				limit: 10
			}
		}
	});

	if (!emp) throw error(404, 'Employee not found');

	return { employee: emp };
};
