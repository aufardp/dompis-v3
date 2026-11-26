# DOMPIS v3

DOMPIS v1.1 rewrite workspace. The repository is being built in phases; the API, sync worker, domain rules, schema, and menu workflows are not complete yet.

## Local foundation

Use Bun 1.4.5 and PostgreSQL 18. The web app is a SvelteKit static SPA; serve the API separately on loopback and route `/api/` to it through the same-origin reverse proxy described in `docs/Architecture.md`.

```sh
bun install --frozen-lockfile
# Configure .env from .env.example for a local PostgreSQL database first.
bun run db:migrate
bun run dev:web
bun run dev:api
```

Copy `.env.example` to an ignored `.env` only for local development. Set `DATABASE_URL` to a disposable local PostgreSQL database. `SYNC_ENABLED` must remain `false`; the worker has no upstream implementation yet.

## Current boundaries

- `apps/web`: static SvelteKit client shell.
- `apps/api`: Elysia health endpoints.
- `apps/worker`: guarded, disabled sync process placeholder.
- `packages/contracts`: shared response types.
- `packages/db`: Drizzle schema, Bun SQL migration runner, and local PostgreSQL 18 migration history. Current organization/auth schema is candidate and not approved for production rollout.

See `docs/Implementation-Plan.md`, `docs/Phase-0-Discovery.md`, `docs/Phase-2-Organization-Auth.md`, and `docs/Handover.md` for phase gates and unresolved evidence.
