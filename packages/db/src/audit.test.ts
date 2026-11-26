import { expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import { appendAuditEvent } from './audit';
import { closeDatabase, database, schema } from './index';

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error('audit_test_database_url_missing');
const databaseAddress = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '::1'].includes(databaseAddress.hostname) || databaseAddress.pathname !== '/dompis_v3') {
	throw new Error('audit_test_database_target_rejected');
}
if (!database) throw new Error('audit_test_database_not_configured');
const db = database;

class RollbackFixture extends Error {}

test('appends a minimal audit event through the supplied transaction', async () => {
	const requestId = `audit-test:${crypto.randomUUID()}`;
	try {
		await db.transaction(async (tx) => {
			await appendAuditEvent(tx, {
				actorId: null,
				action: 'test.audit_append',
				targetId: null,
				requestId,
				metadata: { roleCode: 'synthetic-role', bootstrap: true, optional: null }
			});

			const [event] = await tx.select({
				actorId: schema.auditEvents.actorId,
				action: schema.auditEvents.action,
				targetId: schema.auditEvents.targetId,
				requestId: schema.auditEvents.requestId,
				metadata: schema.auditEvents.metadata
			})
				.from(schema.auditEvents)
				.where(eq(schema.auditEvents.requestId, requestId))
				.limit(1);

			expect(event).toEqual({
				actorId: null,
				action: 'test.audit_append',
				targetId: null,
				requestId,
				metadata: { roleCode: 'synthetic-role', bootstrap: true, optional: null }
			});
			throw new RollbackFixture('rollback_synthetic_audit_event');
		});
	} catch (error: unknown) {
		if (!(error instanceof RollbackFixture)) throw error;
	} finally {
		const [persisted] = await db.select({ id: schema.auditEvents.id })
			.from(schema.auditEvents)
			.where(eq(schema.auditEvents.requestId, requestId))
			.limit(1);
		expect(persisted).toBeUndefined();
		await closeDatabase();
	}
});
