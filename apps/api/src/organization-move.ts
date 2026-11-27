import { and, asc, eq, gt, ilike, inArray, or, sql } from 'drizzle-orm';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Elysia, t } from 'elysia';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { appendAuditEvent, database, schema } from '@dompis/db';
import { validateMutationSecurity } from './auth';
import { createPermissionGuard } from './permission-guard';

type MoveDatabase = NonNullable<typeof database>;
type Level = 'area' | 'region' | 'branch' | 'service_area' | 'workzone';
type MovableLevel = Exclude<Level, 'area'>;
type Path = Partial<Record<Level, string>>;
type ScopeMatch = { level: Level; id: string; predicate: ReturnType<typeof sql<boolean>> };
type MoveClaims = { actorId: string; level: MovableLevel; nodeId: string; oldParentId: string; newParentId: string; count: number; fingerprint: string; expiresAt: number };
const csrfCookie = '__Host-dompis_csrf';
const signingKey = randomBytes(32);
const levelSchema = t.Union([t.Literal('region'), t.Literal('branch'), t.Literal('service_area'), t.Literal('workzone')]);
const anyLevelSchema = t.Union([t.Literal('area'), levelSchema]);
const errorSchema = t.Object({ error: t.String() });
const invalidRequest = t.Object({ error: t.Literal('invalid_request'), requestId: t.String() });

function grantExists(column: AnyPgColumn, targetId: string) {
	return sql<boolean>`EXISTS (SELECT 1 FROM ${schema.userScopes} WHERE ${schema.userScopes.userId}=${schema.users.id} AND ${column}=${targetId})`;
}
function seal(claims: MoveClaims): string {
	const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
	return `${payload}.${createHmac('sha256', signingKey).update(payload).digest('base64url')}`;
}
function open(token: string, actorId: string, level: MovableLevel, nodeId: string, newParentId: string): MoveClaims | null {
	const [payload, signature, extra] = token.split('.');
	if (!payload || !signature || extra !== undefined) return null;
	const expected = createHmac('sha256', signingKey).update(payload).digest();
	const actual = Buffer.from(signature, 'base64url');
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
	try {
		const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as MoveClaims;
		return claims.actorId === actorId && claims.level === level && claims.nodeId === nodeId && claims.newParentId === newParentId &&
			claims.expiresAt > Date.now() && Number.isSafeInteger(claims.count) && typeof claims.fingerprint === 'string' ? claims : null;
	} catch { return null; }
}
function constraintName(error: unknown): string | undefined {
	let value: unknown = error;
	for (let depth = 0; depth < 3; depth += 1) {
		if (!value || typeof value !== 'object') return undefined;
		if ('constraint' in value && typeof value.constraint === 'string') return value.constraint;
		value = 'cause' in value ? value.cause : undefined;
	}
	return undefined;
}
function escapePrefix(value: string): string { return `${value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; }

async function activeParentPath(db: MoveDatabase, level: MovableLevel, parentId: string): Promise<Path | null> {
	if (level === 'region') {
		const [row] = await db.select({ id: schema.areas.id }).from(schema.areas).where(and(eq(schema.areas.id, parentId), eq(schema.areas.active, true))).limit(1);
		return row ? { area: row.id } : null;
	}
	if (level === 'branch') {
		const [row] = await db.select({ regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.regions)
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.regions.id, parentId), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { area: row.areaId, region: row.regionId } : null;
	}
	if (level === 'service_area') {
		const [row] = await db.select({ branchId: schema.branches.id, regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.branches)
			.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.branches.id, parentId), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { area: row.areaId, region: row.regionId, branch: row.branchId } : null;
	}
	const [row] = await db.select({ serviceAreaId: schema.serviceAreas.id, branchId: schema.branches.id, regionId: schema.regions.id, areaId: schema.areas.id })
		.from(schema.serviceAreas).innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
		.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
		.where(and(eq(schema.serviceAreas.id, parentId), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
	return row ? { area: row.areaId, region: row.regionId, branch: row.branchId, service_area: row.serviceAreaId } : null;
}

async function nodeState(db: MoveDatabase, level: MovableLevel, nodeId: string): Promise<{ oldParentId: string; code: string; path: Path } | null> {
	if (level === 'region') {
		const [row] = await db.select({ id: schema.regions.id, oldParentId: schema.regions.areaId, code: schema.regions.code, areaActive: schema.areas.active })
			.from(schema.regions).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.regions.id, nodeId), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { oldParentId: row.oldParentId, code: row.code, path: { area: row.oldParentId, region: row.id } } : null;
	}
	if (level === 'branch') {
		const [row] = await db.select({ id: schema.branches.id, oldParentId: schema.branches.regionId, code: schema.branches.code,
			areaId: schema.areas.id }).from(schema.branches).innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.branches.id, nodeId), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { oldParentId: row.oldParentId, code: row.code, path: { area: row.areaId, region: row.oldParentId, branch: row.id } } : null;
	}
	if (level === 'service_area') {
		const [row] = await db.select({ id: schema.serviceAreas.id, oldParentId: schema.serviceAreas.branchId, code: schema.serviceAreas.code,
			regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.serviceAreas)
			.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id)).innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.serviceAreas.id, nodeId), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { oldParentId: row.oldParentId, code: row.code, path: { area: row.areaId, region: row.regionId, branch: row.oldParentId, service_area: row.id } } : null;
	}
	const [row] = await db.select({ id: schema.workzones.id, oldParentId: schema.workzones.serviceAreaId, code: schema.workzones.code,
		branchId: schema.branches.id, regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.workzones)
		.innerJoin(schema.serviceAreas, eq(schema.workzones.serviceAreaId, schema.serviceAreas.id)).innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
		.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
		.where(and(eq(schema.workzones.id, nodeId), eq(schema.workzones.active, true), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
	return row ? { oldParentId: row.oldParentId, code: row.code,
		path: { area: row.areaId, region: row.regionId, branch: row.branchId, service_area: row.oldParentId, workzone: row.id } } : null;
}

async function subtreeScopes(db: MoveDatabase, level: MovableLevel, nodeId: string): Promise<ScopeMatch[]> {
	const nodes: Record<Level, string[]> = { area: [], region: [], branch: [], service_area: [], workzone: [] };
	nodes[level].push(nodeId);
	if (level === 'region') nodes.branch = (await db.select({ id: schema.branches.id }).from(schema.branches).where(eq(schema.branches.regionId, nodeId))).map((r) => r.id);
	if (level === 'region' || level === 'branch') {
		const branchIds = level === 'branch' ? [nodeId] : nodes.branch;
		if (branchIds.length) nodes.service_area = (await db.select({ id: schema.serviceAreas.id }).from(schema.serviceAreas).where(inArray(schema.serviceAreas.branchId, branchIds))).map((r) => r.id);
	}
	if (level !== 'workzone') {
		const serviceIds = level === 'service_area' ? [nodeId] : nodes.service_area;
		if (serviceIds.length) nodes.workzone = (await db.select({ id: schema.workzones.id }).from(schema.workzones).where(inArray(schema.workzones.serviceAreaId, serviceIds))).map((r) => r.id);
	}
	const matches: ScopeMatch[] = [];
	const columns: Record<Level, AnyPgColumn> = { area: schema.userScopes.areaId, region: schema.userScopes.regionId, branch: schema.userScopes.branchId,
		service_area: schema.userScopes.serviceAreaId, workzone: schema.userScopes.workzoneId };
	for (const item of ['region', 'branch', 'service_area', 'workzone'] as const) {
		for (const id of nodes[item]) matches.push({ level: item, id, predicate: grantExists(columns[item], id) });
	}
	return matches;
}

async function affectedMatches(db: MoveDatabase, level: MovableLevel, nodeId: string, oldParentId: string, newParentId: string): Promise<ScopeMatch[] | null> {
	const oldPath = await activeParentPath(db, level, oldParentId);
	const newPath = await activeParentPath(db, level, newParentId);
	const subtree = await subtreeScopes(db, level, nodeId);
	if (!oldPath || !newPath) return null;
	const byKey = new Map<string, ScopeMatch>();
	for (const [path, prefix] of [[oldPath, 'old'], [newPath, 'new']] as const) {
		for (const [scopeLevel, id] of Object.entries(path) as Array<[Level, string]>) {
			const column = scopeLevel === 'area' ? schema.userScopes.areaId : scopeLevel === 'region' ? schema.userScopes.regionId
				: scopeLevel === 'branch' ? schema.userScopes.branchId : scopeLevel === 'service_area' ? schema.userScopes.serviceAreaId : schema.userScopes.workzoneId;
			byKey.set(`${prefix}:${scopeLevel}:${id}`, { level: scopeLevel, id, predicate: grantExists(column, id) });
		}
	}
	for (const match of subtree) byKey.set(`subtree:${match.level}:${match.id}`, match);
	return [...byKey.values()];
}

async function impactFingerprint(db: MoveDatabase, matches: readonly ScopeMatch[]) {
	const scoped = matches.length ? or(...matches.map((match) => match.predicate)) : undefined;
	const predicate = scoped ? or(eq(schema.users.globalScope, true), scoped) : eq(schema.users.globalScope, true);
	const active = and(eq(schema.users.active, true), eq(schema.roles.active, true), predicate);
	const rows = await db.select({ id: schema.users.id }).from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
		.where(active).orderBy(asc(schema.users.id));
	const ids = rows.map((row) => row.id);
	return { count: ids.length, fingerprint: createHash('sha256').update(ids.join(',')).digest('hex'), ids };
}

export function createOrganizationMoveRoutes(db: MoveDatabase | undefined, appOrigin?: string) {
	return new Elysia({ name: 'dompis-organization-move' }).use(createPermissionGuard(db))
		.get('/api/admin/organization/nodes', async ({ authorization, query, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!db) { set.status = 503; return { error: 'organization_unavailable' as const }; }
			if (!authorization.globalScope) { set.status = 403; return { error: 'global_scope_required' as const }; }
			const [actor] = await db.select({ active: schema.users.active, globalScope: schema.users.globalScope, roleCode: schema.roles.code, roleActive: schema.roles.active })
				.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(eq(schema.users.id, authorization.userId)).limit(1);
			if (actor?.active !== true || actor.roleActive !== true || actor.roleCode !== 'superadmin' || actor.globalScope !== true) { set.status = 403; return { error: 'forbidden' as const }; }
			const pattern = query.search?.trim() ? escapePrefix(query.search.trim()) : undefined;
			const limit = query.limit ?? 50;
			const after = query.after;
			const nodes = query.level === 'area'
				? await db.select({ id: schema.areas.id, code: schema.areas.code, name: schema.areas.name, parentId: sql<string | null>`NULL` })
					.from(schema.areas).where(and(eq(schema.areas.active, true), after ? gt(schema.areas.id, after) : undefined,
						pattern ? or(ilike(schema.areas.code, pattern), ilike(schema.areas.name, pattern)) : undefined)).orderBy(asc(schema.areas.id)).limit(limit + 1)
				: query.level === 'region'
					? await db.select({ id: schema.regions.id, code: schema.regions.code, name: schema.regions.name, parentId: schema.areas.id }).from(schema.regions)
						.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id)).where(and(eq(schema.regions.active, true), eq(schema.areas.active, true),
							after ? gt(schema.regions.id, after) : undefined, pattern ? or(ilike(schema.regions.code, pattern), ilike(schema.regions.name, pattern)) : undefined)).orderBy(asc(schema.regions.id)).limit(limit + 1)
					: query.level === 'branch'
						? await db.select({ id: schema.branches.id, code: schema.branches.code, name: schema.branches.name, parentId: schema.regions.id }).from(schema.branches)
							.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
							.where(and(eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true), after ? gt(schema.branches.id, after) : undefined,
								pattern ? or(ilike(schema.branches.code, pattern), ilike(schema.branches.name, pattern)) : undefined)).orderBy(asc(schema.branches.id)).limit(limit + 1)
						: query.level === 'service_area'
							? await db.select({ id: schema.serviceAreas.id, code: schema.serviceAreas.code, name: schema.serviceAreas.name, parentId: schema.branches.id }).from(schema.serviceAreas)
								.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id)).innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
								.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id)).where(and(eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true),
									after ? gt(schema.serviceAreas.id, after) : undefined, pattern ? or(ilike(schema.serviceAreas.code, pattern), ilike(schema.serviceAreas.name, pattern)) : undefined)).orderBy(asc(schema.serviceAreas.id)).limit(limit + 1)
							: await db.select({ id: schema.workzones.id, code: schema.workzones.code, name: schema.workzones.name, parentId: schema.serviceAreas.id }).from(schema.workzones)
								.innerJoin(schema.serviceAreas, eq(schema.workzones.serviceAreaId, schema.serviceAreas.id)).innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
								.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
								.where(and(eq(schema.workzones.active, true), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true),
									after ? gt(schema.workzones.id, after) : undefined, pattern ? or(ilike(schema.workzones.code, pattern), ilike(schema.workzones.name, pattern)) : undefined)).orderBy(asc(schema.workzones.id)).limit(limit + 1);
			const hasMore = nodes.length > limit;
			const page = nodes.slice(0, limit);
			return { nodes: page, nextCursor: hasMore ? page.at(-1)?.id ?? null : null };
		}, {
			query: t.Object({ level: anyLevelSchema, search: t.Optional(t.String({ minLength: 1, maxLength: 80 })), after: t.Optional(t.String({ format: 'uuid' })),
				limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 })) }), requirePermission: 'organization.read',
			response: { 200: t.Object({ nodes: t.Array(t.Object({ id: t.String(), code: t.String(), name: t.String(), parentId: t.Nullable(t.String()) })), nextCursor: t.Nullable(t.String()) }),
				400: errorSchema, 401: errorSchema, 403: errorSchema, 422: invalidRequest, 500: errorSchema, 503: errorSchema }
		})
		.get('/api/admin/organization/move-impact', async ({ authorization, query, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!db) { set.status = 503; return { error: 'organization_unavailable' as const }; }
			if (!authorization.globalScope) { set.status = 403; return { error: 'global_scope_required' as const }; }
			const [actor] = await db.select({ active: schema.users.active, globalScope: schema.users.globalScope, roleCode: schema.roles.code, roleActive: schema.roles.active })
				.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(eq(schema.users.id, authorization.userId)).limit(1);
			if (actor?.active !== true || actor.roleActive !== true || actor.roleCode !== 'superadmin' || actor.globalScope !== true) { set.status = 403; return { error: 'forbidden' as const }; }
			const node = await nodeState(db, query.level, query.id);
			if (!node) { set.status = 404; return { error: 'active_node_not_found' as const }; }
			if (node.oldParentId === query.newParentId) { set.status = 400; return { error: 'organization_parent_unchanged' as const }; }
			const matches = await affectedMatches(db, query.level, query.id, node.oldParentId, query.newParentId);
			if (!matches) { set.status = 404; return { error: 'active_parent_not_found' as const }; }
			const impact = await impactFingerprint(db, matches);
			const token = seal({ actorId: authorization.userId, level: query.level, nodeId: query.id, oldParentId: node.oldParentId,
				newParentId: query.newParentId, count: impact.count, fingerprint: impact.fingerprint, expiresAt: Date.now() + 5 * 60_000 });
			const users = await db.select({ id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName, roleCode: schema.roles.code })
				.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(and(eq(schema.users.active, true), eq(schema.roles.active, true), impact.ids.length ? inArray(schema.users.id, impact.ids) : eq(schema.users.id, '00000000-0000-0000-0000-000000000000'),
					query.after ? gt(schema.users.id, query.after) : undefined))
				.orderBy(asc(schema.users.id)).limit(51);
			return { node: { id: query.id, level: query.level, code: node.code }, oldParentId: node.oldParentId, newParentId: query.newParentId,
				summary: { affectedUsers: impact.count }, users: users.slice(0, 50).map(({ id, username, displayName, roleCode }) => ({ id, username, displayName, roleCode })),
				nextCursor: users.length > 50 ? users[49]?.id ?? null : null, previewToken: token };
		}, {
			query: t.Object({ level: levelSchema, id: t.String({ format: 'uuid' }), newParentId: t.String({ format: 'uuid' }), after: t.Optional(t.String({ format: 'uuid' })) }),
			requirePermission: 'organization.manage',
			response: { 200: t.Object({ node: t.Object({ id: t.String(), level: levelSchema, code: t.String() }), oldParentId: t.String(), newParentId: t.String(),
				summary: t.Object({ affectedUsers: t.Number() }), users: t.Array(t.Object({ id: t.String(), username: t.String(), displayName: t.String(), roleCode: t.String() })),
				nextCursor: t.Nullable(t.String()), previewToken: t.String() }), 400: errorSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema, 422: invalidRequest, 500: errorSchema, 503: errorSchema }
		})
		.patch('/api/admin/organization/move', async ({ authorization, body, cookie, request, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			const security = validateMutationSecurity(request, cookie[csrfCookie]?.value, appOrigin);
			if (security !== 'allowed') { set.status = 403; return { error: security === 'origin_rejected' ? 'request_origin_rejected' as const : 'csrf_rejected' as const }; }
			if (!db) { set.status = 503; return { error: 'organization_unavailable' as const }; }
			if (!authorization.globalScope) { set.status = 403; return { error: 'global_scope_required' as const }; }
			const claims = open(body.previewToken, authorization.userId, body.level, body.id, body.newParentId);
			if (!claims) { set.status = 409; return { error: 'preview_expired_or_invalid' as const }; }
			const [actor] = await db.select({ passwordHash: schema.users.passwordHash }).from(schema.users)
				.where(and(eq(schema.users.id, authorization.userId), eq(schema.users.active, true))).limit(1);
			if (!actor || !(await Bun.password.verify(body.currentPassword, actor.passwordHash))) { set.status = 403; return { error: 'reauthentication_required' as const }; }
			try {
				const outcome = await db.transaction(async (tx) => {
					await tx.execute(sql`LOCK TABLE ${schema.users} IN SHARE ROW EXCLUSIVE MODE`);
					const [currentActor] = await tx.select({ active: schema.users.active, globalScope: schema.users.globalScope, roleCode: schema.roles.code, roleActive: schema.roles.active })
						.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(eq(schema.users.id, authorization.userId)).limit(1);
					const grant = await tx.select({ id: schema.rolePermissions.id }).from(schema.rolePermissions)
						.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id)).innerJoin(schema.roles, eq(schema.rolePermissions.roleId, schema.roles.id))
						.where(and(eq(schema.roles.code, 'superadmin'), eq(schema.permissions.code, 'organization.manage'))).limit(1);
					if (currentActor?.active !== true || currentActor.roleActive !== true || currentActor.globalScope !== true || currentActor.roleCode !== 'superadmin' || !grant.length) throw new Error('actor_authorization_changed');
					const node = await nodeState(tx, body.level, body.id);
					if (!node || node.oldParentId !== claims.oldParentId) throw new Error('node_changed');
					if (node.oldParentId === body.newParentId) throw new Error('parent_unchanged');
					const matches = await affectedMatches(tx, body.level, body.id, node.oldParentId, body.newParentId);
					if (!matches) throw new Error('active_parent_not_found');
					const impact = await impactFingerprint(tx, matches);
					if (impact.count !== claims.count || impact.fingerprint !== claims.fingerprint) throw new Error('impact_changed');
					let changedRows: Array<{ id: string }>;
					if (body.level === 'region') changedRows = await tx.update(schema.regions).set({ areaId: body.newParentId, updatedAt: new Date() }).where(eq(schema.regions.id, body.id)).returning({ id: schema.regions.id });
					else if (body.level === 'branch') changedRows = await tx.update(schema.branches).set({ regionId: body.newParentId, updatedAt: new Date() }).where(eq(schema.branches.id, body.id)).returning({ id: schema.branches.id });
					else if (body.level === 'service_area') changedRows = await tx.update(schema.serviceAreas).set({ branchId: body.newParentId, updatedAt: new Date() }).where(eq(schema.serviceAreas.id, body.id)).returning({ id: schema.serviceAreas.id });
					else changedRows = await tx.update(schema.workzones).set({ serviceAreaId: body.newParentId, updatedAt: new Date() }).where(eq(schema.workzones.id, body.id)).returning({ id: schema.workzones.id });
					if (!changedRows.length) throw new Error('node_changed');
					if (impact.ids.length) {
						const now = new Date();
						await tx.update(schema.users).set({ scopeVersion: sql`${schema.users.scopeVersion} + 1`, updatedAt: now }).where(inArray(schema.users.id, impact.ids));
						await tx.update(schema.sessions).set({ revokedAt: now }).where(and(inArray(schema.sessions.userId, impact.ids), sql`${schema.sessions.revokedAt} IS NULL`, gt(schema.sessions.expiresAt, now)));
					}
					const requestId = set.headers['x-request-id'];
					await appendAuditEvent(tx, { actorId: authorization.userId, action: 'organization.node_moved', targetId: body.id,
						requestId: typeof requestId === 'string' ? requestId : 'unknown', metadata: { level: body.level, code: node.code,
							oldParentId: node.oldParentId, newParentId: body.newParentId, affectedUsers: impact.ids.length } });
					return { status: 'moved' as const, affectedUsers: impact.ids.length };
				});
				return outcome;
			} catch (error: unknown) {
				if (error instanceof Error && error.message === 'actor_authorization_changed') { set.status = 403; return { error: 'forbidden' as const }; }
				if (error instanceof Error && error.message === 'active_parent_not_found') { set.status = 404; return { error: 'active_parent_not_found' as const }; }
				if (error instanceof Error && error.message === 'impact_changed') { set.status = 409; return { error: 'impact_changed_refresh_preview' as const }; }
				if (error instanceof Error && error.message === 'node_changed') { set.status = 409; return { error: 'organization_node_changed' as const }; }
				if (error instanceof Error && error.message === 'parent_unchanged') { set.status = 400; return { error: 'organization_parent_unchanged' as const }; }
				if (constraintName(error)?.endsWith('_code_unique')) { set.status = 409; return { error: 'organization_code_conflict_at_destination' as const }; }
				throw error;
			}
		}, {
			body: t.Object({ level: levelSchema, id: t.String({ format: 'uuid' }), newParentId: t.String({ format: 'uuid' }),
				previewToken: t.String({ minLength: 20, maxLength: 2048 }), currentPassword: t.String({ minLength: 1, maxLength: 1024 }) }),
			cookie: t.Cookie({ [csrfCookie]: t.Optional(t.String()) }), requirePermission: 'organization.manage',
			response: { 200: t.Object({ status: t.Literal('moved'), affectedUsers: t.Number() }), 400: errorSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema,
				409: errorSchema, 422: invalidRequest, 500: errorSchema, 503: errorSchema }
		});
}
