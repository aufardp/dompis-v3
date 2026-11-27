# Getting Started — DOMPIS v3 local development

This guide describes the current repository, not the original greenfield bootstrap. The workspace, SvelteKit web app, Elysia API, Drizzle schema, local PostgreSQL database, authentication foundation, and organization/user-management foundation already exist. **Do not rerun scaffold commands, recreate the database, or apply candidate setup instructions from old handovers.** Current phase gates are in [Execution Readiness](Execution-Readiness.md).

## Requirements

- Bun version pinned by the repository's `package.json`/lockfile.
- Local PostgreSQL 18 database `dompis_v3`, registered in pgAdmin against the same local PostgreSQL cluster.
- Local environment values in ignored `.env`; never paste credentials into docs, logs, fixtures, or Git.

The local application database was previously configured for this project. If the PostgreSQL server is stopped, start the existing local service and check it with `pg_isready`. Do not drop/recreate `dompis_v3`; it is the persistent development database. Use `Database-Access.md` and `Database.md` before any schema/data operation.

## Install and configure

From the repository root:

```sh
bun install --frozen-lockfile
```

Configure the ignored `.env` with the local PostgreSQL connection and `APP_ORIGIN=http://localhost:5173`. Keep `SYNC_ENABLED=false`; do not add NOSSA credentials or enable live sync as part of ordinary local startup. The API validates the database and authentication origin at readiness. See [Security](Security.md) for cookie/origin requirements.

## Run the application

Open two terminals in the repository root.

Terminal 1 — API:

```sh
bun run dev:api
```

Terminal 2 — web app:

```sh
bun run dev:web
```

Open `http://localhost:5173`. The web development server proxies authentication, ticket, health, and admin API requests to the API process. If API port 3000 is occupied, set the same `API_PORT` for the API process and the web process so the proxy targets the correct port.

The worker is not needed for login/UI development. It must stay disabled until the sync phase and its upstream access runbook are approved. Local readiness endpoints are `/health/live` and `/health/ready`; readiness requires a valid local database connection and `APP_ORIGIN`.

## Local login

There is no default user or password. If the local database has not yet been bootstrapped, the guarded command is:

```sh
bun run auth:bootstrap
```

Run it interactively only against the verified local `dompis_v3` target. It creates the initial superadmin only when its safety preconditions pass. It does not reset or replace an existing user. Do not run it against production or use application bootstrap as a migration tool.

## Useful verified commands

```sh
bun run typecheck
bun run build
bun run db:generate
bun run db:migrate
```

`db:migrate` changes the configured database schema. Verify the target and migration plan first; do not run it just to start the app. Do not run integration or browser suites against the persistent project database; use an explicitly disposable target and the relevant documented guard.

## Continue engineering work

Read the latest [Handover](Handover.md), [Implementation Plan](Implementation-Plan.md), and [Execution Readiness](Execution-Readiness.md) before choosing a task. Phase 0C remains open for upstream contract evidence, unresolved report definitions, archive/PII retention, source snapshot provenance, least-privilege migration access, and isolated restore evidence. Do not start historical ETL, make live NOSSA calls, or perform production changes until the applicable gates and runbooks are satisfied.

The local `AGENTS.md`, agent prompts, and skills are excluded from Git by repository policy. They are optional local agent instructions; this guide and the tracked product documentation are the shared project reference. The legacy project remains read-only evidence at `/Users/pakbreng/Projects/dompis_v2`.
