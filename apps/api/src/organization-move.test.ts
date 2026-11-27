import { expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { closeDatabase, createSession, database, schema } from '@dompis/db';
import { hashSessionToken } from './auth';
import { createOrganizationMoveRoutes } from './organization-move';

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error('organization_move_test_database_url_missing');
const databaseAddress = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '::1'].includes(databaseAddress.hostname) || databaseAddress.pathname !== '/dompis_v3') {
	throw new Error('organization_move_test_database_target_rejected');
}
if (!database) throw new Error('organization_move_test_database_not_configured');
const db = database;
class RollbackFixture extends Error {}

test('hierarchy move previews access changes and atomically invalidates affected users', async () => {
	try {
		await db.transaction(async (tx) => {
			const [superadminRole] = await tx.select({ id: schema.roles.id }).from(schema.roles).where(eq(schema.roles.code, 'superadmin')).limit(1);
			const [officerRole] = await tx.select({ id: schema.roles.id }).from(schema.roles).where(eq(schema.roles.code, 'officer')).limit(1);
			if (!superadminRole || !officerRole) throw new Error('organization_move_test_roles_not_seeded');
			const grants = await tx.select({ code: schema.permissions.code }).from(schema.rolePermissions)
				.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
				.where(and(eq(schema.rolePermissions.roleId, superadminRole.id), eq(schema.permissions.code, 'organization.manage')));
			if (!grants.length) throw new Error('organization_manage_grant_missing');
			const [baseline] = await tx.select({ globalUsers: sql<number>`count(*)::int` })
				.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(and(eq(schema.users.active, true), eq(schema.roles.active, true), eq(schema.users.globalScope, true)));
			const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
			const actorPassword = `Move-test-${suffix}-password`;
			const [actor] = await tx.insert(schema.users).values({ username: `move_admin_${suffix}`, displayName: 'Synthetic Move Admin',
				passwordHash: await Bun.password.hash(actorPassword), roleId: superadminRole.id, globalScope: true }).returning({ id: schema.users.id });
			const [oldAreaUser] = await tx.insert(schema.users).values({ username: `move_old_${suffix}`, displayName: 'Synthetic Old Scope',
				passwordHash: 'synthetic-not-used', roleId: officerRole.id }).returning({ id: schema.users.id });
			const [newAreaUser] = await tx.insert(schema.users).values({ username: `move_new_${suffix}`, displayName: 'Synthetic New Scope',
				passwordHash: 'synthetic-not-used', roleId: officerRole.id }).returning({ id: schema.users.id });
			const [nodeUser] = await tx.insert(schema.users).values({ username: `move_node_${suffix}`, displayName: 'Synthetic Node Scope',
				passwordHash: 'synthetic-not-used', roleId: officerRole.id }).returning({ id: schema.users.id });
			if (!actor || !oldAreaUser || !newAreaUser || !nodeUser) throw new Error('move_test_users_missing');
			const actorToken = randomBytes(32).toString('base64url');
			const scopeToken = randomBytes(32).toString('base64url');
			const csrfToken = randomBytes(32).toString('base64url');
			await createSession(tx, actor.id, hashSessionToken(actorToken), new Date(Date.now() + 60 * 60_000));
			await createSession(tx, oldAreaUser.id, hashSessionToken(scopeToken), new Date(Date.now() + 60 * 60_000));
			const oldArea = (await tx.insert(schema.areas).values({ code: `MOVE-A-${suffix}`, name: 'Synthetic Old Area' }).returning({ id: schema.areas.id }))[0];
			const newArea = (await tx.insert(schema.areas).values({ code: `MOVE-B-${suffix}`, name: 'Synthetic New Area' }).returning({ id: schema.areas.id }))[0];
			if (!oldArea || !newArea) throw new Error('move_test_area_missing');
			const region = (await tx.insert(schema.regions).values({ areaId: oldArea.id, code: `MOVE-R-${suffix}`, name: 'Synthetic Moving Region' }).returning({ id: schema.regions.id }))[0];
			if (!region) throw new Error('move_test_region_missing');
			await tx.insert(schema.userScopes).values([
				{ userId: oldAreaUser.id, areaId: oldArea.id },
				{ userId: newAreaUser.id, areaId: newArea.id },
				{ userId: nodeUser.id, regionId: region.id }
			]);
			const app = createOrganizationMoveRoutes(tx, 'http://localhost:5173');
			const nodeOptions = await app.handle(new Request(`http://localhost/api/admin/organization/nodes?level=region&search=MOVE-R-${suffix}`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(nodeOptions.status).toBe(200);
			const nodeOptionBody = await nodeOptions.json() as { nodes: Array<{ id: string; code: string; name: string; parentId: string | null }> };
			expect(nodeOptionBody.nodes).toEqual([{ id: region.id, code: `MOVE-R-${suffix}`, name: 'Synthetic Moving Region', parentId: oldArea.id }]);
			const preview = await app.handle(new Request(`http://localhost/api/admin/organization/move-impact?level=region&id=${region.id}&newParentId=${newArea.id}`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(preview.status).toBe(200);
			const previewBody = await preview.json() as { oldParentId: string; newParentId: string; summary: { affectedUsers: number }; previewToken: string };
			expect(previewBody.oldParentId).toBe(oldArea.id);
			expect(previewBody.newParentId).toBe(newArea.id);
			expect(previewBody.summary.affectedUsers).toBe(Number(baseline?.globalUsers ?? 0) + 4);
			const headers = { 'content-type': 'application/json', origin: 'http://localhost:5173', 'x-csrf-token': csrfToken,
				'x-request-id': crypto.randomUUID(), cookie: `__Host-dompis_session=${actorToken}; __Host-dompis_csrf=${csrfToken}` };
			const [lateUser] = await tx.insert(schema.users).values({ username: `move_late_${suffix}`, displayName: 'Synthetic Newly Affected User',
				passwordHash: 'synthetic-not-used', roleId: officerRole.id }).returning({ id: schema.users.id });
			if (!lateUser) throw new Error('move_test_late_user_missing');
			await tx.insert(schema.userScopes).values({ userId: lateUser.id, areaId: oldArea.id });
			const stale = await app.handle(new Request('http://localhost/api/admin/organization/move', { method: 'PATCH', headers,
				body: JSON.stringify({ level: 'region', id: region.id, newParentId: newArea.id, previewToken: previewBody.previewToken, currentPassword: actorPassword }) }));
			expect(stale.status).toBe(409);
			const freshPreview = await app.handle(new Request(`http://localhost/api/admin/organization/move-impact?level=region&id=${region.id}&newParentId=${newArea.id}`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			const fresh = await freshPreview.json() as { previewToken: string; summary: { affectedUsers: number } };
			expect(fresh.summary.affectedUsers).toBe(Number(baseline?.globalUsers ?? 0) + 5);
			const moved = await app.handle(new Request('http://localhost/api/admin/organization/move', { method: 'PATCH', headers,
				body: JSON.stringify({ level: 'region', id: region.id, newParentId: newArea.id, previewToken: fresh.previewToken, currentPassword: actorPassword }) }));
			expect(moved.status).toBe(200);
			const movedBody = await moved.json() as { status: string; affectedUsers: number };
			expect(movedBody.status).toBe('moved');
			expect(movedBody.affectedUsers).toBe(fresh.summary.affectedUsers);
			const [movedRegion] = await tx.select({ areaId: schema.regions.areaId }).from(schema.regions).where(eq(schema.regions.id, region.id)).limit(1);
			expect(movedRegion?.areaId).toBe(newArea.id);
			const [bumped] = await tx.select({ scopeVersion: schema.users.scopeVersion }).from(schema.users).where(eq(schema.users.id, nodeUser.id)).limit(1);
			expect(bumped?.scopeVersion).toBe(2);
			const [revoked] = await tx.select({ revokedAt: schema.sessions.revokedAt }).from(schema.sessions)
				.where(eq(schema.sessions.tokenHash, hashSessionToken(scopeToken))).limit(1);
			expect(revoked?.revokedAt).toBeInstanceOf(Date);
			const audit = await tx.select({ action: schema.auditEvents.action }).from(schema.auditEvents).where(eq(schema.auditEvents.targetId, region.id));
			expect(audit.map((row) => row.action)).toEqual(['organization.node_moved']);
			throw new RollbackFixture('rollback_synthetic_organization_move_fixtures');
		});
	} catch (error: unknown) { if (!(error instanceof RollbackFixture)) throw error; }
	finally { await closeDatabase(); }
});
