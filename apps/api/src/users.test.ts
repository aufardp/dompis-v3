import { expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { closeDatabase, createSession, database, schema } from '@dompis/db';
import { hashSessionToken } from './auth';
import { createUserRoutes } from './users';

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error('user_test_database_url_missing');
const databaseAddress = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '::1'].includes(databaseAddress.hostname) || databaseAddress.pathname !== '/dompis_v3') {
	throw new Error('user_test_database_target_rejected');
}
if (!database) throw new Error('user_test_database_not_configured');
const db = database;
const appOrigin = 'https://dompis.example.test';
const csrfToken = randomBytes(32).toString('base64url');

class RollbackFixture extends Error {}

function firstInserted<T>(rows: readonly T[], label: string): T {
	const row = rows[0];
	if (!row) throw new Error(`synthetic_${label}_insert_missing`);
	return row;
}

test('superadmin user create, scope replacement and deactivation are audited and revoke sessions', async () => {
	try {
		await db.transaction(async (tx) => {
			const [superadminRole] = await tx.select({ id: schema.roles.id }).from(schema.roles)
				.where(eq(schema.roles.code, 'superadmin')).limit(1);
			const [officerRole] = await tx.select({ id: schema.roles.id }).from(schema.roles)
				.where(eq(schema.roles.code, 'officer')).limit(1);
			if (!superadminRole || !officerRole) throw new Error('user_test_roles_not_seeded');

			const actorPassword = 'synthetic-admin-password-42';
			const actor = firstInserted(await tx.insert(schema.users).values({
				username: `user-admin-${crypto.randomUUID().replaceAll('-', '').slice(0, 20)}`,
				displayName: 'Synthetic User Administrator',
				passwordHash: await Bun.password.hash(actorPassword, { algorithm: 'argon2id' }),
				roleId: superadminRole.id,
				globalScope: true
			}).returning({ id: schema.users.id }), 'admin');
			const actorToken = randomBytes(32).toString('base64url');
			await createSession(tx, actor.id, hashSessionToken(actorToken), new Date(Date.now() + 60 * 60 * 1000));

			const area = firstInserted(await tx.insert(schema.areas).values({
				code: `ADMIN-AREA-${crypto.randomUUID().slice(0, 8)}`, name: 'Synthetic admin area'
			}).returning({ id: schema.areas.id }), 'area');
			const region = firstInserted(await tx.insert(schema.regions).values({
				areaId: area.id, code: `REG-${crypto.randomUUID().slice(0, 8)}`, name: 'Synthetic admin region'
			}).returning({ id: schema.regions.id }), 'region');
			const branch = firstInserted(await tx.insert(schema.branches).values({
				regionId: region.id, code: `BR-${crypto.randomUUID().slice(0, 8)}`, name: 'Synthetic admin branch'
			}).returning({ id: schema.branches.id }), 'branch');
			const serviceArea = firstInserted(await tx.insert(schema.serviceAreas).values({
				branchId: branch.id, code: `SA-${crypto.randomUUID().slice(0, 8)}`, name: 'Synthetic admin service area'
			}).returning({ id: schema.serviceAreas.id }), 'service_area');
			const workzone = firstInserted(await tx.insert(schema.workzones).values({
				serviceAreaId: serviceArea.id, code: `WZ-${crypto.randomUUID().slice(0, 8)}`, name: 'Synthetic admin workzone'
			}).returning({ id: schema.workzones.id }), 'workzone');

			const app = createUserRoutes(tx, appOrigin);
			const authHeaders = {
				cookie: `__Host-dompis_session=${actorToken}; __Host-dompis_csrf=${csrfToken}`,
				origin: appOrigin,
				'x-csrf-token': csrfToken
			};
			const list = await app.handle(new Request('http://localhost/api/admin/users?limit=1', {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(list.status).toBe(200);
			expect((await list.json() as { users: unknown[] }).users.length).toBe(1);

			const username = `synthetic_user_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
			const create = await app.handle(new Request('http://localhost/api/admin/users', {
				method: 'POST',
				headers: { ...authHeaders, 'content-type': 'application/json' },
				body: JSON.stringify({
					username, displayName: 'Synthetic Scoped User', roleCode: 'officer', password: 'synthetic-user-password-42',
					passwordConfirm: 'synthetic-user-password-42', globalScope: false, scopes: [{ level: 'area', targetId: area.id }]
				})
			}));
			expect(create.status).toBe(201);
			const { id: userId } = await create.json() as { id: string };

			const detail = await app.handle(new Request(`http://localhost/api/admin/users/${userId}`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(detail.status).toBe(200);
			const detailBody = await detail.json() as { username: string; scopes: Array<{ areaId: string | null }> };
			expect(detailBody.username).toBe(username);
			expect(detailBody.scopes).toHaveLength(1);
			expect(detailBody.scopes[0]?.areaId).toBe(area.id);

			const targetToken = randomBytes(32).toString('base64url');
			await createSession(tx, userId, hashSessionToken(targetToken), new Date(Date.now() + 60 * 60 * 1000));
			const replaceScopes = await app.handle(new Request(`http://localhost/api/admin/users/${userId}/scopes`, {
				method: 'PUT',
				headers: { ...authHeaders, 'content-type': 'application/json' },
				body: JSON.stringify({ globalScope: false, currentPassword: actorPassword, scopes: [{ level: 'workzone', targetId: workzone.id }] })
			}));
			expect(replaceScopes.status).toBe(200);
			expect(await replaceScopes.json()).toEqual({ status: 'updated' });
			const [updatedUser] = await tx.select({ scopeVersion: schema.users.scopeVersion }).from(schema.users)
				.where(eq(schema.users.id, userId)).limit(1);
			expect(updatedUser?.scopeVersion).toBe(2);
			const [revokedSession] = await tx.select({ revokedAt: schema.sessions.revokedAt }).from(schema.sessions)
				.where(eq(schema.sessions.tokenHash, hashSessionToken(targetToken))).limit(1);
			expect(revokedSession?.revokedAt).toBeInstanceOf(Date);

			const deactivate = await app.handle(new Request(`http://localhost/api/admin/users/${userId}`, {
				method: 'DELETE', headers: authHeaders
			}));
			expect(deactivate.status).toBe(200);
			const [deactivatedUser] = await tx.select({ active: schema.users.active }).from(schema.users)
				.where(eq(schema.users.id, userId)).limit(1);
			expect(deactivatedUser?.active).toBe(false);
			const auditActions = await tx.select({ action: schema.auditEvents.action }).from(schema.auditEvents)
				.where(eq(schema.auditEvents.targetId, userId)).orderBy(schema.auditEvents.createdAt);
			expect(auditActions.map((event) => event.action)).toEqual([
				'user.created', 'user.scope_updated', 'user.deactivated'
			]);

			const selfDeactivation = await app.handle(new Request(`http://localhost/api/admin/users/${actor.id}`, {
				method: 'DELETE', headers: authHeaders
			}));
			expect(selfDeactivation.status).toBe(409);

			throw new RollbackFixture('rollback_synthetic_user_management_fixtures');
		});
	} catch (error: unknown) {
		if (!(error instanceof RollbackFixture)) throw error;
	} finally {
		await closeDatabase();
	}
});
