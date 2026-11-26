import { and, asc, desc, eq, gt, inArray, isNull, like, lt, ne, or, sql } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { appendAuditEvent, database, schema } from '@dompis/db';
import { validateMutationSecurity } from './auth';
import { createPermissionGuard } from './permission-guard';

const CSRF_COOKIE = '__Host-dompis_csrf';
const ROLE_CODES = ['superadmin', 'team_leader', 'helpdesk', 'teknisi', 'senior_leader', 'officer'] as const;
const scopeGrant = t.Union([
	t.Object({ level: t.Literal('area'), targetId: t.String({ format: 'uuid' }) }),
	t.Object({ level: t.Literal('region'), targetId: t.String({ format: 'uuid' }) }),
	t.Object({ level: t.Literal('branch'), targetId: t.String({ format: 'uuid' }) }),
	t.Object({ level: t.Literal('service_area'), targetId: t.String({ format: 'uuid' }) }),
	t.Object({ level: t.Literal('workzone'), targetId: t.String({ format: 'uuid' }) })
]);
const invalidRequest = t.Object({ error: t.Literal('invalid_request'), requestId: t.String() });
const apiError = t.Object({ error: t.String() });
type UserAdminDatabase = NonNullable<typeof database>;
type ScopeGrant = { level: 'area' | 'region' | 'branch' | 'service_area' | 'workzone'; targetId: string };

function requestId(value: string | string[] | undefined): string {
	return typeof value === 'string' ? value : 'unknown';
}

function databaseConstraint(error: unknown): string | undefined {
	let candidate: unknown = error;
	for (let depth = 0; depth < 3; depth += 1) {
		if (typeof candidate !== 'object' || candidate === null) return undefined;
		if ('constraint' in candidate && typeof candidate.constraint === 'string') return candidate.constraint;
		candidate = 'cause' in candidate ? candidate.cause : undefined;
	}
	return undefined;
}

function escapeLikePrefix(value: string): string {
	return `${value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

function hasDuplicateScopes(scopes: readonly ScopeGrant[]): boolean {
	const keys = new Set(scopes.map((scope) => `${scope.level}:${scope.targetId}`));
	return keys.size !== scopes.length;
}

async function activeScopeTargetsExist(database: Pick<UserAdminDatabase, 'select'>, scopes: readonly ScopeGrant[]): Promise<boolean> {
	const ids = (level: ScopeGrant['level']) => scopes.filter((scope) => scope.level === level).map((scope) => scope.targetId);
	const [areaRows, regionRows, branchRows, serviceAreaRows, workzoneRows] = await Promise.all([
		ids('area').length ? database.select({ id: schema.areas.id }).from(schema.areas)
			.where(and(inArray(schema.areas.id, ids('area')), eq(schema.areas.active, true))) : [],
		ids('region').length ? database.select({ id: schema.regions.id }).from(schema.regions)
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(inArray(schema.regions.id, ids('region')), eq(schema.regions.active, true), eq(schema.areas.active, true))) : [],
		ids('branch').length ? database.select({ id: schema.branches.id }).from(schema.branches)
			.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(inArray(schema.branches.id, ids('branch')), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))) : [],
		ids('service_area').length ? database.select({ id: schema.serviceAreas.id }).from(schema.serviceAreas)
			.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
			.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(inArray(schema.serviceAreas.id, ids('service_area')), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))) : [],
		ids('workzone').length ? database.select({ id: schema.workzones.id }).from(schema.workzones)
			.innerJoin(schema.serviceAreas, eq(schema.workzones.serviceAreaId, schema.serviceAreas.id))
			.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
			.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
			.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
			.where(and(inArray(schema.workzones.id, ids('workzone')), eq(schema.workzones.active, true), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true))) : []
	]);
	return areaRows.length === ids('area').length &&
		regionRows.length === ids('region').length &&
		branchRows.length === ids('branch').length &&
		serviceAreaRows.length === ids('service_area').length &&
		workzoneRows.length === ids('workzone').length;
}

async function lockUserAdministration(database: UserAdminDatabase): Promise<void> {
	await database.execute(sql`LOCK TABLE ${schema.users} IN SHARE ROW EXCLUSIVE MODE`);
}

async function verifyGlobalAdministrator(database: UserAdminDatabase, userId: string): Promise<boolean> {
	const [actor] = await database.select({
		active: schema.users.active,
		globalScope: schema.users.globalScope,
		roleCode: schema.roles.code,
		roleActive: schema.roles.active
	}).from(schema.users)
		.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
		.where(eq(schema.users.id, userId)).limit(1);
	if (actor?.active !== true || actor.roleActive !== true || actor.roleCode !== 'superadmin' || actor.globalScope !== true) return false;
	const adminPermissions = await database.select({ code: schema.permissions.code })
		.from(schema.rolePermissions)
		.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
		.innerJoin(schema.roles, eq(schema.rolePermissions.roleId, schema.roles.id))
		.where(and(eq(schema.roles.code, 'superadmin'), eq(schema.permissions.code, 'users.manage')))
		.limit(1);
	return adminPermissions.length === 1;
}

async function verifyReauthentication(database: UserAdminDatabase, userId: string, password: string): Promise<boolean> {
	const [actor] = await database.select({ passwordHash: schema.users.passwordHash })
		.from(schema.users).where(and(eq(schema.users.id, userId), eq(schema.users.active, true))).limit(1);
	if (!actor) return false;
	return Bun.password.verify(password, actor.passwordHash);
}

function scopeRow(scope: ScopeGrant) {
	return {
		areaId: scope.level === 'area' ? scope.targetId : null,
		regionId: scope.level === 'region' ? scope.targetId : null,
		branchId: scope.level === 'branch' ? scope.targetId : null,
		serviceAreaId: scope.level === 'service_area' ? scope.targetId : null,
		workzoneId: scope.level === 'workzone' ? scope.targetId : null
	};
}

export function createUserRoutes(database: UserAdminDatabase | undefined, appOrigin: string | undefined) {
	return new Elysia({ name: 'dompis-user-administration' })
		.use(createPermissionGuard(database))
		.get('/admin/scope-options', async ({ authorization, query, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!authorization.globalScope) {
				set.status = 403;
				return { error: 'global_scope_required' as const };
			}
			if (!database) {
				set.status = 503;
				return { error: 'user_management_unavailable' as const };
			}
			const level = query.level;
			const parentRequired = level !== 'area';
			if ((parentRequired && !query.parentId) || (!parentRequired && query.parentId)) {
				set.status = 400;
				return { error: 'scope_parent_invalid' as const };
			}
			const pattern = query.search?.trim() ? escapeLikePrefix(query.search.trim()) : undefined;
			const after = query.after;
			const limit = query.limit ?? 50;
			const matching = (code: AnyPgColumn, name: AnyPgColumn) => pattern
				? or(like(code, pattern), like(name, pattern)) : undefined;
			let options: Array<{ id: string; code: string; name: string }>;
			if (level === 'area') {
				options = await database.select({ id: schema.areas.id, code: schema.areas.code, name: schema.areas.name })
					.from(schema.areas).where(and(eq(schema.areas.active, true), after ? gt(schema.areas.id, after) : undefined,
						matching(schema.areas.code, schema.areas.name))).orderBy(asc(schema.areas.id)).limit(limit);
			} else if (level === 'region') {
				options = await database.select({ id: schema.regions.id, code: schema.regions.code, name: schema.regions.name })
					.from(schema.regions).innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
					.where(and(eq(schema.regions.areaId, query.parentId!), eq(schema.regions.active, true), eq(schema.areas.active, true),
						after ? gt(schema.regions.id, after) : undefined, matching(schema.regions.code, schema.regions.name)))
					.orderBy(asc(schema.regions.id)).limit(limit);
			} else if (level === 'branch') {
				options = await database.select({ id: schema.branches.id, code: schema.branches.code, name: schema.branches.name })
					.from(schema.branches).innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
					.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
					.where(and(eq(schema.branches.regionId, query.parentId!), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true),
						after ? gt(schema.branches.id, after) : undefined, matching(schema.branches.code, schema.branches.name)))
					.orderBy(asc(schema.branches.id)).limit(limit);
			} else if (level === 'service_area') {
				options = await database.select({ id: schema.serviceAreas.id, code: schema.serviceAreas.code, name: schema.serviceAreas.name })
					.from(schema.serviceAreas).innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
					.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
					.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
					.where(and(eq(schema.serviceAreas.branchId, query.parentId!), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true),
						after ? gt(schema.serviceAreas.id, after) : undefined, matching(schema.serviceAreas.code, schema.serviceAreas.name)))
					.orderBy(asc(schema.serviceAreas.id)).limit(limit);
			} else {
				options = await database.select({ id: schema.workzones.id, code: schema.workzones.code, name: schema.workzones.name })
					.from(schema.workzones).innerJoin(schema.serviceAreas, eq(schema.workzones.serviceAreaId, schema.serviceAreas.id))
					.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
					.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
					.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
					.where(and(eq(schema.workzones.serviceAreaId, query.parentId!), eq(schema.workzones.active, true), eq(schema.serviceAreas.active, true), eq(schema.branches.active, true), eq(schema.regions.active, true), eq(schema.areas.active, true),
						after ? gt(schema.workzones.id, after) : undefined, matching(schema.workzones.code, schema.workzones.name)))
					.orderBy(asc(schema.workzones.id)).limit(limit);
			}
			return { options, nextCursor: options.length === limit ? options.at(-1)?.id ?? null : null };
		}, {
			query: t.Object({
				level: t.Union([t.Literal('area'), t.Literal('region'), t.Literal('branch'), t.Literal('service_area'), t.Literal('workzone')]),
				parentId: t.Optional(t.String({ format: 'uuid' })),
				search: t.Optional(t.String({ minLength: 1, maxLength: 80 })),
				after: t.Optional(t.String({ format: 'uuid' })),
				limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 }))
			}),
			requirePermission: 'organization.read',
			response: { 200: t.Object({
				options: t.Array(t.Object({ id: t.String(), code: t.String(), name: t.String() })),
				nextCursor: t.Nullable(t.String())
			}), 400: apiError, 401: apiError, 403: apiError, 503: apiError, 422: invalidRequest, 500: apiError }
		})
		.get('/admin/users', async ({ authorization, query, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!authorization.globalScope) {
				set.status = 403;
				return { error: 'global_scope_required' as const };
			}
			if (!database) {
				set.status = 503;
				return { error: 'user_management_unavailable' as const };
			}
			const limit = query.limit ?? 50;
			const rows = await database.select({
				id: schema.users.id,
				username: schema.users.username,
				displayName: schema.users.displayName,
				roleCode: schema.roles.code,
				active: schema.users.active,
				globalScope: schema.users.globalScope,
				scopeVersion: schema.users.scopeVersion,
				createdAt: schema.users.createdAt
			}).from(schema.users)
				.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(query.after ? lt(schema.users.id, query.after) : undefined)
				.orderBy(desc(schema.users.id))
				.limit(limit + 1);
			const hasMore = rows.length > limit;
			const users = rows.slice(0, limit);
			return { users, nextCursor: hasMore ? users.at(-1)?.id ?? null : null };
		}, {
			query: t.Object({
				limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 })),
				after: t.Optional(t.String({ format: 'uuid' }))
			}),
			requirePermission: 'users.read',
			response: {
				200: t.Object({ users: t.Array(t.Object({
					id: t.String(), username: t.String(), displayName: t.String(), roleCode: t.String(), active: t.Boolean(),
					globalScope: t.Boolean(), scopeVersion: t.Number(), createdAt: t.Date()
				})), nextCursor: t.Nullable(t.String()) }),
				401: apiError, 403: apiError, 503: apiError, 422: invalidRequest, 500: apiError
			}
		})
		.get('/admin/users/:id', async ({ authorization, params, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			if (!authorization.globalScope) {
				set.status = 403;
				return { error: 'global_scope_required' as const };
			}
			if (!database) {
				set.status = 503;
				return { error: 'user_management_unavailable' as const };
			}
			const [user] = await database.select({
				id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName,
				roleCode: schema.roles.code, active: schema.users.active, globalScope: schema.users.globalScope,
				scopeVersion: schema.users.scopeVersion, createdAt: schema.users.createdAt
			}).from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(eq(schema.users.id, params.id)).limit(1);
			if (!user) {
				set.status = 404;
				return { error: 'user_not_found' as const };
			}
			const scopes = await database.select({
				id: schema.userScopes.id, areaId: schema.userScopes.areaId, areaCode: schema.areas.code, areaName: schema.areas.name,
				regionId: schema.userScopes.regionId, regionCode: schema.regions.code, regionName: schema.regions.name,
				branchId: schema.userScopes.branchId, branchCode: schema.branches.code, branchName: schema.branches.name,
				serviceAreaId: schema.userScopes.serviceAreaId, serviceAreaCode: schema.serviceAreas.code, serviceAreaName: schema.serviceAreas.name,
				workzoneId: schema.userScopes.workzoneId, workzoneCode: schema.workzones.code, workzoneName: schema.workzones.name
			}).from(schema.userScopes)
				.leftJoin(schema.areas, eq(schema.userScopes.areaId, schema.areas.id))
				.leftJoin(schema.regions, eq(schema.userScopes.regionId, schema.regions.id))
				.leftJoin(schema.branches, eq(schema.userScopes.branchId, schema.branches.id))
				.leftJoin(schema.serviceAreas, eq(schema.userScopes.serviceAreaId, schema.serviceAreas.id))
				.leftJoin(schema.workzones, eq(schema.userScopes.workzoneId, schema.workzones.id))
				.where(eq(schema.userScopes.userId, params.id)).orderBy(asc(schema.userScopes.id));
			return { ...user, scopes };
		}, {
			params: t.Object({ id: t.String({ format: 'uuid' }) }),
			requirePermission: 'users.read',
			response: { 200: t.Object({
				id: t.String(), username: t.String(), displayName: t.String(), roleCode: t.String(), active: t.Boolean(),
				globalScope: t.Boolean(), scopeVersion: t.Number(), createdAt: t.Date(),
				scopes: t.Array(t.Object({
					id: t.String(), areaId: t.Nullable(t.String()), areaCode: t.Nullable(t.String()), areaName: t.Nullable(t.String()),
					regionId: t.Nullable(t.String()), regionCode: t.Nullable(t.String()), regionName: t.Nullable(t.String()),
					branchId: t.Nullable(t.String()), branchCode: t.Nullable(t.String()), branchName: t.Nullable(t.String()),
					serviceAreaId: t.Nullable(t.String()), serviceAreaCode: t.Nullable(t.String()), serviceAreaName: t.Nullable(t.String()),
					workzoneId: t.Nullable(t.String()), workzoneCode: t.Nullable(t.String()), workzoneName: t.Nullable(t.String())
				}))
			}), 401: apiError, 403: apiError, 404: apiError, 503: apiError, 422: invalidRequest, 500: apiError }
		})
		.post('/admin/users', async ({ authorization, body, cookie, request, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			const mutationSecurity = validateMutationSecurity(request, cookie[CSRF_COOKIE]?.value, appOrigin);
			if (mutationSecurity !== 'allowed') {
				set.status = 403;
				return { error: mutationSecurity === 'origin_rejected' ? 'request_origin_rejected' as const : 'csrf_rejected' as const };
			}
			if (!authorization.globalScope) {
				set.status = 403;
				return { error: 'global_scope_required' as const };
			}
			if (!database) {
				set.status = 503;
				return { error: 'user_management_unavailable' as const };
			}
			const username = body.username.trim().toLowerCase();
			const displayName = body.displayName.trim();
			if (!/^[a-z0-9._]{4,50}$/.test(username) || displayName.length < 2 || displayName.length > 120 ||
				new Set(body.scopes.map((scope) => `${scope.level}:${scope.targetId}`)).size !== body.scopes.length ||
				(body.globalScope && body.scopes.length > 0) ||
				(body.globalScope !== (body.roleCode === 'superadmin'))) {
				set.status = 400;
				return { error: 'invalid_user_input' as const };
			}
			if (body.globalScope && !(await verifyReauthentication(database, authorization.userId, body.currentPassword ?? ''))) {
				set.status = 403;
				return { error: 'reauthentication_required' as const };
			}
			if (body.password.length < 12 || body.password.length > 1024 || body.password !== body.passwordConfirm) {
				set.status = 400;
				return { error: 'invalid_user_input' as const };
			}
			const passwordHash = await Bun.password.hash(body.password, { algorithm: 'argon2id' });
			const requestIdValue = requestId(set.headers['x-request-id']);
			try {
				const userId = await database.transaction(async (tx) => {
					await lockUserAdministration(tx);
					if (!(await verifyGlobalAdministrator(tx, authorization.userId))) throw new Error('admin_authorization_changed');
					if (!(await activeScopeTargetsExist(tx, body.scopes))) throw new Error('scope_target_unavailable');
					const [role] = await tx.select({ id: schema.roles.id }).from(schema.roles)
						.where(and(eq(schema.roles.code, body.roleCode), eq(schema.roles.active, true))).limit(1);
					if (!role) throw new Error('role_unavailable');
					const [inserted] = await tx.insert(schema.users).values({
						username, displayName, passwordHash, roleId: role.id, globalScope: body.globalScope
					}).returning({ id: schema.users.id });
					if (!inserted) throw new Error('user_create_failed');
					if (body.scopes.length > 0) {
						await tx.insert(schema.userScopes).values(body.scopes.map((scope) => ({ userId: inserted.id, ...scopeRow(scope) })));
					}
					await appendAuditEvent(tx, {
						actorId: authorization.userId, action: 'user.created', targetId: inserted.id, requestId: requestIdValue,
						metadata: { roleCode: body.roleCode, globalScope: body.globalScope, scopeCount: body.scopes.length }
					});
					return inserted.id;
				});
				set.status = 201;
				return { id: userId };
			} catch (error: unknown) {
				if (databaseConstraint(error) === 'users_username_unique') {
					set.status = 409;
					return { error: 'username_already_exists' as const };
				}
				if (error instanceof Error && error.message === 'scope_target_unavailable') {
					set.status = 400;
					return { error: 'scope_target_unavailable' as const };
				}
				if (error instanceof Error && error.message === 'admin_authorization_changed') {
					set.status = 403;
					return { error: 'forbidden' as const };
				}
				if (error instanceof Error && error.message === 'role_unavailable') {
					set.status = 400;
					return { error: 'role_unavailable' as const };
				}
				throw error;
			}
		}, {
			body: t.Object({
				username: t.String({ minLength: 4, maxLength: 50 }), displayName: t.String({ minLength: 2, maxLength: 120 }),
				roleCode: t.Union(ROLE_CODES.map((code) => t.Literal(code))), password: t.String({ minLength: 12, maxLength: 1024 }),
				passwordConfirm: t.String({ minLength: 12, maxLength: 1024 }),
				globalScope: t.Boolean(), currentPassword: t.Optional(t.String({ minLength: 1, maxLength: 1024 })),
				scopes: t.Array(scopeGrant, { maxItems: 100 })
			}),
			cookie: t.Cookie({ [CSRF_COOKIE]: t.Optional(t.String()) }),
			requirePermission: 'users.manage',
			response: {
				201: t.Object({ id: t.String() }), 400: apiError, 401: apiError, 403: apiError,
				409: apiError, 503: apiError, 422: invalidRequest, 500: apiError
			}
		})
		.put('/admin/users/:id/scopes', async ({ authorization, body, cookie, params, request, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			const mutationSecurity = validateMutationSecurity(request, cookie[CSRF_COOKIE]?.value, appOrigin);
			if (mutationSecurity !== 'allowed') {
				set.status = 403;
				return { error: mutationSecurity === 'origin_rejected' ? 'request_origin_rejected' as const : 'csrf_rejected' as const };
			}
			if (!authorization.globalScope) {
				set.status = 403;
				return { error: 'global_scope_required' as const };
			}
			if (!database) {
				set.status = 503;
				return { error: 'user_management_unavailable' as const };
			}
			if (params.id === authorization.userId || hasDuplicateScopes(body.scopes) ||
				(body.globalScope && body.scopes.length > 0)) {
				set.status = 400;
				return { error: 'invalid_user_scope' as const };
			}
			const [targetPreview] = await database.select({ roleCode: schema.roles.code })
				.from(schema.users).innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
				.where(eq(schema.users.id, params.id)).limit(1);
			if (!targetPreview) {
				set.status = 404;
				return { error: 'user_not_found' as const };
			}
			if (body.globalScope && targetPreview.roleCode !== 'superadmin') {
				set.status = 400;
				return { error: 'global_scope_superadmin_only' as const };
			}
			if (!(await verifyReauthentication(database, authorization.userId, body.currentPassword ?? ''))) {
				set.status = 403;
				return { error: 'reauthentication_required' as const };
			}
			const requestIdValue = requestId(set.headers['x-request-id']);
			try {
				const changed = await database.transaction(async (tx) => {
					await lockUserAdministration(tx);
					if (!(await verifyGlobalAdministrator(tx, authorization.userId))) throw new Error('admin_authorization_changed');
					if (!(await activeScopeTargetsExist(tx, body.scopes))) throw new Error('scope_target_unavailable');
					const [target] = await tx.select({ id: schema.users.id, roleId: schema.users.roleId,
						globalScope: schema.users.globalScope, active: schema.users.active })
						.from(schema.users).where(eq(schema.users.id, params.id)).for('update').limit(1);
					if (!target) throw new Error('user_not_found');
					const [role] = await tx.select({ code: schema.roles.code }).from(schema.roles)
						.where(eq(schema.roles.id, target.roleId)).limit(1);
					if (body.globalScope && role?.code !== 'superadmin') throw new Error('global_scope_superadmin_only');
					if (target.roleId === (await tx.select({ id: schema.roles.id }).from(schema.roles)
						.where(eq(schema.roles.code, 'superadmin')).limit(1))[0]?.id && target.globalScope && !body.globalScope && target.active) {
						const globalAdmins = await tx.select({ id: schema.users.id }).from(schema.users)
							.where(and(eq(schema.users.roleId, target.roleId), eq(schema.users.globalScope, true), eq(schema.users.active, true)))
							.for('update');
						if (globalAdmins.length <= 1) throw new Error('last_global_superadmin');
					}
					const existingScopes = await tx.select({
						areaId: schema.userScopes.areaId, regionId: schema.userScopes.regionId,
						branchId: schema.userScopes.branchId, serviceAreaId: schema.userScopes.serviceAreaId,
						workzoneId: schema.userScopes.workzoneId
					}).from(schema.userScopes).where(eq(schema.userScopes.userId, target.id));
					const canonicalScope = (scope: ScopeGrant) => `${scope.level}:${scope.targetId}`;
					const existingCanonical = existingScopes.map((scope) => scope.areaId ? `area:${scope.areaId}`
						: scope.regionId ? `region:${scope.regionId}`
							: scope.branchId ? `branch:${scope.branchId}`
								: scope.serviceAreaId ? `service_area:${scope.serviceAreaId}`
									: `workzone:${scope.workzoneId}`);
					const requestedCanonical = body.scopes.map(canonicalScope);
					if (target.globalScope === body.globalScope && existingCanonical.length === requestedCanonical.length &&
						existingCanonical.every((scope) => requestedCanonical.includes(scope))) return false;
					await tx.delete(schema.userScopes).where(eq(schema.userScopes.userId, target.id));
					if (body.scopes.length > 0) {
						await tx.insert(schema.userScopes).values(body.scopes.map((scope) => ({ userId: target.id, ...scopeRow(scope) })));
					}
					await tx.update(schema.users).set({
						globalScope: body.globalScope,
						scopeVersion: sql`${schema.users.scopeVersion} + 1`,
						updatedAt: new Date()
					}).where(eq(schema.users.id, target.id));
					await tx.update(schema.sessions).set({ revokedAt: new Date() })
						.where(and(eq(schema.sessions.userId, target.id), isNull(schema.sessions.revokedAt), gt(schema.sessions.expiresAt, new Date())));
					await appendAuditEvent(tx, {
						actorId: authorization.userId, action: 'user.scope_updated', targetId: target.id, requestId: requestIdValue,
						metadata: { globalScope: body.globalScope, scopeCount: body.scopes.length }
					});
					return true;
				});
				return { status: changed ? 'updated' as const : 'unchanged' as const };
			} catch (error: unknown) {
				if (error instanceof Error && error.message === 'user_not_found') {
					set.status = 404;
					return { error: 'user_not_found' as const };
				}
				if (error instanceof Error && error.message === 'scope_target_unavailable') {
					set.status = 400;
					return { error: 'scope_target_unavailable' as const };
				}
				if (error instanceof Error && error.message === 'global_scope_superadmin_only') {
					set.status = 400;
					return { error: 'global_scope_superadmin_only' as const };
				}
				if (error instanceof Error && error.message === 'last_global_superadmin') {
					set.status = 409;
					return { error: 'last_global_superadmin' as const };
				}
				if (error instanceof Error && error.message === 'admin_authorization_changed') {
					set.status = 403;
					return { error: 'forbidden' as const };
				}
				throw error;
			}
		}, {
			params: t.Object({ id: t.String({ format: 'uuid' }) }),
			body: t.Object({
				globalScope: t.Boolean(), currentPassword: t.String({ minLength: 1, maxLength: 1024 }),
				scopes: t.Array(scopeGrant, { maxItems: 100 })
			}),
			cookie: t.Cookie({ [CSRF_COOKIE]: t.Optional(t.String()) }),
			requirePermission: 'users.manage',
			response: { 200: t.Object({ status: t.Union([t.Literal('updated'), t.Literal('unchanged')]) }), 400: apiError, 401: apiError,
				403: apiError, 404: apiError, 409: apiError, 503: apiError, 422: invalidRequest, 500: apiError }
		})
		.delete('/admin/users/:id', async ({ authorization, cookie, params, request, set }) => {
			set.headers['cache-control'] = 'private, no-store';
			const mutationSecurity = validateMutationSecurity(request, cookie[CSRF_COOKIE]?.value, appOrigin);
			if (mutationSecurity !== 'allowed') {
				set.status = 403;
				return { error: mutationSecurity === 'origin_rejected' ? 'request_origin_rejected' as const : 'csrf_rejected' as const };
			}
			if (!authorization.globalScope) {
				set.status = 403;
				return { error: 'global_scope_required' as const };
			}
			if (!database) {
				set.status = 503;
				return { error: 'user_management_unavailable' as const };
			}
			if (params.id === authorization.userId) {
				set.status = 409;
				return { error: 'self_deactivation_forbidden' as const };
			}
			const requestIdValue = requestId(set.headers['x-request-id']);
			try {
				await database.transaction(async (tx) => {
					await lockUserAdministration(tx);
					if (!(await verifyGlobalAdministrator(tx, authorization.userId))) throw new Error('admin_authorization_changed');
					const [target] = await tx.select({ id: schema.users.id, roleId: schema.users.roleId, active: schema.users.active,
						globalScope: schema.users.globalScope })
						.from(schema.users).where(eq(schema.users.id, params.id)).for('update').limit(1);
					if (!target) throw new Error('user_not_found');
					if (target.active) {
						const [role] = await tx.select({ code: schema.roles.code }).from(schema.roles)
							.where(eq(schema.roles.id, target.roleId)).limit(1);
						if (role?.code === 'superadmin') {
							const remainingAdmins = await tx.select({ id: schema.users.id }).from(schema.users)
								.where(and(eq(schema.users.roleId, target.roleId), eq(schema.users.active, true), eq(schema.users.globalScope, true), ne(schema.users.id, target.id)))
								.for('update');
							if (target.globalScope && remainingAdmins.length === 0) throw new Error('last_global_superadmin');
						}
						await tx.update(schema.users).set({ active: false, updatedAt: new Date() }).where(eq(schema.users.id, target.id));
						await tx.update(schema.sessions).set({ revokedAt: new Date() })
							.where(and(eq(schema.sessions.userId, target.id), isNull(schema.sessions.revokedAt), gt(schema.sessions.expiresAt, new Date())));
					}
					await appendAuditEvent(tx, {
						actorId: authorization.userId, action: 'user.deactivated', targetId: target.id, requestId: requestIdValue,
						metadata: { alreadyInactive: !target.active }
					});
				});
				return { status: 'deactivated' as const };
			} catch (error: unknown) {
				if (error instanceof Error && error.message === 'user_not_found') {
					set.status = 404;
					return { error: 'user_not_found' as const };
				}
				if (error instanceof Error && error.message === 'last_global_superadmin') {
					set.status = 409;
					return { error: 'last_global_superadmin' as const };
				}
				if (error instanceof Error && error.message === 'admin_authorization_changed') {
					set.status = 403;
					return { error: 'forbidden' as const };
				}
				throw error;
			}
		}, {
			params: t.Object({ id: t.String({ format: 'uuid' }) }),
			cookie: t.Cookie({ [CSRF_COOKIE]: t.Optional(t.String()) }),
			requirePermission: 'users.manage',
			response: { 200: t.Object({ status: t.Literal('deactivated') }), 401: apiError, 403: apiError,
				404: apiError, 409: apiError, 503: apiError, 422: invalidRequest, 500: apiError }
		});
}
