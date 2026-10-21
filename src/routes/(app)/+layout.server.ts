import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { employee, notice, noticeAcknowledgment } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals, request, url }) => {
	let user = locals.user;
	let session = locals.session;

	if (!user || !session) {
		const res = await auth.api.getSession({
			headers: request.headers
		});
		if (res) {
			user = res.user as any;
			session = res.session;
		}
	}

	if (!user || !session) {
		throw redirect(302, '/login');
	}

	// 1. Resolve employee record directly linked to this authenticated user
	let emp = await db.query.employee.findFirst({
		where: eq(employee.userId, user.id),
		with: {
			company: true,
			department: true
		}
	});

	// Graceful fallback for demo accounts if userId has not yet been linked
	if (!emp && user.role) {
		emp = await db.query.employee.findFirst({
			where: eq(employee.role, user.role as any),
			with: {
				company: true,
				department: true
			}
		});
	}

	// 2. Count unread (unacknowledged) notices
	const allNotices = await db.query.notice.findMany();
	let unreadNoticesCount = 0;

	if (emp && allNotices.length > 0) {
		const myAcks = await db.query.noticeAcknowledgment.findMany({
			where: eq(noticeAcknowledgment.employeeId, emp.id)
		});
		const ackNoticeIds = new Set(myAcks.map((a) => a.noticeId));
		unreadNoticesCount = allNotices.filter((n) => !ackNoticeIds.has(n.id)).length;
	} else {
		unreadNoticesCount = allNotices.length;
	}

	return {
		user,
		session,
		employeeId: emp?.id || null,
		employee: emp,
		unreadNoticesCount,
		currentPath: url.pathname
	};
};
