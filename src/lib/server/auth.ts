import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, phoneNumber } from 'better-auth/plugins';
import { db } from './db';
import * as schema from './db/schema';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL, getTrustedOrigins } from './env';
import {
	ac,
	employeeRole,
	managerRole,
	hrAdminRole,
	financeRole,
	ownerRole
} from '../permissions';

export const auth = betterAuth({
	secret: BETTER_AUTH_SECRET,
	baseURL: BETTER_AUTH_URL,
	trustedOrigins: getTrustedOrigins(),
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	emailAndPassword: {
		enabled: true
	},
	plugins: [
		admin({
			ac,
			roles: {
				employee: employeeRole,
				manager: managerRole,
				hr_admin: hrAdminRole,
				finance: financeRole,
				owner: ownerRole
			},
			defaultRole: 'employee'
		}),
		phoneNumber({
			sendOTP: async ({ phoneNumber: phone, code }) => {
				// Layer 3: replace with actual SMS/Telegram delivery
				console.log(`[DEV] OTP for ${phone}: ${code}`);
			}
		})
	]
});

export type Auth = typeof auth;
