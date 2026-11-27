# Phase 0C — Paket Bukti dan Keputusan Pemilik

Status: **belum disetujui; lembar kerja untuk menutup gate Phase 0C**. Jangan isi dengan credential, payload pelanggan asli, nama pengguna, atau data pribadi. Lampirkan artefak sanitasi secara terpisah dan batasi field yang tidak relevan.

Paket ini mengonsolidasikan input yang masih kurang setelah discovery statis. Nilai yang kosong berarti belum diputuskan; agent tidak boleh mengisinya dengan asumsi. Keputusan bisnis dicatat pemilik aplikasi, sedangkan kontrak teknis harus didukung artefak upstream atau bukti dari snapshot yang terdaftar.

## Yang masih perlu Anda putuskan — versi sederhana

Keputusan lifecycle/status, rumus compliance, daftar maksimum TTR, countdown Reguler, MTTR yang ditunda, role, struktur organisasi, nama Indibiz, serta kamus `source_vlookup` **sudah dicatat dan tidak ditanyakan ulang di sini**.

| Topik | Pilihan yang perlu ditentukan | Rekomendasi untuk v3 | Dampak |
|---|---|---|---|
| Periode awal Semesta | Pilih default **7 hari**, **30 hari**, **90 hari**, atau **semua riwayat**. Ringkasan dan grafik akan memakai periode yang sama; pengguna tetap dapat mengganti rentang. | 30 hari sebagai titik awal; tidak mengubah basis tanggal `reported_date`. | Menentukan periode awal yang terlihat saat membuka Semesta, bukan aturan TTR atau kelayakan ticket. |
| GAUL/recurring | Pilih **tunda dulu** atau **tetap masuk rilis awal**. Jika dipertahankan, perlu disepakati arti “berulang” (berapa kali dan dalam rentang berapa lama) sebelum angka ditampilkan. | Tunda dari rilis awal sampai definisinya disetujui; legacy ±60 hari/top 100 bukan definisi v3 otomatis. | Menghindari angka GAUL yang tampak pasti tetapi memakai aturan lama yang terbukti dapat undercount. |
| Penyimpanan field historis sensitif | Pilih apakah field pelanggan/kontak/free-text sensitif **tidak masuk database aplikasi dan hanya tersimpan pada backup arsip terenkripsi**, atau **boleh disimpan di arsip PostgreSQL terbatas untuk Superadmin**. Tetapkan juga masa simpan (misalnya jumlah tahun atau rujuk kebijakan internal). | Jangan salin field sensitif ke arsip runtime sampai akses dan masa simpan ditetapkan; pertahankan backup sumber sesuai kebijakan organisasi yang berlaku. | Menentukan allowlist archive dan akses; tidak mengubah kewajiban menghitung seluruh row migrasi atau mencatat disposition. |
| Sumber migrasi MySQL | Apakah `dompis_db` lokal yang pernah diperiksa adalah **sumber resmi yang akan dimigrasi**, atau **hanya salinan/dev** sehingga sumber resmi perlu ditentukan? | Anggap belum terdaftar sebagai sumber migrasi sampai statusnya dikonfirmasi dan snapshot konsisten dapat dibuat. | Menentukan database mana yang boleh dibekukan sebagai snapshot; tidak ada salinan/migrasi sebelum sumber dan snapshot terdaftar. |

Anda dapat menjawab ringkas, misalnya: `Semesta 30 hari; GAUL tunda; field sensitif backup terenkripsi saja, simpan 7 tahun; dompis_db lokal adalah sumber migrasi.` Periode retensi contoh hanya format jawaban, bukan rekomendasi kebijakan.

Catatan: closed/open endpoint pair sudah diterima. Tidak perlu mengirim contoh itu lagi. Bukti pagination, closed-window completeness, closed→open ordering, dan timezone pada timestamp tanpa offset adalah bukti teknis upstream; pilihan di atas tidak menggantikan bukti tersebut.

## Ringkasan schema lama dengan bahasa sederhana

- **Ticket:** tabel lama punya 84 kolom bercampur: fakta ticket, hasil hitung/report lama, catatan manual, data pelanggan, dan kolom teknisi. Di v3, kolom yang dipakai empat menu menjadi kolom ticket; nilai historis lain disimpan di archive terbatas sesuai retensi. Assignment teknisi tidak menjadi fitur operasional.
- **Optimasi:** schema lama juga memiliki jalur raw/staging/projection dan banyak index ticket. v3 memakai satu tabel ticket kanonik dan hanya menambah index yang terbukti dibutuhkan query. Data historis tidak dibuang; tabel/worker raw permanen dan assignment teknisi tidak dibawa sebagai runtime dependency.
- **Wilayah:** ikuti mapping nama tabel/level yang sudah Anda berikan: `region → region`, `branch → branch`, `area lama → service_area`, `service_area lama → workzone`. Tidak ada permintaan crosswalk Area–Region per baris; jika perbedaan schema muncul, itu temuan teknis untuk diperiksa.
- **Hak akses:** schema lama menyimpan scope di kolom langsung `users` dan empat tabel grant. Migrasi akan menghitung Workzone yang boleh dilihat tiap user, menggabungkan grant tumpang tindih tanpa duplikasi, lalu membandingkannya. Ini bukan pekerjaan manual satu per satu; jika hasil tidak bisa dibuktikan, akun tetap nonaktif/tanpa akses.
- **Jenis tiket:** tabel live `source_vlookup` adalah kamus classifier dan sumber resmi yang Anda tetapkan; hasil `jenis_tiket_1/2` disimpan pada ticket sebagai snapshot supaya perubahan kamus tidak mengubah sejarah diam-diam.

Klarifikasi pemilik: struktur master mengikuti pemetaan tabel yang sudah diberikan; tabel/level yang ada dipetakan dengan mengganti nama sesuai mapping, bukan meminta crosswalk Area–Region per baris. Jadi crosswalk Area–Region bukan keputusan pemilik yang masih tertunda. Yang tersisa adalah memastikan implementasi skema dan data master mengikuti mapping tersebut. Keputusan lain yang masih diperlukan: berapa lama archive historis/PII disimpan dan apakah `dompis_db` lokal merupakan sumber migrasi yang harus dibekukan sebagai snapshot. Ticket Workzone yang tidak cocok tetap disimpan tanpa scope biasa sampai mapping tepat tersedia.

## A. NOSSA dan lifecycle — C0C-01 / C0C-02

### Bukti teknis NOSSA (bukan konfirmasi ulang aturan status atau daftar batas jam TTR)

- Versi/tanggal authoritative OpenAPI atau dokumentasi kontrak yang digunakan:
- Sanitized response `/nossa` dan `/nossa-closed` by incident sudah diterima dan disimpan di `Phase-0C-NOSSA-Incident-Fixture-Sanitized.json`; nilai pribadi/free text sudah diganti.
- Yang belum ada: contoh incident yang sama setelah pernah closed lalu muncul kembali open (untuk validasi evidence reopen), atau dokumentasi upstream yang menjelaskan urutan/version yang membuktikannya:
- Pagination ordering/cursor atau tie behavior pada timestamp yang sama:
- Closed-window boundary, completeness, rate/error/retry behavior yang dikonfirmasi:
- Sumber bukti, pemilik/upstream, tanggal diterima:

Fixture tidak boleh memuat identifier pelanggan asli. Nilai yang disamarkan harus mempertahankan struktur, tipe, format, serta pola null/missing yang diperlukan untuk menguji parser.

### Aturan lifecycle yang sudah ditetapkan

| Pertanyaan | Keputusan pemilik |
|---|---|
| Status lifecycle | **Ditetapkan:** daftar open dan closed di atas; status lain unknown dan tidak ditebak. `OPEN`/`CLOSE` dari kode legacy tidak ditambahkan ke daftar eksplisit v3. |
| Reopen | **Ditetapkan:** incident yang sama berubah dari salah satu status closed yang disebut ke salah satu status open yang disebut berarti reopen. |

Aturan lifecycle dan bentuk dasar dua response sudah dicatat. Contoh yang diberikan menunjukkan incident yang sama berpindah dari open ke close. Yang belum tersedia hanyalah bukti closed lalu open kembali dan kontrak timestamp/version, pagination/tie behavior serta kelengkapan window.

## B. Waktu, TTR, SLA dan KPI — C0C-02

### Batas maksimum ticket harus close sudah diberikan

Daftar maksimum jam per jenis ticket yang Anda kirim sebelumnya sudah menjadi acuan di `Phase-0C-Legacy-Classification-TTR-Reference.md`; tidak perlu dikirim ulang. Semua kriteria lama `RESELLER` mengikuti `INDIBIZ`. Contoh response endpoint menunjukkan `TTR_Customer`/`TTR_END_TO_END` sebagai nilai dari ticket berjalan, bukan nilai maksimum SLA.

### Aturan yang memang sudah ada di aplikasi lama

Audit `dompis_v2` menemukan beberapa mekanisme waktu/TTR yang berbeda, bukan satu rule engine tunggal. Rincian terstruktur classification, daftar threshold yang dilaporkan, anomali, provenance dan rekonsiliasi ada di [Legacy Classification and Time/TTR Reference](Phase-0C-Legacy-Classification-TTR-Reference.md). Distribusi jumlah jenis tiket di sana hanya profil snapshot yang dilaporkan, bukan target jumlah permanen; ia hanya dapat dipakai untuk merekonsiliasi populasi snapshot yang sama setelah predicate dan provenance tervalidasi.

| Jalur legacy | Perilaku yang ditemukan | Sumber dan batas bukti |
|---|---|---|
| TTR compliance | Memerlukan status dalam `CLOSE_STATUS_VALUES`, `resolve_date`, `reported_date` yang dapat diparse, dan threshold. Membandingkan `resolve_date <= deadline` sebagai `comply`; lewat deadline `not_comply`; tiket/status/jenis/timestamp yang tidak eligible menghasilkan null/tidak dinilai. | `app/libs/tickets/ttr-comply.ts`; ini perilaku kode lama, bukan keputusan bahwa `resolve_date` adalah canonical close time NOSSA. |
| Threshold B2C | Untuk segment DCS/PL-TSEL memakai `customer_type`: Diamond 3 jam, Platinum 6 jam, Gold 12 jam, Reguler 24 jam. | `app/config/customer-types.ts`; fallback helper dapat memberi default 24 jam, tetapi compliance path mengembalikan null jika customer type tidak dikenali. |
| Threshold B2B / jenis | `getJenisSlaHours` menjadi fallback, dengan pengecualian TOP OLO 4/7 jam tergantung `ticket_id_gamas` dan K-tier family 1,5/3,6/7,2 jam dari suffix K1/K2/K3; SIP TRUNK flat 10 jam. Jenis netral dikecualikan dari compliance. | `app/libs/tickets/ttr-comply.ts` dan `app/config/jenis-tiket.ts`; pemetaan dan precedence bergantung pada classifier/type fields. |
| SQM dan MANJA | SQM-CCAN hanya dinilai untuk reported 08:00–17:00 WIB dengan 4 jam; MANJA P1 memakai `booking_date + 3 jam`. | `app/libs/tickets/ttr-comply.ts`; eligibility dan penerapan bisnis belum disahkan untuk v3. |
| Max TTR tampilan/detail | `reported_date` harus valid. Jika booking valid: booking+3 jam menang, tanpa syarat guarantee/flag. Jika booking tidak valid: guarantee=`GUARANTEE` dan raw flag P1/P+ memberi reported+3 jam. Selain itu: stored max TTR per customer, compliance threshold, static jenis display, lalu fallback customer type. | `app/libs/tickets/effective.ts`; bukan rule compliance. Sudah ditelusuri langsung dari source. |
| Priority countdown | Legacy countdown Reguler 36 jam; **keputusan pemilik untuk v3: 24 jam**. Diamond/VVIP 3 jam, Platinum 6 jam, MANJA 3 jam tetap terpisah. | `app/libs/priority/ttr.ts` + keputusan pemilik; bukan SLA matrix atau compliance KPI. |
| MTTR / durasi resolve | **Ditunda oleh pemilik untuk saat ini.** | Jangan jadikan blocker Phase 0C atau implementasi saat ini. |
| Parsing timestamp | `parseWIBDateInput` menginterpretasikan string tanpa offset sebagai WIB (Asia/Jakarta), menghormati offset eksplisit, dan menangani format slash dengan asumsi DD/MM ketika ambigu. | `app/utils/datetime.ts`; parser lama membuktikan perilaku aplikasi, bukan bahwa tiap upstream field offsetless memang bermakna WIB. |

Anda telah menetapkan semua kategori/kriteria lama bernama Reseller digabung menjadi Indibiz; `RESELLER` bukan jenis tiket terpisah di v3. Daftar maksimum jam yang Anda kirim menjadi input batas penutupan; INDIBIZ memakai 24 jam. Countdown Reguler untuk v3 juga 24 jam, bukan 36 jam legacy. Booking dan guarantee untuk Max TTR tampilan telah dipetakan dari source; MTTR ditunda. Pada B2C, customer type kosong/tidak dikenal tidak dinilai oleh jalur compliance; fallback 24 jam hanya untuk tampilan. Parser legacy membaca timestamp tanpa offset sebagai WIB dan menghormati offset eksplisit; itu belum membuktikan timezone setiap field upstream NOSSA. Detail ada di [referensi classification/TTR](Phase-0C-Legacy-Classification-TTR-Reference.md) dan [matriks jalur TTR legacy](Phase-0C-TTR-Legacy-Path-Matrix.md).

| Field/aturan | Keputusan pemilik; tulis `unknown` jika belum diketahui |
|---|---|
| Legacy behavior yang akan dipertahankan untuk parity | **Sudah dipetakan dari kode:** compliance memakai `resolve_date` vs deadline dan equality dihitung comply; countdown terpisah; Max TTR punya urutan fallback tampilan. Reguler countdown di v3 ditetapkan 24 jam. MTTR ditunda atas keputusan pemilik. |
| Customer type B2C kosong/tidak dikenal | **Sudah dipetakan dari kode:** compliance = tidak dinilai/null; fallback tampilan 24 jam hanya display. |
| Indibiz dan kategori lama Reseller | **Ditetapkan pemilik:** semua kriteria lama Reseller menjadi Indibiz; daftar maksimum yang Anda kirim memberi INDIBIZ 24 jam. Nilai matriks lama yang bertentangan tetap dicatat sebagai histori teknis, tidak meminta keputusan ulang. |
| Compliance TTR v3 | **Ditetapkan pemilik:** deadline = `reported_date + batas maksimum yang berlaku`; bandingkan `resolve_date` terhadap deadline, `<=` berarti comply. Ticket open/unknown, tanpa threshold yang berlaku, atau timestamp invalid tidak dinilai (NULL). `TTR_Customer`/`TTR_END_TO_END` bukan input hitung compliance. |
| Default tanggal menu | **Sudah tertulis di PRD:** Semesta memakai basis `reported_date`; Rekap Workorder dan Detail WO HI default active + closed hari ini; hourly close menggunakan `closed_at` WIB. Yang masih perlu dirinci hanya rentang default/granularitas Semesta dan definisi metric/denominator yang belum diatur PRD. |
| `TTR_Customer` dan `TTR_END_TO_END` dari NOSSA | Contoh menunjukkan nilai berjalan `4.056`/`4.06` dan tipe `number`/`string`. Unit, pembulatan, dan clock basis belum diketahui. Ini hanya perlu diputuskan jika angka upstream tersebut akan ditampilkan/dipakai; tidak menghalangi compliance yang sudah memakai timestamp dan threshold. |
| Timestamp NOSSA tanpa offset dan ordering | Contoh `Reported_Date`/`C_RESOLVE_DATE` memuat `+07:00`; `C_BOOKING_DATE` tidak. Aplikasi lama mengartikan string waktu tanpa offset sebagai WIB. Untuk ingest, explicit offset wajib dihormati; semantik source untuk field offsetless perlu fixture/contract. Authoritative version/tie ordering, pagination dan closed-window completeness masih perlu bukti upstream. |

Jangan menyetujui KPI berdasarkan nama field atau perilaku implementasi lama saja. Sampel golden input/output sintetis wajib dibuat setelah definisi disetujui.

## C. Master wilayah dan Workzone — C0C-03

**Pemetaan master yang sudah ditetapkan pemilik:** `region → region`, `branch → branch`, `area lama → service_area`, dan `service_area lama → workzone`; target v3 mengikuti susunan `Area → Region → Branch → Service Area → Workzone`. Tidak perlu meminta pemilik membuat crosswalk satu per satu untuk mengganti nama tabel/level. Implementasi harus memakai relasi parent yang ada dan mapping ini secara konsisten; jika schema atau data aktual menunjukkan perbedaan, catat sebagai temuan teknis untuk diperiksa, bukan meminta ulang keputusan struktur.

Untuk Workzone, aturan aman tidak memerlukan keputusan tambahan: semua ticket tetap dimigrasikan dan nilai aslinya dipertahankan. **391 key** cocok tepat ke master yang unik dan dapat dipetakan langsung. Jika kode tidak cocok (74 key/7.171 ticket) atau kosong (47 ticket), `workzone_id` dibiarkan kosong dan diberi penanda belum terpetakan; ticket tidak dihapus, tidak dipasangkan dengan tebakan, dan tidak muncul pada laporan/scope user biasa sampai Superadmin memperbaiki mapping. Kamus resmi hanya diperlukan jika nanti ingin memperbaiki 74 key tersebut; ini tidak menghalangi penyimpanan history. Jangan gunakan fuzzy match.

Bukti agregat terbaru (2026-11-27): 393/393 nonblank `service_area.nama_sa` unik setelah `UPPER(TRIM(...))`; 391/465 distinct nonblank ticket Workzone keys cocok tepat satu master, 74 tidak cocok, dan 47 ticket rows blank/null. 391 direct exact matches dapat dipakai; yang tidak cocok tetap unmapped. Kamus Workzone hanya dibutuhkan untuk perbaikan lanjutan, bukan untuk menghapus/memblokir ticket migration.

Acceptance: exact normalized key uniqueness dibuktikan; setiap mapped key menunjuk satu master Workzone dan parent chain sesuai mapping pemilik; unmatched/blank tetap tersimpan tanpa akses scope biasa; tidak ada scope grant yang melebar akibat mapping.

## D. Role, account, dan effective scope — C0C-04

Keputusan yang sudah tercatat dan tidak perlu diulang:

- `superadmin` memiliki kontrol penuh; User Management hanya untuk `superadmin`.
- `admin` berganti nama menjadi `team_leader`; `admin_branch` menjadi `officer`; role lainnya tetap memakai nama yang disetujui.
- `officer`, `team_leader`, dan `senior_leader` satu kelompok dan saat ini sama-sama belum diberi capability operasional.
- `helpdesk` dan `teknisi` ditunda; assignment teknisi tetap di luar scope.
- Untuk scope v3 saat ini, capability catalog yang disetujui hanya diberikan kepada `superadmin`; peran lain belum mendapat operational grant. `superadmin` memegang explicit global data scope dan menjadi satu-satunya role yang dapat mengatur global/hierarchical scope; audit reader juga hanya `superadmin`.

Aturan akses untuk scope aplikasi saat ini sudah cukup jelas: Superadmin punya kontrol penuh dan global; User Management hanya Superadmin; `officer`, `team_leader`, `senior_leader` satu kelompok dengan hak yang sama (saat ini belum diberi capability operasional); `helpdesk` dan `teknisi` ditunda. Akun hasil migrasi tidak otomatis aktif sebelum scope dan password aman tervalidasi. Cakupan lama dihitung dari grant per-user dan dibandingkan saat snapshot; user tanpa scope tetap tanpa akses, bukan diberi akses global.

Pekerjaan teknis berikut tidak meminta keputusan role baru:

| Pertanyaan | Keputusan pemilik |
|---|---|
| Validasi migrasi yang akan dijalankan pada snapshot terdaftar | Hitung union scope lama dari kolom langsung dan tabel grant, deduplikasi workzone, bandingkan per user dengan target, dan jangan aktifkan user jika ada scope yang tidak bisa dibuktikan. Ini pengujian parity, bukan minta pemilik memetakan setiap user satu per satu. |
| Audit metadata dan retention | Periode penyimpanan audit masih mengikuti keputusan retensi terpisah; tidak mengubah role scope migration. |

Acceptance migrasi: pada snapshot yang terdaftar, hitung effective leaf scope lama dari seluruh direct FK dan junction grants, role/global exceptions, lalu bandingkan per-user dengan target; semua privilege delta harus disetujui. Tidak ada aktivasi akun sebelum parity lolos.

## E. Field, eligibility, PII, dan archive — C0C-05

Isi disposition eksplisit untuk setiap 84 scalar field pada `Legacy-Field-Mapping.md` setelah source DDL/snapshot didaftarkan. Gunakan tepat satu disposition utama:

- `ticket_typed`: kolom kanonik; jelaskan transformasi, sumber waktu/tipe, null/invalid rule dan alasan produk.
- `archive_allowlisted`: payload historis terbatas; sebut field allowlist, role yang boleh mengakses, tujuan, dan retention period.
- `restricted_offline`: hanya backup terenkripsi di luar runtime; sebut owner dan retention.
- `exclude`: alasan terdokumentasi dan bukti bahwa field tidak diperlukan oleh produk/histori; perlu persetujuan pemilik.
- `derived`: aturan dan versi yang disetujui; jangan mengganti nilai historis secara diam-diam.

Schema Drizzle untuk tabel mapping lokal `source_vlookup` tersedia di `packages/db/src/schema.ts`. **Keputusan pemilik:** data tabel `source_vlookup` pada database legacy adalah sumber otoritatif untuk mengisi `jenis_tiket_1` dan `jenis_tiket_2` pada ticket, seperti aplikasi lama; checked-in seed bukan sumber pengganti jika berbeda. Hasil profiling lokal: 135 row, 20 customer-type key, 40 realm key, tanpa duplicate pada normalisasi yang diuji; seed berisi 134 row/19 customer-type key. Perbedaan itu akan diselesaikan dengan mengambil mapping dari snapshot database yang disetujui, bukan menebak baris tambahan. Hasil klasifikasi disimpan sebagai snapshot pada ticket agar perubahan mapping berikutnya tidak mengubah history diam-diam. Semua output lama `RESELLER` menjadi `INDIBIZ`. Rincian teknis ada di `Phase-0C-Legacy-Classification-TTR-Reference.md`.

### Bukti kebutuhan produk yang sudah ditemukan

Ini adalah jejak pemakaian/requirement candidate dari `PRD.md` dan `Phase-0B-Discovery.md`, bukan keputusan retensi atau business rule baru:

| Menu | Field/kelompok candidate yang perlu diputuskan | Risiko/ketergantungan yang sudah diketahui |
|---|---|---|
| Ticket Management | incident/status/workzone; `operational_bucket`, `kpi_seg`, `jenis_tiket_1/2`, source/classification/customer/service fields; booking/TTR/SLA; flag dan annotation lokal | Predicate bucket/status/SLA berbeda antar jalur legacy; `status_update`, `pending_dompis`, dan SQM reason tidak dijamin NOSSA. Assignment/teknisi tidak boleh masuk scope produk. |
| Semesta | `reported_date`/`reported_at`; bucket/segment/type; workzone; `service_no`; GAUL/GAMAS references | PRD menetapkan basis `reported_date`. Source lama memberi total utama tanpa batas tanggal eksplisit sedangkan trend hanya 7/30 hari; v3 perlu satu default interval/granularitas. Gunakan lifecycle owner, bukan `status_update`. GAUL perlu aturan lookback/group jika fitur dipertahankan; bukan terkait MTTR. |
| Rekap Workorder | daily population; workzone/master; status; bucket/segment dan filter/drilldown dimensions | PRD menetapkan default active + closed hari ini; close-hour memakai `closed_at` WIB. Legacy menerima status unknown sebagai open di beberapa jalur. v3 harus memisahkan bucket count dari compliance, mempertahankan unknown, dan mengeluarkan technician metrics. |
| Detail WO HI | incident/status/workzone; reported, booking, resolved, closed timestamps; ticket type; age dan effective Max TTR | PRD menetapkan default active + closed hari ini; `reported_date` menjadi basis usia dan legacy date filter. Summary/list/export harus berbagi predicate. Jangan samakan Max TTR tampilan dengan compliance. Raw NOSSA TTR measure hanya perlu kontrak jika ditampilkan/dipakai. |

Rekomendasi sederhana: jangan buang ticket eligible. Simpan field yang dibutuhkan empat menu sebagai data ticket v3; simpan old-only/local/manual fields di `ticket_legacy_archive`; batasi PII/free-text ke archive Superadmin-only dan jangan tampilkan di API umum. Assignment teknisi dan tabel assignment lama tidak diaktifkan sebagai fitur.

Daftar kandidat pada mapping saat ini belum merupakan izin untuk menyimpan atau membuang field. Periksa khusus PII, free text, user/technician references, local/manual annotations, validation, pending, SLA/TTR historis, dan generated fields. Tidak boleh menghapus field/data eligible tanpa alasan dan disposition yang disetujui.

Interpretasi draft untuk initial v3 kini ditulis di `Legacy-Field-Mapping.md`: field legacy yang hanya ditandai optional typed promotion menjadi archive-only pada scope awal; field restricted tidak masuk runtime/API; belum ada field yang diberi disposition `exclude`. Ini belum menyetujui akses/masa simpan archive. Masih perlu divalidasi: kelayakan tiap field terhadap PRD/actual DDL dan masa simpan/akses archive PII serta free text.

Ringkasan audit inventory (bukan approval): ada 84 field; draft mapping menunjuk 38 field ke kolom typed ticket, 8 field sensitif ke restricted/offline, dan 38 field lain ke archive/metadata/transform/review. Delapan field sensitif yang ditandai saat ini: `contact_phone`, `contact_name`, `customer_name`, `sn_ont`, `alamat`, `teknisi_user_id`, `technician`, `manual_created_by`. Draft dapat berubah setelah pemakaian menu dan actual DDL divalidasi.

| Keputusan umum | Keputusan pemilik |
|---|---|
| Archive legacy dan PII | **Usulan:** semua ticket historis eligible tetap tercatat; delapan field sensitif di atas tidak masuk API umum. Pilih akses archive PII (Superadmin-only atau restricted offline saja) dan sebut masa simpan archive/backup atau nama kebijakan internal. Tanpa keputusan ini, saya tidak bisa menyetujui penyimpanan online PII/free-text. |
| Ticket manual/incident invalid | Jangan hapus diam-diam; valid masuk `tickets`, invalid/collision tetap dihitung dalam archive/quarantine dengan alasan. |
| Authoritative source mapping | **Ditetapkan pemilik:** tabel live `source_vlookup` legacy; bukan checked-in seed bila berbeda. Output `RESELLER` menjadi `INDIBIZ`. |
| Approver dan tanggal keputusan |  |

Acceptance: 84/84 row memiliki disposition dan transform yang dapat diuji; setiap field yang tidak disimpan memiliki alasan; data archive dibatasi sesuai policy; golden fixture menunjukkan exact row accounting tanpa kehilangan field eligible.

## F. Registrasi sumber dan target — C0C-06

Jangan menaruh password, DSN, token, atau secret di lembar ini. Kirim secret melalui mekanisme lokal yang disetujui dan jangan masukkan ke Git/Handover.

| Registry item | Nilai non-secret yang diperlukan | Status/owner |
|---|---|---|
| Legacy MySQL discovery source | MySQL 8.0.46; loopback `127.0.0.1:3306`; database `dompis_db`; container label `mysql_baru`; environment/data provenance unclassified; owner is application owner; bounded allowlist is registered in `Database-Access.md`; observed principal `root@%` is overprivileged and is not a migration role | Registered for bounded read-only discovery only; migration source approval, least-privilege role, and owner environment classification remain open. No secret is recorded. |
| Consistent source snapshot | Snapshot ID/time, source schema hash, row manifest/count method, isolation/consistency method, backup location/restore evidence, retention | Belum ada snapshot immutable. Keputusan sederhana yang diperlukan: apakah database MySQL lokal `dompis_db` adalah sumber yang akan dimigrasikan, atau hanya salinan/dev sehingga snapshot perlu dibuat dari sumber lain? Tidak ada snapshot atau export yang dibuat. |
| PostgreSQL development target | PostgreSQL 18.7; local Unix socket (configured port 5432); database `dompis_v3`; development environment; application owner; `public` schema; observed role `pakbreng` | Identity registered for local development metadata/synthetic access only. Role is verified SUPERUSER/CREATEDB/CREATEROLE/REPLICATION, so it is not an acceptable runtime/migration role. No dedicated least-privilege role or isolated restore rehearsal is registered. `dompis_v3_dev` is absent. |
| Rollback/restore rehearsal | Procedure reference, backup verification, restore-test date/result, approver | Not performed on an isolated target; evidence and approver remain open. Do not reset the persistent `dompis_v3` database. |

Acceptance: source snapshot immutable dan dapat diidentifikasi; metadata/credential cocok dengan registry melalui target guard; read role tidak dapat menulis; target rehearsal terisolasi dan restore terbukti. Identitas server saja tidak cukup untuk mengizinkan ETL.

## Exit checklist Phase 0C

- [ ] C0C-01: sanitized `/nossa` open and `/nossa-closed` closed response pair recorded; still need closed→open evidence and pagination/window ordering/completeness contract. Owner lifecycle rule is already decided.
- [ ] C0C-02: owner rules for lifecycle, compliance (`reported_date + threshold` vs `resolve_date`), maximum hours, countdown Reguler=24h, and MTTR deferral are recorded; PRD defines menu date/population defaults and SLA denominator. Still need Semesta default interval/granularity and membership/denominators for any other KPIs not defined in PRD, GAUL rule if retained, and a source timestamp fixture for offsetless fields. Raw NOSSA TTR units are not a compliance blocker. Legacy Semesta/Rekap status counting does not override owner lifecycle groups or unknown handling.
- [ ] C0C-03: implement and verify the owner-provided master table mapping; unmatched/blank Workzones preserved as NULL/out-of-scope. Optional dictionary may repair the 74 unmatched keys later. No per-Region owner crosswalk is required.
- [x] C0C-04: current role policy decided (Superadmin only operational/global grants; equal middle-role cohort has zero grants; Helpdesk/Technician deferred; imported users inactive until validated). Per-user scope parity remains migration QA.
- [ ] C0C-05: 84/84 field disposition and historical eligibility validated; archive/PII access and retention policy approved.
- [ ] C0C-06: source snapshot/read-only role dan isolated PostgreSQL target/restore terdaftar.
- [ ] Security, rollback, test results, unresolved risks dan implementation plan diperbarui; pemilik menyetujui exit gate.

Setelah checklist lengkap, lakukan review parity dan acceptance test, perbarui `Decision-Log.md`, `Phase-0C-Contract-Access-Discovery.md`, `Phase-0D-Design-Readiness.md`, dan `Handover.md`. Jangan mulai legacy ETL sebelum semua gate relevan lulus.
