# Migration & implementation roadmap

## 0. Freeze contract, not operations
Keep DOMPIS v2 serving users. New repo and isolated PG staging. Confirm legal/data retention; extract mapping/fixtures via authorized read-only export, not copy raw ticket DB. Backup legacy DB, check restore and corruption risk before any data extraction. Do not import old piloting tickets as canonical facts. If historic data unavailable upstream, decide separately whether to keep legacy read-only archive clearly labeled (not runtime ticket source). No automatic merge.

## 1. Discovery checklist
- Obtain OpenAPI and redacted actual open/closed responses including keys, nulls, multiple statuses, reopened, missing update timestamps, same-timestamp conflicts, unknown workzones and closed without closure timestamp.
- Confirm max page, offset, date range, date field semantics (reported vs closed vs modified), inclusive boundaries, timezone, stable ordering, resource freshness and key budget. Compare count per day with source authoritative report, not meta.count. Verify if source endpoint can filter closed date vs reported date; if reported only, rolling recent closed window will miss closures on old tickets. In that case design wider rolling sweep/targeted lookups within budget and disclose achievable latency; do not claim complete recent closures without coverage.
- Export approved source_vlookup mapping and region/branch/SA/workzone dimensions; compare names/codes and all scope roles. Classification fields formerly supplemented by piloting may disappear. Rule precedence and missing-value behavior signed off by ops.
- Build golden fixtures from legacy classifiers and aggregate outputs, with personally identifying data scrubbed. Record differences, not silently mimic legacy bugs. Verify status terminal set, SQM update, flags, SLA effective display vs compliance, recurring/GAUL semantics.

## 2. Implement increments
| Phase | Deliverable | Gate |
|---|---|---|
| A | Bun workspaces, TypeScript strict, SvelteKit SPA, Elysia health, Drizzle migration, CI | Clean install, lint/typecheck/build, isolated PG schema restore |
| B | Auth, scopes, admin user management, session security | Cross-scope deny tests and privilege review |
| C | NOSSA adapters + scheduler, normalizer, classifier, atomic upsert/history, checkpoint and quarantine | Idempotency, old/new/reopen conflict, overflow, outage, restart, rejected rows and budget tests |
| D | Ticket list/detail/overview, filters, SSE, status indicator | P0 acceptance + perf |
| E | Semesta, rekap/WO HI, exports | Count/membership parity; expected differences signed off |
| F | Backfill, shadow validation, pilot, cutover | Restore, load, security and operational acceptance |

## 3. Data movement
1. Create PG schema via Drizzle, apply DDL review and constraints. Seed dimensions/local rules; map accounts by username; legacy numeric IDs map only during migration in secure temporary mapping; preserve UUID on repeat seed via natural unique key. Migrate non-technician accounts only, verified compatible password hash or reset. Explicit scopes; unknown scope fail closed. Do not copy existing sessions.
2. Bootstrap open feed and rolling closed overlap first; serve internal preview after freshness validated. Historical backfill sequential low priority, window split, date floor per endpoint. No huge single transaction; batches 200–500 initial. Log range completion and rejected counts. Preserve current state against stale backfill.
3. Reconcile coverage per source/window, distinct incident and missing identifiers, lifecycle, counts by WIB day/workzone/bucket/dept, TTR eligible numerator/denominator, duplicate count zero, unknown scope queue. Compare old system with source truth; old totals may differ due to piloting or local fields. Record expected delta with owner and rationale. Backfill history events only from trustworthy timestamp evidence; do not fabricate transition timelines from current snapshot.
4. If legacy and new use same upstream API key, coordinate one global budget (separate key only if authorized). No simultaneous uncontrolled scans. Use offline fixture replay for initial testing, then approved shadow windows. Keep new database read-only for users until validated.

## 4. Test matrix
Unit: aliases/case, timezones, date boundary midnight, hash deterministic ordering, unknown/null/missing, classification precedence, SLA 3.6h, terminal set, role/scope/cursor. Integration: actual disposable PG, unique constraint + concurrent upsert, stale/new source, reopen, identical replay, transaction rollback, checkpoints/restart, cap and split, retry and rate budget, rejected rows, SSE reconnect. E2E: login/logout, scope filters, daily/semesta/rekap/WO HI, cell detail/export, stale UI, mobile. Load: k6 synthetic 20/80/200 users, cold/warm, 1.2m/3.5m rows, 30 min soak with ingestion, peak/spike, failure injection (DB unavailable/upstream 429), explain plans. Report p50/95/99, errors, CPU/RAM/disk wait, buffer reads/WAL/pool waits; compare with baseline on same hardware. Never run load test against production without authorization.

## 5. Cutover and rollback
- Go/no-go: approved source coverage and expected deltas; no unresolved data corruption/conflict critical; AC01–09, security and restore tests pass; SLO measured; documentation and ops signoff. Record rollback owner and DNS/proxy config.
- Switch reverse proxy route to new service; preserve legacy read-only deployment, separate DB. Invalidate legacy cookies and require fresh login. Monitor error rates, scan lag, count mismatches and disk pressure. Keep backups and log retention.
- Rollback on critical auth/scope leak, stale/incorrect data, or sustained SLO failure: stop new traffic, revert proxy to legacy, coordinate worker budget, do not drop PG or overwrite legacy DB. If future local edits introduced, reconcile before switching back. Restore only if DB loss, not routine rollback. Retain evidence sanitized. Decommission old components only after explicit acceptance and retention review.
