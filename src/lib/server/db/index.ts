import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { DATABASE_URL } from '$lib/server/env';

const client = postgres(DATABASE_URL, { max: 10 });

export const db = drizzle(client, { schema });
