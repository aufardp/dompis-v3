import { and, asc, eq, gt, inArray, or, sql } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { appendAuditEvent, database, schema } from '@dompis/db';
import { validateMutationSecurity } from './auth';
import { createPermissionGuard } from './permission-guard';

type OrganizationDatabase = NonNullable<typeof database>;
type HierarchyLevel = 'area' | 'region' | 'branch' | 'service_area' | 'workzone';
type OrganizationParentNode = { id: string; level: HierarchyLevel; code: string; name: string };
type OrganizationHierarchyPath = Partial<Record<HierarchyLevel, string>>;
type OrganizationScopeMatch = { level: HierarchyLevel; predicate: ReturnType<typeof sql<boolean>> };
type OrganizationImpactTokenClaims = { actorId: string; level: HierarchyLevel; parentId: string | null; total: number; fingerprint: string; expiresAt: number };
const impactSigningKey = randomBytes(32);
const csrfCookie = '__Host-dompis_csrf';

const organizationLevelSchema = t.Union([
	t.Literal('area'), t.Literal('region'), t.Literal('branch'), t.Literal('service_area'), t.Literal('workzone')
]);
const apiErrorResponseSchema = t.Object({ error: t.String() });
const invalidRequestResponseSchema = t.Object({ error: t.Literal('invalid_request'), requestId: t.String() });

function hasUserScopeGrant(column: AnyPgColumn, targetId: string) {
	return sql<boolean>`EXISTS (
		SELECT 1 FROM ${schema.userScopes}
		WHERE ${schema.userScopes.userId} = ${schema.users.id}
		AND ${column} = ${targetId}
	)`;
}

function createSignedOrganizationImpactToken(claims: OrganizationImpactTokenClaims): string {
	const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
	const signature = createHmac('sha256', impactSigningKey).update(payload).digest('base64url');
	return `${payload}.${signature}`;
}

function verifyOrganizationImpactToken(token: string, actorId: string, level: HierarchyLevel, parentId: string | null): OrganizationImpactTokenClaims | null {
	const [payload, signature, extra] = token.split('.');
	if (!payload || !signature || extra !== undefined) return null;
	const expected = createHmac('sha256', impactSigningKey).update(payload).digest();
	let actual: Buffer;
	try { actual = Buffer.from(signature, 'base64url'); } catch { return null; }
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
	try {
		const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as OrganizationImpactTokenClaims;
		if (claims.actorId !== actorId || claims.level !== level || claims.parentId !== parentId ||
			!Number.isSafeInteger(claims.total) || typeof claims.fingerprint !== 'string' ||
			!Number.isSafeInteger(claims.expiresAt) || claims.expiresAt <= Date.now()) return null;
		return claims;
	} catch { return null; }
}

function getDatabaseConstraintName(error: unknown): string | undefined {
	let currentErrorCause: unknown = error;
	for (let errorCauseDepth = 0; errorCauseDepth < 3; errorCauseDepth += 1) {
		if (typeof currentErrorCause !== 'object' || currentErrorCause === null) return undefined;
		if ('constraint' in currentErrorCause && typeof currentErrorCause.constraint === 'string') return currentErrorCause.constraint;
		currentErrorCause = 'cause' in currentErrorCause ? currentErrorCause.cause : undefined;
	}
	return undefined;
}

async function loadActiveOrganizationParent(
	database: OrganizationDatabase,
	childLevel: HierarchyLevel,
	parentId: string | undefined
): Promise<{ parent: OrganizationParentNode | null; path: OrganizationHierarchyPath } | null> {
	if (childLevel === 'area') return parentId ? null : { parent: null, path: {} };
	if (!parentId) return null;

	if (childLevel === 'region') {
		const [area] = await database.select({ id: schema.areas.id, code: schema.areas.code, name: schema.areas.name })
			.from(schema.areas).where(and(eq(schema.areas.id, parentId), eq(schema.areas.active, true))).limit(1);
		return area ? { parent: { ...area, level: 'area' }, path: { area: area.id } } : null;
	}

	if (childLevel === 'branch') {
		const [region] = await database.select({ id: schema.regions.id, code: schema.regions.code, name: schema.regions.name,
			areaId: schema.areas.id }).from(schema.regions)
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.regions.id, parentId), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return region ? { parent: { id: region.id, level: 'region', code: region.code, name: region.name },
			path: { area: region.areaId, region: region.id } } : null;
	}

	if (childLevel === 'service_area') {
		const [branch] = await database.select({ id: schema.branches.id, code: schema.branches.code, name: schema.branches.name,
			regionId: schema.regions.id, areaId: schema.areas.id }).from(schema.branches)
			.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(eq(schema.branches.id, parentId), eq(schema.branches.active, true),
				eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
		return branch ? { parent: { id: branch.id, level: 'branch', code: branch.code, name: branch.name },
			path: { area: branch.areaId, region: branch.regionId, branch: branch.id } } : null;
	}

	const [serviceArea] = await database.select({ id: schema.serviceAreas.id, code: schema.serviceAreas.code,
		name: schema.serviceAreas.name, branchId: schema.branches.id, regionId: schema.regions.id, areaId: schema.areas.id
	}).from(schema.serviceAreas)
		.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
		.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
		.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
		.where(and(eq(schema.serviceAreas.id, parentId), eq(schema.serviceAreas.active, true),
			eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))).limit(1);
	return serviceArea ? { parent: { id: serviceArea.id, level: 'service_area', code: serviceArea.code, name: serviceArea.name },
		path: { area: serviceArea.areaId, region: serviceArea.regionId, branch: serviceArea.branchId, service_area: serviceArea.id } } : null;
}

export function createOrganizationImpactRoutes(database: OrganizationDatabase | undefined, appOrigin?: string) {
	return new Elysia({ name: 'dompis-organization-impact-preview' })
		.use(createPermissionGuard(database))
		.get('/api/admin/organization/child-impact', async ({ authorization, query, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!database) {
				set.status = 503;
				return { error: 'organization_unavailable' as const };
			}
			if (!authorization.globalScope) {
				set.status = 403;
				return { error: 'global_scope_required' as const };
			}
			const [actor] = await database.select({ active: schema.users.active, globalScope: schema.users.globalScope,
				roleCode: schema.roles.code, roleActive: schema.roles.active }).from(schema.users)
				.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(eq(schema.users.id, authorization.userId)).limit(1);
			if (actor?.active !== true || actor.roleActive !== true || actor.roleCode !== 'superadmin' || actor.globalScope !== true) {
				set.status = 403;
				return { error: 'forbidden' as const };
			}
			if ((query.level === 'area' && query.parentId) || (query.level !== 'area' && !query.parentId)) {
				set.status = 400;
				return { error: 'organization_parent_invalid' as const };
			}

			const resolved = await loadActiveOrganizationParent(database, query.level, query.parentId);
			if (!resolved) {
				set.status = 404;
				return { error: 'active_parent_not_found' as const };
			}
			const matches: OrganizationScopeMatch[] = [];
			if (resolved.path.area) matches.push({ level: 'area', predicate: hasUserScopeGrant(schema.userScopes.areaId, resolved.path.area) });
			if (resolved.path.region) matches.push({ level: 'region', predicate: hasUserScopeGrant(schema.userScopes.regionId, resolved.path.region) });
			if (resolved.path.branch) matches.push({ level: 'branch', predicate: hasUserScopeGrant(schema.userScopes.branchId, resolved.path.branch) });
			if (resolved.path.service_area) matches.push({ level: 'service_area', predicate: hasUserScopeGrant(schema.userScopes.serviceAreaId, resolved.path.service_area) });
			const inheritedScope = matches.length ? or(...matches.map((match) => match.predicate)) : undefined;
			const affectedPredicate = inheritedScope
				? or(eq(schema.users.globalScope, true), inheritedScope)
				: eq(schema.users.globalScope, true);
			const basePredicate = and(eq(schema.users.active, true), eq(schema.roles.active, true), affectedPredicate);
			const [summary] = await database.select({
				total: sql<number>`count(*)::int`,
				global: sql<number>`count(*) FILTER (WHERE ${schema.users.globalScope})::int`
			}).from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(basePredicate);
			const fingerprintUsers = await database.select({ id: schema.users.id }).from(schema.users)
				.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(basePredicate).orderBy(asc(schema.users.id));
			const total = Number(summary?.total ?? 0);
			const global = Number(summary?.global ?? 0);
			const previewToken = createSignedOrganizationImpactToken({ actorId: authorization.userId, level: query.level, parentId: query.parentId ?? null,
				total, fingerprint: createHash('sha256').update(fingerprintUsers.map((user) => user.id).join(',')).digest('hex'), expiresAt: Date.now() + 5 * 60 * 1000 });

			const limit = query.limit ?? 50;
			const pagePredicates = [basePredicate, query.after ? gt(schema.users.id, query.after) : undefined];
			const rows = await database.select({
				id: schema.users.id,
				username: schema.users.username,
				displayName: schema.users.displayName,
				roleCode: schema.roles.code,
				globalScope: schema.users.globalScope,
				areaGrant: resolved.path.area ? hasUserScopeGrant(schema.userScopes.areaId, resolved.path.area) : sql<boolean>`FALSE`,
				regionGrant: resolved.path.region ? hasUserScopeGrant(schema.userScopes.regionId, resolved.path.region) : sql<boolean>`FALSE`,
				branchGrant: resolved.path.branch ? hasUserScopeGrant(schema.userScopes.branchId, resolved.path.branch) : sql<boolean>`FALSE`,
				serviceAreaGrant: resolved.path.service_area ? hasUserScopeGrant(schema.userScopes.serviceAreaId, resolved.path.service_area) : sql<boolean>`FALSE`
			}).from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(and(...pagePredicates)).orderBy(asc(schema.users.id)).limit(limit + 1);
			const hasMore = rows.length > limit;
			const page = rows.slice(0, limit).map((user) => ({
				id: user.id,
				username: user.username,
				displayName: user.displayName,
				roleCode: user.roleCode,
				accessMode: user.globalScope ? 'global' as const : 'inherited_scope' as const,
				scopeLevels: [user.areaGrant && 'area', user.regionGrant && 'region', user.branchGrant && 'branch',
					user.serviceAreaGrant && 'service_area'].filter((level): level is string => typeof level === 'string')
			}));
			return {
				childLevel: query.level,
				parent: resolved.parent,
				summary: { total, global, inheritedScope: total - global },
				users: page,
				nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
				previewToken
			};
		}, {
			query: t.Object({
				level: organizationLevelSchema,
				parentId: t.Optional(t.String({ format: 'uuid' })),
				after: t.Optional(t.String({ format: 'uuid' })),
				limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 }))
			}),
			requirePermission: 'organization.manage',
			response: {
				200: t.Object({
					childLevel: organizationLevelSchema,
					parent: t.Union([t.Object({ id: t.String(), level: organizationLevelSchema, code: t.String(), name: t.String() }), t.Null()]),
					summary: t.Object({ total: t.Number(), global: t.Number(), inheritedScope: t.Number() }),
					users: t.Array(t.Object({ id: t.String(), username: t.String(), displayName: t.String(), roleCode: t.String(),
						accessMode: t.Union([t.Literal('global'), t.Literal('inherited_scope')]), scopeLevels: t.Array(t.String()) })),
					nextCursor: t.Nullable(t.String()), previewToken: t.String()
				}),
				400: apiErrorResponseSchema, 401: apiErrorResponseSchema, 403: apiErrorResponseSchema, 404: apiErrorResponseSchema, 503: apiErrorResponseSchema, 422: invalidRequestResponseSchema, 500: apiErrorResponseSchema
			}
		})
		.post('/api/admin/organization/children', async ({ authorization, body, cookie, request, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			const mutationSecurity = validateMutationSecurity(request, cookie[csrfCookie]?.value, appOrigin);
			if (mutationSecurity !== 'allowed') {
				set.status = 403;
				return { error: mutationSecurity === 'origin_rejected' ? 'request_origin_rejected' as const : 'csrf_rejected' as const };
			}
			if (!database) {
				set.status = 503;
				return { error: 'organization_unavailable' as const };
			}
			if (!authorization.globalScope) {
				set.status = 403;
				return { error: 'global_scope_required' as const };
			}
			const parentId = body.parentId ?? null;
			const claims = verifyOrganizationImpactToken(body.previewToken, authorization.userId, body.level, parentId);
			if (!claims) {
				set.status = 409;
				return { error: 'preview_expired_or_invalid' as const };
			}
			const code = body.code.trim().toUpperCase();
			const name = body.name.trim();
			if (!code || code.length > 80 || !name || name.length > 120) {
				set.status = 400;
				return { error: 'invalid_organization_input' as const };
			}
			const [actor] = await database.select({ passwordHash: schema.users.passwordHash }).from(schema.users)
				.where(and(eq(schema.users.id, authorization.userId), eq(schema.users.active, true))).limit(1);
			if (!actor || !(await Bun.password.verify(body.currentPassword, actor.passwordHash))) {
				set.status = 403;
				return { error: 'reauthentication_required' as const };
			}
			try {
				const result = await database.transaction(async (databaseTransaction) => {
					await databaseTransaction.execute(sql`LOCK TABLE ${schema.users} IN SHARE ROW EXCLUSIVE MODE`);
					const [currentActor] = await databaseTransaction.select({ active: schema.users.active, globalScope: schema.users.globalScope,
						roleCode: schema.roles.code, roleActive: schema.roles.active }).from(schema.users)
						.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
						.where(eq(schema.users.id, authorization.userId)).limit(1);
					const permissions = await databaseTransaction.select({ code: schema.permissions.code }).from(schema.rolePermissions)
						.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
						.innerJoin(schema.roles, eq(schema.rolePermissions.roleId, schema.roles.id))
						.where(and(eq(schema.roles.code, 'superadmin'), eq(schema.roles.active, true), eq(schema.permissions.code, 'organization.manage'))).limit(1);
					if (currentActor?.active !== true || currentActor.roleActive !== true || currentActor.roleCode !== 'superadmin' ||
						currentActor.globalScope !== true || permissions.length !== 1) throw new Error('actor_authorization_changed');
					const resolved = await loadActiveOrganizationParent(databaseTransaction, body.level, parentId ?? undefined);
					if (!resolved) throw new Error('active_parent_not_found');
					const matches: OrganizationScopeMatch[] = [];
					if (resolved.path.area) matches.push({ level: 'area', predicate: hasUserScopeGrant(schema.userScopes.areaId, resolved.path.area) });
					if (resolved.path.region) matches.push({ level: 'region', predicate: hasUserScopeGrant(schema.userScopes.regionId, resolved.path.region) });
					if (resolved.path.branch) matches.push({ level: 'branch', predicate: hasUserScopeGrant(schema.userScopes.branchId, resolved.path.branch) });
					if (resolved.path.service_area) matches.push({ level: 'service_area', predicate: hasUserScopeGrant(schema.userScopes.serviceAreaId, resolved.path.service_area) });
					const inherited = matches.length ? or(...matches.map((match) => match.predicate)) : undefined;
					const impacted = inherited ? or(eq(schema.users.globalScope, true), inherited) : eq(schema.users.globalScope, true);
					const activeUsers = and(eq(schema.users.active, true), eq(schema.roles.active, true), impacted);
					const [currentSummary] = await databaseTransaction.select({ total: sql<number>`count(*)::int` })
						.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(activeUsers);
					const currentUsers = await databaseTransaction.select({ id: schema.users.id }).from(schema.users)
						.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(activeUsers).orderBy(asc(schema.users.id));
					const currentFingerprint = createHash('sha256').update(currentUsers.map((user) => user.id).join(',')).digest('hex');
					if (Number(currentSummary?.total ?? 0) !== claims.total || currentFingerprint !== claims.fingerprint) throw new Error('impact_changed');
					let inserted: { id: string } | undefined;
					if (body.level === 'area') {
						[inserted] = await databaseTransaction.insert(schema.areas).values({ code, name }).returning({ id: schema.areas.id });
					} else if (body.level === 'region') {
						[inserted] = await databaseTransaction.insert(schema.regions).values({ areaId: parentId!, code, name }).returning({ id: schema.regions.id });
					} else if (body.level === 'branch') {
						[inserted] = await databaseTransaction.insert(schema.branches).values({ regionId: parentId!, code, name }).returning({ id: schema.branches.id });
					} else if (body.level === 'service_area') {
						[inserted] = await databaseTransaction.insert(schema.serviceAreas).values({ branchId: parentId!, code, name }).returning({ id: schema.serviceAreas.id });
					} else {
						[inserted] = await databaseTransaction.insert(schema.workzones).values({ serviceAreaId: parentId!, code, name }).returning({ id: schema.workzones.id });
					}
					if (!inserted) throw new Error('organization_create_failed');
					const affectedIds = currentUsers.map((user) => user.id);
					if (affectedIds.length) {
						const now = new Date();
						await databaseTransaction.update(schema.users).set({ scopeVersion: sql`${schema.users.scopeVersion} + 1`, updatedAt: now })
							.where(inArray(schema.users.id, affectedIds));
						await databaseTransaction.update(schema.sessions).set({ revokedAt: now })
							.where(and(inArray(schema.sessions.userId, affectedIds), sql`${schema.sessions.revokedAt} IS NULL`, gt(schema.sessions.expiresAt, now)));
					}
					const requestId = set.headers['x-request-id'];
					await appendAuditEvent(databaseTransaction, {
						actorId: authorization.userId, action: 'organization.child_created', targetId: inserted.id,
						requestId: typeof requestId === 'string' ? requestId : 'unknown',
						metadata: { level: body.level, code, parentId, affectedUsers: affectedIds.length }
					});
					return { id: inserted.id, affectedUsers: affectedIds.length };
				});
				set.status = 201;
				return result;
			} catch (error: unknown) {
				if (error instanceof Error && error.message === 'actor_authorization_changed') { set.status = 403; return { error: 'forbidden' as const }; }
				if (error instanceof Error && error.message === 'active_parent_not_found') { set.status = 404; return { error: 'active_parent_not_found' as const }; }
				if (error instanceof Error && error.message === 'impact_changed') { set.status = 409; return { error: 'impact_changed_refresh_preview' as const }; }
				if (getDatabaseConstraintName(error)?.endsWith('_code_unique') || getDatabaseConstraintName(error) === 'areas_code_unique') {
					set.status = 409;
					return { error: 'organization_code_already_exists' as const };
				}
				throw error;
			}
		}, {
			body: t.Object({ level: organizationLevelSchema, parentId: t.Optional(t.String({ format: 'uuid' })), code: t.String({ minLength: 1, maxLength: 80 }),
				name: t.String({ minLength: 1, maxLength: 120 }), previewToken: t.String({ minLength: 20, maxLength: 2048 }), currentPassword: t.String({ minLength: 1, maxLength: 1024 }) }),
			cookie: t.Cookie({ [csrfCookie]: t.Optional(t.String()) }), requirePermission: 'organization.manage',
			response: { 201: t.Object({ id: t.String(), affectedUsers: t.Number() }), 400: apiErrorResponseSchema, 401: apiErrorResponseSchema, 403: apiErrorResponseSchema, 404: apiErrorResponseSchema,
				409: apiErrorResponseSchema, 422: invalidRequestResponseSchema, 500: apiErrorResponseSchema, 503: apiErrorResponseSchema }
		});
}
