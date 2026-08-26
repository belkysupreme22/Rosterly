import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payrollRun, company, employee } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (user.role !== 'hr_admin' && user.role !== 'owner' && user.role !== 'manager') {
		throw error(403, 'Access denied');
	}

	const runs = await db.query.payrollRun.findMany({
		with: {
			company: true,
			payslips: {
				with: { employee: true }
			}
		},
		orderBy: [desc(payrollRun.createdAt)]
	});

	const [employeeCount] = await db.select({ count: count() }).from(employee);
	const companies = await db.query.company.findMany();

	return {
		runs,
		totalEmployees: employeeCount.count,
		companies
	};
};
