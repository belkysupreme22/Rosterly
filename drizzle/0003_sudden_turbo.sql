CREATE TYPE "public"."asset_category" AS ENUM('laptop', 'phone', 'sim_card', 'keys', 'other');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('assigned', 'returned', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contractual');--> statement-breakpoint
CREATE TYPE "public"."notice_category" AS ENUM('holiday', 'payroll', 'policy', 'general');--> statement-breakpoint
CREATE TYPE "public"."notice_priority" AS ENUM('normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."position_level" AS ENUM('junior', 'mid', 'senior', 'lead', 'principal');--> statement-breakpoint
CREATE TYPE "public"."salary_advance_status" AS ENUM('pending', 'approved', 'rejected', 'deducted');--> statement-breakpoint
CREATE TYPE "public"."work_status" AS ENUM('in_office', 'remote', 'in_meeting', 'on_leave', 'sick');--> statement-breakpoint
CREATE TABLE "company_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "asset_category" DEFAULT 'laptop' NOT NULL,
	"serial_number" varchar(100),
	"assigned_date" date NOT NULL,
	"returned_date" date,
	"status" "asset_status" DEFAULT 'assigned' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" varchar(100) DEFAULT 'employment_verification' NOT NULL,
	"purpose" varchar(255),
	"verification_code" varchar(64) NOT NULL,
	"recipient_organization" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_request_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "notice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" "notice_category" DEFAULT 'general' NOT NULL,
	"priority" "notice_priority" DEFAULT 'normal' NOT NULL,
	"event_date" date,
	"requires_acknowledgment" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notice_acknowledgment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notice_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"acknowledged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_advance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text NOT NULL,
	"status" "salary_advance_status" DEFAULT 'pending' NOT NULL,
	"payroll_run_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deduction_rule" ALTER COLUMN "rate" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "payroll_cutoff_day" integer DEFAULT 25 NOT NULL;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "payroll_disbursal_day" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "deduction_rule" ADD COLUMN "name" varchar(100);--> statement-breakpoint
ALTER TABLE "deduction_rule" ADD COLUMN "fixed_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "employment_type" "employment_type" DEFAULT 'full_time' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "position_level" "position_level" DEFAULT 'mid' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "job_description" text;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "work_status" "work_status" DEFAULT 'in_office' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "contract_start_date" date;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "contract_end_date" date;--> statement-breakpoint
ALTER TABLE "leave_request" ADD COLUMN "type" varchar(50) DEFAULT 'Annual Leave' NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_request" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "user_account" ADD COLUMN "telegram_chat_id" varchar(50);--> statement-breakpoint
ALTER TABLE "company_asset" ADD CONSTRAINT "company_asset_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_request" ADD CONSTRAINT "document_request_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice" ADD CONSTRAINT "notice_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_acknowledgment" ADD CONSTRAINT "notice_acknowledgment_notice_id_notice_id_fk" FOREIGN KEY ("notice_id") REFERENCES "public"."notice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_acknowledgment" ADD CONSTRAINT "notice_acknowledgment_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_advance" ADD CONSTRAINT "salary_advance_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_advance" ADD CONSTRAINT "salary_advance_payroll_run_id_payroll_run_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."payroll_run"("id") ON DELETE set null ON UPDATE no action;