import { sql } from 'drizzle-orm';
import {
	 bigint,
	 boolean,
	 check,
	customType,
	 index,
	 integer,
	 jsonb,
	 numeric,
	 pgTable,
	 smallint,
	 text,
	 timestamp,
	 unique,
	 uuid
} from 'drizzle-orm/pg-core';

const id = () => uuid('id').primaryKey().default(sql`uuidv7()`);
const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });
const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
	dataType: () => 'bytea'
});

export const areas = pgTable('areas', {
	id: id(),
	code: text('code').notNull().unique(),
	name: text('name').notNull(),
	active: boolean('active').notNull().default(true),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
});

export const regions = pgTable('regions', {
	id: id(),
	areaId: uuid('area_id').notNull().references(() => areas.id),
	code: text('code').notNull(),
	name: text('name').notNull(),
	active: boolean('active').notNull().default(true),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
}, (table) => [unique('regions_area_code_unique').on(table.areaId, table.code)]);

export const branches = pgTable('branches', {
	id: id(),
	regionId: uuid('region_id').notNull().references(() => regions.id),
	code: text('code').notNull(),
	name: text('name').notNull(),
	active: boolean('active').notNull().default(true),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
}, (table) => [unique('branches_region_code_unique').on(table.regionId, table.code)]);

export const serviceAreas = pgTable('service_areas', {
	id: id(),
	branchId: uuid('branch_id').notNull().references(() => branches.id),
	code: text('code').notNull(),
	name: text('name').notNull(),
	active: boolean('active').notNull().default(true),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
}, (table) => [unique('service_areas_branch_code_unique').on(table.branchId, table.code)]);

export const workzones = pgTable('workzones', {
	id: id(),
	serviceAreaId: uuid('service_area_id').notNull().references(() => serviceAreas.id),
	code: text('code').notNull(),
	name: text('name').notNull(),
	active: boolean('active').notNull().default(true),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
}, (table) => [unique('workzones_service_area_code_unique').on(table.serviceAreaId, table.code)]);

export const roles = pgTable('roles', {
	id: id(),
	code: text('code').notNull().unique(),
	name: text('name').notNull(),
	active: boolean('active').notNull().default(true),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
});

export const permissions = pgTable('permissions', {
	id: id(),
	code: text('code').notNull().unique(),
	description: text('description').notNull(),
	createdAt: timestamptz('created_at').notNull().defaultNow()
});

export const rolePermissions = pgTable('role_permissions', {
	id: id(),
	roleId: uuid('role_id').notNull().references(() => roles.id),
	permissionId: uuid('permission_id').notNull().references(() => permissions.id),
	createdAt: timestamptz('created_at').notNull().defaultNow()
}, (table) => [unique('role_permissions_pair_unique').on(table.roleId, table.permissionId)]);

export const users = pgTable('users', {
	id: id(),
	username: text('username').notNull().unique(),
	displayName: text('display_name').notNull(),
	passwordHash: text('password_hash').notNull(),
	roleId: uuid('role_id').notNull().references(() => roles.id),
	globalScope: boolean('global_scope').notNull().default(false),
	active: boolean('active').notNull().default(true),
	scopeVersion: bigint('scope_version', { mode: 'number' }).notNull().default(1),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
}, (table) => [
	check('users_username_canonical_check', sql`${table.username}=lower(btrim(${table.username}))`)
]);

export const userScopes = pgTable('user_scopes', {
	id: id(),
	userId: uuid('user_id').notNull().references(() => users.id),
	areaId: uuid('area_id').references(() => areas.id),
	regionId: uuid('region_id').references(() => regions.id),
	branchId: uuid('branch_id').references(() => branches.id),
	serviceAreaId: uuid('service_area_id').references(() => serviceAreas.id),
	workzoneId: uuid('workzone_id').references(() => workzones.id),
	createdAt: timestamptz('created_at').notNull().defaultNow()
}, (table) => [
	check('user_scopes_exactly_one_target_check', sql`num_nonnulls(${table.areaId}, ${table.regionId}, ${table.branchId}, ${table.serviceAreaId}, ${table.workzoneId})=1`),
	unique('user_scopes_unique_target').on(table.userId, table.areaId, table.regionId, table.branchId, table.serviceAreaId, table.workzoneId).nullsNotDistinct()
]);

export const sessions = pgTable('sessions', {
	id: id(),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	tokenHash: bytea('token_hash').notNull().unique(),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	expiresAt: timestamptz('expires_at').notNull(),
	revokedAt: timestamptz('revoked_at')
}, (table) => [
	check('sessions_expiry_check', sql`${table.expiresAt}>${table.createdAt}`),
	index('sessions_user').on(table.userId),
	index('sessions_expiry').on(table.expiresAt)
]);

export const tickets = pgTable('tickets', {
	id: id(),
	incident: text('incident').notNull().unique(),
	workzoneId: uuid('workzone_id').references(() => workzones.id),
	sourceWorkzone: text('source_workzone'),
	sourceWitel: text('source_witel'),
	sourceRegion: text('source_region'),
	status: text('status').notNull(),
	lifecycle: text('lifecycle').notNull(),
	dataOrigin: text('data_origin').notNull(),
	migratedAt: timestamptz('migrated_at'),
	firstSourceSeenAt: timestamptz('first_source_seen_at'),
	sourceEndpoint: text('source_endpoint'),
	reportedAt: timestamptz('reported_at'),
	statusAt: timestamptz('status_at'),
	bookingAt: timestamptz('booking_at'),
	resolvedAt: timestamptz('resolved_at'),
	closedAt: timestamptz('closed_at'),
	sourceUpdatedAt: timestamptz('source_updated_at'),
	sourceTicket: text('source_ticket'),
	channel: text('channel'),
	sourceSegment: smallint('source_segment'),
	serviceId: text('service_id'),
	classificationId: text('classification_id'),
	classificationFlag: text('classification_flag'),
	classificationPath: text('classification_path'),
	customerSegment: text('customer_segment'),
	customerType: text('customer_type'),
	serviceType: text('service_type'),
	serviceNo: text('service_no'),
	jenisTiket1: text('jenis_tiket_1'),
	jenisTiket2: text('jenis_tiket_2'),
	operationalBucket: text('operational_bucket').notNull(),
	kpiSeg: text('kpi_seg').notNull(),
	guaranteeStatus: text('guarantee_status'),
	gamasIncident: text('gamas_incident'),
	ownerGroup: text('owner_group'),
	summary: text('summary'),
	sourceDistrict: text('source_district'),
	sourceTifRegion: text('source_tif_region'),
	technology: text('technology'),
	realm: text('realm'),
	isObsolete: boolean('is_obsolete'),
	gaulCount: integer('gaul_count'),
	lastWorkLogAt: timestamptz('last_work_log_at'),
	sourceInsertedAt: timestamptz('source_inserted_at'),
	ttrCustomerRaw: numeric('ttr_customer_raw'),
	ttrEndToEndRaw: numeric('ttr_end_to_end_raw'),
	ttrPendingRaw: numeric('ttr_pending_raw'),
	ttrSlgRaw: numeric('ttr_slg_raw'),
	actualSolution: text('actual_solution'),
	solutionCode: text('solution_code'),
	solutionSegment: text('solution_segment'),
	reportedBy: text('reported_by'),
	symptom: text('symptom'),
	pendingReason: text('pending_reason'),
	sqmUpdateReason: text('sqm_update_reason'),
	flaggingManja: text('flagging_manja'),
	flaggingDatin: text('flagging_datin'),
	needsValidation: boolean('needs_validation').notNull().default(false),
	validationReason: text('validation_reason'),
	slaSeconds: integer('sla_seconds'),
	ttrDeadlineAt: timestamptz('ttr_deadline_at'),
	ttrComplyStatus: text('ttr_comply_status'),
	ruleVersion: text('rule_version').notNull(),
	qualityFlags: text('quality_flags').array().notNull().default(sql`'{}'::text[]`),
	detail: jsonb('detail').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
	sourceHash: bytea('source_hash'),
	version: bigint('version', { mode: 'number' }).notNull().default(1),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
}, (table) => [
	check('tickets_incident_canonical_check', sql`${table.incident}=upper(btrim(${table.incident})) AND ${table.incident} ~ '^[A-Z0-9_-]{1,100}$'`),
	check('tickets_lifecycle_check', sql`${table.lifecycle} IN ('open','closed','unknown')`),
	check('tickets_data_origin_check', sql`${table.dataOrigin} IN ('legacy','nossa','nossa_closed')`),
	check('tickets_source_endpoint_check', sql`${table.sourceEndpoint} IS NULL OR ${table.sourceEndpoint} IN ('nossa','nossa_closed')`),
	check('tickets_bucket_check', sql`${table.operationalBucket} IN ('kpi_customer','kpi_proactive','non_kpi_unspec','non_technical','sqm_update','obsolete','unknown')`),
	check('tickets_kpi_segment_check', sql`${table.kpiSeg} IN ('b2c','b2b','netral','unknown')`),
	check('tickets_gaul_count_check', sql`${table.gaulCount} IS NULL OR ${table.gaulCount}>=0`),
	check('tickets_sla_seconds_check', sql`${table.slaSeconds} IS NULL OR ${table.slaSeconds}>0`),
	check('tickets_ttr_comply_check', sql`${table.ttrComplyStatus} IS NULL OR ${table.ttrComplyStatus} IN ('comply','not_comply')`),
	check('tickets_detail_object_check', sql`jsonb_typeof(${table.detail})='object'`),
	check('tickets_source_hash_length_check', sql`${table.sourceHash} IS NULL OR octet_length(${table.sourceHash})=32`),
	check('tickets_version_check', sql`${table.version}>0`),
	check('tickets_lifecycle_closed_date_check', sql`${table.lifecycle}<>'open' OR ${table.closedAt} IS NULL`),
	check('tickets_migration_origin_check', sql`(${table.dataOrigin}='legacy' AND ${table.migratedAt} IS NOT NULL) OR (${table.dataOrigin}<>'legacy' AND ${table.migratedAt} IS NULL)`),
	check('tickets_source_provenance_check', sql`(${table.sourceEndpoint} IS NULL AND ${table.sourceHash} IS NULL AND ${table.firstSourceSeenAt} IS NULL AND ${table.dataOrigin}='legacy') OR (${table.sourceEndpoint} IS NOT NULL AND ${table.sourceHash} IS NOT NULL AND ${table.firstSourceSeenAt} IS NOT NULL)`),
	index('tickets_open_scope_reported').on(table.workzoneId, table.reportedAt.desc(), table.id.desc()).where(sql`${table.lifecycle}='open' AND ${table.reportedAt} IS NOT NULL`),
	index('tickets_open_global_reported').on(table.reportedAt.desc(), table.id.desc()).where(sql`${table.lifecycle}='open' AND ${table.reportedAt} IS NOT NULL`),
	index('tickets_closed_scope_date').on(table.workzoneId, table.closedAt.desc(), table.id.desc()).where(sql`${table.lifecycle}='closed' AND ${table.closedAt} IS NOT NULL`),
	index('tickets_history_scope_date').on(table.workzoneId, table.reportedAt.desc(), table.id.desc()).where(sql`${table.reportedAt} IS NOT NULL`),
	index('tickets_history_date').on(table.reportedAt.desc(), table.id.desc()).where(sql`${table.reportedAt} IS NOT NULL`),
	index('tickets_closed_date').on(table.closedAt.desc(), table.id.desc()).where(sql`${table.lifecycle}='closed' AND ${table.closedAt} IS NOT NULL`),
	index('tickets_service_reported').on(table.serviceNo, table.reportedAt.desc(), table.id.desc()).where(sql`${table.serviceNo} IS NOT NULL`)
]);

export const ticketStatusEvents = pgTable('ticket_status_events', {
	id: id(),
	ticketId: uuid('ticket_id').notNull().references(() => tickets.id),
	ticketVersion: bigint('ticket_version', { mode: 'number' }).notNull(),
	fromStatus: text('from_status'),
	toStatus: text('to_status').notNull(),
	fromLifecycle: text('from_lifecycle'),
	toLifecycle: text('to_lifecycle').notNull(),
	effectiveAt: timestamptz('effective_at'),
	observedAt: timestamptz('observed_at').notNull().defaultNow(),
	sourceEndpoint: text('source_endpoint').notNull()
}, (table) => [
	unique('ticket_status_events_ticket_version_unique').on(table.ticketId, table.ticketVersion),
	check('ticket_status_events_source_check', sql`${table.sourceEndpoint} IN ('nossa','nossa_closed')`)
]);

export const syncRuns = pgTable('sync_runs', {
	id: id(),
	stream: text('stream').notNull(),
	status: text('status').notNull(),
	windowFrom: timestamptz('window_from'),
	windowTo: timestamptz('window_to'),
	startedAt: timestamptz('started_at').notNull().defaultNow(),
	finishedAt: timestamptz('finished_at'),
	pages: integer('pages').notNull().default(0),
	fetched: bigint('fetched', { mode: 'bigint' }).notNull().default(sql`0`),
	inserted: bigint('inserted', { mode: 'bigint' }).notNull().default(sql`0`),
	updated: bigint('updated', { mode: 'bigint' }).notNull().default(sql`0`),
	unchanged: bigint('unchanged', { mode: 'bigint' }).notNull().default(sql`0`),
	stale: bigint('stale', { mode: 'bigint' }).notNull().default(sql`0`),
	rejected: bigint('rejected', { mode: 'bigint' }).notNull().default(sql`0`),
	errorCode: text('error_code')
}, (table) => [
	check('sync_runs_stream_check', sql`${table.stream} IN ('open','closed','backfill','lookup','legacy_migration')`),
	check('sync_runs_status_check', sql`${table.status} IN ('running','succeeded','partial','failed')`),
	check('sync_runs_window_check', sql`${table.windowTo} IS NULL OR ${table.windowFrom}<${table.windowTo}`),
	index('sync_runs_stream_started').on(table.stream, table.startedAt.desc())
]);

export const ticketLegacyArchive = pgTable('ticket_legacy_archive', {
	id: id(),
	legacyTicketId: bigint('legacy_ticket_id', { mode: 'number' }).notNull().unique(),
	ticketId: uuid('ticket_id').references(() => tickets.id),
	runId: uuid('run_id').notNull().references(() => syncRuns.id),
	legacyPayload: jsonb('legacy_payload').$type<Record<string, unknown>>().notNull(),
	disposition: text('disposition').notNull(),
	reasonCode: text('reason_code'),
	rowHash: bytea('row_hash').notNull(),
	migratedAt: timestamptz('migrated_at').notNull().defaultNow()
}, (table) => [
	check('ticket_legacy_archive_payload_check', sql`jsonb_typeof(${table.legacyPayload})='object'`),
	check('ticket_legacy_archive_disposition_check', sql`${table.disposition} IN ('imported','merged','quarantined','excluded')`),
	check('ticket_legacy_archive_hash_length_check', sql`octet_length(${table.rowHash})=32`),
	check('ticket_legacy_archive_mapping_check', sql`(${table.disposition} IN ('imported','merged') AND ${table.ticketId} IS NOT NULL) OR (${table.disposition} IN ('quarantined','excluded') AND ${table.ticketId} IS NULL)`),
	check('ticket_legacy_archive_reason_check', sql`${table.disposition}='imported' OR ${table.reasonCode} IS NOT NULL`),
	index('ticket_legacy_archive_ticket').on(table.ticketId).where(sql`${table.ticketId} IS NOT NULL`)
]);

export const syncCheckpoints = pgTable('sync_checkpoints', {
	id: id(),
	stream: text('stream').notNull().unique(),
	coveredUntil: timestamptz('covered_until'),
	lastSuccessAt: timestamptz('last_success_at'),
	lastAttemptAt: timestamptz('last_attempt_at'),
	lastRunId: uuid('last_run_id').references(() => syncRuns.id),
	state: jsonb('state').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`)
});

export const syncQuarantine = pgTable('sync_quarantine', {
	id: id(),
	runId: uuid('run_id').notNull().references(() => syncRuns.id),
	incident: text('incident'),
	reason: text('reason').notNull(),
	fingerprint: bytea('fingerprint').notNull(),
	payload: jsonb('payload').$type<Record<string, unknown>>(),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	resolvedAt: timestamptz('resolved_at')
}, (table) => [
	unique('sync_quarantine_run_fingerprint_reason_unique').on(table.runId, table.fingerprint, table.reason),
	index('sync_quarantine_pending').on(table.createdAt).where(sql`${table.resolvedAt} IS NULL`)
]);

export const syncRevision = pgTable('sync_revision', {
	id: id(),
	singleton: boolean('singleton').notNull().default(true).unique(),
	revision: bigint('revision', { mode: 'number' }).notNull().default(0),
	updatedAt: timestamptz('updated_at').notNull().defaultNow()
}, (table) => [check('sync_revision_singleton_check', sql`${table.singleton}`)]);

export const auditEvents = pgTable('audit_events', {
	id: id(),
	actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
	action: text('action').notNull(),
	targetId: uuid('target_id'),
	requestId: text('request_id').notNull(),
	metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
	createdAt: timestamptz('created_at').notNull().defaultNow()
}, (table) => [index('audit_events_date').on(table.createdAt.desc(), table.id.desc())]);
