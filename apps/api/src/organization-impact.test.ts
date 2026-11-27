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
const databaseConnection = database;

class RollbackOnlyTestTransactionSignal extends Error {}

function requireFirstInsertedRecord<T>(rows: readonly T[], label: string): T {
	const row = rows[0];
	if (!row) throw new Error(`synthetic_${label}_insert_missing`);
	return row;
}

test('child impact preview deduplicates inherited scope users and denies roles without permission', async () => {
	try {
		await databaseConnection.transaction(async (databaseTransaction) => {
			const [superadminRole] = await databaseTransaction.select({ id: schema.roles.id }).from(schema.roles)
				.where(eq(schema.roles.code, 'superadmin')).limit(1);
			const [officerRole] = await databaseTransaction.select({ id: schema.roles.id }).from(schema.roles)
				.where(eq(schema.roles.code, 'officer')).limit(1);
			if (!superadminRole || !officerRole) throw new Error('organization_impact_test_roles_not_seeded');
			const superadminPermissionGrants = await databaseTransaction.select({ code: schema.permissions.code }).from(schema.rolePermissions)
				.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
				.where(and(eq(schema.rolePermissions.roleId, superadminRole.id), eq(schema.permissions.code, 'organization.manage')));
			if (superadminPermissionGrants.length !== 1) throw new Error('organization_manage_grant_missing');

			const [baseline] = await databaseTransaction.select({ globalUsers: sql<number>`count(*)::int` }).from(schema.users)
				.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(and(eq(schema.users.active, true), eq(schema.roles.active, true), eq(schema.users.globalScope, true)));

			const syntheticIdentifierSuffix = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
			const actorPassword = `Impact-test-${syntheticIdentifierSuffix}-password`;
			const syntheticSuperadminUser = requireFirstInsertedRecord(await databaseTransaction.insert(schema.users).values({
				username: `impact_admin_${syntheticIdentifierSuffix}`, displayName: 'Synthetic Impact Administrator',
				passwordHash: await Bun.password.hash(actorPassword), roleId: superadminRole.id, globalScope: true
			}).returning({ id: schema.users.id }), 'admin');
			const scopedUser = requireFirstInsertedRecord(await databaseTransaction.insert(schema.users).values({
				username: `impact_user_${syntheticIdentifierSuffix}`, displayName: 'Synthetic Scoped User',
				passwordHash: 'synthetic-not-used-for-login', roleId: officerRole.id
			}).returning({ id: schema.users.id }), 'scoped_user');
			const deniedUser = requireFirstInsertedRecord(await databaseTransaction.insert(schema.users).values({
				username: `impact_denied_${syntheticIdentifierSuffix}`, displayName: 'Synthetic User Without Organization Permission',
				passwordHash: 'synthetic-not-used-for-login', roleId: officerRole.id
			}).returning({ id: schema.users.id }), 'denied_user');
			const actorToken = randomBytes(32).toString('base64url');
			const scopedToken = randomBytes(32).toString('base64url');
			const deniedToken = randomBytes(32).toString('base64url');
			const csrfToken = randomBytes(32).toString('base64url');
			await createSession(databaseTransaction, syntheticSuperadminUser.id, hashSessionToken(actorToken), new Date(Date.now() + 60 * 60 * 1000));
			await createSession(databaseTransaction, scopedUser.id, hashSessionToken(scopedToken), new Date(Date.now() + 60 * 60 * 1000));
			await createSession(databaseTransaction, deniedUser.id, hashSessionToken(deniedToken), new Date(Date.now() + 60 * 60 * 1000));

			const area = requireFirstInsertedRecord(await databaseTransaction.insert(schema.areas).values({
				code: `IMPACT-${syntheticIdentifierSuffix}`, name: 'Synthetic Impact Area'
			}).returning({ id: schema.areas.id, code: schema.areas.code }), 'area');
			const otherArea = requireFirstInsertedRecord(await databaseTransaction.insert(schema.areas).values({
				code: `IMPACT-OTHER-${syntheticIdentifierSuffix}`, name: 'Synthetic Other Area'
			}).returning({ id: schema.areas.id }), 'other_area');
			const region = requireFirstInsertedRecord(await databaseTransaction.insert(schema.regions).values({
				areaId: area.id, code: `REG-${syntheticIdentifierSuffix}`, name: 'Synthetic Impact Region'
			}).returning({ id: schema.regions.id, code: schema.regions.code }), 'region');
			await databaseTransaction.insert(schema.userScopes).values([
				{ userId: scopedUser.id, areaId: area.id },
				{ userId: scopedUser.id, regionId: region.id },
				{ userId: deniedUser.id, areaId: otherArea.id }
			]);

			const testApplication = createOrganizationImpactRoutes(databaseTransaction, 'http://localhost:5173');
			const impactPreviewResponse = await testApplication.handle(new Request(`http://localhost/api/admin/organization/child-impact?level=branch&parentId=${region.id}&limit=1`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(impactPreviewResponse.status).toBe(200);
			const firstImpactPage = await impactPreviewResponse.json() as {
				childLevel: string; parent: { id: string; level: string; code: string; name: string };
				summary: { total: number; global: number; inheritedScope: number };
				users: Array<{ id: string; accessMode: string; scopeLevels: string[] }>;
				nextCursor: string | null; previewToken: string;
			};
			expect(firstImpactPage.childLevel).toBe('branch');
			expect(firstImpactPage.parent).toEqual({ id: region.id, level: 'region', code: region.code, name: 'Synthetic Impact Region' });
			expect(firstImpactPage.summary).toEqual({ total: Number(baseline?.globalUsers ?? 0) + 2, global: Number(baseline?.globalUsers ?? 0) + 1, inheritedScope: 1 });
			expect(firstImpactPage.users).toHaveLength(1);
			expect(firstImpactPage.nextCursor).not.toBeNull();
			const firstPreview = { previewToken: firstImpactPage.previewToken };

			const secondImpactPageResponse = await testApplication.handle(new Request(`http://localhost/api/admin/organization/child-impact?level=branch&parentId=${region.id}&limit=1&after=${syntheticSuperadminUser.id}`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(secondImpactPageResponse.status).toBe(200);
			const secondImpactPage = await secondImpactPageResponse.json() as { users: Array<{ id: string; accessMode: string; scopeLevels: string[] }>; nextCursor: string | null };
			expect(secondImpactPage.users).toHaveLength(1);
			const scopedResult = [...firstImpactPage.users, ...secondImpactPage.users].find((user) => user.id === scopedUser.id);
			expect(scopedResult?.accessMode).toBe('inherited_scope');
			expect(scopedResult?.scopeLevels).toEqual(['area', 'region']);
			expect(secondImpactPage.nextCursor).toBeNull();

			const newAreaPreview = await testApplication.handle(new Request('http://localhost/api/admin/organization/child-impact?level=area', {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			expect(newAreaPreview.status).toBe(200);
			const newArea = await newAreaPreview.json() as { parent: unknown; summary: { total: number; global: number; inheritedScope: number } };
			expect(newArea.parent).toBeNull();
			expect(newArea.summary).toEqual({ total: Number(baseline?.globalUsers ?? 0) + 1, global: Number(baseline?.globalUsers ?? 0) + 1, inheritedScope: 0 });

			await databaseTransaction.insert(schema.userScopes).values({ userId: deniedUser.id, regionId: region.id });
			const mutationHeaders = {
				'content-type': 'application/json', origin: 'http://localhost:5173', 'x-csrf-token': csrfToken,
				'x-request-id': crypto.randomUUID(), cookie: `__Host-dompis_session=${actorToken}; __Host-dompis_csrf=${csrfToken}`
			};
			const staleCreate = await testApplication.handle(new Request('http://localhost/api/admin/organization/children', {
				method: 'POST', headers: mutationHeaders,
				body: JSON.stringify({ level: 'branch', parentId: region.id, code: `BR-${syntheticIdentifierSuffix}`, name: 'Synthetic Branch',
					previewToken: firstPreview.previewToken, currentPassword: actorPassword })
			}));
			expect(staleCreate.status).toBe(409);
			expect(await staleCreate.json()).toEqual({ error: 'impact_changed_refresh_preview' });

			const currentPreview = await testApplication.handle(new Request(`http://localhost/api/admin/organization/child-impact?level=branch&parentId=${region.id}`, {
				headers: { cookie: `__Host-dompis_session=${actorToken}` }
			}));
			const currentPreviewBody = await currentPreview.json() as { previewToken: string; summary: { total: number } };
			const rejectedCsrf = await testApplication.handle(new Request('http://localhost/api/admin/organization/children', {
				method: 'POST', headers: { ...mutationHeaders, 'x-csrf-token': `${csrfToken.slice(1)}x` },
				body: JSON.stringify({ level: 'branch', parentId: region.id, code: `BR2-${syntheticIdentifierSuffix}`, name: 'Rejected Branch',
					previewToken: currentPreviewBody.previewToken, currentPassword: actorPassword })
			}));
			expect(rejectedCsrf.status).toBe(403);
			const denied = await testApplication.handle(new Request(`http://localhost/api/admin/organization/child-impact?level=branch&parentId=${region.id}`, {
				headers: { cookie: `__Host-dompis_session=${deniedToken}` }
			}));
			expect(denied.status).toBe(403);
			const created = await testApplication.handle(new Request('http://localhost/api/admin/organization/children', {
				method: 'POST', headers: mutationHeaders,
				body: JSON.stringify({ level: 'branch', parentId: region.id, code: `BR-${syntheticIdentifierSuffix}`, name: 'Synthetic Branch',
					previewToken: currentPreviewBody.previewToken, currentPassword: actorPassword })
			}));
			expect(created.status).toBe(201);
			const createdBody = await created.json() as { id: string; affectedUsers: number };
			expect(createdBody.affectedUsers).toBe(currentPreviewBody.summary.total);
			const [createdBranch] = await databaseTransaction.select({ code: schema.branches.code, regionId: schema.branches.regionId }).from(schema.branches)
				.where(eq(schema.branches.id, createdBody.id)).limit(1);
			expect(createdBranch).toEqual({ code: `BR-${syntheticIdentifierSuffix}`.toUpperCase(), regionId: region.id });
			const [updatedUser] = await databaseTransaction.select({ scopeVersion: schema.users.scopeVersion }).from(schema.users).where(eq(schema.users.id, scopedUser.id)).limit(1);
			expect(updatedUser?.scopeVersion).toBe(2);
			const [revokedSession] = await databaseTransaction.select({ revokedAt: schema.sessions.revokedAt }).from(schema.sessions)
				.where(eq(schema.sessions.tokenHash, hashSessionToken(scopedToken))).limit(1);
			expect(revokedSession?.revokedAt).toBeInstanceOf(Date);
			const persistedAuditEvents = await databaseTransaction.select({ action: schema.auditEvents.action }).from(schema.auditEvents)
				.where(eq(schema.auditEvents.targetId, createdBody.id));
			expect(persistedAuditEvents.map((event) => event.action)).toEqual(['organization.child_created']);
			throw new RollbackOnlyTestTransactionSignal('rollback_synthetic_organization_impact_fixtures');
		});
	} catch (error: unknown) {
		if (!(error instanceof RollbackOnlyTestTransactionSignal)) throw error;
	} finally {
		await closeDatabase();
	}
});
