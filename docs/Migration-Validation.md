# Migration Validation — acceptance gate v1.3

## 1. Row accounting
Fixed snapshot manifest and same scope, asOf and business timezone for both systems. Use aggregate output and synthetic examples; no real incident/PII in logs. Every old ID exactly once in archive. Counts: source rows = imported + merged + quarantined + excluded. Count target canonical incident distinct for imported/merged groups; duplicate source IDs = 0, duplicate canonical incidents = 0, orphan mapped rows = 0. Merged groups need signed winner/reason; excluded/quarantine reasons and counts reviewed; unresolved data losses block release unless explicit business sign-off on an exception and user-visible coverage. Target count need not equal old row count if collisions or exclusions or new live tickets; reconcile exact differences. Validate by old ID and normalized incident, not counts only. Compare typed values and hashes against expected transformed sample/full deterministic checks. Keep encrypted manifest and validation evidence.

## 2. Required checks
| ID | Check | Gate |
|---|---|---|
| MV01 | Source schema/manifest/checksum and backup restore | Exact match/verified |
| MV02 | Complete field disposition incl. production drift | 100%, approved |
| MV03 | Row accounting and old ID → UUID mapping | zero unaccounted rows; no orphans |
| MV04 | Normalized collisions/invalid IDs/manual rows | signed disposition, no silent merges |
| MV05 | Reported/status/booking/resolve/closed times incl. midnight WIB, zero date, timezone | compare, invalid quarantined/flagged |
| MV06 | Scope master and unknown zone | no cross-scope exposure |
| MV07 | Status/lifecycle/closed date, null vs zero | signed mapping and consistency |
| MV08 | Historical KPI by month, day, branch/workzone, bucket, segment, SLA numerator/denominator, recurring | exact parity for unchanged semantics; approved deltas otherwise |
| MV09 | Semesta, Rekap WO, Detail WO HI, overview, drilldown/export | membership parity on same filters/revision |
| MV10 | Retry/restart + rerun same snapshot | stable UUID, no double events or increments, identical state |
| MV11 | Legacy-only then live sync, stale/equal conflict, reopen, missing/null, no historical deletion | deterministic, correct provenance |
| MV12 | Final delta incl. updates to earlier IDs and deletions | all changed rows reconciled |
| MV13 | Security: archive least privilege, IDOR, logs, exports | no critical findings |
| MV14 | Load (ingestion + ETL rehearsal), DB space, WAL, lock, query p95 | measured and signed |
| MV15 | Restore and rollback rehearsal | within agreed RPO/RTO or approved mitigation |

## 3. Example validation queries (staging; no PII)
```sql
SELECT disposition,count(*) FROM ticket_legacy_archive GROUP BY disposition;
SELECT count(*) AS mapped_rows,count(DISTINCT ticket_id) AS mapped_tickets
FROM ticket_legacy_archive WHERE disposition IN ('imported','merged');
SELECT count(*) FROM ticket_legacy_archive a LEFT JOIN tickets t ON t.id=a.ticket_id
WHERE a.disposition IN ('imported','merged') AND t.id IS NULL;
SELECT count(*) FROM (SELECT incident FROM tickets GROUP BY incident HAVING count(*)>1) d;
SELECT data_origin,source_endpoint,lifecycle,count(*) FROM tickets GROUP BY 1,2,3;
SELECT date_trunc('month',reported_at AT TIME ZONE 'Asia/Jakarta') AS month_wib,
 workzone_id,operational_bucket,kpi_seg,count(*) FROM tickets GROUP BY 1,2,3,4;
```
Scope/manifest filter must be added for actual comparison: queries above are target aggregate examples before ongoing sync; once live, join approved mapping and compare asOf snapshot rather than all tickets. Compare actual source membership IDs with target UUID mapping in secured ETL; do not export customer information. Do not use generated_at or migrated_at as date-of-closure. Explain mismatches by missing source, mapping, changed rules, time range, local manual flag or true defect.

## 4. Test matrix
Use synthetic fixtures: legacy integer id, duplicate normalized incidents, blank/missing status, invalid date, differing reported_date/dt, leading-zero service, old >32-char incident, unknown scope, pre-2026 closed, legacy manual row, local-only field, valid old closure, closed→open, older live record, equal conflicting version, missing vs null. Simulate crash after PG commit before ack; checkpoint resume and same snapshot re-run; manifest mismatch and aborted write; final delta modifying old ID. Run Drizzle migration on clean disposable PG18; test constraint and grants. No production test writes.

## 5. Sign-off record
Snapshot ID/schema hash: ___; source/target counts: ___; exception counts and decision IDs: ___; rules version: ___; asOf/timezone: ___; tests/results: ___; performance: ___; rollback/restore proof: ___; business owner: ___; DBA: ___; security: ___; release decision: GO / NO-GO. Record actual outcome in Handover; never fill with assumed success.

## v1.3 additional master and authorization acceptance gates
| Gate | Required evidence |
|---|---|
| ORG-M01 | every eligible old region/branch/area/service_area ID accounted for in target or approved exception; new top area mapping owner-approved |
| ORG-M02 | zero orphan active masters; exact parent chain and parent-scoped uniqueness; no ambiguous alias accepted |
| ORG-M03 | every eligible user mapped; username collisions handled; password rehash/reset and role disposition approved; sessions not migrated |
| ORG-M04 | each old direct/junction grant accounted for, duplicate/null/orphan/conflict recorded; per-user old vs new effective workzone set difference approved; zero unapproved privilege expansions |
| ORG-M05 | per-level rollups reconcile (current hierarchy), distinct ticket counts across overlapping grants, unknown scope separately counted by privileged operator |
| ORG-M06 | revoke and reparent tests invalidate cursor/SSE/export; no out-of-scope access across all endpoints; rollback rehearsal with master mapping preserved |
Do not count an unmapped legacy row as successfully scoped. Compare source/target by fixed snapshot and approved old→new ID mapping, record accepted exclusions separately.
