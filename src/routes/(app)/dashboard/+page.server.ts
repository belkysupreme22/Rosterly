import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee, leaveRequest } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const [employeeCount] = await db
		.select({ count: count() })
		.from(employee);

	const [pendingLeaveCount] = await db
		.select({ count: count() })
		.from(leaveRequest)
		.where(eq(leaveRequest.status, 'pending'));

	const recentLeaveRequests = await db.query.leaveRequest.findMany({
		with: { employee: true },
		orderBy: (lr, { desc }) => [desc(lr.createdAt)],
		limit: 5
	});

	return {
		stats: {
			totalEmployees: employeeCount.count,
			pendingLeave: pendingLeaveCount.count
		},
		recentLeaveRequests
	};
};
