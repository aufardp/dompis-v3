# Phase 0C — Paket Bukti dan Keputusan Pemilik

Status: **belum disetujui; lembar kerja untuk menutup gate Phase 0C**. Jangan isi dengan credential, payload pelanggan asli, nama pengguna, atau data pribadi. Lampirkan artefak sanitasi secara terpisah dan batasi field yang tidak relevan.

Paket ini mengonsolidasikan input yang masih kurang setelah discovery statis. Nilai yang kosong berarti belum diputuskan; agent tidak boleh mengisinya dengan asumsi. Keputusan bisnis dicatat pemilik aplikasi, sedangkan kontrak teknis harus didukung artefak upstream atau bukti dari snapshot yang terdaftar.

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
| `TTR_Customer` dan `TTR_END_TO_END` dari NOSSA | Contoh menunjukkan nilai berjalan `4.056`/`4.06` dan tipe `number`/`string`. Unit, pembulatan dan clock basis field upstream tetap perlu kontrak; angka itu bukan batas maksimum per jenis ticket yang sudah Anda kirim. |
| Timestamp NOSSA tanpa offset dan ordering | Contoh ISO timestamp menyertakan `+07:00`, tetapi booking date tidak. Semantik offsetless, authoritative version/tie ordering, pagination dan closed-window completeness tetap perlu dokumentasi/fixture. |

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
| Semesta | `reported_date`/`reported_at`; bucket/segment/type; workzone; `service_no`; GAUL/GAMAS references | PRD memilih reported-date untuk histori. Recurring/GAUL perlu bukti ketersediaan, definisi lookback/grouping, dan persetujuan denominator. |
| Rekap Workorder | reported/operational date basis; workzone/master; status; bucket/segment dan filter/drilldown dimensions | Classifier SQL dan JS legacy berbeda; technician metrics dikeluarkan dari scope. Summary/cell/drilldown harus memakai rule dan scope yang sama. |
| Detail WO HI | incident/status/workzone; reported, booking, resolved, closed timestamps; ticket type; age dan effective Max TTR | Jalur legacy detail/Max TTR dan clock-nya sudah dipetakan di `Phase-0C-TTR-Legacy-Path-Matrix.md`. Jangan samakan Max TTR tampilan dengan compliance. Belum ada kontrak unit `TTR_Customer`/`TTR_END_TO_END`; KPI/report date basis tetap harus ditetapkan untuk masing-masing menu. |

Rekomendasi sederhana: jangan buang ticket eligible. Simpan field yang dibutuhkan empat menu sebagai data ticket v3; simpan old-only/local/manual fields di `ticket_legacy_archive`; batasi PII/free-text ke archive Superadmin-only dan jangan tampilkan di API umum. Assignment teknisi dan tabel assignment lama tidak diaktifkan sebagai fitur.

Daftar kandidat pada mapping saat ini belum merupakan izin untuk menyimpan atau membuang field. Periksa khusus PII, free text, user/technician references, local/manual annotations, validation, pending, SLA/TTR historis, dan generated fields. Tidak boleh menghapus field/data eligible tanpa alasan dan disposition yang disetujui.

| Keputusan umum | Keputusan pemilik |
|---|---|
| Archive legacy dan PII | **Usulan aman:** semua ticket historis eligible tetap tersimpan; PII/free-text yang tidak dibutuhkan menu berada hanya di archive terbatas, Superadmin-only, tanpa export/API umum. Mohon berikan periode retensi organisasi (atau nama kebijakan internal). |
| Ticket manual/incident invalid | Jangan hapus diam-diam; valid masuk `tickets`, invalid/collision tetap dihitung dalam archive/quarantine dengan alasan. |
| Authoritative source mapping | **Ditetapkan pemilik:** tabel live `source_vlookup` legacy; bukan checked-in seed bila berbeda. Output `RESELLER` menjadi `INDIBIZ`. |
| Approver dan tanggal keputusan |  |

Acceptance: 84/84 row memiliki disposition dan transform yang dapat diuji; setiap field yang tidak disimpan memiliki alasan; data archive dibatasi sesuai policy; golden fixture menunjukkan exact row accounting tanpa kehilangan field eligible.

## F. Registrasi sumber dan target — C0C-06

Jangan menaruh password, DSN, token, atau secret di lembar ini. Kirim secret melalui mekanisme lokal yang disetujui dan jangan masukkan ke Git/Handover.

| Registry item | Nilai non-secret yang diperlukan | Status/owner |
|---|---|---|
| Legacy MySQL discovery source | MySQL 8.0.46; loopback `127.0.0.1:3306`; database `dompis_db`; container label `mysql_baru`; environment/data provenance unclassified; owner is application owner; bounded allowlist is registered in `Database-Access.md`; observed principal `root@%` is overprivileged and is not a migration role | Registered for bounded read-only discovery only; migration source approval, least-privilege role, and owner environment classification remain open. No secret is recorded. |
| Consistent source snapshot | Snapshot ID/time, source schema hash, row manifest/count method, isolation/consistency method, backup location/restore evidence, retention | Not provided. Perlu menetapkan apakah `dompis_db` lokal adalah salinan sumber migrasi atau harus dibuat snapshot konsisten dari server produksi. |
| PostgreSQL development target | PostgreSQL 18.7; local Unix socket (configured port 5432); database `dompis_v3`; development environment; application owner; `public` schema; observed role `pakbreng` | Identity registered for local development metadata/synthetic access only. Role is verified SUPERUSER/CREATEDB/CREATEROLE/REPLICATION, so it is not an acceptable runtime/migration role. No dedicated least-privilege role or isolated restore rehearsal is registered. `dompis_v3_dev` is absent. |
| Rollback/restore rehearsal | Procedure reference, backup verification, restore-test date/result, approver | Not performed on an isolated target; evidence and approver remain open. Do not reset the persistent `dompis_v3` database. |

Acceptance: source snapshot immutable dan dapat diidentifikasi; metadata/credential cocok dengan registry melalui target guard; read role tidak dapat menulis; target rehearsal terisolasi dan restore terbukti. Identitas server saja tidak cukup untuk mengizinkan ETL.

## Exit checklist Phase 0C

- [ ] C0C-01: sanitized `/nossa` open and `/nossa-closed` closed response pair recorded; still need closed→open evidence and pagination/window ordering/completeness contract. Owner lifecycle rule is already decided.
- [ ] C0C-02: maximum-hour values supplied and legacy code paths mapped (including Max TTR booking/guarantee rules); still need raw NOSSA TTR unit/rounding and active report date/denominator contract. Regular countdown is 24h for v3. MTTR is deferred and not a gate.
- [ ] C0C-03: implement and verify the owner-provided master table mapping; unmatched/blank Workzones preserved as NULL/out-of-scope. Optional dictionary may repair the 74 unmatched keys later. No per-Region owner crosswalk is required.
- [x] C0C-04: current role policy decided (Superadmin only operational/global grants; equal middle-role cohort has zero grants; Helpdesk/Technician deferred; imported users inactive until validated). Per-user scope parity remains migration QA.
- [ ] C0C-05: 84/84 field disposition and historical eligibility validated; archive/PII access and retention policy approved.
- [ ] C0C-06: source snapshot/read-only role dan isolated PostgreSQL target/restore terdaftar.
- [ ] Security, rollback, test results, unresolved risks dan implementation plan diperbarui; pemilik menyetujui exit gate.

Setelah checklist lengkap, lakukan review parity dan acceptance test, perbarui `Decision-Log.md`, `Phase-0C-Contract-Access-Discovery.md`, `Phase-0D-Design-Readiness.md`, dan `Handover.md`. Jangan mulai legacy ETL sebelum semua gate relevan lulus.
