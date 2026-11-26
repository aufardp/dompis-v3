import { Elysia, status, t } from 'elysia';
import { loadAuthorizationContext } from '@dompis/db';
import { database } from '@dompis/db';
import { hashSessionToken, isSessionToken } from './auth';

const SESSION_COOKIE = '__Host-dompis_session';
type AuthDatabase = NonNullable<typeof database>;

/**
 * Adds a per-route `requirePermission` macro. Authorized routes receive a
 * freshly resolved `authorization` context; missing or stale sessions fail closed.
 */
export function createPermissionGuard(database: AuthDatabase | undefined) {
	return new Elysia({ name: 'dompis-permission-guard' }).macro({
		requirePermission: (permissionCode: string) => ({
			cookie: t.Cookie({ [SESSION_COOKIE]: t.Optional(t.String()) }),
			resolve: async ({ cookie, set }) => {
				set.headers['cache-control'] = 'private, no-store';
				if (!database) return status(503, { error: 'authorization_unavailable' as const });
				const token = cookie[SESSION_COOKIE]?.value;
				if (!isSessionToken(token)) {
					return status(401, { error: 'unauthenticated' as const });
				}
				const authorization = await loadAuthorizationContext(database, hashSessionToken(token));
				if (!authorization) return status(401, { error: 'unauthenticated' as const });
				if (!authorization.permissions.has(permissionCode)) {
					return status(403, { error: 'forbidden' as const });
				}
				return { authorization };
			}
		})
	});
}
