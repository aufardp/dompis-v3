# Phase 1 — Foundation

Tanggal: 2026-11-26. Status: **local Phase 1 gate complete**. Production/staging readiness is not implied.

## Scope and current evidence

Phase 1 covers the existing Bun workspace, SvelteKit 3/Svelte 5 web shell, Elysia API and worker process entry points, strict TypeScript, Drizzle/PostgreSQL 18, and repeatable CI checks. This phase does not define ticket lifecycle, KPI, role grants, organization crosswalks, or start synchronization.

| Acceptance item | Evidence | Status |
|---|---|---|
| Pinned workspace/runtime dependencies | `package.json`, `bun.lock`, `packageManager: bun@1.4.5` | Pass |
| Strict TypeScript and framework diagnostics | `bun run typecheck` | Pass: web 0 errors/0 warnings; API and worker `tsc` pass |
| Production bundle | `bun run build` | Pass: SvelteKit static output and Elysia bundle built |
| PG18 candidate migration | `dompis_v3`, transactionally applied through Bun SQL/Drizzle; 19 tables/21 FKs after Phase 2 migration; migration history has two entries | Pass for local application and tracking only |
| Drizzle schema/migration drift | `bun run db:generate` | Pass: no changes to migrate |
| CI definition/install | `.github/workflows/ci.yml`, YAML parser, `bun install --frozen-lockfile` | Pass locally: YAML parses; frozen install reports no changes |
| API liveness | GET `/health/live` | Pass: HTTP 200, `{"status":"alive"}` |
| API readiness without DB | GET `/health/ready` with no `DATABASE_URL` | Pass: HTTP 503, `database_not_configured` |
| API readiness with Bun SQL/PG18 | API GET `/health/ready` using `.env`→`dompis_v3` | Pass: HTTP 200 `ready` |
| Migration restore/rollback rehearsal | Not performed | Open |
| Database roles/runtime least privilege | Current local owner is superuser; no runtime role configured | Open; superuser must not be used by runtime |
| Worker behavior | Explicitly reports unimplemented when `SYNC_ENABLED=true` | Deferred to Phase 3B; no live sync |
| CI remote execution | No GitHub Actions run available in this local task | Open |

## Phase boundary

The local Phase 1 gate is complete: the workspace/type checks/build, PostgreSQL 18 migration/constraints and Bun SQL runtime readiness all passed. Remote CI execution and a schema restore rehearsal remain open, but are not used to claim production readiness. The project database is local development and its login owns the database, so a separate least-privilege runtime role is required before staging. Phase 2 has since replaced the initial hierarchy/scope scaffold; business-dependent imports, permissions and reports remain gated by Phase 0C decisions.

## Next actions

1. Observe a remote GitHub Actions run of the new workflow; all configured commands passed locally, but no remote run was available here.
2. Exercise Bun SQL against only `dompis_v3_dev` using a non-superuser development/runtime role with narrowly scoped privileges; do not put credentials in logs or handover.
3. Run a documented schema-only backup/restore or rollback rehearsal on disposable databases after a safe target guard is available.
4. Review/approve the foundation boundary and then proceed to Phase 2 organization/auth schema design only with scope/RBAC blockers clearly separated; do not infer owner decisions.

## Addendum — pgAdmin local database setup (2026-11-26)

At the user's request, a PostgreSQL login role `root` (non-superuser, no CREATEDB/CREATEROLE) and database `dompis_v3` were created on the local PostgreSQL 18.7 cluster at `127.0.0.1:5432`. `root` owns the database. The checked-in candidate migration was applied transactionally, leaving 14 public tables. Password is stored only in ignored local `.env` with mode 0600; it is excluded from repository documentation and output.

The API then returned HTTP 200 `{"status":"ready"}` using the Bun SQL connection from `.env`, confirming app-to-database connectivity. The database should appear in pgAdmin after refreshing the Databases node **if** the registered pgAdmin server uses the same host/port/cluster (`127.0.0.1:5432`). Read-only inspection found the local pgAdmin profile but zero saved server registrations, and no pgAdmin container is running; register that PostgreSQL server in pgAdmin before expecting the database in its tree. The user-requested disposable `dompis_v3_dev` database was verified schema-only with no active sessions and dropped; `dompis_v3` remains the project database.
