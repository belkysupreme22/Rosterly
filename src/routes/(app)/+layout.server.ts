import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ locals, request, url }) => {
	let user = locals.user;
	let session = locals.session;

	if (!user || !session) {
		const res = await auth.api.getSession({
			headers: request.headers
		});
		if (res) {
			user = res.user as any;
			session = res.session;
		}
	}

	if (!user || !session) {
		throw redirect(302, '/login');
	}

	return {
		user,
		session,
		currentPath: url.pathname
	};
};
