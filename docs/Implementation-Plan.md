# Implementation plan — phased gates

| Phase | Deliverable | Gate before next phase |
|---|---|---|
| 0 Discovery | Contract matrix, sanitized closed fixture, legacy rules comparison, source schema/profile and signed mapping | Missing source facts recorded; unresolved KPI blocks publication, not scaffolding |
| 1 Foundation | Bun workspace, SvelteKit, Elysia, strict TS, Drizzle, PG18, CI | clean install/build/typecheck, disposable migration, health checks |
| 2 Security | Sessions, RBAC, workzone mapping, audit | login/logout, expiry/revocation, CSRF, scope bypass tests, no secrets |
| 3 Sync | ETL dry-run/import/resume/reconcile + adapter, scheduler, window planner, merge, status events, quarantine, revision | synthetic legacy + upstream tests; migration replay stable UUID, no lost checkpoint; separate writer lock |
| 4 Ticket Management | shared predicates, overview, buckets, list/detail, SSE | scoped API and UI tests, unknown status visible, count parity |
| 5 Reports | Semesta, Rekap Workorder, Detail WO HI, CSV | signed-off date/KPI definitions, drilldown parity, bounded export |
| 6 Performance | EXPLAIN ANALYZE, 1.2m/3.5m synthetic rows, k6 20/80/200 VU | measured targets or documented mitigations, security review, restore test |
| 7 Cutover | approved legacy snapshot import, final delta/freeze, upstream reconciliation, shadow reports, switch and rollback | closed fixture + taxonomy + TTR units + closure date signed off, coverage gaps resolved/accepted, backup verified, Migration-Validation.md signed off |

## Definition of done
Each phase: source change, migration if needed, tests, documentation, Handover append, commit reference, risks and rollback. No production writes before approval. Record exact actual test outcomes, not expected ones. Keep DB schema reference synchronized with Drizzle migration; avoid new indexes without measured query plan. Track closure timestamp, KPI eligibility, historical backlog, manual flags and missing piloting fields as explicit open decisions. Use synthetic values in screenshots, fixtures and tests.

## v1.1 sequencing detail
0: inventory exact live schema only with approval; inspect source snapshot/fixtures, field disposition, KPI definitions. 1: disposable PG schema + archive/checkpoint. 2: secure migration role/access boundaries. 3a: offline ETL with synthetic fixture, duplicates, nulls, dates, resumed run and replay; 3b: live-sync mock plus legacy reconciliation. 4–5: compare report membership on migrated fixture. 6: realistic staging volume and restore rehearsal. 7a: approved read-only snapshot, import and validate; 7b: shadow using bounded upstream; 7c: coordinated final freeze/delta, exact counts and sign-off, cutover. No actual production work at earlier gates.
