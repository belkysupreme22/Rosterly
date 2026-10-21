import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const dbUrl =
	process.env.DATABASE_URL ||
	'postgres://postgres:postgrespassword@localhost:5555/rosterly';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: dbUrl
	},
	verbose: true,
	strict: true
});
