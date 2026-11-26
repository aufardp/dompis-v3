-- FINAL BLUEPRINT v1.1 — IMPLEMENTATION CANDIDATE; PostgreSQL 18; not executed or production validated.
CREATE TABLE regions (
 id uuid PRIMARY KEY DEFAULT uuidv7(), code text NOT NULL UNIQUE, name text NOT NULL
);
CREATE TABLE branches (
 id uuid PRIMARY KEY DEFAULT uuidv7(), region_id uuid NOT NULL REFERENCES regions(id),
 code text NOT NULL, name text NOT NULL, UNIQUE(region_id,code)
);
CREATE TABLE workzones (
 id uuid PRIMARY KEY DEFAULT uuidv7(), branch_id uuid NOT NULL REFERENCES branches(id),
 code text NOT NULL, name text NOT NULL, service_area text,
 UNIQUE(branch_id,code)
);
CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT uuidv7(), username text NOT NULL UNIQUE,
 display_name text NOT NULL, password_hash text NOT NULL,
 role text NOT NULL CHECK(role IN ('superadmin','admin','helpdesk','viewer')),
 global_scope boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true,
 scope_version bigint NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(username=lower(btrim(username)))
);
CREATE TABLE user_workzones (
 id uuid PRIMARY KEY DEFAULT uuidv7(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 workzone_id uuid NOT NULL REFERENCES workzones(id), UNIQUE(user_id,workzone_id)
);
CREATE TABLE sessions (
 id uuid PRIMARY KEY DEFAULT uuidv7(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 token_hash bytea NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL, revoked_at timestamptz,
 CHECK(expires_at>created_at)
);
CREATE TABLE tickets (
 id uuid PRIMARY KEY DEFAULT uuidv7(),
 incident text NOT NULL UNIQUE CHECK(incident=upper(btrim(incident)) AND incident ~ '^[A-Z0-9_-]{1,100}$'),
 workzone_id uuid REFERENCES workzones(id), source_workzone text, source_witel text, source_region text,
 status text NOT NULL, lifecycle text NOT NULL CHECK(lifecycle IN ('open','closed','unknown')),
 data_origin text NOT NULL CHECK(data_origin IN ('legacy','nossa','nossa_closed')),
 migrated_at timestamptz, first_source_seen_at timestamptz,
 source_endpoint text CHECK(source_endpoint IN ('nossa','nossa_closed')),
 reported_at timestamptz, status_at timestamptz, booking_at timestamptz,
 resolved_at timestamptz, closed_at timestamptz, source_updated_at timestamptz,
 source_ticket text, channel text, source_segment smallint, service_id text, classification_id text, classification_flag text, classification_path text,
 customer_segment text, customer_type text, service_type text, service_no text,
 jenis_tiket_1 text, jenis_tiket_2 text,
 operational_bucket text NOT NULL CHECK(operational_bucket IN ('kpi_customer','kpi_proactive','non_kpi_unspec','non_technical','sqm_update','obsolete','unknown')),
 kpi_seg text NOT NULL CHECK(kpi_seg IN ('b2c','b2b','netral','unknown')),
 guarantee_status text, gamas_incident text, owner_group text, summary text,
 source_district text, source_tif_region text, technology text, realm text,
 is_obsolete boolean, gaul_count integer CHECK(gaul_count>=0),
 last_work_log_at timestamptz, source_inserted_at timestamptz,
 ttr_customer_raw numeric, ttr_end_to_end_raw numeric, ttr_pending_raw numeric, ttr_slg_raw numeric,
 actual_solution text, solution_code text, solution_segment text, reported_by text,
 symptom text, pending_reason text, sqm_update_reason text,
 flagging_manja text, flagging_datin text, needs_validation boolean NOT NULL DEFAULT false,
 validation_reason text, sla_seconds integer CHECK(sla_seconds>0),
 ttr_deadline_at timestamptz, ttr_comply_status text CHECK(ttr_comply_status IN ('comply','not_comply')),
 rule_version text NOT NULL, quality_flags text[] NOT NULL DEFAULT '{}',
 detail jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(detail)='object'),
 source_hash bytea CHECK(octet_length(source_hash)=32),
 version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(lifecycle<>'open' OR closed_at IS NULL),
 CHECK((data_origin='legacy' AND migrated_at IS NOT NULL) OR (data_origin<>'legacy' AND migrated_at IS NULL)),
 CHECK((source_endpoint IS NULL AND source_hash IS NULL AND first_source_seen_at IS NULL AND data_origin='legacy') OR
       (source_endpoint IS NOT NULL AND source_hash IS NOT NULL AND first_source_seen_at IS NOT NULL))
);
CREATE TABLE ticket_status_events (
 id uuid PRIMARY KEY DEFAULT uuidv7(), ticket_id uuid NOT NULL REFERENCES tickets(id),
 ticket_version bigint NOT NULL, from_status text, to_status text NOT NULL,
 from_lifecycle text, to_lifecycle text NOT NULL,
 effective_at timestamptz, observed_at timestamptz NOT NULL DEFAULT now(),
 source_endpoint text NOT NULL CHECK(source_endpoint IN ('nossa','nossa_closed')),
 UNIQUE(ticket_id,ticket_version)
);
CREATE TABLE sync_runs (
 id uuid PRIMARY KEY DEFAULT uuidv7(), stream text NOT NULL CHECK(stream IN ('open','closed','backfill','lookup','legacy_migration')),
 status text NOT NULL CHECK(status IN ('running','succeeded','partial','failed')),
 window_from timestamptz, window_to timestamptz,
 started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
 pages integer NOT NULL DEFAULT 0, fetched bigint NOT NULL DEFAULT 0,
 inserted bigint NOT NULL DEFAULT 0, updated bigint NOT NULL DEFAULT 0,
 unchanged bigint NOT NULL DEFAULT 0, stale bigint NOT NULL DEFAULT 0,
 rejected bigint NOT NULL DEFAULT 0, error_code text,
 CHECK(window_to IS NULL OR window_from<window_to)
);
-- Cold archive / ID mapping for a single approved MySQL ticket dataset.
-- One source row per legacy ID, including unresolved rows; never queried by normal lists.
CREATE TABLE ticket_legacy_archive (
 id uuid PRIMARY KEY DEFAULT uuidv7(),
 legacy_ticket_id bigint NOT NULL UNIQUE,
 ticket_id uuid REFERENCES tickets(id),
 run_id uuid NOT NULL REFERENCES sync_runs(id),
 legacy_payload jsonb NOT NULL CHECK(jsonb_typeof(legacy_payload)='object'),
 disposition text NOT NULL CHECK(disposition IN ('imported','merged','quarantined','excluded')),
 reason_code text,
 row_hash bytea NOT NULL CHECK(octet_length(row_hash)=32),
 migrated_at timestamptz NOT NULL DEFAULT now(),
 CHECK((disposition IN ('imported','merged') AND ticket_id IS NOT NULL) OR
       (disposition IN ('quarantined','excluded') AND ticket_id IS NULL)),
 CHECK(disposition='imported' OR reason_code IS NOT NULL)
);
CREATE INDEX ticket_legacy_archive_ticket ON ticket_legacy_archive(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE TABLE sync_checkpoints (
 id uuid PRIMARY KEY DEFAULT uuidv7(), stream text NOT NULL UNIQUE,
 covered_until timestamptz, last_success_at timestamptz, last_attempt_at timestamptz,
 last_run_id uuid REFERENCES sync_runs(id), state jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE sync_quarantine (
 id uuid PRIMARY KEY DEFAULT uuidv7(), run_id uuid NOT NULL REFERENCES sync_runs(id),
 incident text, reason text NOT NULL, fingerprint bytea NOT NULL,
 payload jsonb, created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz,
 UNIQUE(run_id,fingerprint,reason)
);
CREATE TABLE sync_revision (
 id uuid PRIMARY KEY DEFAULT uuidv7(), singleton boolean NOT NULL UNIQUE DEFAULT true CHECK(singleton),
 revision bigint NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO sync_revision DEFAULT VALUES;
CREATE TABLE audit_events (
 id uuid PRIMARY KEY DEFAULT uuidv7(), actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
 action text NOT NULL, target_id uuid, request_id text NOT NULL,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);

-- Incident lookup already covered by UNIQUE; no duplicate index.
CREATE INDEX tickets_open_scope_reported ON tickets(workzone_id,reported_at DESC,id DESC)
 WHERE lifecycle='open' AND reported_at IS NOT NULL;
CREATE INDEX tickets_open_global_reported ON tickets(reported_at DESC,id DESC)
 WHERE lifecycle='open' AND reported_at IS NOT NULL;
CREATE INDEX tickets_closed_scope_date ON tickets(workzone_id,closed_at DESC,id DESC)
 WHERE lifecycle='closed' AND closed_at IS NOT NULL;
CREATE INDEX tickets_history_scope_date ON tickets(workzone_id,reported_at DESC,id DESC)
 WHERE reported_at IS NOT NULL;
CREATE INDEX tickets_history_date ON tickets(reported_at DESC,id DESC)
 WHERE reported_at IS NOT NULL;
CREATE INDEX tickets_closed_date ON tickets(closed_at DESC,id DESC)
 WHERE lifecycle='closed' AND closed_at IS NOT NULL;
CREATE INDEX tickets_service_reported ON tickets(service_no,reported_at DESC,id DESC)
 WHERE service_no IS NOT NULL;
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE INDEX user_workzones_reverse ON user_workzones(workzone_id);
CREATE INDEX sync_runs_stream_started ON sync_runs(stream,started_at DESC);
CREATE INDEX sync_quarantine_pending ON sync_quarantine(created_at) WHERE resolved_at IS NULL;
CREATE INDEX audit_events_date ON audit_events(created_at DESC,id DESC);
