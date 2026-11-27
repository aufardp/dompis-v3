# Phase 0C — Contract and Access Discovery

Tanggal: 2026-11-27 (status revalidated). Status: **static contract/access audit selesai; validation gate tertahan oleh fixture, crosswalk, data policy, source registration, dan owner decisions yang belum lengkap**. No API, MySQL write, PostgreSQL write, or schema migration was performed during this revalidation.

## 1. NOSSA contract evidence

`docs/Data-Contract.md` summarizes supplied OAS 3.0 documentation and a supplied 100-row `/nossa` sample. Artifact search in DOMPIS v3 and the legacy checkout found no versioned OAS/OpenAPI file or sanitized `/nossa-closed`/reopen fixture. Available legacy files include an open-coverage test script; it is not evidence for closed lifecycle semantics. No live upstream call was made because no approved request budget/credential was available in this phase.

| Concern | Supplied-document evidence | Validation state |
|---|---|---|
| Sources | GET `/nossa` and `/nossa-closed`; `/ticket-by-service` excluded | Documented; live contract not checked |
| Lookup | exact incident, allowed characters/length documented; GAMAS parent may return children | Needs fixtures for alias/parent behavior and response shape |
| Pagination | limit default 100/max 1000; offset ceiling 5000; no total order when `Status_Date` ties | Document/sample summary only; page drift and tie behavior untested |
| Closed windows | max 31 days; history floor 2026-01-01; date filters inclusive on `Status_Date` | No closed response to verify boundaries/completeness |
| Envelope | sample `meta.count` treated as page count; `filters` shape differs (object in docs, empty array in sample); closed resource example says `nossa` | Open sample evidence only; closed aliases unverified |
| Lifecycle | supplied `/nossa` sample contains CLOSED/RESOLVED; all rows have resource `nossa`; `resolved date` occurs on non-CLOSED statuses | Endpoint name/status/date do not prove close/reopen lifecycle |
| Version/time | `generated_at`, `inserted_date`, `Status_Date`, `Last_Update_Ticket`, `C_RESOLVE_DATE` differ; no safe row-version/closure cursor established | Unknown until owner/upstream fixture |
| TTR/timezone | source TTR decimals may be string/decimal/zero/null; unit unknown; offsetless timestamps unresolved | Preserve raw validated values; no unit/date conversion approved |
| Rate/error behavior | OAS summary says 50/min/key; local blueprint start 20/min; expected bounded retry/stop behavior | Static documentation only; no request made |

The sample summary in `Data-Contract.md` reports 100 rows/100 distinct incident IDs and 103 union keys, with CLOSED, RESOLVED, FINALCHECK and MEDIACARE among statuses. These are supplied-sample statistics, not a live endpoint result or release fixture. Original customer values are deliberately not copied.

## 2. Field and historical migration evidence

- Legacy scalar model and `Legacy-Field-Mapping.md` both contain 84 fields; names match 84/84 with no missing/extra/duplicate mapping rows. This validates mapping inventory coverage only, not value semantics or retention approval.
- A read-only repository consistency check on 2026-11-27 parsed 84 unique legacy mapping rows; all 38 explicit `tickets.*` target references exist in the checked-in candidate PostgreSQL migration, with no duplicate source field or missing target column. The remaining 46 rows target archive/restricted/optional disposition. This verifies inventory-to-candidate-schema references only; it does not approve field promotion, eligibility, PII retention, or archive policy.
- Actual local MySQL `ticket` has the same 84 field names but six type drifts against Prisma (`reported_date_dt`, `classification_flag`, `onu_rx`, `status_manja`, `validation_flagged_at`, `ttr_deadline_at`); exact types/counts are in `Phase-0A-Discovery.md`.
- MySQL `ticket` exact row count is 1,108,814; incident scan found 28 noncanonical keys and zero blank/normalized duplicates with trim+uppercase. This is a source baseline, not a migration eligibility count.
- Historical fields include local/manual flags, pending/SQM notes, validation, historical TTR/SLA states and assignment references. `Field-Mapping.md`, `Legacy-Field-Mapping.md`, and `Migration.md` propose restricted archive/promotion, but policy owner must decide PII retention and eligible/local-only fields. No data has been migrated or excluded.
- Legacy parent mapping is specified in `Master-Data-Migration.md`: old `area` becomes new `service_area`; old `service_area` becomes new `workzone`; new top-level `area` must be inserted above legacy regions. Actual assignment of each legacy region to new top-level area has no approved crosswalk. No parent was inferred.

## 3. Workzone crosswalk evidence

Legacy code matches ticket workzone values to `service_area.nama_sa`; it does not prove that field is the official NOSSA Workzone code. Read-only profile after trim+uppercase found 391 unique normalized keys matched between the two sides, 74 unmatched ticket-workzone keys, 0 ambiguous service-area keys; associated ticket row counts were 1,101,596 matched, 7,171 unmatched and 47 blank/null. MySQL collation is `utf8mb4_0900_ai_ci`; PostgreSQL comparison semantics may differ. Owner/data dictionary must confirm whether these are codes, names, or aliases and disposition the 74 keys before migration/access.

## 4. Legacy user effective-scope baseline

`app/helpers/ticket.helpers.ts:20-86` resolves leaf names by unioning `user_sa`, `user_area`, `user_branch` and `user_region`, then deduplicates names with a JS `Set`. Other code uses direct `users.region_id/branch_id/area_id`; some API paths have role-based or `globalScope` exceptions. This is not a single consistent permission contract.

Read-only aggregate over the current MySQL hierarchy reproduced the four-junction union by expanding each grant to service-area leaves, deduplicating `(user_id, id_sa)`:

- 22,392 expanded user-leaf pairs before overlap de-duplication; 17,969 distinct pairs after de-duplication (4,423 overlap rows removed).
- 3,835 distinct users have at least one junction-derived leaf; total users=4,098, so 263 users have no junction-derived leaf. They may have direct FK scopes or no scope; this result does not classify them.
- User/parent orphan pairs: 0 in each of the four junction tables. `user_sa` has 2 null user IDs and 2 null SA IDs; null row overlap is unknown and null pairs do not create leaf access. Other three junction tables have zero null user/parent fields.
- This is a junction-only legacy baseline. Full per-user difference against direct FK-derived scopes, explicit role exceptions, and the proposed new grants was not accepted as validated; no new target grant set or owner-approved policy exists. User identifiers/names were not output.

The proposed `Organization-Scope.md` contract—five-level grants, union, filter intersection, explicit global grant, deny-by-default—is a design proposal and does not prove parity with deployed user access. Role action mapping, active-user rules, admin/global exceptions, historical reparenting and account activation require owner review. Never widen grants to compensate for missing crosswalk.

## 5. Access and migration decisions still open

| ID | Needed decision/evidence | Why it blocks |
|---|---|---|
| C0C-01 | Sanitized actual `/nossa-closed` response and reopened incident fixture, plus authoritative OpenAPI version | Cannot verify resource, close/reopen, field null/missing, status/time semantics, windows or history coverage |
| C0C-02 | Owner-approved status/lifecycle mapping, closure timestamp, timezone, source version/conflict and TTR unit/threshold | Prevents incorrect canonical status, closure history and KPI calculations |
| C0C-03 | Owner-approved new-area-to-region crosswalk and Workzone code/name dictionary for unmatched keys | Prevents wrong ticket location, leaked scope and dropped/merged history |
| C0C-04 | **Partially approved:** role names, superadmin full-control catalog/global scope, User Management restriction, and equivalence of `officer`, `team_leader`, and `senior_leader` are recorded in `Authorization-Capability-Discovery.md`. Still needed: the equivalent cohort's actual capability set, account activation policy, treatment of users with no junction-derived leaf, validated per-user old/new effective-scope crosswalk, and review of every privilege delta | Prevents unauthorized access expansion and accidental account activation; role-name approval alone does not authorize migrating legacy grants or activating accounts |
| C0C-05 | **Inventory/schema-reference check passed; field policy remains open:** all 84 source fields have unique mapping rows; all 38 explicit ticket target columns exist. Owner approval is still required for semantic disposition, eligibility, local/manual facts, PII/restricted values, archive allowlist, and retention across all fields | Prevents silent historical loss or excessive PII retention |
| C0C-06 | Registered MySQL snapshot/read role and registered PostgreSQL 18 dev target | Partially met: a local PG18 target is available. Phase 0A identified local `dompis_db` in container `mysql_baru`, but its environment/owner is unclassified and it is not registered as an approved consistent snapshot with a read-only migration role; neither target registration is complete for migration |

## 6. Phase 0C status and safe next step

Static contract and access evidence was rechecked on 2026-11-27. C0C-04 is partially complete for approved role names/superadmin/cohort policy; C0C-05 is partially complete for mapping inventory and candidate-column references. The validation gate **cannot pass** while C0C-01–03, the remaining C0C-04 policy/parity items, C0C-05 field approvals, and source snapshot registration under C0C-06 remain open. Repository artifact search found no versioned authoritative OpenAPI file, sanitized `/nossa-closed` or reopened-incident fixture, or approved geography crosswalk/dictionary. The legacy source identity was previously found locally, but owner/environment classification, a consistent snapshot, and a registered read-only migration role are still missing; identification is not migration authorization. Do not call upstream or infer missing values. Do not begin Phase 0D final schema/migration execution or implementation for lifecycle, reporting, grants, field retention, or crosswalk-dependent behavior. Next safe step is to record the missing sanitized fixtures, source/target registration and crosswalk, field dispositions, and written owner decisions; then validate them against synthetic golden tests and a registered disposable PostgreSQL target. This revalidation did not query any database, run test suites, or change schema/data.
