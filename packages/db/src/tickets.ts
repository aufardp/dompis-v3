import { and, eq } from 'drizzle-orm';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import { ticketAccessPredicate, type AuthorizationContext } from './authorization';
import * as schema from './schema';

type TicketReader = Pick<BunSQLDatabase<typeof schema>, 'select'>;

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
