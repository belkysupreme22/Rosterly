import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	console.log(`[REQUEST] ${event.request.method} ${event.url.pathname}`);

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		console.log(`[SESSION] Found session for user: ${session.user.email} (${(session.user as any).role})`);
		event.locals.session = session.session;
		event.locals.user = session.user as any;
	} else {
		if (!event.url.pathname.startsWith('/api/auth') && !event.url.pathname.includes('.')) {
			console.log(`[SESSION] No session found for ${event.url.pathname}. Cookies: ${event.request.headers.get('cookie') || 'none'}`);
		}
		event.locals.session = null;
		event.locals.user = null;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
