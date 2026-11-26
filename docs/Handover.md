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

## 2026-11-26 — Phase 0A local database inventory

- Tindakan: memeriksa nama environment variable database tanpa nilainya dan metadata non-secret Docker lokal; memperbarui temuan Phase 0A.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Database target: tidak ada SQL session. Terlihat container MySQL 8.0 `mysql_baru` dengan volume `dompis_v2_dompis_mysql_data`, tanpa label environment/owner; legacy DSN tersanitasi mengarah ke localhost:3306/dompis_db. Tidak dapat membuktikan environment atau identitas keduanya. Tidak ada PostgreSQL container/konfigurasi PG yang terdeteksi.
- Hasil aktual: `docker ps` menampilkan port MySQL `0.0.0.0:3306`; `docker inspect` menampilkan image, waktu container dan mount di atas. Docker metadata command memerlukan akses di luar sandbox. Tidak ada test, query database, EXPLAIN, perubahan container atau data.
- Keputusan: hentikan audit SQL sampai owner mendaftarkan environment, schema allowlist dan role; jangan anggap volume tersebut sebagai disposable/dev. Catat port binding untuk ditinjau operator infra; agent tidak mengubahnya.
- Risiko: binding 0.0.0.0 dapat membuat port dapat dijangkau dari interface host yang lebih luas; keterjangkauan aktual tidak diuji. Volume mungkin berisi data non-disposable.
- Rollback: tidak ada perubahan database/container; rollback hanya mengembalikan edit dokumentasi melalui Git.
- Langkah berikutnya: pemilik/infra memastikan label environment dan scope DB target, serta menyediakan target PostgreSQL yang benar; lanjutkan metadata read-only audit sesudah identitas terdaftar.

## 2026-11-26 — Phase 0A data-loss and reporting review

- Tindakan: meninjau static backfill `reported_date_dt`, Daily/WO HI route, Semesta route dan Rekap Workorder query; mencatat risiko preservasi dan rule candidates.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Hasil aktual: legacy backfill mengisi kolom typed dari VARCHAR; parse gagal menjadi NULL di kolom baru dan direkam bersama incident/raw time ke JSON, sementara kolom VARCHAR sumber tetap ada. WO HI route memakai offset pagination atas `reported_date`; Daily board memasukkan sync-date, closed-today dan exception `pending_dompis`; report logic memakai SQL/filter terpisah. Source code dibaca saja; backfill/query/test tidak dijalankan.
- Keputusan: preservasi semua raw legacy fields sampai kelayakan, retensi dan field-local rules disetujui. Jangan menyamakan display Max TTR dengan compliance KPI; date basis dan drilldown parity tetap open business decisions.
- Risiko: mengabaikan field local-only atau nilai datetime gagal parse bisa menghilangkan histori/ubah KPI. File failure lama juga berisi incident dan nilai waktu mentah; jangan dibuat/diunggah tanpa kebijakan data.
- Rollback: hanya dokumentasi berubah; pulihkan via Git.
- Langkah berikutnya: lanjutkan source evidence matrix dan tunggu identitas/allowlist target DB untuk schema/data audit aktual.

## 2026-11-26 — Phase 0A Workzone key evidence

- Tindakan: membandingkan legacy Prisma model, route pilihan workzone, dan SQL report join.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Hasil aktual: legacy menyimpan `service_area.nama_sa` nullable dengan index biasa (non-unique); tidak tampak kolom kode di model yang dibaca. Query report membandingkan nama itu exact dengan `ticket.workzone`. Data-level normalization, duplicates, collation dan ambiguity belum diperiksa.
- Keputusan: jangan memakai direct unique code lookup atas dasar blueprint saja; tunggu bukti DB aktual atau approved crosswalk.
- Risiko: nama yang duplikat atau collation case-insensitive dapat salah mengikat ticket ke workzone.
- Rollback: dokumentasi saja, pulihkan via Git.
- Langkah berikutnya: ukur duplicate/normalized-key groups dan parent ambiguity setelah DB target terdaftar; gunakan summary tanpa PII.

## 2026-11-26 — Phase 0A stack and target schema drift

- Tindakan: inventaris versi runtime/dependency pada workspace dan membandingkan schema scaffold dengan blueprint hierarchy.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Hasil aktual: local Bun 1.4.5, Node 24.15.0; manifests pin Svelte 5.57.3, SvelteKit 3.2.0, Vite 8.3.8, Elysia 1.4.32, Drizzle 0.45.4, TypeScript 6.0.3. DB client memakai `Bun.SQL` + `drizzle-orm/bun-sql`; drizzle config punya fallback placeholder PG port 5433. Schema scaffold saat ini hanya punya region, branch, workzone, users, direct user_workzones, dan ticket→workzone, berbeda dengan model lima level di blueprint.
- Dokumentasi kompatibilitas: perintah Context7 `library Bun ...` tidak menghasilkan library ID atau dokumentasi; perintah `--help` berhasil. Tidak ada docs fetch atau runtime compatibility check, sehingga versi hanya tercatat dari manifests.
- Keputusan/risiko: schema hierarchy ini adalah drift yang harus ditangani di design gate sebelum migration; tidak mengubah scaffold dalam Phase 0A. Jangan gunakan fallback placeholder sebagai target DB.
- Pengujian: tidak ada test, typecheck, build, migration atau koneksi database dijalankan dalam tindakan ini.
- Rollback: dokumentasi saja, pulihkan via Git.
- Langkah berikutnya: validasi kompatibilitas versi lewat docs resmi setelah Context7 merespons dan lanjutkan audit MySQL/PG hanya terhadap target terdaftar.

## 2026-11-26 — Phase 0A legacy field-map coverage

- Tindakan: membandingkan scalar field inventory model `ticket` legacy dengan mapping table `docs/Legacy-Field-Mapping.md` menggunakan parser statis read-only.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Command: pembacaan `prisma/schema.prisma`; script inline hanya menghitung nama field dari dua file, tidak mengakses data/database.
- Hasil aktual: 84 scalar field legacy dan 84 mapping rows; missing=0, extra=0, duplicate=0. Relation fields dikecualikan dari scalar count.
- Batas/risiko: kecocokan mencakup hanya schema Prisma source yang tersedia. Tidak memverifikasi actual DDL, field drift, data values, retention approval atau semantic transforms.
- Pengujian: tidak ada test/build/DB query.
- Rollback: dokumentasi saja, pulihkan via Git.
- Langkah berikutnya: cocokkan mapping ke DDL/row profile target MySQL yang terdaftar; audit master/user-scope maps terpisah.

## 2026-11-26 — Phase 0A NOSSA and acceptance review

- Tindakan: membaca Data-Contract, Migration-Validation, Quality-Gates dan Implementation-Plan lalu membandingkan kontrak dokumentasi dengan source legacy bridge.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Hasil aktual: blueprint merujuk OAS/sanitized sample dan menetapkan `/nossa` + `/nossa-closed`, max limit 1.000, offset 5.000, date-filter/window semantics, `meta.count` page count dan tidak ada total ordering saat timestamp tie. Legacy client memakai default cap lokal 20/min; dokumen upstream menyebut 50/min dan merekomendasikan local 20/min. Tidak ada live endpoint call.
- Keputusan/risiko: endpoint name bukan lifecycle; status CLOSED pada `/nossa` dan berbagai timestamp tidak cukup untuk menyimpulkan close/version. Closed fixture, reopen, inclusivity, null/missing, ordering, timezone/TTR, GAMAS behavior masih release/business gates.
- Rencana uji: ikuti synthetic test matrix di `docs/Migration-Validation.md` dan gate di `docs/Quality-Gates.md`; tidak ada test atau migration dijalankan pada discovery ini.
- Database target: tetap tak terverifikasi; tidak ada SQL.
- Rollback: dokumentasi saja, pulihkan via Git.
- Langkah berikutnya: lanjutkan audit source dan tutup target registration/fixture gaps; tidak masuk Phase 0B atau implementasi.

## 2026-11-26 — Phase 0A legacy scope semantics

- Tindakan: meninjau `getWorkzonesForUser`, daily workzone filter, branch scope helper dan role/globalScope paths.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Hasil aktual: helper menggabungkan empat junction scope menjadi nama SA turunan dan cache 1 jam; jalur lain memakai FK langsung user/role, superadmin dan globalScope memiliki perilaku khusus; branch filter bekerja dengan nama workzone. Tidak ada DB row atau authorization test dijalankan.
- Keputusan/risiko: semantics legacy tidak diwariskan otomatis. Perlu compare effective leaf-workzone per user (union/dedup) terhadap role dan direct scopes serta revoke behavior; nama duplikat dapat membuat pembandingan ambigu.
- Rollback: dokumentasi saja, pulihkan via Git.
- Langkah berikutnya: validasi dengan source snapshot terdaftar dan synthetic scope fixtures; tetap di Phase 0A.

## 2026-11-26 — Phase 0A safe DB config inventory

- Tindakan: memeriksa nama variable database pada `.env` legacy tanpa membuka/menampilkan nilainya.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Hasil aktual: ditemukan nama `DATABASE_URL`, `DB_HOST`, `DB_NAME`, `EXTERNAL_DB_HOST`, `EXTERNAL_DB_NAME`; tidak ditemukan `LEGACY_MYSQL_READ_URL` maupun variabel PostgreSQL. Tidak ada SQL connection.
- Keputusan/risiko: jangan memakai app runtime DSN sebagai read-only discovery credential; perlu role/target terdaftar dan validasi environment.
- Pengujian: metadata-only command, no test/build.
- Rollback: dokumentasi saja.
- Langkah berikutnya: sediakan/daftarkan read-only source identity dan PG dev target, tanpa mengirim credential melalui chat.

## 2026-11-26 — Phase 0A documentation review

- Tindakan: pemeriksaan akhir dokumentasi discovery dan handover.
- Hasil aktual: `git diff --check -- docs/Phase-0A-Discovery.md docs/Handover.md` selesai tanpa temuan whitespace. Pencarian memeriksa placeholder/secret-like strings; hanya nama variabel credential dan kebijakan umum yang ditemukan, tidak ada nilai credential.
- Test/build/database: tidak dijalankan.
- File berubah: `docs/Handover.md`.
- Rollback: dokumentasi saja, pulihkan via Git.
- Langkah berikutnya: lanjutkan audit database setelah target terdaftar; 0A belum complete.

## 2026-11-26 — Phase 0A MySQL read-only audit and gate reconciliation

- Tindakan: melanjutkan Phase 0A; memperbarui evidence matrix/checklist berdasarkan identitas MySQL lokal, metadata schema, dan aggregate profiling yang telah berhasil dibaca. Memperjelas status gate: bukti cukup untuk gap register, belum cukup untuk menutup 0A.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Database target: MySQL lokal `dompis_db`, server identity `8944d0a1f47b:3306`, MySQL 8.0.46, role `root@%`; environment/owner belum terklasifikasi. PostgreSQL 18 target tidak ditemukan. Tidak ada credential atau raw row/PII ditulis.
- SQL/command tersanitasi: identity `SELECT DATABASE(), @@hostname, @@port, CURRENT_USER(), VERSION()`; metadata `information_schema` SELECT untuk kolom/index/estimasi; aggregate `COUNT`, orphan/null/duplicate summaries; workzone values dibaca ke proses lokal hanya untuk menghasilkan counts setelah trim+uppercase, nama tidak dicetak. Pembacaan query diberi batas waktu 5 detik; global normalized incident distinct count timeout dengan `ER_QUERY_TIMEOUT`. Semua query read-only; query aggregate dijalankan dalam transaksi read-only. Tidak ada DDL, DML, EXPLAIN, migrasi, atau live NOSSA request.
- Hasil aktual: exact ticket count 1,108,814 (TABLE_ROWS estimate 1,008,964); ticket metadata size data 995,098,624 bytes/index 1,598,767,104 bytes; 36 index entries dan dua unique index-column entries. 84 scalar ticket fields sesuai mapping; actual-vs-Prisma type drift pada enam kolom dicatat di discovery report. Master counts region/branch/area/SA/users/roles = 3/16/131/393/4,098/6. Master parent orphan = 0; normalized duplicate SA-name group = 0. Scope junction count 25/119/404/15,305; `user_sa` mempunyai 187 duplicate pairs, 2 null user_id dan 2 null sa_id. Workzone-name matching setelah trim+uppercase: 391 distinct normalized keys matched, 74 unmatched, 0 ambiguous; row counts matched 1,101,596, unmatched 7,171, blank/null 47. Incident exact/canonical comparison menemukan 28 nilai noncanonical; bounded candidate check menemukan 0 collision untuk kandidat yang diperiksa, tetapi full distinct normalized query timeout dan statusnya belum tervalidasi.
- Keputusan teknis: klasifikasikan target sebagai “local MySQL, environment belum diketahui”; jangan menyebutnya dev/production. Jangan menganggap `service_area.nama_sa` sebagai kode Workzone. Jangan menganggap collision check terbatas sebagai full reconciliation. Tidak ada perubahan schema/data atau aplikasi.
- Pengujian aktual: metadata/aggregate SQL read-only di atas; tidak menjalankan test, typecheck, build, migration, benchmark atau runtime compatibility check. `git diff --check` dijalankan setelah dokumentasi diperbarui.
- Risiko/blocker: role root bukan least-privilege; environment/owner dan status data belum diketahui; DDL/FK/index definitions belum lengkap; PostgreSQL 18 target tidak tersedia; full normalized-incident audit timed out; official NOSSA closed/reopen fixture dan pemilik keputusan KPI/lifecycle/retention belum tersedia. Karena itu Phase 0A belum boleh ditandai selesai.
- Rollback: hanya dua file dokumentasi berubah pada tindakan ini; rollback dengan Git revert/restore kedua file. Tidak ada rollback database karena tidak ada mutasi.
- Langkah berikutnya: minta pemilik mendaftarkan MySQL/snapshot dan PG18 dev target serta menyediakan role least-privilege; sediakan sanitized NOSSA fixtures dan owner decisions. Setelah itu lengkapi metadata DDL/FK/index dan rekonsiliasi incident, perbarui gate; tetap jangan mulai implementasi sebelum gate relevan lulus.

## 2026-11-26 — Phase 0A schema metadata completion

- Tindakan: melakukan identity-guarded, SELECT-only `information_schema` inventory lengkap untuk tabel, kolom, index dan declared FK pada MySQL lokal; memperbarui discovery checklist dan menutup klaim bahwa seluruh metadata FK/index belum tersedia.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Database target: MySQL lokal `dompis_db`, host identity `8944d0a1f47b`, port 3306, MySQL 8.0.46, role `root@%`; environment/owner masih belum diklasifikasikan. Tidak ada credential dicetak.
- Command/SQL tersanitasi: identity SELECT `DATABASE()/@@hostname/@@port/CURRENT_USER()/VERSION()`, lalu `information_schema.TABLES`, `COLUMNS`, `STATISTICS`, dan `KEY_COLUMN_USAGE` SELECT. Target guard membatasi protokol MySQL, localhost/127.0.0.1, port 3306, nama DB `dompis_db`; identity divalidasi sebelum metadata query.
- Hasil aktual: 53 tabel, 700 kolom, 402 index column entries, 29 declared FK column relationships. 36 index names pada ticket dan 2 unique indexes. FK yang relevan: branch→region, area→branch, service_area→area, user direct region/branch/area/role dan user scope junction→user/parent. Tidak ada declared FK pada `ticket` itu sendiri. Schema juga punya legacy technician/cluster/assignment, raw/projection, snapshot/outbox tables. Tidak ada record bisnis yang dibaca, tidak ada row terdampak.
- Batas/risiko: `information_schema` inventory belum disimpan sebagai DDL lengkap; check constraints, generated expressions, referential actions, definisi penuh generated columns dan seluruh `SHOW CREATE TABLE` belum diperiksa. Nama tabel legacy teknisi tidak mengubah scope produk dan tidak mengotorisasi implementasi assignment teknisi.
- Pengujian aktual: dua query metadata read-only berhasil; command pertama sandbox menghasilkan `EPERM`, rerun di luar sandbox dengan izin query SELECT-only berhasil. `git diff --check -- docs/Phase-0A-Discovery.md docs/Handover.md` lulus setelah update. Tidak ada test/typecheck/build/migration atau write.
- Keputusan: metadata audit checklist ditandai selesai dengan batasan di atas; exit gate Phase 0A tetap tertahan oleh klasifikasi target/owner, normalized incident full scan timeout, ketiadaan PostgreSQL 18, sanitized NOSSA closed/reopen fixture, dan keputusan bisnis.
- Rollback: hanya dokumentasi berubah; rollback dengan memulihkan dua file tersebut. Database tidak berubah sehingga tidak ada rollback database.
- Langkah berikutnya: minta target/environment/owner terdaftar dan bukti/keputusan owner yang tertulis di discovery report. Sesudah itu lakukan rekonsiliasi incident, validasi contract fixture, dan tutup Phase 0A sebelum fase implementasi.

## 2026-11-26 — Phase 0A incident reconciliation and closeout

- Tindakan: melanjutkan profiling normalized incident menggunakan keyset pagination; memeriksa ketersediaan PostgreSQL lokal; menyelesaikan source evidence map dengan path/line; meninjau ulang exit criteria Phase 0A terhadap `Discovery-Protocol.md`, `Implementation-Plan.md`, dan `Quality-Gates.md`; menutup Phase 0A dengan keterbatasan dan blockers fase berikutnya tercatat.
- File berubah: `docs/Phase-0A-Discovery.md`, `docs/Handover.md`.
- Database target: MySQL lokal `dompis_db`, host identity `8944d0a1f47b`, port 3306, MySQL 8.0.46, role `root@%`; environment/owner tetap unknown. PostgreSQL localhost ports 5432 dan 5433 tidak merespons; tidak ada remote PG target dikonfigurasi.
- SQL/command tersanitasi: identity SELECT guard; read-only query keyset `SELECT id_ticket, incident FROM ticket WHERE id_ticket > ? ORDER BY id_ticket LIMIT 10000`, cursor increment, session statement cap 10s. Hanya trim+uppercase/hash digest diproses di memory; raw incident/ID tidak dicetak/disimpan. `pg_isready -h 127.0.0.1 -p 5432/5433 -t 2` untuk discovery availability. `rg -n` source path/line di checkout legacy yang tetap read-only.
- Hasil aktual: keyset scan membaca semua **1,108,814** rows dalam **111** batch, **12,608 ms**; 28 noncanonical incident, 0 blank/null, 0 normalized duplicate, 0 non-ASCII incident. Tidak ada record ditulis/diubah. PostgreSQL local probe: `no response` di kedua port. Source map mencantumkan schema, scope, ticket/daily, Semesta, Rekap, NOSSA bridge/window planner, classification dan TTR evidence paths.
- Kendala query: percobaan awal dengan prepared placeholder untuk `LIMIT` mendapat `ER_WRONG_ARGUMENTS` sebelum menghasilkan scan; scan diulang dengan limit literal konstan 10,000 dan parameterized keyset cursor, selesai dengan hasil di atas. Tidak ada row impact pada percobaan gagal.
- Keputusan: Phase 0A ditandai **complete** karena deliverable audit read-only, source/DDL/data evidence paths dan limitations terpenuhi. NOSSA closed/reopen fixture, owner KPI/scope/retention decisions dan PG dev target adalah blockers fase 0B/0C/0D, tidak menghalangi penutupan audit 0A. Tidak mulai fase lanjutan atau implementasi.
- Pengujian aktual: `git diff --check -- docs/Phase-0A-Discovery.md docs/Handover.md` dijalankan setelah update dan lulus. Tidak menjalankan product tests/typecheck/build/migration karena scope hanya discovery.
- Risiko: MySQL target environment/owner belum diklasifikasikan dan akses terbaca dengan role `root@%`; PostgreSQL tidak tersedia; hash digest collision secara matematis mungkin meski probabilitas sangat kecil; normalisasi ini menguji trim+Unicode uppercase atas identifiers ASCII, bukan collation behavior pada string non-ASCII.
- Rollback: dokumentasi saja berubah; pulihkan dua file melalui Git. Tidak ada rollback database karena query read-only.
- Langkah berikutnya: mulai Phase 0B hanya jika diminta/diizinkan sesuai workflow; sediakan PG18 dev, registered MySQL snapshot/read role, fixtures dan keputusan bisnis sebelum kerja yang bergantung padanya. Jaga assignment teknisi di luar scope.

## 2026-11-26 — Phase 0B business rules discovery

- Tindakan: mengikuti arahan user untuk melanjutkan fase; mengekstrak perilaku kandidat Ticket Management, Semesta, Rekap Workorder dan Detail WO HI, classification, lifecycle/status, SLA/TTR/KPI, recurring/GAUL, filter/scope dan export; membandingkan config, SQL/generated-column migration, Rekap JS, service analytics, PRD dan docs lama.
- File berubah: `docs/Phase-0B-Discovery.md`, `docs/Business-Rules.md`, `docs/Handover.md`.
- Database target: tidak ada akses database pada fase ini. Legacy checkout `/Users/pakbreng/Projects/dompis_v2` dibaca saja. Tidak ada payload/PII/credential dicetak atau disalin.
- Hasil aktual: 10 konflik/fact gaps dicatat. Bukti utama: bucket catalogue berbeda dari SQL/generated-column migration dan Rekap JS classifier/precedence; SLA matrix menulis Indibiz 4 jam dan Reseller 6 jam sedangkan `jenis-tiket.ts` memberi 24 jam untuk keduanya; close-status set bercampur dengan resolve/close semantics; display Max TTR berbeda dari compliance; Semesta V1/V2 berbeda date defaults; GAUL query memakai service_no, workzone dan sekitar 60 hari; menu daily/report builders mempunyai date/membership filters berbeda; SQM/pending memakai field local-only; scope ada direct grants, junction dan role exceptions. Semua dicatat sebagai perilaku legacy/candidate, bukan keputusan final.
- Keputusan: gate deliverable Phase 0B terpenuhi karena candidate rule inventory, evidence, konflik dan fixture plan tertulis dengan unknown eksplisit. Tidak ada rule yang diubah menjadi approved; tidak ada implementasi, assignment teknisi, test atau data mutation.
- Pengujian aktual: tidak menjalankan test/build/typecheck karena pekerjaan hanya source/document discovery. Validasi dokumen dengan `git diff --check` dijalankan setelah perubahan.
- Risiko/blocker: klasifikasi/bucket precedence, close/reopen taxonomy, KPI denominators, SLA hours, date basis/timezone, GAUL lookback, retention field lokal, effective-scope parity dan owner approvals masih unresolved. Implementasi/report publication yang bergantung pada keputusan tersebut tetap tertahan.
- Rollback: dokumentasi saja berubah; rollback lewat Git pada tiga dokumen. Legacy repository dan database tidak berubah.
- Langkah berikutnya: lanjutkan Phase 0C contract/access evidence dan verifikasi fixture availability dari artefak lokal; tanpa closed/reopen fixture atau keputusan owner, tandai bagian yang tidak bisa divalidasi dan jangan membuat asumsi implementasi.

## 2026-11-26 — Phase 0C contract/access discovery

- Tindakan: meninjau Data-Contract, Field-Mapping, Legacy-Field-Mapping, Master-Data-Migration, Organization-Scope, Migration-Validation, Quality-Gates serta source auth/scope legacy; mencari artefak OAS/fixtures; mengukur legacy junction-derived leaf access secara agregat.
- File berubah: `docs/Phase-0C-Contract-Access-Discovery.md`, `docs/Handover.md`.
- Database target: MySQL lokal `dompis_db`, host identity `8944d0a1f47b:3306`, MySQL 8.0.46, role `root@%`, environment belum diketahui. Tidak ada akses DB lain atau live API call.
- SQL/command tersanitasi: identity-guarded aggregate `UNION ALL` atas `user_sa`, `user_area`, `user_branch`, `user_region` dengan ancestor expansion lalu `DISTINCT(user_id,sa_id)`; separate `LEFT JOIN` aggregates untuk orphan/null user/parent; seluruh output counts saja. Artifact search memakai `rg --files` pada project baru dan legacy. Tidak ada user IDs/names/raw API/customer values dikeluarkan.
- Hasil aktual: 22,392 expanded junction user-leaf pairs; 17,969 distinct pairs; 4,423 overlap expansion rows; 3,835 users memiliki junction-derived leaf grant; total users 4,098 (263 tidak muncul di junction union, direct FK/role/no-scope belum dibedakan). Junction orphan user/parent = 0 untuk keempat tabel. `user_sa` mempunyai 2 null user_id dan 2 null sa_id (overlap row tidak diketahui); tabel junction lain tidak memiliki null user/parent. Legacy helper memakai union + dedup atas nama SA; normalized duplicate SA name group pada audit 0A adalah nol.
- Contract evidence: hanya summary OAS 3.0 + supplied open sample tercatat di `Data-Contract.md`; repo search tidak menemukan versioned OpenAPI/OAS atau sanitized closed/reopen fixture. Tidak ada `/nossa-closed` response yang bisa diperiksa. Tidak ada live API call, sesuai batas akses/budget.
- Percobaan yang ditolak: satu direct-vs-junction aggregate menghasilkan `junction_users=4280`, tidak konsisten dengan verified `junction_distinct_users=3835`; seluruh hasil direct comparison tersebut dibuang dan tidak dicatat sebagai fakta. Perbaikan query menghadapi SQL construction errors (`ER_BAD_FIELD_ERROR`, identifier quoting / kolom `users.id_user`); tidak ada rows yang diubah. Query junction-only yang diperbaiki kembali menghasilkan 3,835 user dan 17,969 distinct pairs; query orphan menghasilkan nol orphan. Perbandingan set direct-vs-junction masih unverified.
- Keputusan: Phase 0C static evidence diekstrak, tetapi gate tertahan oleh closed/reopen fixture, lifecycle/TTR owner decisions, workzone/master crosswalk, role/effective scope sign-off, field retention/PII policy, dan registered MySQL snapshot/PG18 dev. Tidak membuat mapping atau approval palsu. Phase 0D dan implementasi yang bergantung pada hal tersebut belum dimulai.
- Pengujian aktual: `git diff --check` dijalankan setelah dokumentasi diperbarui; tidak ada product tests, build, typecheck, live endpoint atau migration.
- Risiko/blocker: role root/environment unknown; crosswalk belum disahkan; 263 user tanpa junction grant mungkin memakai direct FK/role path; business permission parity belum dihitung lengkap; PII/local field disposition belum disetujui; PostgreSQL tidak tersedia.
- Rollback: dokumentasi saja; pulihkan discovery report dan handover via Git. Tidak ada rollback DB/API karena tidak ada mutasi/call.
- Langkah berikutnya: dapatkan artefak dan keputusan C0C-01–06 pada report. Sesudah itu jalankan validation tests dengan synthetic fixtures dan registered disposable PG; jangan implement lifecycle, KPI, grant migration atau crosswalk sebelum gate terkait lulus.

## 2026-11-26 — Phase 0D design readiness review

- Tindakan: membandingkan candidate PostgreSQL/Drizzle design (`docs/Database.md`, `Architecture.md`, `Query-Standards.md`, `Migration.md`, `Organization-Scope.md`) dengan actual scaffold `packages/db/src/schema.ts` dan evidence Phase 0A–0C; mencatat candidate corrections and test prerequisites.
- File berubah: `docs/Phase-0D-Design-Readiness.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses untuk review ini; hanya dokumentasi/scaffold dibaca. Tidak ada DDL, migration, seed, API change atau code modification.
- Hasil aktual: scaffold memakai UUIDv7 SQL default, Bun SQL/Drizzle, canonical `tickets`, tetapi master hanya region→branch→workzone; user grants hanya direct workzone; role check terbatas; candidate blueprint membutuhkan lima tingkat dan hierarchical scopes. DDL checks/indexes/archive/lifecycle fields belum dapat dibekukan karena rule/crosswalk/retention unresolved. Catatan cascade behavior `user_scopes`, incident canonicalization dan conditional alias/index decisions ditambahkan sebagai review candidates, bukan perubahan design.
- Pengujian aktual: `git diff --check -- docs/Phase-0A-Discovery.md docs/Phase-0B-Discovery.md docs/Phase-0C-Contract-Access-Discovery.md docs/Phase-0D-Design-Readiness.md docs/Business-Rules.md docs/Handover.md` lulus setelah semua update; tidak ada test/typecheck/build/Drizzle generation/migration/restore/EXPLAIN karena tidak ada registered disposable PG18 target.
- Keputusan: Phase 0D static readiness review selesai, tetapi final design gate tidak lulus. Tidak mulai Phase 1 atau implementasi. Prasyarat masih meliputi C0C-01–06, PostgreSQL 18 dev terdaftar, compatibility/migration test dan owner review candidate DDL.
- Risiko: mengunci current scaffold akan mempertahankan hierarchy/scope yang berbeda dari requirement; menerapkan generated classifier/NOT NULL assumptions bisa mengubah KPI/historis; full archive payload berisiko menyimpan PII tanpa policy; cascade/index candidates belum dievaluasi pada target.
- Rollback: dokumentasi saja berubah; pulihkan Phase 0D readiness dan Handover via Git. Tidak ada database rollback.
- Langkah berikutnya: selesaikan keputusan kontrak/access/retention dan sediakan registered PG18 disposable target; setelah itu finalisasi ADR/DDL dan jalankan test+restore hanya pada target disposable sebelum implementasi phase berikutnya.

## 2026-11-26 — Phase 0D local PostgreSQL migration compatibility probe

- Tindakan: memverifikasi target PostgreSQL baru sebelum write; menerapkan migration Drizzle candidate dalam satu transaksi; memverifikasi objek PostgreSQL 18/UUIDv7; menjalankan generator Drizzle untuk memastikan schema dan migration tidak drift; memperbarui status Phase 0C/0D dengan bukti target baru.
- File berubah: `docs/Phase-0C-Contract-Access-Discovery.md`, `docs/Phase-0D-Design-Readiness.md`, `docs/Handover.md`. `bun run db:generate` tidak membuat/mengubah migration. Tidak ada application code yang berubah.
- Database target: PostgreSQL 18.7 lokal via Unix socket `/tmp`, port 5432, database `dompis_v3_dev`, owner/current role `pakbreng`; database dibuat baru untuk disposable development dan diverifikasi memiliki 0 public tables sebelum migration. Role memiliki superuser capability pada cluster lokal; role ini hanya untuk administrative validation, bukan runtime.
- SQL/command tersanitasi: identity check `SELECT current_database(), current_user, version()` dan hitung tabel kosong; `psql -X -d dompis_v3_dev -v ON_ERROR_STOP=1 --single-transaction -f packages/db/drizzle/0000_vengeful_redwing.sql`; aggregate metadata checks atas public base tables/FK/indexes dan `SELECT uuidv7() IS NOT NULL`; `bun run db:generate`. Tidak ada credential, payload, PII, atau raw business data digunakan.
- Hasil aktual: migration sukses dan transaction commit; 14 public base tables, 12 foreign keys, 40 indexes; native `uuidv7()` tersedia; query validasi atas tabel ticket yang kosong menghasilkan 0 invalid incident rows; Drizzle Kit melaporkan “No schema changes, nothing to migrate”. Tidak ada business row terdampak.
- Pengujian aktual: `git diff --check` lulus setelah dokumentasi diperbarui; migration application dan pemeriksaan metadata di atas lulus. Tidak menjalankan product test, typecheck, build, Bun SQL runtime probe, restore atau EXPLAIN.
- Keputusan teknis: target PostgreSQL dev tersedia; migration probe membuktikan sintaks candidate pada PG18.7 dan synchronization terhadap current Drizzle schema. Bukan validasi business semantics, production plan, legacy migration, restore, runtime Bun SQL, atau idempotency reapplication. Candidate schema tidak menjadi approved/final DDL. C0C-06 hanya terpenuhi untuk PG target.
- Risiko/blocker: candidate hierarchy/scope masih berbeda dari blueprint; business rules/KPI/lifecycle/closed contract, crosswalk, permission parity, PII/archive allowlist dan MySQL environment/snapshot belum disetujui/terdaftar. Target memakai local superuser untuk setup; aplikasi runtime harus memakai least-privilege role tersendiri. Restore test belum ada.
- Rollback: seluruh DDL dijalankan transactionally pada database disposable yang awalnya kosong; jika perlu reset, drop/recreate hanya database `dompis_v3_dev` setelah memastikan kembali identity target. Tidak ada perubahan pada database legacy/production. Dokumentasi dapat direvert melalui Git tanpa mengubah database.
- Langkah berikutnya: kumpulkan sanitized closed/reopen fixture dan keputusan owner untuk C0C-01–06; klasifikasikan/daftarkan MySQL snapshot/read-only target; setelah kontrak disahkan, revisi candidate hierarchy/scope/schema, buat migration review, jalankan synthetic golden, restore dan query-plan validation di target disposable. Jangan lanjutkan finalisasi DDL atau product implementation yang bergantung pada unresolved business rules.

## 2026-11-26 — Phase 1 foundation checks and CI workflow

- Tindakan: meninjau acceptance Phase 1; menambahkan CI workflow minimum untuk install frozen, typecheck, build, dan Drizzle generation; menjalankan seluruh perintah tersebut lokal; smoke-check API liveness/readiness; memperbarui status Phase 0D dan membuat ringkasan gate Phase 1.
- File berubah: `.github/workflows/ci.yml`, `docs/Phase-0D-Design-Readiness.md`, `docs/Phase-1-Foundation.md`, `docs/Handover.md`. Tidak ada application runtime code atau dependency/lockfile berubah.
- Database target: smoke endpoint tanpa konfigurasi database; migration tetap berada pada `dompis_v3_dev` PostgreSQL 18.7 lokal disposable, schema-only.
- Command tersanitasi: YAML syntax parse dengan Ruby stdlib; `bun install --frozen-lockfile`; `bun run typecheck`; `bun run build`; `bun run db:generate`; start API di loopback port 39871; GET `/health/live` dan `/health/ready`. API pertama gagal bind di sandbox (EADDRINUSE); restart di luar sandbox berhasil. Satu readiness request awal dilakukan setelah server dihentikan dan gagal konek; diulang saat server aktif. Tidak ada credential/PII.
- Hasil aktual: YAML parse lulus; frozen install lulus, 101 installs/201 packages checked, no changes; typecheck lulus (Svelte 0 error/0 warning, API/worker tsc pass); build lulus (Svelte static output dan API bundle); Drizzle generation melaporkan no schema changes; `/health/live` mengembalikan HTTP 200 `alive`; `/health/ready` tanpa `DATABASE_URL` mengembalikan HTTP 503 `database_not_configured`. No remote GitHub Actions run was observed.
- Pemeriksaan perubahan: `git diff --check` lulus setelah pembaruan workflow dan dokumen.
- Keputusan teknis: foundation scaffold dinilai berjalan untuk development; CI minimum ditambahkan. Phase 1 tetap **open**, bukan complete: Bun SQL→PG runtime belum diuji, restore/rollback rehearsal belum ada, runtime least-privilege role belum dibuat, migration schema masih candidate dan belum mengikuti hierarchy lima tingkat. Worker synchronization tetap deferred ke Phase 3B.
- Risiko/blocker: CI Action versions dipin pada major/tag yang tersedia (`checkout@v4`, `setup-bun@v2.2.0`) tetapi remote execution belum mengonfirmasi runner compatibility; tidak ada test suite otomatis yang ada di repo; PG local role adalah superuser dan tidak boleh dipakai aplikasi; owner-dependent scope/RBAC/lifecycle/KPI/archive policy tetap unresolved.
- Rollback: workflow dapat dihapus/revert via Git jika tidak diinginkan; tidak ada lockfile/dependency/data change. Health API dihentikan setelah smoke check. Database candidate tetap disposable; schema hanya dapat dihapus melalui target-guarded reset bila diperlukan.
- Langkah berikutnya: validasi workflow pada GitHub Actions; uji Bun SQL ke `dompis_v3_dev` memakai role non-superuser; lakukan schema-only restore/rollback rehearsal pada disposable target; setelah foundation gate direview, lanjut desain Phase 2 auth/organization sambil mempertahankan owner approval gate pada privilege dan scope semantics.

## 2026-11-26 — Local PostgreSQL database for pgAdmin

- Tindakan: membuat role login PostgreSQL `root` dengan password melalui hidden prompt psql; role diberi `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`; membuat database baru `dompis_v3` owned by `root`; mengaplikasikan candidate migration secara transactional; menyimpan koneksi lokal pada `.env` mode 0600; menjalankan API readiness smoke check.
- File berubah: `.env` (ignored local secret configuration; not tracked), `docs/Phase-1-Foundation.md`, `docs/Handover.md`. Tidak ada file credential/secret diubah atau dibuat di repository tracked; password tidak dicantumkan pada catatan ini.
- Database target: PostgreSQL 18.7 lokal Homebrew, TCP `127.0.0.1:5432`, DB `dompis_v3`, owner/current role `root`. Sebelum write, role dan database tidak ada. `dompis_v3_dev` tetap tidak berubah. User clarified intended client is pgAdmin; cluster registration in pgAdmin was not inspected, sehingga harus menunjuk host/port yang sama agar DB tampak di sana.
- Command/SQL tersanitasi: identity and existence SELECT di `postgres`; `CREATE ROLE` least-privilege; hidden `\password` prompt; `ALTER ROLE ... LOGIN`; `createdb --owner=root --template=template0 --encoding=UTF8 dompis_v3`; `psql ... --single-transaction -f packages/db/drizzle/0000_vengeful_redwing.sql`; aggregate identity/table/UUIDv7/role-flag verification; `git check-ignore -q .env`; API GET `/health/ready`. No password value, customer data, or credential printed.
- Hasil aktual: authenticated query identified `dompis_v3`, `root`, PostgreSQL 18.7; role `rolsuper=false`; 14 public tables; `uuidv7()` available; API response HTTP 200 `{"status":"ready"}` using `.env`; `.env` mode 0600 and Git ignored. No business rows imported.
- Pemeriksaan perubahan: `git diff --check` lulus; `git status --short --untracked-files=all` tidak menampilkan `.env`.
- Keputusan teknis: root database owner is kept non-superuser and cannot create databases/roles. Existing candidate schema installed because user requested a ready project database; it remains candidate and known hierarchy/scope/business-rule gaps remain documented. This is local development, not production.
- Risiko/blocker: pgAdmin saved server host/port identity is not independently verified; refresh its Databases tree if it is registered to `127.0.0.1:5432`, otherwise the DB may be on a different cluster. Candidate DDL is not final; no legacy data, user, seed, or production record was imported. `.env` carries a local password and must remain ignored/private.
- Rollback: `.env` can be removed locally; database reset/drop is only safe after re-verifying the target is this newly created `dompis_v3` database. No legacy/production cluster was modified. DDL had a transactional apply; if it had failed, PostgreSQL would roll back that migration transaction.
- Langkah berikutnya: in pgAdmin connect/refresh the server registered as host `127.0.0.1`, port `5432`, then expand Databases and confirm `dompis_v3`. If that server is different, collect only its host/port/maintenance DB (never password) before any further database action. Continue Phase 1 restore/CI and Phase 2 reviewed organization/auth design; preserve unresolved business approvals.

## 2026-11-26 — Remove disposable database and inspect pgAdmin registration

- Tindakan: memverifikasi database disposable sebelum penghapusan; memastikan tidak ada sesi/data aplikasi; menghapus `dompis_v3_dev` sesuai instruksi user; mencari penyebab database tidak terlihat di pgAdmin tanpa membaca secret tersimpan.
- File berubah: `docs/Phase-1-Foundation.md`, `docs/Handover.md`. Database lokal `dompis_v3_dev` dihapus. `.env`/`dompis_v3` tidak diubah.
- Database target: cluster lokal PostgreSQL 18.7 Homebrew; sebelum drop, target `dompis_v3_dev` owner `pakbreng`, active sessions 0; exact row count across public tables: hanya `sync_revision=1`, ticket/business tables empty. `dompis_v3` owner `root` tetap ada.
- Command tersanitasi: identity/database metadata SELECT; per-table exact aggregate row count on `dompis_v3_dev`; active connection count; `dropdb --if-exists dompis_v3_dev`. Untuk pgAdmin, read-only SQLite inspection mengambil hanya registration id, loopback classification, port, maintenance DB dan apakah username `root`; tidak memilih/mengeluarkan password. Docker container list dan process names diperiksa.
- Hasil aktual: `dompis_v3_dev` berhasil dihapus; tidak ada sesi aktif maupun data aplikasi. `dompis_v3` tetap berada di `127.0.0.1:5432`. pgAdmin 4 desktop berjalan; local config DB ditemukan dengan `server_count=0`; tidak ada container pgAdmin. Docker hanya melaporkan phpMyAdmin/MySQL/Redis. Karena tidak ada server registration di profile tersebut, pgAdmin belum terhubung ke PostgreSQL lokal.
- Pemeriksaan akhir: `git diff --check` lulus; daftar database terakhir menunjukkan hanya `dompis_v3` dari kedua nama target, owner `root`.
- Keputusan teknis: tidak mengedit config database internal pgAdmin secara langsung dan tidak mendaftarkan remote target yang belum diketahui. User perlu register server lokal `127.0.0.1:5432` melalui pgAdmin UI atau memberikan host/port yang benar jika server registration yang dipakai berada di cluster lain. Password tidak diminta ulang atau ditampilkan.
- Risiko/blocker: `dompis_v3_dev` penghapusan tidak dapat di-undo langsung, namun database itu disposable, schema-only dan tidak memuat business data; dapat dibuat ulang dari migration jika dibutuhkan. `dompis_v3` adalah target proyek lokal yang terverifikasi; pgAdmin UI tidak mempunyai registration tersimpan pada profile yang ditemukan.
- Kendala UI: `agent-browser` skill CLI tidak terpasang (`command not found`), sehingga saya tidak mengotomasi pendaftaran server di UI pgAdmin dan tidak mengedit SQLite config internalnya.
- Rollback: recreate `dompis_v3_dev` hanya bila dibutuhkan, setelah target identity guard, lalu apply migration candidate; tidak ada perubahan/rollback pada `dompis_v3`, MySQL legacy, atau production.
- Langkah berikutnya: register PostgreSQL lokal pada pgAdmin dengan host `127.0.0.1`, port `5432`, maintenance DB `postgres`, username `root`, lalu refresh Databases untuk melihat `dompis_v3`. Continue phase work only on verified local target; resolve remaining owner-dependent lifecycle/KPI/scope/archive decisions before affected implementations.

## 2026-11-26 — pgAdmin UI automation attempt

- Tindakan: menjalankan workflow `agent-browser` setelah user menyatakan skill telah dipasang; membaca core/Electron instructions; mencoba CLI global (gagal `EACCES` pada `/usr/local`), lalu menjalankan CLI via `npx` tanpa menambah dependency project; membuat session terisolasi; mengidentifikasi loopback port pgAdmin dari listener lokal dan membuka UI.
- File berubah: `docs/Handover.md` saja. Tidak ada project code, credential, pgAdmin registration, atau server config diubah.
- Target: pgAdmin 4 desktop lokal pada loopback port `57876` (UI only); PostgreSQL `dompis_v3` tidak dimutasi dalam langkah ini.
- Hasil aktual: `agent-browser 0.45.0` via npx tersedia; session terisolasi dibuat. UI root mengembalikan HTTP 401 Unauthorized dan snapshot hanya menampilkan heading “Unauthorized”. Read-only SQLite profile yang diperiksa sebelumnya berisi 0 server registrations. Browser session ditutup. Tidak ada login/password/master key ditebak atau dimasukkan.
- Keputusan: berhenti di batas autentikasi pgAdmin; jangan mengedit SQLite internal atau mencoba bypass autentikasi. UI automation untuk register server memerlukan pgAdmin user session yang telah login. PostgreSQL/DOMPIS DB tetap tersedia dan API readiness sebelumnya terverifikasi.
- Risiko/blocker: database belum tampak di pgAdmin karena profile lokal tidak memiliki registration dan automation tanpa sesi resmi mendapat 401. User perlu mendaftarkan server melalui UI pgAdmin yang sudah terautentikasi.
- Rollback: browser session ditutup; tidak ada perubahan untuk dibatalkan.
- Langkah berikutnya: di pgAdmin pilih **Servers → Register → Server**, host `127.0.0.1`, port `5432`, maintenance DB `postgres`, username `root`, masukkan password secara lokal, simpan, lalu refresh Databases dan buka `dompis_v3`. Jangan memasukkan password ke chat, terminal command line, atau repository.

## 2026-11-26 — Phase 2 organization/auth schema foundation

- Tindakan: memverifikasi ulang target dan isi `dompis_v3`; membetulkan migration management agar menggunakan Bun SQL + Drizzle migrator; mencatat baseline `0000` yang sebelumnya diterapkan langsung melalui psql menggunakan SHA-256 file dan timestamp journal yang cocok; mengubah Drizzle schema ke lima level hierarchy, RBAC catalog, dan typed `user_scopes`; menghasilkan dan menerapkan migration `0001`; menjalankan constraint/repeat-run checks; memperbarui README, ADR dan laporan Phase 2.
- File berubah: `package.json`, `packages/db/src/migrate.ts`, `packages/db/src/schema.ts`, `packages/db/drizzle/0001_wild_shadow_king.sql`, `packages/db/drizzle/meta/0001_snapshot.json`, `packages/db/drizzle/meta/_journal.json`, `docs/Decision-Log.md`, `docs/Phase-1-Foundation.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Getting-Started.md`, `README.md`, `docs/Handover.md`. Dependency/lockfile tidak berubah.
- Database target: PostgreSQL 18.7 lokal `dompis_v3`, TCP `127.0.0.1:5432`, owner `root` (`rolsuper=false`). Sebelum perubahan, hanya satu internal row `sync_revision`; tickets/users/scopes/masters kosong. Target identity diverifikasi sebelum write. Database `dompis_v3_dev` tetap terhapus sesuai permintaan.
- Command/SQL tersanitasi: baca-only identity/counts; baseline Drizzle `0000` hash dihitung dari file repository dan timestamp dari journal, kemudian row ledger dimasukkan dalam transaksi; `bun run db:generate`; `bun run typecheck`; `bun run db:migrate` dua kali; `bun run build`; PostgreSQL catalog queries; synthetic `BEGIN; DO ...; ROLLBACK` untuk hierarki, duplicate grant, no-target, multi-target, invalid-FK. Credential tidak ditulis ke command, output atau dokumen.
- Hasil aktual: baseline row kemudian migration `0001` diterapkan dan dicatat; rerun migration sukses tanpa menambah ledger row. Schema kini 19 public tables, 21 FKs, 2 Drizzle migration ledger rows; `user_scopes` unique index terverifikasi `indnullsnotdistinct=true`, exactly-one-target check tersedia. User/ticket/scope/role row count akhir 0; `sync_revision=1`. Synthetic valid hierarchy insert dan empat rejection checks lulus, transaction rolled back. `bun run typecheck`, build, generation dan `git diff --check` lulus.
- Kendala: `drizzle-kit migrate` tidak dapat dipakai karena CLI membutuhkan driver `pg`, `postgres`, Neon atau Vercel yang tidak terpasang. Tidak ada dependency baru; migration runner memakai existing Bun SQL driver. Drizzle generate pertama gagal karena rename prompts memerlukan TTY; dijalankan ulang interaktif dan semua kolom/tabel baru dipilih sebagai create karena maknanya berbeda, bukan rename. Tidak ada perubahan database dari percobaan gagal.
- Keputusan teknis: menambah role/permission catalog generik tetapi tidak seed role/action; mengganti scope direct grant dengan lima nullable FK plus exactly-one check dan `NULLS NOT DISTINCT`; tidak membuat alias Workzone; table count candidate sekarang 19. ADR-007 mencatat alasan. Schema/roles belum production approved.
- Risiko/blocker: migration `0001` menjatuhkan scaffolding kosong `user_workzones`, `users.role`, serta `workzones.branch_id/service_area`; aman hanya karena seluruh tabel bisnis kosong. Tidak ada down migration otomatis. Jangan aplikasikan file ini langsung pada target berisi data. API RBAC/session/scope resolver/admin UI belum dibuat; role mapping legacy, master crosswalk, closed ticket contract, KPI/lifecycle/archive policy tetap open.
- Rollback: baseline dan migration ledger menyatakan schema lokal current. Untuk membatalkan pada database lokal yang masih kosong, setelah identity guard gunakan prosedur recreate database yang ditinjau; jangan drop/reset bila sudah ada data pengguna. Tidak ada perubahan MySQL/production.
- Langkah berikutnya: implementasikan shared deny-by-default permission guard dan hierarchy scope resolver; uji union/dedup/filter intersection, global explicit, disabled ancestry, revoke/reparent. Lanjutkan session/login/logout dan admin API/UI setelah capability matrix jelas. Tetap tahan ETL, role mapping dan aliases sampai crosswalk/owner decisions tersedia.

## 2026-11-26 — Phase 2 shared authorization resolver

- Tindakan: menambahkan resolver context authorization dari hash token session valid dan reusable SQL predicate akses ticket berdasarkan permission, explicit global scope atau union grant hierarkis; dokumentasi Phase 2 diperbarui.
- File berubah: `packages/db/src/authorization.ts`, `packages/db/src/authorization.test.ts`, `packages/db/src/index.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Handover.md`.
- Database target: PostgreSQL 18.7 lokal `dompis_v3`, role `root`; query verifikasi read-only. Test memakai transaksi fixture sintetis dan rollback eksplisit.
- Command tersanitasi: `bun --env-file=.env test packages/db/src/authorization.test.ts`; `bun run typecheck`; `bun run build`; `git diff --check`; aggregate counts atas tickets/users/roles/user_scopes/sessions/sync_revision.
- Hasil aktual: integration test 1 pass, 9 expectations; typecheck lulus; build web/API lulus; diff check lulus; semua fixture rollback, counts tickets/users/roles/user_scopes/sessions tetap 0 dan `sync_revision=1`. Test awal sandbox gagal membuka socket PostgreSQL (`ERR_POSTGRES_CONNECTION_REFUSED`); rerun pada izin jaringan lokal lulus. Build memberi warning lingkungan `NO_COLOR` dan `FORCE_COLOR` bersamaan, tetapi exit code 0.
- Keputusan teknis: query session hanya menerima SHA-256 token hash, session belum revoked/expired, user dan role aktif. Tanpa permission predicate selalu SQL FALSE. Scope memakai EXISTS pada lima tingkat aktif dan grants OR, sehingga overlap tidak menggandakan ticket; caller wajib meng-AND predicate dengan filter lain.
- Kendala/risiko: resolver belum digunakan route API. Permission katalog masih kosong; role mapping dan capability matrix belum disahkan. Session issuance/revocation, login/logout, CSRF/rate limiting, audit dan HTTP permission guard belum ada. `psql` di sandbox ditolak oleh kebijakan socket; pemeriksaan read-only berhasil diulang setelah eskalasi akses.
- Rollback: revert code/docs melalui Git; tidak diperlukan database rollback karena hanya pembacaan dan test fixture yang rollback sendiri.
- Langkah berikutnya: tinjau kebijakan cookie/password/session serta versi Elysia/Bun yang terpasang; implementasikan hanya auth HTTP dasar dengan test penolakan dan tanpa seed role/permission legacy. Kemudian organization/user admin hanya setelah capability matrix dan guard audit disiapkan.

## 2026-11-26 — Phase 2 HTTP authentication and session routes

- Tindakan: memeriksa Security.md dan scope policy; membaca skill Elysia; mengambil dokumentasi Context7 untuk Elysia cookie/app.handle dan Bun Argon2id; menambahkan route factory untuk CSRF, login, logout dan identity; memisahkan query login/session ke DB package; menambahkan integration test dan memperbarui Phase 2/ADR.
- File berubah: `apps/api/src/app.ts`, `apps/api/src/index.ts`, `apps/api/src/auth.ts`, `apps/api/src/auth.test.ts`, `packages/db/src/authentication.ts`, `packages/db/src/index.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL 18.7 lokal `dompis_v3`; synthetic role/user/session fixtures hanya hidup dalam transaction integration test yang di-rollback. Verifikasi aggregate akhir bersifat read-only.
- Command/SQL tersanitasi: `bun run typecheck`; `bun run build`; `bun --env-file=.env test apps/api/src/auth.test.ts`; `bun --env-file=.env test packages/db/src/authorization.test.ts`; `git diff --check`; count users/roles/sessions.
- Hasil aktual: typecheck seluruh web/API/worker lulus; Svelte diagnostics 0 error/0 warning; build web/API lulus; auth integration test 1 pass/24 expectations; authz test 1 pass/9 expectations; diff check lulus; database akhir users=0, roles=0, sessions=0. Test pertama di sandbox gagal konek TCP loopback; rerun dengan akses jaringan lokal lulus. Test auth yang meliputi 10 Argon2id verification selesai dalam ~1.5 detik.
- Keputusan teknis: `/auth/login` dan `/auth/logout` butuh exact `APP_ORIGIN` serta double-submit CSRF cookie/header; session opaque 32-byte disimpan sebagai SHA-256, cookie host-only Secure HttpOnly SameSite=Lax dengan expiry 8 jam. `/auth/me` memuat status/perms terkini. Throttle terbatas 10 kegagalan per akun/IP per 15 menit di memory; forwarded headers tidak dipercaya dan tidak ada dependency/schema baru. Detail pada ADR-008.
- Kendala/risiko: limiter hilang saat restart dan tidak dibagi lintas replica, jadi deployment multi-instance harus ditahan sampai throttle durable disetujui. `APP_ORIGIN` wajib dikonfigurasi agar login aktif. Protected product-route guards, audit event, organisasi/user administration, permission seed/approval, MFA, password reset dan security review belum selesai. Tidak ada perubahan produksi/upstream/legacy database.
- Rollback: revert file auth/API/DB package dan catatan ADR/Phase-2/Handover; tidak perlu rollback DB karena tidak ada migration atau data commit.
- Langkah berikutnya: buat Elysia guard bersama yang memvalidasi session dan action permission; integrasikan `ticketAccessPredicate` ke seluruh endpoint data setelah route contract ditetapkan. Selanjutnya audit dan user/org management tetap menunggu capability matrix yang owner-approved; jangan seed permission berdasarkan asumsi.

## 2026-11-26 — Phase 2 reusable Elysia permission guard

- Tindakan: mengambil dokumentasi Context7 Elysia 1.4 tentang route guard, macro resolve, status response dan typed context; menambahkan macro `requirePermission` yang memuat session/role/permission terkini, menyediakan `authorization` context pada handler sah, serta menolak sesi dan permission yang tidak valid. Menambahkan `private, no-store` pada response guarded/auth dan memperluas test.
- File berubah: `apps/api/src/auth.ts`, `apps/api/src/permission-guard.ts`, `apps/api/src/auth.test.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL 18.7 lokal `dompis_v3`; test hanya memakai role/permission/user/session sintetis di dalam transaksi yang di-rollback. Tidak ada migration atau perubahan persistent row.
- Command tersanitasi: `bun run typecheck`; `bun run build`; `bun --env-file=.env test apps/api/src/auth.test.ts`; `git diff --check`.
- Hasil aktual: typecheck seluruh web/API/worker lulus; Svelte diagnostics 0 error/0 warning; build web/API lulus; auth test 1 pass/28 expectations (401 tanpa sesi, 200 izin sah, 403 permission tak diberikan, no-store); fixture transaction rollback. Tidak ada perubahan dependency.
- Keputusan teknis: gunakan Elysia macro per-route, bukan middleware global yang memaksa semua route butuh auth. Macro mengambil hash dari cookie yang terikat schema, memanggil resolver DB setiap request, dan mengembalikan Elysia status response sebelum handler saat gagal. Ia memeriksa action permission; route ticket tetap wajib menggabungkan `ticketAccessPredicate` dengan filter query.
- Kendala/risiko: belum ada route data produk yang memakai macro, jadi authorization belum melindungi business endpoint. Katalog permission kosong; jangan mendefinisikan/seed capability berdasarkan asumsi. Login throttle tetap single-process seperti ADR-008.
- Rollback: revert plugin, export hash helper/test update dan catatan docs via Git; tidak ada DB rollback.
- Langkah berikutnya: gunakan macro pada endpoint data pertama hanya setelah endpoint/DTO/filter contract dan permission code disepakati; tambah scope predicate langsung di SQL. Lanjutkan audit log dan organisasi/user API dengan capability matrix yang disetujui.

## 2026-11-26 — Ticket Management exact incident detail endpoint

- Tindakan: meninjau PRD AC01/F01, Query-Standards, Organization-Scope, Data-Contract, field mapping dan ticket schema; menambahkan `GET /tickets/:incident` menggunakan permission macro dan predicate scope pada SQL yang sama; menguji izin/denial dan bentuk DTO.
- File berubah: `apps/api/src/tickets.ts`, `apps/api/src/app.ts`, `apps/api/src/auth.test.ts`, `packages/db/src/tickets.ts`, `packages/db/src/index.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Handover.md`.
- Database target: PostgreSQL 18.7 lokal `dompis_v3`; synthetic user, permission, hierarchy, scope dan ticket dibuat hanya di transaksi integration test yang di-rollback.
- Command tersanitasi: `bun run typecheck:api`; `bun --env-file=.env test apps/api/src/auth.test.ts`; `bun run typecheck`; `bun run build`; `git diff --check`; read-only aggregate counts pada tickets/users/roles/permissions/user_scopes/sessions.
- Hasil aktual: API dan full typecheck lulus; Svelte diagnostics 0 error/0 warning; build web/API lulus; integration test 1 pass/33 expectations, termasuk incident lowercase normalization, akses workzone yang diberikan, 404 untuk workzone sibling di luar scope, tidak adanya PII/serviceNo/raw detail pada DTO, session/permission guard, dan CSRF/login/logout. `git diff --check` lulus. Counts akhir tickets/users/roles/permissions/user_scopes/sessions semuanya 0. Semua fixture memakai rollback eksplisit.
- Keputusan teknis: exact canonical incident lookup, query SQL AND scope EXISTS, hierarchy label join tanpa grant fan-out, return 404 menyamarkan ketiadaan dan akses luar-scope. DTO tidak mengembalikan customer/service number/summary/raw detail dan tidak menghitung SLA/TTR; field tersimpan hanya diproyeksikan apa adanya. `tickets.read` adalah permission candidate, tidak di-seed permanen dan endpoint fail-closed sampai diberi grant yang sah.
- Kendala/risiko: route detail sudah tersedia tetapi ticket source/sync belum diimplementasikan dan tabel lokal kosong; belum ada UI, list/search, filter, cursor atau audit. Jika permission matrix tidak menyetujui `tickets.read`, kode tersebut harus diganti sebelum permission diberikan. Tidak ada produksi/legacy/upstream write.
- Rollback: revert route, query helper, export/test/docs via Git; tidak ada migration atau persistent data rollback.
- Langkah berikutnya: lanjut Phase 3 sync dengan sanitized fixture dan contract validation; jangan membuat live NOSSA call tanpa budget/credential yang disetujui dan jangan mengasumsikan closed/reopen semantics. Ticket list/search tetap perlu cursor/filter contract dan endpoint detail ini belum menyelesaikan menu Ticket Management.

## 2026-11-26 — Phase 3A migration readiness preflight

- Tindakan: meninjau Implementation Plan, Database-Access, Migration, Migration-Validation, Master-Data-Migration, mapping, dan laporan Phase 0; mengonsolidasikan gate Phase 3A serta kondisi aman untuk mulai ETL.
- File berubah: `docs/Phase-3A-Migration-Readiness.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses pada pekerjaan ini. Laporan hanya mengutip hasil read-only yang telah tercatat di Phase 0; tidak membaca credential, mengekspor data, atau melakukan DDL/DML.
- SQL/command tersanitasi: tidak ada SQL atau database command dijalankan; `git diff --check` dijalankan setelah pembaruan.
- Hasil aktual: review dokumentasi menghasilkan readiness matrix gate source/snapshot, target PG, actual schema drift, field retention, hierarchy/workzone, user access, fixtures, dan business-derived values. Tidak menjalankan test/typecheck/build karena hanya dokumentasi yang berubah.
- Keputusan teknis: Phase 3A ETL ditandai **not started** sampai snapshot MySQL read-only terdaftar dan pulihannya terverifikasi, field/retention/crosswalk/role decisions tersedia, serta migration fixture suite siap. Jumlah 1.108.814 source rows adalah baseline lama, bukan snapshot manifest atau eligible count. Tidak menambah dependency source driver sebelum jalur akses dan kebutuhan ETL dibuktikan.
- Risiko/blocker: MySQL `dompis_db` sebelumnya teridentifikasi sebagai local container tetapi environment/owner tidak diklasifikasikan dan role `root@%`; target tidak boleh diasumsikan aman sebagai snapshot. PostgreSQL `dompis_v3` adalah candidate schema, bukan disposable restore target; tidak ada least-privilege migration role atau restore rehearsal. Tipe enam kolom drift; 74 Workzone keys/7.171 ticket rows belum dipetakan; PII/archive retention dan per-user scope/role parity belum disetujui.
- Rollback: dokumentasi saja berubah; revert kedua file melalui Git. Tidak ada data/database rollback.
- Langkah berikutnya: minta/siapkan registered read-only snapshot, backup/restore evidence, crosswalk, data retention/field dispositions, dan role/scope approvals. Setelah input tersedia, bangun dry-run ETL + fixture acceptance sebelum write. Jangan loncat Phase 3A atau memanggil NOSSA live tanpa gate.

## 2026-11-26 — Shared incident key normalization primitive

- Tindakan: menambahkan pure shared incident normalizer sebagai persiapan migrasi; mengintegrasikannya pada route detail ticket agar runtime lookup dan ETL memakai canonical business key yang sama.
- File berubah: `packages/contracts/src/incident.ts`, `packages/contracts/src/incident.test.ts`, `packages/contracts/src/index.ts`, `apps/api/src/tickets.ts`, `docs/Phase-3A-Migration-Readiness.md`, `docs/Handover.md`.
- Database target: tidak ada database untuk unit test; API integration test memakai PostgreSQL 18.7 lokal `dompis_v3` dengan seluruh hierarchy/user/permission/ticket fixtures di satu transaction yang di-rollback.
- Command tersanitasi: `bun test packages/contracts/src/incident.test.ts`; `bun run typecheck`; `bun run build`; `bun --env-file=.env test apps/api/src/auth.test.ts`; `git diff --check`.
- Hasil aktual: pure test 2 pass/11 expectations; full typecheck dan build lulus; auth/ticket API integration test 1 pass/33 expectations; integration fixtures rollback. `git diff --check` dijalankan setelah dokumentasi final.
- Keputusan teknis: input harus string; hanya ASCII A–Z/a–z/0–9/underscore/hyphen; trim hanya spasi ASCII di kedua ujung; uppercase; maksimum 100 karakter; tidak melakukan coercion, Unicode folding atau truncation. Invalid values mendapat alasan typed untuk quarantine. Fungsi ini tidak memilih winner untuk incident collision; collision mapping tetap harus snapshot-wide dan owner-dispositioned.
- Risiko/blocker: tidak ada source snapshot atau migration runner; fungsi ini bukan izin untuk import. Sumber MySQL environment/owner, eligibility/retention, actual type drift, crosswalk 74 unmatched Workzone values, user role/scope parity dan restore tetap memblokir ETL.
- Rollback: revert pure helper, export/test/API use dan docs via Git; tidak ada schema atau persistent data change.
- Langkah berikutnya: siapkan snapshot/target registration dan keputusan Phase 3A; sesudah itu buat collision accounting + dry-run manifest dari synthetic fixtures, bukan data aktif yang belum terdaftar.

## 2026-11-26 — SvelteKit local login experience

- Tindakan: mengganti halaman placeholder menjadi halaman masuk DOMPIS berbahasa Indonesia; menambahkan pemeriksaan sesi, alur CSRF/login/logout, pesan gagal generik, states sesi aktif, aksesibilitas dasar dan layout responsif; menambahkan proxy development same-origin untuk endpoint API; mengganti favicon Svelte; melengkapi `APP_ORIGIN` pada contoh konfigurasi dan panduan lokal.
- File berubah: `.gitignore`, `.env.example`, `apps/web/src/routes/+page.svelte`, `apps/web/src/app.html`, `apps/web/src/lib/assets/favicon.svg`, `apps/web/vite.config.ts`, `docs/Getting-Started.md`, `docs/Handover.md`. Konfigurasi lokal `.env` hanya ditambah `APP_ORIGIN` bila belum ada; file ignored dan tidak dicatat ke Git. `.env.example` dikecualikan dari pola ignore agar template tanpa credential dapat dilacak.
- Target database: tidak ada database yang diakses atau diubah. Tidak ada live endpoint atau kredensial upstream digunakan.
- Command tersanitasi: pemeriksaan keberadaan konfigurasi tanpa membaca nilainya; `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil aktual: Svelte diagnostics 0 error/0 warning; typecheck web/API/worker selesai sukses; build web/API sukses; `git diff --check` sukses. Warning build yang terlihat hanya peringatan kombinasi environment `NO_COLOR` dan `FORCE_COLOR`; tidak menggagalkan build.
- Keputusan teknis: panggilan browser memakai relative same-origin URL; Vite proxy ke API lokal menjaga Origin untuk proteksi CSRF dan cookie host-only. Form mengirim password hanya pada POST login, tidak menyimpan atau mencatatnya. Error layanan dan credential tidak menampilkan detail internal. API `/auth/me` hanya dipakai untuk mendeteksi sesi, dan UI tidak mengklaim fitur produk selain empat menu scope.
- Risiko/blocker: belum dilakukan browser E2E atau visual screenshot; build/typecheck bukan bukti alur interaktif end-to-end. Login memerlukan akun lokal yang telah diprovisikan dan API/database aktif; pekerjaan ini tidak membuat akun default. Proxy dev memakai alamat API lokal tetap `127.0.0.1:3000`, sesuai default API saat ini.
- Rollback: revert perubahan pada file di atas; hapus hanya baris `APP_ORIGIN` dari `.env` jika perlu mengembalikan konfigurasi lokal awal. Tidak ada database/data rollback.
- Langkah berikutnya: jalankan kedua proses lokal dan uji halaman/form menggunakan akun sintetis yang diprovisikan melalui jalur aman; lanjutkan menu Ticket Management setelah acceptance contract list/search disepakati. Phase 3A ETL tetap menunggu gate readiness yang tercatat pada laporan migrasi.

## 2026-11-26 — Local login proxy and browser verification

- Tindakan: menindaklanjuti smoke test halaman login; port API default `3000` bentrok dengan listener lokal yang tidak bisa diidentifikasi dari sandbox, sehingga Vite mengembalikan 502. Proxy dev kini memakai `API_PORT` yang sama dengan API (default tetap 3000). Menjalankan API di port 39871 dan Vite di 5173, menguji endpoint via proxy, dan memeriksa render halaman dengan Chrome headless desktop.
- File berubah: `apps/web/vite.config.ts`, `docs/Getting-Started.md`, `docs/Handover.md`.
- Target database: tidak ada database diakses atau diubah. Request hanya ke web/API lokal; tidak memanggil login POST, tidak memerlukan akun, dan tidak menulis data bisnis.
- Command tersanitasi: `API_PORT=39871 bun run dev:api`; `API_PORT=39871 bun run dev:web -- --host 127.0.0.1 --port 5173`; GET `/` melalui Chrome headless; GET `/auth/csrf`; GET `/auth/me`; `bun run typecheck:web`; `bun run build:web`; `git diff --check`.
- Hasil aktual: API start pada `127.0.0.1:39871`; halaman menghasilkan HTTP 200 dan screenshot Chrome menunjukkan form login beserta empat menu; proxy `/auth/csrf` menghasilkan 200 dan cookie CSRF; `/auth/me` menghasilkan 401 untuk anonymous seperti yang diharapkan. Svelte diagnostics 0 error/0 warning; web build sukses. Proses lokal dihentikan setelah uji. Chrome mengeluarkan warning display-link allocator dari lingkungan headless tetapi screenshot tersimpan dan exit code 0.
- Keputusan teknis: proxy development mengambil port dari `process.env.API_PORT`, menjaga alamat default dan mengizinkan port konsisten alternatif bila port 3000 sedang digunakan. Tidak menambah dependency atau mengubah API/runtime production.
- Kendala/risiko: `curl` dari sandbox tidak dapat membuka listener web; pengambilan halaman dilakukan pada izin localhost tereskalasi. Tidak menjalankan login dengan akun pengguna, tidak menguji logout terautentikasi dan belum ada E2E interaksi form; pemeriksaan visual hanya desktop. Port 3000 conflict tidak dihentikan atau diubah.
- Rollback: revert `apps/web/vite.config.ts`, `docs/Getting-Started.md`, dan entri handover ini; tidak ada rollback database atau data.
- Langkah berikutnya: setelah akun sintetis aman tersedia, uji login/logout interaktif dan viewport mobile. Lanjutkan endpoint ticket list hanya setelah filter/date/status contract dan permission code divalidasi; migration ETL tetap menunggu gate Phase 3A.

## 2026-11-26 — Local run instructions correction

- Tindakan: menyelaraskan README dan Getting Started dengan scripts dan proxy yang benar-benar tersedia; memisahkan perintah API/web ke terminal berbeda, menambahkan penanganan port alternatif, mencegah `cp` menimpa `.env` yang sudah ada, serta menjelaskan bahwa login memerlukan user yang diprovisikan.
- File berubah: `README.md`, `docs/Getting-Started.md`, `docs/Handover.md`.
- Database target: tidak ada koneksi atau perubahan database. `.env` tidak dibaca atau diubah.
- Command tersanitasi: peninjauan `package.json`, `.env.example`, dan konfigurasi proxy; `git diff --check`.
- Hasil aktual: dokumentasi menyebut API auth dan detail ticket yang sudah ada serta proxy `/auth`, `/tickets`, `/health`; tidak menjalankan typecheck/build karena hanya dokumentasi berubah. `git diff --check` lulus.
- Keputusan teknis: gunakan `cp -n` agar langkah setup tidak menimpa konfigurasi lokal; dua proses dev dijalankan terpisah; jangan sarankan worker karena upstream worker belum diimplementasikan.
- Risiko/blocker: akun lokal belum disediakan oleh bootstrap/admin UI. Template `.env.example` berisi placeholder database `dompis_dev:5433` sehingga harus disesuaikan bila pengguna memakai database lokal `dompis_v3` di port 5432.
- Rollback: revert pembaruan README, Getting Started, dan entri ini melalui Git; tidak ada rollback runtime/database.
- Langkah berikutnya: siapkan bootstrap akun lokal yang aman setelah jalur provisioning dan permission yang diizinkan ditentukan; terus tahan user management API sampai capability matrix disetujui.

## 2026-11-26 — Proxy decision and README reference correction

- Tindakan: mencatat keputusan development proxy berbasis `API_PORT` sebagai ADR-009; memperbaiki README yang mengarah ke `Phase-0-Discovery.md` yang tidak ada, dengan daftar file laporan Phase 0 aktual.
- File berubah: `README.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada akses database.
- Command tersanitasi: `rg --files docs` dan pencarian referensi nama Phase 0; `git diff --check`.
- Hasil aktual: empat laporan Phase 0 yang ditautkan README tersedia; tidak ada test/build karena dokumentasi saja berubah; diff check lulus.
- Keputusan teknis: ADR-009 merekam konteks port 3000, evidence localhost, dampak, validasi, dan rollback proxy development; tidak mengubah kontrak runtime.
- Risiko/blocker: role/action matrix, lifecycle/closed fixture, data retention, dan source snapshot tetap belum tervalidasi; endpoint/administrasi/migrasi yang bergantung padanya tidak boleh dibuat berdasarkan asumsi.
- Rollback: revert README, Decision Log, dan entri handover ini melalui Git.
- Langkah berikutnya: lanjutkan pada slice yang tidak bergantung pada keputusan tertahan; validasi C0C-01–06 yang relevan sebelum ticket list, user administration, atau migrasi.
