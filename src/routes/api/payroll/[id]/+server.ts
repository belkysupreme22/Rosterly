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

	const role = locals.user.role;
	if (role !== 'finance' && role !== 'hr_admin' && role !== 'owner') {
		throw error(403, 'Forbidden: Insufficient permissions to manage payroll runs');
	}

	const body = await request.json();
	const { status } = body;

	const validStatuses = ['draft', 'pending_approval', 'approved', 'disbursed'] as const;
	if (!status || !validStatuses.includes(status)) {
		throw error(400, 'Invalid status. Must be draft, pending_approval, approved, or disbursed');
	}

	// Separation of Duties checks:
	// Only Owner has fiduciary authorization to approve payroll
	if (status === 'approved' && role !== 'owner') {
		throw error(403, 'Forbidden: Only the Owner / Managing Director can authorize and approve payroll runs');
	}

	// Only Finance, Owner, or HR Admin can execute disbursement
	if (status === 'disbursed' && role !== 'finance' && role !== 'owner' && role !== 'hr_admin') {
		throw error(403, 'Forbidden: Only Finance or Executive management can disburse payroll');
	}

	const [updated] = await db
		.update(payrollRun)
		.set({
			status,
			updatedAt: new Date()
		})
		.where(eq(payrollRun.id, params.id))
		.returning();

	if (!updated) throw error(404, 'Payroll run not found');

	return json({ payrollRun: updated });
};
