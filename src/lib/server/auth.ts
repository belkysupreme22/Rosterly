import 'dotenv/config';
import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, phoneNumber } from 'better-auth/plugins';
import { db } from './db';
import * as schema from './db/schema';
import {
	ac,
	employeeRole,
	managerRole,
	hrAdminRole,
	financeRole,
	ownerRole
} from '../permissions';

export const auth = betterAuth({
	secret:
		env.BETTER_AUTH_SECRET ||
		process.env.BETTER_AUTH_SECRET ||
		'rosterly-secret-32-chars-long-auth-token-dev',
	baseURL:
		env.BETTER_AUTH_URL ||
		process.env.BETTER_AUTH_URL ||
		'http://localhost:3000',
	trustedOrigins: [
		'http://localhost:3000',
		'http://127.0.0.1:3000',
		'http://localhost:5173',
		'http://127.0.0.1:5173'
	],
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
