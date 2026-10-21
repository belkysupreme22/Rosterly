import { createAuthClient } from 'better-auth/svelte';
import { adminClient, phoneNumberClient } from 'better-auth/client/plugins';
import {
	ac,
	employeeRole,
	managerRole,
	hrAdminRole,
	financeRole,
	ownerRole
} from '$lib/permissions';

export const authClient = createAuthClient({
	baseURL:
		typeof window !== 'undefined'
			? window.location.origin
			: (import.meta.env.VITE_APP_URL as string) || 'http://localhost:5173',
	plugins: [
		adminClient({
			ac,
			roles: {
				employee: employeeRole,
				manager: managerRole,
				hr_admin: hrAdminRole,
				finance: financeRole,
				owner: ownerRole
			}
		}),
		phoneNumberClient()
	]
});
