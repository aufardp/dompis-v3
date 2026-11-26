import { and, eq, gt, isNull, sql, type SQL } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import * as schema from './schema';

type AuthorizationReader = Pick<BunSQLDatabase<typeof schema>, 'select'>;

export interface AuthorizationContext {
	readonly userId: string;
	readonly globalScope: boolean;
	readonly scopeVersion: number;
	readonly permissions: ReadonlySet<string>;
}

/**
 * Loads authorization state only from an unrevoked, unexpired session token hash.
 * The raw browser token must never be passed here or stored in the database.
 */
export async function loadAuthorizationContext(
	database: AuthorizationReader,
	tokenHash: Uint8Array,
	now = new Date()
): Promise<AuthorizationContext | null> {
	const [identity] = await database
		.select({
			userId: schema.users.id,
			roleId: schema.users.roleId,
			globalScope: schema.users.globalScope,
			scopeVersion: schema.users.scopeVersion
		})
		.from(schema.sessions)
		.innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
		.innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
		.where(and(
			eq(schema.sessions.tokenHash, tokenHash),
			isNull(schema.sessions.revokedAt),
			gt(schema.sessions.expiresAt, now),
			eq(schema.users.active, true),
			eq(schema.roles.active, true)
		))
		.limit(1);

	if (!identity) return null;

	const grants = await database
		.select({ code: schema.permissions.code })
		.from(schema.rolePermissions)
		.innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
		.where(eq(schema.rolePermissions.roleId, identity.roleId));

	return {
		userId: identity.userId,
		globalScope: identity.globalScope,
		scopeVersion: identity.scopeVersion,
		permissions: new Set(grants.map((grant) => grant.code))
	};
}

/**
 * Produces a reusable ticket predicate. Callers must compose it with their
 * validated filters using AND; the context must come from loadAuthorizationContext.
 * The EXISTS scope branch avoids grant fan-out, unions mixed-level grants, and
 * denies unmapped tickets or any ticket under an inactive hierarchy node.
 */
export function ticketAccessPredicate(
	context: AuthorizationContext,
	requiredPermission: string
): SQL<boolean> {
	if (!context.permissions.has(requiredPermission)) return sql<boolean>`FALSE`;

	return sql<boolean>`EXISTS (
		SELECT 1
		FROM ${schema.workzones}
		JOIN ${schema.serviceAreas}
			ON ${schema.serviceAreas.id} = ${schema.workzones.serviceAreaId}
		JOIN ${schema.branches}
			ON ${schema.branches.id} = ${schema.serviceAreas.branchId}
		JOIN ${schema.regions}
			ON ${schema.regions.id} = ${schema.branches.regionId}
		JOIN ${schema.areas}
			ON ${schema.areas.id} = ${schema.regions.areaId}
		WHERE ${schema.workzones.id} = ${schema.tickets.workzoneId}
			AND ${schema.workzones.active} = TRUE
			AND ${schema.serviceAreas.active} = TRUE
			AND ${schema.branches.active} = TRUE
			AND ${schema.regions.active} = TRUE
			AND ${schema.areas.active} = TRUE
			AND (
				${context.globalScope}
				OR EXISTS (
					SELECT 1
					FROM ${schema.userScopes}
					WHERE ${schema.userScopes.userId} = ${context.userId}
						AND (
							${schema.userScopes.areaId} = ${schema.areas.id}
							OR ${schema.userScopes.regionId} = ${schema.regions.id}
							OR ${schema.userScopes.branchId} = ${schema.branches.id}
							OR ${schema.userScopes.serviceAreaId} = ${schema.serviceAreas.id}
							OR ${schema.userScopes.workzoneId} = ${schema.workzones.id}
						)
				)
			)
	)`;
}
