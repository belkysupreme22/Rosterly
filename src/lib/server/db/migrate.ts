declare const process: any;

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const dbUrl =
	process.env.DATABASE_URL ||
	'postgres://postgres:postgrespassword@localhost:5555/rosterly';

const sql = postgres(dbUrl, { max: 1 });
const db = drizzle(sql);

async function main() {
	console.log('Running migrations...');
	await migrate(db, { migrationsFolder: './drizzle' });
	console.log('Migrations complete!');
	await sql.end();
}

main().catch((err) => {
	console.error('Migration failed:', err);
	process.exit(1);
});
