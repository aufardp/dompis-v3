# Phase 0B — Business Rules Discovery

Tanggal: 2026-11-26. Status: **discovery candidate inventory selesai; tidak ada rule yang disahkan untuk implementasi**.

Phase ini mengekstrak maksud dan perilaku legacy dari checkout `/Users/pakbreng/Projects/dompis_v2` dan membandingkannya dengan PRD v1.3. Source legacy tetap read-only. Hasil kode adalah evidence perilaku saat ini, bukan kebenaran bisnis. Konflik yang belum diadjudikasi masuk daftar owner decisions; tidak ada KPI, status, SLA, atau lifecycle yang diubah.

## Bukti empat menu

| Menu | Evidence path legacy | Perilaku yang terlihat | Status kebutuhan baru |
|---|---|---|---|
| Ticket Management | `app/config/operational-buckets.ts:50-160`; `app/libs/services/daily-ticket-where.ts:50-123,228-350`; `app/libs/ticket-utils.ts:35-75`; `app/api/tickets/daily/detail-wo-hi/route.ts:88-171` | Bucket operasional, anomaly alias, daily list, status-update grouping, local pending, closed-today dan filter/detail berada di beberapa jalur. | Pertahankan kebutuhan monitoring dan filter; sumber status/fact dari NOSSA; local-only SQM/pending tidak boleh diasumsikan tersedia atau dijadikan source fact. Rule membership, daily date basis dan local annotation menunggu owner. |
| Semesta | `app/api/dashboard/semesta-analytics/route.ts:22-62`; `app/libs/services/tickets.service.ts:1090-1472`; `app/admin/semesta/page.tsx:339-412` | Dua implementasi analytics punya default date range/granularity berbeda. Versi V2 menghitung tren reported-date, breakdown type/workzone, dan GAUL-style recurring berdasarkan service number. | PRD memilih reported date untuk histori; recurring hanya bila field dan lookback disahkan. Versi/denominator tidak dipilih sebelum fixture dan owner review. |
| Rekap Workorder | `app/api/dashboard/rekap-workorder/route.ts:69-460`; `app/api/dashboard/rekap-workorder/queries.ts:106-190,502-560`; `app/api/dashboard/rekap-workorder/aggregate.ts`; `lib/rekap/rekap-classify.ts:85-145,190-343` | SQL membentuk aggregate berdasarkan master/nama SA/workzone/status/bucket; layer JS membangun summary/drilldown; route juga memanggil query metrik teknisi. | Pertahankan matrix dan drilldown scoped; hilangkan metrik teknisi sesuai PRD. Predicate, klasifikasi dan numerator/denominator harus shared dan parity-tested; jangan port SQL/classifier. |
| Detail WO HI | `app/api/tickets/daily/detail-wo-hi/route.ts:88-250`; `app/libs/services/daily-ticket-where.ts:300-530` | Filter dept/search/workzone/branch/customer type/status/date; list memakai reported_date dan offset pagination, summary dibangun lewat jalur terpisah. | PRD menghendaki shared filter dan status/aging/Max TTR; date basis, closed semantics dan parity summary-list menunggu golden fixture/owner. |

## Kandidat classification dan konflik implementasi

1. `app/config/operational-buckets.ts:50-160` mendeklarasikan enam bucket (`kpi_customer`, `kpi_proactive`, `non_kpi_unspec`, `non_technical`, `sqm_update`, `obsolete`) dan tiga anomaly (`unknown`, `unspec`, `blank`). Config menggambarkan `kpi_proactive` dengan channel 50/83 + TECHNICAL, Unspec dengan channel 28 + `jenis_tiket_1`, dan bucket lain dengan daftar jenis/flag.
2. Source executable bukan satu rule tunggal. `app/libs/services/kpi-bucket-sql.ts:75-175` dan generated column migration `prisma/migrations/20260913070000_add_operational_bucket/migration.sql:17-118` menggunakan predicate LIKE/substring yang berbeda dari deskripsi config: channel tidak terlihat pada predicate; Unspec memakai `jenis_tiket_2`; syarat `classification_flag` dan jenis tidak identik. Generated precedence tercatat obsolete → customer → proactive → unspec → SQM update → non-technical.
3. `lib/rekap/rekap-classify.ts:85-145` memberi precedence lain: obsolete → non-technical → proactive/SQM update/Unspec → customer, dan memakai `is_sqm_update`. Ini dapat membuat bucket berbeda dari generated-column SQL pada baris yang overlap/unknown. Belum dibuat fixture parity dan belum dipilih sumber rule baru.
4. `kpi_seg` generated expression berada di migration yang sama (`:110-117`); `customer_type`, `customer_segment`, jenis dan segmen report dipakai lintas route. PRD meminta `b2c + b2b + netral + unknown = total` hanya jika kategori dan null handling disetujui; SQL default saat ini dapat menempatkan nilai tak dikenal ke B2B. Definisi baru belum disahkan.
5. `OPERATIONAL_KPI_STATUSES` memuat ANALYSIS, BACKEND, DRAFT, FINALCHECK, PENDING (`operational-buckets.ts:50-57`), tetapi sumber juga memiliki status close candidates dan status-update lokal. Apakah daftar ini eligibility KPI, status tampilan, atau filter operasional belum jelas.

## Lifecycle dan daily membership

- Legacy `CLOSE_STATUS_VALUES` mengelompokkan CLOSED, CLOSE, FINALCHECK, MEDIACARE, SALAMSIM, RESOLVED (`app/libs/ticket-utils.ts:35-47`). `/nossa` sendiri dapat mengandung status CLOSED; endpoint bukan penanda lifecycle. `resolved date`/`C_RESOLVE_DATE` belum terbukti sebagai saat penutupan.
- Daily helper memiliki mode lama berdasar `sync_date` + status/closed-at + `pending_dompis` (`daily-ticket-where.ts:50-93`), sedangkan jalur normal menyertakan semua status yang bukan anggota close set atau status close dengan `closed_at` hari ini. Customer bucket memiliki filter sync-date/pending tersendiri (`:95-123`). Ini perilaku yang berbeda; tidak ditafsirkan menjadi “tiket aktif hari ini” tanpa owner contract.
- Rekap menggunakan kombinasi `syncDate`, daily union dan bucket classifier; Detail WO HI menerima `includeClosed`, reported date, dan status filter lewat builder/summary berbeda. Acceptance wajib membandingkan list/summary/drilldown dengan snapshot serta scope yang sama.
- Reopen, source timestamp yang menang, status unknown, closure timestamp, dan histori transisi harus memakai field source yang tervalidasi. Jangan close dari ketiadaan pada salah satu endpoint.

## SLA/TTR, denominator dan waktu

- `app/libs/tickets/ttr-comply.ts:22-280` menghitung compliance atas close-status set + `resolveAt`, parsed `reportedDate`, threshold per B2C customer type/B2B jenis, dan mengecualikan beberapa kondisi dengan `null`. SQM-CCAN menggunakan 08:00–17:00 WIB + 4 jam; MANJA P1 memakai booking date + 3 jam. Ini adalah perilaku code, belum merupakan definisi baru yang disahkan.
- `app/libs/tickets/effective.ts` menentukan deadline display terpisah dari compliance; `app/libs/priority/ttr.ts:5-145` memiliki state/threshold lain. Jangan menyatukan displayed Max TTR, SLA deadline, MTTR dan KPI compliance.
- Ada konflik dokumentasi/code nyata: `docs/sla-ttr-matrix.md:43-50` mencatat Indibiz 4 jam dan Reseller 6 jam; `app/config/jenis-tiket.ts:98-139` menetapkan keduanya 24 jam. Selain itu versi matrix dan prioritas/display memiliki alur berbeda. Tidak ada angka yang dipilih sebagai final.
- Denominator harus mengecualikan kasus tidak eligible/null timestamp sebagai unavailable, bukan otomatis comply/0 (PRD AC09). Owner harus menetapkan eligible statuses, close timestamp field, timezone parsing, inclusivity (`<=` atau batas lain), threshold dan denominator per segmen. Timestamps offsetless dan source raw TTR tidak diberi semantik tambahan.

## Semesta recurring / GAUL evidence

Pada `tickets.service.ts:1090-1245`, analytics V2 memakai `reported_date_dt`; query recurring menghitung incident berbeda untuk service number valid selain kosong/`NN`, dikelompokkan dengan workzone, dan mencari incident lain dalam ±60 hari. Kedua sisi relasi harus masuk rentang laporan terpilih; relasi `EXISTS` tidak mewajibkan workzone sama. Output diurutkan berdasarkan occurrences saja dan dipotong ke 100 grup, lalu nilai KPI GAUL dijumlah dari grup terbatas itu sehingga totalnya dapat undercount. Ada query `ticket_id_gamas` terpisah. Jalur LAPUL saat ini selalu mengembalikan kosong menurut komentar source karena satu current row per incident. Ini observasi query, bukan definisi GAUL yang disetujui. Pertanyaan produk yang tersisa: occurrence minimum/lookback, cross-Workzone, normalisasi service number, perlakuan induced/parent ticket dan batas rentang report terhadap lookback. Jika v3 perlu top services, total agregat harus dihitung terpisah dari daftar detail terbatas.

Versi analytics lain (`tickets.service.ts:1472-1575`) memiliki fallback date default berbeda dari V2 dan menghitung open/closed/on-progress dari `status_update`. Baseline P1 “reported date” dalam PRD tidak menyelesaikan status taxonomy, default range, granularity, atau recurring denominator.

## Scope, filter, ekspor

- Owner v1.3 menetapkan grants hirarkis union + filter intersection, dedup overlap, deny-by-default; legacy paths memiliki role/global exceptions. Hasil Phase 0A master/scope profile dicatat di `Phase-0A-Discovery.md`; per-user effective leaf parity dan role exceptions perlu synthetic/owner-approved cases sebelum permission implementation.
- Semua menu/export/API/SSE perlu memakai predicate domain/scope yang sama. Ticket search exact incident/service_no dan filter dept/status/flag perlu synthetically tested. `detail-wo-hi` menggunakan offset page; DOMPIS baru wajib keyset sesuai blueprint dan stable sort.
- Export legacy dapat mengandung contact/customer fields. Field allowlist, PII mask, permission, retention dan audit dibahas di Phase 0C; tidak disalin ke fixtures.
- Teknisi/assignment muncul pada tabel dan query legacy Rekap, tetapi berada di luar scope produk; tidak ada metrik nol pengganti dan tidak ada assignment implementation.

## Konflik dan keputusan owner

| ID | Konflik/fact gap | Evidence | Keputusan yang diperlukan |
|---|---|---|---|
| B0B-01 | Bucket definitions, executable SQL/generated field, dan Rekap JS classifier memakai predicate/precedence berbeda | `operational-buckets.ts`; `kpi-bucket-sql.ts`; migration; `lib/rekap/rekap-classify.ts` | Pilih intent per input, source/channel/type/flag precedence, unknown/null policy; owner-approved synthetic expected rows |
| B0B-02 | Indibiz/Reseller SLA matrix tidak cocok dengan config values | `docs/sla-ttr-matrix.md:43-50`; `app/config/jenis-tiket.ts:98-139` | Owner SLA menetapkan jam dan versi efektif; jangan backfill/reclassify sebelum keputusan |
| B0B-03 | Status close set mencakup FINALCHECK/MEDIACARE/SALAMSIM/RESOLVED; arti closed vs resolved tidak konsisten dengan contract fields | `ticket-utils.ts:35-47`; `Data-Contract.md`; `ttr-comply.ts` | Status taxonomy, canonical status dan timestamp close/reopen disahkan |
| B0B-04 | UI Max TTR, priority countdown dan compliance KPI memakai basis/threshold berbeda | `effective.ts`; `priority/ttr.ts`; `ttr-comply.ts`; SLA matrix | Tetapkan metric per UI/KPI, denominator, unit, timezone, due-at inclusivity |
| B0B-05 | Semesta V1/V2 default range, trend granularity, status metric dan recurring logic berbeda | `tickets.service.ts:1090-1245,1472-1575` | Pilih date default/range, trend, status mapping, GAUL/recurring lookback + group semantics |
| B0B-06 | Daily board, customer-bucket sync-date, Rekap and Detail WO HI punya membership/filter builders berbeda | `daily-ticket-where.ts`; `rekap-workorder/queries.ts`; `detail-wo-hi/route.ts` | Sahkan per-menu membership/date basis; golden parity list-summary-drilldown |
| B0B-07 | SQM Update dan pending DOMPIS bergantung pada field lokal yang tidak dijamin NOSSA | `operational-buckets.ts`; daily filter; PRD F01 | Putuskan annotation lokal/retention/permission, atau keluarkan sampai sumber disetujui |
| B0B-08 | User effective leaf access tersebar di direct FK, four junctions, role/global exceptions; duplicate/null source grants ada | `ticket.helpers.ts`; daily where; DB aggregates Phase0A | Owner menyetujui privilege mapping/review treatment; no account activation on ambiguous expansion |
| B0B-09 | GAUL/recurring depends on service_no, 60-day relation, workzone and GAMAS fields | Semesta V2 query; `Data-Contract.md` | Confirm field availability/meaning, normalization, grouping and denominator |
| B0B-10 | Workzone is normalized name match in current schema evidence; official code/data dictionary not proven | Phase0A profile; `service_area.nama_sa`; `ticket.workzone` | Owner/data dictionary confirms code identity and unmatched 74 keys treatment |

## Synthetic golden fixture plan

Tidak memakai record pelanggan. Buat fixtures sintetis setelah rule owner menyetujui expected output:

1. Bucket tunggal untuk setiap jenis, bucket overlap, source/channel mismatch, flag/type mismatch, obsolete precedence, null/blank/unknown/alias, SQM reason kosong/isi.
2. `b2c`, `b2b`, netral, unknown, jenis/segment bentrok, semua default/alias serta satu field hilang vs explicit null.
3. Ticket open → closed → newer reopen; endpoint overlap; out-of-order version; equal-time conflict; status FINALCHECK/RESOLVED/unknown; missing/invalid/offsetless timestamp.
4. Batas SLA tepat deadline, sebelum/sesudah, reported 07:59/08:00/16:59/17:00 WIB untuk SQM, P1 vs P+, booking vs reported, threshold null.
5. Repeat service_no dalam/di luar lookback, beda workzone, `NN`/blank, GAMAS parent/child, duplicate incident dalam satu aggregate.
6. Scope satu grant parent + child overlap, multi-level union, filter intersection, explicit global, no grant, inactive, revoked grant; list/count/export/drilldown harus identik scoped.
7. Untuk tiap menu, satu frozen dataset dengan expected membership/count cells/drilldown/export; fixtures tetap kandidat sampai approver dan expected result dicatat.

## Status Phase 0B

Kandidat, konflik dan synthetic fixture plan telah dicatat; gate 0B meminta kandidat rules terdokumentasi dan unknown tetap eksplisit, bukan owner sign-off. **Phase 0B discovery selesai.** Phase 0C static contract/access audit telah dilanjutkan dan dicatat di `Phase-0C-Contract-Access-Discovery.md`; owner validation dan sanitized closed/reopen fixtures tetap required sebelum implementasi yang bergantung padanya. Tidak ada code/test/database mutation pada Phase 0B.
