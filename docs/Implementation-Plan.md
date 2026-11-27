# Implementation Plan — v1.3 Greenfield + Migration Ready

## Kebijakan v1.3 (berlaku atas seluruh dokumen)
Pemilik mengizinkan agent lokal mengakses MySQL dan PostgreSQL, read dan write. Akses aktual bergantung pada credential, jaringan, privilege dan sandbox agent; jangan mengakali kontrol. Gunakan Database-Access.md sebagai kebijakan otoritatif. Read produksi yang ringan dan write rutin terukur dalam target yang telah didaftarkan tidak memerlukan konfirmasi per query. Operasi produksi berisiko tinggi, perubahan schema produksi, bulk correction, freeze/cutover dan tindakan irreversible memerlukan persetujuan runbook khusus. Source legacy tetap read-only; database bukan source code. Discovery tidak mengubah data bisnis produksi. Semua rancangan teknis termasuk DDL, jumlah tabel/index dan alias adalah kandidat, bukan kontrak tetap. Direct matching Workzone diutamakan; buktikan keunikan global setelah normalisasi, jika ambigu gunakan pembeda yang terverifikasi, jangan menebak. Alias hanya bila terbukti diperlukan. Requirement bisnis, integritas historis, keamanan dan stack tetap wajib. Lihat Discovery-Protocol.md dan Decision-Log.md.

Only one approved phase at a time; unresolved business semantics block affected implementation/release, not unrelated scaffold after approval. Current phase state and executable next steps are maintained in [Execution-Readiness.md](Execution-Readiness.md). Documentation preparation does not itself approve the next phase, source access, migration or release.

| Phase | Deliverable | Gate |
|---|---|---|
| 0A Legacy audit | Read-only local checkout, version/hash, file map, exact master/ticket/user models, actual schema drift with approval | No copying code; evidence paths and limitations |
| 0B Business extraction | Rule registry and fixtures, legacy KPI definitions, scope semantics, source field dependencies | Candidate rules documented; missing facts explicit |
| 0C Contract & access | Closed fixture, TTR/time rules, master crosswalk, user effective scope comparison, role permissions | Owner-approved organization/grant policy and field disposition |
| 0D Design finalization | DDL, Drizzle compatibility plan, query/access patterns, migration plan and test matrix | Review design, approve remaining blockers/phase scope |
| 1 Foundation | Bun workspace, SvelteKit, Elysia API/worker, strict TS, Drizzle, PG18, CI | Disposable DB migration/constraint parity, build/typecheck |
| 2 Auth & organization | Sessions, RBAC, five master levels, user_scopes, aliases, admin UI/API | Deny-by-default, union/intersection, revoke, reparent, audit tests |
| 3A Legacy ETL | Master/user/grant manifests then ticket ETL; dry-run, resume, validation | Stable UUID, row accounting, zero unapproved access expansion, synthetic restore |
| 3B NOSSA sync | Adapter, adaptive windows, changed-only upsert, alias mapping, revision/SSE | Mock pagination/merge/reopen/quarantine, no lost checkpoint; no live calls without approval |
| 4 Ticket Management | Shared scope/filter, overview, list/detail, SSE | Scoped API/UI parity, freshness, unknown quality |
| 5 Reports | Semesta, Rekap Workorder, Detail WO HI, export | Approved KPI/date definitions, scope/group/drilldown parity |
| 6 Performance & security | EXPLAIN, realistic 1.2m/3.5m synthetic rows, k6 20/80/200 VU | Measured target or approved mitigation, access/restore regression |
| 7 Cutover | Approved master/user/ticket snapshot, delta, reconcile, shadow, switch/rollback | Migration-Validation all gates, verified backup, security and signed approval |

## Definition of done
Every phase records actual tests, git diff/commit, risks, rollback, schema changes and next action in Handover. Do not mark pending tests as passed. Keep Drizzle migrations/SQL/docs in sync. Query-Standards and Security apply to every phase. No production export, writes, live endpoint access or cutover without owner approval. Phase 7: freeze consistent master/grant/ticket snapshot, run baseline and reconcile newer NOSSA separately, then switch after sign-off. No historical event fabrication; no silent KPI or access deltas.
