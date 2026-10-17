import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { department, employee } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/** GET /api/departments/[id] — get single department with lead and members */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const dept = await db.query.department.findFirst({
		where: eq(department.id, params.id),
		with: {
			lead: true,
			members: true,
			company: true
		}
	});

	if (!dept) throw error(404, 'Department not found');

	return json(dept);
};

/** PATCH /api/departments/[id] — update department details & representative lead */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const role = locals.user.role;
	if (role !== 'hr_admin' && role !== 'owner') {
		throw error(403, 'Only HR Admins and Owners can modify company departments');
	}

	const body = await request.json();
	const { name, code, description, leadId, budgetMonthly, color } = body;

	const updates: Record<string, unknown> = {};
	if (name !== undefined) updates.name = name;
	if (code !== undefined) updates.code = code.toUpperCase();
	if (description !== undefined) updates.description = description;
	if (leadId !== undefined) updates.leadId = leadId || null;
	if (budgetMonthly !== undefined) updates.budgetMonthly = String(budgetMonthly);
	if (color !== undefined) updates.color = color;

	if (Object.keys(updates).length === 0) {
		throw error(400, 'No fields provided to update');
	}

	const [updated] = await db
		.update(department)
		.set(updates)
		.where(eq(department.id, params.id))
		.returning();

	if (!updated) throw error(404, 'Department not found');

	// If lead is updated, ensure lead's departmentId is set to this department
	if (leadId) {
		await db.update(employee).set({ departmentId: updated.id }).where(eq(employee.id, leadId));
	}

	return json(updated);
};

/** DELETE /api/departments/[id] — delete department */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const role = locals.user.role;
	if (role !== 'hr_admin' && role !== 'owner') {
		throw error(403, 'Only HR Admins and Owners can delete company departments');
	}

	// Remove department association from all employees in this department
	await db.update(employee).set({ departmentId: null }).where(eq(employee.departmentId, params.id));

	const [deleted] = await db
		.delete(department)
		.where(eq(department.id, params.id))
		.returning();

	if (!deleted) throw error(404, 'Department not found');

	return json({ success: true, deletedId: deleted.id });
};
