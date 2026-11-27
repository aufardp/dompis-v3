import { expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { closeDatabase, createSession, database, schema } from '@dompis/db';
import { hashSessionToken } from './auth';
import { createAuditRoutes } from './audit';

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error('audit_test_database_url_missing');
const databaseAddress = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '::1'].includes(databaseAddress.hostname) || databaseAddress.pathname !== '/dompis_v3') {
	throw new Error('audit_test_database_target_rejected');
}
if (!database) throw new Error('audit_test_database_not_configured');
const databaseConnection = database;
class RollbackOnlyTestTransactionSignal extends Error {}

test('audit reader is superadmin-only, bounded, keyset-paginated, and omits metadata', async () => {
	try {
		await databaseConnection.transaction(async (databaseTransaction) => {
			const [superadminRole] = await databaseTransaction.select({ id: schema.roles.id }).from(schema.roles)
				.where(eq(schema.roles.code, 'superadmin')).limit(1);
			const [officerRole] = await databaseTransaction.select({ id: schema.roles.id }).from(schema.roles)
				.where(eq(schema.roles.code, 'officer')).limit(1);
			if (!superadminRole || !officerRole) throw new Error('audit_test_roles_not_seeded');
			const grant = await databaseTransaction.select({ code: schema.permissions.code }).from(schema.rolePermissions)
				.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
				.where(and(eq(schema.rolePermissions.roleId, superadminRole.id), eq(schema.permissions.code, 'audit.read'))).limit(1);
			if (!grant.length) throw new Error('audit_read_grant_missing');

			const syntheticIdentifierSuffix = crypto.randomUUID().replaceAll('-', '').slice(0, 18);
			const [admin] = await databaseTransaction.insert(schema.users).values({ username: `audit_admin_${syntheticIdentifierSuffix}`, displayName: 'Synthetic Audit Admin',
				passwordHash: 'synthetic-not-used', roleId: superadminRole.id, globalScope: true }).returning({ id: schema.users.id });
			const [officer] = await databaseTransaction.insert(schema.users).values({ username: `audit_officer_${syntheticIdentifierSuffix}`, displayName: 'Synthetic Audit Officer',
				passwordHash: 'synthetic-not-used', roleId: officerRole.id }).returning({ id: schema.users.id });
			if (!admin || !officer) throw new Error('audit_test_users_missing');
			const adminToken = randomBytes(32).toString('base64url');
			const officerToken = randomBytes(32).toString('base64url');
			await createSession(databaseTransaction, admin.id, hashSessionToken(adminToken), new Date(Date.now() + 60 * 60_000));
			await createSession(databaseTransaction, officer.id, hashSessionToken(officerToken), new Date(Date.now() + 60 * 60_000));
			const requestIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
			for (const [index, requestId] of requestIds.entries()) {
				await databaseTransaction.insert(schema.auditEvents).values({ actorId: admin.id, action: `test.audit_${index}`, targetId: null,
					requestId, metadata: { secretSentinel: 'must_not_be_returned' } });
			}

			const testApplication = createAuditRoutes(databaseTransaction);
			const first = await testApplication.handle(new Request('http://localhost/api/admin/audit-events?limit=2', {
				headers: { cookie: `__Host-dompis_session=${adminToken}` }
			}));
			expect(first.status).toBe(200);
			const firstBody = await first.json() as { events: Array<{ id: string; action: string; requestId: string }>; nextCursor: string | null };
			expect(firstBody.events).toHaveLength(2);
			expect(firstBody.nextCursor).not.toBeNull();
			expect(JSON.stringify(firstBody)).not.toContain('must_not_be_returned');
			expect(Object.keys(firstBody.events[0] ?? {}).sort()).toEqual(['action', 'actorId', 'createdAt', 'id', 'requestId', 'targetId']);

			const second = await testApplication.handle(new Request(`http://localhost/api/admin/audit-events?limit=2&after=${encodeURIComponent(firstBody.nextCursor ?? '')}`, {
				headers: { cookie: `__Host-dompis_session=${adminToken}` }
			}));
			expect(second.status).toBe(200);
			const secondBody = await second.json() as { events: Array<{ id: string }>; nextCursor: string | null };
			expect(secondBody.events).toHaveLength(1);
			expect(secondBody.nextCursor).toBeNull();
			expect(new Set([...firstBody.events, ...secondBody.events].map((event) => event.id)).size).toBe(3);

			const forgedCursor = await testApplication.handle(new Request('http://localhost/api/admin/audit-events?after=not-a-valid-signed-cursor-value', {
				headers: { cookie: `__Host-dompis_session=${adminToken}` }
			}));
			expect(forgedCursor.status).toBe(400);
			const denied = await testApplication.handle(new Request('http://localhost/api/admin/audit-events', {
				headers: { cookie: `__Host-dompis_session=${officerToken}` }
			}));
			expect(denied.status).toBe(403);
			throw new RollbackOnlyTestTransactionSignal('rollback_synthetic_audit_reader_fixtures');
		});
	} catch (error: unknown) {
		if (!(error instanceof RollbackOnlyTestTransactionSignal)) throw error;
	} finally { await closeDatabase(); }
});
