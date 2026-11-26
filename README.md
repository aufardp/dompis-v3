# DOMPIS v3

DOMPIS v1.1 rewrite workspace. The repository is being built in phases; the API, sync worker, domain rules, schema, and menu workflows are not complete yet.

## Local development

Use Bun 1.4.5 and PostgreSQL 18. The web app is a SvelteKit SPA and the API is an Elysia process. Keep them running in separate terminals; Vite proxies `/auth`, `/tickets`, and `/health` to the API on the same origin so browser cookies and CSRF checks work.

Install dependencies once:

```sh
bun install --frozen-lockfile
```

Create `.env` only if it does not already exist, then set `DATABASE_URL` to a local PostgreSQL database and `APP_ORIGIN=http://localhost:5173`:

```sh
cp -n .env.example .env
```

Apply the checked-in migrations to the selected local database when setting up the project or after pulling new migrations:

```sh
bun run db:migrate
```

Terminal 1 — API:

```sh
bun run dev:api
```

Terminal 2 — web:

```sh
bun run dev:web -- --host 127.0.0.1 --port 5173
```

Then open <http://localhost:5173>. If API port `3000` is occupied, set the same alternate port in both terminals, for example `API_PORT=39871 bun run dev:api` and `API_PORT=39871 bun run dev:web -- --host 127.0.0.1 --port 5173`.

No default account is seeded, so login requires a provisioned local user. `SYNC_ENABLED` must remain `false`; the worker has no upstream implementation yet. Keep `.env` local and do not put credentials in Git.

## Current boundaries

- `apps/web`: static SvelteKit client shell.
- `apps/api`: Elysia health, authentication, and exact incident detail endpoints.
- `apps/worker`: guarded, disabled sync process placeholder.
- `packages/contracts`: shared response types.
- `packages/db`: Drizzle schema, Bun SQL migration runner, and local PostgreSQL 18 migration history. Current organization/auth schema is candidate and not approved for production rollout.

See `docs/Implementation-Plan.md`, the Phase 0 reports (`Phase-0A-Discovery.md`, `Phase-0B-Discovery.md`, `Phase-0C-Contract-Access-Discovery.md`, and `Phase-0D-Design-Readiness.md`), `docs/Phase-2-Organization-Auth.md`, and `docs/Handover.md` for phase gates and unresolved evidence.
