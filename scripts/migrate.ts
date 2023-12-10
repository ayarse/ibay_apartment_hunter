#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { env } from '../src/config';

const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await migrate(drizzle(migrationClient), {
  migrationsFolder: path.join(__dirname, '../src/db/migrations/'),
});

await migrationClient.end();
