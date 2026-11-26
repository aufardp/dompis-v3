# Phase 0A — Legacy Discovery and Database Audit

Tanggal: 2026-11-26. Status: parsial; database audit tertahan.

## Ruang lingkup dan sumber

Target project adalah `/Users/pakbreng/Projects/dompis-v3`; blueprint berada di repo target, source legacy di `/Users/pakbreng/Projects/dompis_v2`. Source legacy tidak diubah. Repo legacy: branch `main`, HEAD `e786d6e49d5a35a3302d81c0d8c640c9da3dff9b`, working tree bersih.

Dibaca/ditinjau: blueprint AGENTS/README/PRD/Architecture/Database/schema proposal/Security/Design System/Migration/field mapping/data contract/sync/organization/master migration/quality gates/query & performance standards/implementation plan/decision log/discovery protocol/database access/handover; legacy `AGENTS.md`, `prisma/schema.prisma`, package manifest, dokumentasi SLA/TTR, sync contention, query hot paths, filter consistency, pagination, connection budget, phase 2 dan production rollout; source organisasi, laporan, klasifikasi, sync dan ticket.

## Evidence matrix

| Area | Bukti statis | Status / gap |
|---|---|---|
| Schema ticket | Prisma MySQL; `ticket.incident` unique; PK integer auto increment; banyak tanggal string; parallel `reported_date_dt` | Actual deployed DDL dan drift belum dibaca |
| Organisasi | Legacy region → branch → area → service_area; `area` punya `branch_id`, `service_area` punya `area_id` | Mapping v1.3 mengubah area menjadi service_area dan SA menjadi workzone; orphan/duplicate belum dihitung |
| User scope | Kolom langsung user region/branch/area + junction user_region/user_branch/user_area/user_sa | Effective access semantics/overlap belum dibuktikan dari data dan semua authorization paths |
| Workzone | Exact join `service_area.nama_sa = ticket.workzone`; route opsi mengambil maksimal 500; v1.3 minta normalized direct code matching | Tidak ada bukti keunikan global/normalisasi; harus diuji dengan agregasi metadata setelah DB target terdaftar |
| Sync | `/nossa`, `/nossa-closed`; docs menyebut offset pagination, limit 1.000, offset ceiling 5.000, date windows dan rate limits | Belum cocokkan aktual OpenAPI/fixture; live endpoint tidak dipanggil |
| Reports/business | Daily board, Semesta, Rekap WO, WO HI, SLA/TTR dan classification punya aturan di beberapa layanan/config | Semantics tanggal, status, eligibility, precedence, denominator perlu golden fixtures dan owner validation |
| Performance/debt | Banyak worker dan queue, raw payload/ticket_raw/projection, banyak index kandidat, string dates, count/list berulang; dokumentasi lama mencatat contention | Angka historis hanya referensi dokumen, bukan pengukuran audit ini; perlu profil pada restore/target approved |
| Stack | Legacy Next 16/React 19/Prisma 6/MySQL/Node workers | Bukan target stack; kompatibilitas Bun/Svelte/Elysia/Drizzle/PG18 belum diuji pada tahap discovery |

## Koneksi database

Tidak ada koneksi yang dicoba. Pembacaan tersanitasi dari konfigurasi legacy hanya menunjukkan `DATABASE_URL` mengarah ke MySQL `localhost:3306/dompis_db`; environment, owner, role, schema allowlist dan apakah itu data produksi tidak diketahui. Variabel PG/target baru tidak terdaftar pada file kebijakan yang tersedia. `Database-Access.md` meminta pendaftaran target dan discovery read-only. Karena host lokal tidak menentukan environment dengan aman, query dihentikan sebelum koneksi. Tidak ada SQL/EXPLAIN atau data record yang dibaca.

## Technical debt dan koreksi blueprint

1. Jangan menyamakan kesamaan nama Service Area dengan kode Workzone; validasi uniqueness setelah normalisasi serta crosswalk wilayah.
2. Jangan menganggap role/junction/direct FK lama sebagai hak efektif baru; bandingkan effective leaf scopes per user.
3. Jangan membawa pipeline raw/projection/Redis/BullMQ multiworker sebagai runtime baru; tetap gunakan bukti bisnis/source contract saja.
4. Lakukan profiling pada restore/isolated DB. Index dan ukuran batch blueprint adalah kandidat, bukan instruksi untuk diterapkan tanpa plan.
5. TTR/KPI dan klasifikasi legacy berubah lintas dokumen/ADR; tandai kandidat sampai rule dan fixture disetujui.

## Checklist Phase 0A

- [x] Baca instruksi blueprint dan policy akses yang tersedia.
- [x] Catat legacy revision/status tanpa mengubah repo.
- [x] Tinjau schema, master/scope, workzone matching, ticket/report/sync source.
- [x] Tinjau technical debt dan audit dokumen legacy.
- [x] Sanitasi metadata konfigurasi tanpa mencetak secret.
- [x] Baca instruksi dan dokumen blueprint yang tersedia di project target; beberapa output pembacaan gabungan terpotong dan perlu dituntaskan bila diperlukan.
- [ ] Daftarkan/identifikasi MySQL dan PG target serta verifikasi environment/identity.
- [ ] Audit deployed schema/index/FK/row estimates; sampling agregat aman dan bounded.
- [ ] Analisis master duplicate/orphan, user-scope parity, Workzone uniqueness.
- [ ] Validasi endpoint contract (fixture/OpenAPI); jangan live call tanpa budget approval.
- [ ] Lengkapi business/report rule inventory dengan file/line dan pertanyaan owner.
- [ ] Bandingkan compatibility stack di project baru dan siapkan acceptance/test plan.

## Keputusan yang menunggu validasi

- Target MySQL yang tepat dan apakah snapshot/restore read-only tersedia; target PG18 dev/staging; target labels, allowed schema, owner/roles.
- Normalisasi Workzone dan definisi kode resmi; apakah keunikannya global atau memerlukan parent wilayah.
- Efektivitas dan precedence scope user lama, status aktif, akun/role yang dipertahankan, password reset/retention.
- Semantik tanggal/tz, status close/reopen, TTR units/thresholds/clock, KPI classification and membership, report date basis/denominators.
- Kontrak NOSSA field types, update timestamp/version, null-vs-missing, pagination/order/window inclusivity, closed sample parity.
- Retensi PII/archive, field eligibility historis, accept/reject policy bagi orphan/duplicate/unknown scope.

## Acceptance gate untuk menyelesaikan 0A

Evidence dari target DB terdaftar: DDL/FK/index/collation/timezone; row estimates dan bounded distinct/null/duplicate/orphan summaries; keunikan Workzone setelah normalisasi dan contoh ambigu tanpa PII; effective scope crosswalk agregat; struktur ticket dan mapping field. Catat perbedaan blueprint/source/DB. Hasil SQL aktual, waktu/row count, batas dan query template tersanitasi harus masuk Handover. Tidak ada perubahan DB pada Phase 0A.
