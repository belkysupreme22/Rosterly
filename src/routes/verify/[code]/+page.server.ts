import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { documentRequest } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const doc = await db.query.documentRequest.findFirst({
		where: eq(documentRequest.verificationCode, params.code),
		with: {
			employee: {
				with: {
					company: true
				}
			}
		}
	});

	if (!doc) {
		throw error(404, 'Official document verification record not found or has expired.');
	}

	return { document: doc };
};
