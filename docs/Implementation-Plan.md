# Implementation plan — phased gates

| Phase | Deliverable | Gate before next phase |
|---|---|---|
| 0 Discovery | Contract matrix, sanitized closed fixture, legacy rules comparison | Missing source facts recorded; unresolved KPI blocks publication, not scaffolding |
| 1 Foundation | Bun workspace, SvelteKit, Elysia, strict TS, Drizzle, PG18, CI | clean install/build/typecheck, disposable migration, health checks |
| 2 Security | Sessions, RBAC, workzone mapping, audit | login/logout, expiry/revocation, CSRF, scope bypass tests, no secrets |
| 3 Sync | Adapter, scheduler, window planner, merge, status events, quarantine, revision | fake upstream tests in Sync-Engine; no lost checkpoint or duplicate UUID |
| 4 Ticket Management | shared predicates, overview, buckets, list/detail, SSE | scoped API and UI tests, unknown status visible, count parity |
| 5 Reports | Semesta, Rekap Workorder, Detail WO HI, CSV | signed-off date/KPI definitions, drilldown parity, bounded export |
| 6 Performance | EXPLAIN ANALYZE, 1.2m/3.5m synthetic rows, k6 20/80/200 VU | measured targets or documented mitigations, security review, restore test |
| 7 Cutover | approved live backfill, shadow reconciliation, switch and rollback | closed fixture + taxonomy + TTR units + closure date signed off, coverage gaps resolved/accepted, backup verified |

## Definition of done
Each phase: source change, migration if needed, tests, documentation, Handover append, commit reference, risks and rollback. No production writes before approval. Record exact actual test outcomes, not expected ones. Keep DB schema reference synchronized with Drizzle migration; avoid new indexes without measured query plan. Track closure timestamp, KPI eligibility, historical backlog, manual flags and missing piloting fields as explicit open decisions. Use synthetic values in screenshots, fixtures and tests.
