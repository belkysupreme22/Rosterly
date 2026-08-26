import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payrollRun } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	if (user.role !== 'hr_admin' && user.role !== 'owner' && user.role !== 'manager') {
		throw error(403, 'Access denied');
	}

	const run = await db.query.payrollRun.findFirst({
		where: eq(payrollRun.id, params.id),
		with: {
			company: true,
			payslips: {
				with: { employee: true },
				orderBy: (ps, { asc }) => [asc(ps.createdAt)]
			}
		}
	});

	if (!run) throw error(404, 'Payroll run not found');

	return {
		user,
		payrollRun: run
	};
};
