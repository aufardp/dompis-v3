# Agents — mandatory working agreement

Copy/rename this file to `AGENTS.md` at repository root for tools that use that convention; keep one canonical copy to avoid divergence. Applies to every AI or human coding agent.

## Read order
1. Handover.md (latest entry and open issues), PRD.md, Architecture.md.
2. Database.md + schema-proposed.sql, Security.md, Design-System.md.
3. Migration.md, Source-Audit.md and actual repository code/migrations. If docs contradict code, record discrepancy; do not silently change requirements. User-approved decisions override proposals.

## Non-negotiable rules
- Stack Svelte/SvelteKit, Bun, Elysia, strict TypeScript, Drizzle, PostgreSQL. Keep modular monolith and two runtime processes, no extra infra without ADR.
- NOSSA and NOSSA-closed only for ticket facts. Do not restore piloting queries, external SQL or parallel projection. No technician assignments or features outside PRD.
- UUID native for all entity PK/FK; incident unique; never create duplicate tickets. Do not regenerate UUID on upsert. Timestamp timezone explicit, typed data, deterministic classification, no status changes on absence.
- All list/summary/drilldown/export predicates share domain and scope; deny-by-default. No UI-only RBAC, never bypass scope for admin unless explicit global grant. No raw PII or secret logs. Do not run live endpoint calls without user-approved budget/credentials.
- Prefer simple solution; no premature cache/index, worker, abstraction. Review query plans before extra indexes; keep data changes transactionally correct; ensure rollback and migration safety. Do not execute destructive migrations or production commands without explicit authorization and backup.
- Validate real API contract before implementing mappings. Unknown is unknown; do not invent field/date semantics or rule priority. Golden fixture parity precedes rollout. A rule change requires version, tests, reclassification plan and explicit business sign-off.

## Workflow for each task
1. Read relevant source and git status; identify acceptance criteria, affected routes, schema, security and test plan; document assumptions. Do not overwrite unrelated user changes.
2. Implement smallest coherent change; preserve strict typing, modular boundaries, validation and error codes. Keep dependency additions justified. Pin versions; update lockfile. Do not use `any` to suppress type errors, disable failing tests, or swallow exceptions.
3. Run targeted unit/integration tests, typecheck, lint/build and applicable e2e/load checks. Commands should be defined in root package.json (`bun run typecheck`, `bun run lint`, `bun test`, `bun run test:integration`, `bun run test:e2e`, `bun run build`, `bun run db:generate`, `bun run db:migrate`); these are proposed commands, not yet verified. Integration DB disposable with explicit environment guard; no real incident/customer data in fixtures.
4. Review diff, security, query plan if SQL changed, migration and rollback. Record measured results, not claims; state tests skipped or failed and why. Update relevant docs and append Handover.md before final response. Do not claim deployment if not done.

## Definition of done
Acceptance criteria satisfied; no new critical security regression; schema and migrations match; generated code checked; tests pass or limitations explicit; docs current; handover appended with files/actions/test commands/risks/next steps. If blocked, stop at safe boundary, leave reproducible state and precise blocker. No destructive action or secret in Handover.

## v1.0 required reading
Data-Contract.md, Field-Mapping.md, Sync-Engine.md, Getting-Started.md, Implementation-Plan.md. Never commit original payloads, customer data, credentials or unrestricted logs. Do not mark implementation complete merely because docs are complete. Stop before production cutover if closed fixture or KPI contract remains unresolved.
