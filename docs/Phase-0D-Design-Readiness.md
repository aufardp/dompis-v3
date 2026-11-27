# Phase 0D — Design Finalization Readiness

Tanggal: 2026-11-27 (status revalidated). Status: **candidate design reviewed; local migration compatibility probe passed; finalization/migration-data rehearsal belum dapat lulus**. Phase 0D review ini bukan persetujuan DDL atau izin perubahan bisnis.

## Candidate baseline yang sudah tersedia

`docs/Architecture.md`, `docs/Database.md`, `docs/Query-Standards.md`, `docs/Migration.md`, `docs/Security.md`, `docs/Organization-Scope.md`, `docs/Migration-Validation.md`, dan `docs/Implementation-Plan.md` sudah memuat candidate modular monolith, API/worker processes, ticket-first schema, UUIDv7, scopes, sync contract, migration safety, query patterns, test matrix dan rollback. Review awal tidak menjalankan DDL; compatibility probe lokal kemudian dijalankan dan dicatat pada addendum di bawah.

## Gap scaffold terhadap candidate blueprint

| Area | Scaffold saat ini (`packages/db/src/schema.ts`) | Candidate blueprint | Dampak / tindak lanjut |
|---|---|---|---|
| Master hierarchy | Legacy Prisma: `region → branch → area → service_area`; `region` has no parent-area FK | `area → region → branch → service_area → workzone` | Old `area → new service_area`, old `service_area → new workzone`; only new `area → region` membership must be supplied. Unmatched ticket workzones stay preserved/NULL/out of ordinary scope; don't guess. |
| User scope | Legacy direct `users.region_id/branch_id/area_id` plus four junction tables (`user_region`, `user_branch`, `user_area`, `user_sa`) | One `user_scopes` row targets exactly one of five levels; union/deduplicate effective Workzones | Owner policy is set: Superadmin full/global; three middle roles equal with zero grants for now; helpdesk/teknisi deferred; imported users inactive until parity. Per-user scope comparison is migration validation, not a new owner decision. |
| User role | Scaffold awal membatasi role pada `superadmin/admin/helpdesk/viewer` (`:46-60`); Phase 2 kini menyimpan enam role target yang disetujui | Role target: `superadmin`, `team_leader`, `helpdesk`, `teknisi`, `senior_leader`, `officer`. Sepuluh capability hanya diberikan kepada `superadmin`; tiga role middle disetujui setara tetapi tetap tanpa grant sampai capability bersama ditentukan; `helpdesk`/`teknisi` ditunda | Role catalog lokal dan nama sudah diperbarui. Jangan migrasikan role/grant legacy atau mengaktifkan akun sebelum capability matrix, account policy, dan effective-scope parity disetujui; role bukan scope; jangan implementasikan assignment teknisi |
| Ticket | Satu `tickets` dengan unique incident, `workzone_id` dan provenance/current-state fields (`:84-170`) | Ticket-first kanonik sesuai tujuan | Pertahankan unique incident/UUID; validasi constraint lifecycle, field nullability dan classifier sebelum migration |
| Classification lookup | `source_vlookup` baru ditambahkan sebagai tabel mapping lokal dengan UUIDv7 PK dan field legacy lookup (`packages/db/src/schema.ts`) | Live legacy DB table adalah sumber mapping otoritatif owner untuk `jenis_tiket_1/2`; checked-in seed bukan pengganti jika berbeda; ticket rows menyimpan snapshot hasil. Former `RESELLER` output menjadi `INDIBIZ`. | Aggregate profile selesai; 135 row, no key duplicates detected under tested normalization. Snapshot/version and golden rule fixtures remain before import/runtime classifier. |
| Lifecycle/classification | `lifecycle`, `operational_bucket`, `kpi_seg` constraint dan field sudah ada (`:91-117,155-170`) | Rule registry masih candidate; source classifier punya precedence/conflicts | Constraint enum/NOT NULL dapat membekukan rule yang belum disahkan; jangan finalkan nilai/derivations sebelum 0B/0C sign-off |
| Archive | Scaffold mendefinisikan `ticket_legacy_archive` (`:219-236`) | Preserve old ID and eligible historical facts; keep old-only sensitive values out of ordinary UI/API and limit archive access | Field-by-field disposition and PII/archive retention still need owner policy; no source data copied |
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
- PG18 satisfies only the PostgreSQL target part of C0C-06. The legacy audit previously identified local `dompis_db` in container `mysql_baru`, but its environment/owner is unclassified and it is not registered as an approved consistent migration snapshot/read-only source. Contract fixtures and owner decisions remain blockers; final DDL and Phase 1 gates remain open.

## Addendum — current PostgreSQL target identity (2026-11-27)

The earlier `dompis_v3_dev` compatibility-probe database is no longer present. Current local identity was checked with a read-only `psql` query: PostgreSQL 18.7 database `dompis_v3`, reached over the local Unix socket, effective role `pakbreng`. Current business-table row counts and role privilege attributes were not queried. Register `dompis_v3` as a persistent development target; do not infer that it is empty or disposable from the earlier probe. No DDL/DML was run in this recheck. Dedicated migration-role and isolated restore/rollback evidence remain open.
