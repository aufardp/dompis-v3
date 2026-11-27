# Phase 0C — Paket Bukti dan Keputusan Pemilik

Status: **belum disetujui; lembar kerja untuk menutup gate Phase 0C**. Jangan isi dengan credential, payload pelanggan asli, nama pengguna, atau data pribadi. Lampirkan artefak sanitasi secara terpisah dan batasi field yang tidak relevan.

Paket ini mengonsolidasikan input yang masih kurang setelah discovery statis. Nilai yang kosong berarti belum diputuskan; agent tidak boleh mengisinya dengan asumsi. Keputusan bisnis dicatat pemilik aplikasi, sedangkan kontrak teknis harus didukung artefak upstream atau bukti dari snapshot yang terdaftar.

## A. NOSSA dan lifecycle — C0C-01 / C0C-02

### Bukti kontrak yang diperlukan

- Versi/tanggal authoritative OpenAPI atau dokumentasi kontrak yang digunakan:
- Sanitized response `/nossa-closed` (minimal satu row, pertahankan nama/tipe field, null/missing, envelope, dan format timestamp):
- Sanitized reopened incident yang sama sebelum dan sesudah reopen, atau konfirmasi tertulis bahwa sampel tersebut tidak tersedia:
- Pagination ordering/cursor atau tie behavior pada timestamp yang sama:
- Closed-window boundary, completeness, rate/error/retry behavior yang dikonfirmasi:
- Sumber bukti, pemilik/upstream, tanggal diterima:

Fixture tidak boleh memuat identifier pelanggan asli. Nilai yang disamarkan harus mempertahankan struktur, tipe, format, serta pola null/missing yang diperlukan untuk menguji parser.

### Keputusan bisnis yang diperlukan

| Pertanyaan | Keputusan pemilik |
|---|---|
| Status upstream mana yang berarti lifecycle `open`, `closed`, atau `unknown`? Cantumkan seluruh status yang dikenal dan aturan status baru/tidak dikenal. | **Ditetapkan pemilik (2026-11-27):** `NEW`, `DRAFT`, `ANALYSIS`, `PENDING`, `BACKEND` = open; `FINALCHECK`, `RESOLVED`, `MEDIACARE`, `SALAMSIM`, `CLOSED` = closed. Daftar status ini adalah nilai yang diberikan pemilik; kelengkapan daftar dan perlakuan status lain belum ditetapkan. |
| Field dan aturan apa yang menentukan waktu penutupan? Apakah `resolved_at` berbeda dari `closed_at`? |  |
| Bagaimana tiket yang reopen direpresentasikan; kapan lifecycle kembali `open`; apakah riwayat status harus dibentuk dari sumber yang tersedia? | **Ditetapkan pemilik (2026-11-27):** incident yang sebelumnya berstatus kelompok closed lalu berubah ke status kelompok open dianggap reopen. Cara membuktikan/merekam transisi dari response NOSSA serta kebutuhan status-history tetap menunggu fixture dan kontrak upstream. |
| Jika `/nossa` dan `/nossa-closed` berbeda, bukti/version/timestamp mana yang menang? Bagaimana tie atau versi yang tidak dapat dibandingkan diperlakukan? |  |
| Apakah pencarian incident dapat mengembalikan parent/children, dan aturan mana yang mengidentifikasi incident canonical? |  |
| Approver dan tanggal keputusan: |  |

## B. Waktu, TTR, SLA dan KPI — C0C-02

| Field/aturan | Keputusan pemilik; tulis `unknown` jika belum diketahui |
|---|---|
| Zona waktu untuk setiap timestamp tanpa offset (reported, status, booking, resolved, closed, deadline) |  |
| Makna dan unit setiap TTR upstream (`TTR_Customer`, `TTR_Nasional`, `TTR_Regional`, `TTR_Witel`, `TTR_Mitra`, `TTR_Agent`, `TTR_END_TO_END`, `C_SLG_TTR`, dan lainnya yang dipakai) |  |
| SLA threshold dan basis jam kalender/kerja per segmen/jenis layanan |  |
| Batas comply (misalnya inklusivitas equality), pause/pending, hari libur, dan kasus yang tidak eligible |  |
| KPI numerator, denominator, tanggal basis, bucket/classifier version, serta unknown/null treatment untuk masing-masing menu |  |
| Approver dan tanggal keputusan |  |

Jangan menyetujui KPI berdasarkan nama field atau perilaku implementasi lama saja. Sampel golden input/output sintetis wajib dibuat setelah definisi disetujui.

## C. Master wilayah dan Workzone — C0C-03

Lampirkan CSV/lembar crosswalk tanpa data tiket, dengan kolom minimal berikut:

| Legacy region ID/code | Legacy region name | New area code | New area name | Approver/date |
|---|---|---|---|---|
|  |  |  |  |  |

Lampirkan kamus resmi Workzone code/name dan aturan normalisasi yang disetujui. Untuk 74 normalized ticket keys yang sebelumnya unmatched (7.171 rows) dan 47 rows blank/null, berikan disposition per key/group: match ke ID resmi, tetap unmapped/isolated, atau pengecualian dengan alasan. Jangan gunakan fuzzy match atau menebak parent.

Bukti agregat terbaru (2026-11-27): 393/393 nonblank `service_area.nama_sa` unik setelah `UPPER(TRIM(...))` dengan perbandingan byte-exact; 391/465 distinct nonblank ticket Workzone keys match tepat satu master, 74 tidak match (7.171 ticket rows), dan 47 ticket rows blank/null. Ini membuktikan keunikan key master saat ini, bukan bahwa `nama_sa` adalah kode Workzone resmi. Konfirmasi semantic code/name dan lampirkan crosswalk/dictionary tetap dibutuhkan.

Acceptance: exact normalized key uniqueness dibuktikan; setiap mapped key menunjuk satu master Workzone dan satu parent chain yang disahkan; unmatched/blank mendapat disposition eksplisit; tidak ada scope grant yang melebar akibat mapping.

## D. Role, account, dan effective scope — C0C-04

Keputusan yang sudah tercatat dan tidak perlu diulang:

- `superadmin` memiliki kontrol penuh; User Management hanya untuk `superadmin`.
- `admin` berganti nama menjadi `team_leader`; `admin_branch` menjadi `officer`; role lainnya tetap memakai nama yang disetujui.
- `officer`, `team_leader`, dan `senior_leader` harus setara satu sama lain, tetapi capability set bersama belum dipilih.
- `helpdesk` dan `teknisi` ditunda; assignment teknisi tetap di luar scope.
- Untuk scope v3 saat ini, capability catalog yang disetujui hanya diberikan kepada `superadmin`; peran lain belum mendapat operational grant. `superadmin` memegang explicit global data scope dan menjadi satu-satunya role yang dapat mengatur global/hierarchical scope; audit reader juga hanya `superadmin`.

Keputusan/bukti yang masih diperlukan:

| Pertanyaan | Keputusan pemilik |
|---|---|
| Capability produk apa yang diberikan kepada cohort setara `officer`/`team_leader`/`senior_leader`? Daftar capability code secara eksplisit; kosong berarti deny. |  |
| Akun legacy aktif otomatis? (default aman: tidak) |  |
| Bagaimana 13 user yang tidak memperoleh leaf dari union direct FK+junction diperlakukan sampai role/global exceptions dan per-user parity selesai? (default aman: jangan aktifkan) |  |
| Metadata audit yang boleh dibaca dan periode retensi |  |
| Apakah role change/credential reset termasuk User Management? Reset harus memakai flow aman, bukan password berbasis username. |  |
| Approver dan tanggal keputusan |  |

Acceptance migrasi: pada snapshot yang terdaftar, hitung effective leaf scope lama dari seluruh direct FK dan junction grants, role/global exceptions, lalu bandingkan per-user dengan target; semua privilege delta harus disetujui. Tidak ada aktivasi akun sebelum parity lolos.

## E. Field, eligibility, PII, dan archive — C0C-05

Isi disposition eksplisit untuk setiap 84 scalar field pada `Legacy-Field-Mapping.md` setelah source DDL/snapshot didaftarkan. Gunakan tepat satu disposition utama:

- `ticket_typed`: kolom kanonik; jelaskan transformasi, sumber waktu/tipe, null/invalid rule dan alasan produk.
- `archive_allowlisted`: payload historis terbatas; sebut field allowlist, role yang boleh mengakses, tujuan, dan retention period.
- `restricted_offline`: hanya backup terenkripsi di luar runtime; sebut owner dan retention.
- `exclude`: alasan terdokumentasi dan bukti bahwa field tidak diperlukan oleh produk/histori; perlu persetujuan pemilik.
- `derived`: aturan dan versi yang disetujui; jangan mengganti nilai historis secara diam-diam.

### Bukti kebutuhan produk yang sudah ditemukan

Ini adalah jejak pemakaian/requirement candidate dari `PRD.md` dan `Phase-0B-Discovery.md`, bukan keputusan retensi atau business rule baru:

| Menu | Field/kelompok candidate yang perlu diputuskan | Risiko/ketergantungan yang sudah diketahui |
|---|---|---|
| Ticket Management | incident/status/workzone; `operational_bucket`, `kpi_seg`, `jenis_tiket_1/2`, source/classification/customer/service fields; booking/TTR/SLA; flag dan annotation lokal | Predicate bucket/status/SLA berbeda antar jalur legacy; `status_update`, `pending_dompis`, dan SQM reason tidak dijamin NOSSA. Assignment/teknisi tidak boleh masuk scope produk. |
| Semesta | `reported_date`/`reported_at`; bucket/segment/type; workzone; `service_no`; GAUL/GAMAS references | PRD memilih reported-date untuk histori. Recurring/GAUL perlu bukti ketersediaan, definisi lookback/grouping, dan persetujuan denominator. |
| Rekap Workorder | reported/operational date basis; workzone/master; status; bucket/segment dan filter/drilldown dimensions | Classifier SQL dan JS legacy berbeda; technician metrics dikeluarkan dari scope. Summary/cell/drilldown harus memakai rule dan scope yang sama. |
| Detail WO HI | incident/status/workzone; reported, booking, resolved, closed timestamps; ticket type; age dan effective Max TTR | Legacy list/summary memakai builder berbeda dan offset paging. Date basis, lifecycle, SLA unit, dan Max TTR semantics perlu keputusan terpisah dari compliance KPI. |

Field names pada kelompok di atas harus dicocokkan satu per satu ke inventaris 84 field dan kandidat target. Jejak consumer legacy membantu mengidentifikasi risiko bila field dihapus, tetapi tidak membuktikan bahwa field boleh dipertahankan, dipublikasikan, atau dijadikan fakta NOSSA.

Daftar kandidat pada mapping saat ini belum merupakan izin untuk menyimpan atau membuang field. Periksa khusus PII, free text, user/technician references, local/manual annotations, validation, pending, SLA/TTR historis, dan generated fields. Tidak boleh menghapus field/data eligible tanpa alasan dan disposition yang disetujui.

| Keputusan umum | Keputusan pemilik |
|---|---|
| Kriteria ticket historis yang eligible; termasuk manual/local-only |  |
| Archive allowlist, reader roles, export prohibition/permission, retention, dan disposal evidence |  |
| PII/free-text retention dan kebutuhan encrypted offline backup |  |
| Approver dan tanggal keputusan |  |

Acceptance: 84/84 row memiliki disposition dan transform yang dapat diuji; setiap field yang tidak disimpan memiliki alasan; data archive dibatasi sesuai policy; golden fixture menunjukkan exact row accounting tanpa kehilangan field eligible.

## F. Registrasi sumber dan target — C0C-06

Jangan menaruh password, DSN, token, atau secret di lembar ini. Kirim secret melalui mekanisme lokal yang disetujui dan jangan masukkan ke Git/Handover.

| Registry item | Nilai non-secret yang diperlukan | Status/owner |
|---|---|---|
| Legacy MySQL discovery source | MySQL 8.0.46; loopback `127.0.0.1:3306`; database `dompis_db`; container label `mysql_baru`; environment/data provenance unclassified; owner is application owner; bounded allowlist is registered in `Database-Access.md`; observed principal `root@%` is overprivileged and is not a migration role | Registered for bounded read-only discovery only; migration source approval, least-privilege role, and owner environment classification remain open. No secret is recorded. |
| Consistent source snapshot | Snapshot ID/time, source schema hash, row manifest/count method, isolation/consistency method, backup location/restore evidence, retention | Not provided; no consistent snapshot is registered. |
| PostgreSQL development target | PostgreSQL 18.7; local Unix socket (configured port 5432); database `dompis_v3`; development environment; application owner; `public` schema; observed role `pakbreng` | Identity registered for local development metadata/synthetic access only. Role privilege attributes and dedicated non-superuser migration role remain unverified. `dompis_v3_dev` is absent. |
| Rollback/restore rehearsal | Procedure reference, backup verification, restore-test date/result, approver | Not performed on an isolated target; evidence and approver remain open. Do not reset the persistent `dompis_v3` database. |

Acceptance: source snapshot immutable dan dapat diidentifikasi; metadata/credential cocok dengan registry melalui target guard; read role tidak dapat menulis; target rehearsal terisolasi dan restore terbukti. Identitas server saja tidak cukup untuk mengizinkan ETL.

## Exit checklist Phase 0C

- [ ] C0C-01: authoritative API contract dan sanitized closed/reopened fixture tervalidasi; pagination, error, dan completeness behavior terdokumentasi.
- [ ] C0C-02: status/lifecycle/reopen, source conflict, timezone, TTR/SLA, dan KPI decisions disetujui serta memiliki golden fixtures.
- [ ] C0C-03: parent-area crosswalk, Workzone dictionary, uniqueness, unmatched/blank dispositions, dan scope implications tervalidasi.
- [ ] C0C-04: role/capability policy, account activation, global grants, no-leaf treatment, dan exact per-user effective-scope parity disetujui.
- [ ] C0C-05: 84/84 field disposition, eligibility, archive/PII access, retention dan exclusion rationale disetujui.
- [ ] C0C-06: source snapshot/read-only role dan isolated PostgreSQL target/restore terdaftar.
- [ ] Security, rollback, test results, unresolved risks dan implementation plan diperbarui; pemilik menyetujui exit gate.

Setelah checklist lengkap, lakukan review parity dan acceptance test, perbarui `Decision-Log.md`, `Phase-0C-Contract-Access-Discovery.md`, `Phase-0D-Design-Readiness.md`, dan `Handover.md`. Jangan mulai legacy ETL sebelum semua gate relevan lulus.
