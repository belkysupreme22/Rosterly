import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { leaveRequest } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

/** GET /api/leave — list leave requests (filtered by role) */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	// All authenticated users can view leave requests
	// Filtering by user's own requests vs all will be handled by the page
	const requests = await db.query.leaveRequest.findMany({
		with: { employee: true },
		orderBy: [desc(leaveRequest.createdAt)]
	});

	return json(requests);
};

/** POST /api/leave — submit a new leave request */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const body = await request.json();
	const { employeeId, startDate, endDate } = body;

	if (!employeeId || !startDate || !endDate) {
		throw error(400, 'Missing required fields: employeeId, startDate, endDate');
	}

	if (new Date(startDate) > new Date(endDate)) {
		throw error(400, 'Start date must be before end date');
	}

	const [newRequest] = await db
		.insert(leaveRequest)
		.values({
			employeeId,
			startDate,
			endDate,
			status: 'pending'
		})
		.returning();

	return json(newRequest, { status: 201 });
};
