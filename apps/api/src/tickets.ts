import { Elysia, t } from 'elysia';
import { findTicketDetail } from '@dompis/db';
import { database } from '@dompis/db';
import { createPermissionGuard } from './permission-guard';

export const TICKET_READ_PERMISSION = 'tickets.read';
type TicketDatabase = NonNullable<typeof database>;

export function createTicketRoutes(database: TicketDatabase | undefined) {
	return new Elysia({ name: 'dompis-ticket-routes' })
		.use(createPermissionGuard(database))
		.get('/tickets/:incident', async ({ authorization, params, set }) => {
			if (!database) {
				set.status = 503;
				return { error: 'ticket_data_unavailable' as const };
			}
			const incident = params.incident.trim().toUpperCase();
			const ticket = await findTicketDetail(database, authorization, incident);
			if (!ticket) {
				set.status = 404;
				return { error: 'ticket_not_found' as const };
			}
			return {
				id: ticket.id,
				incident: ticket.incident,
				status: ticket.status,
				lifecycle: ticket.lifecycle,
				sourceWorkzone: ticket.sourceWorkzone,
				statusAt: ticket.statusAt,
				sourceUpdatedAt: ticket.sourceUpdatedAt,
				reportedAt: ticket.reportedAt,
				bookingAt: ticket.bookingAt,
				resolvedAt: ticket.resolvedAt,
				closedAt: ticket.closedAt,
				operationalBucket: ticket.operationalBucket,
				kpiSeg: ticket.kpiSeg,
				jenisTiket1: ticket.jenisTiket1,
				jenisTiket2: ticket.jenisTiket2,
				classificationFlag: ticket.classificationFlag,
				qualityFlags: ticket.qualityFlags,
				slaSeconds: ticket.slaSeconds,
				ttrDeadlineAt: ticket.ttrDeadlineAt,
				ttrComplyStatus: ticket.ttrComplyStatus,
				version: ticket.version,
				workzone: {
					id: ticket.workzoneId,
					code: ticket.workzoneCode,
					name: ticket.workzoneName,
					serviceArea: ticket.serviceAreaName,
					branch: ticket.branchName,
					region: ticket.regionName,
					area: ticket.areaName
				}
			};
		}, {
			params: t.Object({ incident: t.String({ minLength: 1, maxLength: 100, pattern: '^[A-Za-z0-9_-]+$' }) }),
			requirePermission: TICKET_READ_PERMISSION,
			response: {
				200: t.Object({
					id: t.String(),
					incident: t.String(),
					status: t.String(),
					lifecycle: t.String(),
					sourceWorkzone: t.Nullable(t.String()),
					statusAt: t.Nullable(t.Date()),
					sourceUpdatedAt: t.Nullable(t.Date()),
					reportedAt: t.Nullable(t.Date()),
					bookingAt: t.Nullable(t.Date()),
					resolvedAt: t.Nullable(t.Date()),
					closedAt: t.Nullable(t.Date()),
					operationalBucket: t.String(),
					kpiSeg: t.String(),
					jenisTiket1: t.Nullable(t.String()),
					jenisTiket2: t.Nullable(t.String()),
					classificationFlag: t.Nullable(t.String()),
					qualityFlags: t.Array(t.String()),
					slaSeconds: t.Nullable(t.Number()),
					ttrDeadlineAt: t.Nullable(t.Date()),
					ttrComplyStatus: t.Nullable(t.String()),
					version: t.Number(),
					workzone: t.Object({
						id: t.String(), code: t.String(), name: t.String(), serviceArea: t.String(),
						branch: t.String(), region: t.String(), area: t.String()
					})
				}),
				404: t.Object({ error: t.Literal('ticket_not_found') }),
				503: t.Object({ error: t.Literal('ticket_data_unavailable') })
			}
		});
}
