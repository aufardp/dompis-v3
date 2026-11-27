import { desc, eq, lt } from 'drizzle-orm';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Elysia, t } from 'elysia';
import { database, schema } from '@dompis/db';
import { createPermissionGuard } from './permission-guard';

type AuditDatabase = NonNullable<typeof database>;
const cursorKey = randomBytes(32);
type CursorClaims = { actorId: string; afterId: string };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function signCursor(claims: CursorClaims): string {
	const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
	const signature = createHmac('sha256', cursorKey).update(payload).digest('base64url');
	return `${payload}.${signature}`;
}

function parseCursor(value: string, actorId: string): string | null {
	const [payload, signature, extra] = value.split('.');
	if (!payload || !signature || extra !== undefined) return null;
	const expected = createHmac('sha256', cursorKey).update(payload).digest();
	const actual = Buffer.from(signature, 'base64url');
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
	try {
		const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as CursorClaims;
		return claims.actorId === actorId && uuidPattern.test(claims.afterId) ? claims.afterId : null;
	} catch { return null; }
}

export function createAuditRoutes(database: AuditDatabase | undefined) {
	return new Elysia({ name: 'dompis-audit-read' }).use(createPermissionGuard(database))
		.get('/api/admin/audit-events', async ({ authorization, query, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!database) { set.status = 503; return { error: 'audit_unavailable' as const }; }
			if (!authorization.globalScope) { set.status = 403; return { error: 'global_scope_required' as const }; }
			const [actor] = await database.select({ active: schema.users.active, globalScope: schema.users.globalScope,
				roleCode: schema.roles.code, roleActive: schema.roles.active }).from(schema.users)
				.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(eq(schema.users.id, authorization.userId)).limit(1);
			if (actor?.active !== true || actor.roleActive !== true || actor.roleCode !== 'superadmin' || actor.globalScope !== true) {
				set.status = 403; return { error: 'forbidden' as const };
			}
			const afterId = query.after ? parseCursor(query.after, authorization.userId) : null;
			if (query.after && !afterId) { set.status = 400; return { error: 'invalid_cursor' as const }; }
			const limit = query.limit ?? 50;
			const rows = await database.select({ id: schema.auditEvents.id, actorId: schema.auditEvents.actorId,
				action: schema.auditEvents.action, targetId: schema.auditEvents.targetId,
				requestId: schema.auditEvents.requestId, createdAt: schema.auditEvents.createdAt })
				.from(schema.auditEvents).where(afterId ? lt(schema.auditEvents.id, afterId) : undefined)
				.orderBy(desc(schema.auditEvents.id)).limit(limit + 1);
			const hasMore = rows.length > limit;
			const events = rows.slice(0, limit);
			const last = events.at(-1);
			return {
				events,
				nextCursor: hasMore && last ? signCursor({ actorId: authorization.userId, afterId: last.id }) : null
			};
		}, {
			query: t.Object({ after: t.Optional(t.String({ minLength: 20, maxLength: 512 })),
				limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 })) }),
			requirePermission: 'audit.read',
			response: {
				200: t.Object({ events: t.Array(t.Object({ id: t.String(), actorId: t.Nullable(t.String()), action: t.String(),
					targetId: t.Nullable(t.String()), requestId: t.String(), createdAt: t.Date() })), nextCursor: t.Nullable(t.String()) }),
				400: t.Object({ error: t.String() }), 401: t.Object({ error: t.String() }), 403: t.Object({ error: t.String() }),
				422: t.Object({ error: t.Literal('invalid_request'), requestId: t.String() }), 500: t.Object({ error: t.String() }),
				503: t.Object({ error: t.String() })
			}
		});
}
