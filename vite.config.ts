import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

// @ts-expect-error Node built-in module
import { fileURLToPath } from 'node:url';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			'@rosterly/payroll-engine': fileURLToPath(
				new URL('./packages/payroll-engine/src/index.ts', import.meta.url)
			)
		}
	},
	server: {
		port: 3000
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'packages/**/*.{test,spec}.{js,ts}']
	}
});
