import { and, eq, gt, isNull } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import * as schema from './schema';

type AuthDatabase = Pick<BunSQLDatabase<typeof schema>, 'select' | 'insert' | 'update'>;

export async function findActiveLoginIdentity(database: AuthDatabase, username: string) {
	const [identity] = await database
		.select({
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName,
			passwordHash: schema.users.passwordHash
		})
		.from(schema.users)
		.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
		.where(and(
			eq(schema.users.username, username),
			eq(schema.users.active, true),
			eq(schema.roles.active, true)
		))
		.limit(1);
	return identity;
}

export async function createSession(
	database: AuthDatabase,
	userId: string,
	tokenHash: Uint8Array,
	expiresAt: Date
): Promise<void> {
	await database.insert(schema.sessions).values({ userId, tokenHash, expiresAt });
}

export async function revokeSession(database: AuthDatabase, tokenHash: Uint8Array, now = new Date()): Promise<void> {
	await database.update(schema.sessions)
		.set({ revokedAt: now })
		.where(and(
			eq(schema.sessions.tokenHash, tokenHash),
			isNull(schema.sessions.revokedAt),
			gt(schema.sessions.expiresAt, now)
		));
}
