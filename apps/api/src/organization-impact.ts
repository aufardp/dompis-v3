import { and, asc, eq, gt, or, sql } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { database, schema } from '@dompis/db';
import { createPermissionGuard } from './permission-guard';

type OrganizationDatabase = NonNullable<typeof database>;
type HierarchyLevel = 'area' | 'region' | 'branch' | 'service_area' | 'workzone';
type ParentNode = { id: string; level: HierarchyLevel; code: string; name: string };
type HierarchyPath = Partial<Record<HierarchyLevel, string>>;
type ScopeMatch = { level: HierarchyLevel; predicate: ReturnType<typeof sql<boolean>> };

const levelSchema = t.Union([
	t.Literal('area'), t.Literal('region'), t.Literal('branch'), t.Literal('service_area'), t.Literal('workzone')
]);
const apiError = t.Object({ error: t.String() });
const invalidRequest = t.Object({ error: t.Literal('invalid_request'), requestId: t.String() });

function scopeExists(column: AnyPgColumn, targetId: string) {
	return sql<boolean>`EXISTS (
		SELECT 1 FROM ${schema.userScopes}
		WHERE ${schema.userScopes.userId} = ${schema.users.id}
		AND ${column} = ${targetId}
	)`;
}

async function resolveActiveParent(
	database: OrganizationDatabase,
	childLevel: HierarchyLevel,
	parentId: string | undefined
): Promise<{ parent: ParentNode | null; path: HierarchyPath } | null> {
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

export function createOrganizationImpactRoutes(database: OrganizationDatabase | undefined) {
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

			const resolved = await resolveActiveParent(database, query.level, query.parentId);
			if (!resolved) {
				set.status = 404;
				return { error: 'active_parent_not_found' as const };
			}
			const matches: ScopeMatch[] = [];
			if (resolved.path.area) matches.push({ level: 'area', predicate: scopeExists(schema.userScopes.areaId, resolved.path.area) });
			if (resolved.path.region) matches.push({ level: 'region', predicate: scopeExists(schema.userScopes.regionId, resolved.path.region) });
			if (resolved.path.branch) matches.push({ level: 'branch', predicate: scopeExists(schema.userScopes.branchId, resolved.path.branch) });
			if (resolved.path.service_area) matches.push({ level: 'service_area', predicate: scopeExists(schema.userScopes.serviceAreaId, resolved.path.service_area) });
			const inheritedScope = matches.length ? or(...matches.map((match) => match.predicate)) : undefined;
			const affectedPredicate = inheritedScope
				? or(eq(schema.users.globalScope, true), inheritedScope)
				: eq(schema.users.globalScope, true);
			const basePredicate = and(eq(schema.users.active, true), eq(schema.roles.active, true), affectedPredicate);
			const [summary] = await database.select({
				total: sql<number>`count(*)::int`,
				global: sql<number>`count(*) FILTER (WHERE ${schema.users.globalScope})::int`
			}).from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id)).where(basePredicate);

			const limit = query.limit ?? 50;
			const pagePredicates = [basePredicate, query.after ? gt(schema.users.id, query.after) : undefined];
			const rows = await database.select({
				id: schema.users.id,
				username: schema.users.username,
				displayName: schema.users.displayName,
				roleCode: schema.roles.code,
				globalScope: schema.users.globalScope,
				areaGrant: resolved.path.area ? scopeExists(schema.userScopes.areaId, resolved.path.area) : sql<boolean>`FALSE`,
				regionGrant: resolved.path.region ? scopeExists(schema.userScopes.regionId, resolved.path.region) : sql<boolean>`FALSE`,
				branchGrant: resolved.path.branch ? scopeExists(schema.userScopes.branchId, resolved.path.branch) : sql<boolean>`FALSE`,
				serviceAreaGrant: resolved.path.service_area ? scopeExists(schema.userScopes.serviceAreaId, resolved.path.service_area) : sql<boolean>`FALSE`
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
				summary: { total: Number(summary?.total ?? 0), global: Number(summary?.global ?? 0),
					inheritedScope: Number(summary?.total ?? 0) - Number(summary?.global ?? 0) },
				users: page,
				nextCursor: hasMore ? page.at(-1)?.id ?? null : null
			};
		}, {
			query: t.Object({
				level: levelSchema,
				parentId: t.Optional(t.String({ format: 'uuid' })),
				after: t.Optional(t.String({ format: 'uuid' })),
				limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 }))
			}),
			requirePermission: 'organization.manage',
			response: {
				200: t.Object({
					childLevel: levelSchema,
					parent: t.Union([t.Object({ id: t.String(), level: levelSchema, code: t.String(), name: t.String() }), t.Null()]),
					summary: t.Object({ total: t.Number(), global: t.Number(), inheritedScope: t.Number() }),
					users: t.Array(t.Object({ id: t.String(), username: t.String(), displayName: t.String(), roleCode: t.String(),
						accessMode: t.Union([t.Literal('global'), t.Literal('inherited_scope')]), scopeLevels: t.Array(t.String()) })),
					nextCursor: t.Nullable(t.String())
				}),
				400: apiError, 401: apiError, 403: apiError, 404: apiError, 503: apiError, 422: invalidRequest, 500: apiError
			}
		});
}
