import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee, company } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	if (user.role !== 'hr_admin' && user.role !== 'owner') {
		throw error(403, 'Access denied');
	}

	const employees = await db.query.employee.findMany({
		with: { company: true },
		orderBy: (emp, { asc }) => [asc(emp.fullName)]
	});

	const companies = await db.query.company.findMany();

	return { employees, companies };
};
