import { and, desc, eq, isNull, lt, or, sql, type SQL } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import { ticketAccessPredicate, type AuthorizationContext } from './authorization';
import * as schema from './schema';

type TicketReader = Pick<BunSQLDatabase<typeof schema>, 'select'>;

export interface TicketListFilters {
	readonly lifecycle?: 'open' | 'closed' | 'unknown';
	readonly bucket?: 'kpi_customer' | 'kpi_proactive' | 'non_kpi_unspec' | 'non_technical' | 'sqm_update' | 'obsolete' | 'unknown';
	readonly status?: string;
	readonly incident?: string;
	readonly serviceNo?: string;
	readonly areaId?: string;
	readonly regionId?: string;
	readonly branchId?: string;
	readonly serviceAreaId?: string;
	readonly workzoneId?: string;
}

export interface TicketListPosition {
	readonly reportedAt: string | null;
	readonly id: string;
}

/** Exact incident lookup with permission and current hierarchy scope in SQL. */
export async function findTicketDetail(
	database: TicketReader,
	context: AuthorizationContext,
	incident: string
) {
	const [ticket] = await database
		.select({
			id: schema.tickets.id,
			incident: schema.tickets.incident,
			status: schema.tickets.status,
			lifecycle: schema.tickets.lifecycle,
			sourceWorkzone: schema.tickets.sourceWorkzone,
			statusAt: schema.tickets.statusAt,
			sourceUpdatedAt: schema.tickets.sourceUpdatedAt,
			reportedAt: schema.tickets.reportedAt,
			bookingAt: schema.tickets.bookingAt,
			resolvedAt: schema.tickets.resolvedAt,
			closedAt: schema.tickets.closedAt,
			operationalBucket: schema.tickets.operationalBucket,
			kpiSeg: schema.tickets.kpiSeg,
			jenisTiket1: schema.tickets.jenisTiket1,
			jenisTiket2: schema.tickets.jenisTiket2,
			classificationFlag: schema.tickets.classificationFlag,
			qualityFlags: schema.tickets.qualityFlags,
			slaSeconds: schema.tickets.slaSeconds,
			ttrDeadlineAt: schema.tickets.ttrDeadlineAt,
			ttrComplyStatus: schema.tickets.ttrComplyStatus,
			version: schema.tickets.version,
			workzoneId: schema.workzones.id,
			workzoneCode: schema.workzones.code,
			workzoneName: schema.workzones.name,
			serviceAreaName: schema.serviceAreas.name,
			branchName: schema.branches.name,
			regionName: schema.regions.name,
			areaName: schema.areas.name
		})
		.from(schema.tickets)
		.innerJoin(schema.workzones, eq(schema.tickets.workzoneId, schema.workzones.id))
		.innerJoin(schema.serviceAreas, eq(schema.workzones.serviceAreaId, schema.serviceAreas.id))
		.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
		.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
		.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
		.where(and(
			eq(schema.tickets.incident, incident),
			ticketAccessPredicate(context, 'tickets.read')
		))
		.limit(1);
	return ticket;
}

/** Scoped list projection. The raw timestamp string preserves PostgreSQL microseconds for keyset cursors. */
export async function listTickets(
	database: TicketReader,
	context: AuthorizationContext,
	filters: TicketListFilters,
	limit: number,
	position?: TicketListPosition
) {
	const predicates: SQL[] = [ticketAccessPredicate(context, 'tickets.read')];
	if (filters.lifecycle) predicates.push(eq(schema.tickets.lifecycle, filters.lifecycle));
	if (filters.bucket) predicates.push(eq(schema.tickets.operationalBucket, filters.bucket));
	if (filters.status) predicates.push(eq(schema.tickets.status, filters.status));
	if (filters.areaId) predicates.push(eq(schema.areas.id, filters.areaId));
	if (filters.regionId) predicates.push(eq(schema.regions.id, filters.regionId));
	if (filters.branchId) predicates.push(eq(schema.branches.id, filters.branchId));
	if (filters.serviceAreaId) predicates.push(eq(schema.serviceAreas.id, filters.serviceAreaId));
	if (filters.workzoneId) predicates.push(eq(schema.workzones.id, filters.workzoneId));
	if (filters.incident && filters.serviceNo) {
		predicates.push(or(
			eq(schema.tickets.incident, filters.incident),
			eq(schema.tickets.serviceNo, filters.serviceNo)
		)!);
	} else if (filters.incident) {
		predicates.push(eq(schema.tickets.incident, filters.incident));
	} else if (filters.serviceNo) {
		predicates.push(eq(schema.tickets.serviceNo, filters.serviceNo));
	}

	if (position) {
		const idBefore = lt(schema.tickets.id, position.id);
		if (position.reportedAt === null) {
			predicates.push(and(isNull(schema.tickets.reportedAt), idBefore)!);
		} else {
			const cursorTimestamp = sql`${position.reportedAt}::timestamptz`;
			predicates.push(or(
				lt(schema.tickets.reportedAt, cursorTimestamp),
				and(eq(schema.tickets.reportedAt, cursorTimestamp), idBefore),
				isNull(schema.tickets.reportedAt)
			)!);
		}
	}

	return database
		.select({
			id: schema.tickets.id,
			incident: schema.tickets.incident,
			status: schema.tickets.status,
			lifecycle: schema.tickets.lifecycle,
			sourceWorkzone: schema.tickets.sourceWorkzone,
			reportedAt: schema.tickets.reportedAt,
			reportedAtCursor: sql<string | null>`CASE WHEN ${schema.tickets.reportedAt} IS NULL THEN NULL ELSE to_char(${schema.tickets.reportedAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END`,
			statusAt: schema.tickets.statusAt,
			bookingAt: schema.tickets.bookingAt,
			operationalBucket: schema.tickets.operationalBucket,
			kpiSeg: schema.tickets.kpiSeg,
			jenisTiket1: schema.tickets.jenisTiket1,
			jenisTiket2: schema.tickets.jenisTiket2,
			classificationFlag: schema.tickets.classificationFlag,
			qualityFlags: schema.tickets.qualityFlags,
			workzoneId: schema.workzones.id,
			workzoneCode: schema.workzones.code,
			workzoneName: schema.workzones.name,
			serviceAreaName: schema.serviceAreas.name,
			branchName: schema.branches.name,
			regionName: schema.regions.name,
			areaName: schema.areas.name
		})
		.from(schema.tickets)
		.innerJoin(schema.workzones, eq(schema.tickets.workzoneId, schema.workzones.id))
		.innerJoin(schema.serviceAreas, eq(schema.workzones.serviceAreaId, schema.serviceAreas.id))
		.innerJoin(schema.branches, eq(schema.serviceAreas.branchId, schema.branches.id))
		.innerJoin(schema.regions, eq(schema.branches.regionId, schema.regions.id))
		.innerJoin(schema.areas, eq(schema.regions.areaId, schema.areas.id))
		.where(and(...predicates))
		.orderBy(sql`${schema.tickets.reportedAt} DESC NULLS LAST`, desc(schema.tickets.id))
		.limit(limit + 1);
}
