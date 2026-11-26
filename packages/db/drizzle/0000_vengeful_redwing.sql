CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"target_id" uuid,
	"request_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"region_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "branches_region_code_unique" UNIQUE("region_id","code")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "sessions_expiry_check" CHECK ("sessions"."expires_at">"sessions"."created_at")
);
--> statement-breakpoint
CREATE TABLE "sync_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"stream" text NOT NULL,
	"covered_until" timestamp with time zone,
	"last_success_at" timestamp with time zone,
	"last_attempt_at" timestamp with time zone,
	"last_run_id" uuid,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "sync_checkpoints_stream_unique" UNIQUE("stream")
);
--> statement-breakpoint
CREATE TABLE "sync_quarantine" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"run_id" uuid NOT NULL,
	"incident" text,
	"reason" text NOT NULL,
	"fingerprint" "bytea" NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "sync_quarantine_run_fingerprint_reason_unique" UNIQUE("run_id","fingerprint","reason")
);
--> statement-breakpoint
CREATE TABLE "sync_revision" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"singleton" boolean DEFAULT true NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sync_revision_singleton_unique" UNIQUE("singleton"),
	CONSTRAINT "sync_revision_singleton_check" CHECK ("sync_revision"."singleton")
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"stream" text NOT NULL,
	"status" text NOT NULL,
	"window_from" timestamp with time zone,
	"window_to" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"pages" integer DEFAULT 0 NOT NULL,
	"fetched" bigint DEFAULT 0 NOT NULL,
	"inserted" bigint DEFAULT 0 NOT NULL,
	"updated" bigint DEFAULT 0 NOT NULL,
	"unchanged" bigint DEFAULT 0 NOT NULL,
	"stale" bigint DEFAULT 0 NOT NULL,
	"rejected" bigint DEFAULT 0 NOT NULL,
	"error_code" text,
	CONSTRAINT "sync_runs_stream_check" CHECK ("sync_runs"."stream" IN ('open','closed','backfill','lookup','legacy_migration')),
	CONSTRAINT "sync_runs_status_check" CHECK ("sync_runs"."status" IN ('running','succeeded','partial','failed')),
	CONSTRAINT "sync_runs_window_check" CHECK ("sync_runs"."window_to" IS NULL OR "sync_runs"."window_from"<"sync_runs"."window_to")
);
--> statement-breakpoint
CREATE TABLE "ticket_legacy_archive" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"legacy_ticket_id" bigint NOT NULL,
	"ticket_id" uuid,
	"run_id" uuid NOT NULL,
	"legacy_payload" jsonb NOT NULL,
	"disposition" text NOT NULL,
	"reason_code" text,
	"row_hash" "bytea" NOT NULL,
	"migrated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_legacy_archive_legacy_ticket_id_unique" UNIQUE("legacy_ticket_id"),
	CONSTRAINT "ticket_legacy_archive_payload_check" CHECK (jsonb_typeof("ticket_legacy_archive"."legacy_payload")='object'),
	CONSTRAINT "ticket_legacy_archive_disposition_check" CHECK ("ticket_legacy_archive"."disposition" IN ('imported','merged','quarantined','excluded')),
	CONSTRAINT "ticket_legacy_archive_hash_length_check" CHECK (octet_length("ticket_legacy_archive"."row_hash")=32),
	CONSTRAINT "ticket_legacy_archive_mapping_check" CHECK (("ticket_legacy_archive"."disposition" IN ('imported','merged') AND "ticket_legacy_archive"."ticket_id" IS NOT NULL) OR ("ticket_legacy_archive"."disposition" IN ('quarantined','excluded') AND "ticket_legacy_archive"."ticket_id" IS NULL)),
	CONSTRAINT "ticket_legacy_archive_reason_check" CHECK ("ticket_legacy_archive"."disposition"='imported' OR "ticket_legacy_archive"."reason_code" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "ticket_status_events" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"ticket_version" bigint NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"from_lifecycle" text,
	"to_lifecycle" text NOT NULL,
	"effective_at" timestamp with time zone,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_endpoint" text NOT NULL,
	CONSTRAINT "ticket_status_events_ticket_version_unique" UNIQUE("ticket_id","ticket_version"),
	CONSTRAINT "ticket_status_events_source_check" CHECK ("ticket_status_events"."source_endpoint" IN ('nossa','nossa_closed'))
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"incident" text NOT NULL,
	"workzone_id" uuid,
	"source_workzone" text,
	"source_witel" text,
	"source_region" text,
	"status" text NOT NULL,
	"lifecycle" text NOT NULL,
	"data_origin" text NOT NULL,
	"migrated_at" timestamp with time zone,
	"first_source_seen_at" timestamp with time zone,
	"source_endpoint" text,
	"reported_at" timestamp with time zone,
	"status_at" timestamp with time zone,
	"booking_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"source_updated_at" timestamp with time zone,
	"source_ticket" text,
	"channel" text,
	"source_segment" smallint,
	"service_id" text,
	"classification_id" text,
	"classification_flag" text,
	"classification_path" text,
	"customer_segment" text,
	"customer_type" text,
	"service_type" text,
	"service_no" text,
	"jenis_tiket_1" text,
	"jenis_tiket_2" text,
	"operational_bucket" text NOT NULL,
	"kpi_seg" text NOT NULL,
	"guarantee_status" text,
	"gamas_incident" text,
	"owner_group" text,
	"summary" text,
	"source_district" text,
	"source_tif_region" text,
	"technology" text,
	"realm" text,
	"is_obsolete" boolean,
	"gaul_count" integer,
	"last_work_log_at" timestamp with time zone,
	"source_inserted_at" timestamp with time zone,
	"ttr_customer_raw" numeric,
	"ttr_end_to_end_raw" numeric,
	"ttr_pending_raw" numeric,
	"ttr_slg_raw" numeric,
	"actual_solution" text,
	"solution_code" text,
	"solution_segment" text,
	"reported_by" text,
	"symptom" text,
	"pending_reason" text,
	"sqm_update_reason" text,
	"flagging_manja" text,
	"flagging_datin" text,
	"needs_validation" boolean DEFAULT false NOT NULL,
	"validation_reason" text,
	"sla_seconds" integer,
	"ttr_deadline_at" timestamp with time zone,
	"ttr_comply_status" text,
	"rule_version" text NOT NULL,
	"quality_flags" text[] DEFAULT '{}'::text[] NOT NULL,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source_hash" "bytea",
	"version" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_incident_unique" UNIQUE("incident"),
	CONSTRAINT "tickets_incident_canonical_check" CHECK ("tickets"."incident"=upper(btrim("tickets"."incident")) AND "tickets"."incident" ~ '^[A-Z0-9_-]{1,100}$'),
	CONSTRAINT "tickets_lifecycle_check" CHECK ("tickets"."lifecycle" IN ('open','closed','unknown')),
	CONSTRAINT "tickets_data_origin_check" CHECK ("tickets"."data_origin" IN ('legacy','nossa','nossa_closed')),
	CONSTRAINT "tickets_source_endpoint_check" CHECK ("tickets"."source_endpoint" IS NULL OR "tickets"."source_endpoint" IN ('nossa','nossa_closed')),
	CONSTRAINT "tickets_bucket_check" CHECK ("tickets"."operational_bucket" IN ('kpi_customer','kpi_proactive','non_kpi_unspec','non_technical','sqm_update','obsolete','unknown')),
	CONSTRAINT "tickets_kpi_segment_check" CHECK ("tickets"."kpi_seg" IN ('b2c','b2b','netral','unknown')),
	CONSTRAINT "tickets_gaul_count_check" CHECK ("tickets"."gaul_count" IS NULL OR "tickets"."gaul_count">=0),
	CONSTRAINT "tickets_sla_seconds_check" CHECK ("tickets"."sla_seconds" IS NULL OR "tickets"."sla_seconds">0),
	CONSTRAINT "tickets_ttr_comply_check" CHECK ("tickets"."ttr_comply_status" IS NULL OR "tickets"."ttr_comply_status" IN ('comply','not_comply')),
	CONSTRAINT "tickets_detail_object_check" CHECK (jsonb_typeof("tickets"."detail")='object'),
	CONSTRAINT "tickets_source_hash_length_check" CHECK ("tickets"."source_hash" IS NULL OR octet_length("tickets"."source_hash")=32),
	CONSTRAINT "tickets_version_check" CHECK ("tickets"."version">0),
	CONSTRAINT "tickets_lifecycle_closed_date_check" CHECK ("tickets"."lifecycle"<>'open' OR "tickets"."closed_at" IS NULL),
	CONSTRAINT "tickets_migration_origin_check" CHECK (("tickets"."data_origin"='legacy' AND "tickets"."migrated_at" IS NOT NULL) OR ("tickets"."data_origin"<>'legacy' AND "tickets"."migrated_at" IS NULL)),
	CONSTRAINT "tickets_source_provenance_check" CHECK (("tickets"."source_endpoint" IS NULL AND "tickets"."source_hash" IS NULL AND "tickets"."first_source_seen_at" IS NULL AND "tickets"."data_origin"='legacy') OR ("tickets"."source_endpoint" IS NOT NULL AND "tickets"."source_hash" IS NOT NULL AND "tickets"."first_source_seen_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "user_workzones" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"workzone_id" uuid NOT NULL,
	CONSTRAINT "user_workzones_user_zone_unique" UNIQUE("user_id","workzone_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"global_scope" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"scope_version" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_role_check" CHECK ("users"."role" IN ('superadmin','admin','helpdesk','viewer')),
	CONSTRAINT "users_username_canonical_check" CHECK ("users"."username"=lower(btrim("users"."username")))
);
--> statement-breakpoint
CREATE TABLE "workzones" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"branch_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"service_area" text,
	CONSTRAINT "workzones_branch_code_unique" UNIQUE("branch_id","code")
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_checkpoints" ADD CONSTRAINT "sync_checkpoints_last_run_id_sync_runs_id_fk" FOREIGN KEY ("last_run_id") REFERENCES "public"."sync_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_quarantine" ADD CONSTRAINT "sync_quarantine_run_id_sync_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."sync_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_legacy_archive" ADD CONSTRAINT "ticket_legacy_archive_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_legacy_archive" ADD CONSTRAINT "ticket_legacy_archive_run_id_sync_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."sync_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_status_events" ADD CONSTRAINT "ticket_status_events_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_workzone_id_workzones_id_fk" FOREIGN KEY ("workzone_id") REFERENCES "public"."workzones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workzones" ADD CONSTRAINT "user_workzones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workzones" ADD CONSTRAINT "user_workzones_workzone_id_workzones_id_fk" FOREIGN KEY ("workzone_id") REFERENCES "public"."workzones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workzones" ADD CONSTRAINT "workzones_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_date" ON "audit_events" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "sessions_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expiry" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sync_quarantine_pending" ON "sync_quarantine" USING btree ("created_at") WHERE "sync_quarantine"."resolved_at" IS NULL;--> statement-breakpoint
CREATE INDEX "sync_runs_stream_started" ON "sync_runs" USING btree ("stream","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ticket_legacy_archive_ticket" ON "ticket_legacy_archive" USING btree ("ticket_id") WHERE "ticket_legacy_archive"."ticket_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "tickets_open_scope_reported" ON "tickets" USING btree ("workzone_id","reported_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "tickets"."lifecycle"='open' AND "tickets"."reported_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "tickets_open_global_reported" ON "tickets" USING btree ("reported_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "tickets"."lifecycle"='open' AND "tickets"."reported_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "tickets_closed_scope_date" ON "tickets" USING btree ("workzone_id","closed_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "tickets"."lifecycle"='closed' AND "tickets"."closed_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "tickets_history_scope_date" ON "tickets" USING btree ("workzone_id","reported_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "tickets"."reported_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "tickets_history_date" ON "tickets" USING btree ("reported_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "tickets"."reported_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "tickets_closed_date" ON "tickets" USING btree ("closed_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "tickets"."lifecycle"='closed' AND "tickets"."closed_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "tickets_service_reported" ON "tickets" USING btree ("service_no","reported_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "tickets"."service_no" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "user_workzones_reverse" ON "user_workzones" USING btree ("workzone_id");--> statement-breakpoint
INSERT INTO "sync_revision" DEFAULT VALUES;--> statement-breakpoint
