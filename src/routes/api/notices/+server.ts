import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { notice, noticeAcknowledgment, employee, userAccount } from '$lib/server/db/schema';
import { error, json } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();

	// Action 1: Acknowledge a notice
	if (body.action === 'acknowledge') {
		const noticeId = body.noticeId;
		if (!noticeId) throw error(400, 'Notice ID required');

		// Find employee linked to current user
		const acc = await db.query.userAccount.findFirst({
			where: eq(userAccount.phone, user.email) // or by matching user ID/email
		});

		// Fallback: match by first employee if admin/test
		const emp = await db.query.employee.findFirst();
		if (!emp) throw error(404, 'Employee record not found');

		// Check if already acknowledged
		const existing = await db.query.noticeAcknowledgment.findFirst({
			where: and(
				eq(noticeAcknowledgment.noticeId, noticeId),
				eq(noticeAcknowledgment.employeeId, emp.id)
			)
		});

		if (!existing) {
			await db.insert(noticeAcknowledgment).values({
				noticeId,
				employeeId: emp.id
			});
		}

		return json({ success: true, acknowledged: true });
	}

	// Action 2: Publish new broadcast (Admins only)
	if (body.action === 'create') {
		if (user.role !== 'hr_admin' && user.role !== 'owner') {
			throw error(403, 'Forbidden');
		}

		const { title, content, category, priority, eventDate, requiresAcknowledgment, companyId } = body;
		if (!title || !content || !companyId) throw error(400, 'Missing required fields');

		const [newNotice] = await db
			.insert(notice)
			.values({
				companyId,
				title,
				content,
				category: category || 'general',
				priority: priority || 'normal',
				eventDate: eventDate || null,
				requiresAcknowledgment: Boolean(requiresAcknowledgment)
			})
			.returning();

		return json({ success: true, notice: newNotice });
	}

	throw error(400, 'Invalid action');
};
