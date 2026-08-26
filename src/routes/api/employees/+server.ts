import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { employee, company } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/** GET /api/employees — list employees for the user's company */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const role = locals.user.role;
	if (role !== 'hr_admin' && role !== 'owner' && role !== 'manager') {
		throw error(403, 'Insufficient permissions');
	}

	// For now, return all employees (multi-company filtering comes with full tenant context)
	const employees = await db.query.employee.findMany({
		with: { company: true },
		orderBy: (emp, { asc }) => [asc(emp.fullName)]
	});

	return json(employees);
};

/** POST /api/employees — create a new employee */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const role = locals.user.role;
	if (role !== 'hr_admin' && role !== 'owner') {
		throw error(403, 'Insufficient permissions');
	}

	const body = await request.json();

	const { fullName, companyId, baseSalary, bankAccount, role: empRole } = body;

	if (!fullName || !companyId || baseSalary === undefined) {
		throw error(400, 'Missing required fields: fullName, companyId, baseSalary');
	}

	const [newEmployee] = await db
		.insert(employee)
		.values({
			fullName,
			companyId,
			baseSalary: String(baseSalary),
			bankAccount: bankAccount || null,
			role: empRole || 'employee'
		})
		.returning();

	return json(newEmployee, { status: 201 });
};
