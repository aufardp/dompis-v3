import { afterAll, expect, test } from 'bun:test';
import { and, asc, eq } from 'drizzle-orm';
import { closeDatabase, database, schema } from './index';
import { loadAuthorizationContext, ticketAccessPredicate } from './authorization';

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error('authorization_test_database_url_missing');

const databaseAddress = new URL(databaseUrl);
if (
	!['localhost', '127.0.0.1', '::1'].includes(databaseAddress.hostname) ||
	databaseAddress.pathname !== '/dompis_v3'
) {
	throw new Error('authorization_test_database_target_rejected');
}

if (!database) throw new Error('authorization_test_database_not_configured');
const db = database;

class RollbackFixture extends Error {}

function firstInserted<T>(rows: readonly T[], label: string): T {
	const row = rows[0];
	if (!row) throw new Error(`synthetic_${label}_insert_missing`);
	return row;
}

afterAll(async () => {
	await closeDatabase();
});

test('ticket access requires permission and active hierarchy scope', async () => {
	try {
		await db.transaction(async (tx) => {
			const suffix = crypto.randomUUID().replaceAll('-', '');
			const roleWithRead = firstInserted(await tx.insert(schema.roles).values({
				code: `scope-test-read-${suffix}`,
				name: 'Synthetic scope read role'
			}).returning({ id: schema.roles.id }), 'role');
			const roleWithoutRead = firstInserted(await tx.insert(schema.roles).values({
				code: `scope-test-deny-${suffix}`,
				name: 'Synthetic no-permission role'
			}).returning({ id: schema.roles.id }), 'role');
			const permissionCode = `tickets.read.${suffix}`;
			const permission = firstInserted(await tx.insert(schema.permissions).values({
				code: permissionCode,
				description: 'Synthetic test permission'
			}).returning({ id: schema.permissions.id }), 'permission');
			await tx.insert(schema.rolePermissions).values({
				roleId: roleWithRead.id,
				permissionId: permission.id
			});

			const areaA = firstInserted(await tx.insert(schema.areas).values({
				code: `A-${suffix}`,
				name: 'Synthetic Area A'
			}).returning({ id: schema.areas.id }), 'area');
			const areaB = firstInserted(await tx.insert(schema.areas).values({
				code: `B-${suffix}`,
				name: 'Synthetic Area B'
			}).returning({ id: schema.areas.id }), 'area');
			const regionA = firstInserted(await tx.insert(schema.regions).values({
				areaId: areaA.id,
				code: `R-${suffix}`,
				name: 'Synthetic Region A'
			}).returning({ id: schema.regions.id }), 'region');
			const regionB = firstInserted(await tx.insert(schema.regions).values({
				areaId: areaB.id,
				code: `R-${suffix}`,
				name: 'Synthetic Region B'
			}).returning({ id: schema.regions.id }), 'region');
			const branchA = firstInserted(await tx.insert(schema.branches).values({
				regionId: regionA.id,
				code: `B-${suffix}`,
				name: 'Synthetic Branch A'
			}).returning({ id: schema.branches.id }), 'branch');
			const branchB = firstInserted(await tx.insert(schema.branches).values({
				regionId: regionB.id,
				code: `B-${suffix}`,
				name: 'Synthetic Branch B'
			}).returning({ id: schema.branches.id }), 'branch');
			const serviceAreaA = firstInserted(await tx.insert(schema.serviceAreas).values({
				branchId: branchA.id,
				code: `SA-${suffix}`,
				name: 'Synthetic Service Area A'
			}).returning({ id: schema.serviceAreas.id }), 'service_area');
			const serviceAreaB = firstInserted(await tx.insert(schema.serviceAreas).values({
				branchId: branchB.id,
				code: `SA-${suffix}`,
				name: 'Synthetic Service Area B'
			}).returning({ id: schema.serviceAreas.id }), 'service_area');
			const workzoneA1 = firstInserted(await tx.insert(schema.workzones).values({
				serviceAreaId: serviceAreaA.id,
				code: `W1-${suffix}`,
				name: 'Synthetic Workzone A1'
			}).returning({ id: schema.workzones.id }), 'workzone');
			const workzoneA2 = firstInserted(await tx.insert(schema.workzones).values({
				serviceAreaId: serviceAreaA.id,
				code: `W2-${suffix}`,
				name: 'Synthetic Workzone A2'
			}).returning({ id: schema.workzones.id }), 'workzone');
			const workzoneB = firstInserted(await tx.insert(schema.workzones).values({
				serviceAreaId: serviceAreaB.id,
				code: `W3-${suffix}`,
				name: 'Synthetic Workzone B'
			}).returning({ id: schema.workzones.id }), 'workzone');

			const scopedUser = firstInserted(await tx.insert(schema.users).values({
				username: `scoped-${suffix}`,
				displayName: 'Synthetic scoped user',
				passwordHash: 'synthetic-not-a-password-hash',
				roleId: roleWithRead.id
			}).returning({ id: schema.users.id }), 'user');
			const unscopedUser = firstInserted(await tx.insert(schema.users).values({
				username: `unscoped-${suffix}`,
				displayName: 'Synthetic user with no grant',
				passwordHash: 'synthetic-not-a-password-hash',
				roleId: roleWithRead.id
			}).returning({ id: schema.users.id }), 'user');
			const globalUser = firstInserted(await tx.insert(schema.users).values({
				username: `global-${suffix}`,
				displayName: 'Synthetic explicitly global user',
				passwordHash: 'synthetic-not-a-password-hash',
				roleId: roleWithRead.id,
				globalScope: true
			}).returning({ id: schema.users.id }), 'user');
			const globalWithoutRead = firstInserted(await tx.insert(schema.users).values({
				username: `global-denied-${suffix}`,
				displayName: 'Synthetic global user without permission',
				passwordHash: 'synthetic-not-a-password-hash',
				roleId: roleWithoutRead.id,
				globalScope: true
			}).returning({ id: schema.users.id }), 'user');
			const scopedTokenHash = crypto.getRandomValues(new Uint8Array(32));
			const unscopedTokenHash = crypto.getRandomValues(new Uint8Array(32));
			const globalTokenHash = crypto.getRandomValues(new Uint8Array(32));
			const deniedGlobalTokenHash = crypto.getRandomValues(new Uint8Array(32));
			const revokedTokenHash = crypto.getRandomValues(new Uint8Array(32));
			const expiredTokenHash = crypto.getRandomValues(new Uint8Array(32));
			const now = new Date();
			const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
			const expiredCreatedAt = new Date(now.getTime() - 2 * 60 * 60 * 1000);
			const expiredAt = new Date(now.getTime() - 60 * 60 * 1000);
			await tx.insert(schema.sessions).values([
				{ userId: scopedUser.id, tokenHash: scopedTokenHash, expiresAt },
				{ userId: unscopedUser.id, tokenHash: unscopedTokenHash, expiresAt },
				{ userId: globalUser.id, tokenHash: globalTokenHash, expiresAt },
				{ userId: globalWithoutRead.id, tokenHash: deniedGlobalTokenHash, expiresAt },
				{ userId: scopedUser.id, tokenHash: revokedTokenHash, expiresAt, revokedAt: now },
				{ userId: scopedUser.id, tokenHash: expiredTokenHash, createdAt: expiredCreatedAt, expiresAt: expiredAt }
			]);

			await tx.insert(schema.userScopes).values([
				{ userId: scopedUser.id, areaId: areaA.id },
				{ userId: scopedUser.id, branchId: branchA.id }
			]);

			await tx.insert(schema.tickets).values([
				{
					incident: `SCOPE-A1-${suffix}`.toUpperCase(), workzoneId: workzoneA1.id,
					status: 'OPEN', lifecycle: 'open', dataOrigin: 'legacy', migratedAt: new Date(),
					operationalBucket: 'unknown', kpiSeg: 'unknown', ruleVersion: 'scope-test'
				},
				{
					incident: `SCOPE-A2-${suffix}`.toUpperCase(), workzoneId: workzoneA2.id,
					status: 'OPEN', lifecycle: 'open', dataOrigin: 'legacy', migratedAt: new Date(),
					operationalBucket: 'unknown', kpiSeg: 'unknown', ruleVersion: 'scope-test'
				},
				{
					incident: `SCOPE-B-${suffix}`.toUpperCase(), workzoneId: workzoneB.id,
					status: 'OPEN', lifecycle: 'open', dataOrigin: 'legacy', migratedAt: new Date(),
					operationalBucket: 'unknown', kpiSeg: 'unknown', ruleVersion: 'scope-test'
				}
			]);

			const scopedContext = await loadAuthorizationContext(tx, scopedTokenHash);
			const unscopedContext = await loadAuthorizationContext(tx, unscopedTokenHash);
			const globalContext = await loadAuthorizationContext(tx, globalTokenHash);
			const deniedGlobalContext = await loadAuthorizationContext(tx, deniedGlobalTokenHash);
			expect(await loadAuthorizationContext(tx, revokedTokenHash)).toBeNull();
			expect(await loadAuthorizationContext(tx, expiredTokenHash)).toBeNull();
			expect(await loadAuthorizationContext(tx, crypto.getRandomValues(new Uint8Array(32)))).toBeNull();
			if (!scopedContext || !unscopedContext || !globalContext || !deniedGlobalContext) {
				throw new Error('synthetic_authorization_context_missing');
			}

			const scopedTickets = await tx.select({ incident: schema.tickets.incident })
				.from(schema.tickets)
				.where(ticketAccessPredicate(scopedContext, permissionCode))
				.orderBy(asc(schema.tickets.incident));
			expect(scopedTickets.map((ticket) => ticket.incident)).toEqual([
				`SCOPE-A1-${suffix}`.toUpperCase(),
				`SCOPE-A2-${suffix}`.toUpperCase()
			]);

			const filteredTickets = await tx.select({ incident: schema.tickets.incident })
				.from(schema.tickets)
				.where(and(
					ticketAccessPredicate(scopedContext, permissionCode),
					eq(schema.tickets.workzoneId, workzoneA1.id)
				));
			expect(filteredTickets).toHaveLength(1);

			const unscopedTickets = await tx.select({ incident: schema.tickets.incident })
				.from(schema.tickets)
				.where(ticketAccessPredicate(unscopedContext, permissionCode));
			expect(unscopedTickets).toHaveLength(0);

			const globalTickets = await tx.select({ incident: schema.tickets.incident })
				.from(schema.tickets)
				.where(ticketAccessPredicate(globalContext, permissionCode))
				.orderBy(asc(schema.tickets.incident));
			expect(globalTickets).toHaveLength(3);

			const deniedGlobalTickets = await tx.select({ incident: schema.tickets.incident })
				.from(schema.tickets)
				.where(ticketAccessPredicate(deniedGlobalContext, permissionCode));
			expect(deniedGlobalTickets).toHaveLength(0);

			await tx.update(schema.areas).set({ active: false }).where(eq(schema.areas.id, areaA.id));
			const afterDeactivate = await tx.select({ incident: schema.tickets.incident })
				.from(schema.tickets)
				.where(ticketAccessPredicate(scopedContext, permissionCode));
			expect(afterDeactivate).toHaveLength(0);

			throw new RollbackFixture('rollback_synthetic_authorization_fixtures');
		});
	} catch (error: unknown) {
		if (!(error instanceof RollbackFixture)) throw error;
	}
});

