import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { payrollRun } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const run = await db.query.payrollRun.findFirst({
		where: eq(payrollRun.id, params.id),
		with: {
			company: true,
			payslips: {
				with: { employee: true }
			}
		}
	});

	if (!run) throw error(404, 'Payroll run not found');

	return json({ payrollRun: run });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	if (locals.user.role !== 'hr_admin' && locals.user.role !== 'owner' && locals.user.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	const body = await request.json();
	const { status } = body;

	if (!status || !['draft', 'pending_approval', 'disbursed'].includes(status)) {
		throw error(400, 'Invalid status');
	}

	// Only owner or hr_admin can disburse
	if (status === 'disbursed' && locals.user.role !== 'owner' && locals.user.role !== 'hr_admin') {
		throw error(403, 'Only Owner or HR Admin can disburse payroll');
	}

	const [updated] = await db
		.update(payrollRun)
		.set({
			status: status as any,
			updatedAt: new Date()
		})
		.where(eq(payrollRun.id, params.id))
		.returning();

	if (!updated) throw error(404, 'Payroll run not found');

	return json({ payrollRun: updated });
};
