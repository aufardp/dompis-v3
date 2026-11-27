# Phase 0B — Business Rules Discovery

Tanggal: 2026-11-26. Status: **discovery candidate inventory selesai; tidak ada rule yang disahkan untuk implementasi**.

Phase ini mengekstrak maksud dan perilaku legacy dari checkout `/Users/pakbreng/Projects/dompis_v2` dan membandingkannya dengan PRD v1.3. Source legacy tetap read-only. Hasil kode adalah evidence perilaku saat ini, bukan kebenaran bisnis. Konflik yang belum diadjudikasi masuk daftar owner decisions; tidak ada KPI, status, SLA, atau lifecycle yang diubah.

## Bukti empat menu

| Menu | Evidence path legacy | Perilaku yang terlihat | Status kebutuhan baru |
|---|---|---|---|
| Ticket Management | `app/config/operational-buckets.ts:50-160`; `app/libs/services/daily-ticket-where.ts:50-123,228-350`; `app/libs/ticket-utils.ts:35-75`; `app/api/tickets/daily/detail-wo-hi/route.ts:88-171` | Bucket operasional, anomaly alias, daily list, status-update grouping, local pending, closed-today dan filter/detail berada di beberapa jalur. | Gunakan lifecycle/status owner dan PRD daily population; sumber ticket fact dari NOSSA. Local-only SQM/pending tidak boleh diasumsikan tersedia atau dijadikan source fact. Bucket membership dan local annotation masih perlu aturan terverifikasi. |
| Semesta | `app/api/dashboard/semesta-analytics/route.ts:22-62`; `app/libs/services/tickets.service.ts:1090-1472`; `app/admin/semesta/page.tsx:339-412` | Dua implementasi analytics punya default date range/granularity berbeda. Versi V2 menghitung tren reported-date, breakdown type/workzone, dan GAUL-style recurring berdasarkan service number. | PRD memilih reported date untuk histori; recurring hanya bila field dan lookback disahkan. Versi/denominator tidak dipilih sebelum fixture dan owner review. |
| Rekap Workorder | `app/api/dashboard/rekap-workorder/route.ts:69-460`; `app/api/dashboard/rekap-workorder/queries.ts:106-190,502-560`; `app/api/dashboard/rekap-workorder/aggregate.ts`; `lib/rekap/rekap-classify.ts:85-145,190-343` | SQL membentuk aggregate berdasarkan master/nama SA/workzone/status/bucket; layer JS membangun summary/drilldown; route juga memanggil query metrik teknisi. | Pertahankan matrix dan drilldown scoped; hilangkan metrik teknisi sesuai PRD. Predicate, klasifikasi dan numerator/denominator harus shared dan parity-tested; jangan port SQL/classifier. |
| Detail WO HI | `app/api/tickets/daily/detail-wo-hi/route.ts:88-250`; `app/libs/services/daily-ticket-where.ts:300-530` | Filter dept/search/workzone/branch/customer type/status/date; list memakai reported_date dan offset pagination, summary dibangun lewat jalur terpisah. | PRD menetapkan default active + closed today; lifecycle status owner dan closed timestamp berlaku untuk populasi hari ini. Summary/list/export predicate parity dan optional historical-range behavior menunggu rancangan/golden fixture. |

## Kandidat classification dan konflik implementasi

1. `app/config/operational-buckets.ts:50-160` mendeklarasikan enam bucket (`kpi_customer`, `kpi_proactive`, `non_kpi_unspec`, `non_technical`, `sqm_update`, `obsolete`) dan tiga anomaly (`unknown`, `unspec`, `blank`). Config menggambarkan `kpi_proactive` dengan channel 50/83 + TECHNICAL, Unspec dengan channel 28 + `jenis_tiket_1`, dan bucket lain dengan daftar jenis/flag.
2. Source executable bukan satu rule tunggal. `app/libs/services/kpi-bucket-sql.ts:75-175` dan generated column migration `prisma/migrations/20260913070000_add_operational_bucket/migration.sql:17-118` menggunakan predicate LIKE/substring yang berbeda dari deskripsi config: channel tidak terlihat pada predicate; Unspec memakai `jenis_tiket_2`; syarat `classification_flag` dan jenis tidak identik. Generated precedence tercatat obsolete → customer → proactive → unspec → SQM update → non-technical.
3. `lib/rekap/rekap-classify.ts:85-145` memberi precedence lain: obsolete → non-technical → proactive/SQM update/Unspec → customer, dan memakai `is_sqm_update`. Ini dapat membuat bucket berbeda dari generated-column SQL pada baris yang overlap/unknown. Belum dibuat fixture parity dan belum dipilih sumber rule baru.
4. `kpi_seg` generated expression berada di migration yang sama (`:110-117`); `customer_type`, `customer_segment`, jenis dan segmen report dipakai lintas route. PRD meminta `b2c + b2b + netral + unknown = total` hanya jika kategori dan null handling disetujui; SQL default saat ini dapat menempatkan nilai tak dikenal ke B2B. Definisi baru belum disahkan.
5. `OPERATIONAL_KPI_STATUSES` memuat ANALYSIS, BACKEND, DRAFT, FINALCHECK, PENDING (`operational-buckets.ts:50-57`), tetapi ini legacy status predicate dan tidak sama dengan lifecycle v3 yang ditetapkan owner. Daftar tersebut tidak boleh menjadi sumber status atau eligibility SLA v3.

## Lifecycle dan daily membership

- Legacy `CLOSE_STATUS_VALUES` mengelompokkan CLOSED, CLOSE, FINALCHECK, MEDIACARE, SALAMSIM, RESOLVED (`app/libs/ticket-utils.ts:35-47`). Owner v3 lifecycle list mencakup lima status closed yang telah disebut dan menolak asumsi `CLOSE`; endpoint bukan penanda lifecycle. Compliance v3 sengaja membandingkan `resolve_date` dengan deadline sesuai keputusan owner, sedangkan daftar closed-today memakai canonical lifecycle dan `closed_at`.
- Daily helper memiliki mode lama berdasar `sync_date` + status/closed-at + `pending_dompis` (`daily-ticket-where.ts:50-93`), sedangkan jalur normal menyertakan semua status yang bukan anggota close set atau status close dengan `closed_at` hari ini. Customer bucket memiliki filter sync-date/pending tersendiri (`:95-123`). Ini perilaku yang berbeda; tidak ditafsirkan menjadi “tiket aktif hari ini” tanpa owner contract.
- Rekap menggunakan kombinasi `syncDate`, daily union dan bucket classifier; Detail WO HI menerima `includeClosed`, reported date, dan status filter lewat builder/summary berbeda. Acceptance wajib membandingkan list/summary/drilldown dengan snapshot serta scope yang sama.
- Reopen, source timestamp yang menang, status unknown, closure timestamp, dan histori transisi harus memakai field source yang tervalidasi. Jangan close dari ketiadaan pada salah satu endpoint.

## SLA/TTR, denominator dan waktu

- `app/libs/tickets/ttr-comply.ts:22-280` menghitung compliance atas close-status set + `resolveAt`, parsed `reportedDate`, threshold per B2C customer type/B2B jenis, dan mengembalikan `null` untuk kondisi yang tidak eligible. Pemilik v3 menetapkan `reported_date + batas maksimum` dibanding `resolve_date`; equality comply. Hanya ticket lifecycle closed dengan threshold dan kedua waktu valid masuk denominator. SQM-CCAN 08:00–17:00 WIB + 4 jam serta MANJA P1 `booking_date + 3 jam` tetap perilaku legacy yang harus diuji terhadap katalog maksimum owner sebelum dipakai.
- `app/libs/tickets/effective.ts` menentukan deadline display terpisah dari compliance; `app/libs/priority/ttr.ts:5-145` memiliki state/threshold lain. Jangan menyatukan displayed Max TTR, SLA deadline, MTTR dan KPI compliance.
- Ada konflik dokumentasi/code nyata: matrix lama mencatat Indibiz 4 jam dan Reseller 6 jam; keputusan owner menetapkan kategori Reseller menjadi Indibiz dan memakai maksimum yang sudah dikirim. Nilai matrix lama adalah technical debt, bukan pertanyaan threshold ulang. Countdown Reguler v3=24h; MTTR ditunda; Max TTR display tetap terpisah.
- Sesuai PRD AC09 dan keputusan owner, ticket open/unknown, tidak memiliki threshold, atau waktu `reported_date`/`resolve_date` invalid menjadi unavailable/null; numerator memenuhi `resolve_date <= deadline`. NOSSA `TTR_Customer`/`TTR_END_TO_END` bukan input compliance; unit hanya diperlukan jika angka tersebut ditampilkan/dipakai. Legacy parser membaca waktu tanpa offset sebagai WIB; source meaning tetap perlu fixture jika upstream mengirim format offsetless.

## Semesta recurring / GAUL evidence

Pada `tickets.service.ts:1090-1245`, analytics V2 memakai `reported_date_dt`; query recurring menghitung incident berbeda untuk service number valid selain kosong/`NN`, dikelompokkan dengan workzone, dan mencari incident lain dalam ±60 hari. Kedua sisi relasi harus masuk rentang laporan terpilih; relasi `EXISTS` tidak mewajibkan workzone sama. Output diurutkan berdasarkan occurrences saja dan dipotong ke 100 grup, lalu nilai KPI GAUL dijumlah dari grup terbatas itu sehingga totalnya dapat undercount. Ada query `ticket_id_gamas` terpisah. Jalur LAPUL saat ini selalu mengembalikan kosong menurut komentar source karena satu current row per incident. Ini observasi query, bukan definisi GAUL yang disetujui. Pertanyaan produk yang tersisa: occurrence minimum/lookback, cross-Workzone, normalisasi service number, perlakuan induced/parent ticket dan batas rentang report terhadap lookback. Jika v3 perlu top services, total agregat harus dihitung terpisah dari daftar detail terbatas.

Versi analytics lain (`tickets.service.ts:1472-1575`) memiliki default trend 7 hari versus V2 30 hari dan menghitung open/closed/on-progress dari `status_update`. PRD menetapkan `reported_date` sebagai basis Semesta dan lifecycle owner menetapkan status v3; default interval/granularity dan recurring denominator masih perlu dirinci agar headline/trend memakai populasi yang konsisten.

## Scope, filter, ekspor

- Owner v1.3 menetapkan grants hirarkis union + filter intersection, dedup overlap, deny-by-default; legacy paths memiliki role/global exceptions. Hasil Phase 0A master/scope profile dicatat di `Phase-0A-Discovery.md`; per-user effective leaf parity dan role exceptions perlu synthetic/owner-approved cases sebelum permission implementation.
- Semua menu/export/API/SSE perlu memakai predicate domain/scope yang sama. Ticket search exact incident/service_no dan filter dept/status/flag perlu synthetically tested. `detail-wo-hi` menggunakan offset page; DOMPIS baru wajib keyset sesuai blueprint dan stable sort.
- Export legacy dapat mengandung contact/customer fields. Field allowlist, PII mask, permission, retention dan audit dibahas di Phase 0C; tidak disalin ke fixtures.
- Teknisi/assignment muncul pada tabel dan query legacy Rekap, tetapi berada di luar scope produk; tidak ada metrik nol pengganti dan tidak ada assignment implementation.

## Konflik dan keputusan owner

| ID | Konflik/fact gap | Evidence | Keputusan yang diperlukan |
|---|---|---|---|
| B0B-01 | Bucket definitions, executable SQL/generated field, dan Rekap JS classifier memakai predicate/precedence berbeda | `operational-buckets.ts`; `kpi-bucket-sql.ts`; migration; `lib/rekap/rekap-classify.ts` | Pilih intent per input, source/channel/type/flag precedence, unknown/null policy; owner-approved synthetic expected rows |
| B0B-02 | Matrix SLA lama berbeda dari konfigurasi dan maksimum owner | `docs/sla-ttr-matrix.md`; `app/config/jenis-tiket.ts`; keputusan owner | Maksimum owner berlaku; nilai legacy disimpan sebagai discrepancy evidence, tidak perlu dimintakan ulang |
| B0B-03 | Legacy close set berbeda dari lifecycle v3; unknown dapat jatuh menjadi open | Owner lifecycle ADR-048/050; `ticket-utils.ts:35-70`; `Data-Contract.md` | Status dan unknown policy sudah diputuskan; source ordering/reopen tetap perlu fixture |
| B0B-04 | UI Max TTR, priority countdown dan compliance memakai precedence berbeda | `effective.ts`; `priority/ttr.ts`; `ttr-comply.ts`; owner catalogue | Rule v3 sudah ditentukan terpisah; tambahkan sanitized golden cases sebelum acceptance |
| B0B-05 | Semesta V1/V2 default interval/granularity, status metric dan recurring logic berbeda | `tickets.service.ts:1090-1245,1472-1575`; PRD F02/§5 | PRD `reported_date` basis disetujui; selaraskan interval/granularity, lifecycle status, dan GAUL lookback/group jika dipertahankan |
| B0B-06 | Daily board, customer-bucket sync-date, Rekap dan Detail WO HI punya membership/filter builders berbeda | `daily-ticket-where.ts`; `rekap-workorder/queries.ts`; `detail-wo-hi/route.ts`; PRD | Default active + closed today ditetapkan PRD; gunakan lifecycle owner dan shared predicate; golden list-summary-drilldown parity tetap diperlukan |
| B0B-07 | SQM Update dan pending DOMPIS bergantung pada field lokal yang tidak dijamin NOSSA | `operational-buckets.ts`; daily filter; PRD F01 | Putuskan annotation lokal/retention/permission, atau keluarkan sampai sumber disetujui |
| B0B-08 | User effective leaf access tersebar di direct FK, four junctions, role/global exceptions; duplicate/null source grants ada | `ticket.helpers.ts`; daily where; DB aggregates Phase0A | Owner menyetujui privilege mapping/review treatment; no account activation on ambiguous expansion |
| B0B-09 | GAUL/recurring depends on `service_no`, 60-day relation, Workzone and GAMAS fields; legacy total is capped at top 100 groups | Semesta V2 query; PRD F02/§5 | Recurring is conditional on field availability and approved lookback; define cross-Workzone, normalization, grouping, report-range interaction and full total vs Top-N if retained |
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
