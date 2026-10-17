import { createAccessControl } from 'better-auth/plugins/access';

/**
 * Rosterly Access Control Definitions
 *
 * Shared between server (auth.ts) and client (auth-client.ts).
 * Resources and actions map to real-world corporate separation of duties.
 */

const statement = {
	employee: ['view', 'create', 'update', 'delete'],
	department: ['view', 'create', 'update', 'delete'],
	leave: ['view', 'create', 'approve', 'deny'],
	payroll: ['view', 'manage', 'approve', 'disburse'],
	payslip: ['view', 'generate'],
	company: ['view', 'update']
} as const;

export const ac = createAccessControl(statement);

/**
 * Employee role:
 * View own payslips, view leave balance, submit leave requests, view department & company info.
 */
export const employeeRole = ac.newRole({
	employee: ['view'],
	department: ['view'],
	leave: ['view', 'create'],
	payslip: ['view'],
	company: ['view']
});

/**
 * Manager / Lead role:
 * Approve/deny leave requests for their department, view team calendar/coverage.
 */
export const managerRole = ac.newRole({
	employee: ['view'],
	department: ['view'],
	leave: ['view', 'create', 'approve', 'deny'],
	payslip: ['view'],
	company: ['view']
});

/**
 * Finance Officer role:
 * Initiates draft payroll, calculates statutory taxes/pensions, executes disbursed runs,
 * downloads CBE wire transfer batches, manages salary advance deductions.
 */
export const financeRole = ac.newRole({
	employee: ['view'],
	department: ['view'],
	leave: ['view'],
	payroll: ['view', 'manage', 'disburse'],
	payslip: ['view', 'generate'],
	company: ['view']
});

/**
 * HR Admin role:
 * Manage employee records, create & manage departments & appoint leads,
 * oversee leave administration and policy broadcasts.
 */
export const hrAdminRole = ac.newRole({
	employee: ['view', 'create', 'update', 'delete'],
	department: ['view', 'create', 'update', 'delete'],
	leave: ['view', 'create', 'approve', 'deny'],
	payroll: ['view'],
	payslip: ['view'],
	company: ['view', 'update']
});

/**
 * Owner / Managing Director role:
 * Executive fiduciary authority — sole approval of payroll runs before disbursement,
 * corporate governance, create departments, and company compliance.
 */
export const ownerRole = ac.newRole({
	employee: ['view', 'create', 'update', 'delete'],
	department: ['view', 'create', 'update', 'delete'],
	leave: ['view', 'create', 'approve', 'deny'],
	payroll: ['view', 'approve'],
	payslip: ['view', 'generate'],
	company: ['view', 'update']
});
