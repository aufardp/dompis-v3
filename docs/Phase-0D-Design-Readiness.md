# Phase 0D — Design Finalization Readiness

Tanggal: 2026-11-26. Status: **candidate design reviewed; local migration compatibility probe passed; finalization/migration-data rehearsal belum dapat lulus**. Phase 0D review ini bukan persetujuan DDL atau izin perubahan bisnis.

## Candidate baseline yang sudah tersedia

`docs/Architecture.md`, `docs/Database.md`, `docs/Query-Standards.md`, `docs/Migration.md`, `docs/Security.md`, `docs/Organization-Scope.md`, `docs/Migration-Validation.md`, dan `docs/Implementation-Plan.md` sudah memuat candidate modular monolith, API/worker processes, ticket-first schema, UUIDv7, scopes, sync contract, migration safety, query patterns, test matrix dan rollback. Review awal tidak menjalankan DDL; compatibility probe lokal kemudian dijalankan dan dicatat pada addendum di bawah.

## Gap scaffold terhadap candidate blueprint

| Area | Scaffold saat ini (`packages/db/src/schema.ts`) | Candidate blueprint | Dampak / tindak lanjut |
|---|---|---|---|
| Master hierarchy | `regions`, `branches`, `workzones`; workzone langsung child branch, `service_area` berupa text (`:25-44`) | `area → region → branch → service_area → workzone` | Tambah dua level dan parent chain setelah mapping/crosswalk disahkan; jangan flatten hierarchy |
| User scope | `user_workzones` direct leaf grants (`:62-69`) | One `user_scopes` row targets exactly one dari lima level | Ganti setelah owner menyetujui effective grant/role policy; jangan port legacy roles atau activate hasil ambiguity |
| User role | Check terbatas `superadmin/admin/helpdesk/viewer` (`:46-60`) | Nama role target pemilik: `superadmin`, `team_leader`, `helpdesk`, `teknisi`, `senior_leader`, `officer`; hak/action mapping masih perlu persetujuan | Perbarui role names sesuai keputusan pemilik; tetapkan capability matrix owner-approved; role bukan scope; jangan implementasikan assignment teknisi |
| Ticket | Satu `tickets` dengan unique incident, `workzone_id` dan provenance/current-state fields (`:84-170`) | Ticket-first kanonik sesuai tujuan | Pertahankan unique incident/UUID; validasi constraint lifecycle, field nullability dan classifier sebelum migration |
| Lifecycle/classification | `lifecycle`, `operational_bucket`, `kpi_seg` constraint dan field sudah ada (`:91-117,155-170`) | Rule registry masih candidate; source classifier punya precedence/conflicts | Constraint enum/NOT NULL dapat membekukan rule yang belum disahkan; jangan finalkan nilai/derivations sebelum 0B/0C sign-off |
| Archive | Scaffold mendefinisikan `ticket_legacy_archive` (`:219-236`) | Restricted archive diperbolehkan untuk old-ID/history, field allowlist & PII retention perlu owner | No source data copied until field disposition/retention; role access harus diuji |
| UUIDv7/driver | PK default memakai `uuidv7()` SQL; client menggunakan Bun SQL/Drizzle (`:1-20`) | PostgreSQL 18 native UUIDv7 candidate; supported driver/runtime compatibility harus dipastikan | Native UUIDv7 dan migration SQL terbukti pada PostgreSQL 18.7; Bun SQL runtime, restore, dan target selain local belum diuji |
| Indexes | 7 secondary ticket indexes plus user/session/other indexes (`:171-177` onward) | Seven is a starting budget, each index needs measured query-plan evidence | Do not add/copy indexes; no PostgreSQL EXPLAIN baseline, query plans unverified |

## Candidate design decisions to resolve before DDL is frozen

1. **Workzone identity:** actual legacy names match uniquely after trim+uppercase, but official code status is unknown and 74 ticket keys do not match. Keep direct matching where verified; do not create aliases/fuzzy mappings from unmatched names. `workzone_source_aliases` remains conditional on an approved crosswalk proving real aliases.
2. **Incident canonicalization:** actual legacy scan found 28 noncanonical values and zero collisions after trim+uppercase. Blueprint check requires canonical incident. Migration must preserve original source key and map normalized value deterministically; exact transform and archive evidence still require reviewed migration fixture/policy.
3. **Lifecycle checks:** candidate `CHECK(lifecycle<>'open' OR closed_at IS NULL)` may reject contradictory legacy rows that must be preserved for reconciliation. Hold this constraint until lifecycle/legacy disposition is approved; do not clear a historical date automatically.
4. **Delete behavior:** candidate `user_scopes.user_id` FK uses `ON DELETE CASCADE`, while security/org policy disables physical user deletion and retains grants/audit history. Prefer soft-disable and consider `NO ACTION` unless an approved purge/retention process requires cascade; test cascade effect before choosing.
5. **Archive allowlist:** DDL draft has a JSONB legacy payload; `Legacy-Field-Mapping.md` contains PII/local/assignment fields with distinct restrictions. A full payload is not automatically eligible. Freeze field allowlist, retention, role grants and export behavior first.
6. **SLA/classifier storage:** `tickets.operational_bucket`/`kpi_seg` are NOT NULL and constrained in scaffold. Missing/unknown source fields need explicit unknown/null policy; do not backfill invented buckets/segments. Keep rule version and original historical values for parity only after approval.
7. **Index set:** candidate partial indexes and service-number index need exact list/summary/drilldown query shapes, scope selectivity, EXPLAIN, write/WAL/storage measurements on registered PG; MySQL index layout is not ported.

## Migration/test plan readiness

- Source profiling has a verified exact row count of 1,108,814 and a separate full keyset incident scan with no normalized duplicates, useful as a future baseline. It is not a snapshot ID, consistent export, backup, eligibility count or migration rehearsal.
- Existing acceptance matrix `Migration-Validation.md` covers complete ID accounting, stable UUID/checkpoint, invalid fields, normalized collisions, scope parity, KPI/report parity, restart/idempotency, security, load and restore/rollback. It remains a plan only; no fixtures, PostgreSQL migrations, ETL or restore tests were run.
- Phase0C decisions C0C-01–06 are prerequisites to freeze contract-dependent fields/constraints, identity mappings, user grant migration and archive retention. PG18 dev target and verified backup/restore are prerequisites for DDL and migration rehearsal.
- A local PG18.7 disposable target has since been created; the existing candidate migration was applied successfully in a transaction and Drizzle generation reported no drift. This is a syntax/compatibility probe only, not approval of the candidate DDL or a restore/migration-data rehearsal.
- No production action is authorized by this candidate review. Do not connect runtime to MySQL, use the local placeholder PG URL, create schema on an unidentified server, or execute cutover.

## Phase 0D status

Static readiness review is complete. **Final DDL/Drizzle design gate remains open** until contract/access/retention decisions and migration data acceptance are available. Phase 1 implementation has not started. The local target and migration probe are detailed below; next, resolve owner-dependent decisions, then review candidate DDL with an ADR, synthetic acceptance and restore/rollback evidence before proceeding.

## Addendum — local migration compatibility probe (2026-11-26)

A new empty local database `dompis_v3_dev` was created on PostgreSQL 18.7 and verified before any DDL. The checked-in candidate migration `packages/db/drizzle/0000_vengeful_redwing.sql` was applied with `psql --single-transaction` to that database only.

- Actual result: migration committed successfully; 14 public base tables, 12 foreign keys and 40 indexes were present. Native `uuidv7()` returned a value. `bun run db:generate` completed and reported “No schema changes, nothing to migrate”.
- This confirms syntax/application on this local PG18 version and current Drizzle-schema synchronization. It does not validate approved business semantics, production plans, legacy data, archive retention, restore, Bun SQL runtime connectivity, or reapplication/idempotency.
- The database contains schema only and remains disposable development infrastructure. No business rows, secrets, production target or legacy data were involved.
- PG18 satisfies only the PostgreSQL target part of C0C-06. Contract fixtures, owner decisions and legacy MySQL target registration remain blockers; final DDL and Phase 1 gates remain open.
