# Phase 3A — Legacy Migration Readiness

Tanggal: 2026-11-26. Status: **preflight evidence consolidated; ETL implementation and execution are not ready**.

## Scope and evidence reviewed

Reviewed `Implementation-Plan.md`, `Database-Access.md`, `Migration.md`, `Migration-Validation.md`, `Master-Data-Migration.md`, `Legacy-Field-Mapping.md`, `Field-Mapping.md`, Phase 0A/0C/0D findings, and current PostgreSQL/Drizzle schema. No source or target database was queried in this review. No DDL, DML, source export, credential read, migration, or business-data copy occurred.

| Gate | Current evidence | State |
|---|---|---|
| MySQL source identity/environment | Prior Phase 0A read-only audit identified local `dompis_db` in container `mysql_baru`, role `root@%`, published port `0.0.0.0:3306`; environment/owner is explicitly unclassified | **Blocked** — do not treat active database as approved migration snapshot |
| Consistent source snapshot and restore | Prior exact ticket count is 1,108,814, but there is no fixed snapshot ID, schema hash/manifest, verified backup restore, or read-only migration role | **Blocked** — count is not an export baseline or snapshot |
| Target PostgreSQL | Local PostgreSQL 18.7 `dompis_v3` exists and has the candidate schema. Identity rechecked 2026-11-27 over local socket as role `pakbreng`; ticket/user/master row counts were not rechecked in this task. The `dompis_v3_dev` database named in the prior Phase 0D probe is no longer present. | **Partial** — register as persistent dev target, not disposable; no dedicated least-privilege migration role or isolated restore rehearsal is verified |
| Actual source schema disposition | Actual `ticket` field names match the 84-field inventory, but six column types drift from the legacy model; exact differences are in `Phase-0A-Discovery.md` | **Blocked** — must map actual types and value semantics, not ORM assumptions |
| Ticket eligibility and complete field disposition | Mapping inventory is 84/84, but local/manual fields, PII, source-only fields, archive permissions, retention, and exclusions are unresolved | **Blocked** — inventory coverage is not approval to retain or drop values |
| Organization/workzone mapping | 2026-11-27 read-only aggregate found all 393 nonblank normalized `service_area.nama_sa` keys globally unique; 391/465 distinct ticket Workzone keys matched, 74 unmatched keys represent 7,171 rows, and 47 ticket rows are blank/null. `nama_sa` is not yet confirmed as the official Workzone code/name dictionary; no approved new-Area crosswalk exists. | **Blocked** — do not infer parent or fuzzy-match; owner must confirm identity and disposition unmatched/blank keys |
| Users and authorization | 2026-11-27 aggregate expanded both four junction grants and direct FK fields: 612,896 distinct user/leaf pairs across 4,085 of 4,098 users; 13 users have no derived leaf. 16,139 pairs overlap between sources. Role/global route exceptions and per-user target parity remain unknown. | **Blocked** — no cohort capability, activation policy, exception mapping, or approved per-user old/new effective-scope parity |
| Source fixture and migration test | No versioned migration snapshot, synthetic migration fixture suite, manifest, checkpoint runner, resume test, or target restore rehearsal is present | **Blocked** — no eligibility/field transformations can be proven end-to-end yet |
| Business-derived fields | Lifecycle/status, closure timestamp, classifier/KPI, SLA/TTR, and local/manual field semantics remain candidates | **Blocked for derived mapping** — preserve known values without inventing status, time, or metric semantics |

## Safe implementation boundary

Do not start a bulk ETL, create a migration manifest from live records, or write legacy-derived rows into `dompis_v3` until the source is registered as an approved read-only snapshot/restore and required data-retention/access decisions are recorded. The local candidate database must not be reset or treated as disposable once app data exists. Do not add `mysql2` or another source driver just for a speculative ETL; first verify the approved source access path and dependency need.

Independent preparation may proceed with synthetic tests after the owner-approved field/eligibility contract is available. The implementation should then use immutable snapshot identity, keyset reads, stable incident grouping, one persistent old-ID→UUIDv7 mapping, short changed-only target transactions, checkpoint/resume, exact row accounting, and explicit imported/merged/quarantined/excluded dispositions. `incident` remains the unique business key; no import may regenerate an existing ticket UUID or promote ambiguous duplicates silently.

The first independent primitive is implemented in `packages/contracts/src/incident.ts`: it accepts only string keys, trims ASCII spaces, validates the documented ASCII alphabet, uppercases without Unicode folding, enforces the 100-character local limit, and never truncates. Invalid values return a reason for quarantine. This does not resolve collisions between distinct legacy IDs; collision groups still require snapshot-wide accounting and an approved disposition.

## Required inputs to unlock Phase 3A

- Register the MySQL source owner/environment/schema allowlist and provide a consistent read-only snapshot or verified restore, schema hash, manifest and backup/restore evidence.
- Register the PostgreSQL development migration target and a separate non-superuser migration role; record a target-guarded rollback/restore procedure.
- Approve the 84-field disposition, PII/archive allowlist, retention, eligible/local/manual ticket handling, and exception/quarantine visibility.
- Approve the new Area→Region crosswalk, official Workzone code/name dictionary, unmatched/blank geography disposition, and effective user grant/role mapping. Compare exact old/new workzone sets before any user activation.
- Resolve the six actual type drifts and value parsing/timezone/null rules; derived lifecycle/KPI/SLA/TTR fields remain `unknown`/preserved until approved.
- Produce synthetic fixtures covering normal rows, collisions, invalid/missing fields, null geography, duplicate normalized incident, long incident, parent mapping, user scope overlap, and restart/idempotency.

## Acceptance and next action

Phase 3A ETL remains **not started**. The incident normalization primitive is tested, but no source reader, dry-run plan, snapshot manifest, checkpoint, or migration writer exists. Once inputs above are available, implement a dry-run plan and synthetic acceptance harness; only then request review of a concrete import plan before applying bounded data writes. Validate all MV01–MV15 and ORG-M01–ORG-M06 in `Migration-Validation.md`; do not mark a gate passed based on source row counts alone.
