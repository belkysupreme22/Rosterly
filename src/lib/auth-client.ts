import { createAuthClient } from 'better-auth/svelte';
import { adminClient, phoneNumberClient } from 'better-auth/client/plugins';
import {
	ac,
	employeeRole,
	managerRole,
	hrAdminRole,
	ownerRole
} from '$lib/permissions';

export const authClient = createAuthClient({
	baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
	plugins: [
		adminClient({
			ac,
			roles: {
				employee: employeeRole,
				manager: managerRole,
				hr_admin: hrAdminRole,
				owner: ownerRole
			}
		}),
		phoneNumberClient()
	]
});
