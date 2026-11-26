import { expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { closeDatabase, database, schema } from '@dompis/db';
import { createAuthRoutes } from './auth';

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
			const user = firstInserted(await tx.insert(schema.users).values({
				username: `auth-${suffix}`,
				displayName: 'Synthetic auth user',
				passwordHash: await Bun.password.hash('synthetic-password', { algorithm: 'argon2id' }),
				roleId: role.id
			}).returning({ id: schema.users.id, username: schema.users.username }), 'user');
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
