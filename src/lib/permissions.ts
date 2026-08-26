import { createAccessControl } from 'better-auth/plugins/access';

/**
 * Rosterly Access Control Definitions
 *
 * Shared between server (auth.ts) and client (auth-client.ts).
 * Resources and actions map to section 3's actor permissions.
 */

const statement = {
	employee: ['view', 'create', 'update', 'delete'],
	leave: ['view', 'create', 'approve', 'deny'],
	payroll: ['view', 'manage', 'approve'],
	payslip: ['view', 'generate'],
	company: ['view', 'update']
} as const;

export const ac = createAccessControl(statement);

/**
 * Employee role — section 3:
 * View own payslips, view leave balance, submit leave requests, update own bank details
 */
export const employeeRole = ac.newRole({
	employee: ['view'],
	leave: ['view', 'create'],
	payslip: ['view'],
	company: ['view']
});

/**
 * Manager role — section 3:
 * Approve/deny leave requests for their team, view team calendar/coverage
 */
export const managerRole = ac.newRole({
	employee: ['view'],
	leave: ['view', 'create', 'approve', 'deny'],
	payslip: ['view'],
	company: ['view']
});

/**
 * HR Admin role — section 3:
 * Manage employee records, configure deduction rules, prepare payroll runs,
 * generate payslips, generate compliance reports
 */
export const hrAdminRole = ac.newRole({
	employee: ['view', 'create', 'update', 'delete'],
	leave: ['view', 'create', 'approve', 'deny'],
	payroll: ['view', 'manage'],
	payslip: ['view', 'generate'],
	company: ['view', 'update']
});

/**
 * Owner role — section 3:
 * Approve payroll runs before disbursement, view cost/compliance dashboards
 */
export const ownerRole = ac.newRole({
	employee: ['view', 'create', 'update', 'delete'],
	leave: ['view', 'create', 'approve', 'deny'],
	payroll: ['view', 'manage', 'approve'],
	payslip: ['view', 'generate'],
	company: ['view', 'update']
});
