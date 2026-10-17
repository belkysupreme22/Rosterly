import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payslip, userAccount, employee } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const slip = await db.query.payslip.findFirst({
		where: eq(payslip.id, params.id),
		with: {
			employee: {
				with: { company: true }
			},
			payrollRun: {
				with: { company: true }
			}
		}
	});

	if (!slip) throw error(404, 'Payslip not found');

	// If employee role, ensure they are viewing their own payslip
	if (user.role === 'employee') {
		const phone = (user as any).phoneNumber || '';
		const userAcc = await db.query.userAccount.findFirst({
			where: eq(userAccount.phone, phone)
		});
		if (userAcc && userAcc.employeeId !== slip.employeeId) {
			throw error(403, 'Access denied');
		}
	}

	return {
		user,
		payslip: slip
	};
};
