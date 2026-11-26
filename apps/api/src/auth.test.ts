import { expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { closeDatabase, database, schema } from '@dompis/db';
import { createAuthRoutes } from './auth';
import { createPermissionGuard } from './permission-guard';
import { createTicketRoutes, TICKET_READ_PERMISSION } from './tickets';

const databaseUrl = Bun.env.DATABASE_URL;
if (!databaseUrl) throw new Error('auth_test_database_url_missing');
const databaseAddress = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '::1'].includes(databaseAddress.hostname) || databaseAddress.pathname !== '/dompis_v3') {
	throw new Error('auth_test_database_target_rejected');
}
if (!database) throw new Error('auth_test_database_not_configured');
const db = database;

class RollbackFixture extends Error {}

function firstInserted<T>(rows: readonly T[], label: string): T {
	const row = rows[0];
	if (!row) throw new Error(`synthetic_${label}_insert_missing`);
	return row;
}

test('HTTP auth checks Origin, issues secure opaque cookies, and revokes sessions on logout', async () => {
	try {
		await db.transaction(async (tx) => {
			const suffix = crypto.randomUUID().replaceAll('-', '');
			const role = firstInserted(await tx.insert(schema.roles).values({
				code: `auth-test-${suffix}`,
				name: 'Synthetic authentication role'
			}).returning({ id: schema.roles.id }), 'role');
			const permissionCode = TICKET_READ_PERMISSION;
			const permission = firstInserted(await tx.insert(schema.permissions).values({
				code: permissionCode,
				description: 'Synthetic protected route permission'
			}).returning({ id: schema.permissions.id }), 'permission');
			await tx.insert(schema.rolePermissions).values({ roleId: role.id, permissionId: permission.id });
			const user = firstInserted(await tx.insert(schema.users).values({
				username: `auth-${suffix}`,
				displayName: 'Synthetic auth user',
				passwordHash: await Bun.password.hash('synthetic-password', { algorithm: 'argon2id' }),
				roleId: role.id
			}).returning({ id: schema.users.id, username: schema.users.username }), 'user');
			const area = firstInserted(await tx.insert(schema.areas).values({
				code: `AREA-${suffix}`, name: 'Synthetic ticket area'
			}).returning({ id: schema.areas.id }), 'area');
			const region = firstInserted(await tx.insert(schema.regions).values({
				areaId: area.id, code: `REG-${suffix}`, name: 'Synthetic ticket region'
			}).returning({ id: schema.regions.id }), 'region');
			const branch = firstInserted(await tx.insert(schema.branches).values({
				regionId: region.id, code: `BR-${suffix}`, name: 'Synthetic ticket branch'
			}).returning({ id: schema.branches.id }), 'branch');
			const serviceArea = firstInserted(await tx.insert(schema.serviceAreas).values({
				branchId: branch.id, code: `SA-${suffix}`, name: 'Synthetic ticket service area'
			}).returning({ id: schema.serviceAreas.id }), 'service_area');
			const allowedWorkzoneCode = `WZ-A-${suffix}`;
			const allowedWorkzone = firstInserted(await tx.insert(schema.workzones).values({
				serviceAreaId: serviceArea.id, code: allowedWorkzoneCode, name: 'Synthetic allowed workzone'
			}).returning({ id: schema.workzones.id }), 'workzone');
			const deniedWorkzoneCode = `WZ-B-${suffix}`;
			const deniedWorkzone = firstInserted(await tx.insert(schema.workzones).values({
				serviceAreaId: serviceArea.id, code: deniedWorkzoneCode, name: 'Synthetic sibling workzone'
			}).returning({ id: schema.workzones.id }), 'workzone');
			await tx.insert(schema.userScopes).values({ userId: user.id, workzoneId: allowedWorkzone.id });
			const allowedIncident = `AUTH-ALLOWED-${suffix}`.toUpperCase();
			const deniedIncident = `AUTH-DENIED-${suffix}`.toUpperCase();
			await tx.insert(schema.tickets).values([
				{
					incident: allowedIncident, workzoneId: allowedWorkzone.id, sourceWorkzone: allowedWorkzoneCode,
					status: 'OPEN', lifecycle: 'open', dataOrigin: 'legacy', migratedAt: new Date(),
					operationalBucket: 'unknown', kpiSeg: 'unknown', ruleVersion: 'auth-test'
				},
				{
					incident: deniedIncident, workzoneId: deniedWorkzone.id, sourceWorkzone: deniedWorkzoneCode,
					status: 'OPEN', lifecycle: 'open', dataOrigin: 'legacy', migratedAt: new Date(),
					operationalBucket: 'unknown', kpiSeg: 'unknown', ruleVersion: 'auth-test'
				}
			]);
			const app = new Elysia().use(createAuthRoutes(tx, 'https://dompis.example.test'));
			const csrfResponse = await app.handle(new Request('http://localhost/auth/csrf'));
			expect(csrfResponse.status).toBe(200);
			const csrfToken = (await csrfResponse.json() as { csrfToken: string }).csrfToken;
			const csrfCookie = /__Host-dompis_csrf=([^;]+)/.exec(csrfResponse.headers.get('set-cookie') ?? '')?.[1];
			if (!csrfCookie) throw new Error('synthetic_csrf_cookie_missing');
			expect(csrfToken).toBe(csrfCookie);

			const badOrigin = await app.handle(new Request('http://localhost/auth/login', {
				method: 'POST',
				headers: {
					origin: 'https://attacker.example.test',
					'content-type': 'application/json',
					'x-csrf-token': csrfToken,
					cookie: `__Host-dompis_csrf=${csrfCookie}`
				},
				body: JSON.stringify({ username: user.username, password: 'synthetic-password' })
			}));
			expect(badOrigin.status).toBe(403);
			const badCsrf = await app.handle(new Request('http://localhost/auth/login', {
				method: 'POST',
				headers: {
					origin: 'https://dompis.example.test',
					'content-type': 'application/json',
					'x-csrf-token': `${csrfToken.slice(1)}x`,
					cookie: `__Host-dompis_csrf=${csrfCookie}`
				},
				body: JSON.stringify({ username: user.username, password: 'synthetic-password' })
			}));
			expect(badCsrf.status).toBe(403);

			const login = await app.handle(new Request('http://localhost/auth/login', {
				method: 'POST',
				headers: {
					origin: 'https://dompis.example.test',
					'content-type': 'application/json',
					'x-csrf-token': csrfToken,
					cookie: `__Host-dompis_csrf=${csrfCookie}`
				},
				body: JSON.stringify({ username: user.username.toUpperCase(), password: 'synthetic-password' })
			}));
			expect(login.status).toBe(200);
			const setCookie = login.headers.get('set-cookie') ?? '';
			expect(setCookie).toContain('Secure');
			expect(setCookie).toContain('HttpOnly');
			expect(setCookie).toContain('SameSite=Lax');
			const token = /__Host-dompis_session=([^;]+)/.exec(setCookie)?.[1];
			if (!token) throw new Error('synthetic_auth_cookie_missing');
			expect(token).not.toContain('=');

			const me = await app.handle(new Request('http://localhost/auth/me', {
				headers: { cookie: `__Host-dompis_session=${token}` }
			}));
			expect(me.status).toBe(200);

			const unavailableDatabase = {
				select: () => { throw new Error('synthetic_database_connection_failure'); },
				execute: async () => { throw new Error('synthetic_database_connection_failure'); }
			} as unknown as typeof db;
			const outageApp = new Elysia()
				.onError(({ set }) => {
					set.status = 500;
					return { error: 'internal_error' };
				})
				.use(createAuthRoutes(unavailableDatabase, 'https://dompis.example.test'));
			const duringOutage = await outageApp.handle(new Request('http://localhost/auth/me', {
				headers: { cookie: `__Host-dompis_session=${token}` }
			}));
			expect(duringOutage.status).toBe(503);
			expect(await duringOutage.json()).toEqual({ error: 'authentication_unavailable' });
			expect(duringOutage.headers.get('set-cookie') ?? '').not.toContain('__Host-dompis_session=;');

			const failingQueryDatabase = {
				select: () => { throw new Error('synthetic_query_failure'); },
				execute: async () => []
			} as unknown as typeof db;
			const queryFailureApp = new Elysia()
				.onError(({ set }) => {
					set.status = 500;
					return { error: 'internal_error' };
				})
				.use(createAuthRoutes(failingQueryDatabase, 'https://dompis.example.test'));
			const queryFailure = await queryFailureApp.handle(new Request('http://localhost/auth/me', {
				headers: { cookie: `__Host-dompis_session=${token}` }
			}));
			expect(queryFailure.status).toBe(500);
			expect(await queryFailure.json()).toEqual({ error: 'internal_error' });

			const guardedApp = new Elysia()
				.use(createPermissionGuard(tx))
				.get('/protected', ({ authorization }) => ({ userId: authorization.userId }), {
					requirePermission: permissionCode
				})
				.get('/forbidden', () => ({ reachedHandler: true }), {
					requirePermission: 'permission.not.granted'
				});
			const unauthenticated = await guardedApp.handle(new Request('http://localhost/protected'));
			expect(unauthenticated.status).toBe(401);
			const authorized = await guardedApp.handle(new Request('http://localhost/protected', {
				headers: { cookie: `__Host-dompis_session=${token}` }
			}));
			expect(authorized.status).toBe(200);
			expect(authorized.headers.get('cache-control')).toBe('private, no-store');
			const missingPermission = await guardedApp.handle(new Request('http://localhost/forbidden', {
				headers: { cookie: `__Host-dompis_session=${token}` }
			}));
			expect(missingPermission.status).toBe(403);

			const ticketApp = new Elysia().use(createTicketRoutes(tx));
			const ticketResponse = await ticketApp.handle(new Request(`http://localhost/tickets/${allowedIncident.toLowerCase()}`, {
				headers: { cookie: `__Host-dompis_session=${token}` }
			}));
			expect(ticketResponse.status).toBe(200);
			const ticketDto = await ticketResponse.json() as Record<string, unknown>;
			expect(ticketDto.incident).toBe(allowedIncident);
			expect(ticketDto).not.toHaveProperty('serviceNo');
			expect(ticketDto).not.toHaveProperty('detail');
			const outOfScopeTicket = await ticketApp.handle(new Request(`http://localhost/tickets/${deniedIncident}`, {
				headers: { cookie: `__Host-dompis_session=${token}` }
			}));
			expect(outOfScopeTicket.status).toBe(404);

			const logout = await app.handle(new Request('http://localhost/auth/logout', {
				method: 'POST',
				headers: {
					origin: 'https://dompis.example.test',
					'x-csrf-token': csrfToken,
					cookie: `__Host-dompis_session=${token}; __Host-dompis_csrf=${csrfCookie}`
				}
			}));
			expect(logout.status).toBe(200);
			const afterLogout = await app.handle(new Request('http://localhost/auth/me', {
				headers: { cookie: `__Host-dompis_session=${token}` }
			}));
			expect(afterLogout.status).toBe(401);

			const invalidLogin = await app.handle(new Request('http://localhost/auth/login', {
				method: 'POST',
				headers: {
					origin: 'https://dompis.example.test',
					'content-type': 'application/json',
					'x-csrf-token': csrfToken,
					cookie: `__Host-dompis_csrf=${csrfCookie}`
				},
				body: JSON.stringify({ username: user.username, password: 'wrong-password' })
			}));
			expect(invalidLogin.status).toBe(401);
			expect(await invalidLogin.json()).toEqual({ error: 'invalid_credentials' });
			for (let attempt = 1; attempt < 10; attempt += 1) {
				const repeatedFailure = await app.handle(new Request('http://localhost/auth/login', {
					method: 'POST',
					headers: {
						origin: 'https://dompis.example.test',
						'content-type': 'application/json',
						'x-csrf-token': csrfToken,
						cookie: `__Host-dompis_csrf=${csrfCookie}`
					},
					body: JSON.stringify({ username: user.username, password: 'wrong-password' })
				}));
				expect(repeatedFailure.status).toBe(401);
			}
			const throttled = await app.handle(new Request('http://localhost/auth/login', {
				method: 'POST',
				headers: {
					origin: 'https://dompis.example.test',
					'content-type': 'application/json',
					'x-csrf-token': csrfToken,
					cookie: `__Host-dompis_csrf=${csrfCookie}`
				},
				body: JSON.stringify({ username: user.username, password: 'synthetic-password' })
			}));
			expect(throttled.status).toBe(429);

			throw new RollbackFixture('rollback_synthetic_authentication_fixtures');
		});
	} catch (error: unknown) {
		if (!(error instanceof RollbackFixture)) throw error;
	} finally {
		await closeDatabase();
	}
});
