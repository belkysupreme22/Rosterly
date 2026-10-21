import {
	pgTable,
	pgEnum,
	uuid,
	varchar,
	decimal,
	date,
	jsonb,
	timestamp,
	boolean,
	text,
	integer
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Better Auth Tables ──────────────────────────────────────────────────────

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires', { withTimezone: true }),
	phoneNumber: text('phone_number'),
	phoneNumberVerified: boolean('phone_number_verified')
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
	scope: text('scope'),
	password: text('password'),
	issuer: text('issuer'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// ── Enums ──────────────────────────────────────────────────────────────────

export const employeeRoleEnum = pgEnum('employee_role', [
	'employee',
	'manager',
	'hr_admin',
	'finance',
	'owner'
]);

export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'denied']);

export const payrollRunStatusEnum = pgEnum('payroll_run_status', [
	'draft',
	'pending_approval',
	'approved',
	'disbursed'
]);

export const employmentTypeEnum = pgEnum('employment_type', [
	'full_time',
	'part_time',
	'contractual'
]);

export const positionLevelEnum = pgEnum('position_level', [
	'junior',
	'mid',
	'senior',
	'lead',
	'principal'
]);

export const workStatusEnum = pgEnum('work_status', [
	'in_office',
	'remote',
	'in_meeting',
	'on_leave',
	'sick'
]);

export const assetCategoryEnum = pgEnum('asset_category', [
	'laptop',
	'phone',
	'sim_card',
	'keys',
	'other'
]);

export const assetStatusEnum = pgEnum('asset_status', [
	'assigned',
	'returned',
	'damaged'
]);

export const noticeCategoryEnum = pgEnum('notice_category', [
	'holiday',
	'payroll',
	'policy',
	'general'
]);

export const noticePriorityEnum = pgEnum('notice_priority', [
	'normal',
	'high',
	'urgent'
]);

export const salaryAdvanceStatusEnum = pgEnum('salary_advance_status', [
	'pending',
	'approved',
	'rejected',
	'deducted'
]);

// ── COMPANY ────────────────────────────────────────────────────────────────

export const company = pgTable('company', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	tin: varchar('tin', { length: 50 }).notNull(),
	payrollCutoffDay: integer('payroll_cutoff_day').notNull().default(25),
	payrollDisbursalDay: integer('payroll_disbursal_day').notNull().default(30),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
});

// ── DEPARTMENT ─────────────────────────────────────────────────────────────
export const department = pgTable('department', {
	id: uuid('id').defaultRandom().primaryKey(),
	companyId: uuid('company_id')
		.notNull()
		.references(() => company.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	code: varchar('code', { length: 50 }).notNull(), // e.g. FIN, ENG, DES, HR, EXEC, SLS
	description: text('description'),
	leadId: uuid('lead_id'), // Reference to the lead employee
	budgetMonthly: decimal('budget_monthly', { precision: 12, scale: 2 }).default('0'),
	color: varchar('color', { length: 50 }).default('#00C48C'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
});

// ── EMPLOYEE ───────────────────────────────────────────────────────────────

export const employee = pgTable('employee', {
	id: uuid('id').defaultRandom().primaryKey(),
	companyId: uuid('company_id')
		.notNull()
		.references(() => company.id, { onDelete: 'cascade' }),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	departmentId: uuid('department_id').references(() => department.id, { onDelete: 'set null' }),
	fullName: varchar('full_name', { length: 255 }).notNull(),
	role: employeeRoleEnum('role').notNull().default('employee'),
	employmentType: employmentTypeEnum('employment_type').notNull().default('full_time'),
	positionLevel: positionLevelEnum('position_level').notNull().default('mid'),
	jobDescription: text('job_description'),
	workStatus: workStatusEnum('work_status').notNull().default('in_office'),
	contractStartDate: date('contract_start_date'),
	contractEndDate: date('contract_end_date'),
	baseSalary: decimal('base_salary', { precision: 12, scale: 2 }).notNull(),
	bankAccount: varchar('bank_account', { length: 100 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
});

// ── USER_ACCOUNT ───────────────────────────────────────────────────────────
// Links Better Auth user to an Employee and stores Telegram identification.

export const userAccount = pgTable('user_account', {
	id: uuid('id').defaultRandom().primaryKey(),
	employeeId: uuid('employee_id').references(() => employee.id, { onDelete: 'set null' }),
	phone: varchar('phone', { length: 30 }),
	telegramChatId: varchar('telegram_chat_id', { length: 50 }),
	authRole: employeeRoleEnum('auth_role').notNull().default('employee'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ── DEDUCTION_RULE ─────────────────────────────────────────────────────────

export const deductionRule = pgTable('deduction_rule', {
	id: uuid('id').defaultRandom().primaryKey(),
	companyId: uuid('company_id')
		.notNull()
		.references(() => company.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }),
	type: varchar('type', { length: 50 }).notNull(),
	rate: decimal('rate', { precision: 8, scale: 6 }),
	fixedAmount: decimal('fixed_amount', { precision: 12, scale: 2 }),
	effectiveFrom: date('effective_from').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ── PAYROLL_RUN ────────────────────────────────────────────────────────────

export const payrollRun = pgTable('payroll_run', {
	id: uuid('id').defaultRandom().primaryKey(),
	companyId: uuid('company_id')
		.notNull()
		.references(() => company.id, { onDelete: 'cascade' }),
	periodStart: date('period_start').notNull(),
	periodEnd: date('period_end').notNull(),
	status: payrollRunStatusEnum('status').notNull().default('draft'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
});

// ── PAYSLIP ────────────────────────────────────────────────────────────────

export const payslip = pgTable('payslip', {
	id: uuid('id').defaultRandom().primaryKey(),
	payrollRunId: uuid('payroll_run_id')
		.notNull()
		.references(() => payrollRun.id, { onDelete: 'cascade' }),
	employeeId: uuid('employee_id')
		.notNull()
		.references(() => employee.id, { onDelete: 'cascade' }),
	grossPay: decimal('gross_pay', { precision: 12, scale: 2 }).notNull(),
	netPay: decimal('net_pay', { precision: 12, scale: 2 }).notNull(),
	deductions: jsonb('deductions')
		.notNull()
		.$type<{ type: string; amount: number }[]>(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ── LEAVE_REQUEST ──────────────────────────────────────────────────────────

export const leaveRequest = pgTable('leave_request', {
	id: uuid('id').defaultRandom().primaryKey(),
	employeeId: uuid('employee_id')
		.notNull()
		.references(() => employee.id, { onDelete: 'cascade' }),
	startDate: date('start_date').notNull(),
	endDate: date('end_date').notNull(),
	type: varchar('type', { length: 50 }).notNull().default('Annual Leave'),
	status: leaveStatusEnum('status').notNull().default('pending'),
	reason: text('reason'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
});

// ── SALARY_ADVANCE ─────────────────────────────────────────────────────────

export const salaryAdvance = pgTable('salary_advance', {
	id: uuid('id').defaultRandom().primaryKey(),
	employeeId: uuid('employee_id')
		.notNull()
		.references(() => employee.id, { onDelete: 'cascade' }),
	amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
	reason: text('reason').notNull(),
	status: salaryAdvanceStatusEnum('status').notNull().default('pending'),
	payrollRunId: uuid('payroll_run_id').references(() => payrollRun.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
});

// ── COMPANY_ASSET ──────────────────────────────────────────────────────────

export const companyAsset = pgTable('company_asset', {
	id: uuid('id').defaultRandom().primaryKey(),
	employeeId: uuid('employee_id')
		.notNull()
		.references(() => employee.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	category: assetCategoryEnum('category').notNull().default('laptop'),
	serialNumber: varchar('serial_number', { length: 100 }),
	assignedDate: date('assigned_date').notNull(),
	returnedDate: date('returned_date'),
	status: assetStatusEnum('status').notNull().default('assigned'),
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ── NOTICE & BROADCASTS ────────────────────────────────────────────────────

export const notice = pgTable('notice', {
	id: uuid('id').defaultRandom().primaryKey(),
	companyId: uuid('company_id')
		.notNull()
		.references(() => company.id, { onDelete: 'cascade' }),
	title: varchar('title', { length: 255 }).notNull(),
	content: text('content').notNull(),
	category: noticeCategoryEnum('category').notNull().default('general'),
	priority: noticePriorityEnum('priority').notNull().default('normal'),
	eventDate: date('event_date'), // e.g. holiday date for automated radar
	requiresAcknowledgment: boolean('requires_acknowledgment').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const noticeAcknowledgment = pgTable('notice_acknowledgment', {
	id: uuid('id').defaultRandom().primaryKey(),
	noticeId: uuid('notice_id')
		.notNull()
		.references(() => notice.id, { onDelete: 'cascade' }),
	employeeId: uuid('employee_id')
		.notNull()
		.references(() => employee.id, { onDelete: 'cascade' }),
	acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }).defaultNow().notNull()
});

// ── DOCUMENT_REQUEST (QR-Verifiable Letters) ────────────────────────────────

export const documentRequest = pgTable('document_request', {
	id: uuid('id').defaultRandom().primaryKey(),
	employeeId: uuid('employee_id')
		.notNull()
		.references(() => employee.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 100 }).notNull().default('employment_verification'),
	purpose: varchar('purpose', { length: 255 }), // e.g. "Bank Loan Application - CBE"
	verificationCode: varchar('verification_code', { length: 64 }).notNull().unique(),
	recipientOrganization: varchar('recipient_organization', { length: 255 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ── Relations ──────────────────────────────────────────────────────────────

export const companyRelations = relations(company, ({ many }) => ({
	departments: many(department),
	employees: many(employee),
	deductionRules: many(deductionRule),
	payrollRuns: many(payrollRun),
	notices: many(notice)
}));

export const departmentRelations = relations(department, ({ one, many }) => ({
	company: one(company, {
		fields: [department.companyId],
		references: [company.id]
	}),
	lead: one(employee, {
		fields: [department.leadId],
		references: [employee.id],
		relationName: 'departmentLead'
	}),
	members: many(employee, {
		relationName: 'departmentMembers'
	})
}));

export const employeeRelations = relations(employee, ({ one, many }) => ({
	user: one(user, {
		fields: [employee.userId],
		references: [user.id]
	}),
	company: one(company, {
		fields: [employee.companyId],
		references: [company.id]
	}),
	department: one(department, {
		fields: [employee.departmentId],
		references: [department.id],
		relationName: 'departmentMembers'
	}),
	leadOfDepartments: many(department, {
		relationName: 'departmentLead'
	}),
	userAccount: one(userAccount, {
		fields: [employee.id],
		references: [userAccount.employeeId]
	}),
	leaveRequests: many(leaveRequest),
	payslips: many(payslip),
	salaryAdvances: many(salaryAdvance),
	assets: many(companyAsset),
	documentRequests: many(documentRequest),
	noticeAcknowledgments: many(noticeAcknowledgment)
}));

export const userAccountRelations = relations(userAccount, ({ one }) => ({
	employee: one(employee, {
		fields: [userAccount.employeeId],
		references: [employee.id]
	})
}));

export const salaryAdvanceRelations = relations(salaryAdvance, ({ one }) => ({
	employee: one(employee, {
		fields: [salaryAdvance.employeeId],
		references: [employee.id]
	}),
	payrollRun: one(payrollRun, {
		fields: [salaryAdvance.payrollRunId],
		references: [payrollRun.id]
	})
}));

export const companyAssetRelations = relations(companyAsset, ({ one }) => ({
	employee: one(employee, {
		fields: [companyAsset.employeeId],
		references: [employee.id]
	})
}));

export const noticeRelations = relations(notice, ({ one, many }) => ({
	company: one(company, {
		fields: [notice.companyId],
		references: [company.id]
	}),
	acknowledgments: many(noticeAcknowledgment)
}));

export const noticeAcknowledgmentRelations = relations(noticeAcknowledgment, ({ one }) => ({
	notice: one(notice, {
		fields: [noticeAcknowledgment.noticeId],
		references: [notice.id]
	}),
	employee: one(employee, {
		fields: [noticeAcknowledgment.employeeId],
		references: [employee.id]
	})
}));

export const documentRequestRelations = relations(documentRequest, ({ one }) => ({
	employee: one(employee, {
		fields: [documentRequest.employeeId],
		references: [employee.id]
	})
}));

export const deductionRuleRelations = relations(deductionRule, ({ one }) => ({
	company: one(company, {
		fields: [deductionRule.companyId],
		references: [company.id]
	})
}));

export const payrollRunRelations = relations(payrollRun, ({ one, many }) => ({
	company: one(company, {
		fields: [payrollRun.companyId],
		references: [company.id]
	}),
	payslips: many(payslip),
	salaryAdvances: many(salaryAdvance)
}));

export const payslipRelations = relations(payslip, ({ one }) => ({
	payrollRun: one(payrollRun, {
		fields: [payslip.payrollRunId],
		references: [payrollRun.id]
	}),
	employee: one(employee, {
		fields: [payslip.employeeId],
		references: [employee.id]
	})
}));

export const leaveRequestRelations = relations(leaveRequest, ({ one }) => ({
	employee: one(employee, {
		fields: [leaveRequest.employeeId],
		references: [employee.id]
	})
}));

// ── Type exports ───────────────────────────────────────────────────────────

export type Company = typeof company.$inferSelect;
export type NewCompany = typeof company.$inferInsert;
export type Employee = typeof employee.$inferSelect;
export type NewEmployee = typeof employee.$inferInsert;
export type UserAccount = typeof userAccount.$inferSelect;
export type NewUserAccount = typeof userAccount.$inferInsert;
export type DeductionRule = typeof deductionRule.$inferSelect;
export type NewDeductionRule = typeof deductionRule.$inferInsert;
export type PayrollRun = typeof payrollRun.$inferSelect;
export type NewPayrollRun = typeof payrollRun.$inferInsert;
export type Payslip = typeof payslip.$inferSelect;
export type NewPayslip = typeof payslip.$inferInsert;
export type LeaveRequest = typeof leaveRequest.$inferSelect;
export type NewLeaveRequest = typeof leaveRequest.$inferInsert;
export type SalaryAdvance = typeof salaryAdvance.$inferSelect;
export type NewSalaryAdvance = typeof salaryAdvance.$inferInsert;
export type CompanyAsset = typeof companyAsset.$inferSelect;
export type NewCompanyAsset = typeof companyAsset.$inferInsert;
export type Notice = typeof notice.$inferSelect;
export type NewNotice = typeof notice.$inferInsert;
export type NoticeAcknowledgment = typeof noticeAcknowledgment.$inferSelect;
export type NewNoticeAcknowledgment = typeof noticeAcknowledgment.$inferInsert;
export type DocumentRequest = typeof documentRequest.$inferSelect;
export type NewDocumentRequest = typeof documentRequest.$inferInsert;
export type Department = typeof department.$inferSelect;
export type NewDepartment = typeof department.$inferInsert;
