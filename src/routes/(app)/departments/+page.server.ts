import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { department, employee, company } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const departments = await db.query.department.findMany({
		with: {
			lead: true,
			members: true,
			company: true
		},
		orderBy: [asc(department.name)]
	});

	const employees = await db.query.employee.findMany({
		orderBy: [asc(employee.fullName)]
	});

	const companies = await db.query.company.findMany();

	const canManage = user.role === 'hr_admin' || user.role === 'owner';

	return {
		userRole: user.role,
		canManage,
		departments,
		employees,
		companies
	};
};
