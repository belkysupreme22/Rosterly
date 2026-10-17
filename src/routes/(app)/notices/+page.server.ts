import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notice, company } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const noticesList = await db.query.notice.findMany({
		with: {
			company: true,
			acknowledgments: {
				with: {
					employee: true
				}
			}
		},
		orderBy: [desc(notice.createdAt)]
	});

	const companies = await db.query.company.findMany();

	return {
		notices: noticesList,
		companies,
		userRole: user.role
	};
};
