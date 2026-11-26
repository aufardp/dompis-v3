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

Copy files to docs/, copy Agents.md to root AGENTS.md. Start Phase 0A only. Latest owner-approved requirements and v1.3 hierarchy policy supersede historical Handover notes. Open gates: actual local source and live DDL/profile, owner-approved top area and legacy master/user grants mapping, closed sample, closure date, TTR units, business rules, inactive/global policy, retention, execution/benchmark/restore. DDL reference not executed; generated reviewed Drizzle migrations become implementation truth. No raw PII, source or credentials in package. No production changes.

## v1.3 additional mandatory reading
- [Database-Access.md](Database-Access.md)
- [Engineering-Principles.md](Engineering-Principles.md)
- [Discovery-Protocol.md](Discovery-Protocol.md)
- [Decision-Log.md](Decision-Log.md)
- [Technical-Debt-Audit.md](Technical-Debt-Audit.md)
- [Performance-Standards.md](Performance-Standards.md)
- [Quality-Gates.md](Quality-Gates.md)
