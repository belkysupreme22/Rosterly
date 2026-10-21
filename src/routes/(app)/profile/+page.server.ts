import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// 1. Resolve employee directly linked to authenticated user
	let emp = await db.query.employee.findFirst({
		where: eq(employee.userId, user.id)
	});

	// 2. Fallback for demo role accounts
	if (!emp && user.role) {
		emp = await db.query.employee.findFirst({
			where: eq(employee.role, user.role as any)
		});
	}

	if (emp) {
		throw redirect(302, `/employees/${emp.id}`);
	}

	throw redirect(302, '/dashboard');
};
