import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { payrollRun, company } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { previewPayrollRun, executePayrollRun } from '$lib/server/payroll';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const role = locals.user.role;
	if (role !== 'finance' && role !== 'hr_admin' && role !== 'owner' && role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	const runs = await db.query.payrollRun.findMany({
		with: {
			company: true,
			payslips: {
				with: { employee: true }
			}
		},
		orderBy: [desc(payrollRun.createdAt)]
	});

	return json({ payrollRuns: runs });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const role = locals.user.role;
	if (role !== 'finance' && role !== 'hr_admin' && role !== 'owner') {
		throw error(403, 'Only Finance, HR Admin, and Owner can create payroll runs');
	}

	const body = await request.json();
	const { periodStart, periodEnd, action = 'create', companyId: specifiedCompanyId } = body;

	if (!periodStart || !periodEnd) {
		throw error(400, 'periodStart and periodEnd are required');
	}

	// Find the company id
	let companyId = specifiedCompanyId;
	if (!companyId) {
		const comp = await db.query.company.findFirst();
		if (!comp) throw error(404, 'No company found');
		companyId = comp.id;
	}

	if (action === 'preview') {
		const preview = await previewPayrollRun(companyId, periodStart, periodEnd);
		return json({ preview });
	}

	const result = await executePayrollRun({
		companyId,
		periodStart,
		periodEnd
	});

	return json(result, { status: 201 });
};
