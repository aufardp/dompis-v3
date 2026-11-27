import { expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { closeDatabase, createSession, database, schema } from '@dompis/db';
import { hashSessionToken } from './auth';
import { createOrganizationImpactRoutes } from './organization-impact';

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error('organization_impact_test_database_url_missing');
const databaseAddress = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '::1'].includes(databaseAddress.hostname) || databaseAddress.pathname !== '/dompis_v3') {
	throw new Error('organization_impact_test_database_target_rejected');
}
if (!database) throw new Error('organization_impact_test_database_not_configured');
const db = database;

class RollbackFixture extends Error {}

function firstInserted<T>(rows: readonly T[], label: string): T {
	const row = rows[0];
	if (!row) throw new Error(`synthetic_${label}_insert_missing`);
	return row;
}

test('child impact preview deduplicates inherited scope users and denies roles without permission', async () => {
	try {
		await db.transaction(async (tx) => {
			const [superadminRole] = await tx.select({ id: schema.roles.id }).from(schema.roles)
				.where(eq(schema.roles.code, 'superadmin')).limit(1);
			const [officerRole] = await tx.select({ id: schema.roles.id }).from(schema.roles)
				.where(eq(schema.roles.code, 'officer')).limit(1);
			if (!superadminRole || !officerRole) throw new Error('organization_impact_test_roles_not_seeded');
			const grants = await tx.select({ code: schema.permissions.code }).from(schema.rolePermissions)
				.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
				.where(and(eq(schema.rolePermissions.roleId, superadminRole.id), eq(schema.permissions.code, 'organization.manage')));
			if (grants.length !== 1) throw new Error('organization_manage_grant_missing');

			const [baseline] = await tx.select({ globalUsers: sql<number>`count(*)::int` }).from(schema.users)
				.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(and(eq(schema.users.active, true), eq(schema.roles.active, true), eq(schema.users.globalScope, true)));

			const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
			const actor = firstInserted(await tx.insert(schema.users).values({
				username: `impact_admin_${suffix}`, displayName: 'Synthetic Impact Administrator',
				passwordHash: 'synthetic-not-used-for-login', roleId: superadminRole.id, globalScope: true
			}).returning({ id: schema.users.id }), 'admin');
			const scopedUser = firstInserted(await tx.insert(schema.users).values({
				username: `impact_user_${suffix}`, displayName: 'Synthetic Scoped User',
				passwordHash: 'synthetic-not-used-for-login', roleId: officerRole.id
			}).returning({ id: schema.users.id }), 'scoped_user');
			const deniedUser = firstInserted(await tx.insert(schema.users).values({
				username: `impact_denied_${suffix}`, displayName: 'Synthetic User Without Organization Permission',
				passwordHash: 'synthetic-not-used-for-login', roleId: officerRole.id
			}).returning({ id: schema.users.id }), 'denied_user');
			const actorToken = randomBytes(32).toString('base64url');
			const deniedToken = randomBytes(32).toString('base64url');
			await createSession(tx, actor.id, hashSessionToken(actorToken), new Date(Date.now() + 60 * 60 * 1000));
			await createSession(tx, deniedUser.id, hashSessionToken(deniedToken), new Date(Date.now() + 60 * 60 * 1000));

			const area = firstInserted(await tx.insert(schema.areas).values({
				code: `IMPACT-${suffix}`, name: 'Synthetic Impact Area'
			}).returning({ id: schema.areas.id, code: schema.areas.code }), 'area');
			const otherArea = firstInserted(await tx.insert(schema.areas).values({
				code: `IMPACT-OTHER-${suffix}`, name: 'Synthetic Other Area'
			}).returning({ id: schema.areas.id }), 'other_area');
			const region = firstInserted(await tx.insert(schema.regions).values({
				areaId: area.id, code: `REG-${suffix}`, name: 'Synthetic Impact Region'
			}).returning({ id: schema.regions.id, code: schema.regions.code }), 'region');
			await tx.insert(schema.userScopes).values([
				{ userId: scopedUser.id, areaId: area.id },
				{ userId: scopedUser.id, regionId: region.id },
				{ userId: deniedUser.id, areaId: otherArea.id }
			]);

			const app = createOrganizationImpactRoutes(tx);
			const preview = await app.handle(new Request(`http://localhost/api/admin/organization/child-impact?level=branch&parentId=${region.id}&limit=1`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(preview.status).toBe(200);
			const page = await preview.json() as {
				childLevel: string; parent: { id: string; level: string; code: string; name: string };
				summary: { total: number; global: number; inheritedScope: number };
				users: Array<{ id: string; accessMode: string; scopeLevels: string[] }>;
				nextCursor: string | null;
			};
			expect(page.childLevel).toBe('branch');
			expect(page.parent).toEqual({ id: region.id, level: 'region', code: region.code, name: 'Synthetic Impact Region' });
			expect(page.summary).toEqual({ total: Number(baseline?.globalUsers ?? 0) + 2, global: Number(baseline?.globalUsers ?? 0) + 1, inheritedScope: 1 });
			expect(page.users).toHaveLength(1);
			expect(page.nextCursor).not.toBeNull();

			const nextPage = await app.handle(new Request(`http://localhost/api/admin/organization/child-impact?level=branch&parentId=${region.id}&limit=1&after=${actor.id}`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(nextPage.status).toBe(200);
			const next = await nextPage.json() as { users: Array<{ id: string; accessMode: string; scopeLevels: string[] }>; nextCursor: string | null };
			expect(next.users).toHaveLength(1);
			const scopedResult = [...page.users, ...next.users].find((user) => user.id === scopedUser.id);
			expect(scopedResult?.accessMode).toBe('inherited_scope');
			expect(scopedResult?.scopeLevels).toEqual(['area', 'region']);
			expect(next.nextCursor).toBeNull();

			const newAreaPreview = await app.handle(new Request('http://localhost/api/admin/organization/child-impact?level=area', {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(newAreaPreview.status).toBe(200);
			const newArea = await newAreaPreview.json() as { parent: unknown; summary: { total: number; global: number; inheritedScope: number } };
			expect(newArea.parent).toBeNull();
			expect(newArea.summary).toEqual({ total: Number(baseline?.globalUsers ?? 0) + 1, global: Number(baseline?.globalUsers ?? 0) + 1, inheritedScope: 0 });

			const denied = await app.handle(new Request(`http://localhost/api/admin/organization/child-impact?level=branch&parentId=${region.id}`, {
				headers: { cookie: `__Host-dompis_session=${deniedToken}` }
			}));
			expect(denied.status).toBe(403);

			throw new RollbackFixture('rollback_synthetic_organization_impact_fixtures');
		});
	} catch (error: unknown) {
		if (!(error instanceof RollbackFixture)) throw error;
	} finally {
		await closeDatabase();
	}
});
