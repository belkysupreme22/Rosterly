import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { department, employee, leaveRequest } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, asc, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const dept = await db.query.department.findFirst({
		where: eq(department.id, params.id),
		with: {
			company: true,
			lead: true,
			members: {
				with: {
					leaveRequests: {
						orderBy: [desc(leaveRequest.createdAt)],
						limit: 5
					}
				},
				orderBy: [asc(employee.fullName)]
			}
		}
	});

	if (!dept) throw error(404, 'Department not found');

	const allEmployees = await db.query.employee.findMany({
		orderBy: [asc(employee.fullName)]
	});

	// Calculate Department Financials & Headcount Metrics
	const totalMembers = dept.members.length;
	const totalPayrollSpend = dept.members.reduce(
		(sum, member) => sum + Number(member.baseSalary || 0),
		0
	);
	const monthlyBudget = Number(dept.budgetMonthly || 0);
	const budgetUtilizationPercent =
		monthlyBudget > 0 ? Math.min(Math.round((totalPayrollSpend / monthlyBudget) * 100), 100) : 0;
	const remainingBudget = Math.max(0, monthlyBudget - totalPayrollSpend);

	// Collect all active and recent leaves across department members
	const departmentLeaves = dept.members.flatMap((m) =>
		m.leaveRequests.map((lr) => ({
			...lr,
			employeeName: m.fullName,
			employeeRole: m.role
		}))
	);

	const canManage = user.role === 'hr_admin' || user.role === 'owner';
	const canViewSalaries =
		user.role === 'hr_admin' || user.role === 'owner' || user.role === 'finance';

	return {
		userRole: user.role,
		canManage,
		canViewSalaries,
		department: dept,
		allEmployees,
		metrics: {
			totalMembers,
			totalPayrollSpend,
			monthlyBudget,
			budgetUtilizationPercent,
			remainingBudget
		},
		departmentLeaves
	};
};
