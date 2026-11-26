# DOMPIS Rewrite — Final Blueprint v1.1 — Migration Ready
26 November 2026. Final planning package; not runnable software or production-approved DDL. Supersedes v1.0. One-time migration of historical `ticket` MySQL into canonical PostgreSQL; ongoing facts from NOSSA/NOSSA Closed only. No technician assignment, permanent raw table, Redis or projection queue. UUIDv7 and incident unique; cold restricted legacy mapping/archive. No production changes.

| Read order | Document | Purpose |
|---|---|---|
| 1 | [Getting-Started.md](Getting-Started.md) / [Agent-Prompts.md](Agent-Prompts.md) | Start repository and agent |
| 2 | [PRD.md](PRD.md) / [Implementation-Plan.md](Implementation-Plan.md) | Requirements and gates |
| 3 | [Architecture.md](Architecture.md) / [Database.md](Database.md) / [schema-proposed.sql](schema-proposed.sql) | Runtime and schema |
| 4 | [Data-Contract.md](Data-Contract.md) / [Field-Mapping.md](Field-Mapping.md) / [Sync-Engine.md](Sync-Engine.md) | NOSSA integration |
| 5 | [Migration.md](Migration.md) / [Legacy-Field-Mapping.md](Legacy-Field-Mapping.md) / [Migration-Validation.md](Migration-Validation.md) | Historical ETL and cutover |
| 6 | [Security.md](Security.md) / [Design-System.md](Design-System.md) / [Source-Audit.md](Source-Audit.md) | Security, UX, legacy findings |
| 7 | [Agents.md](Agents.md) / [Handover.md](Handover.md) | Agent rules and append-only log |

Place files in docs/, copy Agents.md to root AGENTS.md. v1.1 migration rules supersede contradictory historic notes in Handover. Actual closed payload, production schema/profile, closure/SLA/KPI, local-field and retention decisions, benchmark and restore remain gates. No raw source data included. DDL reference, not executed. Drizzle migration is implementation source of truth once generated and reviewed.
