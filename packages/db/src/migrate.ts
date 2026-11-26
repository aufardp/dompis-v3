import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import { migrate } from 'drizzle-orm/bun-sql/migrator';
import { fileURLToPath } from 'node:url';
import * as schema from './schema';

const connectionString = Bun.env.MIGRATION_DATABASE_URL ?? Bun.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('database_url_missing');
}

const client = new SQL({ url: connectionString, max: 1, connectionTimeout: 5 });

try {
	const database = drizzle({ client, schema });
	const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));
	await migrate(database, { migrationsFolder });
} finally {
	await client.close();
}
