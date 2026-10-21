import dotenv from 'dotenv';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

declare const process: {
	env: Record<string, string | undefined>;
};

// Pre-load .env.local with priority over .env if running outside SvelteKit runner (e.g. scripts/cli)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

/**
 * Validated server-side environment variables.
 * Resolution precedence:
 * 1. SvelteKit runtime private env ($env/dynamic/private)
 * 2. process.env (populated from .env.local / .env / system env)
 * 3. Default fallback
 */
function getEnv(key: string, defaultValue?: string): string {
	const val = env[key] || process.env[key] || defaultValue;
	if (!val && !building) {
		console.warn(`[CONFIG WARNING] Missing environment variable "${key}".`);
	}
	return val || '';
}

export const DATABASE_URL = getEnv(
	'DATABASE_URL',
	'postgres://postgres:postgrespassword@localhost:5555/rosterly'
);

export const BETTER_AUTH_SECRET = getEnv(
	'BETTER_AUTH_SECRET',
	'rosterly-dev-secret-key-at-least-32-characters-long'
);

export const BETTER_AUTH_URL = getEnv(
	'BETTER_AUTH_URL',
	'http://localhost:5173'
);

export const PUBLIC_APP_URL = getEnv(
	'PUBLIC_APP_URL',
	BETTER_AUTH_URL || 'http://localhost:5173'
);

export const TELEGRAM_BOT_TOKEN = getEnv('TELEGRAM_BOT_TOKEN', '');

/**
 * Returns dynamic list of trusted origins for Better Auth CORS & Session verification
 */
export function getTrustedOrigins(): string[] {
	const customOrigins = (env['TRUSTED_ORIGINS'] || process.env['TRUSTED_ORIGINS'] || '')
		.split(',')
		.map((s: string) => s.trim())
		.filter(Boolean);

	const defaults = [
		BETTER_AUTH_URL,
		PUBLIC_APP_URL,
		'http://localhost:5173',
		'http://127.0.0.1:5173',
		'http://localhost:3000',
		'http://127.0.0.1:3000'
	];

	return Array.from(new Set([...defaults, ...customOrigins]));
}
