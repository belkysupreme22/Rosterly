import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema';

/** GET /api/employees — list employees with department and company */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const role = locals.user.role;
	if (role !== 'hr_admin' && role !== 'owner' && role !== 'manager' && role !== 'finance') {
		throw error(403, 'Insufficient permissions');
	}

	const employees = await db.query.employee.findMany({
		with: {
			company: true,
			department: true
		},
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

	const {
		fullName,
		companyId,
		departmentId,
		baseSalary,
		bankAccount,
		role: empRole,
		employmentType,
		positionLevel,
		jobDescription
	} = body;

	if (!fullName || !companyId || baseSalary === undefined) {
		throw error(400, 'Missing required fields: fullName, companyId, baseSalary');
	}

	const [newEmployee] = await db
		.insert(employee)
		.values({
			fullName,
			companyId,
			departmentId: departmentId || null,
			baseSalary: String(baseSalary),
			bankAccount: bankAccount || null,
			role: empRole || 'employee',
			employmentType: employmentType || 'full_time',
			positionLevel: positionLevel || 'mid',
			jobDescription: jobDescription || null
		})
		.returning();

	return json(newEmployee, { status: 201 });
};
