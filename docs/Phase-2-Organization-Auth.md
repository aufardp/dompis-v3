# Phase 2 — Organization and Authorization Foundation

Tanggal: 2026-11-26. Status: **schema foundation, shared authorization resolver, and basic HTTP session flow implemented locally; Phase 2 remains in progress**.

## Implemented

- Organization is now represented as native PostgreSQL relations: `areas → regions → branches → service_areas → workzones`. Parent-scoped natural-code uniqueness is used below the top area. Workzone identity remains parent-scoped; no global uniqueness or alias matching was invented.
- Added generic `roles`, `permissions`, and `role_permissions`; `users.role_id` replaces the scaffold's hardcoded legacy role strings. No roles or permissions are seeded, so no old role is implicitly mapped or granted.
- Added `user_scopes` with typed nullable target FKs for each hierarchy level, an exactly-one-target check, and a `UNIQUE NULLS NOT DISTINCT` constraint to prevent duplicate grants while allowing overlapping ancestor/descendant grants.
- Added `loadAuthorizationContext`, which resolves only unrevoked, unexpired session token hashes for active users/roles and loads role permissions. Raw cookie tokens are not accepted by the database lookup.
- Added reusable `ticketAccessPredicate`: it returns SQL `FALSE` without the required permission; otherwise an `EXISTS` hierarchy predicate enforces explicit global scope or the union of any user grants, excludes inactive ancestors/workzones, denies unmapped tickets, and avoids grant fan-out. Callers compose requested filters with this predicate using `AND`.
- Added `/auth/csrf`, `/auth/login`, `/auth/logout`, and `/auth/me`. Login requires exact configured Origin and a timing-safe double-submit CSRF token, normalizes username, verifies Argon2id (with a dummy hash for missing identities), applies bounded per-account and per-connection-IP throttles, issues a random 32-byte opaque token in a `__Host-` Secure/HttpOnly/SameSite=Lax cookie, and stores only SHA-256. Logout revokes the matching live hash; `/me` re-resolves current active session, role, scope version, and permissions.
- API auth routes are composed through a route factory so requests can be tested with `app.handle` and a rollback-only database transaction. DB-specific identity/session statements live in the DB package.
- Added a reusable Elysia `requirePermission` macro. Each protected route resolves session/role/permission once, returns 401 for absent/stale sessions, 403 for missing capability, and injects the typed `authorization` context for its handler. Guarded and auth responses use `private, no-store`.
- Added exact incident detail `GET /tickets/:incident`, guarded by the proposed (unseeded) `tickets.read` permission. It normalizes the canonical incident key, applies `ticketAccessPredicate` in the same SQL query, returns 404 for absent and out-of-scope tickets, and selects an explicit non-PII DTO without raw `detail`, summary, customer, or service number fields. It exposes stored SLA/TTR values as-is and calculates no unverified rules.
- Existing `user_workzones` and obsolete scaffold fields were removed in migration `0001_wild_shadow_king.sql`. This local database had no users, grants, masters, or tickets before migration; only the internal `sync_revision` row existed.
- Added a native Bun SQL/Drizzle migrator and `bun run db:migrate`. The existing `0000` baseline was recorded in `drizzle.__drizzle_migrations` using its verified SQL SHA-256 and journal timestamp, then migration `0001` was applied by the Drizzle migrator.

## Verification

- `bun run typecheck`: passed; Svelte diagnostics 0 errors/0 warnings, API and worker TypeScript checks passed.
- `bun run build`: passed for SvelteKit and Elysia.
- `bun run db:generate`: 19 tables; no schema drift after migration generation.
- `bun run db:migrate`: applied `0001`; a second run exited successfully without adding a migration row.
- PostgreSQL 18.7 catalog: 19 public tables, 21 foreign keys, 2 migration ledger rows; `user_scopes` unique index reports `indnullsnotdistinct=true`; exactly-one-target check exists.
- Synthetic SQL transaction inserted a complete synthetic hierarchy/user and verified duplicate, zero-target, multi-target, and invalid-FK scope writes are rejected. Transaction was rolled back. Final table counts remained 0 for tickets/users/scopes/roles; only `sync_revision=1`.
- `bun --env-file=.env test packages/db/src/authorization.test.ts`: 1 integration test passed with 9 expectations. It verifies active session, revoked/expired/missing session denial; scoped grant union and duplicate-free ticket results; filter intersection; no-grant denial; explicit global scope; missing permission denial; and inactive-ancestor exclusion. All fixtures roll back.
- `bun --env-file=.env test apps/api/src/auth.test.ts`: 1 integration test passed with 28 expectations. It verifies strict Origin and CSRF denial, Argon2id login, cookie attributes, authenticated `/me`, logout revocation, generic bad-password response, the 10-attempt throttle, and guard denial/allow behavior with `private, no-store`. Fixtures roll back.
- `git diff --check`: passed after updates.

## Boundaries and open work

- Phase 2 is not complete: the permission macro currently protects only exact incident detail; ticket list/search/report/export/SSE routes, organization/user APIs and UI, audit behavior, reparent/revocation workflows, session invalidation on administrative changes, and broad endpoint security tests remain unimplemented. Permission `tickets.read` is proposed and intentionally unseeded pending capability approval.
- Permission codes and role assignments are intentionally unseeded until the capability matrix is owner-approved. The schema only expresses RBAC relationships; empty permission state must deny all protected actions.
- No legacy master/user/scope data was migrated. New top-level-area crosswalk, Workzone dictionary, old-to-new role mapping, account activation, and effective-scope parity remain Phase 0C blockers.
- No Workzone alias table was added. The 74 unmatched legacy keys remain unresolved pending an approved crosswalk.
- The candidate schema migration includes drops of empty scaffold structures. Do not apply this migration line to a database containing application data; production requires a reviewed additive/copy/backfill plan and backup.

## Next actions

1. Add ticket list/search routes with validated filters, keyset pagination and signed scope-bound cursors; every route must use the shared permission guard and ticket predicate.
2. Define and implement audit events before organization/user administration mutations; capability matrix is still owner-gated.
3. Build organization/user administration endpoints and UI only after mutation permissions are explicit; test reparent, grant revocation, last-admin protection and session invalidation.
4. Keep legacy import, role mapping, crosswalk and live NOSSA behavior gated by their owner decisions and fixtures.
