import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/** GET /api/employees/[id] — get single employee */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const emp = await db.query.employee.findFirst({
		where: eq(employee.id, params.id),
		with: { company: true, leaveRequests: true }
	});

	if (!emp) throw error(404, 'Employee not found');

	return json(emp);
};

/** PATCH /api/employees/[id] — update employee */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const role = locals.user.role;
	if (role !== 'hr_admin' && role !== 'owner') {
		throw error(403, 'Insufficient permissions');
	}

	const body = await request.json();
	const { fullName, baseSalary, bankAccount, role: empRole } = body;

	const updates: Record<string, unknown> = {};
	if (fullName !== undefined) updates.fullName = fullName;
	if (baseSalary !== undefined) updates.baseSalary = String(baseSalary);
	if (bankAccount !== undefined) updates.bankAccount = bankAccount;
	if (empRole !== undefined) updates.role = empRole;

	if (Object.keys(updates).length === 0) {
		throw error(400, 'No fields to update');
	}

	const [updated] = await db
		.update(employee)
		.set(updates)
		.where(eq(employee.id, params.id))
		.returning();

	if (!updated) throw error(404, 'Employee not found');

	return json(updated);
};
