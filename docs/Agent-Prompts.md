# Agent Prompts — DOMPIS v1.1

## Master prompt (first session)
```text
Act as senior software architect, full-stack Svelte/Bun/Elysia/TypeScript engineer, PostgreSQL/Drizzle DBA and security engineer. Read root AGENTS.md, all docs including PRD, Architecture, Database, Data-Contract, Field-Mapping, Legacy-Field-Mapping, Sync-Engine, Migration, Migration-Validation, Security, Design-System, Implementation-Plan and latest Handover. Build a clean Ticket-First modular monolith. Only four user menus: Ticket Management, Semesta, Rekap Workorder, Detail WO HI; supporting auth, scope, audit, sync monitoring. No assignment/technician workflow, piloting, permanent ticket_raw, separate projection or Redis. SvelteKit, Bun, ElysiaJS, strict TypeScript, Drizzle and PG18 UUIDv7. Migrate eligible historical MySQL ticket once into canonical tickets using stable incident and cold legacy ID mapping, then NOSSA/nossa-closed only. Do not lose historical fields or invent upstream metadata, closure dates, TTR units, scope or KPI rules. Start Phase 0 ONLY: inspect supplied source read-only, compare actual available schemas and contracts, produce requirement matrix, field disposition, risk list, unresolved decisions, test plan and next phase checklist. No real endpoint/production DB access without approval. Append Handover with exact actions, tests, blockers and rollback. Stop at phase gate.
```

## Phase 1 — foundation
```text
Read AGENTS.md and latest Handover. Implement Phase 1 only after Phase 0 approval. Scaffold Bun workspace, SvelteKit static SPA, Elysia API/worker, shared domain/contracts, strict TS, CI and Drizzle migrations from v1.1 SQL. Verify compatible versions using official docs. Test clean disposable PG18 migration and schema/index/constraint parity. Create .env.example with safe placeholders; no real credentials. Worker disabled by default. Report exact test outcomes and append Handover.
```

## Phase 2–3 — auth, migration and sync
```text
Implement only next approved phase. For Phase 2 test session, authorization and scoped queries incl. archive privilege. For Phase 3a implement guarded offline ETL profile/dry-run/import/validate/reconcile against synthetic MySQL snapshot + disposable PG; stable UUID, archive accounting, checkpoint and replay tests. For Phase 3b implement two-source worker, bounded pagination/rate limits, changed-only merge, legacy provenance and source conflict tests. No live requests. Review report field needs before declaring done. Append Handover.
```

## Phase 4–7 — UI, reporting, test and cutover
```text
Read AGENTS.md, Handover and relevant phase gates. Implement only next approved phase with shared scope and KPI predicates. Compare historical migrated fixtures and current source fixtures; do not invent missing metrics. Verify security, benchmark, restore and rollback before production. For Phase 7 produce command-level runbook and dry-run results; do not execute real export/import/freeze/switch without explicit operator approval. Log actual changes, tests, rejected cases, risks, rollback and next action in Handover.
```

## Reusable continuation prompt
```text
Inspect git status and latest Handover, read docs relevant to this task. Identify next approved phase and prerequisites; implement smallest coherent change; run relevant tests, show actual output summary and files changed. If blocked, document exact blocker and stop safely. Do not overwrite unrelated changes. Append Handover before final response.
```
