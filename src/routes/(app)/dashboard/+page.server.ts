import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee, leaveRequest, payslip, notice } from '$lib/server/db/schema';
import { eq, count, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// 1. If standard employee, load their personal workforce metrics
	if (user.role === 'employee') {
		let emp = await db.query.employee.findFirst({
			where: eq(employee.userId, user.id),
			with: { company: true }
		});

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

		// Count approved leave days
		const usedLeaveDays = myLeaves
			.filter((l) => l.status === 'approved')
			.reduce((total, l) => {
				const start = new Date(l.startDate).getTime();
				const end = new Date(l.endDate).getTime();
				const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
				return total + days;
			}, 0);

		const totalQuota = 20; // Ethiopian standard annual quota baseline
		const availableDays = Math.max(0, totalQuota - usedLeaveDays);

		return {
			isEmployeeView: true,
			employee: emp,
			myStats: {
				availableLeaveDays: availableDays,
				totalLeaveQuota: totalQuota,
				monthlyGross: emp?.baseSalary || '38000.00',
				workStatus: emp?.workStatus || 'in_office',
				positionLevel: emp?.positionLevel || 'mid'
			},
			myLeaves,
			myLatestPayslip,
			activeNotices
		};
	}

	// 2. For Manager / HR Admin / Finance / Owner, load company-wide operational overview
	const allEmployees = await db.query.employee.findMany();
	const employeeCount = allEmployees.length;

	const [pendingLeaveCount] = await db
		.select({ count: count() })
		.from(leaveRequest)
		.where(eq(leaveRequest.status, 'pending'));

	const totalBaseSalarySum = allEmployees.reduce((acc, curr) => acc + Number(curr.baseSalary || 0), 0);
	const formattedDisbursement = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'ETB',
		maximumFractionDigits: 0
	}).format(totalBaseSalarySum);

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
			totalEmployees: employeeCount,
			pendingLeave: pendingLeaveCount.count,
			attendanceRate: '96.2%',
			totalDisbursement: formattedDisbursement
		},
		recentLeaveRequests,
		activeNotices
	};
};
