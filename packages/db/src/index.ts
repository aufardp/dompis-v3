import { SQL } from 'bun';
import { drizzle, type BunSQLDatabase } from 'drizzle-orm/bun-sql';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

const connectionString = Bun.env.DATABASE_URL;
const client = connectionString
	? new SQL({ url: connectionString, max: 4, connectionTimeout: 5 })
	: undefined;

export const database: BunSQLDatabase<typeof schema> | undefined = client
	? drizzle({ client, schema })
	: undefined;

export async function pingDatabase(db: BunSQLDatabase<typeof schema>): Promise<void> {
	await db.execute(sql`SELECT 1`);
}

export async function closeDatabase(): Promise<void> {
	if (client) await client.close();
}

export { loadAuthorizationContext, ticketAccessPredicate } from './authorization';
export { createSession, findActiveLoginIdentity, revokeSession } from './authentication';
export { schema };
