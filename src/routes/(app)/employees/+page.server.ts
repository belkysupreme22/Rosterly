import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee, company, department } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (
		user.role !== 'hr_admin' &&
		user.role !== 'owner' &&
		user.role !== 'manager' &&
		user.role !== 'finance'
	) {
		throw error(403, 'Access denied');
	}

	const employees = await db.query.employee.findMany({
		with: {
			company: true,
			department: true
		},
		orderBy: (emp, { asc }) => [asc(emp.fullName)]
	});

	const departments = await db.query.department.findMany();
	const companies = await db.query.company.findMany();

	return {
		employees,
		departments,
		companies,
		userRole: user.role
	};
};
