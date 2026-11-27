# DOMPIS Next Generation — Blueprint v1.3

## Kebijakan v1.3 (berlaku atas seluruh dokumen)
Pemilik mengizinkan agent lokal mengakses MySQL dan PostgreSQL, read dan write. Akses aktual bergantung pada credential, jaringan, privilege dan sandbox agent; jangan mengakali kontrol. Gunakan Database-Access.md sebagai kebijakan otoritatif. Read produksi yang ringan dan write rutin terukur dalam target yang telah didaftarkan tidak memerlukan konfirmasi per query. Operasi produksi berisiko tinggi, perubahan schema produksi, bulk correction, freeze/cutover dan tindakan irreversible memerlukan persetujuan runbook khusus. Source legacy tetap read-only; database bukan source code. Discovery tidak mengubah data bisnis produksi. Semua rancangan teknis termasuk DDL, jumlah tabel/index dan alias adalah kandidat, bukan kontrak tetap. Direct matching Workzone diutamakan; buktikan keunikan global setelah normalisasi, jika ambigu gunakan pembeda yang terverifikasi, jangan menebak. Alias hanya bila terbukti diperlukan. Requirement bisnis, integritas historis, keamanan dan stack tetap wajib. Lihat Discovery-Protocol.md dan Decision-Log.md.

26 November 2026 · Greenfield Rewrite, Hierarchical Access Control & Migration Ready. Supersedes v1.1. Planning blueprint, not runnable software. SvelteKit / Bun / ElysiaJS / TypeScript / Drizzle / PostgreSQL 18 UUIDv7. Five-level master hierarchy, multi-grant users, 17 candidate tables (16 if aliases unnecessary), 7 candidate ticket secondary indexes. Mandatory historical MySQL ticket/master/user migration; then only NOSSA/NOSSA Closed. No assignment, piloting, permanent raw table, Redis or separate projection. Legacy source `/Users/pakbreng/Projects/dompis_v2` read-only; author reviewed uploaded archives, not live Mac checkout.

| Order | Documents |
|---|---|
| 1 | [Getting-Started](Getting-Started.md), [Agent-Prompts](Agent-Prompts.md), [Agents](Agents.md) |
| 2 | [PRD](PRD.md), [Implementation-Plan](Implementation-Plan.md), [Business-Rules](Business-Rules.md), [Legacy-Reference](Legacy-Reference.md) |
| 3 | [Architecture](Architecture.md), [Database](Database.md), [Organization-Scope](Organization-Scope.md), [Query-Standards](Query-Standards.md), [schema-proposed.sql](schema-proposed.sql) |
| 4 | [Data-Contract](Data-Contract.md), [Field-Mapping](Field-Mapping.md), [Sync-Engine](Sync-Engine.md) |
| 5 | [Migration](Migration.md), [Master-Data-Migration](Master-Data-Migration.md), [Legacy-Field-Mapping](Legacy-Field-Mapping.md), [Migration-Validation](Migration-Validation.md) |
| 6 | [Security](Security.md), [Design-System](Design-System.md), [Source-Audit](Source-Audit.md), [Handover](Handover.md) |

Current progress (2026-11-27): Phase 0B discovery is complete; Phase 0C contract/access validation is still in progress; Phase 1 implementation has not started. Latest owner decisions in `Decision-Log.md`, `Business-Rules.md`, and PRD v1.3 supersede older unresolved notes in historical handovers. Confirmed: lifecycle groups and reopen meaning, compliance `reported_date + threshold` versus `resolve_date`, type maximums/Indibiz rename, Regular countdown 24h, MTTR deferred, report date/population defaults, organization level mapping, current role policy, and `source_vlookup` authority. Remaining gates: upstream same-incident close→reopen plus pagination/window ordering/completeness evidence; Semesta default interval/granularity and any KPI membership/denominator not specified in PRD; GAUL definition if retained; sanitized fixture for offsetless source timestamps; 84-field eligibility and archive/PII retention; immutable source snapshot provenance, least-privilege migration role, isolated PostgreSQL restore rehearsal. Do not run historical ETL or production cutover before those gates and migration validation pass. No raw PII, source payloads or credentials in this package.

## v1.3 additional mandatory reading
- [Database-Access.md](Database-Access.md)
- [Engineering-Principles.md](Engineering-Principles.md)
- [Discovery-Protocol.md](Discovery-Protocol.md)
- [Decision-Log.md](Decision-Log.md)
- [Technical-Debt-Audit.md](Technical-Debt-Audit.md)
- [Performance-Standards.md](Performance-Standards.md)
- [Quality-Gates.md](Quality-Gates.md)
