import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { department, employee } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user;
	if (!user) throw error(401, 'Unauthorized');

	if (user.role !== 'hr_admin' && user.role !== 'owner') {
		throw error(403, 'Only HR Admins and Owners can create company departments');
	}

	const body = await request.json();
	const { name, code, description, leadId, budgetMonthly, color, companyId } = body;

	if (!name || !code) {
		throw error(400, 'Department name and code are required');
	}

	let targetCompanyId = companyId;
	if (!targetCompanyId) {
		const firstCompany = await db.query.company.findFirst();
		targetCompanyId = firstCompany?.id;
	}

	if (!targetCompanyId) {
		throw error(400, 'No company available to attach department');
	}

	const [newDept] = await db
		.insert(department)
		.values({
			name,
			code: code.toUpperCase(),
			description: description || null,
			leadId: leadId || null,
			budgetMonthly: budgetMonthly ? String(budgetMonthly) : '0',
			color: color || '#00C48C',
			companyId: targetCompanyId
		})
		.returning();

	// If lead is assigned, also link employee's departmentId
	if (leadId) {
		await db.update(employee).set({ departmentId: newDept.id }).where(eq(employee.id, leadId));
	}

	return json({ department: newDept });
};
