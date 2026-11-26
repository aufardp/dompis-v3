# Handover — chronological append-only agent log

Purpose: record the end of every AI agent change, including docs-only, migration, bug fix, failed attempt, or verification. Append entry, never erase prior decisions. Do not log credentials, full customer payload or personal data. Use UTC timestamp plus WIB where useful; record exact branch/commit when available. Latest verified status is not necessarily newest planned task.

## 2026-11-25 — Initial rewrite blueprint
- Agent: ChatGPT; branch/commit: unavailable (uploaded archives, not git checkout).
- Goal: review available DOMPIS v2 sources and propose ticket-first rewrite.
- Actions: extracted six ZIP archives, inventoried source/docs/migrations/Graphify snapshots, inspected relevant sync/projection/DB/route/classification/auth/ops paths. Drafted PRD, architecture, design, schema, security, migration, agent guide and source audit.
- Changed: documentation package only. No original project source, endpoint, server or production database changed.
- Decisions proposed: SvelteKit static internal SPA; Bun/Elysia API + single Bun sync worker; PostgreSQL UUIDv7 (PG18 recommendation), canonical ticket, no Redis on MVP, opaque sessions, six initial ticket secondary indexes. These are not approved implementation decisions yet.
- Tests: no application build, live endpoint, database migration, security audit execution or benchmark run; SQL draft not executed. ZIP/package validation performed during deliverable creation.
- Blockers: actual NOSSA fixture/OpenAPI, field mapping and timestamp semantics, business classification/SLA parity, scope mapping, retention, live volume/storage benchmark; package manifest/lockfile/git HEAD absent from supplied set.
- Next: obtain sanitized fixtures and verify contract; decide status/rule precedence; create workspace and test DB; implement auth + migration then sync; see Migration.md release gates.
- Rollback: none needed; documentation only. Keep old system unchanged until explicit cutover.

## Template — copy for every completed/blocked task
```markdown
## YYYY-MM-DD HH:mm WIB — short title
- Agent / branch / commit:
- Task / AC IDs:
- Status: completed | partial | blocked | reverted
- Before / after:
- Files changed (paths and rationale):
- DB migration / indexes / data effect:
- API / UI / security changes:
- Tests executed (exact commands, outcome, environment):
- Tests not run / reason:
- Metrics or query plan (if relevant):
- Decisions / ADR / assumptions:
- Known issues / blockers:
- Rollback steps:
- Next action (smallest executable step):
```

## 2026-11-25 — Blueprint v1.0 contract refinement
- Action: reviewed supplied bridge documentation and parsed all 100 JSON rows; 103 observed fields, 100 unique incidents, 11 CLOSED rows on /nossa. No closed sample supplied.
- Changes: added Data-Contract, Field-Mapping, Sync-Engine, Getting-Started, Implementation-Plan; revised DDL/Database and architecture/PRD/agent instructions. Added typed source segment, service/classification IDs, raw TTR, flags, source timestamps and district fields, candidate global open index.
- Decision: upstream documented 50/min, local initial 20/min; no third endpoint; preserve numeric source TTR unit unknown, closure date not inferred. No original customer payload bundled.
- Validation: parsed JSON and checked field inventory, packaging; SQL and app not executed, no live calls. No production changes. Rollback: use prior v0.1 package as reference only.
- Next: Phase 0 contract validation, actual sanitized closed response, business status/KPI and timezone approval, then scaffold.

## 2026-11-26 — Blueprint v1.1 Migration Ready
- Agent: ChatGPT; branch/commit unavailable (uploaded files).
- Action: reopened v1.0 docs/DDL and legacy Prisma ticket model; mapped all 84 scalar fields; updated 15 prior MD docs, added Legacy-Field-Mapping, Migration-Validation and Agent-Prompts; updated SQL with cold archive, nullable unverified source metadata, origin and migration checkpoints.
- Decision: retain eligible legacy rows in canonical tickets; cold archive maps old ID rather than redundant index on tickets; one archive row per old ID including approved merges, rejects and exclusions; keep full source backup under retention policy. Ongoing sources remain NOSSA only.
- Validation: static scalar coverage checked by script, SQL/Database embedded DDL consistency and ZIP integrity checked during packaging. No SQL execution, runtime tests, source endpoint calls, live schema inspection or production changes.
- Blockers: actual deployed MySQL DDL/data profile, old ticket manual/local fields and KPI eligibility, timezone, closed sample, TTR units, closure rules, actual migration benchmark, authorization/retention.
- Rollback: use v1.0 as historical reference only; no database changes to revert.
- Next: Phase 0, verify actual schema with approved read-only snapshot and sign off mapping; then scaffold.

## 2026-11-26 — Blueprint v1.2 organization and greenfield
- Action: reopened uploaded v1.1 docs/SQL, Prisma master/user models and selected scope/bucket source in app.zip. Local Mac path not accessible here. Added Organization-Scope, Master-Data-Migration, Business-Rules, Legacy-Reference and Query-Standards; revised all active docs, DDL and prompt/phase gates.
- Decisions: singular area/region/branch/service_area/workzone tables; old area→service_area, old service_area→workzone; 17 candidate tables, typed user_scopes exactly-one target with null-safe uniqueness; explicit alias triplet; no ancestor duplication in tickets; seven ticket indexes unchanged; global explicit, inactive excluded ordinary scope, current hierarchy rollups. These are design proposals needing owner review where not specified.
- Validation: static package/DDL consistency checks only; no SQL runtime, production data, Mac checkout, performance/security or migration execution. Verify actual schema, scope policy, mapping and business rules Phase 0A–0D. No source changes on Mac or production.
- Rollback: v1.1 package retained as historical reference, no DB changes to revert. Next: local agent Phase 0A with read-only path, then master/user mapping and scope gates.

## 2026-11-26 — v1.3 adaptive / database access
Owner authorizes MySQL and PostgreSQL read/write. Added seven documents including Database-Access; direct workzone matching preferred, alias candidate only; legacy source remains read-only. Updated prior policy and version references; DDL retained as candidate, not executed. No local Mac, live database or endpoint accessed; no production changes. Static ZIP validation only. Next: register targets and Phase 0A–0D. Rollback: previous v1.2 docs retained.

## 2026-11-26 — Koreksi path target

Lokasi target yang benar adalah `/Users/pakbreng/Projects/dompis-v3`; referensi lokasi sebelumnya telah diperbaiki. Laporan Phase 0A dipindahkan ke `docs/Phase-0A-Discovery.md`. Catatan discovery berikutnya digabungkan ke Handover kanonis agar riwayat lama tetap utuh.

## 2026-11-26 — Phase 0A legacy discovery (parsial)



- Tindakan: membaca blueprint v1.3 dan kebijakan `docs/Database-Access.md` dari workspace blueprint `dompis-v3`; membaca AGENTS/blueprint pada target `/Users/pakbreng/Projects/dompis-v3`, `AGENTS.md` serta dokumentasi audit di repo legacy; memeriksa source schema, scope, workzone join, ingest dan laporan secara read-only.
- File berubah: `docs/Phase-0A-Discovery.md` (dipindahkan dari lokasi keliru); catatan ini ditambahkan ke `docs/Handover.md` yang sudah ada. Source legacy tidak berubah. Tidak ada implementasi aplikasi.
- Database target: tidak ada sesi DB. Konfigurasi legacy yang diperiksa secara tersanitasi menunjukkan MySQL `localhost:3306/dompis_db`; environment, owner, schema allowlist dan role tidak diketahui/terdaftar. PostgreSQL target tidak ditemukan pada policy/config yang tersedia. Tidak ada credential ditampilkan.
- Command yang dilakukan (tersanitasi): `git status --short`; `git rev-parse HEAD`; `git log -1`; `rg --files`; `graphify query ...`; pencarian source dengan `rg`; baca schema/dokumen. Pembacaan metadata `.env` hanya menampilkan engine/host/port/nama database; tidak ada query SQL ke DB.
- Hasil aktual: legacy HEAD `e786d6e49d5a35a3302d81c0d8c640c9da3dff9b`, branch `main`, working tree bersih. Package legacy `dompis_v2` 2.5.14 memakai Next.js 16.4.6, React 19.3.0, Prisma 6.19.3, TypeScript 5.9.3, mysql2 3.17.1 dan beberapa worker Node/PM2. Graphify tersedia; query awal menghasilkan 5.894 node (997 kandidat sebelum pemotongan output). Tidak ada suite test dijalankan pada fase discovery.
- Temuan statis: `prisma/schema.prisma` memakai MySQL dan autoincrement integer; `ticket.incident` unique. `ticket` memiliki waktu tanggal utama berbentuk `String` (`reported_date`, juga banyak kolom tanggal lain), sementara `reported_date_dt` ditambahkan sebagai migrasi paralel. Master legacy: `area.branch_id`, `branch.region_id`, `service_area.area_id`; mapping v1.3 harus mengubah legacy `area→service_area` dan `service_area→workzone`, serta membuat area parent baru. User punya FK region/branch/area langsung serta junction `user_region`, `user_branch`, `user_area`, `user_sa`; efek akses efektif belum bisa dipastikan hanya dari struktur.
- Temuan workzone: query laporan memakai join exact `service_area.nama_sa = ticket.workzone` (contoh `app/api/dashboard/rekap-workorder/queries.ts` dan konsistensi rekap). Endpoint pilihan workzone membatasi `take: 500`, mengambil relasi scope lama, lalu sebagian filter nama di aplikasi. Bukti ini menunjukkan pencocokan nama exact, bukan bukti bahwa kode/nama dinormalisasi atau unik global. Keunikan data aktual belum diuji.
- Temuan sync/technical debt: dokumentasi bridge menyebut `/nossa` dan `/nossa-closed`, pagination offset, cap halaman 1.000 dan offset 5.000, jendela closed terbatas serta retry/rate limit. Source lama mencakup Redis/BullMQ, ingestion `ticket_raw`, projection, worker refresh dan fallback langsung ke MySQL; bertentangan dengan runtime sederhana v1.3 dan tidak akan dipindahkan. Audit lama mencatat query count/list terpisah, string date filtering/sorting, pencocokan workzone berbasis nama, banyak index (schema Prisma memuat puluhan index pada `ticket`), contention write dan payload duplikat. Klaim metrik dokumen lama bukan hasil pengukuran fase ini.
- Business rules yang ditemukan masih kandidat: bucket operasional/classification, KPI eligibility, status lifecycle, SLA/TTR, aturan closed/reopen, date basis Semesta/Rekap/WO HI. Dokumen legacy memuat perubahan TTR yang dapat mengubah KPI; tidak ada yang dipromosikan sebagai aturan baru tanpa fixture/sign-off.
- Pengujian aktual: tidak ada test, build, live endpoint, query database, EXPLAIN, profiling data atau benchmark yang dijalankan.
- Keputusan teknis sementara: tahan DB audit karena target tidak terdaftar dan environment lokal tidak diketahui; jangan menganggap `localhost/dompis_db` sebagai dev. Tetap read-only pada source lama.
- Blocker/risiko: Target MySQL hanya teridentifikasi parsial dan PostgreSQL target belum terdaftar. DDL, relasi aktual, row counts, scope efektif, keunikan workzone dan duplikasi/orphan tidak dapat dikonfirmasi. NOSSA contract belum divalidasi langsung (live calls tidak dilakukan).
- Rollback: tidak ada perubahan source/DB; perubahan dokumentasi dapat dibalik melalui Git.
- Langkah berikutnya: lanjutkan audit di target `dompis-v3`; daftarkan target MySQL dan PG (engine, host, port, DB, environment, schema, owner, role) tanpa credential; kemudian lanjutkan metadata/read-only DB audit dan bukti bisnis yang masih terbuka. Hentikan sebelum write/schema/cutover sesuai gates.

## 2026-11-26 — Koreksi catatan target

Memperbaiki kalimat handover Phase 0A yang masih menyebut target belum tersedia. Target yang benar sejak awal adalah `dompis-v3`; catatan salah tidak lagi dipakai. Verifikasi: file Phase 0A sudah berada di `docs/Phase-0A-Discovery.md`, dan Handover kanonis mempertahankan riwayat sebelumnya. Rollback: koreksi dokumentasi dapat dibalik dari riwayat Git. Langkah berikutnya: lanjutkan Phase 0A setelah target database terdaftar.

## 2026-11-26 — Koreksi seluruh lokasi project

File blueprint `docs/Legacy-Reference.md`, `docs/Getting-Started.md`, dan `docs/Agent-Prompts.md` diperbarui agar memakai target `/Users/pakbreng/Projects/dompis-v3`. `docs/Phase-0A-Discovery.md` dan catatan handover dikoreksi supaya tidak menyatakan target tidak tersedia. Verifikasi aktual: pencarian seluruh workspace tidak menemukan referensi jalur lama atau klaim target belum ada. Tidak ada test/build/query DB; ini koreksi dokumentasi. Rollback: pulihkan file dokumentasi melalui Git. Langkah berikutnya: lanjutkan Phase 0A di `dompis-v3` setelah identitas DB target bisa dipastikan.

## 2026-11-26 — Ignore local env and agent files

- Tindakan: melengkapi `.gitignore` untuk semua `.env` di root/subfolder, instruksi agent lokal (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CODEX.md`), direktori skill `.agents`, `.claude`, `.codex`, `.cursor`, dan markdown instruksi agent yang spesifik.
- File berubah: `.gitignore`, `docs/Handover.md`. File instruksi/env yang sudah ada di index dilepas dari index (`AGENTS.md`, `docs/Agents.md`, `docs/Agent-Prompts.md`, `.env.example`) tanpa menghapus salinan lokal. Dokumentasi produk tetap tracked.
- Verifikasi aktual: `git check-ignore -v` mengonfirmasi `.env`, `.env.local`, `.env.example`, file instruksi dan contoh path skill di empat direktori agent terabaikan. Tidak menjalankan test/build.
- Dampak: commit berikutnya akan menghapus file instruksi tersebut dari repository remote, namun salinan kerja lokal tetap ada. `.env.example` tidak lagi tersedia sebagai template remote.
- Rollback: pulihkan file dari Git bila dibutuhkan; edit atau revert aturan `.gitignore` dan stage ulang file yang memang boleh dipublikasikan.
- Langkah berikutnya: tinjau diff/status Git sebelum commit; jangan upload credential atau local agent instructions.
