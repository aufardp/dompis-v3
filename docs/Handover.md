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

## 2026-11-26 — Baseline API response security headers

- Tindakan: menambahkan hook global Elysia sebelum routing untuk memasang `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, dan `Referrer-Policy: no-referrer`; memperbarui kebijakan keamanan dan ADR.
- File berubah: `apps/api/src/app.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada akses database atau perubahan data.
- Command tersanitasi: `bun run typecheck:api`; `git diff --check`.
- Hasil aktual: API TypeScript check lulus; `git diff --check` lulus. Tidak menjalankan HTTP assertion atau test suite pada slice ini.
- Keputusan teknis: gunakan `onRequest` global agar baseline berlaku sebelum routing, termasuk health dan route not-found. HSTS/CSP tidak ditambahkan di API karena TLS dan CSP halaman web harus dikonfigurasi pada deployment layer.
- Risiko/blocker: bukti runtime header belum diverifikasi melalui response HTTP; security headers tidak menggantikan CSP, TLS, authorization atau review deployment.
- Rollback: hapus hook serta pembaruan Security/ADR/Handover; tidak ada rollback database.
- Langkah berikutnya: validasi response headers pada smoke check API saat server lokal tersedia; kemudian lanjutkan kebutuhan yang tidak memerlukan lifecycle/role/business sign-off.

## 2026-11-26 — API security header smoke verification

- Tindakan: menjalankan API lokal pada loopback port alternatif dan memeriksa respons health serta unknown route untuk memastikan hook global mengirim header pada respons sukses dan 404; proses dihentikan setelah pemeriksaan.
- File berubah: `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database query atau perubahan data; `GET /health/live` tidak memerlukan PostgreSQL.
- Command tersanitasi: `API_PORT=39871 bun run dev:api`; GET `/health/live`; GET `/not-a-route`; proses API dihentikan.
- Hasil aktual: health menghasilkan HTTP 200 dan unknown route HTTP 404; kedua respons memuat `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, dan `Referrer-Policy: no-referrer`. Tidak ada test suite atau build dijalankan.
- Keputusan teknis: verifikasi mencakup route terdaftar dan tidak dikenal, sesuai posisi hook sebelum routing.
- Risiko/blocker: security header lain dan production TLS/CSP belum diverifikasi; route data tetap memerlukan auth/scope/business gates masing-masing.
- Rollback: dokumentasi hasil verifikasi dapat dibalik melalui Git; tidak ada runtime/database state tersisa.
- Langkah berikutnya: lanjutkan ke pekerjaan produk berikut yang dapat dilakukan tanpa keputusan owner; ticket list/user administration/migrasi tetap menunggu input kontrak dan akses yang tercatat.

## 2026-11-26 — Generic API errors with request IDs

- Tindakan: menambahkan Elysia `onError` global yang mempertahankan status HTTP, mengembalikan error code generik dan request ID, mengirim `X-Request-ID`, serta membatasi log 5xx ke event/request ID/framework code/error type. Memperbarui kebijakan keamanan dan ADR-011.
- File berubah: `apps/api/src/app.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada koneksi atau perubahan database.
- Command tersanitasi: Context7 lookup resmi Elysia `onError`; `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: API typecheck lulus; API bundle berhasil (`index.js`, 0.96 MB). Smoke check localhost: 404 mengembalikan `{error: not_found, requestId}` dan header `x-request-id`; body login kosong menghasilkan 422 `{error: invalid_request, requestId}`. Kedua respons tetap membawa security headers dasar. API berhenti setelah pemeriksaan; `git diff --check` lulus.
- Keputusan teknis: error status valid 400–599 dipertahankan; response body hanya menggunakan `not_found`, `invalid_request`, atau `internal_error` beserta UUID acak. Internal logs tidak memuat message/stack/SQL/payload. Error bisnis yang dikembalikan eksplisit oleh route tetap memakai kontraknya sendiri.
- Risiko/blocker: unexpected thrown 500 belum disimulasikan melalui runtime; review deployment tetap diperlukan. Error bisnis eksplisit per route bukan diseragamkan oleh hook.
- Rollback: revert hook dan catatan Security/ADR/Handover; tidak ada data rollback.
- Langkah berikutnya: tambahkan synthetic thrown-500 assertion pada test terisolasi saat permintaan test diberi scope; lanjutkan ticket list/user management hanya setelah approval permission dan contract tersedia.

## 2026-11-26 — Request ID on every API response

- Tindakan: menghasilkan UUID request ID di global `onRequest`, menyertakannya pada semua response sebagai `X-Request-ID`, memakai ID yang sama untuk body `onError`, dan menambahkan ID tersebut ke readiness failure log yang sudah disanitasi. Memperbarui Security.md dan ADR-012.
- File berubah: `apps/api/src/app.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database diakses/diubah; smoke menggunakan health live, route 404, dan payload login kosong yang gagal schema validation sebelum authentication/DB.
- Command tersanitasi: `bun run typecheck:api`; `bun run build:api`; API lokal port 39871; GET `/health/live`, GET `/not-a-route`, POST `/auth/login` dengan body kosong; hentikan proses; `git diff --check`.
- Hasil aktual: typecheck dan build API lulus. Respons 200, 404 dan 422 semuanya membawa `x-request-id`; respons 404/422 memiliki request ID body yang cocok dengan header. Security headers dasar tetap ada. API berhenti setelah smoke.
- Keputusan teknis: ID dibuat server-side dan tidak menerima header request ID dari client; log readiness memakai nilai response header yang sama.
- Risiko/blocker: synthetic thrown 500 belum dijalankan, jadi pemetaan internal-error/log redaction belum teruji lewat HTTP; tidak menjalankan test suite.
- Rollback: revert perubahan app/security/ADR/handover; tidak ada DB atau data rollback.
- Langkah berikutnya: jalankan kontrol internal 500 pada test terisolasi; lanjutkan endpoint produk hanya setelah owner-gated access/business contract siap.

## 2026-11-26 — Show API request reference on login failures

- Tindakan: menghubungkan `X-Request-ID` API ke error generik form login/logout. UI menerima ID hanya jika formatnya UUID, sehingga pengguna dapat mengirim referensi dukungan tanpa menerima detail internal. CSRF endpoint failure membawa ID melalui error bertipe internal UI.
- File berubah: `apps/web/src/routes/+page.svelte`, `docs/Handover.md`.
- Database target: tidak ada akses database atau request API runtime.
- Command tersanitasi: `bun run typecheck:web`; `bun run build:web`; `git diff --check`.
- Hasil aktual: percobaan awal typecheck/build mendeteksi unsupported TypeScript parameter property pada script Svelte; properti diubah menjadi deklarasi eksplisit. Setelah koreksi, Svelte diagnostics 0 error/0 warning dan build web sukses. Diff check lulus.
- Keputusan teknis: hanya kegagalan tak terduga/layanan menampilkan request reference; error credential, CSRF, dan throttle tetap memakai pesan operasional yang sudah ada. ID dirender sebagai text escaped Svelte.
- Risiko/blocker: tidak menjalankan browser interaction test; belum ada akun sintetis untuk menguji tampilan error 5xx secara end-to-end. Error transport sebelum response tidak punya request ID.
- Rollback: revert perubahan helper/penanganan login/logout UI dan entri ini; tidak ada database rollback.
- Langkah berikutnya: uji alur interaktif memakai synthetic account ketika jalur provisioning aman tersedia; lanjutkan endpoint produk setelah permission/business contract disetujui.

## 2026-11-26 — Login service-unavailable reference check

- Tindakan: memeriksa respons login saat DB sengaja tidak dikonfigurasi melalui `createApp().handle`, tanpa membuka listener atau menyambung ke database; mencoba menyiapkan browser E2E dan mendapati API port tidak bisa di-bind di sandbox.
- File berubah: `docs/Handover.md`.
- Database target: tidak ada koneksi database; `DATABASE_URL` kosong hanya untuk proses smoke terisolasi.
- Command tersanitasi: Elysia in-process `POST /auth/login` dengan akun/password sintetis yang tidak pernah dicatat; pemeriksaan `lsof` pada port alternatif; tidak ada login ke akun nyata.
- Hasil aktual: API mengembalikan 503 `authentication_unavailable` dan menyertakan `X-Request-ID`. Browser E2E tidak berjalan: API bind pada 39871, 39872, dan 45731 menghasilkan EADDRINUSE, sedangkan pemeriksaan listener yang diizinkan tidak menemukan proses pada port tersebut. Watcher percobaan dihentikan; tidak ada listener aplikasi yang tersisa.
- Keputusan teknis: pertahankan pesan 503 generik pada API; halaman membaca request ID dari header untuk menampilkan referensi. Tidak memakai test user/database hanya demi UI verification.
- Risiko/blocker: tampilan request ID pada browser belum dikonfirmasi secara interaktif; keterbatasan lokal port/network perlu diselesaikan sebelum UI E2E.
- Rollback: dokumentasi saja berubah; tidak ada database atau persistent application state yang berubah.
- Langkah berikutnya: ulangi UI E2E ketika port lokal dapat di-bind dan akun sintetis aman tersedia; jangan mengubah/mematikan listener yang pemiliknya tidak diketahui.

## 2026-11-26 — Session-check availability feedback

- Tindakan: memperbarui startup session check di halaman login: respons 5xx menampilkan pesan autentikasi belum tersedia dan request reference tervalidasi bila ada; kegagalan transport menampilkan pesan generik sambil tetap mengaktifkan form.
- File berubah: `apps/web/src/routes/+page.svelte`, `docs/Handover.md`.
- Database target: tidak ada database atau API runtime yang diakses pada implementasi ini.
- Command tersanitasi: `bun run typecheck:web`; `bun run build:web`; `git diff --check`.
- Hasil aktual: Svelte diagnostics 0 error/0 warning; web build sukses; diff check lulus. Build memberi warning environment `NO_COLOR`/`FORCE_COLOR` yang tidak memengaruhi exit code.
- Keputusan teknis: hanya 5xx yang menampilkan referensi dukungan; 401 tetap dianggap sesi anonim normal. Gangguan jaringan tetap memberi pesan tanpa ID karena server belum tentu merespons.
- Risiko/blocker: belum ada interaksi browser karena port lokal tidak bisa di-bind; 503 header behavior API sudah terverifikasi in-process, tetapi tampilan pesan belum E2E.
- Rollback: revert perubahan `checkSession` dan entri ini; tidak ada data/database rollback.
- Langkah berikutnya: validasi UI error state saat port lokal tersedia; lanjutkan produk setelah permission, snapshot, dan business contracts owner-gated tersedia.

## 2026-11-26 — Phase 0C/3A input availability refresh

- Tindakan: memeriksa ulang repository untuk fixture NOSSA Closed/reopen, OpenAPI/Swagger, snapshot manifest, crosswalk, dan owner permission matrix sebelum memilih implementasi berikutnya.
- File berubah: `docs/Handover.md`.
- Database target: tidak ada database diakses; pemeriksaan hanya pada file repository.
- Command tersanitasi: `rg --files` dengan pola nama artifact; pencarian blocker `C0C-01–06` pada laporan Phase 0C, Phase 3A, dan Phase 2.
- Hasil aktual: hanya Drizzle metadata snapshot yang ditemukan; tidak ada artifact input baru yang memenuhi owner gates. `docs/Phase-0C-Contract-Access-Discovery.md` dan `docs/Phase-3A-Migration-Readiness.md` tetap mencatat blockers. Tidak menjalankan typecheck/build/test karena tidak ada code change.
- Keputusan teknis: tidak menambahkan endpoint ticket list/report, ETL, permission seed, atau account provisioning berdasarkan tebakan.
- Risiko/blocker: C0C-01 closed/reopen fixture + authoritative OpenAPI; C0C-02 lifecycle/date/time/TTR policy; C0C-03 geography/Workzone crosswalk; C0C-04 role/action/global/activation parity; C0C-05 84-field disposition/PII retention; C0C-06 registered source snapshot/read role masih belum lengkap.
- Rollback: dokumentasi saja berubah; revert entri ini melalui Git.
- Langkah berikutnya: lanjutkan hanya slice teknis yang independen. Untuk membuka data/report/admin implementation, masukkan fixture dan keputusan pemilik ke dokumen Phase 0C/3A; jangan gunakan data produksi/live endpoint sebagai pengganti bukti yang disetujui.

## 2026-11-26 — Mobile login layout overflow correction

- Tindakan: mengambil screenshot halaman login pada viewport 390px dan menemukan konten terpotong di kanan; memeriksa DOM/browser viewport, memperbaiki grid mobile agar track dapat menyusut ke viewport, lalu memeriksa viewport 390px dan 320px serta state API unavailable.
- File berubah: `apps/web/src/routes/+page.svelte`, `docs/Handover.md`.
- Database target: tidak ada database atau akun digunakan. Vite dijalankan tanpa API; request session hanya menghasilkan proxy connection failure dan tidak mencapai DB.
- Command tersanitasi: web dev server lokal port 5173; Chrome/agent-browser viewport 390×844 dan 320×720; evaluasi `clientWidth`, `scrollWidth`, card width, form presence, dan fallback message; `bun run typecheck:web`; `bun run build:web`; `git diff --check`.
- Hasil aktual: sebelum fix screenshot menunjukkan clipping; sesudah fix browser melaporkan `clientWidth=390`, `scrollWidth=390`, form terlihat dan fallback API-unavailable terlihat. Pada 320px, `clientWidth=320`, `scrollWidth=320`, card width=296 dan form terlihat. Typecheck Svelte 0 error/0 warning; build web dan diff check lulus. Build hanya memberi warning environment `NO_COLOR`/`FORCE_COLOR`.
- Keputusan teknis: breakpoint mobile memakai `grid-template-columns: minmax(0, 1fr)` dan memberi `min-width: 0` pada panel/isi grid untuk mencegah intrinsic min-content memaksa overflow.
- Risiko/blocker: API tidak dijalankan sehingga autentikasi/ref request ID tidak diuji end-to-end; layar hanya diuji pada viewport 320/390, bukan tablet/desktop dalam sesi ini. Perintah penutupan sesi agent-browser tidak selesai dalam timeout dan wrapper dihentikan; web dev server telah dihentikan.
- Rollback: revert CSS mobile dan entri handover; tidak ada database/data rollback.
- Langkah berikutnya: cek sesi browser terisolasi bila proses masih hidup, lalu lakukan UI E2E ketika API port dapat dijalankan; lanjutkan feature ticket setelah data/permission gates terpenuhi.

## 2026-11-26 — Synthetic API internal-error sanitization check

- Tindakan: menutup blocker 500 dari ADR-011 dengan membuat API Elysia in-process, mengonfigurasi PostgreSQL ke loopback port 1 yang tidak aktif, lalu mengirim POST login sintetis dengan Origin dan CSRF yang valid. Tidak ada HTTP listener.
- File berubah: `docs/Handover.md`.
- Database target: tidak ada server/database yang tersambung; DSN sintetis menunjuk `127.0.0.1:1/dompis_error_smoke`, koneksi gagal sebelum query data atau autentikasi; client ditutup eksplisit.
- Command tersanitasi: `DATABASE_URL` loopback port 1; `APP_ORIGIN` localhost; Elysia `app.handle` GET `/auth/csrf`, POST `/auth/login` dengan user/password sintetis; `closeDatabase()`; `git diff --check`. Invocation pertama dari root gagal hanya karena workspace import `@dompis/db` tidak resolve dari root eval; tidak memulai koneksi atau mengubah data. Rerun dari `apps/api` berhasil.
- Hasil aktual: API mengembalikan HTTP 500 dengan body tepat berisi `error=internal_error` dan `requestId`; `X-Request-ID` ada dan cocok dengan body. Output server hanya memuat event, UUID, `errorCode=UNKNOWN`, dan `errorType=Error`; tidak ada message, stack, SQL, payload, atau credential.
- Keputusan teknis: error sanitizer mengatasi unexpected DB connection failure sesuai status 500 dan tetap memberikan correlation ID; no code change diperlukan.
- Risiko/blocker: satu synthetic connection error diuji; ini bukan exhaustive exception matrix atau test suite. Login interaktif/browser masih belum diverifikasi dengan user account.
- Rollback: dokumentasi saja berubah; tidak ada data/db rollback.
- Langkah berikutnya: gunakan hasil ini untuk menutup item internal 500 sanitization; lanjutkan fitur produk yang tidak bergantung pada owner-gated contracts, atau tunggu fixtures/decisions untuk ticket/report/admin/migration.

## 2026-11-26 — Login password visibility control

- Tindakan: menambahkan kontrol tampil/sembunyikan password pada form login, dengan password tersembunyi secara default, label aksesibel dan target sentuh minimum 44px. Nilai kontrol direset setelah login berhasil atau logout.
- File berubah: `apps/web/src/routes/+page.svelte`, `docs/Handover.md`.
- Database target: tidak ada database atau API runtime yang diakses.
- Command tersanitasi: `bun run typecheck:web`; `bun run build:web`; `git diff --check`.
- Hasil aktual: Svelte diagnostics 0 error/0 warning; web production build sukses; `git diff --check` lulus. Build mencetak warning environment `NO_COLOR`/`FORCE_COLOR` yang tidak memengaruhi hasil.
- Keputusan teknis: kontrol memakai button native dengan `aria-controls`, `aria-pressed` dan nama aksesibel dinamis; aksi dinonaktifkan selama session check atau submit agar tidak mengubah field ketika auth berlangsung.
- Risiko/blocker: interaksi show/hide belum diverifikasi di browser pada slice ini; tidak ada perubahan auth atau data.
- Rollback: revert markup/state/CSS kontrol password dan entri handover ini; tidak ada database rollback.
- Langkah berikutnya: validasi interaksi keyboard/touch pada browser saat sesi UI berikutnya tersedia; lanjutkan hanya pekerjaan produk yang tidak membutuhkan owner-gated business/data contract.

## 2026-11-26 — Password visibility browser QA attempt

- Tindakan: mencoba validasi browser lokal untuk kontrol tampil/sembunyikan password. `agent-browser` tidak tersedia (`command not found`); web dev server Vite berhasil berjalan sementara di `127.0.0.1:8765`, tetapi Chrome headless berhenti dengan exit code 134 sebelum screenshot/interaksi. Server Vite kemudian dihentikan.
- File berubah: `docs/Handover.md`.
- Database target: tidak ada database atau API yang diakses; tidak ada kredensial yang dikirim.
- Command tersanitasi: `agent-browser skills get core` (tidak tersedia); `bun run dev:web -- --host 127.0.0.1 --port 8765` (server ready lalu dihentikan); Chrome headless lokal ke halaman login (exit 134); `git diff --check`.
- Hasil aktual: browser QA tidak menghasilkan screenshot atau interaksi; typecheck/build sebelumnya pada perubahan kontrol tetap lulus. Tidak ada file aplikasi atau data yang berubah dari percobaan QA.
- Keputusan teknis: tidak menambah dependency browser baru hanya untuk satu pemeriksaan; status interaksi keyboard/touch tetap belum tervalidasi.
- Risiko/blocker: browser automation executable tidak terpasang dan Chrome headless crash pada environment ini; kontrol tetap memerlukan pemeriksaan interaktif di sesi browser yang berfungsi.
- Rollback: entri dokumentasi ini dapat direvert; tidak ada perubahan database. Dev server sudah dihentikan.
- Langkah berikutnya: lanjutkan browser QA saat `agent-browser` atau Chrome headless berjalan normal; jangan menyatakan interaksi sudah teruji sebelum itu.

## 2026-11-26 — Login throttle Retry-After correction

- Tindakan: mengoreksi header `Retry-After` agar dihitung dari waktu reset bucket akun/IP yang benar-benar memblokir; pada kapasitas limiter penuh, interval juga memperhitungkan bucket pertama yang kedaluwarsa.
- File berubah: `apps/api/src/auth.ts`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database diakses atau diubah.
- Command tersanitasi: `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak menjalankan test suite atau runtime request pada slice ini.
- Keputusan teknis: kebijakan ambang 10 kegagalan/15 menit tetap; hanya akurasi waktu tunggu 429 yang berubah. Nilai minimum tetap 1 detik dan detail bucket tidak diekspos.
- Risiko/blocker: perubahan belum diverifikasi lewat test/runtime; limiter tetap in-memory per proses dan reset saat restart sesuai ADR-008.
- Rollback: kembalikan limiter ke boolean `blocked` dan header tetap 900 detik, lalu hapus ADR-013/entri handover ini; tidak ada rollback database.
- Langkah berikutnya: validasi kasus bucket dengan sisa waktu parsial serta limiter penuh pada sesi pengujian terotorisasi; pertahankan blocker Phase 0C pada endpoint/report/migration yang memerlukan keputusan owner.

## 2026-11-26 — CSRF malformed-token validation

- Tindakan: memperketat validasi cookie/header CSRF sebelum constant-time comparison ke alfabet base64url exact 43 karakter, sesuai format output `randomBytes(32).toString('base64url')`.
- File berubah: `apps/api/src/auth.ts`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak menjalankan runtime request atau test suite pada slice ini.
- Keputusan teknis: token malformed ditolak sebagai CSRF invalid sebelum `timingSafeEqual`, mencegah input Unicode dengan panjang byte berbeda memicu exception/500. Token valid tidak berubah.
- Risiko/blocker: perilaku 403 untuk input malformed belum diverifikasi lewat runtime/test; scope bisnis Phase 0C tetap terbuka.
- Rollback: kembalikan pemeriksaan panjang saja dan hapus ADR-014/entri ini; tidak ada rollback database.
- Langkah berikutnya: lanjutkan slice hardening independen; jalankan pengujian auth terisolasi saat diizinkan dan tersedia target DB sintetis/disposable.

## 2026-11-26 — Password verifier error propagation

- Tindakan: menghapus catch yang menyamarkan exception `Bun.password.verify` sebagai kegagalan kredensial biasa. Hasil `false` tetap menjadi 401 generik; exception tak terduga masuk ke sanitizer global sebagai 500 generik dengan request ID.
- File berubah: `apps/api/src/auth.ts`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak menjalankan runtime request atau test suite pada slice ini.
- Keputusan teknis: mempertahankan pemisahan antara password salah normal dan kegagalan verifier internal tanpa mencatat detail exception, hash, atau input.
- Risiko/blocker: jalur verifier exception belum diverifikasi lewat runtime/test; sanitasi 500 sudah pernah diuji untuk kegagalan koneksi DB, bukan specifically exception verifier.
- Rollback: pulihkan catch yang mengubah seluruh exception menjadi `false`, lalu hapus ADR-015/entri ini; tidak ada rollback database.
- Langkah berikutnya: validasi jalur verifier rusak menggunakan fixture terisolasi saat pengujian diizinkan; kontrak business Phase 0C tetap memblokir endpoint produk/laporan dan migrasi.

## 2026-11-26 — Session cookie logout attribute parity

- Tindakan: mengganti `.remove()` generik saat logout dengan cookie kedaluwarsa yang eksplisit memakai atribut yang sama seperti saat login: `Path=/`, `Secure`, `HttpOnly`, `SameSite=Lax`, `Max-Age=0`, dan value kosong.
- File berubah: `apps/api/src/auth.ts`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah; pencabutan sesi tetap memakai query DB yang sudah ada tanpa dijalankan pada pekerjaan ini.
- Command tersanitasi: Context7 lookup Elysia `Cookie.remove()`; inspeksi implementasi Elysia lokal 1.4.32; `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: implementasi terpasang Elysia menunjukkan `remove()` menetapkan value kosong/expiry/maxAge, tetapi tidak memasukkan atribut cookie; typecheck API dan build API lulus; diff check lulus. Tidak melakukan request runtime atau test suite.
- Keputusan teknis: atribut logout dibuat sama dengan cookie sesi `__Host-` saat login agar penghapusan menunjuk cookie host/path yang tepat.
- Risiko/blocker: header `Set-Cookie` aktual belum diperiksa lewat runtime/browser; logout E2E sebelumnya menguji revokasi DB, bukan penerimaan penghapusan cookie browser.
- Rollback: kembalikan pemanggilan `.remove()` dan hapus ADR-016/entri ini; tidak ada rollback database.
- Langkah berikutnya: cek header logout dalam runtime auth QA ketika target sintetis dan pemeriksaan browser tersedia; business contracts Phase 0C tetap menjadi gate bagi endpoint/report/migration.

## 2026-11-26 — Shared session token format guard

- Tindakan: menambahkan type guard base64url 43 karakter yang dipakai konsisten oleh `/auth/me`, logout, dan permission guard sebelum hash atau akses database sesi.
- File berubah: `apps/api/src/auth.ts`, `apps/api/src/permission-guard.ts`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: inspeksi source Elysia/route guard; `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak menjalankan runtime request atau test suite.
- Keputusan teknis: format pemeriksaan mengikuti output token terbitan `randomBytes(32).toString('base64url')`; token malformed ditolak sebelum query atau revocation.
- Risiko/blocker: perilaku 401/no-DB untuk malformed cookie belum diuji lewat runtime; tidak mengubah sesi valid atau akses bisnis.
- Rollback: hapus type guard bersama lalu kembalikan pemeriksaan lokal sebelumnya; tidak ada rollback database.
- Langkah berikutnya: validasi kasus sesi malformed pada fixture auth terisolasi ketika test/DB target QA tersedia; endpoint produk dan migrasi tetap menunggu kontrak Phase 0C.

## 2026-11-26 — Authentication origin readiness validation

- Tindakan: memvalidasi `APP_ORIGIN` sebagai exact HTTP(S) origin sebelum memasangnya pada auth routes; readiness kini memeriksa konfigurasi tersebut setelah konektivitas database dan mengembalikan alasan `auth_origin_not_configured` atau `auth_origin_invalid` tanpa memuat nilai konfigurasi.
- File berubah: `apps/api/src/app.ts`, `packages/contracts/src/index.ts`, `docs/Getting-Started.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil aktual: `bun run typecheck` lulus (Svelte 0 error/0 warning; API dan worker TypeScript lulus); `bun run build` lulus untuk web static dan API bundle; `git diff --check` lulus. Build web hanya mencetak warning environment `NO_COLOR`/`FORCE_COLOR`. Tidak ada runtime health request atau test suite.
- Keputusan teknis: konfigurasi valid harus persis `URL.origin` dengan protocol HTTP(S), tanpa path/query/trailing slash. HTTP lokal tetap diterima sesuai Getting Started; kebijakan TLS deployment tidak berubah.
- Risiko/blocker: alasan readiness baru belum diverifikasi melalui runtime probe; probe yang menganggap database saja sebagai readiness perlu disesuaikan. Tidak mengubah authorization atau data bisnis.
- Rollback: kembalikan pass-through `Bun.env.APP_ORIGIN`, hapus pemeriksaan readiness, union reason baru, dan catatan ADR/handover; tidak ada rollback database.
- Langkah berikutnya: pastikan typecheck/build selesai dan periksa diff; validasi readiness dengan env sintetis saat pemeriksaan runtime diizinkan.

## 2026-11-26 — API request body size cap

- Tindakan: membatasi body request API Bun/Elysia ke 16 KiB sebelum parsing/validasi route; batas default Elysia yang terdokumentasi adalah 128 MiB. API saat ini hanya menerima JSON auth kecil dengan batas field eksplisit; ingest berada di worker.
- File berubah: `apps/api/src/app.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: Context7 lookup Elysia serve options dan Bun `maxRequestBodySize`; `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil aktual: `bun run typecheck` lulus (Svelte 0 error/0 warning; API dan worker TypeScript lulus); `bun run build` lulus untuk web static dan API bundle; `git diff --check` lulus. Build web mencetak warning environment `NO_COLOR`/`FORCE_COLOR`. Tidak mengirim oversized runtime request dan tidak menjalankan test suite.
- Keputusan teknis: konfigurasi server memakai 16 KiB berdasarkan ukuran maksimum body login saat ini (username 160, password 1.024 karakter) dengan ruang untuk JSON escaping/UTF-8; endpoint masa depan yang butuh body lebih besar harus meninjau ulang kontrak dan limit.
- Risiko/blocker: perilaku rejection body oversized belum diverifikasi lewat runtime; framework adapter lain selain Bun tidak menjadi target runtime aplikasi.
- Rollback: hapus setting body limit dan catatan ADR-019/Security/Handover; tidak ada rollback database.
- Langkah berikutnya: pertahankan cap selama API hanya menerima body kecil; evaluasi payload maksimum sebelum menambah route mutasi/unggah.

## 2026-11-26 — Owner contract artifact checkpoint

- Tindakan: memeriksa repository untuk fixture NOSSA Closed/reopen, OpenAPI/Swagger aktual, crosswalk Workzone/Area, permission matrix, keputusan retensi, dan snapshot/manifest MySQL sebelum memilih pekerjaan ticket, reporting, atau ETL berikutnya.
- File berubah: `docs/Handover.md`.
- Database target: tidak ada database yang diakses; pemeriksaan hanya pada nama file dan dokumen lokal.
- Command tersanitasi: `rg --files` dengan pola fixture/OpenAPI/Swagger/crosswalk/permission/retention/snapshot/manifest; baca status C0C-01–06 di `docs/Phase-0C-Contract-Access-Discovery.md` dan required inputs di `docs/Phase-3A-Migration-Readiness.md`; `git diff --check`.
- Hasil aktual: tidak ditemukan artifact baru selain metadata snapshot Drizzle. C0C-01–05 tetap belum terpenuhi; C0C-06 hanya menyediakan PostgreSQL lokal dan masih kekurangan MySQL source owner/environment, consistent snapshot, dan read-role registration. Tidak ada typecheck/build/test karena tidak ada perubahan kode.
- Keputusan teknis: tidak mengimplementasikan ticket list/report/admin grants/ETL dan tidak melakukan live endpoint/database source access tanpa evidence/registration yang disebutkan.
- Risiko/blocker: kontrak lifecycle/KPI/TTR, akses user, geography, 84-field retention, dan identitas snapshot sumber tetap menghalangi implementasi yang bergantung padanya.
- Rollback: dokumentasi saja berubah; revert entri ini melalui Git.
- Langkah berikutnya: lanjutkan hardening/scaffold yang independen; untuk membuka produk/ETL, sediakan artifact dan persetujuan yang tercantum pada C0C-01–06 dan Phase 3A readiness.

## 2026-11-26 — Runtime dependency boundary audit

- Tindakan: memeriksa source dan package manifest runtime terhadap larangan dependency MySQL, Redis, piloting ticket, permanent `ticket_raw`, dan projection worker terpisah.
- File berubah: `docs/Handover.md`.
- Database target: tidak ada database diakses.
- Command tersanitasi: `rg` untuk pola larangan di `apps/` dan `packages/`; baca package manifests root/API/worker/DB; `git diff --check`.
- Hasil aktual: tidak ada referensi MySQL/Redis/piloting/`ticket_raw`/projection worker pada runtime source; manifest API hanya memiliki workspace contracts/DB dan Elysia, DB hanya Drizzle, worker belum memiliki dependency pihak ketiga. Pencarian NOSSA hanya menemukan nama endpoint yang diwajibkan dan enum/provenance schema. Tidak menjalankan typecheck/build/test karena tidak ada perubahan kode.
- Keputusan teknis: tidak mengubah source atau dependency; architecture boundary yang diperiksa saat ini konsisten dengan larangan runtime.
- Risiko/blocker: worker/sync belum diimplementasikan; pencarian statis tidak membuktikan perilaku runtime selain source dan manifest yang diperiksa.
- Rollback: dokumentasi saja berubah; revert entri ini melalui Git.
- Langkah berikutnya: lanjutkan foundation/auth independen; mulai adapter hanya setelah fixture/kontrak upstream dan gate Phase 0C/3B tersedia.

## 2026-11-26 — Concurrent login throttle reservation

- Tindakan: menambahkan reservation account/IP secara sinkron sebelum query identity dan Argon2id; limiter sekarang menghitung `failedAttempts + inFlight`, lalu menyelesaikan reservation sebagai gagal, sukses, atau dilepas saat exception.
- File berubah: `apps/api/src/auth.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database diakses atau diubah.
- Command tersanitasi: `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak menjalankan test suite atau concurrent runtime request.
- Keputusan teknis: ambang 10/15 menit tetap; sukses membersihkan kegagalan account tetapi mempertahankan kegagalan IP; exception melepas reservation tanpa dihitung sebagai kredensial salah. Untuk blokir yang hanya disebabkan request in-flight, `Retry-After` minimum satu detik.
- Risiko/blocker: race paralel belum diverifikasi lewat runtime/test; limiter tetap in-memory dan per proses.
- Rollback: pulihkan implementasi limiter lama dan hapus ADR-020/entri ini; tidak ada rollback database.
- Langkah berikutnya: uji tekanan paralel pada target auth sintetis saat verifikasi diizinkan; lanjutkan produk hanya setelah kontrak scope, ticket, dan permission tervalidasi.

## 2026-11-26 — Logout unavailable-database response

- Tindakan: membuat `/auth/logout` mengembalikan HTTP 503 `authentication_unavailable` bila session database tidak dikonfigurasi, alih-alih menghapus cookie dan menyatakan `signed_out` tanpa revocation. Menambahkan response schema 503.
- File berubah: `apps/api/src/auth.ts`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak menjalankan runtime request atau test suite.
- Keputusan teknis: 200 `signed_out` hanya diberikan jika session storage tersedia dan revocation query yang diperlukan selesai. Kegagalan query tetap memakai error handler generik.
- Risiko/blocker: jalur tanpa database belum diverifikasi lewat runtime; UI yang menerima 503 mempertahankan state signed-in dan memberi pesan retry.
- Rollback: hapus guard awal database dan schema 503, lalu pulihkan revocation bersyarat lama; tidak ada rollback database.
- Langkah berikutnya: verifikasi kontrak 503 dengan request sintetis saat runtime QA tersedia; lanjutkan feature produk yang memerlukan owner contracts hanya setelah gate dibuka.

## 2026-11-26 — Ticket detail authorization response schema

- Tindakan: menyelaraskan response schema `GET /tickets/:incident` dengan status yang dikeluarkan `requirePermission`: 401 `unauthenticated`, 403 `forbidden`, serta 503 `authorization_unavailable`; schema tetap menerima 404 dan 503 `ticket_data_unavailable` dari handler ticket.
- File berubah: `apps/api/src/tickets.ts`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: perbandingan source route/guard; `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak menjalankan HTTP request atau test suite.
- Keputusan teknis: hanya kontrak response yang diselaraskan; permission `tickets.read` tetap tidak di-seed dan endpoint tetap deny-by-default.
- Risiko/blocker: status/response guard belum diverifikasi di runtime karena endpoint belum memiliki fixture auth disposable pada slice ini.
- Rollback: pulihkan response schema sebelumnya dan hapus ADR-022/entri handover; tidak ada rollback database.
- Langkah berikutnya: validasi route dengan fixture otorisasi sintetis jika test/QA diizinkan; ticket list/report tetap menunggu kontrak lifecycle, permission, scope, serta KPI.

## 2026-11-26 — Generic API error response schemas

- Tindakan: menambahkan response schema generik 400/422 `invalid_request` + `requestId` dan 500 `internal_error` + `requestId` pada route auth/ticket yang memiliki parsing/validasi atau operasi async; route CSRF juga mendeklarasikan 422/500.
- File berubah: `apps/api/src/auth.ts`, `apps/api/src/tickets.ts`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: perbandingan `apps/api/src/app.ts` error handler dengan schema route; `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak menjalankan request error runtime atau test suite.
- Keputusan teknis: status 400 mengikuti `ParseError` Elysia 1.4.32 lokal, 422 mengikuti validation handler, dan 500 mengikuti error handler global; skema hanya mendokumentasikan response yang ada.
- Risiko/blocker: kesesuaian OpenAPI/runtime aktual belum diperiksa melalui HTTP; response validators Elysia sudah lolos typecheck/build.
- Rollback: hapus schema 422/500 dan konstanta lokal di auth/ticket; tidak ada rollback database.
- Langkah berikutnya: lanjutkan audit response schema terhadap handler global; jalankan error matrix sintetis saat runtime verification tersedia.

## 2026-11-26 — Readiness response no-store

- Tindakan: menetapkan `Cache-Control: no-store` pada setiap `/health/ready` response agar perubahan kondisi DB atau `APP_ORIGIN` tidak tertutup cache lama.
- File berubah: `apps/api/src/app.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: review readiness handler; `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak memanggil health endpoint runtime atau menjalankan test suite.
- Keputusan teknis: header diterapkan sebelum seluruh branch return, mencakup HTTP 200 dan semua HTTP 503 readiness state.
- Risiko/blocker: header aktual belum diperiksa melalui HTTP/proxy; kebijakan cache ditinjau dari source dan type/build.
- Rollback: hapus assignment cache-control readiness dan entri ADR/Security/Handover; tidak ada rollback database.
- Langkah berikutnya: lanjutkan API hardening independen; kontrak data bisnis tetap menahan route ticket list/report dan ETL.

## 2026-11-26 — Global API error no-store

- Tindakan: menambahkan `Cache-Control: no-store` pada global `onError`, sehingga error parse/validasi sebelum route handler dan exception 4xx/5xx tidak disimpan downstream.
- File berubah: `apps/api/src/app.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: review global Elysia `onError`; `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak mengirim HTTP error request atau menjalankan test suite.
- Keputusan teknis: no-store diterapkan hanya pada response error global; successful API responses tidak berubah.
- Risiko/blocker: header pada error parse/validation belum diperiksa lewat HTTP runtime; perilakunya diverifikasi dari hook source dan type/build.
- Rollback: hapus cache header pada onError dan entri ADR-025/Security/Handover; tidak ada rollback database.
- Langkah berikutnya: validasi error header dengan request malformed pada API runtime QA; lanjutkan hanya pekerjaan produk di luar gate bisnis yang belum disetujui.

## 2026-11-26 — API log error type normalization

- Tindakan: mengganti logging `error.name` bebas pada API error/readiness failure menjadi label built-in yang terbatas (`TypeError`, `RangeError`, `SyntaxError`, `Error`, `unknown`); request ID dan Elysia error code tetap dipakai.
- File berubah: `apps/api/src/app.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: review jalur `console.error` di app; `bun run typecheck:api`; `bun run build:api`; `git diff --check`.
- Hasil aktual: typecheck API dan build API lulus; diff check lulus. Tidak memicu runtime error atau menjalankan test suite.
- Keputusan teknis: log memakai label kelas stabil, bukan nama error yang dapat diubah; tidak mencatat message, stack, query, atau payload.
- Risiko/blocker: log output aktual untuk tiap label belum diamati melalui runtime QA; SQL/database failure class yang bukan built-in dinormalisasi sebagai `Error`.
- Rollback: kembalikan `error.name` pada dua lokasi logging dan hapus ADR-026/Security/Handover; tidak ada rollback database.
- Langkah berikutnya: lakukan smoke check sanitasi log dengan error sintetis saat runtime QA tersedia; error detail produk tetap harus melalui handler global.

## 2026-11-26 — Legacy role vocabulary and login readiness boundary

- Tindakan: melakukan audit statis read-only pada helper role, skema Prisma, migrasi role 5/6 dan sebagian pemeriksaan role pada service user di checkout `dompis_v2`; mencatat role keys/ID serta batas bukti. Memperbarui status Phase 2 agar kesiapan kode login dibedakan dari kesiapan akun nyata.
- File berubah: `docs/Legacy-Role-Discovery.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah. Tidak membaca credential/configuration files.
- Command tersanitasi: `rg --files` terbatas ke nama file auth/user/role; `rg -n` pada helper/service/schema source; `sed` pada skema role, helper, dan dokumen Phase 2. Legacy checkout dibaca saja.
- Hasil aktual: source mendokumentasikan ID/key 1 `superadmin`, 2 `admin`, 3 `helpdesk`, 4 `teknisi`, 5 `senior_leader`, dan 6 `admin_branch`; migration history menunjukkan `general_manager` diubah menjadi `senior_leader`. Tidak ada verifikasi live terhadap row role/user atau matriks hak efektif. Tidak menjalankan typecheck/build/test karena perubahan dokumentasi saja.
- Keputusan teknis: tidak menyalin role, permission, user, atau ID ke v3. Login/session code ada, tetapi tidak ada akun yang bisa dipakai karena v3 belum memiliki role/permission/user dan jalur provisioning belum dibangun/disahkan. Tidak membuat default administrator.
- Kendala/risiko: akses login nyata tetap tertahan oleh persetujuan owner atas role/action/global-scope/account-activation mapping dan prosedur provisioning/recovery; inspeksi source tidak mengungkap seluruh hak efektif atau keadaan database legacy aktif.
- Rollback: perubahan dokumentasi saja; revert ketiga file yang disebut di atas untuk menghapus hasil audit ini. Tidak ada rollback database.
- Langkah berikutnya: validasi matriks role dan proses provisioning akun pertama; setelah itu selesaikan endpoint/UI administrasi akun dengan audit dan scope guard, lalu verifikasi login end-to-end menggunakan akun sintetis/terotorisasi.

## 2026-11-26 — Owner-approved target role names

- Tindakan: memperbarui dokumentasi role target sesuai keputusan pemilik: `admin` menjadi `team_leader`, `admin_branch` menjadi `officer`; `superadmin`, `helpdesk`, `teknisi`, dan `senior_leader` tetap. Riwayat role source legacy dipertahankan sebagai evidence dan ditautkan ke nama target.
- File berubah: `docs/Database.md`, `docs/schema-proposed.sql`, `docs/PRD.md`, `docs/Phase-0D-Design-Readiness.md`, `docs/Legacy-Role-Discovery.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah; tidak ada migration atau runtime role seed.
- Command tersanitasi: `rg -n -i` atas dokumentasi untuk seluruh nama/alias role; `git diff --check`.
- Hasil aktual: dokumentasi target dan candidate role check kini memakai enam nama yang disetujui. Role lama hanya disebut dalam konteks source/history atau sebagai nama yang diganti. `git diff --check` lulus; typecheck/build/test tidak dijalankan karena perubahan dokumentasi saja.
- Keputusan teknis: persetujuan mencakup nama role saja. Legacy ID, capability, scope/global access, account activation, serta hak efektif tidak diwariskan otomatis. `teknisi` tetap nama role; assignment teknisi tetap di luar scope produk.
- Kendala/risiko: migration/schema runtime v3 menggunakan relasi `roles` generik sehingga belum ada enum runtime yang perlu diganti; permission matrix dan jalur provisioning akun masih menunggu validasi. Schema SQL candidate disesuaikan, bukan diaplikasikan ke database.
- Rollback: revert hanya perubahan dokumentasi pada file yang disebut di atas; tidak ada rollback database.
- Langkah berikutnya: validasi capability matrix dan proses provisioning akun awal; setelah disetujui, implementasikan role catalog/grants tanpa mengubah nama atau memberi hak tambahan di luar keputusan.

## 2026-11-26 — Seed owner-approved role catalog

- Tindakan: menambahkan migration Drizzle idempoten yang memasukkan enam code/display name role target dengan `ON CONFLICT (code) DO NOTHING`; menerapkan migration ke database development lokal.
- File berubah: `packages/db/drizzle/0002_seed_owner_approved_role_catalog.sql`, `packages/db/drizzle/meta/_journal.json`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL 18.7 lokal Homebrew `dompis_v3`; current role `pakbreng`; target URI dicek secara tersanitasi sebagai `127.0.0.1:5432/dompis_v3`. Bukan production.
- Command/SQL tersanitasi: periksa URI target tanpa menampilkan credential; SELECT identity dan counts sebelum write; `bun run db:migrate`; SELECT enam role catalog dan counts sesudah write. Percobaan pertama dari sandbox gagal koneksi sebelum DB tersentuh; rerun pada izin akses lokal berhasil.
- Hasil aktual: sebelum migration `roles=0`, `permissions=0`, `role_permissions=0`, `users=0`; sesudahnya enam role aktif dengan code `superadmin`, `team_leader`, `helpdesk`, `teknisi`, `senior_leader`, `officer`; tabel permission/grant/user tetap 0; Drizzle migration ledger berisi 3 entri. `git diff --check` lulus. Tidak menjalankan typecheck, build, atau test karena perubahan SQL/data katalog dan dokumentasi saja.
- Keputusan teknis: role rows tidak membawa capability; tidak ada permission, user, password, atau scope yang dibuat. Conflict berdasarkan unique `code` tidak mengubah row existing. Login tetap tidak dapat dipakai tanpa user account dan kebijakan provisioning.
- Kendala/risiko: `teknisi` terdaftar hanya sebagai nama role; assignment teknisi tetap di luar scope. Akun login nyata masih tertahan oleh capability matrix, role/scope parity, dan prosedur provisioning awal.
- Rollback: pada database disposable, hapus hanya keenam code setelah memastikan tidak ada referensi di `users`/`role_permissions`, lalu hapus migration ledger entry hanya bila rollback migration disengaja dan tercatat. Tidak melakukan rollback pada database production tanpa runbook/backup.
- Langkah berikutnya: minta persetujuan capability matrix dan alur pembuatan akun pertama; sesudah disahkan, buat akun melalui endpoint/admin flow ber-audit dengan password hashing dan scope terverifikasi, lalu lakukan end-to-end login QA.

## 2026-11-26 — Guarded local first-user bootstrap

- Tindakan: menambahkan perintah satu kali `bun run auth:bootstrap` untuk membuat akun pertama di database development lokal. Perintah memeriksa target loopback PG18 `dompis_v3`, menolak bila user/permission/role grant/bootstrap audit sudah ada, meminta salah satu role eksplisit, menyembunyikan password, memakai Argon2id, dan menulis user + audit event dalam satu transaksi. Akun tidak memperoleh scope, global access, atau permission.
- File berubah: `scripts/bootstrap-first-user.ts`, `package.json`, `docs/Getting-Started.md`, `docs/Security.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada koneksi atau perubahan database dalam pekerjaan ini. Command hanya typechecked dan belum dijalankan; tidak ada user/password dibuat.
- Command tersanitasi: Context7 lookup Bun SQL `begin`/parameterized templates dan Drizzle 0.45.4; `bunx tsc --noEmit --strict --target ESNext --module Preserve --moduleResolution bundler --types bun --skipLibCheck scripts/bootstrap-first-user.ts`; `bun build scripts/bootstrap-first-user.ts --target bun`; `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil aktual: strict TypeScript check script lulus setelah memberi tipe eksplisit untuk hasil query; bundle CLI berhasil. Workspace typecheck lulus (Svelte 0 error/0 warning; API dan worker TS lulus); workspace build web/API lulus; diff check lulus. Build web mencetak warning `NO_COLOR` dan `FORCE_COLOR` bersamaan. Percobaan typecheck script pertama gagal karena implicit-any dari Bun SQL default type, diperbaiki dengan tipe row yang sempit. Tidak menjalankan `auth:bootstrap`; tidak menjalankan test suite.
- Keputusan teknis: bootstrap hanya membuat identity zero-capability untuk membuka QA login lokal. Role `superadmin` pun tidak mendapat permission/global access otomatis. ID user dibuat oleh native `uuidv7()` default; audit menyimpan role code dan request ID tanpa password/hash/username.
- Risiko/kendala: terminal hidden-input dan transaksi belum diuji secara interaktif/runtime; konfigurasi `APP_ORIGIN` dan proxy browser tetap harus berjalan untuk login. User pertama yang dibuat tidak dapat membaca product data sampai capability/scope grants disetujui dan diberikan lewat proses ber-audit.
- Rollback: hapus command package, script dan perubahan dokumentasi; tidak ada perubahan DB. Jika operator menjalankan bootstrap kemudian perlu membatalkan, periksa sesi dan audit reference sebelum hapus user; jangan hapus row role catalog.
- Langkah berikutnya: jalankan perintah hanya saat pemilik siap memilih role dan membuat password lokal; verifikasi login/logout menggunakan akun itu, lalu lanjutkan user-management API setelah capability matrix disetujui.

## 2026-11-26 — Bootstrap credential boundary hardening

- Tindakan: mengubah bootstrap CLI agar hanya membaca `DATABASE_URL` dan tidak memakai `MIGRATION_DATABASE_URL` sebagai fallback; memperjelas batas ini pada instruksi setup/security.
- File berubah: `scripts/bootstrap-first-user.ts`, `docs/Getting-Started.md`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada koneksi atau perubahan database.
- Command tersanitasi: perbandingan credential selection di script; strict TypeScript check bootstrap; `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil aktual: script dan workspace typecheck lulus; web/API build lulus; diff check lulus. Warning lingkungan build `NO_COLOR`/`FORCE_COLOR` tetap muncul. Tidak menjalankan bootstrap atau test suite.
- Keputusan teknis: first-user account creation memakai hanya credential runtime lokal yang dibatasi, bukan credential migrator; target guard dan no-capability invariants tetap berlaku.
- Kendala/risiko: role lokal yang dipakai `DATABASE_URL` harus memiliki privilege minimum untuk lock/read/insert pada tabel bootstrap; bila tidak, command gagal tanpa fallback. Interaksi terminal dan login end-to-end belum dijalankan.
- Rollback: pulihkan pemilihan migrator URL hanya bila ada keputusan keamanan baru dan dokumentasikan; tidak ada DB rollback.
- Langkah berikutnya: review privilege `DATABASE_URL` lokal tanpa mencetak DSN, lalu operator dapat menjalankan bootstrap untuk membuat akun no-access dan QA login; capability matrix tetap owner-gated.

## 2026-11-26 — Expire and revoke rejected sessions

- Tindakan: `/auth/me` kini mengirim cookie sesi kedaluwarsa ketika cookie ada tetapi formatnya malformed atau token tidak lagi memetakan ke sesi aktif (expired/revoked/user-role inactive). Jika token berformat valid tetapi konteks sesi ditolak, route juga mencabut record sesi yang masih hidup sebelum menghapus cookie. Jalur database-unavailable tetap mempertahankan cookie. Logout memakai konstanta atribut expiry yang sama.
- File berubah: `apps/api/src/auth.ts`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil aktual: typecheck workspace lulus (Svelte 0 error/0 warning; API/worker TS lulus); build web/API lulus; diff check lulus. Warning lingkungan build `NO_COLOR`/`FORCE_COLOR` muncul. Tidak menjalankan test suite.
- Keputusan teknis: hanya 401 dari invalid/stale session yang membersihkan cookie; sesi yang masih hidup namun tidak lolos resolusi active identity ikut dicabut. Token malformed tidak dipakai untuk query revocation. 503 saat store tidak tersedia tidak menghapus cookie sehingga outage transient tidak memaksa logout.
- Kendala/risiko: perilaku `Set-Cookie` pada 401 belum diverifikasi lewat request runtime/browser; cookie options ditinjau statis dan compile.
- Rollback: pulihkan cabang `/auth/me` agar hanya mengembalikan 401 dan hapus constant expiry serta catatan ADR/Security/Handover; tidak ada rollback DB.
- Langkah berikutnya: lanjutkan login/session QA dengan akun lokal yang dibuat operator melalui `bun run auth:bootstrap`; akun belum dibuat dan permission matrix masih menahan akses produk.

## 2026-11-26 — Restore current-user label after reload

- Tindakan: menambahkan `username` dan `displayName` milik pengguna dari `loadAuthorizationContext` ke response `/auth/me`; UI login sekarang memulihkan display name pada session check, bukan memakai label generik.
- File berubah: `packages/db/src/authorization.ts`, `apps/api/src/auth.ts`, `apps/web/src/routes/+page.svelte`, `docs/Phase-2-Organization-Auth.md`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil aktual: percobaan typecheck pertama gagal karena `AuthorizationContext` belum memiliki tipe untuk dua field baru; tipe diperbarui, lalu typecheck workspace dan build web/API lulus. Svelte 0 error/0 warning; build memperlihatkan warning `NO_COLOR`/`FORCE_COLOR`; diff check lulus. Tidak menjalankan test suite.
- Keputusan teknis: endpoint mengembalikan hanya identity fields pemilik session yang sudah terverifikasi; tidak ada user ID dari query/body atau akses profile pihak lain.
- Risiko/kendala: DTO `/auth/me` berubah additive; consumer selain login UI harus menerima dua field tambahan. Belum dilakukan request runtime/browser atau test suite.
- Rollback: hapus field username/display name dari DB auth context dan route schema/response, lalu kembalikan label generik UI; tidak ada rollback DB.
- Langkah berikutnya: saat akun bootstrap lokal tersedia, QA login, refresh session, logout, expiry/revocation, dan memastikan status 503 tidak menghapus cookie.

## 2026-11-26 — Honor login throttle countdown

- Tindakan: menyambungkan response header `Retry-After` 429 ke countdown UI; tombol submit dinonaktifkan selama cooldown, timer dibersihkan saat route unmount, dan jika header tidak valid tetap tampil pesan throttle generik. Isi alert dijaga stabil agar pembaca layar tidak mengumumkan ulang angka tiap detik.
- File berubah: `apps/web/src/routes/+page.svelte`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil aktual: Svelte/API/worker typecheck lulus; build web/API lulus; Svelte diagnostics 0 error/0 warning; diff check lulus. Warning `NO_COLOR`/`FORCE_COLOR` muncul pada build. Tidak menjalankan test suite atau HTTP runtime request.
- Keputusan teknis: UI menerima hanya integer detik positif dari server, meng-caps countdown di 900 detik dan tetap mengandalkan server sebagai enforcement final.
- Risiko/kendala: countdown visual belum diverifikasi di browser; setiap tab/session tetap dibatasi oleh API, sedangkan timer hanya membantu UX.
- Rollback: hapus helper/state/countdown dan submit guard serta entri ADR-032; tidak ada rollback DB.
- Langkah berikutnya: runtime QA login/throttle/logout saat akun lokal tersedia; akses produk tetap menunggu permission/scope approval.

## 2026-11-26 — Apply DOMPIS burgundy and navy web palette

- Tindakan: menerapkan palet yang diminta ke halaman login yang saat ini menjadi UI web aktif, termasuk latar dark navy, panel, teks, aksen merah, hover, focus ring, pesan status, warna browser theme, dan favicon. Memperbarui token serta arah visual di Design System.
- File berubah: `apps/web/src/routes/+page.svelte`, `apps/web/src/lib/assets/favicon.svg`, `docs/Design-System.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck`; `bun run build`; `git diff --check`; pencarian warna lama pada UI login dan token dokumentasi.
- Hasil pengujian aktual: `bun run typecheck` lulus (Svelte 0 error/0 warning; API dan worker TypeScript lulus); `bun run build` lulus (web dan API); `git diff --check` lulus. Build menampilkan warning lingkungan bahwa `NO_COLOR` diabaikan saat `FORCE_COLOR` aktif. Tidak menjalankan test suite atau browser QA.
- Keputusan teknis: #101220 canvas, #181A29 surface, #2A2F45 raised/card, #FFFFFF teks utama, #C5CAD3 teks sekunder, #AD0E27 aksi/brand, #750A1C hover/error. Status sukses menggunakan netral kontras dengan label eksplisit, karena palet tidak menyediakan warna sukses terpisah.
- Risiko/kendala: UI web saat ini hanya menyediakan halaman login, jadi halaman produk lain belum ada untuk penerapan tema. Kontras visual belum diperiksa lewat browser/screenshot.
- Rollback: revert perubahan pada empat file yang disebut di atas; tidak ada rollback database.
- Langkah berikutnya: bila halaman produk ditambahkan, gunakan token desain yang sama dan lakukan visual QA desktop/mobile serta pemeriksaan kontras.

## 2026-11-26 — Document light and dark theme requirement

- Tindakan: memperbarui Design System agar aplikasi mendukung mode terang dan gelap menggunakan kombinasi warna yang sama dari pemilik; menambahkan pemetaan token untuk kedua mode dan persyaratan kontrol tema keyboard-accessible, preferensi sistem, persistensi pilihan, serta QA kontras.
- File berubah: `docs/Design-System.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `git diff --check`.
- Hasil pengujian aktual: `git diff --check` lulus; tidak ada perubahan kode sehingga typecheck/build tidak dijalankan.
- Keputusan teknis: tema terang memakai #FFFFFF untuk canvas, #C5CAD3 untuk surface, #101220 untuk teks, #2A2F45 untuk teks sekunder/pemisah, dan pasangan merah #750A1C/#AD0E27 untuk aksen; tema gelap memakai pemetaan yang telah dicatat pada entri palet sebelumnya. Semua nilai berasal dari palet pemilik.
- Risiko/kendala: ini pembaruan requirement dokumentasi; implementasi toggle dan validasi kontras dua mode belum dilakukan.
- Rollback: pulihkan dua file dokumentasi pada perubahan ini; tidak ada rollback database.
- Langkah berikutnya: implementasikan kontrol dan token tema dua mode saat pekerjaan UI shell dimulai, lalu ukur kontras aktual di browser pada kedua mode.

## 2026-11-26 — Phase 2 progress review

- Tindakan: meninjau status repository, `docs/Phase-2-Organization-Auth.md`, test auth HTTP, route auth, global API error handler, dan implementation plan untuk menjawab kesiapan pindah fase.
- File berubah: `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: inspeksi read-only `git status`, source route/test, dan dokumentasi; tidak menjalankan command database.
- Hasil pengujian aktual: tidak menjalankan test suite pada review ini. Dokumentasi fase mencatat integration auth test sebelumnya lulus; hasil lama tidak dianggap sebagai eksekusi baru.
- Keputusan teknis: Phase 2 belum selesai; jangan mulai Phase 3. Discovery menunjukkan fitur user/organization administration, audit workflow, session invalidation akibat perubahan administrasi, serta route list/search/report dan security coverage masih terbuka. Capability matrix tetap menahan pemberian izin fitur produk.
- Risiko/kendala: terdapat discrepancy yang perlu diuji: Security.md menyatakan gangguan database di `/auth/me` menghasilkan 503 dan mempertahankan cookie, sedangkan exception query yang tidak tertangani pada route berpotensi masuk global error handler sebagai 500. Belum mensimulasikan kegagalan dependency dan belum mengubah implementasi.
- Rollback: tidak ada perubahan runtime atau database; bila catatan review keliru, koreksi atau append klarifikasi pada Handover tanpa menghapus riwayat.
- Langkah berikutnya: tambahkan regression test untuk database outage `/auth/me`, pastikan 503 tidak menghapus cookie, lalu perbaiki route jika kegagalan tersebut terbukti. Lanjutkan Phase 2 sesuai dependency owner-approved capability matrix dan kebutuhan audit sebelum mutation API.

## 2026-11-26 — Preserve login session during database outage

- Tindakan: menambahkan regression coverage untuk `/auth/me` ketika session store tidak tersedia dan ketika query gagal walau probe koneksi berhasil; route kini melakukan probe PostgreSQL hanya setelah lookup/revocation melempar error. DB outage menghasilkan 503 `authentication_unavailable` tanpa menghapus cookie; query/application fault saat DB probe sehat tetap dilempar ke global handler sebagai 500.
- File berubah: `apps/api/src/auth.ts`, `apps/api/src/auth.test.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL lokal development `dompis_v3` pada loopback; tidak ada data bisnis dipakai. Test menulis hanya fixture sintetis dalam transaksi rollback.
- Command tersanitasi: `bun --env-file=.env test apps/api/src/auth.test.ts`; `bun run typecheck`; `bun run build`; `git diff --check`. Percobaan test pertama dari sandbox ditolak koneksinya; `pg_isready` memastikan server menerima koneksi, lalu test dijalankan dengan izin lokal yang disetujui. Red test mereproduksi 500 sebelum fix.
- Hasil pengujian aktual: auth integration lulus 1 test / 38 expectations; workspace typecheck lulus (Svelte 0 error/0 warning, API dan worker lulus); build web/API lulus; diff check lulus. Build menampilkan warning lingkungan `NO_COLOR` diabaikan ketika `FORCE_COLOR` aktif. Seluruh fixture rollback; tidak ada akun nyata dibuat.
- Keputusan teknis: klasifikasikan outage dengan probe `pingDatabase` hanya setelah operasi auth gagal; jika probe sehat, exception asli tetap menjadi 500 dan tidak disamarkan sebagai outage. Log outage memuat event tetap dan request ID saja.
- Risiko/kendala: outage response path dibuktikan memakai DB sintetis yang gagal, bukan dengan mematikan PostgreSQL aktif. Browser login end-to-end dan penggunaan akun operator tetap belum dilakukan.
- Rollback: revert perubahan route/test dan hapus ADR-033 serta pembaruan dokumentasi fase/handover; tidak ada migrasi atau rollback DB.
- Langkah berikutnya: lanjutkan Phase 2 dengan audit event/workflow sebelum mutation administrasi; login end-to-end masih menunggu bootstrap akun yang dipilih operator dan verifikasi di browser.

## 2026-11-26 — Add transaction-aware audit writer

- Tindakan: menambahkan `appendAuditEvent` pada paket DB, menerima database/transaction handle dari caller, mewajibkan actor/action/target/request ID, dan membatasi metadata ke nilai scalar. Menambahkan integration test yang membaca event di transaksi lalu memastikan fixture tidak tersisa setelah rollback. Tidak menambah schema, migration, atau hak akses.
- File berubah: `packages/db/src/audit.ts`, `packages/db/src/audit.test.ts`, `packages/db/src/index.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Security.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL lokal development `dompis_v3` pada loopback; satu event sintetis, transaksi di-rollback. Tidak ada data bisnis atau akun nyata.
- Command tersanitasi: `bun --env-file=.env test packages/db/src/audit.test.ts`; `bun run typecheck`; `bun run build`; `git diff --check`. Test DB pertama ditolak sandbox; setelah retry dengan izin koneksi lokal, test berhasil.
- Hasil pengujian aktual: audit integration lulus 1 test / 2 expectations; workspace typecheck lulus (Svelte 0 error/0 warning; API dan worker lulus); web/API build lulus; diff check lulus. Build menampilkan warning lingkungan `NO_COLOR` diabaikan saat `FORCE_COLOR` aktif.
- Keputusan teknis: audit ditulis melalui transaction handle yang sama dengan state change oleh caller; metadata hanya scalar dan tetap harus mengikuti allowlist tindakan. Helper bukan penegakan immutability database, tidak menyediakan reader, dan tidak mengubah bootstrap SQL yang telah ada.
- Risiko/kendala: event taxonomy, allowlist tiap operasi, read authorization, retention, dan admin mutation workflows belum didefinisikan/diimplementasikan. Capability matrix masih belum disetujui.
- Rollback: hapus helper, export, test, dan catatan ADR/perubahan dokumentasi; tidak ada rollback database.
- Langkah berikutnya: tetapkan kontrak metadata untuk operasi admin yang akan dibangun setelah capability matrix disetujui, lalu gunakan helper dalam transaksi mutasi dan uji audit + state rollback sebagai satu unit.

## 2026-11-26 — Verify login UI in a local browser

- Tindakan: menjalankan API dan SvelteKit pada port loopback sementara; membuka UI dengan agent-browser; membuat akun helpdesk sintetis ber-Argon2id hanya setelah memvalidasi identitas PG18 lokal; menguji submit login, pemulihan nama sesi setelah reload, dan logout; menghapus sesi serta akun dengan predicate ID + username di `finally`. Browser test awal menemukan proxy ke API yang tidak hidup; server QA dipindah ke port terisolasi. Selector snapshot juga dikoreksi berdasarkan format ref browser aktual.
- File berubah: `docs/Phase-2-Organization-Auth.md`, `docs/Handover.md`. Runner QA sementara disimpan di `/private/tmp/dompis-login-browser-qa.ts`; tidak ditambahkan ke repository dan tidak ada dependency proyek baru.
- Database target: PostgreSQL 18.7 lokal development `dompis_v3` di `127.0.0.1:5432`. Tepat 1 akun sintetis dibuat, dipastikan tanpa role permission dan tanpa user scope, lalu 1 akun dihapus beserta seluruh sesi berdasarkan `user_id`; tidak ada data bisnis diakses atau diubah.
- Command tersanitasi: jalankan API `APP_ORIGIN=http://localhost:5174 API_PORT=41001 bun run dev:api`; jalankan SvelteKit `API_PORT=41001 bun run --cwd apps/web dev --host 127.0.0.1 --port 5174`; `bun --env-file=.env /private/tmp/dompis-login-browser-qa.ts`; `git diff --check`.
- Hasil pengujian aktual: browser E2E lulus pada login, session restore setelah reload, dan logout; runner mencetak `temporaryAccount: removed_in_finally`. Server API dan web dihentikan setelah QA. Test tidak membuka akses produk, tidak memberi permission/scope, dan tidak menggunakan akun operator.
- Keputusan teknis: gunakan akun sintetis temporer karena DB fixture dalam transaksi tidak terlihat oleh proses API lain; role yang dipilih harus aktif dan tanpa role_permissions. Password acak hanya berada di memori runner dan dikirim ke form browser, tidak dicetak atau disimpan ke repo.
- Risiko/kendala: browser E2E belum memverifikasi pembuatan akun awal interaktif melalui bootstrap CLI maupun permissioned product access. Chrome melaporkan request `/favicon.ico` 404 meski halaman login dan icon bundle termuat; perlu ditinjau terpisah bila icon browser tampak hilang.
- Rollback: QA server telah dihentikan; akun dan sesi dihapus. Tidak ada migrasi. Hapus runner `/private/tmp/dompis-login-browser-qa.ts` bila file sementara tidak lagi diperlukan.
- Langkah berikutnya: teruskan Phase 2 pada event catalog dan alur user/organization yang diaudit setelah capability matrix tervalidasi; login operator nyata tetap menunggu provisioning lokal oleh pemilik.

## 2026-11-26 — Verify generic invalid-credential UX

- Tindakan: memperluas browser QA login dengan satu percobaan password salah sebelum percobaan valid; memastikan pesan yang ditampilkan tetap generik, lalu menguji login, pemulihan sesi setelah reload, dan logout. Runner membuat akun sintetis zero-permission/zero-scope sementara dan menghapus akun serta sesi pada `finally`.
- File berubah: `docs/Phase-2-Organization-Auth.md`, `docs/Handover.md`. Runner sementara `/private/tmp/dompis-login-browser-qa.ts` tidak masuk repository.
- Database target: PostgreSQL 18.7 lokal `dompis_v3` pada loopback; satu akun sintetis dibuat dan satu dihapus bersama sesi. Tidak ada data bisnis atau akun operator digunakan.
- Command tersanitasi: API loopback port 41001, SvelteKit loopback port 5174, `bun --env-file=.env /private/tmp/dompis-login-browser-qa.ts`, lalu server dihentikan.
- Hasil pengujian aktual: browser QA lulus untuk pesan `Username atau password tidak sesuai.`, login valid setelah satu kegagalan, session restore, dan logout. Runner melaporkan akun dihapus pada cleanup. Tidak ada source behavior yang perlu diubah; `git diff --check` lulus.
- Keputusan teknis: kredensial salah menggunakan satu attempt sintetis per akun baru sehingga tidak memicu throttling; pesan UI tidak membedakan username yang tidak ada dari password yang salah.
- Risiko/kendala: bootstrap CLI interaktif dan akun operator nyata belum diuji. Request browser `/favicon.ico` 404 tetap observasi terpisah.
- Rollback: tidak ada code/database state tersisa; API dan web QA server dihentikan. Tidak ada schema change.
- Langkah berikutnya: lanjutkan audit/admin Phase 2 setelah capability matrix disetujui; untuk login, sisa verifikasi adalah bootstrap operator dan policy akses produk.

## 2026-11-26 — Extract legacy authorization evidence for owner review

- Tindakan: membaca secara statis dan read-only guard role, menu, user management, role assignment, area mutation, audit access, login redirects, dan scope helper pada checkout legacy; menyusun capability candidates untuk menu v3 dan daftar kontradiksi/keputusan owner. Tidak menyalin implementasi lama.
- File berubah: `docs/Authorization-Capability-Discovery.md`, `docs/Legacy-Role-Discovery.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses. Hanya source checkout lama dibaca; tidak ada file legacy diubah.
- Command tersanitasi: `rg` dan `sed` hanya pada `app/` serta `prisma/migrations/` legacy yang relevan; tidak membaca config/credential, record database, atau payload pelanggan. `git diff --check`.
- Hasil pengujian aktual: review statis; tidak ada code/test/database mutation. `git diff --check` lulus.
- Keputusan teknis: role names yang disetujui tidak menyetujui capabilities. Jangan menyalin inheritance `senior_leader`/`admin_branch`, role ID, menu visibility, password reset legacy, atau assignment role. Tetap deny-by-default; semua candidate role/capability cell dan global scope belum disetujui.
- Risiko/kendala: guard legacy saling berbeda (strict dan inherited), user-management checks terpisah dan role assignment helper terlalu permisif untuk sebagian target. Bukti static source tidak menggantikan effective user-scope parity dari migration snapshot; capability/global/account activation tetap owner-gated.
- Rollback: pulihkan empat file dokumentasi yang berubah; tidak ada rollback runtime/database.
- Langkah berikutnya: pemilik meninjau `Authorization-Capability-Discovery.md`; setelah role/action/global-scope dan account-management rules disetujui, implementasikan audited admin workflows, lalu verifikasi deny-by-default dan per-user effective-scope parity. Fitur produk lain dapat berlanjut hanya pada capability yang telah disahkan.

## 2026-11-26 — Add accessible theme toggle to login

- Tindakan: menambahkan tombol tema terang/gelap yang dapat digunakan dengan keyboard, menyimpan pilihan eksplisit pada `localStorage`, memakai preferensi sistem saat belum ada pilihan, memperbarui `color-scheme`/warna browser, dan memastikan tema tetap dapat diganti bila browser memblokir storage. Semua teks UI login kini memakai token foreground agar kontras mengikuti mode aktif. Dokumentasi membatasi klaim implementasi ke halaman login.
- File berubah: `apps/web/src/routes/+page.svelte`, `docs/Design-System.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil pengujian aktual: typecheck workspace lulus (Svelte 0 error/0 warning, API dan worker TypeScript lulus); build web dan API lulus; `git diff --check` lulus. QA browser lokal mengonfirmasi tombol berganti ke mode terang, atribut `color-scheme` dan warna latar berubah, pilihan `localStorage` bernilai `light`, serta label mode tetap terang setelah reload. Build mencetak warning lingkungan `NO_COLOR` diabaikan saat `FORCE_COLOR` aktif. Tidak menguji login karena API auth tidak dijalankan. Browser mencatat `/favicon.ico` 404 dan proxy `/auth/me` gagal tersambung; keduanya tidak menghalangi pemeriksaan toggle.
- Keputusan teknis: pilihan disimpan per browser dan perangkat; preferensi sistem hanya menjadi nilai awal, tombol membuat pilihan eksplisit. Bila storage tidak tersedia, tema tetap berfungsi selama halaman terbuka.
- Risiko/kendala: pilihan tema baru diterapkan setelah hydration sehingga mode terang dapat mengalami kilatan dark saat initial render. QA memastikan aksesibilitas semantik dan interaksi, tetapi belum mengukur rasio kontras atau memeriksa tampilan desktop/mobile secara visual. Tema halaman produk belum ada karena shell produk belum dibangun. `/favicon.ico` 404 masih menjadi masalah terpisah.
- Rollback: revert perubahan tema pada `+page.svelte` dan catatan Design System/Handover; tidak ada rollback database.
- Langkah berikutnya: lakukan visual/keyboard QA tema pada login; ketika app shell dibuat, pindahkan token dan preferensi tema ke shell bersama agar seluruh menu mengikuti pilihan yang sama. Phase 2 authorization tetap menunggu persetujuan capability matrix sebelum grants/admin API.

## 2026-11-26 — Serve the conventional favicon path

- Tindakan: menambahkan `apps/web/static/favicon.ico`, ikon 32×32 RGBA bergaya mark DOMPIS, agar permintaan konvensional browser tidak lagi jatuh ke 404. Favicon SVG yang ditautkan di layout tetap menjadi sumber ikon scalable.
- File berubah: `apps/web/static/favicon.ico`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `file apps/web/static/favicon.ico`; `curl -sS -I http://127.0.0.1:4173/favicon.ico`; `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil pengujian aktual: file dikenali sebagai ICO 32×32 32-bit; dev server mengembalikan HTTP 200 dan `Content-Type: image/x-icon`; workspace typecheck lulus (Svelte 0 error/0 warning; API/worker lulus); build web/API lulus; diff check lulus. Build mencetak warning lingkungan `NO_COLOR`/`FORCE_COLOR`.
- Keputusan teknis: aset statis tanpa route server atau dependency baru, sehingga kompatibel dengan adapter static.
- Risiko/kendala: ikon diuji pada format dan HTTP response, belum melalui pemeriksaan visual lintas browser.
- Rollback: hapus `apps/web/static/favicon.ico` dan entri handover ini; tidak ada rollback database.
- Langkah berikutnya: lanjutkan Phase 2 pada pekerjaan yang tidak membutuhkan capability bisnis; user/org mutation dan pemberian izin tetap menunggu persetujuan owner.

## 2026-11-26 — Prepare precise authorization approval worksheet

- Tindakan: merapikan quality gate Phase 2 menjadi lembar keputusan yang dapat diisi: role yang diberi tiap capability, pemegang/pemberi global scope, operasi administrasi user, aturan self-change/last-admin, pembaca/metadata/retensi audit, serta aktivasi dan crosswalk user migrasi. Omitted role tetap deny; tidak menyalin keputusan dari guard legacy.
- File berubah: `docs/Authorization-Capability-Discovery.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: inspeksi read-only dokumen authorization/scope/phase; `git diff --check`.
- Hasil pengujian aktual: pemeriksaan dokumentasi saja; `git diff --check` lulus. Tidak ada code test atau database query.
- Keputusan teknis: worksheet tidak mengisi rekomendasi grant yang akan disalahartikan sebagai keputusan bisnis. Seluruh operasi terlindungi tetap deny-by-default sampai jawaban owner dicatat.
- Risiko/kendala: endpoint produk/admin yang memerlukan capability tetap tertahan; bukti legacy tidak menyelesaikan kebutuhan role baru atau hak efektif.
- Rollback: pulihkan hanya penambahan worksheet dan catatan handover ini; tidak ada rollback runtime/database.
- Langkah berikutnya: minta owner mengisi worksheet bagian A–C. Setelah ada persetujuan, turunkan keputusan ke seed permission, audit allowlists, endpoint admin, dan uji deny/scope/revocation sesuai scope yang disetujui.

## 2026-11-26 — Restore saved theme before first paint

- Tindakan: menambahkan `theme-init.js` statis yang membaca pilihan tersimpan atau preferensi OS, lalu mengatur atribut tema sebelum parser memproses stylesheet. Script dipasang sebelum `%sveltekit.head%` agar mengurangi kilatan tema yang salah; pemulihan setelah hydration tetap menyelaraskan state tombol dan warna browser.
- File berubah: `apps/web/src/app.html`, `apps/web/static/theme-init.js`, `docs/Design-System.md`, `docs/Handover.md`.
- Database target: tidak ada database yang diakses atau diubah.
- Command tersanitasi: `bun run typecheck`; `bun run build`; `git diff --check`; browser QA pada `http://127.0.0.1:4173/` dengan prefensi sintetik `light`, reload, pemeriksaan `data-theme`, `color-scheme`, latar, dan urutan script/style di head.
- Hasil pengujian aktual: typecheck workspace lulus (Svelte 0 error/0 warning, API dan worker lulus); build web/API lulus; browser mendapati `theme-init.js` sebelum style, `data-theme=light`, `color-scheme=light`, latar putih setelah reload; diff check lulus. API auth tidak dijalankan, sehingga request `/auth/me` mencatat koneksi ditolak pada server proxy selama QA; login tidak diuji. Build mencetak warning environment `NO_COLOR`/`FORCE_COLOR`.
- Keputusan teknis: gunakan aset eksternal same-origin, bukan inline script, sehingga mengikuti CSP `script-src 'self'` yang direncanakan dan tidak memerlukan nonce/hash inline.
- Risiko/kendala: belum diukur secara visual kecepatan first paint dan belum diuji saat storage diblokir atau perubahan preferensi OS setelah halaman terbuka. Browser automation memverifikasi urutan DOM dan state akhir, bukan rekaman frame awal.
- Rollback: hapus script statis dan tag `script` dari app template, lalu pulihkan catatan Design System/Handover; tidak ada rollback database.
- Langkah berikutnya: lanjutkan verifikasi login/bootstrap dan authorization; keputusan capability role, global scope, dan admin workflows masih menunggu jawaban owner.

## 2026-11-26 — Implement scoped ticket list and keyset pagination

- Tindakan: menambahkan `GET /tickets` yang dilindungi guard `tickets.read`, dengan limit default 50/maksimum 100; exact incident/service-number search; exact status dan stored-bucket filter; canonical lifecycle; serta filter ID organisasi yang hanya mempersempit hasil. Query Drizzle memakai `ticketAccessPredicate` dan explicit hierarchy joins dalam satu statement, tidak mengembalikan nomor service/summary/detail dan tidak meminta total count. Cursor HMAC terikat ke user, permission set, global scope, scope version, dan filter; sort `reported_at DESC NULLS LAST, id DESC` mempertahankan timestamp PostgreSQL hingga mikrodetik untuk pagination, termasuk tanggal null di bagian akhir. Menambahkan uji regresi dengan beberapa halaman dan cursor tamper/filter mismatch.
- File berubah: `apps/api/src/tickets.ts`, `apps/api/src/ticket-cursor.ts`, `apps/api/src/ticket-cursor.test.ts`, `apps/api/src/auth.test.ts`, `packages/db/src/tickets.ts`, `packages/db/src/index.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL lokal development `dompis_v3` loopback, hanya integration-test fixture sintetis. Tidak ada data bisnis atau migration/schema changes.
- Command tersanitasi: `bun --env-file=.env test apps/api/src/auth.test.ts`; `bun --env-file=.env test apps/api/src/ticket-cursor.test.ts`; `bun --env-file=.env test packages/db/src/authorization.test.ts`; `bun run typecheck`; `bun run build`; `git diff --check`.
- Hasil pengujian aktual: auth/ticket integration lulus 1 test / 61 expectations; semua fixture (1 role, permission, grant, user, hierarchy, 2 workzone, 1 scope, 4 ticket, dan sesi QA) ada dalam transaksi rollback. Cursor unit lulus 2 tests / 10 expectations. Authorization integration lulus 1 test / 9 expectations. Workspace typecheck lulus (Svelte 0 error/0 warning; API/worker TS lulus); build web/API lulus; diff check lulus. Test auth pertama ditolak koneksi sandbox, lalu lulus saat dijalankan dengan akses PostgreSQL loopback yang disetujui. Build memberi warning environment `NO_COLOR`/`FORCE_COLOR`.
- Keputusan teknis: filter list tidak menerjemahkan status menjadi lifecycle, tidak menghitung SLA/TTR, tidak menggunakan fuzzy search, dan tidak menambah index. Unknown/null reported date tetap dapat dijangkau lewat pagination. Key HMAC dibuat acak saat API route factory dibuat; restart menggugurkan cursor lama dan beberapa replica belum dapat berbagi cursor.
- Risiko/kendala: permission `tickets.read` masih candidate dan tidak diberi ke role mana pun; route akan 403 sampai grant owner-approved. Belum menjalankan `EXPLAIN` atau benchmark terhadap dataset besar karena tabel bisnis lokal kosong. Cursor perlu secret bersama bila API direplikasi. Department/jenis/flag filters dan reports/export/SSE tidak termasuk endpoint list ini.
- Rollback: revert route/cursor files dan perubahan repository DB serta dokumentasi yang tercantum; tidak ada DB rollback karena seluruh data sintetis di-rollback dan tidak ada migration.
- Langkah berikutnya: selesaikan review/approval matrix owner untuk `tickets.read` dan operasional user/admin. Tanpa approval, role grants dan admin mutations tetap ditahan; bagian Phase 2 lain dapat dilanjutkan hanya pada capability/kontrak yang disahkan.

## 2026-11-26 — Verify list/detail deny-by-default responses

- Tindakan: menambah synthetic authenticated user/session tanpa role permission, lalu membuktikan `GET /tickets` dan exact detail menolak akses dengan 403 serta `private, no-store`; request tanpa sesi ke list menghasilkan 401. Sesi, user, role, dan seluruh fixture berada dalam transaksi rollback yang sama.
- File berubah: `apps/api/src/auth.test.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL development lokal `dompis_v3` loopback; fixture sintetis saja, tidak ada data bisnis atau perubahan permanen.
- Command tersanitasi: `bun run typecheck:api`; `bun --env-file=.env test apps/api/src/auth.test.ts`; `git diff --check`.
- Hasil pengujian aktual: API typecheck lulus; integration test lulus 1 test / 66 expectations; diff check lulus. Test menggunakan sesi autentikasi palsu tanpa permission, bukan password login, dan semua row di-rollback.
- Keputusan teknis: proteksi diuji pada endpoint Ticket Management aktual, selain macro generik. Authorization guard memeriksa capability sebelum handler melakukan query ticket.
- Risiko/kendala: ini membuktikan boundary untuk `tickets.read`, tetapi tidak menguji endpoint admin/report yang belum dibuat. Tidak memberikan permission kepada role katalog.
- Rollback: hapus tambahan fixture/assertion test dan catatan verifikasi; tidak ada rollback DB.
- Langkah berikutnya: Phase 2 tetap menunggu keputusan owner pada role/capability, global scope, hak user-admin, audit visibility/retention, dan aktivasi account migration sebelum menyelesaikan API mutasi atau membuat grants.

## 2026-11-26 — Verify concurrent login throttling

- Tindakan: menambahkan 20 request login invalid serentak melalui instance limiter baru pada route auth. Hasil menguji reservasi `inFlight` sebelum query/hash dan membuktikan throttle tidak dapat dilewati dengan konkurensi. Seluruh user/sesi/role fixture tetap dalam transaksi rollback; tidak memakai credential real.
- File berubah: `apps/api/src/auth.test.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL development lokal `dompis_v3` loopback; hanya test fixtures sintetis rollback-only.
- Command tersanitasi: `bun run typecheck:api`; `bun --env-file=.env test apps/api/src/auth.test.ts`; `git diff --check`.
- Hasil pengujian aktual: API typecheck lulus; integration test lulus 1 test / 68 expectations, termasuk 10 response 401 dan tepat 10 response 429 dari 20 request bersamaan; diff check lulus. Test menggunakan password salah sintetis.
- Keputusan teknis: limiter tetap membatasi per proses dan mempertahankan batas akun/IP; pengujian baru memvalidasi in-flight reservation dalam satu proses, bukan koordinasi lintas replica.
- Risiko/kendala: saat horizontal scaling, limiter in-memory tidak memberi kuota bersama antar process; distribusi limiter belum ditambahkan karena arsitektur tidak menyetujui infra tambahan tanpa ADR.
- Rollback: hapus request concurrency dan assertion tambahan serta catatan dokumentasi; tidak ada rollback database.
- Langkah berikutnya: implementasi mutasi user/organisasi dan role grants menunggu owner mengisi matriks capability serta keputusan global scope, admin operations, audit visibility/retention, dan account activation pada worksheet authorization.

## 2026-11-26 — Continue Phase 2 with role grants deferred

- Tindakan: menerima arahan owner untuk melanjutkan pekerjaan Phase 2 sementara keputusan role ditunda; memeriksa kembali worksheet dan menguji concurrency login throttle dengan 20 percobaan sintetis serentak. Tidak mengisi matrix atau menerapkan grants.
- File berubah: `apps/api/src/auth.test.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md`, `docs/Handover.md`.
- Database target: PostgreSQL development lokal `dompis_v3` loopback; fixture autentikasi sintetis dalam transaksi rollback. Tidak ada data bisnis atau write permanen.
- Command tersanitasi: inspeksi read-only worksheet/fase; `bun run typecheck:api`; `bun --env-file=.env test apps/api/src/auth.test.ts`; `git diff --check`.
- Hasil pengujian aktual: API typecheck lulus; auth integration lulus 1 test / 68 expectations; 20 request serentak menghasilkan tepat 10 percobaan verifikasi dan 10 throttle 429; diff check lulus. Seluruh fixture rollback.
- Keputusan teknis: penundaan role berarti tidak ada capability atau global scope yang diasumsikan. Endpoint/list permission tetap 403 bagi semua akun tanpa grant.
- Risiko/kendala: Phase 2 tidak dapat mencapai acceptance untuk user/organization administration, audit read, scope/global grant, atau aktivasi role sampai policy tiap tindakan disahkan. Dokumentasi saat ini secara eksplisit melarang membuka mutation API sebelum jawaban yang relevan disetujui.
- Rollback: hapus concurrency test dan catatan ini; tidak ada perubahan schema atau data.
- Langkah berikutnya: lanjutkan hanya pekerjaan auth/read-only yang tidak memerlukan capability/admin-policy yang belum disetujui. Untuk menyelesaikan acceptance Phase 2, owner harus mengisi keputusan bagian A–C di `Authorization-Capability-Discovery.md`; menunda nama/assignment role tidak memberi wewenang admin secara implisit.

## 2026-11-26 — Owner approval: superadmin and user management policy

- Phase: Phase 2 — Organization and Authorization Foundation (policy/discovery slice; phase remains in progress).
- Tindakan: memeriksa secara statis dan read-only layar serta endpoint user management `dompis_v2`; mencatat fitur legacy, ketidakkonsistenan guard, hard-delete, dan reset password yang tidak aman. Mencatat keputusan owner: superadmin mengontrol aplikasi; User Management hanya superadmin untuk tambah, hapus/nonaktifkan, dan atur scope user; officer/team_leader/senior_leader satu cohort setara sementara; helpdesk/teknisi ditunda. Memperbarui matriks capability, worksheet approval, ringkasan Phase 2, temuan legacy, dan ADR-036.
- File berubah: `docs/Authorization-Capability-Discovery.md`, `docs/Legacy-Role-Discovery.md`, `docs/Decision-Log.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Handover.md`.
- Database target: tidak ada database diakses; tidak ada query/credential/data pengguna yang dibaca.
- Command tersanitasi: `sed`/`rg` terbatas pada source user-management di `dompis_v2`; `git diff --check` di repository v3.
- Hasil pengujian aktual: validasi dokumentasi dengan `git diff --check` (hasil dicatat setelah command); tidak ada test aplikasi karena hanya dokumentasi berubah.
- Jumlah record terdampak: 0; tidak ada database write, migrasi, grant, akun, atau kode aplikasi berubah.
- Keputusan teknis: full superadmin control ditafsirkan mencakup explicit global data scope; ini ditandai sebagai interpretasi yang perlu direvisi sebelum grant jika bukan maksud owner. Permintaan “hapus” direpresentasikan sebagai deactivate/soft delete pada v3 untuk menjaga FK, atribusi, dan audit; legacy hard delete hanya dicatat sebagai temuan, bukan requirement implementasi. Role/credential changes dan audit retention/metadata masih butuh desain aman.
- Risiko/kendala: capability cohort tengah belum ditentukan; helpdesk/teknisi belum diberi grant; user migration/activation tetap tidak disetujui; superadmin grants belum di-seed. Phase 2 tidak selesai.
- Rollback: revert bagian persetujuan pada empat dokumen keputusan/discovery/phase dan entry ini; tidak ada rollback aplikasi/database.
- Langkah berikutnya: implementasikan grants superadmin dan user administration dengan audit transaksional, batas role/credential aman, scope hierarchical, pencegahan penghapusan superadmin aktif terakhir, dan session invalidation; setelah itu uji integration/UI. Definisikan capability cohort tengah sebelum memberikan akses.

## 2026-11-26 — Prepare superadmin authorization capability migration

- Phase: Phase 2 — Authorization foundation (partial; migration prepared, not applied).
- Tindakan: membuat custom Drizzle data migration untuk katalog 10 permission in-scope dan grant hanya kepada role `superadmin`; setiap insert memakai konflik idempotent. Tidak mengubah account, `global_scope`, scope user, password, atau permission role lain. Memeriksa metadata migrasi, target lokal, dan status katalog sebelum keputusan apply.
- File berubah: `packages/db/drizzle/0003_seed_superadmin_capabilities.sql`, `packages/db/drizzle/meta/_journal.json`, `packages/db/drizzle/meta/0003_snapshot.json`, `docs/Decision-Log.md` (ADR-037), `docs/Phase-2-Organization-Auth.md`, `docs/Handover.md`.
- Database target: preflight psql mengidentifikasi PostgreSQL 18.7 lokal `dompis_v3`, role `pakbreng`; satu role superadmin, nol permission target/grant, nol user. Tidak ada write yang berhasil dilakukan. Target migrator env tersanitasi menunjuk `127.0.0.1:5432/dompis_v3`.
- SQL/command tersanitasi: `bunx drizzle-kit generate --custom --name=seed_superadmin_capabilities --config=packages/db/drizzle.config.ts`; `bun run db:generate`; `psql` SELECT identitas dan hitungan; `bun --env-file=.env packages/db/src/migrate.ts`.
- Hasil pengujian aktual: `bun run db:generate` melaporkan 19 tabel dan “No schema changes”; `bun run typecheck` lulus (Svelte 0 error/0 warning, API dan worker TypeScript); `bun run build` lulus (web static build dan API bundle 0.98 MB); `git diff --check` lulus sebelum catatan akhir. Migrator gagal sebelum query migrasi dengan `ERR_POSTGRES_CONNECTION_REFUSED` ke TCP 127.0.0.1:5432. Query psql pertama berhasil via socket, namun percobaan socket berikutnya ditolak sandbox (`Operation not permitted`). Tidak ada SQL DML/migrasi diterapkan. Test integrasi permission tidak dijalankan karena transport database tidak tersedia.
- Jumlah record terdampak: 0; migrasi menyatakan 10 permission + maksimal 10 grant saat kelak diterapkan.
- Keputusan teknis: permission disiapkan sebagai migrasi idempotent only-superadmin sesuai ADR-036; tidak memberi `global_scope` ke user secara implisit. Role lain tetap tanpa capability. Gunakan transport DB lokal yang sudah diverifikasi sebelum apply dan periksa hitungan sesudahnya.
- Risiko/kendala: fitur masih terkunci karena grant belum diterapkan; jalur TCP migrator dan socket psql tidak konsisten/tersedia di sandbox. Tidak ada akses ke production. User Management API/UI, audit event allowlist, dan session invalidation belum dibuat.
- Rollback: sebelum apply, hapus migration SQL dan entry journal/snapshot. Setelah apply, rollback hanya relasi grant superadmin dan catalog rows yang tidak direferensikan setelah preflight; tidak mengubah user rows.
- Langkah berikutnya: pulihkan konektivitas ke PostgreSQL development lokal, apply migration melalui Drizzle runner, verifikasi tepat 10 permission/10 superadmin grant dan nol grant role lain, lalu lanjut implementasi dan test User Management.

## 2026-11-26 — Apply local superadmin grants and align first-user bootstrap

- Phase: Phase 2 — Authorization foundation (partial; superadmin capabilities and bootstrap path ready locally).
- Tindakan: setelah migrator TCP gagal, menerapkan file migration yang sama via psql local socket dan memasukkan checksum/timestamp migration ledger dalam transaksi `psql -1`; memverifikasi jumlah permission/grant/role/user. Menyesuaikan guarded bootstrap agar hanya membuat akun superadmin pertama, mensyaratkan 10 permission dan 10 grant yang persis disetujui serta nol grant role lain, dan memberikan global scope eksplisit. Tidak mengeksekusi bootstrap.
- File berubah: `scripts/bootstrap-first-user.ts`, `docs/Authorization-Capability-Discovery.md`, `docs/Legacy-Role-Discovery.md`, `docs/Security.md`, `docs/Getting-Started.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md` (execution update ADR-037 dan ADR-038), `docs/Handover.md`.
- Database target: PostgreSQL 18.7 lokal `dompis_v3`, role `pakbreng`, via local socket; bukan production. Environment Bun tersanitasi menunjuk TCP `127.0.0.1:5432`, yang menolak koneksi.
- SQL/command tersanitasi: migration `0003_seed_superadmin_capabilities.sql`; `psql -X -1 -d dompis_v3 -v ON_ERROR_STOP=1 -f <migration> -c <insert Drizzle checkpoint> -c <count verification>`; `bun run db:migrate` gagal sebelum statement; `bun run typecheck`; `bun run build`; strict bootstrap TypeScript check.
- Hasil pengujian aktual: SQL melaporkan INSERT 0 10 permission, INSERT 0 10 grants, INSERT 0 1 ledger row; verifikasi pasca-write menunjukkan 10 permission, 10 grant superadmin, nol grant non-superadmin, nol user. Seluruh migration + ledger berada dalam satu transaksi psql. Standalone strict typecheck script lulus; workspace typecheck lulus (Svelte 0 error/warning, API/worker TS lulus); web/API build lulus; `git diff --check` lulus. Bootstrap dan integration test API tidak dijalankan; perintah bootstrap tidak dipanggil dan tidak ada akun dibuat.
- Jumlah record terdampak: 21 insert lokal (10 permission, 10 role_permissions, 1 migration ledger); nol user, scope, session atau ticket terdampak.
- Keputusan teknis: psql dipakai setelah target/socket dibuktikan dan write disetujui melalui sandbox escalation; checksum SQL cocok dengan SHA-256 migration. Bootstrap harus mengikuti permission catalog yang telah disetujui dan hanya memberi global scope pada superadmin pertama, sesuai ADR-036/038. Normal Bun migrator tetap perlu tes konektivitas sebelum migrasi berikutnya.
- Risiko/kendala: konfigurasi DB API/migrator lewat TCP tidak tersambung walau psql local socket dapat digunakan. User Management API/UI belum diimplementasi; tidak ada account untuk end-to-end test. Middle cohort capability dan helpdesk/teknisi tetap deferred.
- Rollback: migration belum punya efek pada production. Pada database development ini, setelah cek references, rollback secara transaksional hanya sepuluh grant terkait, sepuluh permission codes terkait, dan ledger `created_at=1795711330895`; tidak menghapus role/user. Mengembalikan bootstrap ke zero-access policy memerlukan rollback kode/docs ADR-038; command belum pernah dijalankan.
- Langkah berikutnya: pulihkan jalur PostgreSQL TCP, buat akun superadmin lokal lewat guarded bootstrap hanya bila operator menghendaki, lalu implementasikan User Management API/UI dengan audited create/deactivate/scope mutation, session invalidation dan regression tests. Phase 2 masih belum selesai.
## 2026-11-27 — Implement superadmin User Management vertical slice

- Phase: Phase 2 — Organization and Authorization Foundation (partial; phase remains open).
- Tindakan: menambahkan endpoint superadmin-only untuk daftar/detail user, pembuatan akun, pengaturan ulang scope, dan soft deactivation; menambahkan UI SvelteKit responsif dengan pilihan scope hierarkis, pagination, serta navigasi berdasarkan capability. Mutasi memeriksa Origin + CSRF, mengunci transaksi administrasi user dan memvalidasi ulang aktor superadmin global; perubahan scope menaikkan `scope_version`, mencabut sesi aktif, dan menulis audit dalam transaksi. Scope global hanya untuk superadmin; reauthentication, larangan self-scope-edit/self-deactivation, dan perlindungan superadmin global terakhir diterapkan. Dokumentasi Security, Phase 2, dan ADR-039 diperbarui.
- File berubah: `apps/api/src/auth.ts`, `apps/api/src/app.ts`, `apps/api/src/users.ts`, `apps/api/src/user-security.test.ts`, `apps/api/package.json`, `apps/web/vite.config.ts`, `apps/web/src/routes/+page.svelte`, `apps/web/src/routes/admin/users/+page.svelte`, `docs/Security.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md` (ADR-039), `docs/Handover.md`.
- Database target: tidak ada database diakses pada pekerjaan ini; tidak ada SQL query runtime, migration, atau data write dijalankan. Database development lokal tetap tidak memiliki akun superadmin.
- SQL/command tersanitasi: `bun run typecheck`; `bun run build`; `bun test apps/api/src/user-security.test.ts`; `git diff --check`.
- Hasil pengujian aktual: typecheck workspace lulus (Svelte 0 error/0 warning, API dan worker TypeScript lulus); build web/API lulus (API bundle 1.0 MB); CSRF/Origin unit test lulus (1 test, 5 expectations); diff check lulus. Build mengeluarkan warning environment `NO_COLOR` bersama `FORCE_COLOR`. Tidak ada database-backed API test maupun browser QA.
- Jumlah record terdampak: 0; tidak ada data database yang disentuh.
- Keputusan teknis: role dapat dipilih ketika membuat akun, tetapi existing-role change dan password reset/change belum dibuat. Password awal ditetapkan operator superadmin dengan Argon2id dan harus disampaikan kepada pengguna lewat kanal aman terpisah. Akun awal tidak dibuat otomatis. API adalah otoritas untuk authorization; status UI bukan kontrol keamanan.
- Risiko/kendala: endpoint belum teruji terhadap PostgreSQL lokal karena jalur koneksi Bun sebelumnya menolak koneksi; belum ada user/fixture bootstrap untuk menguji route end-to-end. UI belum diverifikasi di browser. Hak capability officer/team_leader/senior_leader, audit read/retention, serta organization mutation belum selesai. Phase 2 tidak selesai.
- Rollback: revert file kode/UI di daftar perubahan dan ADR-039; tidak perlu rollback database karena tidak ada migration atau write. Jangan hapus `validateMutationSecurity` jika sudah dipakai caller lain.
- Langkah berikutnya: pulihkan transport database API yang terverifikasi untuk menjalankan route integration suite rollback-only; provision superadmin pertama hanya saat operator menjalankan guarded bootstrap; browser QA create/scope/deactivate; lanjut organization mutation dan audit read/retention setelah kontrak tersedia.

## 2026-11-27 — Add PostgreSQL integration coverage for User Management

- Phase: Phase 2 — Organization and Authorization Foundation (partial; phase remains open).
- Tindakan: menambahkan integration test HTTP untuk list, create user berscope area, detail, penggantian scope dengan reauthentication, kenaikan `scope_version`, pencabutan sesi aktif, audit create/scope/deactivate, soft deactivation, dan penolakan self-deactivation. Test membatasi target ke PostgreSQL loopback `dompis_v3` dan membungkus semua fixture dalam transaksi yang sengaja di-rollback. Memperbarui ringkasan Phase 2, urutan pekerjaan berikutnya, dan ADR-040.
- File berubah: `apps/api/src/users.test.ts`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md` (ADR-040), `docs/Handover.md`.
- Database target: PostgreSQL development lokal `dompis_v3` di loopback; tidak mengakses production. Test membuat fixture sintetis hanya dalam satu transaksi rollback.
- SQL/command tersanitasi: `bun --env-file=.env test apps/api/src/users.test.ts`; `bun run typecheck:api`; `git diff --check`. Percobaan test sandbox biasa gagal `ERR_POSTGRES_CONNECTION_REFUSED`; eksekusi ulang dengan akses database lokal yang disetujui berhasil.
- Hasil pengujian aktual: 1 integration test lulus dengan 15 expectations; typecheck API lulus; `git diff --check` lulus. Tidak ada fixture test yang dipertahankan. Total affected records persisten: 0.
- Keputusan teknis: integration fixture menggunakan role catalog `superadmin`/`officer` dan permission grant yang telah disiapkan; data bisnis tidak dibaca atau ditulis permanen. Test tidak membuat akun operator.
- Risiko/kendala: belum ada browser QA untuk User Management. Organization mutation, audit read/API/UI, retention policy, dan capability cohort operasional masih terbuka; Phase 2 belum selesai.
- Rollback: hapus `apps/api/src/users.test.ts`, ADR-040 dan pembaruan fase/handover; tidak memerlukan rollback DB karena transaction test di-rollback.
- Langkah berikutnya: lakukan browser QA dengan sesi superadmin sintetis rollback-only; selanjutnya rancang organization mutation yang menampilkan dampak scope sebelum create/deactivate/reparent, tanpa memperluas akses diam-diam.

## 2026-11-27 — Browser QA for User Management

- Phase: Phase 2 — Organization and Authorization Foundation (partial; phase remains open).
- Tindakan: membaca workflow `agent-browser`, menjalankan API pada port lokal 39871 dan SvelteKit pada 127.0.0.1:5173, lalu membuka aplikasi dengan sesi browser terisolasi. Memverifikasi login superadmin sintetis, link User Management berbasis capability, user list, form create akun `officer` dengan Area scope, penggantian grant menjadi Workzone-only, dan deactivation target user. Menutup sesi/browser dan kedua server. Akun/scope/tree harus committed sementara agar proses browser terpisah dapat melihatnya; semuanya dibersihkan setelah pengujian.
- File berubah: `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md` (ADR-041), `docs/Handover.md`. Tidak ada source aplikasi berubah.
- Database target: PostgreSQL 18 development `dompis_v3`, loopback; readiness API mengembalikan `ready`. Tidak ada production DB atau ticket diakses.
- SQL/command tersanitasi: `API_PORT=39871 bun run dev:api`; `API_PORT=39871 bun run dev:web -- --host 127.0.0.1`; `agent-browser` pada `http://localhost:5173`; cleanup menggunakan predicate exact untuk dua username dan lima UUID master; `psql -X -d dompis_v3` menghitung row QA setelah cleanup.
- Hasil pengujian aktual: login sukses; capability navigation menampilkan “Kelola pengguna”; pembuatan user berscope Area sukses; update menghasilkan Workzone-only scope dan notice sukses; target tercatat inactive sebelum cleanup. Pembersihan aktual: 2 user, 1 scope, 4 audit event QA, 1 workzone, 1 service area, 1 branch, 1 region, 1 area. Verifikasi sesudahnya menunjukkan nol row untuk dua username dan masing-masing lima kode hierarchy QA. Dev servers dihentikan, browser ditutup. Tidak ada permanent DB row QA.
- Keputusan teknis: temporary committed fixtures digunakan karena browser process terpisah tidak dapat melihat transaction fixture yang belum commit. Kredensial dan hierarchy hanya untuk QA lokal; akun tidak dipertahankan. Target DB/environment/version diverifikasi sebelum write dan cleanup.
- Risiko/kendala: Web server awalnya mengarah ke port API default sehingga proxy 502; dimulai ulang dengan `API_PORT=39871`. Browser wait mencari teks notifikasi yang tidak persis sama dan timeout; status akun dikonfirmasi langsung di DB. Belum diuji browser denial untuk role lain, inactive-parent rejection, tema, atau bootstrap operator.
- Rollback: cleanup exact IDs/usernames selesai; audit dan user scope QA dihapus; user dihapus; hierarchy dihapus urutan leaf-to-root. Tidak ada data tiket yang tersentuh.
- Langkah berikutnya: tambahkan browser regression untuk inactive parent/role denial/theme, lalu rancang API/UI Organization Management dengan preview dampak scope yang eksplisit sebelum perubahan yang memperluas atau mencabut akses.

## 2026-11-27 — Fix admin route collision and complete remaining browser regressions

- Phase: Phase 2 — Organization and Authorization Foundation (partial; phase remains open).
- Tindakan: QA menemukan direct `/admin/users` dimakan proxy Vite `/admin` dan merespons JSON 403. Memindahkan endpoint User Management Elysia ke `/api/admin/*`, memperbarui UI fetches dan integration/CSRF tests, mempersempit proxy ke `/api/admin`, serta menyelaraskan Architecture/Getting Started. Browser regression memverifikasi direct page route, login officer dan tidak adanya nav link, API deny 403, inactive-parent option exclusion dan grant rejection, serta light-theme persistence setelah reload. Semua akun/hierarchy sintetis dibersihkan.
- File berubah: `apps/api/src/users.ts`, `apps/api/src/users.test.ts`, `apps/api/src/user-security.test.ts`, `apps/web/src/routes/admin/users/+page.svelte`, `apps/web/vite.config.ts`, `docs/Architecture.md`, `docs/Getting-Started.md`, `docs/Phase-2-Organization-Auth.md`, `docs/Decision-Log.md` (ADR-042), `docs/Handover.md`.
- Database target: PostgreSQL 18.7 development `dompis_v3`, loopback; bukan production. Sebelum cleanup dipastikan tidak ada ticket yang merujuk Workzone QA.
- SQL/command tersanitasi: `bun run typecheck`; `bun run build`; `bun test apps/api/src/user-security.test.ts`; `bun --env-file=.env test apps/api/src/users.test.ts`; `API_PORT=39871 bun run dev:api`; `API_PORT=39871 bun run dev:web -- --host 127.0.0.1`; browser lokal via agent-browser; query post-cleanup `psql -X -d dompis_v3` untuk exact username/code QA.
- Hasil pengujian aktual: typecheck workspace lulus (Svelte 0 error/0 warning, API/worker TS lulus); build web/API lulus (API bundle 1.0 MB; warning environment `NO_COLOR`/`FORCE_COLOR`); CSRF unit 1 test/5 expectations; API integration 1 test/15 expectations; browser membuktikan `/admin/users` dirender SvelteKit, officer UI denial dan API 403, inactive-parent option count 0 + scope update 400 `scope_target_unavailable`, theme `Mode gelap` tetap setelah page reload; `git diff --check` lulus. Cleanup: 2 user, 5 master row; 0 scope, 0 audit, 0 ticket references. Post-cleanup query seluruh enam identifiers memberikan count 0. Browser dan server dihentikan.
- Keputusan teknis: UI namespace `/admin/*` dipisahkan dari API `/api/admin/*` agar proxy development tidak mengambil alih page routes. Access check tetap di Elysia; kontrol UI hanya untuk UX.
- Risiko/kendala: browser regression memakai user/hash sintetis dan temp master, semuanya sudah dihapus. Belum ada organization mutation feature. Audit read/retention, common middle-role capabilities, bootstrap operator, dan laporan tetap terbuka.
- Rollback: revert endpoint paths, UI/test callers, Vite proxy, documentation, dan ADR-042; rollback ini mengembalikan collision direct-route. Tidak perlu DB rollback.
- Langkah berikutnya: mulai Organization Management dengan read/preview contracts dahulu; sebelum create/deactivate/move hierarki, tunjukkan affected users dan kemungkinan scope expansion/revocation, serta tulis mutation + audit + `scope_version` invalidation dalam transaksi.
