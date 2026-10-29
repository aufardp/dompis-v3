# Review PRD Rewrite Dompis v3

Tanggal: 29 Oktober 2026 (WIB)
Dokumen: `PRD-Dompis-v3-Agent-Governance.md`, versi 1.3
Snapshot sumber: commit `3ab0381ebeab90e4ca819fd93976eb16406eec1c`
Status laporan: hasil review dan usulan revisi, belum menjadi keputusan arsitektur atau izin implementasi.

## Penilaian

PRD sudah sesuai dengan banyak karakteristik aplikasi saat ini. Perlindungan terhadap perubahan aturan bisnis, waktu WIB, tipe data MySQL, generated columns, uploads, dan penulis pipeline merupakan bagian yang perlu dipertahankan.

PRD belum siap dipakai sebagai instruksi eksekusi rewrite tanpa revisi. Masalah utamanya adalah kontrak pengujian dan transisi yang belum lengkap, beberapa aturan yang saling bertentangan, serta belum adanya keterlacakan seluruh fitur ke kriteria penerimaan. Agent dapat mengikuti aturan secara harfiah tetapi tetap menghasilkan aplikasi yang kehilangan alur kerja atau tidak memberi peningkatan performa yang berarti.

Dokumen ini lebih matang sebagai panduan migrasi dan tata kelola agent. Lengkapi dengan kontrak fitur dan ukuran keberhasilan produk sebelum memulai port.

## Cakupan dan batas bukti

Pemeriksaan meliputi pembacaan PRD, query graphify, inventaris rute/halaman/model/migrasi/skrip, konfigurasi PM2, serta pemeriksaan terarah pada pipeline QOSMIC, pencarian Nossa, cache/SSE, autentikasi, role, dan sejumlah endpoint alur kerja.

Ini bukan audit perilaku seluruh 156 rute. Tidak ada benchmark, koneksi produksi, pengujian eksploitasi, atau pembuktian seluruh KI-01 sampai KI-43. Fakta konfigurasi di repository tidak membuktikan konfigurasi yang sedang aktif di server. Build dan suite aplikasi tidak dijalankan karena review ini tidak mengubah kode aplikasi.

Prioritas P0 berarti perlu diselesaikan sebelum bagian rewrite yang bergantung padanya dimulai. P1 perlu ditutup sebelum modul terkait diimplementasikan atau dinyalakan. P2 adalah perapian ruang lingkup dan dokumen.

## Fakta yang cocok dan yang perlu diperjelas

| Aspek | Hasil pemeriksaan | Penilaian terhadap PRD |
|---|---|---|
| Stack sumber | `package.json` bernama `dompis_v2`; Next.js, React, Prisma, MySQL | Sesuai sebagai sumber aplikasi lama |
| Rute API | 156 berkas `route.ts` | Sesuai |
| Halaman peran | Admin 31, teknisi 7, helpdesk 3, superadmin 4 | Sesuai: 45 halaman peran |
| Halaman lain | Login, register, root; total 48 `page.tsx` | Sudah tersirat di PRD; sertakan dalam inventaris lengkap |
| Skema | 52 model, 64 berkas migrasi | Sesuai |
| Skrip | 88 berkas langsung di `scripts/` | Sesuai |
| PM2 | 7 definisi aplikasi di `ecosystem.config.js` | Sesuai sebagai konfigurasi, belum bukti proses aktif |
| Pengujian otomatis | Tidak ditemukan `*.test.*`/`*.spec.*` pada direktori aplikasi, library, dan tests | Sesuai dengan peringatan tentang belum adanya suite |
| Build sumber | `next build --webpack` di `package.json:8` | Sebutan Turbopack di 2.0 perlu membedakan dev dan build produksi |
| Kuota backfill bridge | Nilai PM2 di repository adalah 2/menit; default client 6/menit | PRD tidak boleh menetapkan 14+6 sebagai fakta konfigurasi efektif |
| Search Nossa | Lokal dahulu; jika tidak ditemukan dan flag aktif, enqueue bridge lalu menunggu hingga 5 detik | Kontrak pencarian perlu ditulis lengkap |
| Ingestion bridge | `processTable` melakukan enqueue ke BullMQ | Ringkasan AGENTS masih menggambarkan generator langsung |

Sumber utama: `package.json:2`, `package.json:8`, `ecosystem.config.js:53`, `ecosystem.config.js:138`, `ecosystem.config.js:142`, `ecosystem.config.js:174`, `ecosystem.config.js:236`, `app/api/nossa/search/route.ts:41`, `lib/ingestion/index.ts:1277`.

## Temuan yang perlu direvisi

### RV-01 [P0] Lokasi sumber dan target belum aman untuk eksekusi

Bukti: PRD pembuka, R-01/R-02, dan tugas 0.1 mengasumsikan `dompis_v2` terpisah dari monorepo baru `dompis-v3`. Workspace yang diperiksa sudah bernama `/Users/pakbreng/Projects/dompis-v3`, tetapi masih berisi aplikasi lama (`package.json:2`) dan belum memiliki struktur target `apps/`/`packages/`.

Dampak: agent dapat membuat scaffold di atas sumber lama atau membuat direktori target bersarang. Nama folder tidak cukup untuk membedakan dua sistem.

Revisi: tambahkan identitas eksplisit `SOURCE_ROOT`, `SOURCE_COMMIT`, `TARGET_ROOT`, dan `REFERENCE_URL`, serta identitas DB/Redis dev tanpa rahasia. Pemeriksaan awal harus memastikan sumber dan target berbeda. Bila repository ini merupakan salinan sumber, nyatakan status tersebut dan tentukan lokasi target sebelum scaffold. Jangan mengasumsikan lokasi folder saudara.

### RV-02 [P0] Harness parity belum dapat membuktikan kesamaan mutasi dan worker

Bukti: 5.2 langkah 2 memakai database dev yang sama secara bergantian. Tidak ada kewajiban mengembalikan keadaan awal. R-01 dan tugas 0.7 membatasi interaksi referensi ke HTTP, tetapi Fase 1 sampai 4 meminta menjalankan worker lama dan baru serta membandingkan isi tabel. Tugas 0.6 juga bergantung pada referensi 0.7 yang muncul sesudahnya.

Dampak: close, claim, import, konsumsi invite, cleanup, atau projection versi pertama mengubah input versi kedua. Waktu, ID otomatis, jobId, SSE, dan panggilan keluar juga dapat berbeda walaupun aturan bisnis sama. HTTP aplikasi biasa belum tentu menyediakan pemicu worker, clock, atau log SQL yang diperlukan.

Revisi kontrak G4:

- Gunakan dua DB dev yang dibuat dari snapshot identik, atau reset seluruh state relevan sebelum setiap replay. Sertakan sequence ID, cache, antrean, file fixture, dan outbox.
- Tetapkan clock uji, respons mock QOSMIC, dan penampung efek samping webhook/FCM. Referensi dan target tidak mengirim notifikasi nyata.
- Bandingkan respons dan perubahan state bisnis, termasuk outbox, audit, projection request, serta event yang semestinya diterbitkan.
- Daftarkan field nondeterministik secara terbatas. Setiap normalisasi punya alasan; jangan mengabaikan timestamp bisnis atau urutan yang bermakna.
- Sediakan runner worker referensi pada salinan uji yang terisolasi, atau pemicu uji yang disiapkan pemilik. Tentukan pelaksana dan cara mengambil hasil/log.
- Bangun referensi/harness sebelum pengujian roundtrip waktu dan tipe.

### RV-03 [P0] Parity belum mengakomodasi DBC dan perbedaan SQL antar-ORM

Bukti: 5.2 meminta hasil identik; Fase 6 menyebut kesamaan SQL literal. Bagian 14 mengizinkan perubahan F2/S melalui DBC. Prompt F tetap meminta seluruh gerbang, tetapi tidak menetapkan oracle pengujian setelah DBC berlaku.

Dampak: perbaikan role, refresh token, scheduler, atau cakupan SSE yang disetujui tetap dianggap gagal. SQL Prisma dan Drizzle juga dapat berbeda dalam alias, placeholder, dan bentuk query walaupun semantiknya setara.

Revisi:

- Kelas P dan F1: kontrak bisnis tetap identik untuk cakupan uji yang dinyatakan.
- Kelas F2/S: hanya selisih yang disebutkan DBC diterima. Tambahkan pengujian perilaku baru; kontrak lain tetap dibandingkan dengan referensi.
- Tangkap SQL dan parameter kedua ORM untuk memeriksa filter, scope, join, null, agregasi, urutan, atomicity, serta rencana eksekusi. Jangan mensyaratkan string SQL identik.
- Pada F1, pengujian hasil dan efek samping tetap wajib walaupun jumlah query atau bentuk SQL berubah.

### RV-04 [P0] Transisi producer, consumer, dan cache belum menjadi satu kontrak

Bukti: Fase 3 memindahkan data-worker sebelum bridge-worker; 12.1 menyatakan antrean bridge tidak dibagi. Saat ini producer membuat queue bernama tetap di `lib/external-db/qosmic-bridge/bridge-queue.ts:123`, `:136`, dan `:148`. Producer berasal dari ingestion (`lib/ingestion/index.ts:1335`) dan search (`app/api/nossa/search/route.ts:46`). R-28 memisahkan cache dengan prefiks `v3:`. Invalidator lama menghapus pola tanpa prefiks tersebut (`lib/cache.ts:167`, `:207`); mutasi ticket memanggil invalidator itu (`app/libs/services/ticketWorkflow.service.ts:55`).

Dampak: producer dapat menulis ke antrean tanpa consumer. Mutasi v2 juga belum otomatis menyegarkan cache v3. Satu implementasi per fungsi belum cukup menjelaskan seluruh interaksi penulis `ticket_raw` lintas fungsi.

Revisi: buat tabel kontrak transisi untuk setiap queue/channel/cache/lock: producer, consumer, versi payload, namespace, pemilik, dan prosedur alih tugas. Pilih apakah queue dipertahankan sementara dengan satu consumer, atau producer dan consumer dialihkan bersama. Catat pengecualian kompatibilitas dengan tanggal pensiun.

Sebelum cutover: hentikan enqueue yang relevan, tunggu job aktif selesai, catat waiting/delayed/failed, alihkan producer dan consumer, lalu uji deduplikasi dan rollback. Jangan menghapus antrean sebagai jalan pintas. Tentukan invalidasi lintas versi atau batas stale yang disetujui. Uji mutasi v2 dibaca v3 dan sebaliknya, termasuk pembaruan dashboard dan War Map.

Tambahkan matriks kepemilikan tulis berdasarkan sumber/kolom dan kebijakan kontensi untuk semua penulis `ticket_raw`, bukan hanya saklar per proses.

### RV-05 [P1] Daftar fase belum menjamin seluruh fitur tetap tersedia

Bukti: Fase 5 sampai 10 menyebut kelompok besar. Migration-map 15.2 melacak unit kode, tetapi belum mewajibkan setiap alur pengguna ditautkan ke layar, method API, aturan role/scope, uji, dan cutover.

Contoh yang perlu diberi acceptance criteria eksplisit:

| Alur | Bukti keberadaan di sumber | Hal yang harus dilindungi |
|---|---|---|
| Absensi dan attendance gate | `app/api/admin/settings/attendance-gate/route.ts`, `app/api/technicians/attendance/gate/route.ts`, `app/api/technicians/attendance/checkout/route.ts` | Gate per segmen, check-in/check-out, pergantian hari, pengaruh ke akses/pekerjaan |
| Undangan dan join tim QR | `app/api/users/invite/route.ts`, `app/api/team/join/route.ts` | Jenis token, masa berlaku, pemakaian ulang, anggota tim; token invite juga memakai `JWT_SECRET` |
| Siklus ticket lengkap | `app/api/tickets/claim/route.ts`, `pickup/route.ts`, `reopen/route.ts`, `unassign/route.ts`, `bypass-close/route.ts` | Transisi yang sah, role, assignment, histori, bukti, dan efek samping |
| Manhours dan performa | `app/api/technicians/manhours/import/run/route.ts`, `app/api/technicians/performance/export-excel/route.ts`, `app/api/technicians/bobot-config/route.ts` | Preview/run, perhitungan, bobot, format dan batas ekspor |
| Pengguna dan akses wilayah | `app/api/users/change-password/route.ts`, `app/api/users/[id]/reset-password/route.ts`, `app/api/users/me/sa/route.ts` | Sesi, role, branch/area/SA, reset dan perubahan password |
| Ingest manual dan Nossa search | `app/api/admin/ingest-incident/route.ts`, `app/api/nossa/search/route.ts` | Data lokal, fallback antrean, timeout, normalisasi, proyeksi |
| Ekspor operasional | `app/api/tickets/daily/export/route.ts`, `app/api/tickets/daily/detail-wo-hi/export/route.ts` | Filter yang sama dengan tampilan, kolom, tipe, batas baris, memori |
| Notifikasi | `app/api/notifications/topbar/read/route.ts`, `app/api/notifications/topbar/read-all/route.ts`, `app/api/fcm-token/route.ts` | Status baca, cakupan pengguna, perangkat, efek samping pengiriman |

Alur ini tidak otomatis hilang dari niat PRD. Masalahnya, kontrak terujinya belum tersedia. Lengkapi inventaris seluruh rute dengan **method + path**, seluruh halaman termasuk login/register, dan seluruh pemicu worker/operasional. Berkas route dapat mengekspor lebih dari satu method.

Tambahkan `feature-parity-matrix` dengan kolom: ID fitur, tujuan pengguna, aktor, layar, method/path, sumber, aturan bisnis, tabel/efek samping, ID pengujian, target modul, dan status. Setiap fitur harus dipertahankan, diubah dengan DBC, atau ditunda/dihapus dengan keputusan pemilik. Coverage rute dan coverage alur pengguna diperiksa terpisah.

### RV-06 [P1] Target performa belum memastikan hasil menjadi lebih baik

Bukti: Bagian 7 memberi batas proses dan syarat tidak lebih buruk dari baseline. Nilai v2 pada tabel terutama `max_memory_restart`, bukan RSS terukur. Target p50/p95, kesegaran data, throughput, dan performa perangkat belum memiliki ambang peningkatan yang disetujui.

Dampak: v3 dapat lulus walaupun hanya setara dengan v2. Mengganti stack belum membuktikan penyebab query berat, antrean, atau cache stampede sudah diatasi. Pemisahan web/API juga perlu dihitung sebagai total sumber daya.

Tambahkan scorecard berikut. Angka target diisi setelah baseline dan disetujui sebelum keputusan go/no-go performa; jangan dianggap sudah tercapai.

| Ukuran | Cara membandingkan | Syarat target |
|---|---|---|
| Latensi tickets, rekap, War Map | p50/p95/p99, workload dan data sama, cache dingin/hangat | Ambang absolut dan persentase peningkatan ditetapkan per endpoint |
| Memori runtime | RSS idle, peak, dan tren selama soak; web + API + seluruh worker | Total v3 dibanding total v2, serta per proses |
| CPU dan koneksi | CPU, pool wait/timeout, seluruh pool termasuk bulk, jumlah instance | Anggaran per proses dan gabungan saat coexistence |
| Kesegaran ticket | Sumber berubah sampai `ticket_raw`, lalu `ticket`, lalu UI | Batas p95 lag per sumber dan kondisi outage/recovery |
| Pipeline | Baris/menit, umur antrean tertua, DLQ, waktu mengejar backlog | Tidak kehilangan data dan pulih dalam batas yang disetujui |
| Keandalan | Error/timeout, duplikasi mutasi/event, deadlock, task terlewat | Ambang dan pemicu rollback eksplisit |
| Teknisi | Waktu halaman siap digunakan, respons interaksi, ukuran transfer | Perangkat, jaringan, data, dan ambang ditetapkan |
| Build/deploy | Durasi dan peak RSS seluruh proses build | Dibandingkan dengan build v2 yang benar-benar digunakan |

Pisahkan baseline produksi yang dikumpulkan pemilik dari benchmark terkontrol di dev. Kuota QOSMIC, volume data, dan persaingan request harus ikut menghitung target kesegaran.

### RV-07 [P1] Sumber kebenaran perlu membedakan kode, konfigurasi, dan keputusan bisnis

Bukti: R-03 mengatakan kode menang. Namun, PRD juga mengizinkan DBC untuk memperbaiki kode. Ringkasan AGENTS dan PRD berbeda pada alur bridge; kode/config menunjukkan beberapa detail lain:

- Backfill PM2 bernilai 2/menit (`ecosystem.config.js:236`), default client 6 (`lib/external-db/qosmic-bridge/client.ts:32`). Budget non-backfill dihitung dengan pengurangan (`:36`), sehingga pada konfigurasi 20 dan 2 hasilnya 18+2.
- Search yang gagal menemukan data lokal dapat memakai bridge (`app/api/nossa/search/route.ts:45`). Karena itu klaim semua search selalu bebas kuota bridge tidak sesuai sumber saat ini.
- Data-worker dibatasi `piloting_tickets` (`ecosystem.config.js:142`), active-refresh mati (`:174`), backfill data-worker mati (`:138`).
- Deteksi konfigurasi bridge di client memeriksa URL/token (`lib/external-db/qosmic-bridge/client.ts:53`); perilaku master switch jangan diasumsikan dari nama env saja.

Revisi: kontrak bisnis/DBC yang telah disetujui mengatur perilaku yang diinginkan; kode sumber yang dipin menjelaskan perilaku lama; konfigurasi efektif menentukan jalur yang aktif; komentar/dokumen adalah bukti pendukung. Konflik dicatat dan diselesaikan untuk unit terdampak, bukan membiarkan kode lama membatalkan keputusan bisnis baru.

OQ-01 tentang pemicu ingestion Nossa tetap terbuka. Pemeriksaan ini mendukung perlunya pertanyaan tersebut, tetapi tidak membuktikan ingestion produksi berhenti. Pemilik perlu memberikan bukti scheduler/log/config efektif yang sudah disensor.

### RV-08 [P1] Gerbang P/H/F dan bootstrap dapat membuat proses buntu

Bukti: H membuat uji yang gagal pada perilaku lama (14.8), sementara G10 menjalankan seluruh regresi dan setiap tugas harus hijau. G11 berlaku pada setiap tugas DB, tetapi port harus mempertahankan query lama yang mungkin melewati budget. G6 meminta tidak lebih buruk padahal perbaikan dijadwalkan sesudah port. Fase 0 mewajibkan gerbang sejak awal tetapi 0.1 masih membuat stub gagal. G10 sampai G13 baru disiapkan di 0.9.

Revisi: buat matriks tahap × gerbang. Contoh:

| Tahap | Bukti wajib | Status yang sah |
|---|---|---|
| Bootstrap | Tipe/lint/build kerangka, gerbang tersedia sesuai dependensi | Gerbang belum terimplementasi dicatat belum tersedia; bukan lulus palsu |
| P | Kontrak, parity, integrasi relevan, rekaman baseline modul | Batas performa lama yang belum diperbaiki dicatat sebagai temuan, belum layak cutover |
| H | Laporan cakupan, reproduksi, query/EXPLAIN | Reproducer gagal dengan alasan terdaftar pada suite diagnostik; suite wajib yang sudah ada tetap hijau |
| F | Reproducer menjadi regresi wajib, hijau; pengujian DBC bila berlaku | Kontrak dan scorecard modul terpenuhi |
| Cutover | Gerbang lengkap yang berlaku, UAT, transisi dan rollback teruji | Baru boleh menggantikan fungsi produksi |

Pisahkan blocker lokal dari blocker proyek. Ketiadaan DB menghentikan uji DB dan klaim kelulusannya; inventaris statis atau pekerjaan independen dapat tetap berjalan. Pemeriksaan cepat per perubahan dan suite lengkap per checkpoint menghindari pengulangan semua build/beban tanpa perubahan yang relevan.

### RV-09 [P1] Pengecualian keamanan belum konsisten hingga prompt dan cutover

Bukti: R-08 melarang mewarisi celah keamanan. Namun, Lampiran A menyuruh port bug tanpa menyebut pengecualian S pada butir tersebut. Bagian 14.2 mengizinkan S0/S1 berstatus diterima atau ditunda sebelum cutover. F2/S juga disebut mengikuti flag default lama/mati, yang berpotensi mengaktifkan kembali perilaku rentan.

Revisi: selaraskan semua ringkasan/prompt. Kerentanan yang terbukti dan masih dapat dieksploitasi pada jalur yang akan dinyalakan harus diperbaiki atau jalurnya dinonaktifkan sebelum cutover. Flag perbaikan keamanan harus gagal secara aman; mematikannya tidak boleh menghidupkan celah lama. Penerimaan risiko harus menyebut mitigasi nyata, pemilik, batas waktu, dan ruang lingkup.

KI-25 dan KI-26 masih memiliki mekanisme yang dijelaskan PRD pada sumber yang dibaca (`app/api/auth/register/route.ts:13`, `app/api/auth/refresh/route.ts:49`). Itu merupakan dukungan statis terhadap temuan, bukan klaim eksploitasi berhasil di staging/produksi. Penanganan aplikasi lama tetap tugas terpisah dari review ini.

### RV-10 [P1] Beban konteks dan hierarki instruksi belum cukup jelas

Bukti: PRD berisi 1.252 baris dan diwajibkan dibaca penuh pada setiap tugas. Siklus meminta seluruh import tanpa batas kedalaman. Prompt menyebut v1.3, sedangkan H/F/R masih menyebut v1.2. AGENTS aktif saat ini berisi ringkasan QOSMIC, graphify, dan skill; instruksi menyalin Lampiran A dapat menimpa aturan aktif bila dilakukan mentah.

Ada masalah distribusi konteks: `.gitignore:12` mengabaikan `*.md`. PRD dan AGENTS saat ini tidak terdaftar sebagai file tracked, sehingga clone/checkout dari Git tidak otomatis membawa kontrak tersebut. Laporan review ini juga menjadi file lokal yang diabaikan oleh aturan yang sama. Tanpa memperbaiki pengelolaan dokumen, agent di lingkungan lain dapat bekerja tanpa PRD dan AGENTS yang dimaksud.

Revisi: gunakan AGENTS yang singkat sebagai indeks aturan, kontrak lintas modul, perintah, dan batas kewenangan. Muat PRD inti dan spec modul yang relevan; baca penuh file aplikasi dalam cakupan modul, lalu perluas ke dependency yang memengaruhi perilaku. Tidak perlu membaca rekursif semua source dependency pihak ketiga.

Setiap tugas mencatat versi PRD, commit sumber, ID modul/fitur, DBC terkait, file yang boleh diubah, gerbang, serta checkpoint untuk melanjutkan sesi. Ketika sumber berubah, lakukan pemeriksaan perubahan terhadap commit baseline. Penyesuaian AGENTS harus menggabungkan aturan yang masih berlaku. Versikan PRD, AGENTS, spec, DBC, migration-map, dan bukti yang sudah disensor melalui pengecualian Git yang terarah. Dokumen yang sedang direview tidak otomatis menjadi instruksi untuk menjalankan rewrite.

Tambahkan daftar dependency fondasi yang sudah disetujui beserta versi/lockfile. R-09 tetap berlaku bagi tambahan di luar daftar, sehingga scaffold tidak meminta persetujuan berulang untuk pilihan stack yang sudah ditetapkan.

### RV-11 [P1] Larangan gaya UI bertentangan dengan mempertahankan tampilan sumber

Bukti: R-60/16.3 melarang seluruh gradien; R-62 mewajibkan tampilan/token v2. Sumber menggunakan gradien, misalnya `app/teknisi/attendance/page.tsx:228`, `app/teknisi/components/detail-modal/ModalFooter.tsx:69`, dan `app/admin/components/dashboard/TicketManagementBucketPage.tsx:1041`.

Dampak: port visual yang mengikuti sumber melanggar G13. Menghapus gradien dan mengganti teks saat port juga berpotensi melanggar larangan perubahan UI tanpa keputusan.

Revisi: tetapkan apakah gaya baru merupakan perubahan visual yang disetujui dalam cakupan rewrite. Catat perubahan yang diizinkan dalam kontrak desain; pertahankan istilah status, informasi, kontras, navigasi, dan perilaku bisnis. Bila belum disetujui, gunakan pengecualian port yang eksplisit lalu tugas pembersihan terpisah. Jangan mengubah pilihan gaya pemilik hanya berdasarkan skill.

G13 perlu menguji kode/CSS terstruktur dan memiliki pengecualian untuk kontrak, kutipan, data pengguna, serta pola yang bukan gradien. Gunakan batas panjang nama/fungsi sebagai petunjuk review dengan alasan pengecualian, agar agent tidak memecah transaksi atau memendekkan nama sampai kabur hanya untuk lolos lint.

### RV-12 [P1] Fixture hanya dari dump tidak cukup untuk kasus gagal

Bukti: T-07 melarang fixture yang dikarang. Checklist H justru meminta pengujian race, gangguan Redis/bridge, input berbahaya, jam null, dan pergantian hari. Dump belum tentu memuat kasus tersebut.

Revisi: dump anonim menjadi basis distribusi dan ukuran realistis. Izinkan fixture sintetis yang diberi label untuk batas tipe, data null/kosong, role/scope, input tidak valid, duplikasi, konkurensi, outage, dan replay. Catat asal fixture serta kasus bisnis yang diuji. Synthetic fixture bukan bukti skala produksi.

Tambahkan perlindungan lingkungan uji agar HTTP referensi, DB lokal, Redis, mock, serta file fixture tidak dapat menunjuk layanan produksi secara tidak sengaja.

### RV-13 [P1] Canary per pengguna belum terhubung dengan routing dan artefak build

Bukti: Bagian 12 menyebut canary 1 sampai 2 teknisi atau 1 workzone, sementara A-04 mengatur routing hanya berdasarkan path. PRD belum menjelaskan cohort yang konsisten untuk halaman, API, request SSR, SSE, serta aset dua framework.

Revisi: putuskan apakah canary dilakukan per path/modul atau per cohort pengguna. Bila per cohort, tetapkan pemilihan yang tepercaya di server, konsistensi routing, dan cache sesuai scope. Pengguna tidak boleh menaikkan akses lewat header penentu cohort.

Uji navigasi lintas aplikasi, refresh URL langsung, file/aset Next dan SvelteKit, redirect, cookie, request API dari SSR, SSE reconnect, dan rollback. Untuk rollback worker, verifikasi juga kompatibilitas data yang telah ditulis, checkpoint, queue payload, dan outbox; mengembalikan upstream saja belum cukup.

### RV-14 [P2] Ruang lingkup tambahan dan rujukan perlu dirapikan

- Fase 11 menjadikan bundling APK sebagai fase wajib, tetapi baseline repository yang diperiksa belum membuktikan deliverable Android saat ini. Konfirmasikan apakah itu kanal yang sudah ada atau pekerjaan tambahan. Pemeliharaan kamera/GPS pada web tetap bagian parity; pembuatan APK baru jangan menjadi kewajiban tersirat.
- Bedakan masa pilot bayangan, observasi sesudah cutover, dan syarat pensiun. Bagian 9.3/12.2 menyebut 3 hari atau 1 minggu, 15.3 menyebut 14/30 hari, sedangkan Fase 12 menyebut 2 minggu. Nyatakan bahwa aturan 30 hari API/UI tetap berlaku sebelum penghapusan; tiap durasi memiliki titik mulai yang jelas.
- R-59 merujuk R-23 untuk kontrak, padahal R-23 tentang strict TypeScript. Bagian 16.2 merujuk R-24 untuk `any`, padahal R-24 tentang commit. 14.2 memakai tipe commit `perf` yang belum masuk daftar 9.2.
- Samakan versi prompt H/F/R, Lampiran A, checklist, dan riwayat perubahan. Gunakan satu tabel aturan sebagai acuan agar salinan ringkas tidak menghilangkan pengecualian keamanan.

## Struktur tambahan yang disarankan

Pertahankan PRD sebagai dokumen induk. Tambahan berikut adalah usulan struktur, bukan file yang sudah tersedia:

| Artefak | Isi yang diperlukan |
|---|---|
| Kontrak workspace | Identitas sumber/target, commit baseline, referensi, lingkungan uji |
| Peta kapabilitas dan fitur | Modul, dependency, seluruh alur pengguna, method/path, acceptance criteria |
| Spec per modul | Tujuan, perilaku sumber, field, invariants, kasus tepi, efek samping, DBC |
| Scorecard performa | Baseline, target disetujui, workload, bukti sebelum/sesudah, batas regresi |
| Kontrak transisi | Producer/consumer, Redis, cache, lock, DB, file, satu pemilik aktif |
| Status eksekusi | Tugas aktif, hasil gerbang, blocker lokal, keputusan, checkpoint berikutnya |

Migration-map tetap berguna untuk status unit kode dan pensiun. Feature-parity-matrix menjawab apakah pekerjaan pengguna masih dapat diselesaikan. Keduanya tidak saling menggantikan.

## Usulan kontrak singkat untuk agent

Blok ini merupakan bahan revisi yang perlu diselaraskan dengan seluruh PRD sebelum dipakai:

```text
Tujuan rewrite: mempertahankan seluruh kapabilitas yang disepakati dan meningkatkan
performa, keandalan data, keamanan, serta kemudahan pemeliharaan dengan bukti.

1. Verifikasi SOURCE_ROOT, SOURCE_COMMIT, TARGET_ROOT, dan lingkungan uji.
   Jangan membuat scaffold bila sumber dan target belum dibedakan.
2. Kerjakan satu ID tugas pada satu modul/kapabilitas yang terdaftar.
   Baca kontrak terkait, sumber lengkap dalam cakupan, dan pemanggilnya.
3. Kode lama menjelaskan baseline. Keputusan bisnis dan DBC yang disetujui
   menjelaskan perubahan yang diinginkan. Catat konflik tanpa menebak.
4. Pertahankan fitur dan kontrak yang tidak diubah oleh keputusan tersebut.
   Jangan menambah fitur, mengganti stack, atau memperluas tugas secara diam-diam.
5. Port, hunt, fix, dan pensiun memiliki tugas serta bukti yang terpisah.
   Celah keamanan yang terbukti tidak boleh diaktifkan sebagai perilaku port.
6. Jalankan parity pada state awal identik dan efek samping terisolasi.
   Selisih hanya diterima sesuai DBC; bentuk string SQL tidak harus identik.
7. Klaim optimasi harus menyebut workload serta ukuran sebelum/sesudah.
   Modul tidak boleh cutover sebelum memenuhi scorecard yang disetujui.
8. Uji kontrak antara versi yang masih hidup, termasuk cache, queue, SSE,
   sesi, file, checkpoint, outbox, serta ownership penulis data.
9. Laporkan bukti, keterbatasan, dan blocker per tugas. Lanjutkan pekerjaan
   independen yang sah tanpa mengklaim gerbang yang belum dapat dijalankan lulus.
10. Cutover dan pensiun mengikuti keputusan pemilik, prosedur transisi,
    bukti observasi, dan rollback yang sudah diuji.
```

## Urutan perbaikan PRD

1. Tutup RV-01: identitas workspace dan sumber baseline.
2. Tambahkan feature-parity-matrix serta dependency modul sebelum menyusun tugas port.
3. Revisi G4, DBC, dan runner referensi sesuai RV-02/RV-03; pisahkan tahap gerbang sesuai RV-08.
4. Tetapkan scorecard serta sumber bukti konfigurasi efektif dan OQ yang masih terbuka.
5. Lengkapi kontrak transisi dan kebijakan keamanan sebelum modul terkait boleh cutover.
6. Selaraskan kebijakan visual, cakupan APK, versi prompt, dan AGENTS.
7. Mulai pilot kecil setelah dokumen dan lingkungan pengujian memenuhi prasyaratnya.

Bagian yang sudah baik tidak perlu ditulis ulang dari nol: strategi bertahap, perlindungan MySQL/DDL/uploads, perhatian pada WIB dan serialisasi, kewajiban bukti, serta mekanisme DBC dan pensiun tetap menjadi dasar.

## Pemeriksaan laporan

- PASS: angka inventaris berasal dari pemeriksaan repository; konfigurasi PM2 dibedakan dari keadaan produksi.
- PASS: setiap temuan mengacu pada bagian PRD atau sumber; usulan dan fakta dipisahkan.
- PASS: naskah memakai bahasa langsung, tanpa klaim benchmark atau eksploitasi yang belum dijalankan.
- N/A: pemeriksaan visual, keyboard, kontras, dan click-through; laporan ini tidak membuat atau mengubah UI.
