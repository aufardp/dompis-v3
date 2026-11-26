import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import * as schema from './schema';

type AuditWriter = Pick<BunSQLDatabase<typeof schema>, 'insert'>;

/**
 * Appends one audit event using the caller's database handle. Pass a transaction
 * handle when the event must commit atomically with the state change. Metadata
 * is limited to scalar values; callers must omit credentials, raw payloads, and
 * personal data unless a separately approved audit contract requires them.
 */
export interface AuditEventInput {
	readonly actorId: string | null;
	readonly action: string;
	readonly targetId: string | null;
	readonly requestId: string;
	readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export async function appendAuditEvent(database: AuditWriter, event: AuditEventInput): Promise<void> {
	await database.insert(schema.auditEvents).values({
		actorId: event.actorId,
		action: event.action,
		targetId: event.targetId,
		requestId: event.requestId,
		metadata: { ...event.metadata }
	});
}
