# Getting Started — building DOMPIS with an AI coding agent

## 1. Prepare a clean workspace
Install Git, Bun and PostgreSQL 18 (or disposable local PG18 via Docker). Verify `bun --version`, `git --version`, `psql --version`. Never point development at existing production DB. On Mac/Linux:

```sh
mkdir dompis-next && cd dompis-next
git init
mkdir -p docs
# Copy all blueprint Markdown files and schema-proposed.sql into docs/.
cp docs/Agents.md AGENTS.md
```
On a case-sensitive filesystem use root AGENTS.md exactly. Keep legacy source in a separate read-only directory, not copied as new app. Do not copy customer payloads or .env. Commit docs after review. Use coding agent in this repository (Codex CLI/IDE or another local workspace-capable agent). Agent must have workspace access, terminal and permission to run tests; do not grant unrestricted production credentials.

## 2. Scaffold after agent verifies compatibility
Commands below are starting points, not executed here. Agent must confirm CLI options and package versions from official docs and pin compatible versions; no global unpinned dependencies required.

```sh
bun init -y
mkdir -p apps packages tests ops
bunx sv create apps/web
mkdir -p apps/api/src apps/worker/src packages/db/src packages/domain/src packages/contracts/src
```
Choose SvelteKit minimal, TypeScript, Bun package manager. Root package.json private with workspaces `apps/*`, `packages/*`; every package has a unique name and package.json. Add Elysia to api, Drizzle ORM and a single Bun-compatible PostgreSQL driver to db, drizzle-kit as dev dependency; choose driver after smoke test. Static SvelteKit adapter with SPA fallback, same-origin reverse proxy `/api/v1/*` to Elysia; don't accidentally let fallback consume API requests. Commit bun.lock; CI installs with `bun install --frozen-lockfile`. Strict TS, lint, format, test scripts at root. No Redis or Prisma. Agent writes configuration and tests, rather than blindly pasting commands.

## 3. Local database
Example disposable Docker (replace password with unique local secret, bind localhost only):
```sh
docker run --name dompis-dev-pg -e POSTGRES_DB=dompis_dev \
  -e POSTGRES_USER=dompis_dev -e POSTGRES_PASSWORD='<local-password>' \
  -p 127.0.0.1:5433:5432 -d postgres:18
```
Use .env ignored by Git; create .env.example with placeholders: DATABASE_URL, WORKER_DATABASE_URL, MIGRATION_DATABASE_URL, QOSMIC_BASE_URL, QOSMIC_API_KEY, QOSMIC_RATE_PER_MIN=20, SYNC_ENABLED=false, TZ=Asia/Jakarta, APP_ORIGIN, SESSION_SECRET if needed. Separate API/worker/migrator DB permissions before staging. `uuidv7()` requires PG18; verify server version via SQL. Agent translates reference DDL into Drizzle schema, generates migration, reviews SQL, applies to disposable DB and checks schema/index parity. Never run schema-proposed.sql and generated migration on the same DB. No drizzle push against production. Seed synthetic users via secure bootstrap command, no default passwords.

## 4. First prompt for agent
```text
Read root AGENTS.md and all docs, starting with PRD, Data-Contract, Field-Mapping, Sync-Engine, Database, Architecture and Implementation-Plan. Inspect legacy sources read-only if available. This is a clean rewrite. Only NOSSA and NOSSA Closed are runtime ticket sources; migrate the approved MySQL ticket snapshot once as historical baseline. Read Legacy-Field-Mapping.md and Migration-Validation.md; never connect to production without authorization. No technician assignment, piloting, Redis or projection daemon. Use SvelteKit, Bun, ElysiaJS, TypeScript strict, Drizzle, PostgreSQL 18 and UUIDv7. Start Phase 0 only. Return a requirement matrix, unresolved contract items and verification plan; then build Phase 1 foundation only when approved. Do not use real customer payloads, call upstream, or touch production. Run tests, show changed files and command results; append Handover.md after every work session, including failed attempts. Do not invent closure timestamp, TTR unit or business rules. Stop at release gates.
```

## 5. Agent workflow
For each phase use a fresh bounded prompt: `Read AGENTS.md and latest Handover.md. Implement Phase N only, with acceptance tests. Report diffs, commands, blockers, rollback and next step; append Handover.md.` Review diff before merging. Keep tasks small; commit one coherent change per phase. Never ask agent to rewrite whole system in one uncontrolled run. Use separate branch and review migration SQL. Start with fake upstream fixtures, then staging credentials with owner approval and rate budget.

## 6. Local execution contract
Agent creates root commands: `bun run dev`, `bun run dev:api`, `bun run dev:web`, `bun run dev:worker`, `bun run db:generate`, `bun run db:migrate`, `bun run typecheck`, `bun run lint`, `bun test`, `bun run test:integration`, `bun run test:e2e`, `bun run build`. These are required scripts to implement, not existing commands. Suggested ports web 5173/API 3000/DB 5433; worker disabled by default. Use proxy for cookies and SSE. Check `/health/live`, `/health/ready`, login, seeded scope, fake sync, ticket list; only then enable live staging sync. See Security and Migration for deployment.

## 7. Migration-ready starting instructions
Copy `Agents.md` to root `AGENTS.md` as before. Keep legacy `prisma/schema.prisma`, approved migrations and classifier code outside new repo read-only (no raw customer data). Phase 0 includes source DDL/profile and a complete legacy mapping; phase 1 scaffolds schema v1.1; phase 3 builds ETL plus sync using synthetic records. Add CLI commands `bun run migration:profile`, `migration:dry-run`, `migration:import`, `migration:validate` and `migration:reconcile` (agent must implement; not included). Require explicit `--snapshot-id`, target allowlist, `--dry-run` default and guarded apply; no automatic import on startup. Credentials via ignored local secret files only: `LEGACY_MYSQL_URL` for isolated read-only restore, `MIGRATION_DATABASE_URL` for PG migration role; omit from runtime web/worker. Use verified backups and signed manifest; never copy production dump into repo. Production phase must follow Migration.md and Migration-Validation.md gates. Read Agent-Prompts.md for phase-specific prompts.
