# Source audit — DOMPIS v2 (uploaded snapshot)

## 1. Coverage and limitations
All six ZIP archives extracted, 19 uploaded items total (six archives and thirteen standalone files). Inventory excludes __MACOSX and .DS_Store. Actual focused review of schema, endpoint adapters, worker orchestration, core classifier, operational filters, reports and docs; not a line-by-line audit of all files. Graphify generated caches/historical graphs inventoried, latest report inspected, not treated as authoritative code. No live DB/endpoint/network test. No root package.json, lockfile, .env or .git supplied; cannot validate build/dependency version or verify snapshot commit. Latest Graphify report dated 2026-11-24 records d766ac7b, 963 files, 5864 nodes/15780 edges; commit not independently verified.

| Archive | Non-metadata files | Role |
|---|---:|---|
| app.zip | 652 | Next/React pages, APIs, services, components |
| lib.zip | 74 | ingestion, projection, bridge, cache, scheduling |
| prisma.zip | 85 | schema, migrations, seeds |
| scripts.zip | 112 | maintenance, backfills and scripts |
| docs.zip | 18 | architecture/performance/DR and rules |
| graphify-out.zip | 193 | generated maps and historical reports |

## 2. Findings and rewrite mapping
| Evidence path (relative to original repo) | Observed condition | New design |
|---|---|---|
| prisma/schema.prisma | 54 models; ticket 33 and ticket_raw 8 explicit @@index; numeric ticket ID, incident unique; many text timestamps, reported_date_dt transitional; raw/sync state/source snapshot/finalized/bridge ext/projection state | UUID canonical ticket, typed timestamptz, 6 initial secondary ticket indexes, status events, sync metadata |
| lib/ingestion/index.ts around piloting source guard and supplements | Nossa source truth but piloting can supplement missing fields; special open-only/close fetch logic | Remove piloting entirely; verify missing fields against endpoint; no implicit enrichment |
| worker-data.ts, worker-ingestion.ts, worker-projection.ts | ingestion triggers DB projection_request and Redis publish; projection incremental/full scan plus debounce/retries | One writer, classification inline in same transaction, no projection queue |
| worker-bridge.ts, worker-status-refresh.ts, worker-active-refresh.ts | bridge scan schedulers, refresh flows and locks; per-incident N request fallback | Single scheduler and global budget, rolling scans first, lookup only bounded exceptions |
| worker-snapshot.ts, worker.ts, ecosystem.config.js | snapshot recompute, separate ops for sheet/auto-assign, PM2 apps and extensive cache/pool tuning | Remove excluded features; API/worker + PG, optional aggregate only after profiling |
| lib/external-db/qosmic-bridge/nossa.ts, types.ts, window-planner.ts, docs/qosmic-bridge-overview.md | /nossa /nossa-closed; page max 1000, offset ceiling 5000, window max 31d; response columns dynamic, no batch incident API | Keep bounded pagination, overlap, split, validation and budget; verify actual contract |
| lib/ingestion/normalizer.ts, conflict-resolver.ts | aliases incl PascalCase; WIB date conversion; status priority favors CLOSED over OPEN | Keep aliases with typed dates; replace priority-only conflict with newer verified source timestamp and explicit ambiguity; handle reopen |
| lib/classify-jenis-vlookup.ts, prisma/seed-source-vlookup.ts | local mapping for channel/customer type/service type, B2C DCS/PL-TSEL | Keep approved versioned local mapping; no per-ticket DB lookups |
| app/config/ticket-management-nav.ts, operational-buckets.ts | six operational bucket categories; anomaly types, workzone and status config | Retain menu and domain config; validate unknown bucket behavior |
| app/libs/services/daily-ticket-where.ts, daily-ticket-helpers.ts, kpi-bucket-sql.ts; docs/ticket-management-query-fix.md | daily open + closed today; prior nested cache gate deadlock; scope fixes, generated bucket/kpi_seg and cache revision | Shared predicate, index-friendly date range, one count endpoint, no nested query gate |
| app/api/dashboard/semesta-analytics/route.ts, app/admin/semesta | historical filter and SWR analytics, trend/workzone/type charts | SQL aggregate with same scoped historical predicate and bounded range |
| app/api/dashboard/rekap-workorder/route.ts, lib/rekap/rekap-classify.ts | multiple queries including technician rows, legacy customer/overlay; JS classifier differs from some operational SQL rules | Remove technician metrics; preserve scoped counts/drilldown with single agreed classifier |
| app/api/tickets/daily/detail-wo-hi/route.ts | uses DailyTicketService, age, effective Max TTR, date formatting and export | Shared daily predicate, typed timestamp DTO, consistent WIB |
| docs/sla-ttr-matrix.md, app/libs/tickets/ttr-comply.ts, effective.ts | separate compliance vs UI deadline, B2C SLA type / B2B jenis, netral excludes compliance | Pure tested rules with rule version; preserve distinction |
| proxy.ts, server.ts, stress-test.js | custom JWT, Redis SSE, uncaught exception logging/ignoring, literal test credential examples | Opaque sessions, PG revision events, fail-stop, remove credential defaults and rotate if real |

## 3. Retain / retire
Retain domain semantics, authorized geography/roles, filters, exports, historical metrics, tests and upstream edge cases. Retire raw/projection duplication, source SQL/piloting, tech assignment/history/evidence/team/attendance/cluster/tracking, push/webhook/sheets/KML, Redis orchestration as default. Do not port legacy `status_update` (local workflow) as source status without definition. The old schema contains generated SQL and migrations that Prisma alone does not fully express; review those for rule parity. No claim all prior features are obsolete outside this rewrite scope.

## 4. Verification backlog
API documentation and 100-row /nossa sample supplied in v1.0; actual /nossa-closed fixture still missing; detailed field provenance for local flagging, pending, classification, SLA dates, workzone and source_vlookup must be mapped before release. Review all relevant migrations and classifier branches in implementation phase. Audit full dependency tree and security with actual manifest. Quantify old/new disk usage and I/O with test DB; no speedup percentage inferred from index count. No need to preserve Graphify caches in new repo; regenerate map from new source after build if useful.

## v1.3 legacy schema audit
Reopened `prisma.zip:prisma/schema.prisma` model `ticket`; `Legacy-Field-Mapping.md` enumerates every scalar in that model (not relation navigation fields). Legacy schema is not live SHOW CREATE TABLE; generated operational_bucket and reported_date_dt backfill need verification against actual migration versions. `status_update`, manual fields, local pending/solution, flags, SLA status fields and assignment references require separate dispositions. No assumption that current production data matches source code or that old `ticket_raw` is complete. Migrate approved `ticket` historical baseline, not `ticket_raw` into canonical runtime. Preserve backup and audit data loss before cutover.

## v1.3 scope and legacy evidence
Reopened uploaded `prisma.zip` (`prisma/schema.prisma`): old region.id_region; branch.region_id optional; area.branch_id optional; service_area.area_id optional; users has direct region/branch/area columns plus user_region, user_branch, user_area, user_sa junctions with nullable FK. `app/api/workzone/route.ts` uses old service_area names for workzone options. `app/libs/services/daily-ticket-where.ts` contains a request globalScope branch that can select effective superadmin for admin; `app/libs/tickets/scope.ts` has selected-workzone and branch filters. These are audit signals, not proof of a deployed exploit; inspect caller validation and actual effective access on sanitized snapshot. Do not port these implementations. New grant resolver enforces server permissions and intersects filters. `app/config/operational-buckets.ts` includes hard-coded active workzones, statuses and candidate bucket rules; do not treat list as geography or final KPI authority. The local path `/Users/pakbreng/Projects/dompis_v2` was not mounted here; current branch/changes on Mac cannot be verified. Phase 0 agent compares supplied archive findings against actual read-only checkout and records commit + file paths. See Legacy-Reference.md.
