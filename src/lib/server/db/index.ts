import 'dotenv/config';
import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const dbUrl =
	env.DATABASE_URL ||
	process.env.DATABASE_URL ||
	'postgres://postgres:postgrespassword@172.31.36.217:5555/rosterly';

const client = postgres(dbUrl, { max: 10 });

export const db = drizzle(client, { schema });
