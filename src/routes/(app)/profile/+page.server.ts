import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { employee, userAccount } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const emailToPhone: Record<string, string> = {
		'owner@acme.com': '+251911000001',
		'hr@acme.com': '+251911000002',
		'finance@acme.com': '+251911000005',
		'manager@acme.com': '+251911000003',
		'hana@acme.com': '+251911000004'
	};

	const phone = emailToPhone[user.email] || (user as any).phoneNumber || '';

	let emp = null;
	if (phone) {
		const userAcc = await db.query.userAccount.findFirst({
			where: eq(userAccount.phone, phone)
		});
		if (userAcc?.employeeId) {
			emp = await db.query.employee.findFirst({
				where: eq(employee.id, userAcc.employeeId)
			});
		}
	}

	if (!emp) {
		emp = await db.query.employee.findFirst({
			where: eq(employee.role, user.role as any)
		});
	}

	if (!emp) {
		emp = await db.query.employee.findFirst();
	}

	if (emp) {
		throw redirect(302, `/employees/${emp.id}`);
	}

	throw redirect(302, '/dashboard');
};
