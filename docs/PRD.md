# DOMPIS — Product Requirements Document

**Versi:** 1.1 — Migration Ready | **Tanggal:** 26 November 2026 | **Status:** Blueprint untuk review, bukan aplikasi siap produksi

## 1. Tujuan
Bangun ulang DOMPIS sebagai pusat monitoring ticket berbasis NOSSA. Prioritas: data benar, cepat dibaca, near-real-time sesuai batas upstream, aman, dan mudah dipelihara. Pertahankan kebutuhan operasional, bukan kompleksitas implementasi lama. Stack wajib: Svelte (SvelteKit untuk routing/build, adapter-static SPA internal), Bun, ElysiaJS, TypeScript strict, Drizzle ORM, PostgreSQL. Tidak ada MySQL/piloting ticket sebagai sumber ticket runtime. Frontend dan API satu origin. Rekomendasi awal PostgreSQL 18 dengan UUIDv7 native; jika versi lain dipilih gunakan UUIDv7 di aplikasi atau UUIDv4 native secara konsisten.

## 2. Pengguna dan scope
Superadmin: administrasi user, scope, status sync, audit; admin/Helpdesk: ticket dan laporan sesuai izin; senior leader/admin branch: read-only sesuai scope (mapping role perlu disetujui). Tidak ada role teknisi aktif. Scope workzone adalah unit otorisasi terkecil; region/branch hanya membantu pemilihan scope. Global access eksplisit, bukan berarti daftar scope kosong. Tidak ada akses publik.

## 3. Ruang lingkup produk
| ID | Menu | Kebutuhan utama | Prioritas |
|---|---|---|---|
| F01 | Ticket Management | Overview; Customer, Proactive, Unspec, Non Technical, SQM Update, Obsolete; anomaly Unknown/Unspec/Blank; daftar active dan closed hari ini, filter area/branch/workzone/dept/jenis/status/flag; detail incident, status freshness, SLA/aging, pencarian exact incident/service no | P0 |
| F02 | Semesta | Daftar historis, rentang tanggal reported, kartu summary, breakdown B2C/B2B/netral, trend jenis, workzone, recurring/GAUL hanya jika field tersedia; export scoped | P1 |
| F03 | Rekap Workorder | Matrix per workzone/SA/branch, bucket, open/close, detail sel, hourly close; hilangkan metrik jumlah teknisi/assignment | P1 |
| F04 | Detail WO HI | Daftar operasional hari ini, incident, status, workzone, usia, reported/booking/resolve/closed, jenis dan Max TTR; export sesuai scope | P1 |
| F05 | Login & settings | Login username, sesi aman, user dan workzone scope, monitoring sync, audit | P0 |

F01 harus bisa dipakai mandiri sebelum menu P1. Detail drawer membaca payload detail dari DB lokal, bukan memanggil upstream otomatis. Tidak ada assign/pickup, auto assign, attendance, tracking teknisi, clustering, war map/KML, evidence, dispatch webhook, spreadsheet sync, push notification, integrasi piloting, manual import ticket oleh pengguna. Migrasi historis satu kali oleh operator merupakan requirement terpisah. SQM Update dan pending DOMPIS adalah data lokal potensial: tidak diasumsikan tersedia di endpoint; tampilkan hanya dari field terverifikasi atau fitur annotation lokal setelah persetujuan. Default MVP read-only ticket. Jangan membuat status upstream palsu dari catatan lokal.

## 4. User stories dan acceptance criteria
- AC01: user login dengan username/password, role dan scope dibaca server; akses incident di luar scope menghasilkan 404, laporan tidak membocorkan count luar scope; session logout dicabut.
- AC02: ticket ditemukan melalui incident unique; satu incident hanya satu baris walaupun muncul di kedua endpoint; ID UUID tidak berubah ketika closed/reopen.
- AC03: ticket aktif lama tetap tampil walau tidak tersinkron hari ini; closed hanya masuk WO HI bila closed_at dalam [00:00 WIB, besok 00:00 WIB). Closed tanpa timestamp tampil sebagai anomali, bukan dihitung closed hari ini. Status unknown tidak otomatis dianggap open. Set status operasional disahkan berdasarkan fixture lama.
- AC04: filter disimpan dalam URL, cursor reset saat filter berubah; pagination 50/100; sort stabil; detail tidak mengambil seluruh payload pada daftar; keadaan loading/error/empty/stale berbeda.
- AC05: pada scope/filter/snapshot yang sama, count overview = anggota daftar, rekap cell = drill-down, B2C+B2B+netral+unknown (bila disetujui) = total; definisi metric tidak diduplikasi per route. Flag overlay boleh overlap dan tidak dijumlah sebagai total.
- AC06: input ulang halaman NOSSA identik tidak mengubah ticket atau history; payload lama tidak menimpa perubahan baru; reopen yang lebih baru bisa mengubah closed ke open; outage tidak menutup ticket dan checkpoint tidak maju untuk window tidak lengkap.
- AC07: indikator last successful scan per sumber, status degraded/stale, backlog quarantine; UI tidak mengklaim realtime saat endpoint lambat. Setelah commit, notifikasi perubahan atau polling memicu refetch tanpa reload halaman.
- AC08: ekspor memakai scope dan predicate yang sama, limit awal 50.000 baris, stream CSV, range dan concurrency dibatasi, CSV formula injection dicegah. XLSX hanya jika kebutuhan disahkan.
- AC09: laporan SLA memakai satu rule version, denominator hanya ticket eligible dengan timestamp valid; null ditampilkan sebagai tidak tersedia, bukan 0/comply.

## 5. Definisi data dan KPI
Pertahankan konsep operational_bucket, kpi_seg, jenis_tiket_1/2, source_ticket, classification_flag/path, channel, customer_type/segment, service_type, guarantee, gamas, booking date dan TTR. Rule port dari config/operational-buckets.ts, config/jenis-tiket.ts, lib/classify-jenis-vlookup.ts, services/kpi-bucket-sql.ts, lib/rekap/rekap-classify.ts, tickets/ttr-comply.ts, tickets/effective.ts. Seed source_vlookup lokal dari mapping sah; bukan sumber ticket eksternal. Audit selisih antara classifier Rekap JS dan SQL generated lama sebelum menentukan precedence tunggal. PREMAN/netral dan unknown jangan hilang. Jangan menganggap seluruh status operasional KPI sebagai terminal: legacy CLOSE_STATUS_VALUES dan SLA matrix memuat CLOSED/CLOSE/FINALCHECK/MEDIACARE/SALAMSIM/RESOLVED; definisi ini perlu uji bisnis khusus FINALCHECK. Simpan status mentah, canonical lifecycle terpisah.

Usia = asOf - reported_at untuk open; durasi closed = closed_at - reported_at; invalid negatif -> null/quality issue. TTR deadline = reported + SLA yang ditentukan jenis/customer type; gunakan satuan detik (contoh 3,6 jam = 12.960 detik). Compliance hanya ketika eligible closed dan closed_at valid, dengan <= deadline. Effective Max TTR untuk tampilan (booking+3 jam, guarantee+P1/P+, dll) berbeda dari compliance; jangan gabungkan tanpa sign-off. Laporan Semesta default reported date, rekap/WO HI default active + closed hari ini, hourly close berdasarkan closed_at WIB. Metric recurring memerlukan histori service_no dan aturan lookback disahkan; historical backlog per hari tidak bisa direkonstruksi dari current state saja.

## 6. Target nonfungsional (hipotesis, harus diuji)
- API list p95 <= 350 ms, detail <= 200 ms; overview/rekap harian <= 1 s; Semesta 31 hari <= 2 s; p99 dan error rate diukur, target error <1% non-4xx.
- Uji 1,2 juta dan 3,5 juta ticket sintetis distribusi realistis, 20/80/200 VU (adaptasi stress-test.js), ingestion bersamaan; cold/warm cache terpisah. SSD/NVMe direkomendasikan; HDD perlu baseline tersendiri. Jangan janjikan target sebelum EXPLAIN dan benchmark.
- Poll open awal 2–5 menit, closed 5–15 menit, adaptif budget. Target 95% event perubahan muncul <= 5 menit bila upstream menyediakan data tepat waktu dan kuota cukup; ukur upstream lag terpisah. UI refetch <= 15 detik setelah commit jika stream sehat; fallback polling 30 detik. RPO awal 15 menit, RTO 2 jam, validasi restore.
- Mobile responsive, WCAG AA, keyboard; tidak render ribuan baris; no secret di client; bounded resources; backup, observability dan runbook wajib.

## 7. Tahapan implementasi / release gate
1. Discovery: fixture sanitized NOSSA open/closed (minimal 100+ per sumber termasuk overlap/reopen/missing); kontrak date field, timezone, pagination, field map, scope, classification; rekonsiliasi legacy. Gate: kontrak dan rule disetujui.
2. Foundation: monorepo, PostgreSQL UUID, migration, auth, scopes, audit, CI, seed. Gate: test deny-by-default + backup restore.
3. Sync + F01: adapter, checkpoint, canonical writer, history, quarantine, API list/detail, UI, SSE/poll. Gate: idempotency, reopen, coverage, rate limit, restart/replay, perf test.
4. F02–04: shared metrics, pagination/report drilldown, export; agregasi opsional setelah profiling. Gate: golden comparison dan reconciliation per workzone/hari/bucket.
5. Shadow deployment dan cutover: baca Migration.md; pilot pengguna; rollback tanpa kehilangan DB baru.

## 8. Keputusan terbuka
Dokumentasi API dan 100 baris sampel /nossa tersedia; sampel /nossa-closed aktual belum tersedia; tidak ada akses live DB/endpoint, package manifest/lockfile, .env atau git checkout. Verifikasi field turunan dari piloting yang tidak ada di NOSSA, aturan SQM/Pending, mapping workzone/SA/branch, status FINALCHECK dan historical retention. Menu legacy yang berisi statistik teknisi dikeluarkan, bukan diganti angka nol. Rekomendasi SvelteKit static, PostgreSQL 18, session opaque, tanpa Redis adalah keputusan desain usulan. Tidak ada code atau database produksi yang diubah.

## v1.0 contract acceptance gate
All 100 supplied NOSSA rows must be parsed via sanitized equivalent fixtures; preserve source numeric TTR without asserting unit. Closed sample, lifecycle and KPI sign-off remain release blockers. Date filters upstream are Status_Date, not Last_Update_Ticket or Reported_Date. See Data-Contract.md and Sync-Engine.md. No use of /ticket-by-service in MVP.

## 9. Requirement migrasi historis (wajib v1.1)
- MIG01: seluruh baris tabel `ticket` MySQL pada snapshot yang disetujui harus tercatat sebagai imported/merged/quarantined/excluded; tidak ada kehilangan tanpa alasan. Canonical tickets mencakup seluruh incident historis eligible, termasuk sebelum 2026, bukan hanya archive. Manual tickets ditinjau, bukan dihapus diam-diam; excluded tetap tercatat sesuai retensi.
- MIG02: UUID stabil antar rerun dan sync; old ID mapping cold archive; legacy-only tidak diberi source_endpoint/hash palsu. Legacy bukan sumber runtime; setelah cutover hanya /nossa dan /nossa-closed memperbarui fakta upstream.
- MIG03: validasi semua scalar legacy, tanggal UTC/WIB, generated bucket, status_update, klasifikasi, SLA, field lokal dan scope; nilai KPI historis asli tetap tersedia untuk rekonsiliasi; angka baru hanya dari definisi disetujui. Tidak mengasumsikan manual/legacy metrics setara dengan NOSSA. Unknown/coverage gap ditampilkan.
- MIG04: snapshot restore verified, checkpoint idempotent, delta/freeze final, shadow reporting, backup, rollback dan sign-off sebelum switch. Data lama tetap aman read-only untuk masa rollback. Tidak ada query cross-DB runtime.
- MIG05: explicit allowlist field archive dan access; tidak ada payload pelanggan asli/credential dalam repo. Semua mapping, exclusion dan perubahan KPI harus disetujui pemilik bisnis. Lihat Legacy-Field-Mapping.md, Migration.md, Migration-Validation.md.
