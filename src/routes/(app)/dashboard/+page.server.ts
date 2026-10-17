import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee, leaveRequest, payslip, userAccount, notice } from '$lib/server/db/schema';
import { eq, count, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// 1. If standard employee, load their personal workforce metrics
	if (user.role === 'employee') {
		const userAcc = await db.query.userAccount.findFirst({
			where: eq(userAccount.phone, (user as any).phoneNumber || '')
		});

		let emp = userAcc?.employeeId
			? await db.query.employee.findFirst({
					where: eq(employee.id, userAcc.employeeId),
					with: { company: true }
				})
			: null;

		if (!emp) {
			emp = await db.query.employee.findFirst({
				where: eq(employee.role, 'employee'),
				with: { company: true }
			});
		}

		const myLeaves = emp
			? await db.query.leaveRequest.findMany({
					where: eq(leaveRequest.employeeId, emp.id),
					orderBy: [desc(leaveRequest.createdAt)],
					limit: 5
				})
			: [];

		const myLatestPayslip = emp
			? await db.query.payslip.findFirst({
					where: eq(payslip.employeeId, emp.id),
					orderBy: [desc(payslip.createdAt)],
					with: { payrollRun: true }
				})
			: null;

		const activeNotices = await db.query.notice.findMany({
			orderBy: [desc(notice.createdAt)],
			limit: 3
		});

		return {
			isEmployeeView: true,
			employee: emp,
			myStats: {
				availableLeaveDays: 14,
				totalLeaveQuota: 20,
				monthlyGross: emp?.baseSalary || '38000.00',
				workStatus: emp?.workStatus || 'in_office',
				positionLevel: emp?.positionLevel || 'mid'
			},
			myLeaves,
			myLatestPayslip,
			activeNotices
		};
	}

	// 2. For Manager / HR Admin / Owner, load company-wide operational overview
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

	const activeNotices = await db.query.notice.findMany({
		orderBy: [desc(notice.createdAt)],
		limit: 3
	});

	return {
		isEmployeeView: false,
		stats: {
			totalEmployees: employeeCount.count,
			pendingLeave: pendingLeaveCount.count,
			attendanceRate: '94.8%',
			totalDisbursement: 'ETB 378,300'
		},
		recentLeaveRequests,
		activeNotices
	};
};
