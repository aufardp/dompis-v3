# Phase 0A — Legacy Discovery and Database Audit

Tanggal: 2026-11-26. Status: **Phase 0A selesai**. Discovery dilakukan read-only, bukti source/DDL/data agregat dicatat, dan batasan/keputusan fase selanjutnya dipisahkan secara eksplisit. Environment MySQL lokal belum diklasifikasikan dan PostgreSQL lokal tidak tersedia; kedua hal tersebut dicatat sebagai keterbatasan discovery, bukan diasumsikan.

## Ruang lingkup dan sumber

Target project adalah `/Users/pakbreng/Projects/dompis-v3`; blueprint berada di repo target, source legacy di `/Users/pakbreng/Projects/dompis_v2`. Source legacy tidak diubah. Repo legacy: branch `main`, HEAD `e786d6e49d5a35a3302d81c0d8c640c9da3dff9b`, working tree bersih.

Dibaca/ditinjau: blueprint AGENTS/README/PRD/Architecture/Database/schema proposal/Security/Design System/Migration/field mapping/data contract/sync/organization/master migration/quality gates/query & performance standards/implementation plan/decision log/discovery protocol/database access/handover; legacy `AGENTS.md`, `prisma/schema.prisma`, package manifest, dokumentasi SLA/TTR, sync contention, query hot paths, filter consistency, pagination, connection budget, phase 2 dan production rollout; source organisasi, laporan, klasifikasi, sync dan ticket.

## Evidence matrix

| Area | Bukti statis | Status / gap |
|---|---|---|
| Schema ticket | Prisma MySQL; `ticket.incident` unique; PK integer; 84 scalar fields dan mapping rows cocok. DDL aktual MySQL menunjukkan generated columns `operational_bucket`, `kpi_seg`; 36 index entries dan dua unique index-column entries. | Tipe aktual berbeda dari Prisma pada 6 kolom (lihat hasil audit di bawah); `information_schema.TABLE_ROWS` adalah estimasi yang meleset dari count aktual. FK/index-definition audit lengkap dan PostgreSQL target belum tersedia |
| Organisasi | Legacy region → branch → area → service_area; DDL/data aktual telah diperiksa untuk rantai parent dan scope junction | Master 3 region, 16 branch, 131 area, 393 service_area; tidak ditemukan orphan pada parent atau nama SA kosong. Mapping v1.3 tetap membutuhkan parent `area` baru dan keputusan crosswalk |
| User scope | Kolom langsung user region/branch/area + junction user_region/user_branch/user_area/user_sa | Counts aktual tersedia; `user_sa` memiliki null dan duplicate pairs. Effective access semantics/overlap, akun aktif dan privileges masih perlu fixture/owner validation |
| Workzone | Exact join legacy `service_area.nama_sa = ticket.workzone`; nilai telah dibandingkan setelah trim+uppercase (bukan bukti adanya kode resmi) | 391 normalized keys matched unik, 74 tidak match, 0 ambiguous; 1,101,596 ticket rows matched, 7,171 unmatched, 47 blank/null. Hindari menyebut `nama_sa` sebagai kode sampai owner/data dictionary memvalidasi |
| Sync | `/nossa`, `/nossa-closed`; docs menyebut offset pagination, limit 1.000, offset ceiling 5.000, date windows dan rate limits | Belum cocokkan aktual OpenAPI/fixture; live endpoint tidak dipanggil |
| Reports/business | Daily board, Semesta, Rekap WO, WO HI, SLA/TTR dan classification punya aturan di beberapa layanan/config | Semantics tanggal, status, eligibility, precedence, denominator perlu golden fixtures dan owner validation |
| Performance/debt | Banyak worker dan queue, raw payload/ticket_raw/projection, banyak index kandidat, string dates, count/list berulang; dokumentasi lama mencatat contention | Angka historis hanya referensi dokumen, bukan pengukuran audit ini; perlu profil pada restore/target approved |
| Stack | Legacy Next 16/React 19/Prisma 6/MySQL/Node workers. Workspace target sudah berisi scaffold: Bun 1.4.5, Svelte 5.57.3, SvelteKit 3.2.0, Vite 8.3.8, Elysia 1.4.32, Drizzle 0.45.4, TypeScript 6.0.3; DB client memakai Bun.SQL + `drizzle-orm/bun-sql`, UUID default `uuidv7()` | Versi pin terinventaris, tetapi runtime compatibility resmi belum tervalidasi. Tidak ada PG container; konfigurasi Drizzle memiliki fallback placeholder `127.0.0.1:5433/dompis_dev`, bukan bukti target terdaftar |
| Current target schema drift | `packages/db/src/schema.ts` yang sudah ada hanya mendefinisikan region, branch, workzone, users dan user_workzones; ticket menunjuk workzone langsung | Berbeda dari blueprint 5 tingkat Area→Region→Branch→Service Area→Workzone dan scope grants multi-level. Ini temuan pada scaffold yang sudah ada, bukan implementasi Phase 0A; bahas pada design gate sebelum migrasi |

## Target dan hasil audit database aktual

Read-only identity query berhasil terhadap **MySQL lokal** `dompis_db`, host identitas `8944d0a1f47b`, port 3306, versi MySQL 8.0.46, role `root@%`. Nama host dan role tidak memvalidasi klasifikasi environment. Docker metadata mengaitkan instance lokal dengan container `mysql_baru` dan volume `dompis_v2_dompis_mysql_data`; tidak ada label environment/owner, dan port ter-publish ke `0.0.0.0:3306`. Maka target dicatat sebagai **local MySQL, environment belum diklasifikasikan**, bukan disimpulkan dev atau produksi. Query hanya SELECT/metadata, sebagian dibatasi transaction read-only dan `MAX_EXECUTION_TIME=5000`; tidak ada write, DDL, EXPLAIN, atau row payload yang dicetak.

Inventaris nama variable `.env` legacy hanya menemukan `DATABASE_URL`, `DB_HOST`, `DB_NAME`, serta `EXTERNAL_DB_HOST/NAME`; tidak ada `LEGACY_MYSQL_READ_URL` atau variabel PG. Nilai tidak dicetak. Koneksi MySQL berhasil menggunakan konfigurasi lokal tersebut; karena server role adalah root, hasil ini cukup untuk discovery metadata tetapi bukan konfigurasi role least-privilege yang layak bagi proses migrasi.

Tidak ada PostgreSQL target/container terdaftar atau konfigurasi PostgreSQL yang ditemukan; `127.0.0.1:5433/dompis_dev` hanya fallback placeholder. Tidak ada migration atau runtime compatibility test database. Resolusi Context7 `library Bun ...` tidak mengembalikan library ID/docs; karena itu belum ada klaim dukungan versi resmi. Jangan menjalankan migration dengan fallback placeholder.

Probe lokal tambahan: `pg_isready` ke `127.0.0.1:5432` dan `:5433` menghasilkan `no response`; tidak ada PostgreSQL yang menerima koneksi di dua port tersebut. Jadi Phase 0A sudah memeriksa ketersediaan target lokal, tetapi tidak dapat membaca versi/DDL PG. Target remote tidak dicoba karena tidak ada konfigurasi/registry target.

### Ringkasan profil aktual

- `COUNT(*)` ticket: **1,108,814**. Estimasi metadata `TABLE_ROWS` sebelumnya 1,008,964 (kurang 99,850 / sekitar 9.9%); estimasi tabel bukan angka rekonsiliasi.
- Inventaris metadata schema selesai: **53 tabel InnoDB, 700 kolom, 402 index entries dan 29 declared foreign-key column relationships**. `ticket` memiliki 36 index names, dua di antaranya unique; tidak ada declared FK pada `ticket` itself. FK master mencakup branch→region, area→branch, service_area→area, users→region/branch/area/role dan seluruh scope junction ke user/parent. DB juga memuat tabel legacy teknisi/cluster/assignment, raw/projection, snapshot dan outbox; keberadaannya adalah bukti technical debt/source history, bukan kebutuhan runtime baru.
- Ukuran metadata ticket: data 995,098,624 bytes; index 1,598,767,104 bytes. Metadata mencakup seluruh nama index/kolom serta FK yang dideklarasikan; belum mengarsipkan `SHOW CREATE TABLE` penuh, check constraints, generated expressions atau referential actions.
- Profil ticket menunjukkan 28 nilai incident tidak persis `UPPER(TRIM(incident))`. Query global distinct-normalized key melewati batas 5 detik dan timeout, jadi bukan hasil lulus. Pemeriksaan kandidat bounded melalui index menemukan 0 normalized collision pada kandidat yang diperiksa; jangan menganggap itu pengganti rekonsiliasi penuh.
- Rekonsiliasi penuh kemudian selesai dengan keyset pagination `id_ticket > cursor`, batch tetap 10.000, 111 halaman, maksimum query 10 detik: **1,108,814 baris terbaca; 28 noncanonical; 0 blank; 0 duplicate setelah trim + uppercase; 0 incident non-ASCII**. Kunci normalisasi hanya disimpan sementara sebagai SHA-256 digest di memory proses; tidak ada identifier/raw key dicetak atau disimpan. Karena semua nilai incident ternyata ASCII, hasil uppercase JS dan ASCII trim sesuai tujuan normalisasi ini; ini tidak menguji aturan collation untuk kolom lain.
- `ticket` memiliki 84 kolom scalar yang sejalan nama dengan Prisma dan mapping; perbedaan tipe: `reported_date_dt` DATETIME (Prisma timestamp), `classification_flag` VARCHAR(50) (Prisma VARCHAR(20)), `onu_rx` VARCHAR(50) (Prisma VARCHAR(20)), `status_manja` VARCHAR(100) (Prisma VARCHAR(10)), `validation_flagged_at` DATETIME(6) (Prisma timestamp), `ttr_deadline_at` DATETIME (Prisma timestamp).
- Exact master counts: region 3, branch 16, area 131, service_area 393, users 4,098, roles 6; user junction rows: region 25, branch 119, area 404, SA 15,305. Terdapat 187 duplicate `(user_id, sa_id)` pairs; `user_sa` memiliki 2 null `user_id` dan 2 null `sa_id` (overlap antarbaris tidak disimpulkan). User tanpa direct region/branch/area masing-masing 60 (overlap belum ditentukan). Tidak ada duplicate pairs/null pada tiga junction lain. Tidak ditemukan orphan pada master hierarchy, atau normalized duplicate SA names.
- MySQL default collation `utf8mb4_0900_ai_ci`; server timezone UTC, session timezone SYSTEM. `ticket.workzone` vs `service_area.nama_sa` normalized comparison: 391 matched normalized keys, 74 unmatched, 0 ambiguous; 47 rows blank/null. Case/accent behavior harus dipertimbangkan jika target PostgreSQL memakai collation/operator berbeda.
- Semua hasil query agregat/metadata saja; raw incidents, nama workzone, PII dan credential tidak ditampilkan atau disalin ke dokumentasi.

## Technical debt dan koreksi blueprint

1. Jangan menyamakan kesamaan nama Service Area dengan kode Workzone; validasi uniqueness setelah normalisasi serta crosswalk wilayah.
2. Jangan menganggap role/junction/direct FK lama sebagai hak efektif baru; bandingkan effective leaf scopes per user.
3. Jangan membawa pipeline raw/projection/Redis/BullMQ multiworker sebagai runtime baru; tetap gunakan bukti bisnis/source contract saja.
4. Lakukan profiling pada restore/isolated DB. Index dan ukuran batch blueprint adalah kandidat, bukan instruksi untuk diterapkan tanpa plan.
5. TTR/KPI dan klasifikasi legacy berubah lintas dokumen/ADR; tandai kandidat sampai rule dan fixture disetujui.

Legacy helper `getWorkzonesForUser()` statis meng-union turunan dari `user_sa`, `user_area`, `user_branch`, dan `user_region`, deduplicate berdasarkan `nama_sa`, lalu cache satu jam. Daily filter memiliki bypass superadmin dan opsi `globalScope` untuk role admin tertentu; branch filter membatasi berdasarkan daftar nama SA. Jalur lama lain masih membaca FK langsung user. Ini menunjukkan beberapa model grant dan representasi scope berbasis nama; jangan port sebagai kontrak baru. Perbandingan effective leaf set, role exceptions, revoke/cache behavior, dan privilege expansion butuh data target/fixtures.

## Risiko kehilangan data dan aturan produk (statis)

- Migration legacy `reported_date VARCHAR → reported_date_dt DATETIME` memakai kolom samping, sehingga string sumber masih ada. Backfill lama mengisi nilai gagal parse sebagai `NULL` pada kolom typed dan menulis file JSON berisi incident + nilai waktu mentah untuk tinjauan. Script tersebut melakukan UPDATE per batch, bukan bukti rekonsiliasi penuh. Tidak dijalankan. Rewrite harus mempertahankan raw historical value/archive, menghitung invalid/null terpisah, dan tidak menjadikan kegagalan parse sebagai alasan membuang ticket.
- Ticket legacy memuat field lokal seperti `is_manual`, `manual_category`, `manual_notes`, `pending_dompis`, `sqm_update_reason`, flag validasi dan assignment teknisi di samping fakta sumber. Kelayakan migrasi, retensi dan penerus field lokal tersebut belum disetujui; jangan menghapus atau mengubahnya jadi NOSSA facts secara otomatis.
- Daily board menggabungkan tiket sync hari ini, open/closed-today, dan pengecualian pending lokal. Semesta memiliki dua jalur analytics; Rekap Workorder mengelompokkan status/kategori dan memakai query SQL khusus; Detail WO HI memfilter via `buildDetailWoHiWhere`, lalu melakukan offset pagination atas `reported_date` dan menghitung status open/close di route. Itu adalah bukti behavior legacy, bukan kontrak bisnis baru. Date basis, close semantics, membership dan parity list-summary/drilldown perlu fixture serta persetujuan.
- SLA/TTR di UI dapat memakai `booking_date`, guarantee/flag, status tier tersimpan, atau fallback klasifikasi, sedangkan compliance punya aturan berbeda dan mengecualikan kategori tanpa SLA tertentu. Jangan menyatukan display Max TTR dengan KPI compliance sebelum aturan owner disahkan.

## Coverage mapping field

Perbandingan statis `model ticket` di legacy `prisma/schema.prisma` dengan baris field pada `docs/Legacy-Field-Mapping.md` menghasilkan **84 scalar fields vs 84 mapping rows**, tanpa field hilang, ekstra, atau duplikat. Relasi Prisma bukan scalar field dan perlu dipetakan terpisah. Ini hanya memastikan kelengkapan terhadap schema source yang diperiksa; tidak membuktikan DDL production, nilai aktual, eligibility, atau transformasi bisnis telah tervalidasi.

## NOSSA contract dan acceptance plan

- Blueprint `Data-Contract.md` merujuk OAS dan sanitized sample yang disediakan, bukan hasil call saat ini. Contract menyebut hanya GET `/nossa` dan `/nossa-closed`, exact incident lookup, limit maksimal 1.000, offset sampai 5.000, closed window maksimal 31 hari, date filters inclusive pada `Status_Date`, dan `meta.count` adalah page count. Stable ordering ketika timestamp sama tidak dijamin.
- Sampel/dokumen mencatat `/nossa` dapat berisi status `CLOSED`/`RESOLVED` dan `resolved date` tidak membuktikan kapan tiket closed. `generated_at`, `inserted_date`, `Status_Date`, `Last_Update_Ticket`, `C_RESOLVE_DATE` tidak boleh dipertukarkan menjadi modification/closure cursor tanpa validasi. TTR units dan timezone untuk timestamp offsetless belum disepakati.
- Source legacy rate-limit client default lokalnya 20 request/menit/key; blueprint OAS menyebut cap terdokumentasi 50/menit dan local conservative start 20. Itu bukan alasan menaikkan budget sebelum izin/measurement. Satu incident boleh butuh dua endpoint, dan retry memakai budget.
- Gate yang masih terbuka: sanitized closed fixture, reopen sample, resource field variance, field aliases/types/null behavior, date boundary inclusivity, ordering/page overflow, GAMAS fallback behavior, closed history coverage, timezone/TTR semantics. Live API tidak dipanggil.
- Acceptance test design sudah dirinci di `docs/Migration-Validation.md` (row accounting, stable UUID/checkpoint, invalid/collision, null-vs-missing, migration rerun, scope parity, KPI/report parity, restore/rollback) dan `docs/Quality-Gates.md`. Test matrix synthetic saja; belum dijalankan.

## Peta bukti source legacy

Path relatif terhadap `/Users/pakbreng/Projects/dompis_v2` (repo legacy tetap read-only):

| Area | Bukti source | Temuan yang diekstrak |
|---|---|---|
| Ticket dan field | `prisma/schema.prisma:255-392`; migration `20260912030000_add_reported_date_dt/migration.sql:1-24`; `20260913070000_add_operational_bucket/migration.sql:1-121` | Incident unique di model; typed date transitional; generated operational/KPI fields dan precedence classifier harus dibandingkan dengan actual DDL/data |
| Hirarki dan user scope | `prisma/schema.prisma:10-43,151-203,882-977`; `app/helpers/ticket.helpers.ts:20,199`; `app/api/workzone/route.ts` | Relasi region→branch→area→service_area; direct user FK ditambah junction scopes; helper menggabungkan leaf workzones berbasis nama |
| Ticket Management / daily filter | `app/libs/services/daily-ticket-where.ts:54-155,228-350`; `app/libs/services/daily-ticket-helpers.ts`; `app/api/tickets/daily/detail-wo-hi/route.ts:88-171` | Membership memuat open/closed hari ini dan local pending; WO HI memakai tanggal/pagination sendiri. Semantics baru perlu parity fixture |
| Semesta | `app/api/dashboard/semesta-analytics/route.ts:22-62`; `app/libs/services/tickets.service.ts:1090-1472`; `app/admin/semesta/page.tsx:339-412` | Analytics dan list memiliki jalur yang harus disatukan pada predicate domain/scope baru |
| Rekap Workorder | `app/api/dashboard/rekap-workorder/route.ts:69`; `app/api/dashboard/rekap-workorder/queries.ts:159-170,258,343,388`; `lib/rekap/rekap-classify.ts` | Query aggregate terpisah; classifier/report parity perlu golden fixture; teknisi dikeluarkan dari scope |
| Sync / contract | `lib/external-db/qosmic-bridge/nossa.ts:27,128-150,172-227,268-278`; `lib/external-db/qosmic-bridge/window-planner.ts:22,47-120`; `lib/ingestion/normalizer.ts`; `lib/ingestion/conflict-resolver.ts` | Dua endpoint, bounded offset/window/splitting; legacy status-priority conflict tidak cukup untuk menentukan reopen/version |
| Classification, KPI/TTR | `app/config/operational-buckets.ts:13-81`; `app/libs/tickets/ttr-comply.ts:87-209`; `docs/sla-ttr-matrix.md:1-80`; `app/libs/services/kpi-bucket-sql.ts:174-214` | Rule legacy menjadi kandidat/evidence, bukan rule yang disetujui untuk rewrite; display Max TTR berbeda dari KPI compliance |

Source review bersifat fokus pada jalur bisnis yang masuk product scope, bukan audit line-by-line seluruh 963+ file legacy. Tabel assignment/technician/cluster/raw/projection tetap dicatat sebagai technical debt atau histori migrasi; tidak ada fitur assignment yang ditambahkan.

## Checklist Phase 0A — selesai dengan keterbatasan tercatat

- [x] Baca seluruh instruksi, blueprint, legacy docs/code relevan; catat revision/status legacy.
- [x] Inventaris config tanpa mencetak credential; identifikasi MySQL lokal dan lakukan identity + metadata/read-only aggregate audit.
- [x] Bandingkan 84 field legacy dengan mapping; identifikasi enam tipe drift terhadap Prisma.
- [x] Profil master hierarchy, scope junction null/duplicates, orphan parent, dan normalized Workzone-name mapping.
- [x] Ekstrak legacy report/KPI/sync rules sebagai kandidat, risiko data-loss, dan rencana acceptance/golden fixtures.
- [x] Catat stack pins, schema scaffold drift, dan keterbatasan validasi docs/runtime.
- [x] Baca seluruh instruksi/dokumen yang diwajibkan serta legacy source relevan; catat repo revision dan kebersihan working tree.
- [x] Identifikasi konfigurasi tanpa membuka credential; MySQL identity diverifikasi, PG localhost 5432/5433 tidak menerima koneksi. Target PostgreSQL remote tidak ditemukan/dicoba.
- [x] Audit schema MySQL aktual melalui `information_schema`: 53 tabel, 700 kolom, 402 index entries, 29 FK relationships; catat drift tipe ticket, collation, timezone dan batas metadata.
- [x] Profil ticket count, canonicality/normalized duplicates dengan keyset scan penuh, master hierarchy, scope junction, orphan/null/duplicate, dan workzone-name match.
- [x] Bandingkan source/docs dengan blueprint; dokumentasikan evidence path/line, business/report rules sebagai kandidat, technical debt dan risiko preservasi.
- [x] Buat acceptance/test plan dari `Migration-Validation.md` dan `Quality-Gates.md`; tidak menjalankan test karena fase ini discovery.
- [x] Catat versi stack yang terpasang serta keterbatasan verifikasi Context7/runtime; tidak membuat klaim kompatibilitas resmi yang tidak terbukti.
- [x] Catat semua blocker/fact gaps untuk Phase 0B/0C/0D di bawah.

## Keputusan yang menunggu validasi

- Target MySQL yang tepat dan apakah snapshot/restore read-only tersedia; target PG18 dev/staging; target labels, allowed schema, owner/roles.
- Apakah container `mysql_baru` / volume `dompis_v2_dompis_mysql_data` adalah restore/dev yang boleh diaudit; siapa owner-nya dan schema allowlist-nya. Binding `0.0.0.0:3306` perlu ditinjau operator infra, tidak diubah pada discovery.
- Normalisasi Workzone dan definisi kode resmi; apakah keunikannya global atau memerlukan parent wilayah.
- Efektivitas dan precedence scope user lama, status aktif, akun/role yang dipertahankan, password reset/retention.
- Semantik tanggal/tz, status close/reopen, TTR units/thresholds/clock, KPI classification and membership, report date basis/denominators.
- Kontrak NOSSA field types, update timestamp/version, null-vs-missing, pagination/order/window inclusivity, closed sample parity.
- Retensi PII/archive, field eligibility historis, accept/reject policy bagi orphan/duplicate/unknown scope.

## Acceptance gate dan status penutupan

**Phase 0A ditutup.** Deliverable sesuai `Implementation-Plan.md` telah dibuat: legacy checkout/source map, exact model/mapping audit, MySQL actual schema/data drift, technical debt, business/report evidence dan batasnya. Acceptance gate Phase 0A (`no code copying; evidence paths and limitations recorded`) terpenuhi. Database target hanya dibaca; tidak ada DML/DDL, migration, live NOSSA call, implementasi fitur atau perubahan pada legacy repo. Keterbatasan MySQL environment/owner, PG yang tidak tersedia, metadata DDL penuh dan Context7 dicatat; tidak dianggap sebagai fakta yang sudah terverifikasi.

Contract closed/reopen, effective scope parity, KPI/SLA/TTR/date semantics dan field disposition adalah gate fase **0B/0C**, bukan alasan menahan deliverable 0A. Tidak boleh mengimplementasikan rule/report/migration yang bergantung pada keputusan tersebut sebelum validasi owner. Fase berikutnya belum dimulai.

## Open blockers untuk fase berikutnya (Phase 0A tidak terblokir)

1. Untuk profiling lanjutan/desain migration, daftarkan environment/owner/schema allowlist MySQL dan sediakan discovery role least-privilege atau snapshot/restore; target sekarang local `dompis_db` dengan environment belum terklasifikasi dan role `root@%`.
2. Sediakan target PostgreSQL 18 dev yang terdaftar melalui jalur credential aman; belum ada PG lokal di 5432/5433 dan tidak ada konfigurasi target remote.
3. Untuk Phase 0C, sediakan sanitized `/nossa-closed`/reopen fixtures dan versi OpenAPI resmi; live endpoint belum dipanggil.
4. Untuk Phase 0B/0C, owner putuskan retensi/eligibility legacy fields, mapping Workzone/master, KPI/SLA/TTR, timezone/date basis, lifecycle, role/effective scope dan grant exceptions.
5. Untuk Phase 0D, bila migration akan memakai seluruh legacy schema, tinjau `SHOW CREATE TABLE`/generated expressions/check constraints/referential actions dari target terdaftar; saat ini bukti `information_schema` mencatat struktur dan relasi, tetapi bukan arsip DDL penuh.
