import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { employee, userAccount, notice, noticeAcknowledgment } from '$lib/server/db/schema';
import { eq, ilike } from 'drizzle-orm';

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

	// 1. Resolve employee record for this user across all roles
	const emailToPhone: Record<string, string> = {
		'owner@acme.com': '+251911000001',
		'hr@acme.com': '+251911000002',
		'finance@acme.com': '+251911000005',
		'manager@acme.com': '+251911000003',
		'hana@acme.com': '+251911000004'
	};

	const phone = emailToPhone[user.email] || (user as any).phoneNumber || '';

	let emp = null;
	if (phone) {
		const userAcc = await db.query.userAccount.findFirst({
			where: eq(userAccount.phone, phone)
		});
		if (userAcc?.employeeId) {
			emp = await db.query.employee.findFirst({
				where: eq(employee.id, userAcc.employeeId)
			});
		}
	}

	if (!emp) {
		emp = await db.query.employee.findFirst({
			where: eq(employee.role, user.role as any)
		});
	}

	if (!emp) {
		emp = await db.query.employee.findFirst();
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
		unreadNoticesCount,
		currentPath: url.pathname
	};
};
