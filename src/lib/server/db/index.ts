import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@localhost:5555/rosterly';
const client = postgres(dbUrl, { max: 10 });

export const db = drizzle(client, { schema });
