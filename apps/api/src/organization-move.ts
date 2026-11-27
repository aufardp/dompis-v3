import { and, asc, eq, gt, ilike, inArray, or, sql } from 'drizzle-orm';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Elysia, t } from 'elysia';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { appendAuditEvent, database, schema } from '@dompis/db';
import { validateMutationSecurity } from './auth';
import { createPermissionGuard } from './permission-guard';

type OrganizationMoveDatabase = NonNullable<typeof database>;
type OrganizationLevel = 'area' | 'region' | 'branch' | 'service_area' | 'workzone';
type MovableOrganizationLevel = Exclude<OrganizationLevel, 'area'>;
type OrganizationHierarchyPath = Partial<Record<OrganizationLevel, string>>;
type OrganizationScopeMatch = { level: OrganizationLevel; id: string; predicate: ReturnType<typeof sql<boolean>> };
type OrganizationMovePreviewClaims = { actorId: string; level: MovableOrganizationLevel; nodeId: string; oldParentId: string; newParentId: string; affectedUserCount: number; fingerprint: string; expiresAt: number };
const csrfCookieName = '__Host-dompis_csrf';
const previewTokenSigningKey = randomBytes(32);
const movableOrganizationLevelSchema = t.Union([t.Literal('region'), t.Literal('branch'), t.Literal('service_area'), t.Literal('workzone')]);
const organizationLevelSchema = t.Union([t.Literal('area'), movableOrganizationLevelSchema]);
const apiErrorResponseSchema = t.Object({ error: t.String() });
const invalidRequestResponseSchema = t.Object({ error: t.Literal('invalid_request'), requestId: t.String() });

function hasUserScopeGrant(scopeGrantColumn: AnyPgColumn, targetOrganizationId: string) {
	return sql<boolean>`EXISTS (SELECT 1 FROM ${schema.userScopes} WHERE ${schema.userScopes.userId}=${schema.users.id} AND ${scopeGrantColumn}=${targetOrganizationId})`;
}
function createSignedOrganizationMovePreviewToken(previewClaims: OrganizationMovePreviewClaims): string {
	const encodedPreviewClaims = Buffer.from(JSON.stringify(previewClaims)).toString('base64url');
	return `${encodedPreviewClaims}.${createHmac('sha256', previewTokenSigningKey).update(encodedPreviewClaims).digest('base64url')}`;
}
function verifyOrganizationMovePreviewToken(signedPreviewToken: string, actorId: string, level: MovableOrganizationLevel, nodeId: string, newParentId: string): OrganizationMovePreviewClaims | null {
	const [encodedPreviewClaims, encodedSignature, unexpectedTokenPart] = signedPreviewToken.split('.');
	if (!encodedPreviewClaims || !encodedSignature || unexpectedTokenPart !== undefined) return null;
	const expectedSignature = createHmac('sha256', previewTokenSigningKey).update(encodedPreviewClaims).digest();
	const actualSignature = Buffer.from(encodedSignature, 'base64url');
	if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null;
	try {
		const previewClaims = JSON.parse(Buffer.from(encodedPreviewClaims, 'base64url').toString('utf8')) as OrganizationMovePreviewClaims;
		return previewClaims.actorId === actorId && previewClaims.level === level && previewClaims.nodeId === nodeId && previewClaims.newParentId === newParentId &&
			previewClaims.expiresAt > Date.now() && Number.isSafeInteger(previewClaims.affectedUserCount) && typeof previewClaims.fingerprint === 'string' ? previewClaims : null;
	} catch { return null; }
}
function getDatabaseConstraintName(databaseError: unknown): string | undefined {
	let currentErrorCause: unknown = databaseError;
	for (let causeDepth = 0; causeDepth < 3; causeDepth += 1) {
		if (!currentErrorCause || typeof currentErrorCause !== 'object') return undefined;
		if ('constraint' in currentErrorCause && typeof currentErrorCause.constraint === 'string') return currentErrorCause.constraint;
		currentErrorCause = 'cause' in currentErrorCause ? currentErrorCause.cause : undefined;
	}
	return undefined;
}
function escapeLikeSearchPrefix(searchText: string): string { return `${searchText.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; }

async function loadActiveParentPath(databaseConnection: OrganizationMoveDatabase, level: MovableOrganizationLevel, parentId: string): Promise<OrganizationHierarchyPath | null> {
	if (level === 'region') {
		const [row] = await databaseConnection.select({ id: schema.areas.id }).from(schema.areas).where(and(eq(schema.areas.id, parentId), eq(schema.areas.active, true))).limit(1);
		return row ? { area: row.id } : null;
	}
	if (level === 'branch') {
		const [row] = await databaseConnection.select({ regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.regions)
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.regions.id, parentId), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { area: row.areaId, region: row.regionId } : null;
	}
	if (level === 'service_area') {
		const [row] = await databaseConnection.select({ branchId: schema.branches.id, regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.branches)
			.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.branches.id, parentId), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { area: row.areaId, region: row.regionId, branch: row.branchId } : null;
	}
	const [row] = await databaseConnection.select({ serviceAreaId: schema.serviceAreas.id, branchId: schema.branches.id, regionId: schema.regions.id, areaId: schema.areas.id })
		.from(schema.serviceAreas).innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
		.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
		.where(and(eq(schema.serviceAreas.id, parentId), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
	return row ? { area: row.areaId, region: row.regionId, branch: row.branchId, service_area: row.serviceAreaId } : null;
}

async function loadActiveOrganizationNodeState(databaseConnection: OrganizationMoveDatabase, level: MovableOrganizationLevel, nodeId: string): Promise<{ oldParentId: string; code: string; path: OrganizationHierarchyPath } | null> {
	if (level === 'region') {
		const [row] = await databaseConnection.select({ id: schema.regions.id, oldParentId: schema.regions.areaId, code: schema.regions.code, areaActive: schema.areas.active })
			.from(schema.regions).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.regions.id, nodeId), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { oldParentId: row.oldParentId, code: row.code, path: { area: row.oldParentId, region: row.id } } : null;
	}
	if (level === 'branch') {
		const [row] = await databaseConnection.select({ id: schema.branches.id, oldParentId: schema.branches.regionId, code: schema.branches.code,
			areaId: schema.areas.id }).from(schema.branches).innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.branches.id, nodeId), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { oldParentId: row.oldParentId, code: row.code, path: { area: row.areaId, region: row.oldParentId, branch: row.id } } : null;
	}
	if (level === 'service_area') {
		const [row] = await databaseConnection.select({ id: schema.serviceAreas.id, oldParentId: schema.serviceAreas.branchId, code: schema.serviceAreas.code,
			regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.serviceAreas)
			.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id)).innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.serviceAreas.id, nodeId), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return row ? { oldParentId: row.oldParentId, code: row.code, path: { area: row.areaId, region: row.regionId, branch: row.oldParentId, service_area: row.id } } : null;
	}
	const [row] = await databaseConnection.select({ id: schema.workzones.id, oldParentId: schema.workzones.serviceAreaId, code: schema.workzones.code,
		branchId: schema.branches.id, regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.workzones)
		.innerJoin(schema.serviceAreas, eq(schema.workzones.serviceAreaId, schema.serviceAreas.id)).innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
		.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
		.where(and(eq(schema.workzones.id, nodeId), eq(schema.workzones.active, true), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
	return row ? { oldParentId: row.oldParentId, code: row.code,
		path: { area: row.areaId, region: row.regionId, branch: row.branchId, service_area: row.oldParentId, workzone: row.id } } : null;
}


async function loadSubtreeScopeMatches(databaseConnection: OrganizationMoveDatabase, level: MovableOrganizationLevel, nodeId: string): Promise<OrganizationScopeMatch[]> {
	const descendantIdsByOrganizationLevel: Record<OrganizationLevel, string[]> = { area: [], region: [], branch: [], service_area: [], workzone: [] };
	descendantIdsByOrganizationLevel[level].push(nodeId);
	if (level === 'region') descendantIdsByOrganizationLevel.branch = (await databaseConnection.select({ id: schema.branches.id }).from(schema.branches).where(eq(schema.branches.regionId, nodeId))).map((branchRecord) => branchRecord.id);
	if (level === 'region' || level === 'branch') {
		const descendantBranchIds = level === 'branch' ? [nodeId] : descendantIdsByOrganizationLevel.branch;
		if (descendantBranchIds.length) descendantIdsByOrganizationLevel.service_area = (await databaseConnection.select({ id: schema.serviceAreas.id }).from(schema.serviceAreas).where(inArray(schema.serviceAreas.branchId, descendantBranchIds))).map((serviceAreaRecord) => serviceAreaRecord.id);
	}
	if (level !== 'workzone') {
		const descendantServiceAreaIds = level === 'service_area' ? [nodeId] : descendantIdsByOrganizationLevel.service_area;
		if (descendantServiceAreaIds.length) descendantIdsByOrganizationLevel.workzone = (await databaseConnection.select({ id: schema.workzones.id }).from(schema.workzones).where(inArray(schema.workzones.serviceAreaId, descendantServiceAreaIds))).map((workzoneRecord) => workzoneRecord.id);
	}
	const scopeMatches: OrganizationScopeMatch[] = [];
	const scopeGrantColumnsByOrganizationLevel: Record<OrganizationLevel, AnyPgColumn> = { area: schema.userScopes.areaId, region: schema.userScopes.regionId, branch: schema.userScopes.branchId,
		service_area: schema.userScopes.serviceAreaId, workzone: schema.userScopes.workzoneId };
	for (const descendantLevel of ['region', 'branch', 'service_area', 'workzone'] as const) {
		for (const descendantOrganizationId of descendantIdsByOrganizationLevel[descendantLevel]) {
			scopeMatches.push({ level: descendantLevel, id: descendantOrganizationId,
				predicate: hasUserScopeGrant(scopeGrantColumnsByOrganizationLevel[descendantLevel], descendantOrganizationId) });
		}
	}
	return scopeMatches;
}

async function loadAffectedOrganizationScopeMatches(databaseConnection: OrganizationMoveDatabase, level: MovableOrganizationLevel, nodeId: string, oldParentId: string, newParentId: string): Promise<OrganizationScopeMatch[] | null> {
	const oldParentHierarchyPath = await loadActiveParentPath(databaseConnection, level, oldParentId);
	const newParentHierarchyPath = await loadActiveParentPath(databaseConnection, level, newParentId);
	const subtreeScopeMatches = await loadSubtreeScopeMatches(databaseConnection, level, nodeId);
	if (!oldParentHierarchyPath || !newParentHierarchyPath) return null;
	const uniqueScopeMatchesByKey = new Map<string, OrganizationScopeMatch>();
	for (const [path, prefix] of [[oldParentHierarchyPath, 'old'], [newParentHierarchyPath, 'new']] as const) {
		for (const [scopeLevel, id] of Object.entries(path) as Array<[OrganizationLevel, string]>) {
			const column = scopeLevel === 'area' ? schema.userScopes.areaId : scopeLevel === 'region' ? schema.userScopes.regionId
				: scopeLevel === 'branch' ? schema.userScopes.branchId : scopeLevel === 'service_area' ? schema.userScopes.serviceAreaId : schema.userScopes.workzoneId;
			uniqueScopeMatchesByKey.set(`${prefix}:${scopeLevel}:${id}`, { level: scopeLevel, id, predicate: hasUserScopeGrant(column, id) });
		}
	}
	for (const scopeMatch of subtreeScopeMatches) uniqueScopeMatchesByKey.set(`subtree:${scopeMatch.level}:${scopeMatch.id}`, scopeMatch);
	return [...uniqueScopeMatchesByKey.values()];
}

async function calculateAffectedUserFingerprint(databaseConnection: OrganizationMoveDatabase, affectedScopeMatches: readonly OrganizationScopeMatch[]) {
	const anyScopeGrantPredicate = affectedScopeMatches.length ? or(...affectedScopeMatches.map((scopeMatch) => scopeMatch.predicate)) : undefined;
	const predicate = anyScopeGrantPredicate ? or(eq(schema.users.globalScope, true), anyScopeGrantPredicate) : eq(schema.users.globalScope, true);
	const active = and(eq(schema.users.active, true), eq(schema.roles.active, true), predicate);
	const affectedUserRows = await databaseConnection.select({ id: schema.users.id }).from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
		.where(active).orderBy(asc(schema.users.id));
	const affectedUserIds = affectedUserRows.map((affectedUserRow) => affectedUserRow.id);
	return { affectedUserCount: affectedUserIds.length, fingerprint: createHash('sha256').update(affectedUserIds.join(',')).digest('hex'), affectedUserIds };
}

export function createOrganizationMoveRoutes(databaseConnection: OrganizationMoveDatabase | undefined, appOrigin?: string) {
	return new Elysia({ name: 'dompis-organization-move' }).use(createPermissionGuard(databaseConnection))
		.get('/api/admin/organization/nodes', async ({ authorization, query, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!databaseConnection) { set.status = 503; return { error: 'organization_unavailable' as const }; }
			if (!authorization.globalScope) { set.status = 403; return { error: 'global_scope_required' as const }; }
			const [actingUserAccount] = await databaseConnection.select({ active: schema.users.active, globalScope: schema.users.globalScope, roleCode: schema.roles.code, roleActive: schema.roles.active })
				.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(eq(schema.users.id, authorization.userId)).limit(1);
			if (actingUserAccount?.active !== true || actingUserAccount.roleActive !== true || actingUserAccount.roleCode !== 'superadmin' || actingUserAccount.globalScope !== true) { set.status = 403; return { error: 'forbidden' as const }; }
			const escapedSearchPattern = query.search?.trim() ? escapeLikeSearchPrefix(query.search.trim()) : undefined;
			const pageSize = query.limit ?? 50;
			const cursorAfterOrganizationId = query.after;
			const organizationNodes = query.level === 'area'
				? await databaseConnection.select({ id: schema.areas.id, code: schema.areas.code, name: schema.areas.name, parentId: sql<string | null>`NULL` })
					.from(schema.areas).where(and(eq(schema.areas.active, true), cursorAfterOrganizationId ? gt(schema.areas.id, cursorAfterOrganizationId) : undefined,
						escapedSearchPattern ? or(ilike(schema.areas.code, escapedSearchPattern), ilike(schema.areas.name, escapedSearchPattern)) : undefined)).orderBy(asc(schema.areas.id)).limit(pageSize + 1)
				: query.level === 'region'
					? await databaseConnection.select({ id: schema.regions.id, code: schema.regions.code, name: schema.regions.name, parentId: schema.areas.id }).from(schema.regions)
						.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id)).where(and(eq(schema.regions.active, true), eq(schema.areas.active, true),
							cursorAfterOrganizationId ? gt(schema.regions.id, cursorAfterOrganizationId) : undefined, escapedSearchPattern ? or(ilike(schema.regions.code, escapedSearchPattern), ilike(schema.regions.name, escapedSearchPattern)) : undefined)).orderBy(asc(schema.regions.id)).limit(pageSize + 1)
					: query.level === 'branch'
						? await databaseConnection.select({ id: schema.branches.id, code: schema.branches.code, name: schema.branches.name, parentId: schema.regions.id }).from(schema.branches)
							.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
							.where(and(eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true), cursorAfterOrganizationId ? gt(schema.branches.id, cursorAfterOrganizationId) : undefined,
								escapedSearchPattern ? or(ilike(schema.branches.code, escapedSearchPattern), ilike(schema.branches.name, escapedSearchPattern)) : undefined)).orderBy(asc(schema.branches.id)).limit(pageSize + 1)
						: query.level === 'service_area'
							? await databaseConnection.select({ id: schema.serviceAreas.id, code: schema.serviceAreas.code, name: schema.serviceAreas.name, parentId: schema.branches.id }).from(schema.serviceAreas)
								.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id)).innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
								.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id)).where(and(eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true),
									cursorAfterOrganizationId ? gt(schema.serviceAreas.id, cursorAfterOrganizationId) : undefined, escapedSearchPattern ? or(ilike(schema.serviceAreas.code, escapedSearchPattern), ilike(schema.serviceAreas.name, escapedSearchPattern)) : undefined)).orderBy(asc(schema.serviceAreas.id)).limit(pageSize + 1)
							: await databaseConnection.select({ id: schema.workzones.id, code: schema.workzones.code, name: schema.workzones.name, parentId: schema.serviceAreas.id }).from(schema.workzones)
								.innerJoin(schema.serviceAreas, eq(schema.workzones.serviceAreaId, schema.serviceAreas.id)).innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
								.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id)).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
								.where(and(eq(schema.workzones.active, true), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true),
									cursorAfterOrganizationId ? gt(schema.workzones.id, cursorAfterOrganizationId) : undefined, escapedSearchPattern ? or(ilike(schema.workzones.code, escapedSearchPattern), ilike(schema.workzones.name, escapedSearchPattern)) : undefined)).orderBy(asc(schema.workzones.id)).limit(pageSize + 1);
			const hasMoreOrganizationNodes = organizationNodes.length > pageSize;
			const organizationNodePage = organizationNodes.slice(0, pageSize);
			return { nodes: organizationNodePage, nextCursor: hasMoreOrganizationNodes ? organizationNodePage.at(-1)?.id ?? null : null };
		}, {
			query: t.Object({ level: organizationLevelSchema, search: t.Optional(t.String({ minLength: 1, maxLength: 80 })), after: t.Optional(t.String({ format: 'uuid' })),
				limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 })) }), requirePermission: 'organization.read',
			response: { 200: t.Object({ nodes: t.Array(t.Object({ id: t.String(), code: t.String(), name: t.String(), parentId: t.Nullable(t.String()) })), nextCursor: t.Nullable(t.String()) }),
				400: apiErrorResponseSchema, 401: apiErrorResponseSchema, 403: apiErrorResponseSchema, 422: invalidRequestResponseSchema, 500: apiErrorResponseSchema, 503: apiErrorResponseSchema }
		})
		.get('/api/admin/organization/move-impact', async ({ authorization, query, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!databaseConnection) { set.status = 503; return { error: 'organization_unavailable' as const }; }
			if (!authorization.globalScope) { set.status = 403; return { error: 'global_scope_required' as const }; }
			const [actor] = await databaseConnection.select({ active: schema.users.active, globalScope: schema.users.globalScope, roleCode: schema.roles.code, roleActive: schema.roles.active })
				.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(eq(schema.users.id, authorization.userId)).limit(1);
			if (actor?.active !== true || actor.roleActive !== true || actor.roleCode !== 'superadmin' || actor.globalScope !== true) { set.status = 403; return { error: 'forbidden' as const }; }
			const node = await loadActiveOrganizationNodeState(databaseConnection, query.level, query.id);
			if (!node) { set.status = 404; return { error: 'active_node_not_found' as const }; }
			if (node.oldParentId === query.newParentId) { set.status = 400; return { error: 'organization_parent_unchanged' as const }; }
			const matches = await loadAffectedOrganizationScopeMatches(databaseConnection, query.level, query.id, node.oldParentId, query.newParentId);
			if (!matches) { set.status = 404; return { error: 'active_parent_not_found' as const }; }
			const affectedUserImpact = await calculateAffectedUserFingerprint(databaseConnection, matches);
			const token = createSignedOrganizationMovePreviewToken({ actorId: authorization.userId, level: query.level, nodeId: query.id, oldParentId: node.oldParentId,
				newParentId: query.newParentId, affectedUserCount: affectedUserImpact.affectedUserCount, fingerprint: affectedUserImpact.fingerprint, expiresAt: Date.now() + 5 * 60_000 });
			const users = await databaseConnection.select({ id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName, roleCode: schema.roles.code })
				.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(and(eq(schema.users.active, true), eq(schema.roles.active, true), affectedUserImpact.affectedUserIds.length ? inArray(schema.users.id, affectedUserImpact.affectedUserIds) : eq(schema.users.id, '00000000-0000-0000-0000-000000000000'),
					query.after ? gt(schema.users.id, query.after) : undefined))
				.orderBy(asc(schema.users.id)).limit(51);
			return { node: { id: query.id, level: query.level, code: node.code }, oldParentId: node.oldParentId, newParentId: query.newParentId,
				summary: { affectedUsers: affectedUserImpact.affectedUserCount }, users: users.slice(0, 50).map(({ id, username, displayName, roleCode }) => ({ id, username, displayName, roleCode })),
				nextCursor: users.length > 50 ? users[49]?.id ?? null : null, previewToken: token };
		}, {
			query: t.Object({ level: movableOrganizationLevelSchema, id: t.String({ format: 'uuid' }), newParentId: t.String({ format: 'uuid' }), after: t.Optional(t.String({ format: 'uuid' })) }),
			requirePermission: 'organization.manage',
			response: { 200: t.Object({ node: t.Object({ id: t.String(), level: movableOrganizationLevelSchema, code: t.String() }), oldParentId: t.String(), newParentId: t.String(),
				summary: t.Object({ affectedUsers: t.Number() }), users: t.Array(t.Object({ id: t.String(), username: t.String(), displayName: t.String(), roleCode: t.String() })),
				nextCursor: t.Nullable(t.String()), previewToken: t.String() }), 400: apiErrorResponseSchema, 401: apiErrorResponseSchema, 403: apiErrorResponseSchema, 404: apiErrorResponseSchema, 422: invalidRequestResponseSchema, 500: apiErrorResponseSchema, 503: apiErrorResponseSchema }
		})
		.patch('/api/admin/organization/move', async ({ authorization, body, cookie, request, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			const security = validateMutationSecurity(request, cookie[csrfCookieName]?.value, appOrigin);
			if (security !== 'allowed') { set.status = 403; return { error: security === 'origin_rejected' ? 'request_origin_rejected' as const : 'csrf_rejected' as const }; }
			if (!databaseConnection) { set.status = 503; return { error: 'organization_unavailable' as const }; }
			if (!authorization.globalScope) { set.status = 403; return { error: 'global_scope_required' as const }; }
			const claims = verifyOrganizationMovePreviewToken(body.previewToken, authorization.userId, body.level, body.id, body.newParentId);
			if (!claims) { set.status = 409; return { error: 'preview_expired_or_invalid' as const }; }
			const [actor] = await databaseConnection.select({ passwordHash: schema.users.passwordHash }).from(schema.users)
				.where(and(eq(schema.users.id, authorization.userId), eq(schema.users.active, true))).limit(1);
			if (!actor || !(await Bun.password.verify(body.currentPassword, actor.passwordHash))) { set.status = 403; return { error: 'reauthentication_required' as const }; }
			try {
				const outcome = await databaseConnection.transaction(async (databaseTransaction) => {
					await databaseTransaction.execute(sql`LOCK TABLE ${schema.users} IN SHARE ROW EXCLUSIVE MODE`);
					const [currentActor] = await databaseTransaction.select({ active: schema.users.active, globalScope: schema.users.globalScope, roleCode: schema.roles.code, roleActive: schema.roles.active })
						.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(eq(schema.users.id, authorization.userId)).limit(1);
					const grant = await databaseTransaction.select({ id: schema.rolePermissions.id }).from(schema.rolePermissions)
						.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id)).innerJoin(schema.roles, eq(schema.rolePermissions.roleId, schema.roles.id))
						.where(and(eq(schema.roles.code, 'superadmin'), eq(schema.permissions.code, 'organization.manage'))).limit(1);
					if (currentActor?.active !== true || currentActor.roleActive !== true || currentActor.globalScope !== true || currentActor.roleCode !== 'superadmin' || !grant.length) throw new Error('actor_authorization_changed');
					const node = await loadActiveOrganizationNodeState(databaseTransaction, body.level, body.id);
					if (!node || node.oldParentId !== claims.oldParentId) throw new Error('node_changed');
					if (node.oldParentId === body.newParentId) throw new Error('parent_unchanged');
					const matches = await loadAffectedOrganizationScopeMatches(databaseTransaction, body.level, body.id, node.oldParentId, body.newParentId);
					if (!matches) throw new Error('active_parent_not_found');
					const impact = await calculateAffectedUserFingerprint(databaseTransaction, matches);
					if (impact.affectedUserCount !== claims.affectedUserCount || impact.fingerprint !== claims.fingerprint) throw new Error('impact_changed');
					let changedRows: Array<{ id: string }>;
					if (body.level === 'region') changedRows = await databaseTransaction.update(schema.regions).set({ areaId: body.newParentId, updatedAt: new Date() }).where(eq(schema.regions.id, body.id)).returning({ id: schema.regions.id });
					else if (body.level === 'branch') changedRows = await databaseTransaction.update(schema.branches).set({ regionId: body.newParentId, updatedAt: new Date() }).where(eq(schema.branches.id, body.id)).returning({ id: schema.branches.id });
					else if (body.level === 'service_area') changedRows = await databaseTransaction.update(schema.serviceAreas).set({ branchId: body.newParentId, updatedAt: new Date() }).where(eq(schema.serviceAreas.id, body.id)).returning({ id: schema.serviceAreas.id });
					else changedRows = await databaseTransaction.update(schema.workzones).set({ serviceAreaId: body.newParentId, updatedAt: new Date() }).where(eq(schema.workzones.id, body.id)).returning({ id: schema.workzones.id });
					if (!changedRows.length) throw new Error('node_changed');
					if (impact.affectedUserIds.length) {
						const now = new Date();
						await databaseTransaction.update(schema.users).set({ scopeVersion: sql`${schema.users.scopeVersion} + 1`, updatedAt: now }).where(inArray(schema.users.id, impact.affectedUserIds));
						await databaseTransaction.update(schema.sessions).set({ revokedAt: now }).where(and(inArray(schema.sessions.userId, impact.affectedUserIds), sql`${schema.sessions.revokedAt} IS NULL`, gt(schema.sessions.expiresAt, now)));
					}
					const requestId = set.headers['x-request-id'];
					await appendAuditEvent(databaseTransaction, { actorId: authorization.userId, action: 'organization.node_moved', targetId: body.id,
						requestId: typeof requestId === 'string' ? requestId : 'unknown', metadata: { level: body.level, code: node.code,
							oldParentId: node.oldParentId, newParentId: body.newParentId, affectedUsers: impact.affectedUserIds.length } });
					return { status: 'moved' as const, affectedUsers: impact.affectedUserIds.length };
				});
				return outcome;
			} catch (error: unknown) {
				if (error instanceof Error && error.message === 'actor_authorization_changed') { set.status = 403; return { error: 'forbidden' as const }; }
				if (error instanceof Error && error.message === 'active_parent_not_found') { set.status = 404; return { error: 'active_parent_not_found' as const }; }
				if (error instanceof Error && error.message === 'impact_changed') { set.status = 409; return { error: 'impact_changed_refresh_preview' as const }; }
				if (error instanceof Error && error.message === 'node_changed') { set.status = 409; return { error: 'organization_node_changed' as const }; }
				if (error instanceof Error && error.message === 'parent_unchanged') { set.status = 400; return { error: 'organization_parent_unchanged' as const }; }
				if (getDatabaseConstraintName(error)?.endsWith('_code_unique')) { set.status = 409; return { error: 'organization_code_conflict_at_destination' as const }; }
				throw error;
			}
		}, {
			body: t.Object({ level: movableOrganizationLevelSchema, id: t.String({ format: 'uuid' }), newParentId: t.String({ format: 'uuid' }),
				previewToken: t.String({ minLength: 20, maxLength: 2048 }), currentPassword: t.String({ minLength: 1, maxLength: 1024 }) }),
			cookie: t.Cookie({ [csrfCookieName]: t.Optional(t.String()) }), requirePermission: 'organization.manage',
			response: { 200: t.Object({ status: t.Literal('moved'), affectedUsers: t.Number() }), 400: apiErrorResponseSchema, 401: apiErrorResponseSchema, 403: apiErrorResponseSchema, 404: apiErrorResponseSchema,
				409: apiErrorResponseSchema, 422: invalidRequestResponseSchema, 500: apiErrorResponseSchema, 503: apiErrorResponseSchema }
		});
}
