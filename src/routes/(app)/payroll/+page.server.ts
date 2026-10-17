import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payrollRun, company, employee } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (user.role !== 'finance' && user.role !== 'owner') {
		throw error(403, 'Access denied: Only Finance and Owner roles have access to the Payroll engine');
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

	const canInitiate = user.role === 'finance';
	const canApprove = user.role === 'owner';
	const canDisburse = user.role === 'finance';

	return {
		userRole: user.role,
		canInitiate,
		canApprove,
		canDisburse,
		runs,
		totalEmployees: employeeCount.count,
		companies
	};
};
