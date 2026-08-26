import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { leaveRequest } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/** PATCH /api/leave/[id] — approve or deny a leave request */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const role = locals.user.role;
	if (role !== 'manager' && role !== 'hr_admin' && role !== 'owner') {
		throw error(403, 'Only managers and HR admins can approve/deny leave requests');
	}

	const body = await request.json();
	const { status } = body;

	if (!status || !['approved', 'denied'].includes(status)) {
		throw error(400, 'Status must be "approved" or "denied"');
	}

	// Verify the request exists and is in pending state
	const existing = await db.query.leaveRequest.findFirst({
		where: eq(leaveRequest.id, params.id)
	});

	if (!existing) throw error(404, 'Leave request not found');

	if (existing.status !== 'pending') {
		throw error(400, `Cannot change status of a ${existing.status} leave request`);
	}

	const [updated] = await db
		.update(leaveRequest)
		.set({ status })
		.where(eq(leaveRequest.id, params.id))
		.returning();

	return json(updated);
};
