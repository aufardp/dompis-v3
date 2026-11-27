import { desc, eq, lt } from 'drizzle-orm';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Elysia, t } from 'elysia';
import { database, schema } from '@dompis/db';
import { createPermissionGuard } from './permission-guard';

type AuditEventDatabase = NonNullable<typeof database>;
const auditCursorSigningKey = randomBytes(32);
type AuditCursorClaims = { actorId: string; afterId: string };
const uuidV7CursorPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createSignedAuditEventCursor(cursorClaims: AuditCursorClaims): string {
	const encodedCursorClaims = Buffer.from(JSON.stringify(cursorClaims)).toString('base64url');
	const cursorSignature = createHmac('sha256', auditCursorSigningKey).update(encodedCursorClaims).digest('base64url');
	return `${encodedCursorClaims}.${cursorSignature}`;
}

function readVerifiedAuditEventCursor(signedCursor: string, actorId: string): string | null {
	const [encodedCursorClaims, encodedSignature, unexpectedCursorPart] = signedCursor.split('.');
	if (!encodedCursorClaims || !encodedSignature || unexpectedCursorPart !== undefined) return null;
	const expectedSignature = createHmac('sha256', auditCursorSigningKey).update(encodedCursorClaims).digest();
	const actualSignature = Buffer.from(encodedSignature, 'base64url');
	if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null;
	try {
		const cursorClaims = JSON.parse(Buffer.from(encodedCursorClaims, 'base64url').toString('utf8')) as AuditCursorClaims;
		return cursorClaims.actorId === actorId && uuidV7CursorPattern.test(cursorClaims.afterId) ? cursorClaims.afterId : null;
	} catch { return null; }
}

export function createAuditRoutes(database: AuditEventDatabase | undefined) {
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
			const cursorAfterAuditEventId = query.after ? readVerifiedAuditEventCursor(query.after, authorization.userId) : null;
			if (query.after && !cursorAfterAuditEventId) { set.status = 400; return { error: 'invalid_cursor' as const }; }
			const pageSize = query.limit ?? 50;
			const auditEventRows = await database.select({ id: schema.auditEvents.id, actorId: schema.auditEvents.actorId,
				action: schema.auditEvents.action, targetId: schema.auditEvents.targetId,
				requestId: schema.auditEvents.requestId, createdAt: schema.auditEvents.createdAt })
				.from(schema.auditEvents).where(cursorAfterAuditEventId ? lt(schema.auditEvents.id, cursorAfterAuditEventId) : undefined)
				.orderBy(desc(schema.auditEvents.id)).limit(pageSize + 1);
			const hasMoreAuditEvents = auditEventRows.length > pageSize;
			const auditEventsPage = auditEventRows.slice(0, pageSize);
			const lastAuditEvent = auditEventsPage.at(-1);
			return {
				events: auditEventsPage,
				nextCursor: hasMoreAuditEvents && lastAuditEvent ? createSignedAuditEventCursor({ actorId: authorization.userId, afterId: lastAuditEvent.id }) : null
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
