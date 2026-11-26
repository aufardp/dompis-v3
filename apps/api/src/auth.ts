import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Elysia, t } from 'elysia';
import { createSession, findActiveLoginIdentity, loadAuthorizationContext, revokeSession } from '@dompis/db';
import { database } from '@dompis/db';

const SESSION_COOKIE = '__Host-dompis_session';
const CSRF_COOKIE = '__Host-dompis_csrf';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_BUCKET_LIMIT = 10_000;
type AuthDatabase = NonNullable<typeof database>;

interface LoginBucket {
	count: number;
	resetAt: number;
}

class LoginLimiter {
	private readonly buckets = new Map<string, LoginBucket>();

	retryAfterSeconds(keys: readonly string[], now: number): number | null {
		this.prune(now);
		let blockedUntil = 0;
		for (const key of keys) {
			const bucket = this.buckets.get(key);
			if (bucket && bucket.count >= LOGIN_ATTEMPT_LIMIT) {
				blockedUntil = Math.max(blockedUntil, bucket.resetAt);
			}
		}

		if (this.buckets.size >= LOGIN_BUCKET_LIMIT && keys.some((key) => !this.buckets.has(key))) {
			const nextCapacityAt = Math.min(...Array.from(this.buckets.values(), (bucket) => bucket.resetAt));
			blockedUntil = Math.max(blockedUntil, nextCapacityAt);
		}

		return blockedUntil > now ? Math.max(1, Math.ceil((blockedUntil - now) / 1000)) : null;
	}

	failed(keys: readonly string[], now: number): void {
		this.prune(now);
		for (const key of keys) {
			const current = this.buckets.get(key);
			if (!current && this.buckets.size >= LOGIN_BUCKET_LIMIT) return;
			const bucket = current && current.resetAt > now
				? current
				: { count: 0, resetAt: now + LOGIN_WINDOW_MS };
			bucket.count += 1;
			this.buckets.set(key, bucket);
		}
	}

	clear(key: string): void {
		this.buckets.delete(key);
	}

	private prune(now: number): void {
		for (const [key, bucket] of this.buckets) {
			if (bucket.resetAt <= now) this.buckets.delete(key);
		}
	}
}

export function hashSessionToken(token: string): Uint8Array {
	return createHash('sha256').update(token).digest();
}

function isAllowedOrigin(request: Request, appOrigin: string): boolean {
	return request.headers.get('origin') === appOrigin;
}

function isValidCsrf(request: Request, csrfCookie: string | undefined): boolean {
	const csrfHeader = request.headers.get('x-csrf-token');
	if (!csrfCookie || !csrfHeader || !/^[A-Za-z0-9_-]{43}$/.test(csrfCookie) || !/^[A-Za-z0-9_-]{43}$/.test(csrfHeader)) {
		return false;
	}
	return timingSafeEqual(Buffer.from(csrfCookie), Buffer.from(csrfHeader));
}

export function createAuthRoutes(database: AuthDatabase | undefined, appOrigin: string | undefined) {
	const limiter = new LoginLimiter();
	const dummyPasswordHash = Bun.password.hash('dompis-invalid-login-placeholder', { algorithm: 'argon2id' });

	return new Elysia({ name: 'dompis-auth' })
		.get('/auth/csrf', ({ cookie, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			const token = randomBytes(32).toString('base64url');
			cookie[CSRF_COOKIE].set({
				value: token,
				path: '/',
				secure: true,
				httpOnly: false,
				sameSite: 'strict',
				maxAge: 60 * 60
			});
			return { csrfToken: token };
		}, {
			cookie: t.Cookie({ [CSRF_COOKIE]: t.Optional(t.String()) }),
			response: t.Object({ csrfToken: t.String() })
		})
		.post('/auth/login', async ({ body, cookie, request, server, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!database || !appOrigin) {
				set.status = 503;
				return { error: 'authentication_unavailable' };
			}
			if (!isAllowedOrigin(request, appOrigin)) {
				set.status = 403;
				return { error: 'request_origin_rejected' };
			}
			if (!isValidCsrf(request, cookie[CSRF_COOKIE]?.value)) {
				set.status = 403;
				return { error: 'csrf_rejected' };
			}

			const username = body.username.trim().toLowerCase();
			const address = server?.requestIP(request)?.address ?? 'unknown';
			const accountKey = `account:${username}`;
			const limitKeys = [accountKey, `ip:${address}`];
			const now = Date.now();
			const retryAfterSeconds = limiter.retryAfterSeconds(limitKeys, now);
			if (retryAfterSeconds !== null) {
				set.status = 429;
				set.headers['retry-after'] = String(retryAfterSeconds);
				return { error: 'invalid_credentials' };
			}

			const identity = await findActiveLoginIdentity(database, username);

			const passwordMatches = await Bun.password.verify(body.password, identity?.passwordHash ?? await dummyPasswordHash);
			if (!identity || !passwordMatches) {
				limiter.failed(limitKeys, now);
				set.status = 401;
				return { error: 'invalid_credentials' };
			}

			limiter.clear(accountKey);
			const token = randomBytes(32).toString('base64url');
			const expiresAt = new Date(now + SESSION_TTL_MS);
			await createSession(database, identity.id, hashSessionToken(token), expiresAt);

			cookie[SESSION_COOKIE].set({
				value: token,
				path: '/',
				secure: true,
				httpOnly: true,
				sameSite: 'lax',
				maxAge: Math.floor(SESSION_TTL_MS / 1000)
			});
			return { user: { id: identity.id, username: identity.username, displayName: identity.displayName } };
		}, {
			body: t.Object({
				username: t.String({ minLength: 1, maxLength: 160 }),
				password: t.String({ minLength: 1, maxLength: 1024 })
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE]: t.Optional(t.String()),
				[CSRF_COOKIE]: t.Optional(t.String())
			}),
			response: {
				200: t.Object({ user: t.Object({ id: t.String(), username: t.String(), displayName: t.String() }) }),
				401: t.Object({ error: t.Literal('invalid_credentials') }),
				403: t.Union([
					t.Object({ error: t.Literal('request_origin_rejected') }),
					t.Object({ error: t.Literal('csrf_rejected') })
				]),
				429: t.Object({ error: t.Literal('invalid_credentials') }),
				503: t.Object({ error: t.Literal('authentication_unavailable') })
			}
		})
		.post('/auth/logout', async ({ cookie, request, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!appOrigin || !isAllowedOrigin(request, appOrigin)) {
				set.status = 403;
				return { error: 'request_origin_rejected' };
			}
			if (!isValidCsrf(request, cookie[CSRF_COOKIE]?.value)) {
				set.status = 403;
				return { error: 'csrf_rejected' };
			}
			const token = cookie[SESSION_COOKIE]?.value;
			if (database && typeof token === 'string' && token.length === 43) {
				await revokeSession(database, hashSessionToken(token));
			}
			cookie[SESSION_COOKIE]?.remove();
			return { status: 'signed_out' as const };
		}, {
			cookie: t.Cookie({
				[SESSION_COOKIE]: t.Optional(t.String()),
				[CSRF_COOKIE]: t.Optional(t.String())
			}),
			response: {
				200: t.Object({ status: t.Literal('signed_out') }),
				403: t.Union([
					t.Object({ error: t.Literal('request_origin_rejected') }),
					t.Object({ error: t.Literal('csrf_rejected') })
				])
			}
		})
		.get('/auth/me', async ({ cookie, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!database) {
				set.status = 503;
				return { error: 'authentication_unavailable' };
			}
			const token = cookie[SESSION_COOKIE]?.value;
			if (typeof token !== 'string' || token.length !== 43) {
				set.status = 401;
				return { error: 'unauthenticated' };
			}
			const context = await loadAuthorizationContext(database, hashSessionToken(token));
			if (!context) {
				set.status = 401;
				return { error: 'unauthenticated' };
			}
			return {
				userId: context.userId,
				globalScope: context.globalScope,
				scopeVersion: context.scopeVersion,
				permissions: [...context.permissions].sort()
			};
		}, {
			cookie: t.Cookie({ [SESSION_COOKIE]: t.Optional(t.String()) }),
			response: {
				200: t.Object({
					userId: t.String(),
					globalScope: t.Boolean(),
					scopeVersion: t.Number(),
					permissions: t.Array(t.String())
				}),
				401: t.Object({ error: t.Literal('unauthenticated') }),
				503: t.Object({ error: t.Literal('authentication_unavailable') })
			}
		});
}
