import { randomBytes, randomUUID } from 'node:crypto';
import { Elysia, t } from 'elysia';
import { findTicketDetail, listTickets, type TicketListFilters } from '@dompis/db';
import { normalizeIncident } from '@dompis/contracts';
import { database } from '@dompis/db';
import { createPermissionGuard } from './permission-guard';
import { createTicketCursorCodec } from './ticket-cursor';

export const TICKET_READ_PERMISSION = 'tickets.read';
const invalidRequestResponse = t.Object({ error: t.Literal('invalid_request'), requestId: t.String() });
const internalErrorResponse = t.Object({ error: t.Literal('internal_error'), requestId: t.String() });
type TicketDatabase = NonNullable<typeof database>;
const lifecycleQuery = t.Union([t.Literal('open'), t.Literal('closed'), t.Literal('unknown')]);
const bucketQuery = t.Union([
	t.Literal('kpi_customer'), t.Literal('kpi_proactive'), t.Literal('non_kpi_unspec'),
	t.Literal('non_technical'), t.Literal('sqm_update'), t.Literal('obsolete'), t.Literal('unknown')
]);
const listQuery = t.Object({
	lifecycle: t.Optional(lifecycleQuery),
	bucket: t.Optional(bucketQuery),
	status: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
	search: t.Optional(t.String({ minLength: 1, maxLength: 160 })),
	areaId: t.Optional(t.String({ format: 'uuid' })),
	regionId: t.Optional(t.String({ format: 'uuid' })),
	branchId: t.Optional(t.String({ format: 'uuid' })),
	serviceAreaId: t.Optional(t.String({ format: 'uuid' })),
	workzoneId: t.Optional(t.String({ format: 'uuid' })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, multipleOf: 1 })),
	cursor: t.Optional(t.String({ minLength: 1, maxLength: 2048 }))
});

const ticketListItem = t.Object({
	id: t.String(),
	incident: t.String(),
	status: t.String(),
	lifecycle: t.String(),
	sourceWorkzone: t.Nullable(t.String()),
	reportedAt: t.Nullable(t.Date()),
	statusAt: t.Nullable(t.Date()),
	bookingAt: t.Nullable(t.Date()),
	operationalBucket: t.String(),
	kpiSeg: t.String(),
	jenisTiket1: t.Nullable(t.String()),
	jenisTiket2: t.Nullable(t.String()),
	classificationFlag: t.Nullable(t.String()),
	qualityFlags: t.Array(t.String()),
	workzone: t.Object({
		id: t.String(), code: t.String(), name: t.String(), serviceArea: t.String(),
		branch: t.String(), region: t.String(), area: t.String()
	})
});

export function createTicketRoutes(database: TicketDatabase | undefined, cursorSecret: Uint8Array = randomBytes(32)) {
	const cursorCodec = createTicketCursorCodec(cursorSecret);
	return new Elysia({ name: 'dompis-ticket-routes' })
		.use(createPermissionGuard(database))
		.get('/tickets', async ({ authorization, query, set }) => {
			const search = query.search?.trim();
			if (query.search !== undefined && (!search || /[\u0000-\u001f\u007f]/.test(search))) {
				set.status = 400;
				return { error: 'invalid_request' as const, requestId: String(set.headers['x-request-id'] ?? randomUUID()) };
			}

			const normalizedSearch = search ? normalizeIncident(search) : undefined;
			const canonicalSearch = normalizedSearch?.ok ? normalizedSearch.incident : search ?? null;
			const filters = {
				lifecycle: query.lifecycle ?? null,
				bucket: query.bucket ?? null,
				status: query.status ?? null,
				search: search ?? null,
				normalizedIncident: canonicalSearch,
				areaId: query.areaId ?? null,
				regionId: query.regionId ?? null,
				branchId: query.branchId ?? null,
				serviceAreaId: query.serviceAreaId ?? null,
				workzoneId: query.workzoneId ?? null,
				limit: query.limit ?? 50
			};
			const filterKey = JSON.stringify(filters);
			const decodedPosition = query.cursor
				? cursorCodec.decode(query.cursor, authorization, filterKey)
				: undefined;
			if (query.cursor && !decodedPosition) {
				set.status = 400;
				return { error: 'invalid_request' as const, requestId: String(set.headers['x-request-id'] ?? randomUUID()) };
			}
			const position = decodedPosition ?? undefined;
			if (!database) {
				set.status = 503;
				return { error: 'ticket_data_unavailable' as const };
			}

			const ticketFilters: TicketListFilters = {
				...(query.lifecycle ? { lifecycle: query.lifecycle } : {}),
				...(query.bucket ? { bucket: query.bucket } : {}),
				...(query.status ? { status: query.status } : {}),
				...(normalizedSearch?.ok ? { incident: normalizedSearch.incident } : {}),
				...(search ? { serviceNo: search } : {}),
				...(query.areaId ? { areaId: query.areaId } : {}),
				...(query.regionId ? { regionId: query.regionId } : {}),
				...(query.branchId ? { branchId: query.branchId } : {}),
				...(query.serviceAreaId ? { serviceAreaId: query.serviceAreaId } : {}),
				...(query.workzoneId ? { workzoneId: query.workzoneId } : {})
			};
			const limit = query.limit ?? 50;
			const rows = await listTickets(database, authorization, ticketFilters, limit, position);
			const hasMore = rows.length > limit;
			const page = hasMore ? rows.slice(0, limit) : rows;
			const last = page.at(-1);
			const nextCursor = hasMore && last
				? cursorCodec.encode(authorization, filterKey, { reportedAt: last.reportedAtCursor, id: last.id })
				: null;
			return {
				items: page.map((ticket) => ({
					id: ticket.id,
					incident: ticket.incident,
					status: ticket.status,
					lifecycle: ticket.lifecycle,
					sourceWorkzone: ticket.sourceWorkzone,
					reportedAt: ticket.reportedAt,
					statusAt: ticket.statusAt,
					bookingAt: ticket.bookingAt,
					operationalBucket: ticket.operationalBucket,
					kpiSeg: ticket.kpiSeg,
					jenisTiket1: ticket.jenisTiket1,
					jenisTiket2: ticket.jenisTiket2,
					classificationFlag: ticket.classificationFlag,
					qualityFlags: ticket.qualityFlags,
					workzone: {
						id: ticket.workzoneId,
						code: ticket.workzoneCode,
						name: ticket.workzoneName,
						serviceArea: ticket.serviceAreaName,
						branch: ticket.branchName,
						region: ticket.regionName,
						area: ticket.areaName
					}
				})),
				nextCursor
			};
		}, {
			query: listQuery,
			requirePermission: TICKET_READ_PERMISSION,
			response: {
				200: t.Object({ items: t.Array(ticketListItem), nextCursor: t.Nullable(t.String()) }),
				400: invalidRequestResponse,
				401: t.Object({ error: t.Literal('unauthenticated') }),
				403: t.Object({ error: t.Literal('forbidden') }),
				503: t.Union([
					t.Object({ error: t.Literal('authorization_unavailable') }),
					t.Object({ error: t.Literal('ticket_data_unavailable') })
				]),
				422: invalidRequestResponse,
				500: internalErrorResponse
			}
		})
		.get('/tickets/:incident', async ({ authorization, params, set }) => {
			if (!database) {
				set.status = 503;
				return { error: 'ticket_data_unavailable' as const };
			}
			const normalized = normalizeIncident(params.incident);
			if (!normalized.ok) {
				set.status = 404;
				return { error: 'ticket_not_found' as const };
			}
			const ticket = await findTicketDetail(database, authorization, normalized.incident);
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
				401: t.Object({ error: t.Literal('unauthenticated') }),
				403: t.Object({ error: t.Literal('forbidden') }),
				404: t.Object({ error: t.Literal('ticket_not_found') }),
				503: t.Union([
					t.Object({ error: t.Literal('authorization_unavailable') }),
					t.Object({ error: t.Literal('ticket_data_unavailable') })
				]),
				422: invalidRequestResponse,
				500: internalErrorResponse
			}
		});
}
