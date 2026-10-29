# PRD - Rewrite Dompis v3 (SvelteKit + Bun + ElysiaJS + Drizzle) dengan Tata Kelola Agent AI

**Proyek:** `dompis-v3-app` (folder target monorepo baru), menggantikan aplikasi sumber `dompis_v2` secara bertahap (strangler-fig)
**Produk:** Dompis - Telkom Akses Area 3 (Suramadu)
**Database:** MySQL (tetap, tidak berganti)
**Versi Dokumen:** 1.8. Dokumen kanonis berada di dompis-v3-app, laporan review tersedia dan governance dicatat di Git lokal; implementasi aplikasi belum dimulai.
**Tanggal:** 29 Oktober 2026 (WIB)
**Status:** Final sebagai panduan rewrite; prasyarat pelaksanaan pada Bagian 0 dan 14.6 tetap harus dipenuhi sebelum tahap terkait dimulai.
**Progres aktual:** [HANDOVER.md](HANDOVER.md). PRD menetapkan tujuan/aturan; checkpoint tersebut mencatat pekerjaan yang sudah dilakukan, pekerjaan parsial, bukti, blocker dan langkah berikutnya.
**Pembaca utama:** agent AI (OpenCode / Codex CLI) yang mengeksekusi kode, dan PakBreng sebagai pemilik keputusan.

> **Batas pekerjaan saat persiapan workspace.** Pemilik mengizinkan pembaruan dokumen dan pengarah sumber, penyalinan laporan review, pembuatan `.gitignore`, inisialisasi Git lokal dan pencatatan awal dokumen governance di target. Persiapan ini terpisah dari implementasi aplikasi. Belum ada izin menjalankan scaffold, mengubah kode/config aplikasi, menginstal dependency, menjalankan build/worker/tes aplikasi, mengakses DB, atau melakukan deploy. Perintah dan artefak di bawah adalah persyaratan untuk tahap pelaksanaan berikutnya, bukan instruksi untuk langsung dieksekusi saat membaca dokumen.

> **Cara memakai dokumen ini.** Pada awal sesi atau pergantian agent/model, baca HANDOVER.md terlebih dahulu, kemudian AGENTS.md, lalu PRD penuh pada awal keterlibatan. Pada setiap tugas berikutnya, muat Bagian 0, 1, 3, 4, 5, dan 8; spec modul, keputusan/DBC, serta bagian H/F/R/UI yang relevan. Catat versi PRD dan commit sumber pada checkpoint. Jika versi atau aturan inti berubah, baca ulang perubahan sebelum melanjutkan. Lampiran A adalah bahan penggabungan ke `AGENTS.md` target; jangan menimpa instruksi proyek yang masih berlaku. Riwayat revisi menjelaskan masa lalu, bukan aturan eksekusi saat ini.

> **Status temuan di dokumen ini.** Semua temuan di Bagian 6.3 dan 14.6 berasal dari **membaca kode**; belum ada yang dijalankan atau diuji. Setiap temuan diberi label verifikasi: **TERBACA** (mekanismenya terlihat langsung di kode, tetapi dampak nyatanya belum diukur), **PERLU-VERIFIKASI** (bergantung pada konfigurasi/produksi yang tidak ada di kode), atau **HIPOTESIS**. Agent wajib memverifikasi ulang tiap temuan terhadap kode saat tugas berjalan dan **boleh membantahnya** (Bagian 14.3).

### Riwayat revisi

| Versi | Tanggal | Isi |
|---|---|---|
| 1.0 | 14 Okt 2026 | Draf awal, disusun dari `ecosystem.config.js`, `package.json`, `worker-data.ts`, dan pemeriksaan auth |
| 1.1 | 26 Okt 2026 | Ralat setelah membaca `next.config.ts`, `proxy.ts`, `server.ts`, tujuh file worker, `ecosystem.config.js` terbaru, serta seluruh isi `app`, `lib`, `prisma`, dan `scripts` |
| 1.2 | 27 Okt 2026 | Perbaikan query, optimasi, dan perburuan bug (frontend, backend, worker) menjadi **kewajiban per modul**, bukan kegiatan opsional. Menambah R-33..R-44, gerbang G10 dan G11, jalur H/F, kelas perubahan, template DBC, protokol audit query, daftar temuan awal KI-20..KI-43, Bagian 15 Pensiun Kode Lama (R-45..R-52, G12, Jalur R), pertanyaan terbuka OQ-01..OQ-08, dan prompt H/F |
| 1.3 | 28 Okt 2026 | Standar penamaan dan gaya kode (camelCase, nama pendek dan jelas, tanpa gaya bahasa AI) dan standar UI anti-"AI slop" (tanpa gradien, tanpa em dash, teks pendek dan mudah dipahami). Menambah R-53..R-64, gerbang G13, Bagian 16 |
| 1.4 | 29 Okt 2026 | Menindaklanjuti RV-01..RV-14: identitas workspace, peta kapabilitas dan fitur, scorecard performa, parity state terisolasi, DBC, runner worker referensi, matriks gerbang per tahap, kontrak queue/cache/ownership, kebijakan keamanan, konteks berversi, batas perubahan visual, serta APK bersyarat. Tidak menjalankan rewrite |
| 1.5 | 29 Okt 2026 | Menambahkan checkpoint awal docs/execution-state.md, status tugas dan bukti, prosedur resume/handoff/pemulihan sesi, serta aturan satu penulis aktif. Tidak menjalankan implementasi rewrite |
| 1.6 | 29 Okt 2026 | Memindahkan progres aktif ke HANDOVER.md di root, menjadikan execution-state pengarah, serta menetapkan urutan baca handover lebih dahulu pada AGENTS/PRD/prompt. Riwayat CP-0001 dipertahankan; implementasi belum dimulai |
| 1.7 | 29 Okt 2026 | Pemilik menyetujui empat rekomendasi fondasi dengan nama target dompis-v3-app. Lokasi dan kandidat versi dicatat pada 0.7; repo GitHub baru dibuat/dihubungkan pemilik. Persetujuan keputusan dibedakan dari pelaksanaan scaffold/spike |
| 1.8 | 29 Okt 2026 | Menetapkan dokumen target sebagai kanonis, memperbarui handover CP-0004 dan pengarah sumber, menyalin laporan review, serta menyiapkan .gitignore dan Git lokal pada rewrite/bootstrap. Implementasi aplikasi dan koneksi GitHub belum dimulai |

### Ralat v1.1 → v1.2 (ringkas)

| # | v1.1 menyatakan | Sekarang | Bagian |
|---|---|---|---|
| 1 | R-08: bug dicatat saja, perbaikan "setelah parity" tanpa kewajiban dan tanpa mekanisme | Perbaikan adalah **kewajiban** lewat Jalur H (hunt) dan F (fix) per modul, dengan kelas perubahan, persetujuan, dan gerbang G10/G11. Port dan perbaikan **tetap tidak boleh satu commit** | 3.3, 14 |
| 2 | Perburuan bug dan audit query tidak punya protokol | Protokol tertulis untuk BE, FE, worker, keamanan, dan query (EXPLAIN, jumlah query, indeks) | 14.3, 14.4 |
| 3 | KI-14 "bergantung pada perpanjangan otomatis" | Dibaca di `task-runner.ts`: `withTaskLock` memperpanjang tiap `max(10 dtk, TTL/3)` dan membatalkan tugas bila perpanjangan gagal. Risiko tersisa hanya bila Redis tak terjangkau lebih lama dari TTL | 6.3 |
| 4 | KI-19: `SET SESSION` hanya di `worker.ts` | Ditemukan juga di `task-runner.ts:385` (dipanggil `status-refresh.ts:1013` tiap siklus) dan `summary-snapshot.ts:140` | 6.3 |
| 5 | Tidak ada fakta soal topologi deploy | Produksi berjalan di container LXC (CT 200) pada host Proxmox; build dilakukan di host lalu di-rsync (`build-external.sh`) karena `next build` pernah memakai 46 GiB. `typescript.ignoreBuildErrors: true` | 2.0, 7 |
| 6 | Tidak ada temuan keamanan | Register publik dengan `role_id` bebas, refresh token tanpa pembacaan ulang DB atau revokasi, berkas bukti tanpa autentikasi, SSE tanpa cakupan, dan lain-lain (KI-25..KI-34) | 6.3, 14.9 |
| 7 | Tidak ada temuan pipeline baru | Backoff adaptif scheduler selalu menganggap tugas "idle" (KI-20), circuit breaker data-worker tidak pernah efektif (KI-21), tidak terlihat penjadwal ingestion `nossa` di topologi PM2 (KI-23, **PERLU-VERIFIKASI**, prioritas tertinggi karena terkait keluhan ticket hilang) | 6.3, 14.6 |

### Ralat v1.0 → v1.1 (apa yang salah atau kurang, dan dampaknya)

| # | v1.0 menyatakan | Kode terbaru menunjukkan | Bagian yang berubah |
|---|---|---|---|
| 1 | Next.js 15, `middleware.ts` | Next.js **16** (Turbopack), file bernama **`proxy.ts`** | 2.1, 2.2 |
| 2 | 6 proses PM2, data-worker 870M | **7 proses**; data-worker 1536M (heap 2048M); ada `dompis-audit-log-purge` | 2.1, 7 |
| 3 | data-worker menjalankan tiga task dengan lock writer; KI-01 "lock 30 menit vs 30 detik" | `worker-data.ts` hanya memegang lock `data_worker`, **tidak** mengambil `ticket_raw_writer`; tiga worker terpisah ada di repo tetapi **tidak ada di PM2**; active-refresh dimatikan | 2.1, KI-01, Fase 3 |
| 4 | `QOSMIC_BRIDGE_TOKEN` plaintext di ecosystem | Tidak ada lagi di ecosystem terbaru; dibaca dari env (`qosmic-bridge/client.ts:21`) | R-17, KI-06 |
| 5 | `Permissions-Policy` memblokir kamera/GPS; R-20 mewajibkan `microphone=()` | v2 sudah `camera=(self), microphone=(self), geolocation=(self)`; pemakaian mikrofon tidak ditemukan di kode | R-20, KI-05 |
| 6 | `@yudiel/react-qr-scanner` disebut umum | Dipakai di 2 tempat saja: `LocationTagger.tsx` dan `teknisi/join/page.tsx` | 10 (A-07) |
| 7 | KI-07: `onu_rx`, `lapul`, `gaul` tidak terpetakan | Sekarang ada di `lib/ingestion/index.ts` (baris ±118-120, 205-207) | KI-07 |
| 8 | KI-08: status-refresh piloting satu per satu | Sekarang batch (`STATUS_REFRESH_PILOTING_BATCH_SIZE=300`, kandidat hot/safety) | KI-08 |
| 9 | Skrip `test:*` jadi referensi parity | **Nol** file `*.test.*`/`*.spec.*`; `test-*.ts` adalah skrip manual yang butuh DB | 2.3, G4, Fase 0 |
| 10 | Skala tidak diukur; "daily-ticket service 3467 baris" | 156 rute API, 45 halaman peran, ±123 ribu baris di `app`; angka lama diganti daftar per file | 2.0, Fase 6 |
| 11 | Tidak ada aturan soal waktu, tipe angka, Redis, uploads, fitur DB khusus | Ditemukan jebakan nyata di tiap area itu | R-27 s.d. R-32 |
| 12 | R-13 hanya melarang migrasi | Prisma tetap pemilik DDL selama dua sistem hidup bersama; perlu pemeriksa selisih skema | R-13, G9 |
| 13 | R-15 mengira query mentah v2 sudah aman bertag | 44 `*Unsafe` di `app`/`lib` (+3 di `worker.ts`, +32 di `scripts`), berparameter tetapi dirakit dari potongan string | R-15, Fase 0.5 |
| 14 | Parity cukup membandingkan dua sistem | Tanpa instance v2 yang berjalan, parity mustahil, padahal R-01 melarang menjalankan apa pun di v2 | R-01, Fase 0.7 |

---

## 0. Identitas Workspace, Kewenangan, dan Kesiapan

### 0.1 Identitas yang harus dikunci sebelum scaffold

Nama produk dan nama folder bukan bukti bahwa folder aman menjadi target. Audit 29 Oktober menemukan `/Users/pakbreng/Projects/dompis-v3` masih berisi aplikasi Next.js dengan `package.json.name=dompis_v2`, bukan monorepo SvelteKit baru.

| Identitas | Status yang diketahui dari review | Syarat sebelum dipakai |
|---|---|---|
| `SOURCE_ROOT` | Disetujui: `/Users/pakbreng/Projects/dompis-v3` | Sumber tetap dilindungi; dokumentasi hanya diubah lewat tugas eksplisit |
| `SOURCE_COMMIT` | Disetujui: `3ab0381ebeab90e4ca819fd93976eb16406eec1c` | HEAD cocok saat keputusan dicatat; perubahan baseline berikutnya perlu dicatat |
| `TARGET_ROOT` | Disetujui dan sudah tersedia: `/Users/pakbreng/Projects/dompis-v3-app`; root dokumen kanonis dan repository Git lokal | Terpisah/sejajar sumber; verifikasi branch/HEAD dan kewenangan sebelum menulis |
| `REFERENCE_ROOT` / `REFERENCE_URL` | Path disetujui: `/Users/pakbreng/Projects/dompis-v2-ref`; belum dibuat; URL belum ditentukan | Salinan dari commit sumber yang sama, DB dev anonim dan runner terisolasi; bukan produksi |
| DB referensi / DB target | Belum disiapkan | Dua DB dev dari snapshot identik, identitas tanpa password, tidak menunjuk produksi |
| Redis dan uploads uji | Belum disiapkan | State terisolasi per sisi; uploads fixture, bukan direktori produksi |
| Pemilik keputusan/deploy | PakBreng | Pelaksana dan izin setiap tindakan dicatat; persetujuan dokumen tidak otomatis menjadi persetujuan cutover |

Semua sebutan `dompis_v2` berarti sumber di `SOURCE_ROOT`; `dompis-v3` berarti target di `TARGET_ROOT`. Agent tidak boleh membuat target bersarang atau mengosongkan workspace untuk menyesuaikan nama. Ketidakpastian path menghentikan scaffold, tetapi review dokumen dan inventaris baca-saja tetap dapat dikerjakan.

### 0.2 Hierarki kontrak dan bukti

1. Instruksi pemilik yang eksplisit menentukan ruang lingkup dan kewenangan tugas. Perubahan terhadap PRD dicatat sebagai keputusan, bukan diterapkan diam-diam.
2. PRD aktif, kontrak fitur, ADR, dan DBC yang disetujui menentukan perilaku tujuan. DBC hanya mengganti butir yang disebutkan dan memiliki dampak kompatibilitas yang dinilai.
3. Kode pada `SOURCE_COMMIT`, ditambah konfigurasi efektif yang dibuktikan, menjelaskan baseline lama. Komentar dan ringkasan adalah bukti pendukung, bukan pengganti pemeriksaan kode/runtime.
4. Konflik di luar perubahan yang disetujui menghentikan unit yang terdampak. Agent mencatat konflik dan opsi; pekerjaan independen tetap boleh dilanjutkan dalam kewenangannya.

Angka audit, isi PM2 di repository, komentar ukuran uploads, dan hipotesis KI tidak membuktikan kondisi produksi hari ini. Bukti runtime dari pemilik harus bertanggal, menyebut versi/config relevan, dan disensor dari rahasia/data pelanggan.

### 0.3 Kesiapan dan status yang sah

- **SIAP-DOKUMEN:** review, inventaris, dan penyusunan kontrak dapat berjalan.
- **SIAP-FONDASI:** identitas workspace, daftar dependency fondasi, kewenangan tugas, dan lingkungan spike telah disepakati. Hanya tugas fondasi yang prasyaratnya lengkap boleh dimulai.
- **SIAP-PORT modul:** spec fitur, pemanggil, kontrak field/efek samping, dependency modul, serta referensi/harness yang diperlukan tersedia. Baseline dan target modul ditetapkan sebelum pekerjaan optimasi dinilai.
- **SIAP-CUTOVER modul:** seluruh gerbang wajib tahap cutover hijau, target terukur terpenuhi, keamanan dan kontrak transisi lolos, UAT/rollback disetujui.
- **SIAP-PENSIUN:** masa observasi dan seluruh syarat Bagian 15 terpenuhi.

Versi dokumen ini tidak menyatakan bahwa proyek sudah SIAP-FONDASI atau SIAP-PORT. Daftar keputusan terbuka berada di 14.6. Tidak ada status yang boleh dinaikkan hanya karena dokumen atau stub sudah dibuat.

### 0.4 Konteks yang dapat dibawa ke sesi dan lingkungan lain

PRD, AGENTS, HANDOVER dan laporan review di TARGET_ROOT adalah dokumen kanonis; keempatnya beserta `.gitignore` dicatat di Git lokal target. `.gitignore` target mengizinkan dokumen governance dan mengabaikan rahasia, uploads, dump, log serta hasil build. Spec, feature matrix, ADR/DBC dan migration-map harus ikut tracked ketika dibuat. Aturan `*.md` pada repository sumber adalah keadaan historis yang tidak diubah oleh tugas ini. GitHub belum terhubung: file baru akan tersedia di clone lain setelah repository diterbitkan oleh pemilik.

Checkpoint awal dibuat di `docs/execution-state.md` pada versi 1.5, kemudian dipindahkan ke `HANDOVER.md` pada versi 1.6 dengan riwayatnya dipertahankan. Lokasi lama hanya pengarah. Status implementasi rewrite tetap BELUM DIMULAI pada migrasi dokumentasi ini. Dokumen itu menjadi checkpoint operasional untuk sesi selanjutnya; bukan bukti bahwa lingkungan target/harness telah tersedia. Ia memuat tugas aktif, ID fitur/modul, versi PRD, commit sumber/target, scope file, keputusan berlaku, gerbang beserta tanggal/bukti, blocker lokal dan langkah berikutnya. Sesudah pergantian sesi, agent memverifikasi checkpoint terhadap file/commit aktual. Jika sumber berubah, audit diff yang memengaruhi modul dan perbarui kontrak sebelum melanjutkan.

### 0.5 Peran Dokumen dan Identitas Progres

| Dokumen | Sumber kebenaran untuk | Kapan diperbarui |
|---|---|---|
| PRD aktif | Tujuan, batas, kapabilitas, acceptance dan kebijakan pengujian/transisi | Ketika keputusan/kontrak berubah, dengan riwayat versi; bukan setiap satu langkah kode |
| AGENTS.md | Indeks instruksi dan cara memuat konteks | Ketika aturan/versi PRD atau prosedur kerja berubah |
| HANDOVER.md | Tahap saat ini, daftar tugas operasional, status, pemilik sesi, pekerjaan parsial, bukti, blocker dan handoff | Setiap batas tugas/checkpoint dan sebelum pergantian agent |
| feature-parity-matrix dan migration-map | Kelengkapan fitur serta status unit kode/operasional | Ketika fitur/unit yang terkait berubah tahap; ID harus cocok dengan checkpoint |
| Laporan 9.1, ADR/DBC dan artefak tes | Bukti pelaksanaan dan keputusan yang mendukung status | Saat tugas/keputusan/pengujian tersebut benar-benar terjadi |

Sejak versi 1.8, root dokumen kanonis adalah `/Users/pakbreng/Projects/dompis-v3-app`. HANDOVER.md target memuat checkpoint aktif dan seluruh riwayat CP-0001..CP-0004. HANDOVER.md di sumber hanya pengarah; PRD/AGENTS lama di sumber diberi penanda arsip dan tidak menjadi kontrak rewrite aktif. Jangan memelihara dua checkpoint aktif di sumber dan target. Agent tidak boleh menganggap file yang hilang sebagai izin mengulang scaffold atau mengarang progres dari ingatan percakapan.

Status tugas operasional memakai TODO (belum dikerjakan), IN_PROGRESS (dikerjakan satu pemilik), BLOCKED (prasyarat/bukti belum tersedia), IN_REVIEW (hasil tersedia, pemeriksaan wajib belum lengkap), dan DONE (acceptance serta gerbang tahap terpenuhi). Status ini berbeda dari tahap modul Paritas/Cutover/Observasi/Pensiun. DONE untuk tugas dokumen tidak berarti modul atau fase implementasi selesai.

Setiap tugas menyebut ID, tahap, modul/fitur bila ada, dependency, pemilik sesi, scope file, acceptance, status, bukti/commit dan langkah lanjut. Jika lingkup/daftar tugas belum lengkap, jangan menghitung persentase keseluruhan. Tampilkan jumlah tugas menurut status pada cakupan yang sudah didefinisikan, beserta pekerjaan yang belum dipecah. Jumlah tugas dokumentasi tidak boleh dihitung sebagai kemajuan implementasi.

### 0.6 Berganti Agent, Mesin, atau Sesi

Urutan pembacaan wajib saat start/resume atau pergantian model: HANDOVER.md, AGENTS.md, PRD aktif, kemudian spec/keputusan/bukti terkait dan verifikasi file/Git. Jika platform memuat AGENTS otomatis, instruksi bootstrap di awalnya mengarahkan pembacaan berikutnya ke HANDOVER. Agent tidak diasumsikan berbagi memori percakapan atau otomatis membaca nama file yang sama. Berikan prompt resume 9.5 secara eksplisit. Agent baru harus menyatakan dokumen/versi, lokasi, status yang ditemukan dan satu tugas berikutnya sebelum mengubah file, lalu mengikuti izin tugas aktif.

Default pelaksanaan adalah satu agent penulis aktif pada cakupan workspace/tugas yang sama. Pergantian dilakukan berurutan: agent lama menyimpan handoff dan menghentikan pekerjaan, kemudian agent baru memverifikasi state sebelum mengambil tugas. Nama pemilik di Markdown adalah koordinasi, bukan lock teknis. Jangan menganggap timeout atau label pemilik kosong sebagai bukti bahwa proses lama berhenti atau sebagai izin menulis.

Kerja paralel hanya jika diminta/diizinkan dengan scope dan worktree terpisah, dependency/integrasi yang jelas, serta satu pemilik penggabungan/checkpoint. Dokumen ini tidak meminta atau mengaktifkan sub-agent otomatis. Dua agent tidak boleh menulis file atau mengelola writer/worker produksi yang sama secara bersamaan.

Jika memakai clone/mesin lain, verifikasi dokumen governance beserta kode, commit, fixture dan bukti yang diperlukan benar-benar tersedia. Dokumen kanonis sudah dicatat di Git lokal target, tetapi belum tersedia melalui GitHub sampai pemilik menghubungkan dan menerbitkan repository. Bila dokumen wajib hilang, hentikan perubahan yang bergantung padanya dan minta salinan tepercaya dari pemilik. Jangan menyalin rahasia, DB produksi atau data pelanggan untuk melengkapi handoff.

### 0.7 Keputusan Fondasi yang Disetujui Pemilik

Tanggal keputusan: 29 Oktober 2026 (WIB). Pemilik menyetujui rekomendasi empat keputusan fondasi, dengan perubahan nama folder target menjadi `dompis-v3-app`. Keputusan ini melengkapi konteks T-0.0; tidak menyatakan scaffold, instalasi, kompatibilitas library atau koneksi GitHub sudah dilakukan.

| Aspek | Keputusan |
|---|---|
| Sumber | SOURCE_ROOT dan SOURCE_COMMIT sesuai 0.1; folder sumber tidak dipindah/diubah namanya |
| Target | `/Users/pakbreng/Projects/dompis-v3-app`, sejajar sumber, bukan di dalamnya |
| Referensi | `/Users/pakbreng/Projects/dompis-v2-ref`, dari commit sumber yang sama; salinan/lingkungan belum disiapkan |
| Repository target | Git lokal terpisah sudah diinisialisasi untuk pencatatan governance. Repository GitHub baru akan dibuat/dihubungkan pemilik; URL/remote belum tersedia; agent tidak membuat repository GitHub atau push sendiri |
| Branch awal lokal | `rewrite/bootstrap` menjadi branch awal Git lokal; gunakan `git log -1 --oneline` di target untuk melihat HEAD aktual. Koneksi GitHub bukan prasyarat pencatatan lokal |
| Dokumen dan versioning | HANDOVER, AGENTS, PRD dan dokumen governance yang relevan harus tracked di target. Hindari aturan menyeluruh `*.md` pada repo target; secret/uploads/dump/log/build tetap diabaikan |
| Lokasi dokumen aktif | `/Users/pakbreng/Projects/dompis-v3-app`: HANDOVER, AGENTS, PRD dan laporan review adalah salinan kanonis. Handover sumber hanya pengarah; satu checkpoint aktif |
| Cakupan awal | Persiapan dokumen kanonis, laporan review, .gitignore dan Git lokal selesai. Scaffold 0.1, instalasi/spike, DB dan deploy belum dijalankan; T-0.0 tetap IN_REVIEW |

**Manifest awal yang disetujui untuk kandidat fondasi/spike:** versi di bawah adalah pilihan awal dari rekomendasi yang diterima, bukan hasil uji kompatibilitas atau klaim bahwa semuanya sudah terinstal. Paket dipasang pada tahap yang memerlukannya setelah scope, toolchain/peer dependency dan lingkungan siap. Perubahan versi di luar daftar mengikuti R-09.

| Dependency/runtime | Versi kandidat disetujui | Pemakaian |
|---|---|---|
| Bun | 1.4.4 | Runtime/package manager, diuji pada target |
| Svelte | 5.57.3 | Web |
| @sveltejs/kit | 3.1.0 | Web; toolchain/adapter kompatibel perlu dicatat sebelum scaffold |
| Elysia | 1.4.30 | API; plugin/Eden kompatibel perlu dipastikan sebelum dipakai |
| drizzle-orm | 0.45.4 | Pemetaan/query MySQL |
| drizzle-kit | 0.31.11 | Introspect/verifikasi skema; bukan izin push/migrate |
| mysql2 | 3.20.0 | Driver DB |
| ioredis | 5.11.1 | Redis, pub/sub dan lock |
| bullmq | 5.81.1 | Queue worker |
| jose | 6.2.3 | JWT |
| bcryptjs | 3.0.3 | Verifikasi hash password lama |
| zod | 4.3.6 | Validasi |
| node-cron | 4.2.1 | Scheduler sesuai kontrak sumber |
| typescript | 5.9.3 | Pemeriksaan tipe; kompatibilitas toolchain perlu diuji |

Versi runtime/framework baru berasal dari rekomendasi rilis resmi yang diperiksa pada sesi sebelumnya; versi library backend berasal dari package-lock sumber. Kunci versi tepat dan `bun.lock` setelah dependency diselesaikan pada target; tidak ada instalasi/lockfile baru pada pencatatan ini. Versi adapter, Vite/plugin, Eden dan tooling lint/test tambahan belum dipilih dalam rekomendasi awal; catat pilihan kompatibel sesuai R-09 sebelum tahap pemakainya, tanpa mengarang persetujuan atau hasil spike.

## 1. Tujuan dan Non-Tujuan

### 1.1 Tujuan
1. Menulis ulang Dompis dengan stack **TypeScript di semua layer**: SvelteKit (seluruh role), Bun + ElysiaJS (API dan worker), Drizzle ORM (MySQL).
2. Mempertahankan seluruh kapabilitas yang disepakati pada 1.3/1.4, termasuk aturan role/scope dan efek samping. Port P identik dengan baseline; perubahan F2/S mengikuti DBC dan aturan keamanan. Port dan fix tetap tugas terpisah.
3. Menurunkan total pemakaian sumber daya dan latensi pada workload yang sebanding, sekaligus menjaga kesegaran serta kelengkapan data. Keberhasilan wajib memenuhi scorecard Bagian 7; perpindahan stack sendiri bukan bukti peningkatan.
4. Rollout bertahap per modul. Sistem lama tetap melayani produksi sampai modul penggantinya lulus semua gerbang.
5. **Tidak ada versi ganda yang tertinggal.** Setelah sebuah modul, fungsi, kelas, atau fitur diganti dan terbukti stabil, versi lamanya dipensiunkan dan dihapus lewat prosedur Bagian 15.
6. Menemukan dan memperbaiki bug (frontend, backend, worker), query lambat, dan celah keamanan sepanjang jalan (Bagian 14).

### 1.2 Non-Tujuan
- Tidak menambah fitur baru selama fase port (War Map baru, auto-assign baru, dan sebagainya menunggu setelah parity). Perbaikan bug dan optimasi **bukan** fitur baru: itu kewajiban Jalur H/F.
- Tidak mengubah skema database produksi selama fase port.
- Tidak mengganti desain UI/UX secara bebas. UI mengikuti `dompis_v2` kecuali ada keputusan tertulis dari PakBreng.
- Tidak membongkar `dompis_v2` secara ad hoc. Folder itu **read-only**; satu-satunya jalan menghapus isinya adalah Jalur R (Bagian 15) dengan izin tertulis.
- Tidak menjadikan APK, mekanisme offline baru, atau perubahan arsitektur tambahan sebagai fitur wajib tanpa bukti bahwa itu kanal lama atau keputusan ruang lingkup baru.

### 1.3 Peta Kapabilitas dan Batas Modul

Peta berikut menetapkan cakupan yang harus diinventaris, bukan klaim bahwa seluruh perilakunya sudah diaudit. Setiap method/path dan pemicu memiliki tepat satu modul pemilik; modul lain menjadi konsumen. Dependency adalah urutan kontrak/implementasi, bukan izin menyalakan dua penulis produksi.

| ID | Kapabilitas yang dipertahankan | Sumber awal | Dependency kontrak |
|---|---|---|---|
| M00 | Infrastruktur, waktu/tipe, SQL gate, cache, lock, scheduler, observability | `lib/`, `app/libs/request-security.ts` | Kontrak workspace dan skema |
| M01 | Login/captcha, sesi, role, pengguna, password, scope wilayah, undangan pengguna | `app/api/auth/`, `app/api/users/`, `app/api/roles/` | M00, skema; API tetap memakai penerbit token v2 sampai dialihkan |
| M02 | Area, region, branch, workzone, service area | `app/api/area/`, `region/`, `branch/`, `workzone/`, `sa/` | M00, M01 |
| M03 | Daftar/detail/search ticket; claim/pickup/assign/unassign; update/manual/bulk; close/bypass/reopen; bukti, alamat/perangkat/lokasi, histori dan RCA | `app/api/tickets/`, service workflow, halaman ticket | M00, M01, M02, kontrak M04/M10 |
| M04 | Teknisi, absensi/gate per segmen, check-in/check-out, manhours/import, bobot/performa/ekspor, join tim QR | `app/api/technicians/`, `app/api/team/`, attendance-gate admin | M00, M01, M02; join tim memakai kontrak ticket M03 |
| M05 | Dashboard, rekap, bucket/KPI, TTR, Semesta, detail WO HI, target KPI, seluruh ekspor terkait | `app/api/dashboard/`, `kpi-targets/`, daily-ticket services dan ekspor ticket | M00, M01, M02, kontrak baca M03/M09 |
| M06 | Clustering, node/area/import bulk, assignment, auto-assign dan copy assignment | `app/api/clustering/`, cluster services, cron ops | M00, M01, M02, M03, M04 |
| M07 | War Map, geotagging, bank lokasi/histori, KML preview/import/layer/sublayer/filter | `app/api/war-map/`, `app/libs/kml/`, tools | M00, M01, M02, M03 |
| M08 | Nossa search/fallback, ingest manual/import tiket, ingestion incremental/backfill/reconcile/quarantine, bridge dan failover piloting | `app/api/nossa/`, `import-tiket/`, admin ingest, `lib/ingestion/`, bridge | M00, skema; payload queue, producer/consumer dan ownership harus disepakati |
| M09 | Projection, snapshot, checkpoint dan rekonsiliasi data mentah ke ticket/dashboard | `lib/projection/`, `lib/aggregation/`, worker projection/snapshot | M00, kontrak tulis M08 dan baca M03/M05 |
| M10 | SSE, topbar notifications/read-all, FCM/perangkat, tech-events, webhook, integrasi yang dikonfirmasi aktif | events, notifications, fcm-token, integrations, push/sync | M00, M01, kontrak efek samping M03/M08/M09 |
| M11 | Audit log, health/monitoring, internal triggers, DLQ/retry, retensi, backup dan skrip darurat | audit-log, monitoring, internal, worker ops dan scripts | M00 serta kontrak modul yang dipantau/dipicu |
| M12 | UI semua role, login/register/root, navigasi, sesi lintas aplikasi, aksesibilitas dan perangkat lapangan | seluruh 48 halaman sumber dan komponen/hook pemakainya | M01..M11 sesuai halaman; pilot memakai API yang sudah stabil |

Endpoint yang melintasi kapabilitas, misalnya ekspor daily ticket atau lokasi ticket, diberi satu pemilik pada inventaris dan referensi dependency dari modul konsumen. Jangan memindahkan atau menggandakan implementasi demi menyamakan kelompok folder. Modul besar dipecah menjadi tugas per alur yang dapat diverifikasi. Kontrak yang dipakai cron/worker harus siap sebelum cron/worker itu dinyalakan; nomor fase bukan pengganti pemeriksaan dependency.

### 1.4 Matriks Fitur dan Kriteria Penerimaan

Pada Fase 0 buat `docs/feature-parity-matrix.md` dan `docs/route-inventory.md`. Inventaris awal mencakup 156 berkas route, **seluruh method HTTP** yang diekspor, 48 halaman, pemicu worker/cron, skrip operasional, dan pemanggil eksternal yang dikonfirmasi. Angka disesuaikan terhadap commit sumber yang dikunci, bukan dipaksa tetap.

| ID fitur | Modul | Tujuan pengguna/aktor | Layar + method/path/pemicu | Bukti sumber/commit | Aturan dan role/scope | Field + efek samping | Kasus uji/ID | Keputusan | Target dan status |
|---|---|---|---|---|---|---|---|---|---|
| FEAT-... | M.. | Satu pekerjaan pengguna yang konkret | Semua langkah yang diperlukan | path:simbol/baris | Kondisi sah dan ditolak | DB, outbox, file, event/cache | Normal, tepi, gagal, race | Pertahankan / DBC / Ditahan / Tidak diport | Belum / Spec / Port / Paritas / Fix / Siap-cutover / Observasi / Pensiun |

Setiap baris memiliki acceptance criteria Given/When/Then dan ID tes, termasuk kegagalan tanpa perubahan state sebagian. Rute yang tidak dipakai UI tetap diinventaris karena dapat dipanggil skrip/monitor eksternal. Tidak ada fitur yang hilang hanya karena tidak disebut dalam contoh fase. Coverage method/path, coverage alur bisnis, dan migration-map unit kode diperiksa terpisah.

Acceptance criteria minimum lintas alur:

- **Akses:** setiap role dan scope wilayah/objek diuji, termasuk alias, teknisi mengakses ticket orang lain, serta kombinasi Branch/Workzone. Perubahan hak akses membutuhkan keputusan/DBC keamanan yang relevan.
- **Ticket:** transisi claim, pickup, assign, update, close, bypass, reopen, unassign menjaga aturan dan histori; submit bersamaan/ulang tidak menghasilkan state atau outbox ganda di luar kontrak yang disetujui.
- **Absensi dan tim:** gate B2B/B2C/unset, hari WIB, status sesi, serta check-in/check-out mengikuti sumber; QR memeriksa jenis/masa berlaku/pemakaian token dan batas anggota. Token tim `JWT_SECRET` dipisahkan dari kontrak token akses/refresh.
- **Ingestion sampai UI:** replay sumber yang sama idempoten; aturan ownership per kolom, open/closed, perpindahan hari dan failover tercatat; data terproyeksi serta tampil dalam batas lag scorecard, tanpa menghapus perubahan manual yang harus dilindungi.
- **Impor/ekspor:** preview dan run konsisten, tipe/kolom/filter/jumlah baris sesuai, kegagalan parsial dilaporkan, batas file/ekspor serta penggunaan memori diuji.
- **Perangkat/UX:** kamera/GPS ditolak dan jaringan terputus ditangani; state loading/kosong/error tersedia; tidak ada kehilangan isian atau klaim sukses palsu; keyboard, tema, dan lebar 360 px diperiksa.
- **Efek samping:** file, audit, outbox, SSE, notifikasi dan invalidasi cache diperiksa bersama mutasi. Pengiriman ke layanan nyata tidak dilakukan dari lingkungan uji.

### 1.5 Definisi Hasil Rewrite yang Diterima

Rewrite diterima ketika seluruh fitur dalam cakupan memiliki hasil uji dan keputusan yang terlacak, scorecard menunjukkan peningkatan yang disepakati, data/keamanan tidak mengalami regresi, transisi dan rollback teruji, serta dokumentasi/operasional tersedia. Keterbatasan dan fitur Ditahan dicatat dengan pemilik dan alasan. Port yang hanya berhasil build atau berpindah framework belum memenuhi tujuan ini.

Sebelum setiap tugas port, spec modul harus menyebut: ID fitur, tujuan, pemanggil/dependency, kontrak input/output/waktu/angka, otorisasi, invariants, efek samping, kasus gagal, ukuran keberhasilan, gerbang tahap, scope file, dan rollback. Agent tidak menambah fitur untuk mengisi ketidakpastian.

---

## 2. Fakta Sistem Lama (Hasil Audit Kode, 26 Okt 2026)

Fakta ini berasal dari pembacaan kode/config pada audit 26 Oktober, dengan koreksi review 29 Oktober 2026. Ikuti hierarki 0.2. Bedakan konfigurasi repository, konfigurasi efektif yang dikonfirmasi pemilik, dan hasil runtime terukur. Temuan lama wajib diverifikasi terhadap commit yang dikunci; nomor baris dapat bergeser.

### 2.0 Skala (supaya tidak ada yang menyangka ini migrasi kecil)

| Aspek | Angka |
|---|---|
| Framework | Next.js 16; konfigurasi Turbopack tersedia untuk dev; skrip build repository memakai `next build --webpack`; `output: 'standalone'`, custom `server.ts`, `proxy.ts` |
| Rute API (`route.ts`) | **156**: tickets 34, technicians 18, dashboard 18, clustering 13, users 12, war-map 10, monitoring 7, internal 7, auth 5, import-tiket 4, sisanya 28 |
| Halaman | admin 31, teknisi 7, superadmin 4, helpdesk 3, ditambah login/register/root. Server actions: 0 |
| Kode `app` | ±122.700 baris TS/TSX: admin 36.900, api 24.300, libs 21.500, components 17.800, teknisi 12.600, hooks 3.500, superadmin 2.400, helpdesk 900 |
| Kode `lib` | ±16.300 baris. Terbesar: `ingestion/index.ts` 1913, `projection/index.ts` 1894, `status-refresh.ts` 1211, `bridge-queue.ts` 585, `active-refresh.ts` 551 |
| Service bisnis | ±14.300 baris. Terbesar: `tickets.service.ts` 2028, `ticketWorkflow.service.ts` 1702, `daily-ticket-helpers.ts` 1125, `clusterAutoAssign.service.ts` 971, `daily-ticket-table.ts` 911, `cluster.service.ts` 816 |
| Komponen client | 257 file `'use client'`. Pemakaian API khas Next: `NextResponse` 161 file, `next/navigation` 51, `next/headers` 15, `next/dynamic` 13, `next/image` 12, `export const runtime` 81, `export const dynamic` 105 |
| Prisma | 52 model, 64 migrasi, 178 deklarasi index, 119 field `DateTime`, 9 `BigInt`, 20 `Decimal`, 7 `Json`, 8 `@updatedAt` |
| SQL mentah di `app`+`lib` | 39 `$queryRawUnsafe` + 5 `$executeRawUnsafe` (+3 di `worker.ts`), 6 `$queryRaw` + 18 `$executeRaw` bertag. Di `scripts`: tambahan 32 pemakaian `*Unsafe` |
| Pengujian | **Nol** file `*.test.*`/`*.spec.*`. `scripts/` berisi 88 berkas (skrip operasional dan skrip `test-*.ts` manual) |
| Konfigurasi | 99 nama variabel env berbeda dipakai di kode |

### 2.1 Definisi Proses PM2 di Repository (7 proses; runtime perlu dikonfirmasi)

| Nama | Entry | `max_memory_restart` / heap | Pool Prisma | Peran |
|---|---|---|---|---|
| `dompis-server` | `next start -p 9005` (fork; cluster jika `WEB_INSTANCES>1`) | 8192M / 4096M | 35 (+ pool bulk 6) | Web + API |
| `dompis-ops-worker` | `worker.js` | 1024M / 768M | 8 | 12 cron (daftar di bawah) |
| `dompis-data-worker` | `worker-data.js` | **1536M** / 2048M | 15 | Ingestion (hanya `piloting_tickets`) lalu status-refresh, berurutan. Active-refresh MATI |
| `dompis-bridge-worker` | `worker-bridge.js` | 512M / 512M | 6 | BullMQ 3 queue (interactive, ingestion, backfill) ke QOSMIC; `kill_timeout` 120 dtk |
| `dompis-projection-worker` | `worker-projection.js` | 870M / 1024M | 6 | Proyeksi `ticket_raw` → `ticket` |
| `dompis-snapshot-worker` | `worker-snapshot.js` | 256M / 256M | 4 | Snapshot ringkasan dashboard tiap 60 dtk |
| `dompis-audit-log-purge` | `tsx scripts/audit-log-purge.ts` | 256M / 256M | 4 | Sekali jalan, `cron_restart` 03:00, `autorestart:false` |

Total pool proses ≈ **78 koneksi**. Setiap proses juga membuat `prismaBulk` (default 6, koneksi dibuka bertahap), sehingga puncak teoritis lebih tinggi. `max_connections` MySQL **belum diketahui** dan harus dicatat di baseline (Bagian 7). Ops-worker dan data-worker juga punya pool ke DB eksternal (6 koneksi).

**Cara kerja data-worker (dibaca dari `worker-data.ts`):**
- Interval konfigurasi 1 menit di bawah satu lock `data_worker` (TTL 2100 dtk, batas siklus 120 menit); interval nyata perlu diverifikasi terhadap KI-20/OQ-04. Urutannya: ingestion → status-refresh → (active-refresh, dimatikan). Setelah itu `requestImmediateProjection()` (insert `projection_request`, debounce Redis 30 dtk, publish pub/sub) dan `warmupDashboardSummary()` (dimatikan lewat `DASHBOARD_WARMUP_ENABLED=false`).
- Ia **tidak** mengambil lock `ticket_raw_writer`. Lock itu hanya dipakai `worker-ingestion.ts`, `worker-status-refresh.ts`, dan route `api/internal/ingestion`.
- `worker-ingestion.ts`, `worker-status-refresh.ts`, `worker-active-refresh.ts` ada di repo tetapi **tidak ada di `ecosystem.config.js`**. Anggap legacy sampai PakBreng mengonfirmasi lain (R-32).
- Pembagian penulis `ticket_raw` hari ini dijaga oleh **konfigurasi**, bukan lock: data-worker dibatasi `EXTERNAL_TABLE_NAMES=piloting_tickets`, sedangkan `nossa` dan `nossa_closed` lewat bridge-worker. Komentar di ecosystem menyebut dua penulis menyebabkan deadlock 1213. Penulis `ticket_raw` yang teridentifikasi: `lib/ingestion`, `lib/status-refresh.ts` (INSERT di sekitar baris 700, dengan "ownership guard"), `api/tickets/[id]/live-refresh`, dan `api/import-tiket/run`.
- `runWeeklyBackfill()` di data-worker hanya jalan **sekali**, 5 menit setelah start, dan nonaktif lewat `DATA_WORKER_BACKFILL_ENABLED=false`. Backfill yang sebenarnya ada di bridge-worker.

**Jadwal ops-worker (12 cron):** tech-events 2 mnt, gauge-reconcile 2 mnt, reguler-webhook 15 mnt, auto-assign 5 mnt (rotasi 20 service area per putaran), dlq-retry 5 mnt, health 15 mnt, reconciliation 06:00, reset stale assigned 00:05, bridge-DLQ 15 mnt, tech-event-cleanup 03:00, log-retention 03:10, transient-cleanup 30 mnt. Plus pelanggan pub/sub `worker:tech-events:request`. Fungsi `runSync` dan `runPush` (Google Sheets) **terdefinisi tetapi tidak dijadwalkan**.

**Jadwal lain:** projection-worker memproyeksi tiap 2 mnt + sinyal pub/sub + full scan `0 3 * * *` (dari env) + reset stale assigned 00:00 + menghapus key Redis `active-refresh:*` tiap start.

### 2.2 Kontrak Baseline yang Dilindungi Selama Transisi

Nilai berikut menjelaskan baseline, bukan kewajiban mewarisi celah keamanan. Perubahan hanya melalui DBC yang disetujui dan uji kompatibilitas; jalur rentan yang terbukti tidak boleh aktif saat cutover (R-42). URL/field yang tetap dipakai klien dipertahankan kecuali migrasinya dinyatakan eksplisit.

| Kontrak | Nilai di sistem lama | Alasan wajib kompatibel |
|---|---|---|
| Cookie sesi | `token` (akses) dan `refreshToken`; `httpOnly`, `secure` di production, `sameSite=lax` (`request-security.ts`) | Dua aplikasi satu domain, login sekali |
| Verifikasi JWT | `jose` di rute; `proxy.ts` memverifikasi HMAC-SHA256 buatan sendiri dengan `JWT_ACCESS_SECRET` tanpa memeriksa header `alg`; payload memuat `id_user`, `role`, `role_id`, dan data absensi (`createDefaultAttendancePayload`) | v3 harus menerima token v2 dan sebaliknya. Payload adalah kontrak |
| Silent refresh | `proxy.ts` menukar `refreshToken` lewat `POST /api/auth/refresh`, lalu memasang cookie `token` baru **pada respons apa pun**, termasuk redirect role guard | Perilaku ini harus ada persis di `hooks.server.ts` SvelteKit |
| Penerbitan token | `api/auth/{login,logout,refresh,register}` + captcha (`lib/auth/login-captcha.ts`) | Rekomendasi: **v3 hanya memverifikasi token**, penerbitan tetap di v2 sampai fase akhir |
| Role dan alias | `superadmin` (alias `super_admin`, `super-admin`), `admin`, `helpdesk`, `teknisi` (alias `technician`), `senior_leader` (alias `sl`, `seniorleader`), `admin_branch` (alias `adminbranch`) | RBAC bergantung pada string ini |
| Peta role → halaman | `/admin`: admin, superadmin, senior_leader, admin_branch. `/helpdesk`: helpdesk, superadmin, senior_leader. `/superadmin`: superadmin, dan admin_branch hanya `/superadmin/users*`. `/teknisi`: teknisi. Helpdesk boleh `/admin/tools`, `/admin/tools/war-map*`, `/admin/tools/import-kml*` saja | Guard halaman di `proxy.ts` |
| Cache-Control API | `/api/area`, `/api/roles`, `/api/region`: `private, max-age=300, stale-while-revalidate=600`. `/api/branch/options`, `/api/workzone*`: `private, max-age=30, must-revalidate` + `Vary: Cookie`. `/api/dashboard/*`, `/api/technicians`, `/api/sa`: `private, max-age=30, stale-while-revalidate=60`. Lainnya: `no-cache, no-store, must-revalidate`. Header `x-correlation-id` di semua respons | Perilaku cache klien |
| Header keamanan | `X-Frame-Options: DENY`, HSTS, CSP, `Permissions-Policy: camera=(self), microphone=(self), geolocation=(self), interest-cohort=()` (`request-security.ts`) | Tidak boleh melemah di v3 |
| SSE | `GET /api/tickets/events` (role: admin, helpdesk, superadmin, super_admin, teknisi), heartbeat 20 dtk, fan-out lewat Redis (`sseBroadcast.ts`, `sse-redis.ts`); dipakai juga `clustering/auto-assign`, `useTicketEvents`, `WarMapClient` | Klien lama dan baru harus menerima format event yang sama |
| Uploads | Berkas bukti di `public/uploads` (**±49 GB** di produksi), disajikan `GET /api/files/[...path]` dengan proteksi path traversal, `Cache-Control: public, max-age=31536000, immutable` | Tidak boleh disalin atau dipindah (R-29) |
| Redis | Lock `lock:<key>` + `lock:<key>:fencing` + `lock:<key>:meta` (skrip Lua); cache berversi (`dashboard:rekap:v28:...`); heartbeat `worker:heartbeat:<nama>`; channel `PROJECTION_REQUEST_CHANNEL` dan `worker:tech-events:request`; antrean BullMQ | Satu Redis dipakai bersama selama dua sistem hidup (R-28) |
| Hash password | `bcryptjs` | Hash di DB harus tetap terverifikasi |
| Zona waktu | WIB untuk tampilan dan `sync_date`; nilai waktu disimpan "apa adanya" (lihat R-27) | Aturan harian bergantung pada tanggal WIB |
| Token undangan/tim | QR join menggunakan jenis payload dan masa berlaku, `JWT_SECRET`, serta rekaman `invite_token`/`ticket_team` (`app/api/team/join/route.ts`) | Rotasi token akses tidak boleh diam-diam membatalkan undangan atau mengubah alur tim |
| Nossa search | `ticket_raw` lokal dahulu; bila kosong dan `BRIDGE_JOB_SEARCH_ENABLED=true`, enqueue `search-incident`, tunggu sampai 5 detik, lalu baca ulang lokal bila ditemukan | Lookup lokal tidak memakai kuota bridge; fallback dapat memakai kuota dan menulis melalui worker. Timeout respons tidak berarti job pasti dibatalkan |

**Koreksi kontrak QOSMIC berdasarkan repository 29 Oktober.** `processTable` untuk bridge membuat job BullMQ; iterator/pemrosesan halaman dijalankan consumer bridge. PM2 memberi backfill 2 req/menit, sedangkan default client 6; budget non-backfill dihitung `total - backfill` (konfigurasi 20 dan 2 menghasilkan 18+2). Angka 14+6 pada komentar adalah default pembagian, bukan fakta konfigurasi efektif. Semua proses harus memakai kebijakan dan limiter bersama yang konsisten; retry, health probe, search fallback, refresh dan backfill ikut dihitung. Redis uji terpisah tidak memberi tambahan kuota upstream. Pada uji gunakan mock, bukan bridge produksi.

Deteksi `isQosmicBridgeConfigured()` yang dibaca memeriksa URL/token; agent harus menelusuri pengaruh aktual `QOSMIC_BRIDGE_ENABLED`, flag per job, health/failover, serta fallback MySQL. Jangan menganggap master switch bekerja hanya dari nama env. Kontrak config di Fase 0 memuat nilai default, override per proses, kapan dibaca, dan perilaku gagal saat Redis/bridge tidak tersedia.

### 2.3 Pengujian yang ada di sistem lama

Tidak ada suite unit yang ditemukan dalam audit. Skrip `test-*.ts` di `scripts/` adalah skrip manual, sebagian butuh DB. Skrip itu boleh dibaca dan dievaluasi kegunaannya, tetapi tidak otomatis menjadi bukti parity. Harness baru menguji HTTP, perubahan state, efek samping, dan replay worker pada referensi terisolasi (5.2, Fase 0.7).

Skrip operasional di `scripts/` (ingestion-*, projection-*, backfill-*, bridge-*, SQL index, `backup-db.ts`, `server-setup.sh`, `build-*.sh`) harus diinventaris di Fase 0.8: tetap di v2 sampai cutover, diport, atau dibuang. Tidak boleh dilupakan karena itulah alat darurat operasional.

---

## 3. Aturan Mutlak (Hard Rules)

Setiap aturan punya ID supaya bisa dirujuk di laporan. Melanggar aturan = tugas gagal, walaupun kodenya jalan.

### 3.1 Batas Folder dan Sumber Kebenaran
- **R-01** Sumber di `SOURCE_ROOT` read-only: jangan edit, hapus, format, install, generate atau build di sana. Referensi memakai salinan uji terpisah yang dijalankan pemilik atau pelaksana yang diberi izin. Harness mengirim HTTP dan memicu runner worker uji yang disepakati (5.2); instrumentasi hanya di salinan referensi, dicatat diff-nya, tidak mengubah aturan bisnis dan tidak dibawa ke produksi. Pengecualian sumber hanya perbaikan darurat eksplisit atau Jalur R (R-47).
- **R-02** Semua kode rewrite ditulis hanya di `TARGET_ROOT` yang telah dikunci sesuai 0.1. Sumber dan target tidak boleh sama atau bersarang. Referensi, fixture dan artefak uji eksternal hanya di lokasi terisolasi yang tercatat. Perubahan dokumen di workspace sumber memerlukan tugas dokumentasi yang eksplisit, seperti revisi PRD ini.
- **R-03** Ikuti hierarki 0.2: sumber yang dipin dan konfigurasi efektif menjelaskan baseline; kontrak/DBC disetujui menjelaskan tujuan. Selisih yang sudah disetujui bukan konflik baru. Selisih lain dicatat dan menghentikan unit terdampak tanpa menebak aturan bisnis.

### 3.2 Audit Sebelum Menulis
- **R-04** Sebelum menulis satu baris pun untuk sebuah modul, agent wajib menyelesaikan langkah 1 sampai 4 di Siklus Eksekusi (baca utuh, petakan pemanggil, tulis Catatan Perilaku, tulis Kontrak Field). Tidak boleh lompat.
- **R-05** Baca penuh file aplikasi dalam cakupan modul, termasuk komentar, kemudian dependency/pemanggil yang memengaruhi kontrak dan efek samping. Pencarian terarah membantu menemukan cakupan, bukan mengganti pembacaan file yang akan diport. Tidak perlu membaca rekursif seluruh source dependency pihak ketiga. Komentar desain diperiksa terhadap kode, config efektif, dan keputusan yang berlaku; ketidaksesuaian dicatat.
- **R-06** Dilarang menerjemahkan baris demi baris secara mekanis. Tulis ulang dari Catatan Perilaku, lalu buktikan kesamaannya lewat pengujian parity.

### 3.3 Ruang Lingkup dan Disiplin Perubahan
- **R-07** Satu tugas = satu modul/unit kecil yang bisa diverifikasi sendiri. Dilarang menggabungkan dua modul dalam satu commit.
- **R-08** **Port dan perbaikan bug tidak boleh bercampur dalam satu commit atau satu tugas.** Kalau agent menemukan bug di kode lama, catat di `docs/known-issues.md` dengan ID `KI-nn`, port perilaku apa adanya (termasuk bug, dibungkus komentar `// KI-nn: perilaku asli dipertahankan`), lalu **wajib** memperbaikinya lewat Jalur H/F setelah paritas terbukti (R-33 s.d. R-35, Bagian 14). Pengecualian hanya kelas **S** (keamanan), yang tidak boleh diport sebagai celah.
- **R-09** Fase 0 menetapkan satu manifest dependency fondasi yang disetujui, beserta versi dan lockfile. Dependency di dalam manifest tidak memerlukan izin berulang. Tambahan atau penggantian di luar manifest memerlukan ADR berisi alasan, alternatif, dampak, hasil spike yang relevan, dan persetujuan pemilik. Kandidat spike yang perlu diinstal diajukan sebelum spike; hasil kompatibilitas kemudian melengkapi ADR.
- **R-10** Dilarang refactor di luar tugas, mengganti nama file/fungsi yang tidak diminta, atau "merapikan" kode yang tidak terkait.
- **R-11** Dilarang menghapus atau melemahkan pengujian agar lulus. Pengujian yang gagal berarti kodenya salah atau pengujiannya salah, dan keduanya harus dilaporkan, bukan disembunyikan.

### 3.4 Data dan Database
- **R-12** Agent **tidak pernah** terhubung ke database produksi. Pengembangan dan pengujian memakai dump yang sudah dianonimkan di database lokal. Connection string produksi tidak boleh ada di mesin dev atau di repo.
- **R-13** Dilarang menjalankan `drizzle-kit push` dan `drizzle-kit migrate`. Selama dua sistem hidup berdampingan, **Prisma di v2 tetap satu-satunya pemilik DDL**: perubahan skema produksi hanya lewat migrasi Prisma yang diterapkan PakBreng. `packages/db` hanyalah pemetaan, diselaraskan lewat introspect dan diperiksa oleh G9 (`test:schema`) pada setiap tugas yang menyentuh DB. `drizzle-kit generate` baru boleh dipakai setelah cutover final dan atas persetujuan PakBreng.
- **R-14** Dilarang perintah destruktif (`DROP`, `TRUNCATE`, `DELETE` tanpa `WHERE`, `ALTER` pada tabel produksi) di database mana pun tanpa konfirmasi eksplisit PakBreng dalam sesi yang sama.
- **R-15** Query mentah wajib memakai template `sql` Drizzle dengan parameter terikat, dan daftar nilai memakai `sql.join`. Dilarang `sql.raw` yang menerima input dari luar, dan dilarang menyusun SQL dengan string concatenation. Setiap query mentah yang diport wajib punya satu uji dengan input berisi karakter SQL khusus (`'`, `"`, `;`, `--`, `%`) yang membuktikan tidak ada injeksi. Catatan audit: v2 memakai 44 `*Unsafe` di `app`/`lib`, kebanyakan berparameter tetapi dirakit dari potongan string (`buildKpiBucketFilterSql`, `withMaxExecutionTime`, dan sejenisnya). Di v3 setiap potongan menjadi fragmen `SQL` Drizzle yang bisa disusun; identifier dinamis hanya dari whitelist lewat `sql.identifier`; tidak ada pengecualian `sql.raw`. Klasifikasi kelas A/B/C (Fase 0.5) menentukan urutan pengerjaan, dan kelas C dilaporkan sebagai KI-09.
- **R-16** Tangkap SQL dan parameter kedua versi pada DB dev, dengan data sensitif disensor. Bandingkan semantik filter/scope, join, null, agregasi, urutan, batas, transaksi serta rencana eksekusi; sertakan hasil dan efek samping. String SQL, alias, placeholder, dan jumlah query tidak harus identik antar-ORM. Jangan melonggarkan kontrak hasil/atomicity hanya karena bentuk SQL berubah.

### 3.5 Keamanan
- **R-17** Dilarang menulis rahasia (token, password, secret JWT) ke kode, config yang di-commit, log, atau laporan. Semua rahasia dari `.env` yang di-gitignore. Di `ecosystem.config.js` terbaru token sudah tidak tertulis (dibaca dari env oleh `qosmic-bridge/client.ts`), tetapi versi lama pernah memuatnya sebagai plaintext. Di `dompis-v3` rahasia hanya dari `.env`, dan token dirotasi oleh PakBreng sebelum produksi bila pernah tersimpan di salinan, backup, atau riwayat git.
- **R-18** Keputusan otorisasi data/mutasi ditegakkan di API Elysia dengan kebijakan bersama `packages/core`. SvelteKit boleh menjaga navigasi/redirect halaman, tetapi guard UI bukan pengganti otorisasi API. `apps/web` tidak mengakses DB. Role, scope wilayah dan akses per objek harus diuji, termasuk pemanggil worker/internal yang memakai identitas berbeda.
- **R-19** Setiap endpoint memiliki validasi input, kebijakan identitas/role/scope dan rate limit yang eksplisit. Endpoint publik seperti login/health hanya publik jika kontraknya menyatakan demikian; jangan memaksanya menjadi privat atau membuka data tanpa keputusan. Namespace/batas mengikuti baseline aman atau DBC terkait.
- **R-20** Header keamanan v3 meniru v2 saat ini (`request-security.ts`): `Permissions-Policy: camera=(self), microphone=(self), geolocation=(self), interest-cohort=()`, `X-Frame-Options: DENY`, HSTS, dan CSP. Kamera dan geolokasi **wajib `(self)`** karena GPS dan pemindai QR teknisi bergantung padanya. `microphone=(self)` tidak punya pemakai yang ditemukan di kode; mengetatkannya menjadi `()` adalah keputusan terpisah (KI-05), bukan bagian port.

### 3.6 Bahasa, Waktu, dan Gaya
- **R-21** Semua teks yang tampil ke user dalam **Bahasa Indonesia**. Semua tanggal dan jam tampil dan dihitung bisnisnya dalam **WIB**.
- **R-22** Perubahan berisiko memakai flag dan rencana rollback yang tercatat. Default mempertahankan baseline aman atau menonaktifkan jalur. Flag keamanan tidak boleh menghidupkan kembali celah lama; jika fix belum aktif, jalur rentan tetap dinonaktifkan. Flag memiliki pemilik dan syarat pensiun.
- **R-23** Kode TypeScript `strict`. Dilarang `any` tanpa komentar alasan, dilarang `@ts-ignore` dan `@ts-expect-error` tanpa komentar alasan dan ID tugas.

### 3.7 Git dan Proses
- **R-24** Satu commit satu tugas dalam cakupan yang jelas dan memenuhi gerbang tahap 5.3. Gerbang diagnostik/belum tersedia dilaporkan jujur; jangan menyebutnya lulus. Format commit mengikuti Bagian 9.
- **R-25** Dilarang `git push --force`, `git reset --hard` pada branch bersama, dan menghapus branch tanpa diminta.
- **R-26** Agent tidak boleh mengklaim "selesai" tanpa bukti. Bukti = output nyata dari perintah gerbang, ditempel di laporan (Bagian 9).

### 3.8 Aturan Tambahan dari Audit 26 Okt 2026

- **R-27 Kontrak waktu dan tipe data.** Kode lama memakai `nowWib()` (`lib/timezone.ts`) yang menghasilkan `Date` palsu dengan bidang UTC berisi jam dinding WIB, lalu menyimpannya apa adanya ke kolom `DateTime(0)` ("no TZ conversion"). Sementara itu banyak kolom `created_at/updated_at` bertipe `@db.Timestamp(0)` yang tunduk pada zona sesi MySQL. Di v3 **dilarang** menambah konversi zona implisit, dan driver (`mysql2`/Drizzle) harus dikonfigurasi eksplisit (`timezone`, `dateStrings`, `supportBigNumbers`, `decimalNumbers`) berdasarkan hasil uji Fase 0.6 yang dicatat di ADR-002. Setiap kolom waktu yang disentuh wajib lolos uji **tulis-lewat-v2/baca-lewat-v3 dan sebaliknya**, untuk `DateTime`, `Timestamp`, dan `Date`. `nowWib()` diport apa adanya (KI) dan tidak "diperbaiki" selama port.
- **R-28 Satu pemilik aktif dan kontrak transisi.** Per fungsi produksi hanya v2 atau v3 yang aktif. Peta penulis juga mencatat ownership sumber/kolom dan seluruh penulis lintas fungsi `ticket_raw`, termasuk API/import. Komentar deadlock adalah indikasi audit, bukan bukti runtime baru. Namespace cache uji dipisah; saat coexistence produksi, invalidasi lintas versi dan batas stale harus lolos 12.3. Lock untuk sumber daya produksi yang sama memakai key/protokol interoperabel; lock uji tidak memakai namespace produksi. Queue boleh dipertahankan sementara hanya melalui kontrak producer/consumer yang disetujui dengan tepat satu pemilik consumer. Jangan mengganti namespace queue tanpa mengalihkan semua producer dan menangani job tersisa. Limiter QOSMIC tetap satu budget bersama lintas semua versi/proses.
- **R-29 Uploads.** v3 tidak menyalin, memindahkan, atau menulis ke lokasi uploads lain. Lokasinya dibaca dari satu env (`UPLOADS_ROOT`) yang menunjuk direktori yang sama dengan v2 (`public/uploads`). Build dan deploy v3 tidak boleh ikut membawa isi uploads (v2 pernah kehabisan disk karena ini).
- **R-30 Fitur database khusus.** Tabel `ticket` punya kolom **STORED GENERATED** (`operational_bucket`, `kpi_seg`) dan indeks **FULLTEXT** (dipakai `MATCH ... AGAINST` di `daily-ticket-helpers.ts`). Di skema Drizzle kolom generated dideklarasikan **hanya-baca**: tidak boleh ada di daftar kolom `INSERT`/`UPDATE`/upsert. Indeks FULLTEXT, indeks dengan urutan `DESC`, dan nama indeks khusus (`map:`) tidak boleh hilang. **Sumber kebenaran DDL adalah `SHOW CREATE TABLE` di DB dev, bukan `schema.prisma` dan bukan hasil introspect mentah.** Perilaku `@updatedAt` Prisma (diisi di sisi klien, 8 field) dan default sisi klien lainnya harus dicek satu per satu dan ditiru eksplisit.
- **R-31 Angka dan serialisasi.** Prisma mengembalikan `BigInt` dari `COUNT`/`SUM` mentah dan objek `Decimal`, dan kode lama membungkusnya dengan `Number(...)`. Driver baru bisa mengembalikan `number` atau `string`. Uji parity membandingkan **tipe JSON secara ketat** (`1` ≠ `"1"`), dan Kontrak Field mencatat tipe keluaran tiap angka.
- **R-32 Kode mati dan legacy.** Berkas atau fungsi yang tidak dipanggil atau tidak dijadwalkan **tidak diport** sebelum PakBreng mengonfirmasi. Kandidat yang sudah ditemukan: `worker-ingestion.ts`, `worker-status-refresh.ts`, `worker-active-refresh.ts`, `runSync`/`runPush` di ops-worker, `getDailyBucketSummaryMatrix`. Agent mencatatnya sebagai KI dan bertanya (Bagian 8, poin 11).


### 3.9 Aturan Perbaikan, Optimasi, dan Perburuan Bug

- **R-33 Hunt dan tindak lanjut wajib per modul.** Setiap modul melewati Jalur H meskipun tanpa temuan. Temuan yang menghalangi kontrak, scorecard, atau keamanan harus ditutup lewat F sebelum cutover. Temuan lain memiliki status, pemilik dan tenggat/keputusan tertulis; tidak boleh dilupakan. Jika tidak ada temuan, F dicatat N/A dengan alasan, tanpa membuat fix buatan.
- **R-34 Kelas perubahan.** Setiap perubahan diberi kelas P, F1, F2, atau S (14.1). Kelas menentukan siapa yang menyetujui. Agent tidak boleh menaikkan atau menurunkan kelas diam-diam: bila uji parity menunjukkan keluaran berubah, perubahan itu F2.
- **R-35 Urutan dan pemisahan.** Port, hunt, dan fix adalah tugas dan commit terpisah, dalam urutan itu. Satu temuan = satu commit fix. Kelas S boleh mendahului paritas.
- **R-36 Temuan harus berbukti dan dicoba dibantah.** Standar bukti dan label konfidensi di 14.3 berlaku. Dilarang melaporkan bug tanpa `file:baris` dan mekanisme; dilarang menandai CONFIRMED tanpa uji.
- **R-37 Uji merah dulu.** Perbaikan didahului uji regresi yang gagal pada kode lama (jika bisa direproduksi), lalu hijau setelah perbaikan. Uji tidak dihapus setelahnya.
- **R-38 Tanpa ukuran, tanpa optimasi.** Setiap klaim performa memuat angka sebelum dan sesudah pada data seukuran produksi (14.4 Q7). Satu perubahan satu hipotesis. Perubahan yang tidak terbukti lebih baik dibuang.
- **R-39 Hasil query identik.** Penulisan ulang query kelas F1 harus membuktikan himpunan hasil identik untuk semua fixture dan role (tipe JSON ketat). Bila beda, perubahan naik menjadi F2.
- **R-40 Agent tidak menjalankan DDL.** Usulan indeks (menambah maupun membuang), perubahan kolom, dan constraint hanya berupa dokumen dengan bukti EXPLAIN, perkiraan dampak tulis, dan rollback. PakBreng menerapkannya lewat migrasi Prisma (R-13).
- **R-41 Perubahan perilaku wajib DBC.** F2 dan S yang mengubah kontrak memerlukan DBC disetujui sebelum implementasi. DBC mencatat selisih yang diizinkan, oracle tes baru, cakupan kompatibilitas, flag serta rollback aman. G4 hanya menerima selisih tersebut; kontrak lain tetap dibandingkan dengan baseline. Default flag mengikuti R-22.
- **R-42 Temuan keamanan.** Agent tidak mengeksploitasi, tidak menguji pada produksi, dan tidak menyimpan bukti berisi data pelanggan atau rahasia. Temuan S0/S1 dilaporkan segera (Bagian 8, poin 14). v3 tidak boleh mewarisi celahnya, dan perbaikan di v2 dikerjakan PakBreng (14.9).
- **R-43 Anggaran query dan memori.** G6/G11 merekam baseline pada P/H dan menegakkan target yang disetujui pada F/cutover sesuai 5.3. Ukur jumlah query, RSS per proses dan total deployment, serta metrik Bagian 7. Port yang masih membawa masalah baseline boleh dicatat Paritas, tetapi belum Siap-cutover.
- **R-44 Frontend ikut diburu.** Checklist FE 14.3 wajib untuk setiap halaman atau komponen yang diport, termasuk uji pada lebar 360 px dan perangkat Android kelas menengah-bawah untuk halaman teknisi.

### 3.10 Aturan Pensiun Kode Lama

- **R-45 Keterlacakan unit.** docs/migration-map.md menjadi acuan status unit kode/operasional dan pensiun, dengan ID fitur terkait. Feature-parity-matrix menjadi acuan kelengkapan alur pengguna. Perbarui keduanya sesuai perubahan status; unit yang diport tanpa pemetaan belum selesai.
- **R-46 Dilarang menyisakan versi ganda di `dompis-v3`.** Tidak boleh ada salinan kode v2 yang ditempel lalu dibiarkan berdampingan dengan versi tulis-ulang, berkas bernama `_old`, `.bak`, `copy`, `legacy`, `v2-*`, blok kode yang di-komentar, atau flag permanen untuk dua jalur. Kode pengganti menggantikan, bukan menambah.
- **R-47 Pensiun di `dompis_v2` hanya lewat Jalur R.** Ini satu-satunya pengecualian terhadap R-01: agent boleh menghapus unit di v2 hanya (a) sesudah Manifes Pensiun disetujui PakBreng secara tertulis, (b) di branch `retire/<modul>` pada salinan git v2 yang disediakan PakBreng, bukan folder produksi, dan (c) per batch kecil. Penggabungan ke produksi dilakukan PakBreng.
- **R-48 Syarat pensiun.** Unit hanya boleh dipensiunkan bila seluruh syarat 15.3 terpenuhi: observasi selesai (≥ 14 hari worker, ≥ 30 hari API/UI), pemanggil nol, trafik nol, flag dan proses mati, tag git `pre-retire-<modul>` beserta arsip, dan persetujuan. Hasil G12 hijau.
- **R-49 Yang tidak pernah dihapus agent.** Tabel/kolom/indeks database (R-13), isi `uploads` (R-29), backup, data Redis produksi, dan rahasia. Semuanya keputusan terpisah PakBreng.
- **R-50 Adapter sementara berumur pendek.** Kode kompatibilitas antara v2 dan v3 (pembaca token lama, jembatan cache, proksi rute) wajib bertanda `@sunset <fase atau tanggal>` dan punya baris di migration-map. Dihapus pada Fase 12 atau lebih awal bila bisa.
- **R-51 Bersih-bersih per fase.** Pada akhir tiap fase, artefak sementara di v3 (folder `spike/`, stub gerbang yang gagal, fixture sementara, flag yang sudah stabil ≥ 30 hari) dihapus atau dicatat alasannya. G12 memeriksanya.
- **R-52 Hapus dengan disiplin yang sama dengan menulis.** Penghapusan juga mengikuti Siklus: baca utuh, petakan pemanggil (termasuk `scripts/`, `ecosystem.config.js`, konfigurasi Nginx, cron, dan pemicu eksternal), dan berhenti bila ragu. Kode yang tampak mati tetap harus dikonfirmasi (R-32) sebelum dihapus.


### 3.11 Aturan Gaya Kode dan UI

Detail, contoh, dan pemeriksaan otomatis ada di Bagian 16.

- **R-53 camelCase.** Variabel, fungsi, parameter, properti objek, dan nama berkas TypeScript memakai camelCase. Class, type, interface, dan komponen Svelte memakai PascalCase (camelCase dengan huruf awal besar). Pengecualian hanya yang dipaksa oleh alat atau kontrak lama (16.1).
- **R-54 Nama jelas.** Utamakan 1 sampai 3 kata yang menyatakan tindakan/konsep domain. Hindari kata kosong seperti Enhanced/Smart/Comprehensive atau lapisan Manager/Handler/Helper/Util tanpa kegunaan nyata. Nama kontrak/library serta nama domain lebih panjang dapat dikecualikan dengan alasan; jangan membuat singkatan kabur untuk memenuhi batas mekanis (16.1).
- **R-55 Satu tanggung jawab.** Fungsi mudah diikuti, tanpa wrapper yang hanya meneruskan panggilan atau abstraksi spekulatif. Batas otorisasi/transaksi/pengujian dapat diperlukan meskipun baru satu pemakai; jelaskan alasannya. Atomicity lebih penting daripada batas panjang atau jumlah pemakai (16.2).
- **R-56 Komentar secukupnya.** Komentar menjelaskan **mengapa**, bukan mengulang kode. Satu baris kalau cukup. Tanpa docblock panjang di fungsi yang sudah jelas, tanpa banner, tanpa emoji, tanpa em dash.
- **R-57 Bahasa kode: Inggris sederhana, bukan bahasa AI.** Nama dan komentar memakai kata sehari-hari (`getTicket`, `saveEvidence`, `isOverdue`). Tanpa istilah muluk atau kalimat promosi. Teks untuk pengguna memakai Bahasa Indonesia (R-60).
- **R-58 Tanpa kode hias.** Tidak ada try/catch yang hanya mengulang error, validasi ganda yang tidak mungkin terjadi, fallback untuk kasus yang tidak ada, parameter opsional "untuk masa depan", dan log di setiap baris.
- **R-59 Nama kontrak tidak diubah demi gaya.** Field respons, kolom DB, dan key JSON v2 mengikuti 6.2 dan DBC yang berlaku. Di dalam kode, petakan ke camelCase di satu batas yang jelas. Jangan mengubah kontrak eksternal untuk memenuhi lint penamaan.
- **R-60 UI tanpa hiasan generik.** Jangan menambah gradien, glow, glassmorphism, animasi hias, emoji atau pola kartu berlapis sebagai default. Teks baru memakai bahasa singkat tanpa em/en dash. Port visual mengikuti baseline sampai kontrak desain menyetujui perubahan tertentu (16.3); gradien baseline yang tercatat bukan pelanggaran port. Target gaya solid diterapkan melalui tugas visual terpisah atau pengecualian yang disetujui, tanpa mengganti istilah/status atau informasi bisnis.
- **R-61 Teks UI singkat dan jelas.** Label/tombol biasanya 1 sampai 3 kata; bantuan sekitar satu kalimat singkat. Pesan error menyebut masalah serta tindakan berikutnya. Informasi berisiko/aksesibilitas tidak boleh dipangkas demi batas kata. Pertahankan teks/istilah baseline sampai perubahan disetujui dalam design-contract/DBC (16.3).
- **R-62 Tampilan mengikuti kontrak desain.** Ekstrak token dan inventaris tampilan v2, termasuk penggunaan gradien/teks yang perlu diputuskan. `docs/design-contract.md` membedakan baseline dipertahankan, perubahan visual disetujui, dan pekerjaan ditunda. Agent tidak menciptakan tema/navigasi baru. Perubahan alur, istilah atau informasi bisnis tetap memerlukan DBC; halaman teknisi menjaga kebutuhan layar kecil.
- **R-63 Pemeriksaan sesuai cakupan.** G13 menjalankan check:style untuk aturan nama/teks/CSS yang relevan dan pengecualian tercatat pada 16.4. Rekam hasil nyata; lint tidak menggantikan pemeriksaan perilaku/runtime UI. Batas panjang menjadi temuan review yang bisa dijelaskan, bukan alasan merusak kontrak.
- **R-64 Review diff dalam cakupan.** Baca ulang diff untuk kejelasan nama, komentar, abstraksi, dan teks. Rapikan hanya kode baru dalam tugas yang sama tanpa mengubah kontrak atau menyentuh area lain. Batas panjang fungsi/nama/teks adalah pedoman dengan pengecualian beralasan; jangan memecah transaksi, menghilangkan informasi, atau mengubah UI baseline hanya untuk meloloskan lint.

---

## 4. Siklus Eksekusi Wajib per Tugas

Urutan ini tidak boleh dilompati atau ditukar. Agent menandai tiap langkah di laporan.

| # | Langkah | Keluaran yang harus ada |
|---|---|---|
| 1 | Verifikasi identitas/commit/checkpoint, lalu baca utuh sumber dalam cakupan (R-05) | Versi PRD, ID fitur/modul, daftar file dan kontrak |
| 2 | Petakan pemanggil/dependensi dengan graphify bila tersedia, lalu `rg` pada sumber dan konfigurasi | Batas modul, producer/consumer, dependency kontrak |
| 3 | **Tulis Catatan Perilaku** (template 6.1) | `docs/behavior/<modul>.md` |
| 4 | **Tulis Kontrak Field** (template 6.2) untuk setiap endpoint/fungsi/tabel yang disentuh | Bagian kontrak di berkas yang sama |
| 5 | **Rencana pendek**: file yang akan dibuat/diubah, risiko, cara rollback | Ditulis di laporan sebelum coding |
| 6 | **Implementasi kecil** sesuai rencana, tanpa melebar | Diff terbatas |
| 7 | Jalankan gerbang tahap/tugas sesuai 5.3; gerbang penuh pada checkpoint | Bukti nyata dan status per gerbang |
| 8 | Uji parity G4 atau kontrak DBC yang berlaku pada state terisolasi | Hasil HTTP, state, efek samping dan selisih disetujui |
| 9 | **Laporan eksekusi** (template Bagian 9) | Laporan lengkap |
| 10 | Commit jika syarat dan gerbang wajib tahap terpenuhi; diagnostik/blocked dilaporkan jujur | Hash commit bila commit termasuk tugas |

**Definisi Selesai tugas.** Kriteria dan gerbang wajib untuk tahap tersebut terpenuhi, artefak/kontrak terkait tersedia, tidak ada aturan dilanggar, dan laporan memiliki bukti serta checkpoint. Pada tugas dokumentasi/audit, implementasi/build/parity dapat N/A dengan alasan eksplisit. Gerbang wajib yang belum tersedia berstatus BLOCKED, bukan PASS; pekerjaan independen dapat lanjut tanpa menaikkan status unit terblokir.

**Status modul.** Port lulus berarti Paritas, bukan selesai rewrite. Sesudah P jalankan H/F (Bagian 14). Siap-cutover membutuhkan kontrak fitur, scorecard, keamanan, transisi dan G8. Setelah cutover jalankan observasi lalu R. Modul selesai ketika target tercapai dan unit lama dipensiunkan (G12), atau status Ditahan memiliki alasan/pemilik/tenggat yang disetujui. Kerentanan aktif yang terbukti tidak dapat ditunda untuk meloloskan cutover.

---

## 5. Gerbang Pengujian (Quality Gates)

Skrip berikut dibangun bertahap di Fase 0 pada target. Nama perintah adalah kontrak perkakas yang akan dibuat, bukan klaim bahwa saat ini sudah ada. Stub harus gagal dengan alasan belum tersedia. Matriks 5.3 menentukan kapan sebuah gerbang wajib, diagnostik, atau N/A; seluruh gerbang wajib cutover harus tersedia dan lulus sebelum dinyalakan.

| Gerbang | Perintah | Lulus jika | Berlaku |
|---|---|---|---|
| **G0 Tipe** | `bun run typecheck` | 0 error di workspace terkait; seluruh workspace pada checkpoint | Perubahan kode |
| **G1 Lint & format** | `bun run lint` | 0 error, 0 warning baru | Kode/config; dokumen memakai pemeriksaan naskah/rujukan |
| **G2 Unit/regresi** | `bun test` | Suite wajib hijau, kasus bermakna untuk perilaku yang disentuh; diagnostik H tidak masuk discovery suite wajib | Perubahan logika/perilaku |
| **G3 Build** | `bun run build` | Build berhasil tanpa warning baru; peak RSS tercatat | Workspace terdampak dan seluruh app pada checkpoint fase/cutover |
| **G4 Parity** | `bun run test:parity -- <modul>` | Respons, state bisnis dan efek samping sesuai baseline atau selisih DBC yang diizinkan (5.2) | Port/F dan sebelum cutover padanan lama |
| **G5 Integrasi** | `bun run test:integration` | Lulus terhadap DB dev (dump anonim) dan Redis lokal | Endpoint, worker, query |
| **G6 Beban & memori** | `bun run test:load -- <modul>` | Memenuhi anggaran di Bagian 7 | Worker, endpoint berat, sebelum cutover |
| **G7 Keamanan** | `bun run test:security` | Lulus uji RBAC, injeksi, rate limit, header | Endpoint dan halaman |
| **G8 UAT** | Checklist manual (Bagian 9.3) | Disetujui PakBreng | Sebelum cutover modul |
| **G9 Selisih skema** | `bun run test:schema` | Pemetaan DB sesuai DDL dev terbaru, generated read-only dan default/tipe benar; FULLTEXT/indeks khusus diperiksa terhadap SHOW CREATE TABLE. Fitur fisik yang tidak terwakili ORM tetap diverifikasi dengan manifest DDL, bukan dihapus agar introspect cocok | Tugas DB setelah perkakas tersedia; penuh sebelum cutover |
| **G10 Hunt** | `bun run check:hunt-report -- <modul>` dan suite regresi wajib | Cakupan H lengkap, temuan berbukti dan tindak lanjut jelas. Pada F, reproducer terkait menjadi regresi wajib hijau. Jalur rentan terbukti sudah aman atau nonaktif sebelum cutover | H/F dan sebelum cutover |
| **G11 Query & performa** | `bun run test:queries -- <modul>` | Baseline/query/EXPLAIN tercatat pada P/H; pada F/cutover budget disetujui terpenuhi, tidak ada N+1 baru, scan besar beralasan, hasil/efek samping terjaga | Modul DB; mode diagnostik/enforce ditentukan tugas |
| **G12 Pensiun & duplikasi** | `bun run check:retirement` dan `bun run check:no-legacy` | Setiap unit yang diport punya baris di `docs/migration-map.md`; tidak ada pola `_old`/`.bak`/`legacy`/kode ter-komentar/adapter tanpa `@sunset` di v3; untuk Jalur R, manifes memenuhi 15.3 dan tidak ada pemanggil tersisa | Setiap tugas (cek duplikasi), dan Jalur R (cek pensiun) |
| **G13 Gaya kode & UI** | `bun run check:style` | Aturan nama/gaya dipatuhi dengan pengecualian tercatat; perubahan visual sesuai design-contract. Ukuran fungsi/nama/teks menjadi temuan review, bukan alasan merusak kontrak/atomicity | Kode/UI, dengan cakupan dan pengecualian 16.4 |

### 5.1 Aturan Pengujian
- **T-01** Setiap perubahan logika/perilaku memiliki pengujian bermakna untuk kasus normal, gagal dan tepi yang relevan. Fungsi murni memakai unit, endpoint/worker memakai integrasi/kontrak, query memakai data dev realistis. Perubahan dokumentasi atau kosmetik sederhana tidak memerlukan tes yang hanya menyalin implementasi; verifikasinya dicatat sesuai cakupan.
- **T-02** Uji harus menyertakan **kasus tepi dari Catatan Perilaku**, bukan hanya jalur normal.
- **T-03** Bukti berasal dari eksekusi nyata: perintah, versi/commit, lingkungan, waktu, exit code dan hasil/artifact yang sudah disensor. Gerbang tak dapat dijalankan berstatus BLOCKED. Hentikan langkah yang bergantung padanya dan klaim kelulusan, tetapi lanjutkan tugas independen yang diizinkan. N/A membutuhkan alasan applicability, bukan sekadar lingkungan belum tersedia.
- **T-04** Gerbang gagal tidak boleh diselesaikan dengan melonggarkan uji. Perbaiki kode atau laporkan uji yang salah beserta alasannya.
- **T-05** Sesudah perubahan, jalankan tes terarah beserta gerbang yang terdampak dependency-nya. Suite penuh seluruh gerbang wajib dijalankan pada checkpoint fase dan sebelum cutover. Hasil lama hanya dapat dipakai bila commit/cakupan tidak berubah dan alasan reuse tercatat. Jangan mengulang load/soak penuh tanpa perubahan atau kekhawatiran yang relevan.
- **T-06** Uji tidak boleh bergantung pada jam dinding mesin. Waktu "sekarang" diinjeksi, dan uji mencakup pergantian hari WIB (23:59 → 00:01) serta data kemarin yang muncul lagi hari ini.
- **T-07** Dump anonim menjadi dasar ukuran/distribusi realistis. Fixture sintetis berlabel boleh dan wajib ditambahkan untuk kasus yang tidak ada di dump: null/kosong, batas angka, role/scope, input berbahaya, pergantian hari, race, replay, dan outage. Catat asal dan tujuan fixture. Fixture sintetis tidak menjadi bukti skala produksi.

### 5.2 Spesifikasi Uji Parity (G4)
1. Pin commit referensi/target, config uji, snapshot anonim, identitas akun/scope dan clock. Pakai dua DB dev dari snapshot identik; alternatif reset seluruh state sebelum setiap replay harus terbukti mengembalikan keadaan awal. Menjalankan dua mutasi bergantian pada satu DB tanpa reset dilarang.
2. Isolasi Redis/cache/lock/queue, sequence ID, outbox, file fixture dan state lain per sisi. Semua koneksi/URL diuji terhadap allowlist lingkungan dev; hentikan bila mengarah produksi. Mock QOSMIC serta tangkap webhook/FCM/efek keluar. Tidak ada notifikasi nyata atau pemakaian kuota produksi dari harness.
3. Harness HTTP mencakup method/path, status, header/cookie/redirect, JSON dengan tipe ketat (`1` berbeda dari `"1"`), format unduhan dan akses file. Bandingkan pula perubahan state DB, histori, outbox, audit, projection request, file, serta event/cache yang menjadi kontrak. Urutan kunci JSON diabaikan; urutan array diabaikan hanya jika kontraknya menyatakan tidak bermakna.
4. Untuk worker, pemilik menyediakan atau memberi izin menyiapkan runner pada salinan referensi yang terisolasi. Runner dapat mengeksekusi satu siklus/replay, mengendalikan clock/config, dan mengeluarkan hasil/log yang disensor. Instrumentasi dicatat diff-nya dan tidak mengubah logika baseline. Tanpa runner yang memadai, parity worker BLOCKED; jangan berpura-pura cukup dengan HTTP biasa.
5. Nilai acak seperti correlation/job ID boleh dipetakan dengan allowlist normalisasi per field, alasan dan uji konsistensi relasi. Jangan mengabaikan timestamp bisnis, nilai uang, urutan transisi, scope atau jumlah efek samping. Jika clock referensi belum dapat dikendalikan, skenario terkait tetap BLOCKED, bukan diluluskan dengan toleransi umum.
6. Kelas P/F1 wajib identik dalam seluruh kontrak yang diuji. F2/S hanya boleh berbeda pada daftar delta DBC yang disetujui. Simpan oracle lama, tes perilaku baru, dan tes kontrak yang tidak berubah. Penjelasan selisih saja tidak cukup tanpa keputusan yang mengizinkannya.
7. SQL dan parameternya direkam untuk audit semantik/rencana eksekusi R-16; bentuk string SQL tidak wajib sama. Uji hasil, state, transaksi/rollback dan jumlah efek samping tetap menjadi bukti.
8. Fixture mencakup Branch saja, Workzone saja, keduanya; seluruh role/alias/scope; ticket orang lain; service_no pada hari berbeda; jam_expired null; DateTime/Timestamp/Date, batas BIGINT/DECIMAL/JSON; submit ganda; data open menjadi closed; dan gangguan dependensi. Tambahkan kasus fitur pada 1.4 serta checklist H.

### 5.3 Matriks Gerbang per Tahap

Status gerbang: PASS, FAIL, BLOCKED, N/A beralasan. Mode diagnostik mencatat pelanggaran baseline sebagai temuan dan tidak memberi label lulus budget. Scope/daftar gerbang wajib ditetapkan dalam rencana tugas; tidak boleh dikurangi setelah gagal untuk meloloskan hasil.

| Tahap | Gerbang dan bukti wajib | Batas kelulusan |
|---|---|---|
| Dokumen/inventaris | Rujukan, cakupan, keputusan, checkpoint dan diff dokumen | Build/unit/parity N/A bila tidak ada perubahan kode; keputusan belum tersedia tetap dicatat terbuka |
| Bootstrap 0.1 | G0/G1/G3 pada kerangka; G2 jika ada logika; status perkakas lain tercatat | Stub gagal bukan PASS; hanya gerbang yang dependensinya sudah tersedia menjadi wajib tugas ini |
| Fondasi selesai | G0..G3, integrasi infra G5, G7/G9 relevan, harness G4 smoke, G10..G13 siap sesuai cakupan | Manifest dependency, identitas, skema/waktu, feature matrix, baseline/target dan transisi disetujui; tidak ada stub pada gerbang wajib modul pilot |
| P (port) | G0..G5, G7/G9/G12/G13 yang relevan; G6/G11 merekam baseline | Paritas dapat dicapai sebelum masalah performa warisan diperbaiki; status belum Siap-cutover |
| H (hunt) | G10, diagnostik G6/G11, suite wajib yang sudah ada tetap hijau | Reproducer merah dicatat di `diagnostics/hunt/` di luar discovery suite wajib. Perintah, expected failure dan exit code nyata disimpan |
| F (fix) | G0..G5 dan G7/G9/G10/G12/G13 relevan; G6/G11 enforce untuk target terdampak | Reproducer menjadi regresi wajib hijau; G4 memakai oracle DBC bila berlaku. Optimasi tanpa perbaikan terukur tidak diterima |
| Cutover | Semua G0..G13 yang berlaku, feature coverage, scorecard, transisi/rollback dan G8 | Tidak ada gerbang wajib BLOCKED/stub; jalur rentan terbukti aman/nonaktif. Approval pemilik eksplisit |
| R (pensiun) | G12, build/tes dependency terdampak, parity v3 relevan, manifes | Masa observasi selesai dan persetujuan per batch; kode/data yang ditahan tetap dilindungi |

Suite diagnostik tidak dikecualikan secara diam-diam: manifest H mencatat lokasi dan alasan pemisahan, CI memeriksa daftarnya, dan temuan dipindahkan menjadi regresi wajib ketika F dikerjakan. Diagnostic merah tidak membolehkan mengabaikan kegagalan suite wajib lain. Sebelum cutover, temuan yang menghalangi kontrak/keamanan/scorecard wajib ditutup.

---

## 6. Template Dokumen Wajib

### 6.1 Catatan Perilaku (`docs/behavior/<modul>.md`)
```
# Catatan Perilaku: <nama modul>
Sumber: <path file di dompis_v2, dengan nomor baris kunci>
Commit sumber / versi PRD / ID kapabilitas dan fitur:
Dibaca penuh pada: <tanggal WIB>
ADR/DBC dan konfigurasi efektif terkait:

## Tujuan bisnis
<satu paragraf>

## Pemanggil
<daftar file/route yang memakai modul ini>

## Aturan bisnis yang ter-encode
1. <aturan> - sumber: <file:baris>
2. ...

## Kasus tepi dan penanganannya
- <kondisi> → <perilaku> - sumber: <file:baris>

## Efek samping
<tulis DB, cache, SSE, antrean, log>

## Hal yang tampak aneh tapi disengaja
<komentar desain dan workaround yang tidak boleh hilang>

## Bug/risiko yang ditemukan (KI-nn)
<dipertahankan di port, diperbaiki di tugas terpisah>

## Ketidakpastian
<hal yang belum bisa dipastikan dari kode, perlu konfirmasi PakBreng>
```

### 6.2 Kontrak Field (wajib untuk setiap endpoint/fungsi/tabel)
Setiap field dicatat dengan **nama, sumber, dan kondisi**. Tidak boleh ada field tanpa sumber.

| Field | Tipe | Sumber (tabel.kolom / hasil hitung / input) | Kondisi muncul / nilai | Nullable | Catatan |
|---|---|---|---|---|---|
| contoh: `remainingHours` | number | hitung: `(jam_expired − now) / 3600000` | `jam_expired` tidak null; jika null dianggap `Infinity` | tidak | negatif = lewat SLA |

Untuk endpoint, tambahkan method/path, role/alias/scope/akses per objek, parameter dan validasi, status/header/cookie, namespace rate limit, ID fitur/tes serta efek samping/transaksi. Setiap field dan delta memiliki sumber/oracle; nilai nondeterministik dan aturan normalisasinya dicatat terbatas sesuai 5.2.

### 6.3 Daftar Masalah Dikenal (`docs/known-issues.md`)
Format: `KI-nn | modul | deskripsi | bukti (file:baris) | dampak | status (dipertahankan / diperbaiki) | ID tugas perbaikan`.

**KI awal dari audit 26 Okt 2026.** Agent wajib memverifikasi statusnya di kode saat itu. Kolom "Status" adalah dugaan dari audit, bukan kepastian.

| ID | Masalah | Bukti | Status dugaan |
|---|---|---|---|
| KI-01 | **Penulis ganda `ticket_raw` tanpa kunci bersama di jalur yang hidup.** Penulis: data-worker (ingestion `piloting_tickets` + status-refresh), bridge-worker (`nossa`, `nossa_closed`), `api/tickets/[id]/live-refresh`, `api/import-tiket/run`. Lock `ticket_raw_writer` hanya dipakai worker legacy dan `api/internal/ingestion`. Pemisahan hari ini bergantung pada `EXTERNAL_TABLE_NAMES` dan komentar deadlock 1213. Ini menggantikan KI-01 versi 1.0 | `worker-data.ts`, `ecosystem.config.js`, `status-refresh.ts` ±690-720 | Perlu diverifikasi lewat log: cari "Deadlock found"/1213 dan "skipped" |
| KI-02 | Rekap Workorder memicu ±12 query berat paralel per cache miss; `getDailyBucketSummaryMatrix` didefinisikan tetapi **tidak dipanggil** | `rekap-workorder/queries.ts:671` | Masih berlaku di upload ini |
| KI-03 | `buildWorkzoneWhere` mengabaikan Workzone terpilih saat Branch dipilih | `app/libs/services/daily-ticket-where.ts:99` | Versi yang terbaca kini menghormati `selectedWorkzone` untuk admin. Kemungkinan teratasi; uji kombinasi Branch+Workzone |
| KI-04 | Filter Branch tidak diteruskan di halaman bucket dan sebagian bucket Overview | `TicketManagementBucketPage` | Tidak diverifikasi di audit ini |
| KI-05 | `Permissions-Policy` memblokir kamera dan GPS | `request-security.ts:95` | **Teratasi di v2.** Nilai sekarang `camera=(self), microphone=(self), geolocation=(self)`. Pemakaian mikrofon tidak ditemukan; `microphone=(self)` adalah keputusan terpisah |
| KI-06 | `QOSMIC_BRIDGE_TOKEN` plaintext | `ecosystem.config.js` lama | Tidak ada di ecosystem terbaru; kini dari env. Tetap rotasi bila pernah tersimpan di salinan, backup, atau riwayat git |
| KI-07 | `onu_rx`, `lapul`, `gaul` tidak terpetakan | `normalizer.ts` | Kini ada di `lib/ingestion/index.ts` ±118-120 dan 205-207. Kemungkinan teratasi; verifikasi aliran data sampai `ticket` |
| KI-08 | Status-refresh `piloting_tickets` satu per satu | `status-refresh.ts` | Kini batch 300 dengan kandidat hot/safety. Kemungkinan teratasi |
| KI-09 | **SQL dirakit dari potongan string.** 44 `*Unsafe` di `app`/`lib`, 3 di `worker.ts`, 32 di `scripts`. Sebagian berparameter (`?` + `...params`), sebagian menginterpolasi nilai (`chunkedUpdate`/`chunkedDeleteFrom` di ops-worker, tabel dari whitelist, tanggal dari server) | `rekap-workorder/queries.ts`, `daily-ticket-*.ts`, `worker.ts:367-443` | Berlaku. Diklasifikasi di Fase 0.5 |
| KI-10 | `resetAllStaleAssignedTickets` dijadwalkan dua kali: projection-worker 00:00 dan ops-worker 00:05 | `worker-projection.ts`, `worker.ts` | Berlaku |
| KI-11 | Tumpukan beban jam 03:00-03:10: projection full scan (`0 3 * * *` dari env), tech-event cleanup 03:00, log retention 03:10, audit purge 03:00 | `ecosystem.config.js`, `worker.ts` | Berlaku. Dipertahankan saat port, dijadwal ulang di tugas terpisah |
| KI-12 | Komentar ecosystem menyebut "sync_date bump & viewer GC pindah ke snapshot-worker", tetapi `worker-snapshot.ts` hanya memanggil `recomputeTodaySnapshot`, dan viewer GC ada di ops-worker (`runTransientCleanup`) | `ecosystem.config.js:172-173` | Verifikasi apakah bump `sync_date` terjadi di dalam `recomputeTodaySnapshot` atau hilang |
| KI-13 | Kode terdefinisi tetapi tidak aktif: `runSync`/`runPush` (ops-worker; `api/push` masih memanggil `pushSpreadsheet`), tiga worker legacy, `getDailyBucketSummaryMatrix` | `worker.ts`, `ecosystem.config.js` | Jangan diport tanpa konfirmasi (R-32) |
| KI-14 | Lock `data_worker` TTL 2100 dtk, sedangkan batas siklus 120 menit; bergantung pada perpanjangan otomatis | `ecosystem.config.js`, `task-runner.ts:73-130` | **TERBACA, risiko kecil.** `withTaskLock` memperpanjang tiap `max(10 dtk, TTL/3)` (±700 dtk) dan membatalkan tugas bila perpanjangan gagal. Risiko tersisa hanya bila Redis tak terjangkau lebih lama dari TTL |
| KI-15 | `runWeeklyBackfill` bukan mingguan (sekali, 5 menit setelah start) dan nonaktif | `worker-data.ts:60-99, 485-491` | Nama menyesatkan; port apa adanya |
| KI-16 | `server.ts` menelan `uncaughtException` dan `unhandledRejection` pada web (proses terus berjalan dalam keadaan tidak pasti), sementara semua worker `exit(1)` | `server.ts:55-69` | Kebijakan eksplisit di v3 lewat ADR |
| KI-17 | projection-worker menghapus key Redis `active-refresh:*` setiap start (sisa "Opsi B") | `worker-projection.ts:260-264` | Kode sisa; tanyakan sebelum port |
| KI-18 | `proxy.ts` tidak memeriksa header `alg` pada JWT | `proxy.ts:10-41` | Di v3 paksa HS256 lewat `jose`; token lama harus tetap lolos |
| KI-19 | `SET SESSION ...` dikirim lewat pool Prisma sehingga belum tentu berlaku pada query berikutnya (koneksi bisa berbeda). Ada di **tiga tempat**: `worker.ts:363-365` (`innodb_lock_wait_timeout`), `task-runner.ts:385-391` (`setMySQLSessionTimeout`, dipanggil `status-refresh.ts:1013` tiap siklus), `summary-snapshot.ts:140` (`max_execution_time`) | file:baris di samping | **TERBACA** (mekanisme pool); dampak nyata HIPOTESIS. Di v3 pakai satu koneksi khusus per pekerjaan, atau hint `MAX_EXECUTION_TIME` per query |
| KI-20 | **Backoff adaptif `scheduleEveryMinutes` selalu menganggap tugas "idle".** Semua pemanggil membungkus tugas sebagai `() => runWithCorrelationContext(..., () => void runX())`, yang kembali seketika, sehingga durasi terukur ≈ 0 dan lebih kecil dari `idleThreshold`. Interval membesar sampai batas. Efek (dihitung dari kode): data-worker (env 1 mnt, `idleThreshold` 5 dtk, maks 10) → ±5 mnt di keadaan tunak; snapshot-worker (60 dtk, ambang 5 dtk, maks 5) → 5 mnt; health probe bridge (1 mnt, maks 5) → 5 mnt; DLQ check bridge (15 mnt, maks 30) → 30 mnt. Projection tidak terdampak (`idleThreshold: 0`) | `task-runner.ts:249-267`; `worker-data.ts:482`; `worker-snapshot.ts:54-60`; `worker-bridge.ts:83-96`; `worker-projection.ts:271-280` | **TERBACA / PERLU-VERIFIKASI (OQ-04).** Kelas F2 (interval berubah). Dugaan kontribusi pada data terlambat |
| KI-21 | **Circuit breaker data-worker tidak pernah efektif.** `runAllTasks` membuat `createTaskState()` baru di tiap siklus, error ingestion/status-refresh ditelan `try/catch`, dan siklus luar tetap dicatat sukses. `consecutiveErrors` tidak pernah menumpuk | `worker-data.ts:231-233, 270-278, 421-433` | **TERBACA.** Kegagalan berulang tidak di-throttle, tidak ada alert breaker, SLO "sukses" menyesatkan. F2 |
| KI-22 | `adaptiveWriteChunkSize` (variabel modul) hanya dibagi dua saat retry dan **tidak pernah naik lagi** sampai proses restart | `ingestion/index.ts:63, 1130-1134` | **TERBACA.** Throughput ingestion turun permanen setelah beberapa retry/deadlock. F1 atau F2 tergantung pengaruh pada urutan tulis |
| KI-23 | **Penjadwal ingestion `nossa`/`nossa_closed` tidak terlihat di topologi PM2.** Job dibuat hanya di `processTable` untuk tabel bridge, sementara data-worker dibatasi `EXTERNAL_TABLE_NAMES=piloting_tickets` (variabel dari PM2 mengalahkan `.env`) dan bridge-worker hanya memproses antrean. Jalur yang mungkin: pemicu eksternal ke `GET /api/internal/ingestion` (memakai env web) atau skrip | `ingestion/index.ts:1290-1365`; `worker-data.ts`; `ecosystem.config.js:142`; `bridge-queue.ts:406-470`; `worker-bridge.ts` | **PERLU-VERIFIKASI (OQ-01), prioritas tertinggi.** Bila tidak ada pemicu, data `nossa` tidak diperbarui otomatis; kandidat penyebab keluhan ticket tidak ada |
| KI-24 | Jalur kandidat bridge di status-refresh: dengan `BRIDGE_JOB_REFRESH_ENABLED=false`, kandidat `nossa` hanya dilog "skipped" dan **tidak ditandai diperiksa** (`continue` sebelum `checkedCandidates`), sehingga kandidat yang sama terpilih tiap siklus. `effectiveBatchSize` adaptif hanya dipakai untuk seed, bukan batas kandidat (tetap `BRIDGE_BATCH_SIZE`=5 dan `PILOTING_BATCH_SIZE`=300) | `status-refresh.ts:1040-1130, 85-86, 1021` | **TERBACA.** Hari ini tidak berdampak karena `sourceTables` hanya `piloting_tickets`; jadi jalur mati yang menyesatkan (R-32) |
| KI-25 | **SEC S0/S1. Register publik dengan `role_id` bebas.** `POST /api/auth/register` tanpa autentikasi, tanpa token undangan, hanya menolak `role_id === 1`. Role 2 (admin), 3 (helpdesk), 5 (senior_leader), 6 (admin_branch) dapat dibuat sendiri; tabel `users` tidak punya kolom status/aktif; halaman `/register` di-link dari form login; rate limit 10/mnt per IP | `api/auth/register/route.ts:31-60`; `users.service.ts:397-452`; `roles.ts:42-56`; `LoginForm.tsx:283`; `schema.prisma:901` | **TERBACA; PERLU-VERIFIKASI di staging (OQ-02).** Bila terbukti: pengambilalihan akses admin. v3 tidak boleh mewarisinya. Lihat 14.9 |
| KI-26 | **SEC S1. Refresh token tanpa pembacaan ulang DB dan tanpa revokasi.** `/api/auth/refresh` menyusun token akses baru murni dari payload refresh token (role, role_id, workzone); logout hanya menghapus cookie; tidak ada `jti` atau versi token | `auth/refresh/route.ts:40-65`; `auth/logout/route.ts`; `libs/auth.ts` | **TERBACA.** User yang dihapus, diturunkan role, atau dipindah workzone tetap berakses sampai 7-30 hari. Perbaikan mengubah kontrak sesi: F2 dengan DBC |
| KI-27 | **SEC S2. Berkas bukti tanpa autentikasi.** `GET /api/files/[...path]` tidak memeriksa sesi dan memberi `Cache-Control: public, max-age=31536000, immutable` (CSP menunjukkan situs di belakang Cloudflare, sehingga cache publik di edge). Nama berkas `uploads/evidence/<incident>/<aksi>_<nama>_<12 hex>.ext` | `api/files/[...path]/route.ts`; `libs/upload.ts:130-145` | **TERBACA.** Foto lokasi pelanggan dapat diakses oleh pemegang URL dan tidak bisa dicabut. URL tersimpan di DB, jadi path harus tetap valid. F2 |
| KI-28 | **SEC S2. SSE tanpa cakupan.** Semua klien terautentikasi menerima semua event: `war-map:new-point` (serviceNo, lat/long, incident, workzone), `ticket:updated`, `ticket:viewers` (nama dan role), tanpa penyaringan branch/workzone/role | `sseBroadcast.ts:19-30, 135-155`; `api/tickets/events/route.ts:12` | **TERBACA.** Teknisi menerima koordinat pelanggan wilayah lain. Penyaringan per koneksi tidak mengubah format event, jadi bisa F1/F2 tergantung hasil |
| KI-29 | Event SSE dari proses web terkirim **ganda**: `broadcastToActive` lokal lalu `redis.publish`, sedangkan subscriber di proses yang sama juga memanggil `broadcastToActive` | `sseBroadcast.ts:34-62, 55-85` | **TERBACA.** Klien menerima duplikat (debounce menutupi sebagian). Perbaikan: tandai asal event dan abaikan gema. F1 |
| KI-30 | **SEC S2. Heartbeat membawa identitas dari klien.** `POST /api/tickets/[id]/heartbeat` memakai `userName` dan `role` dari body, menyiarkannya ke semua klien, dan tidak memeriksa kepemilikan atau cakupan ticket | `tickets/[id]/heartbeat/route.ts:17-48`; `sseBroadcast.ts` (`broadcastTicketViewers`) | **TERBACA.** Pemalsuan identitas pada indikator "sedang dilihat" dan bocornya keberadaan ticket. F2 |
| KI-31 | **SEC/PERF S2. `live-refresh` tanpa cakupan.** Teknisi, admin, dan helpdesk dapat memicunya untuk ticket mana pun; memakai anggaran bridge global (20 req/mnt, prioritas interaktif) dan menulis `ticket_raw` dari proses web. Batas hanya 6/mnt per identitas dan cooldown 10 dtk per (user, ticket) | `tickets/[id]/live-refresh/route.ts:19-21, 42-120` | **TERBACA.** Banyak pengguna dapat menghabiskan anggaran bersama dan menunda ingestion. F2 |
| KI-32 | **SEC S3. Identitas rate limit memakai entri pertama `X-Forwarded-For`** (dan hanya IP bila tanpa header Bearer, padahal sesi memakai cookie). Bila Nginx memakai `$proxy_add_x_forwarded_for`, entri pertama bisa dipalsukan klien (pembatas login/register/refresh bisa dilewati); sebaliknya teknisi di balik NAT operator berbagi satu bucket | `lib/rate-limit-identifiers.ts:8-25` | **PERLU-VERIFIKASI (OQ-03).** Di belakang Cloudflare gunakan `CF-Connecting-IP` |
| KI-33 | **SEC S3. Perbandingan secret cron biasa (`!==`/`===`), bukan `timingSafeEqual`**, di `dispatch`, `api/sync`, `api/internal/ingestion`, dan `internalRouteAuth`. Di `api/sync` dan `api/internal/ingestion`, bila `CRON_SECRET` berupa string kosong dan header kosong, pemeriksaan sesi dilewati | `integrations/tech-events/dispatch/route.ts:22-25`; `api/sync/route.ts:15-18`; `api/internal/ingestion/route.ts:67-70`; `libs/internalRouteAuth.ts:11` | **TERBACA.** Dampak kecil; perbaikan murah. F1 |
| KI-34 | **S3. `protectApi` membandingkan role mentah**, sedangkan `proxy.ts` dan `roles.ts` menormalkan alias. 54 rute yang menyebut `superadmin` tidak menyebut `super_admin`. `protectApi()` tanpa daftar role (5 rute) mengizinkan semua role | `protectApi.ts:38-46`; `roles.ts:11-30`; `proxy.ts:44-65` | **TERBACA.** Aman selama kunci di DB persis `superadmin`. Di v3 satu `requireRole` berbasis role ternormalisasi |
| KI-35 | Rekonsiliasi harian (ops-worker 06:00) hanya membandingkan tabel di `getTableNames()` (`EXTERNAL_TABLE_NAMES`), sehingga `nossa`/`nossa_closed` mungkin tidak ikut terpantau drift-nya | `worker.ts:584-646` | **PERLU-VERIFIKASI** (`EXTERNAL_TABLE_NAMES` ops-worker berasal dari `.env`, tidak diset di ecosystem) |
| KI-36 | **Indeks berlebih.** `ticket` punya 31 indeks, `ticket_raw` 8 indeks lebar (`idx_ticket_raw_status_refresh_seed` 7 kolom, `idx_ticket_raw_refresh_join` 6 kolom, `idx_ticket_raw_lookup` 5 kolom), memperberat tulis dan memperbesar peluang deadlock 1213. Tiga indeks `ticket` redundan awalan: `fk_ticket_user` ⊂ `idx_auto_assign_lookup`/`idx_ticket_teknisi_dashboard`; `idx_ticket_search_service_no` ⊂ `idx_ticket_service_reported` | `schema.prisma` model `ticket` dan `ticket_raw` | **TERBACA** (analisis awalan skema); pemakaian nyata PERLU-VERIFIKASI (`sys.schema_unused_indexes`). Agent hanya mengusulkan (R-40) |
| KI-37 | `findMany` tanpa `take`: heuristik 91 dari 184 panggilan (banyak yang wajar karena tabel kecil). Prioritas: `clusterAutoAssign.service.ts` (11), `cluster.service.ts` (8), `attendance.service.ts` (8), `helpers/ticket.helpers.ts` (7), `users.service.ts` (7), `manhours.service.ts` (4), `tickets.service.ts` (4), `audit-log.query.ts` (3), `projection/index.ts` (3) | hasil regex, bukan analisis AST | **HIPOTESIS.** Agent memeriksa satu per satu di Jalur H |
| KI-38 | `max_memory_restart` web 8192M lebih besar dari heap 4096M: V8 akan gagal karena heap penuh sebelum PM2 melihat RSS 8 GB (kecuali memori non-heap besar) | `ecosystem.config.js:11-12` | **TERBACA.** Info; tetapkan batas v3 dari data (Bagian 7) |
| KI-39 | Rotasi auto-assign: `currentIdx = floor(now/5mnt) % totalSA`, jendela 20 SA bergeser **1 SA** per 5 menit (bukan 20), sehingga bila `totalSA > 20` tiap SA diproses ±20 kali per putaran | `worker.ts:269-280` | **HIPOTESIS** bergantung jumlah `service_area` (OQ-06) |
| KI-40 | Full scan projection `0 3 * * *` **dilewati diam-diam** bila proyeksi inkremental sedang berjalan (`state.running` → return) dan tidak dijadwal ulang | `worker-projection.ts:120-123, 282-286` | **TERBACA.** Full scan harian bisa tidak berjalan |
| KI-41 | Topologi dan kualitas build v2: produksi di container LXC (CT 200) pada host Proxmox; build dilakukan di host lalu di-rsync karena `next build` pernah memakai 46 GiB; `typescript.ignoreBuildErrors: true` sehingga **kesehatan tipe tidak dijaga saat build** | `scripts/build-external.sh`; `next.config.ts:15` | **TERBACA.** Catat hasil `tsc --noEmit` di baseline (Fase 0.4) |
| KI-42 | Metrik kualitas v2: 280 `any`, 14 `eslint-disable react-hooks/exhaustive-deps`, 0 uji; file raksasa (`WarMapClient` 2822 baris, `SuperadminUsersClient` 2148, `tickets.service.ts` 2028, `TicketManagementBucketPage` 1768) | grep | **TERBACA.** Area utama perburuan bug FE |
| KI-43 | Tiap pemanggil `useTicketEvents` (FreshnessBadge, Overview, Bucket, `useTicketLiveUpdates`, teknisi `useTickets`) dan `WarMapClient` membuka `EventSource` sendiri ke endpoint yang sama; `WarMapClient` tidak memutus koneksi saat tab di latar belakang (hook-nya memutus) | `hooks/useTicketEvents.ts:133, 232-250`; `WarMapClient.tsx:1953` | **TERBACA;** jumlah koneksi nyata per tab PERLU-VERIFIKASI (DevTools). Di v3: satu store SSE bersama |

---

## 7. Anggaran Performa dan Memori

### 7.1 Baseline dan cara ukur

Sebelum pilot Fase 1, buat `docs/performance-scorecard.md`. Pemilik mengumpulkan baseline produksi baca-saja minimal 3 hari yang mencakup idle/jam sibuk; agent tidak mengakses DB produksi (R-12). Agent boleh mengukur referensi dev terisolasi yang izinnya tersedia. Pisahkan kedua sumber bukti.

Setiap pengukuran mencatat commit/config, versi runtime/DB, resource CPU/RAM, jumlah instance, ukuran/distribusi data, role/filter, concurrency/rate request, durasi, warm-up, keadaan cache, serta waktu/sampel. Bandingkan v2/v3 pada batas resource dan workload yang sama; urutan benchmark diselingi agar perubahan beban mesin tidak menguntungkan satu sisi. Simpan variasi antarpengulangan, bukan satu run terbaik. p99 hanya dilaporkan bila jumlah sampelnya memadai dan jumlah sampel tetap ditampilkan.

Baseline meliputi RSS dan CPU seluruh proses, p50/p95/p99 API berat, jumlah/waktu query, pool wait/timeout, jumlah koneksi primary/bulk/eksternal, deadlock/retry, task skip, backlog/DLQ, lag sumber-ke-raw-ke-ticket-ke-UI, serta peak RSS/durasi build lengkap. Riwayat OOM/ukuran uploads yang disebut komentar adalah konteks, bukan hasil ukur baru.

### 7.2 Scorecard dan target keberhasilan

Angka baseline dan target final belum tersedia pada revisi PRD ini. Jangan mengarang angka atau mengubahnya menjadi nol. Sebelum optimasi/pilot dinilai, isi nilai berikut bersama pemilik. Untuk metrik lebih kecil lebih baik, tetapkan baseline `B`, delta peningkatan positif `d`, ambang absolut `L`, dan toleransi regresi metrik pelindung; kelulusan mensyaratkan hasil memenuhi keduanya: `hasil <= B * (1 - d)` dan `hasil <= L`. Untuk throughput gunakan delta positif dengan arah sebaliknya. Delta harus melampaui variasi pengukuran.

| Metrik wajib | Cakupan dan baseline | Target yang harus dikunci | Gerbang |
|---|---|---|---|
| Latensi API | Tickets, rekap-workorder, War Map; cold/warm; p50/p95, p99 jika memadai | Delta p95 dan ambang absolut per endpoint; error/timeout tidak memburuk | G6/G11 |
| Memori total dan per proses | RSS steady/peak seluruh web + API + worker, jumlah instance tercatat | Delta total RSS steady/peak; tidak ada pertumbuhan tanpa batas pada soak | G6 |
| CPU/koneksi/query | CPU per workload, query/request, pool wait/timeout, seluruh pool | Batas concurrency, query dan total koneksi; peningkatan memori tidak dipindahkan menjadi beban DB berlebih | G6/G11 |
| Freshness data | p95 lag per sumber pada tiap tahap pipeline | Batas detik/menit per sumber, terhitung dari pagination/volume dan kuota bersama | G5/G6 |
| Throughput dan recovery | Baris/menit, umur job tertua, waktu mengejar backlog setelah outage | Delta throughput atau waktu recovery; DLQ dan request 429 dipantau | G5/G6 |
| Integritas/keandalan | Rekonsiliasi raw-ticket, duplikasi transisi/outbox, error, timeout, deadlock dan task terlewat | Nol kehilangan/duplikasi di luar kontrak DBC pada skenario uji; ambang operasi dan rollback terukur | G4/G5/G6/G7 |
| UX teknisi | Halaman siap dipakai, interaksi, payload/bundle dan upload pada perangkat/jaringan yang ditetapkan | Batas waktu/ukuran dan delta pada alur prioritas; isian tidak hilang saat jaringan gagal | G6/G8 |
| Build/deploy | Durasi dan total peak RSS build web/API/workers, resource setara | Batas absolut serta target peningkatan dibanding build sumber `--webpack` yang benar-benar digunakan | G3/G6 |

**Aturan lulus:** sekadar tidak lebih buruk belum memenuhi tujuan rewrite. Critical endpoint yang dipilih sebelum optimasi dan total sumber daya memiliki target peningkatan positif; metrik pelindung tidak melewati toleransi yang disetujui. Modul yang tidak memengaruhi metrik tertentu boleh N/A dengan alasan. P/H boleh selesai merekam masalah warisan; F/cutover harus memenuhi target. Jika target ternyata tidak realistis, tampilkan bukti dan minta keputusan perubahan target sebelum dinilai ulang, tanpa menghapus bukti lama.

Soak worker pilot minimal 24 jam pada beban simulasi; pilot bayangan minimal 3 hari. Uji meliputi cold start, cache miss bersamaan, volume data seukuran produksi yang dianonimkan, upstream lambat/down, Redis hilang/pulih, dan restart di tengah job. Tentukan di scorecard ambang pembatalan otomatis dan pemilik yang mengambil tindakan.

### 7.3 Batas awal proses dan koneksi

Tabel ini adalah batas konfigurasi awal, **bukan RSS baseline** dan bukan bukti peningkatan. Jangan menaikkan batas untuk sekadar meloloskan pengujian.

| Proses | Batas v2 di repository | Batas awal v3 | Catatan |
|---|---|---|---|
| Web | `dompis-server` 8192M (heap 4096M) | `dompis-web` (SvelteKit) 1024M | Naikkan hanya dengan data monitoring |
| API | (satu proses dengan web) | `dompis-api` (Elysia) 768M | Pool terpusat |
| Snapshot | 256M | 256M | Pilot pertama |
| Projection | 870M | ≤ 870M | |
| Data | 1536M | ≤ 1536M | Setelah active-refresh dikeluarkan, targetkan lebih kecil |
| Bridge | 512M | ≤ 512M | `kill_timeout` 120 dtk dipertahankan |
| Ops | 1024M | ≤ 1024M | |
| Audit purge | 256M | ≤ 256M | Sekali jalan |

**Aturan pool koneksi:**
- Pool per proses v3 tidak melebihi padanan v2 (ops 8, data 15, bridge 6, projection 6, snapshot 4, purge 4). Web SvelteKit tidak punya pool DB; API menampung budget yang sebelumnya dimiliki web v2 (35 primary), bukan menambah pool 35 baru di kedua proses.
- Hitung gabungan `jumlah instance * seluruh pool primary/bulk`, koneksi eksternal, admin/maintenance dan layanan lain. Selama coexistence, gabungan tidak melebihi 80% `max_connections` MySQL yang dikonfirmasi; sisakan headroom. Setengah pool padanan adalah titik awal pengujian, bukan jaminan aman tanpa perhitungan total dan uji pool wait.
- Pembatasan konkurensi yang ada di v2 harus ikut: `CACHE_COMPUTE_CONCURRENCY=6` (`lib/sql/query-gate.ts`) dan batas waktu eksekusi query (`lib/sql/max-execution-time.ts`, `DASHBOARD_QUERY_MAX_EXECUTION_MS=30000`).
- Tidak ada endpoint yang menjalankan lebih dari 3 query berat paralel; hasil agregasi berat wajib dari snapshot atau cache, bukan dihitung ulang tiap request.
- Perintah `SET SESSION ...` di v2 dikirim lewat pool (`setLockWaitTimeout` di `worker.ts`). Di v3 setelan sesi hanya boleh dipakai pada **satu koneksi khusus** untuk satu pekerjaan (lihat KI-19).

---

## 8. Kondisi Berhenti (Agent Wajib Berhenti dan Bertanya)

Agent tidak boleh menebak pada kondisi berikut. Hentikan unit/aksi yang bergantung pada keputusan atau bukti yang hilang, jelaskan blocker serta opsi, dan tunggu keputusan yang diperlukan. Lanjutkan pekerjaan independen yang sudah diizinkan. Jangan menghentikan seluruh proyek karena satu gerbang lokal, dan jangan memakai elapsed time sebagai persetujuan. Pemisahan tugas yang terlalu besar dapat dilakukan tanpa meminta persetujuan baru selama cakupan tidak berubah.

1. Ada konflik di luar delta DBC/keputusan yang sudah disetujui, atau aturan bisnis ambigu. Ikuti hierarki 0.2.
2. Gerbang tidak bisa dijalankan (DB, Redis, atau dump tidak tersedia).
3. Gerbang G4 menunjukkan selisih yang tidak bisa dijelaskan.
4. Tugas memerlukan dependency di luar manifest disetujui, perubahan skema, atau perubahan kontrak di luar DBC yang sudah berlaku.
5. Ada permintaan menyentuh `dompis_v2`, database produksi, atau rahasia.
6. Library kunci gagal spike kompatibilitas. Hentikan modul yang bergantung padanya; laporkan reproduksi dan opsi. Jangan mengganti stack/runtime tanpa keputusan, atau menghentikan modul independen tanpa alasan dependency.
7. Modul mempunyai pemanggil yang belum diaudit atau dependency kontrak belum siap. Menggunakan kontrak modul lain yang sudah siap bukan alasan menghentikan tugas; perluasan implementasi lintas modul dipecah menjadi tugas terpisah.
8. Dugaan keamanan dicatat dan diverifikasi secara aman pada referensi uji. Jika S0/S1 atau rahasia/data pelanggan terbuka, segera lapor dan hentikan tindakan terkait sesuai poin 14; jangan menampilkan rahasianya.
9. Estimasi diff kode produksi melebihi sekitar 400 baris atau lebih dari 10 file. Pecah menjadi tugas terverifikasi tanpa memperluas scope. Inventaris/PRD dapat lebih panjang sebagai satu artefak dokumentasi yang diminta; batas ini bukan alasan memotong kontrak penting.
10. Inventaris SQL menemukan kelas C (nilai diinterpolasi ke string) di jalur yang akan diport. Lapor sebagai KI keamanan dan minta keputusan.
11. Kode tampak mati, tidak dijadwalkan, atau legacy (R-32).
12. Instance referensi `dompis_v2_ref` atau dump anonim tidak tersedia untuk parity.
13. Uji waktu/tipe menunjukkan selisih (R-27, R-31), atau G9 menunjukkan skema DB dev berbeda dari `packages/db`.
14. **Temuan keamanan S0/S1** (celah yang bisa dieksploitasi, kebocoran data pelanggan, rahasia terbuka). Berhenti pada hal itu, lapor segera tanpa mengeksploitasi, dan tunggu keputusan (R-42, 14.9).
15. Perbaikan akan mengubah keluaran, angka, urutan, atau alur pengguna (kelas F2) dan DBC belum disetujui (R-41).
16. Optimasi diusulkan tanpa baseline terukur, atau hasil sebelum/sesudah tidak lebih baik (R-38). Buang perubahan dan lapor.
17. Bug tidak bisa direproduksi atau dibantah. Laporkan sebagai PLAUSIBLE, jangan diperbaiki berdasarkan dugaan.
18. Penghapusan diminta tanpa Manifes Pensiun yang disetujui, atau masih ada pemanggil/trafik pada unit yang akan dipensiunkan (R-47, R-48).
19. SOURCE_ROOT/TARGET_ROOT belum dikunci atau sama/bersarang; scaffold dilarang. Penetapan path tidak boleh ditebak dari nama folder.
20. Coverage fitur, target scorecard, ownership penulis, atau kontrak producer/consumer/cache belum lengkap pada modul yang akan diimplementasikan/dialihkan.
21. Tidak ada isolasi state, kontrol nondeterminisme, atau pemicu referensi yang diperlukan untuk parity. Keluarkan status BLOCKED untuk skenario tersebut, bukan PASS dengan normalisasi umum.

---

## 9. Pelaporan, Commit, dan UAT

### 9.1 Laporan Eksekusi (wajib di akhir setiap tugas)
```
## Laporan Tugas <ID>: <judul>
Tanggal/jam (WIB):
Modul sumber (dompis_v2): <path>
Status: SELESAI | BERHENTI (alasan) | GAGAL
Tahap: DOKUMEN | FONDASI | P | H | F | CUTOVER | R
Versi PRD / SOURCE_COMMIT / TARGET_COMMIT:
ID kapabilitas dan fitur / DBC yang berlaku:
Prasyarat dan batas file yang boleh diubah:

### Langkah siklus (centang)
[ ] 1 Baca utuh  [ ] 2 Petakan pemanggil  [ ] 3 Catatan Perilaku  [ ] 4 Kontrak Field
[ ] 5 Rencana    [ ] 6 Implementasi       [ ] 7 Gerbang      [ ] 8 Parity

### File dibuat/diubah (path + ringkas)
### Aturan R-nn yang relevan dan cara dipatuhi
### Bukti gerbang (tempel output nyata)
G0:  G1:  G2:  G3:  G4:  G5:  G6:  G7:  G8:  G9:  G10:  G11:  G12:  G13:
Tiap gerbang: mode, cakupan, PASS/FAIL/BLOCKED/N/A, alasan, perintah,
commit/lingkungan, waktu, exit code dan lokasi bukti yang disensor.
### Selisih parity dan penjelasannya
### Jalur H/F: cakupan checklist 14.3/14.4, temuan (ID, kelas, konfidensi), uji regresi merah→hijau, sebelum/sesudah (Q7), DBC terkait
### Migration-map dan pensiun: baris yang diubah, unit v2 yang dipensiunkan atau Ditahan
### KI baru / ketidakpastian
### Risiko dan cara rollback
### Feature matrix, scorecard, transition-contract dan checkpoint yang diperbarui
### Blocker lokal / pekerjaan independen yang masih dapat dikerjakan
### Checkpoint-ID / pemilik berikut / status handoff (9.4)
### Hash commit
```

### 9.2 Format Commit
`<tipe>(<modul>): <ringkas>` dengan tipe `feat`, `port`, `test`, `chore`, `docs`, `fix`, `perf`. Isi commit menyebut ID tugas/fitur, gerbang yang berlaku dan KI/DBC terkait. Jangan menyebut rentang gerbang lulus jika sebagian belum dijalankan. Commit dokumen tidak menyatakan implementasi sudah dimulai.

### 9.3 Checklist UAT (G8) sebelum cutover modul
- [ ] Parity state/efek samping dan oracle DBC lulus; feature matrix tidak memiliki fitur hilang tanpa keputusan
- [ ] Pilot bayangan minimal 3 hari untuk worker atau 1 minggu untuk API/UI, tanpa penulis/efek samping produksi ganda; ini terpisah dari observasi pasca-cutover
- [ ] Scorecard memiliki baseline/target disetujui dan bukti peningkatan; jumlah instance serta total sumber daya dicatat
- [ ] Uji oleh pengguna nyata (teknisi/admin) pada kelompok terbatas
- [ ] H/F dan G10/G11 selesai; jalur dengan kerentanan aktif terbukti sudah aman atau nonaktif; tidak ada blocker kontrak/scorecard
- [ ] Rencana rollback diuji satu kali
- [ ] Rencana pensiun: unit v2 yang digantikan terdaftar di migration-map dan manifes pensiun disiapkan (dieksekusi setelah observasi, Bagian 15)
- [ ] Tabel saklar cutover (12.1) terisi dan diuji, hanya satu implementasi aktif per fungsi
- [ ] Producer/consumer, job tersisa, limiter bersama, invalidasi cache, sesi, aset, SSE, checkpoint dan outbox lolos kontrak transisi 12.3
- [ ] Disetujui PakBreng secara tertulis

### 9.4 Checkpoint, Handoff dan Pemulihan Sesi

Checkpoint wajib disimpan sesudah tugas/checkpoint bermakna, setelah keputusan atau blocker berubah, dan sebelum berhenti, pergantian agent/mesin/branch, atau konteks sesi habis. Tidak perlu menulis ulang seluruh PRD setiap kali. Jangan menunggu satu fase besar selesai untuk menyimpan pekerjaan parsial.

**Isi minimum checkpoint:**

```text
Checkpoint-ID dan waktu WIB:
Versi PRD / path kanonis / sumber acuan dan HEAD teramati / target branch+HEAD:
Status implementasi dan fase / tugas terakhir / tugas aktif / status tugas:
Pemilik sesi dan scope file / izin tugas yang berlaku:
Sudah dilakukan (beserta bukti, commit atau file aktual):
Belum selesai / perubahan lokal belum di-commit / file ignored yang diperlukan:
Gerbang per cakupan: PASS/FAIL/BLOCKED/N/A + waktu/commit/lingkungan/bukti:
Keputusan berlaku dan OQ/DBC terbuka:
Proses/dev-server/worker/job yang masih aktif dan resource yang dipakai:
Langkah berikutnya yang tepat / prasyarat / apa yang tidak boleh diulang:
Kondisi rollback/recovery / status serah terima:
```

**Saat agent baru masuk:**

1. Baca HANDOVER.md sampai selesai terlebih dahulu, lalu AGENTS, PRD aktif sesuai petunjuk konteks dan bukti tugas yang dirujuk. Periksa versi/checkpoint-ID, source/target, branch/HEAD, status Git serta diff/untracked/ignored relevan. Jangan hanya mengandalkan ringkasan agent sebelumnya.
2. Cocokkan tugas DONE dengan file/commit, acceptance dan bukti gerbang. Commit saja tidak membuktikan tes lulus; hasil tes lama hanya berlaku pada cakupan/commit/lingkungan yang tercatat sesuai T-05.
3. Verifikasi agent/proses lama berhenti pada scope yang akan diambil. Jangan menghentikan proses lain atau menghapus lock hanya untuk mengambil alih. Jika kepemilikan tidak jelas, batasi diri pada pemeriksaan baca-saja dan selesaikan ketidakpastian itu.
4. Laporkan singkat status, pekerjaan parsial, blocker dan satu tugas berikutnya. Ambil hanya tugas yang dependency serta kewenangannya terpenuhi; catat pemilik dan scope sebelum menulis.
5. Jangan mengulang scaffold/migrasi/replay/mutasi hanya karena tidak melihat riwayat chat. Periksa efek yang mungkin sudah terjadi dan idempotensinya terlebih dahulu.

**Saat agent lama menyerahkan pekerjaan:** simpan hasil dan pekerjaan parsial tanpa mengklaim selesai, perbarui checkpoint serta matriks relevan, catat proses/resource aktif, lalu lepaskan status penulis hanya setelah berhenti menulis. Catat commit bila ada; bila belum commit, daftarkan file/diff yang harus dipertahankan. Jangan memaksa commit yang melanggar gerbang tahap, melakukan reset/stash/delete atau membuang perubahan milik pihak lain untuk membuat status terlihat bersih.

**Jika sesi terputus:** checkpoint terakhir mungkin tertinggal. Agent pengganti memperlakukan status sebagai belum diverifikasi, meninjau perubahan setelah checkpoint, memeriksa job/proses yang mungkin masih berjalan, lalu mencatat recovery beserta bukti. Tugas IN_PROGRESS tanpa handoff tidak otomatis DONE atau aman diulang. Ketidaksesuaian hanya memblokir langkah terdampak; status diperbaiki setelah pemeriksaan, bukan ditutupi dengan checkpoint baru.

Simpan satu snapshot aktif yang ringkas dan riwayat checkpoint bertambah; jangan menghapus hasil gagal/keputusan lama. Jika riwayat membesar, arsipkan ke laporan per tugas dengan tautan yang masih dapat diakses. Perbarui checkpoint dan artefak status terkait dalam perubahan/commit yang sama bila memungkinkan. Jika terputus di antara pembaruan, cocokkan kembali dengan bukti aktual sebelum melanjutkan.

### 9.5 Prompt Resume Lintas Agent

Prompt ini dapat diberikan pada agent lain tanpa bergantung pada riwayat chat. Keberhasilan membaca dokumen tidak menjamin agent mematuhinya; pemilik tetap meninjau diff, bukti gerbang dan tindakan berisiko sesuai PRD.

```text
Baca HANDOVER.md terlebih dahulu sampai selesai. Setelah itu baca AGENTS.md,
PRD-Dompis-v3-Agent-Governance.md versi aktif dan bukti tugas yang relevan.
Ini sumber konteks proyek, jangan mengandalkan chat lama.
Verifikasi lokasi sumber/target, versi PRD, checkpoint-ID, branch/HEAD dan perubahan
lokal termasuk file ignored yang diperlukan. Cocokkan progres dengan bukti aktual.
Laporkan tugas terakhir, pekerjaan parsial, blocker dan satu tugas berikutnya.
Pastikan agent/proses lama sudah berhenti pada scope yang akan kamu tulis.
Lanjutkan hanya tugas berikut yang dependency dan izin pemiliknya sudah terpenuhi.
Jika izin hanya dokumen, jangan menjalankan implementasi. Jangan ulang pekerjaan
yang sudah terbukti selesai, mengarang hasil tes atau mengubah keputusan tanpa dasar.
Simpan checkpoint dan handoff sebelum berhenti atau berganti tugas/agent.
```

---

## 10. Arsitektur Target

```
dompis-v3-app/
├─ apps/
│  ├─ api/        @dompis/api      Elysia (semua REST + SSE)
│  ├─ web/        @dompis/web      SvelteKit, adapter-node (semua role)
│  └─ workers/    @dompis/workers  snapshot, projection, ops, data, bridge, audit-purge
├─ packages/
│  ├─ db/         @dompis/db       skema Drizzle + koneksi (hasil introspect, dikoreksi dengan SHOW CREATE TABLE)
│  ├─ core/       @dompis/core     aturan bisnis & otorisasi bersama
│  ├─ infra/      @dompis/infra    logger+correlation, redis, distributed-lock, task-runner, cache, rate-limit, sql-gate
│  └─ shared/     @dompis/shared   tipe, konstanta, skema validasi
├─ docs/{adr,behavior,known-issues.md,config-contract.md}
├─ AGENTS.md
└─ package.json   (Bun workspaces)
```

**Aturan arsitektur**
- **A-01** `apps/web` tidak mengimpor `@dompis/db`. Data hanya lewat API (Eden Treaty).
- **A-02** Logika bisnis dan otorisasi hanya di `@dompis/core`. Route Elysia tipis.
- **A-03** Worker memakai `@dompis/db`, `@dompis/core`, dan `@dompis/infra`, tidak menyalin kode dari API.
- **A-04** Satu domain melalui Nginx/aaPanel dengan routing path/cohort sesuai 12.4. Cookie, origin, forwarding SSR, CSRF/same-origin dan header keamanan diuji, bukan dianggap otomatis aman karena satu domain. SSE butuh buffering mati serta timeout/reconnect teruji. Aset Next/SvelteKit dan endpoint lama yang masih dipakai tidak boleh terputus.
- **A-05** Rendering SvelteKit ditentukan per halaman. Halaman berat interaktif (War Map, Ticket Management) pakai SSR/CSR hibrida.
- **A-06** Konsolidasi: tiga page shell `rekap-workorder` (admin/helpdesk/superadmin) menjadi satu halaman dengan role guard tipis. Dikerjakan sebagai tugas terpisah di Fase 10, bukan saat port.
- **A-07** Pustaka UI, peta, grafik, scanner QR, tanggal, dan state server **belum diputuskan**. Setiap pilihan lewat ADR (R-09) dan uji di Fase 0. Hasil inventaris dependensi:

| Pustaka v2 | Pemakaian | Perlu pengganti Svelte? |
|---|---|---|
| `react`, `react-dom`, `next` | seluruh UI | Ya (SvelteKit) |
| `@tanstack/react-query` | 39 import | Ya (opsi: `@tanstack/svelte-query` atau store sendiri) |
| `lucide-react` | 150 import | Ya (padanan Svelte) |
| `react-leaflet` + `leaflet` + `supercluster` | War Map, KML (`leaflet` 6 import, `react-leaflet` 3) | `react-leaflet` ya; `leaflet` dan `supercluster` dapat dipakai langsung |
| `recharts` | 8 import | Ya |
| `react-day-picker` (4), `flatpickr` (2) | pemilih tanggal | `react-day-picker` ya; `flatpickr` agnostik |
| `@yudiel/react-qr-scanner` | **2 tempat**: `LocationTagger.tsx`, `teknisi/join/page.tsx` | Ya |
| `qrcode.react` | 1 | Ya |
| `@radix-ui/react-popover`, `@aejkatappaja/phantom-ui` | 1 masing-masing | Periksa (phantom-ui adalah web component) |
| `clsx`, `tailwind-merge`, `date-fns`, `date-fns-tz`, `zod`, `papaparse`, `xlsx`, `fast-xml-parser` | util | Tidak, agnostik (uji di Bun) |
| `jose`, `bcryptjs`, `bullmq`, `ioredis`, `mysql2`, `sharp`, `firebase-admin`, `google-auth-library` | server | Tidak diganti, tetapi **wajib uji kompatibilitas Bun** (Fase 0.2) |

- **A-08** Kebijakan proses web: tidak boleh menelan error tak tertangani tanpa keputusan tertulis (KI-16). Urutan shutdown mengikuti `server.ts`: tutup HTTP, lalu health check, SSE Redis, DB, Redis, dengan batas 10 detik.
- **A-09** `hooks.server.ts` SvelteKit meniru `proxy.ts`: verifikasi token, silent refresh, role guard, header `x-correlation-id`, header keamanan, `Cache-Control` per path. Setiap perilaku punya uji.

---

## 11. Fase dan Prompt Eksekusi

Urutan berdasarkan risiko dan dependency kontrak 1.3. Infrastruktur dibangun sebelum pemakainya. Nomor fase adalah kelompok kerja, bukan izin melompati dependency: ops-worker yang memakai auto-assign/workflow harus memiliki core contract dan parity service tersebut sebelum dinyalakan, meskipun endpoint/UI-nya ada di Fase 6. Review fase memakai hasil konkret; keputusan yang sudah disetujui tidak ditanyakan ulang. Cutover/pensiun tetap memerlukan persetujuan khusus.

**Gambaran bobot (agar ekspektasi realistis).** Worker dan infrastruktur (Fase 0-4) kecil dibanding total tetapi paling berisiko. API (Fase 5-7) mencakup 156 rute. Frontend (Fase 8-10) adalah porsi terbesar: ±37 ribu baris admin, ±13 ribu baris teknisi, ±18 ribu baris komponen bersama. Karena strangler-fig, **berhenti di fase mana pun adalah keputusan sah**, termasuk membiarkan halaman admin tetap Next.js sementara worker dan API sudah pindah.

**Tugas turunan per modul.** Setiap tugas port T-x.y memiliki tugas turunan **T-x.y-H** (Prompt H, 14.8), **T-x.y-F** per temuan (Prompt F), dan setelah cutover dan observasi **T-x.y-R** (Prompt R, 15.6). Target H per fase ada di 14.7.

### 11.1 Prompt Induk (awali setiap tugas dengan ini)

```text
Kamu mengerjakan satu tugas rewrite Dompis sesuai PRD versi 1.8.
Muat konteks menurut petunjuk pembuka, AGENTS aktif, checkpoint, spec modul dan DBC.
Pastikan izin sesi mencakup tugas ini; membaca PRD bukan izin menjalankan rewrite.

ATURAN:
- Verifikasi SOURCE_ROOT/COMMIT, TARGET_ROOT dan lingkungan uji (Bagian 0).
- Sumber read-only. Referensi HTTP dan runner worker terisolasi mengikuti 5.2.
- Ikuti Siklus Bagian 4; jangan implementasi sebelum kontrak fitur/perilaku siap.
- Satu tugas satu cakupan fitur/modul. Pisahkan P/H/F/R; S tidak boleh mewarisi celah.
- Perbarui feature matrix, migration-map, scorecard/transisi yang terdampak dan checkpoint.
- Dependency mengikuti manifest disetujui; tambahan di luar manifest memerlukan ADR.
- Patuhi Bagian 16/design-contract; jangan mengubah UI baseline tanpa keputusan.
- Patuhi kontrak waktu/angka, generated, uploads, Redis dan ownership penulis.
- G4 memakai state identik; SQL dinilai semantiknya; delta F2/S hanya sesuai DBC.
- Jalankan gerbang tahap 5.3. PASS mempunyai output nyata, commit dan exit code.
- Blocker menghentikan langkah terdampak. Lanjutkan pekerjaan independen yang diizinkan.
- Semua teks UI Bahasa Indonesia, waktu bisnis WIB.
- Resume/handoff mengikuti 0.5/0.6 dan 9.4; simpan pekerjaan parsial sebelum berhenti.
- Akhiri dengan laporan 9.1. Commit hanya bila syarat tahap terpenuhi.

TUGAS: <ID, tahap, kapabilitas/fitur, acceptance criteria, scope file,
        dependency, DBC, gerbang wajib, dan rollback>
```

### Fase 0 - Fondasi dan Gerbang Go/No-Go
**Tujuan:** scaffold monorepo, uji kompatibilitas, koreksi skema, kontrak waktu/tipe, harness parity, inventaris, baseline.

**Urutan dependensi wajib:** 0.0 sebelum scaffold; manifest spike sebelum 0.2; referensi/harness 0.7 sebelum roundtrip 0.6; inventaris/kontrak fitur 0.8 sebelum spec port; perkakas 0.9 sebelum gerbang modul pemakainya. Baseline 0.4 boleh dikumpulkan sambil menyiapkan fondasi. Nomor tugas dipertahankan untuk keterlacakan, bukan urutan eksekusi harfiah.

```
TUGAS 0.0 - Kunci identitas, kewenangan dan konteks
- Lengkapi 0.1, manifest dependency/versi untuk scaffold/spike, dan izin tugas fondasi.
- Pastikan sumber/target/referensi terpisah, tidak mengarah produksi dan tidak menimpa workspace lama.
- Siapkan kebijakan version control dokumen dan AGENTS yang menggabungkan aturan proyek.
- Jika hanya ditugaskan mengedit PRD, berhenti pada dokumen; jangan jalankan langkah berikutnya.

TUGAS 0.1 - Scaffold monorepo
- Setelah 0.0 disepakati, buat scaffold di TARGET_ROOT sesuai Bagian 10; jangan menulis di SOURCE_ROOT.
- Skrip root: typecheck, lint, test, build, test:parity, test:integration, test:load, test:security, test:schema (stub yang GAGAL dengan pesan "belum diimplementasikan", bukan stub yang lulus).
- tsconfig strict. .gitignore memuat .env* dan mempertahankan dokumen governance yang disensor sebagai tracked. Gabungkan Lampiran A ke AGENTS target; jangan menimpa aturan graphify/skill/kewenangan yang masih berlaku.
- Verifikasi: bun install, G0, G1, G3 hijau pada kerangka kosong.

TUGAS 0.2 - Uji kompatibilitas Bun (terisolasi, tanpa menyentuh produksi)
- Di folder spike/ (tidak ikut build), uji satu per satu terhadap DB dev dan Redis lokal:
  drizzle-orm + mysql2 (koneksi, transaksi, query dengan hint MAX_EXECUTION_TIME, tabel dengan kolom generated, tipe waktu/BigInt/Decimal),
  ioredis (termasuk eval Lua dan pub/sub),
  bullmq (enqueue, proses, ack, retry, rate limit, concurrency),
  node-cron, jose (verifikasi token uji dengan secret uji), bcryptjs (verifikasi hash sampel dari dump),
  AsyncLocalStorage (konteks correlation id), sharp, xlsx, fast-xml-parser,
  firebase-admin (mode uji/dry-run, tanpa kirim ke perangkat nyata),
  Elysia SSE di belakang Nginx (proxy_buffering off), SvelteKit adapter-node di Bun.
- Hasil ke docs/adr/001-kompatibilitas-bun.md: lulus/gagal per pustaka, versi, catatan.
- Jika ada yang gagal, BERHENTI (Bagian 8, poin 6).

TUGAS 0.3 - Introspect skema dan koreksi dengan DDL asli
- Jalankan drizzle-kit introspect ke DB DEV (dump anonim). JANGAN push/migrate (R-13).
- Untuk SETIAP tabel, bandingkan hasil dengan SHOW CREATE TABLE di DB dev dan dengan schema.prisma (52 model). Tinjau khusus: kolom STORED GENERATED di ticket (operational_bucket, kpi_seg), indeks FULLTEXT di ticket, indeks DESC dan nama kustom (idx_ticket_raw_*, idx_service_location_geo, idx_slh_*), 8 field @updatedAt, tipe Timestamp(0) vs DateTime(0), BigInt/Decimal/Json, 2 enum.
- Tulis docs/behavior/schema-diff.md. Aktifkan G9 (test:schema) agar selisih skema terdeteksi otomatis, karena v2 tetap berevolusi lewat migrasi Prisma.

TUGAS 0.4 - Baseline sistem lama (read-only)
- Susun instruksi/alat ukur Bagian 7; pemilik mengumpulkan data produksi. Agent hanya mengukur dev yang diizinkan, tidak terhubung DB produksi. Isi docs/performance-scorecard.md: baseline, workload, delta positif, ambang absolut, metrik pelindung dan pemicu rollback. Angka belum tersedia tidak boleh dianggap terukur.
- Catat kesehatan tipe pada salinan referensi (bukan SOURCE_ROOT), hasil EXPLAIN dev, dan jawaban OQ terkait dari pemilik. Menjalankan typecheck tidak boleh menulis build-info ke sumber read-only. Hubungkan bukti ke commit/config dan jangan menganggap angka audit lama tetap berlaku.

TUGAS 0.5 - Inventaris SQL mentah
- Daftarkan SEMUA $queryRawUnsafe/$executeRawUnsafe/$queryRaw/$executeRaw di app, lib, dan worker.ts (scripts dibuat daftar terpisah).
- Klasifikasi: A = konstan tanpa input; B = placeholder terikat; C = nilai diinterpolasi ke string. Hasil ke docs/behavior/raw-sql-inventory.md dengan file:baris.
- Laporkan seluruh kelas C ke PakBreng. Jangan memperbaiki apa pun (R-08).

TUGAS 0.6 - Kontrak waktu dan tipe (R-27, R-31)
- Pada DB dev, uji tulis-lewat-v2/baca-lewat-v3 dan sebaliknya (lewat instance referensi, 0.7) untuk kolom DateTime(0), Timestamp(0), Date, DECIMAL, BIGINT (COUNT/SUM), JSON, TEXT panjang.
- Catat @@global.time_zone, @@session.time_zone, opsi mysql2 yang dipilih, dan alasannya. Hasil ke docs/adr/002-kontrak-waktu-dan-tipe.md.
- Selisih sekecil apa pun: BERHENTI (Bagian 8, poin 13).

TUGAS 0.7 - Harness parity dan instance referensi
- Jalankan sebelum 0.6. Pemilik/pelaksana berizin menyiapkan referensi sesuai SOURCE_COMMIT, runner worker satu siklus, clock/config uji, serta ekspor log/state disensor.
- Dua DB snapshot identik, Redis/file state terisolasi, mock QOSMIC dan penampung webhook/FCM; guard lingkungan nonproduksi wajib.
- Harness HTTP dan replay worker mengikuti seluruh 5.2: respons/tipe/cookie/header, state, efek samping, normalisasi terbatas dan oracle delta DBC. SQL/parameter dibandingkan secara semantik, bukan string identik.
- Fasilitas referensi yang belum tersedia memblokir skenario terkait. Lanjutkan inventaris independen tanpa klaim parity.

TUGAS 0.8 - Inventaris dependensi, skrip operasional, dan konfigurasi
- Lengkapi tabel A-07 dengan hasil uji. Ajukan ADR untuk pustaka UI, peta, grafik, QR, tanggal, server-state.
- Klasifikasi 88 berkas di scripts/: tetap di v2 sampai cutover | diport | dibuang. Simpan di docs/ops-scripts.md.
- Susun docs/config-contract.md dari commit sumber: nama env, default, override efektif per proses, kapan dibaca, rahasia/tidak, dan efek saklar. Angka awal 99 perlu diverifikasi, bukan batas inventaris.
- Lengkapi route-inventory dan feature-parity-matrix 1.4: semua method/path, 48 halaman, pemicu/skrip, dependency M00..M12, dan keputusan fitur Ditahan/Tidak diport. Satu endpoint satu modul pemilik.
- Susun docs/transition-contract.md sesuai 12.3 dan matriks penulis ticket_raw per sumber/kolom. Tetapkan cohort/path routing dan kompatibilitas sesi/aset.

TUGAS 0.9 - Perkakas Hunt, Pensiun, Gaya dan Coverage (v1.8)
- Buat docs/migration-map.md (15.2) dan isi awal dari inventaris: 156 rute, fungsi/kelas utama per service, 7 proses PM2, 12 cron ops, env, skrip operasional. Status awal: Belum.
- Implementasikan check:hunt-report, test:queries (mode diagnostik/enforce), check:retirement, check:no-legacy dan pemeriksaan coverage fitur/method-route. Manifest diagnostik H berada di luar discovery suite wajib dan diaudit; jangan menyembunyikan tes gagal. Dependency tambahan mengikuti R-09.
- Buat docs/known-issues.md dari tabel 6.3 dan folder docs/hunt, docs/dbc, docs/retirement.
- Implementasikan G13 sesuai 16.4. Ekstrak token dan inventaris tampilan/teks v2, lalu docs/design-contract.md: baseline, pengecualian port, perubahan visual disetujui. Menghapus gradien atau mengganti label bukan langkah port otomatis.
- Semua skrip baru GAGAL bila belum diimplementasikan (bukan lulus palsu).
```
**Gerbang fase:** matriks fondasi 5.3 terpenuhi; manifest/ADR kompatibilitas diterima; schema-diff, ADR waktu/tipe, inventaris fitur/SQL/config dan kontrak transisi tersedia; harness HTTP/worker smoke lulus; baseline/target pilot disetujui. Gerbang wajib pilot tidak boleh masih stub. Keputusan terbuka pada modul lain tidak menghentikan pilot independen, tetapi dicatat sebagai blocker modul tersebut.

### Fase 1 - Infrastruktur bersama dan `dompis-snapshot-worker` (pilot)
```
TUGAS 1.0 - @dompis/infra (tanpa fitur bisnis)
- Baca utuh: lib/redis.ts, lib/distributed-lock.ts, lib/workers/task-runner.ts, lib/observability/{logger,slo-tracker,config-validator}.ts, lib/worker-signals.ts.
- Port: redis client, lock (skrip Lua IDENTIK: key lock:<key>, :fencing, :meta, fencing token), withTaskLock dengan perpanjangan otomatis, circuit breaker, scheduleEveryMinutes (interval adaptif), heartbeat worker:heartbeat:<nama>, installShutdownHandlers, logger dengan correlation id.
- G5 khusus: uji silang pada Redis dev. Lock yang dipegang v2 harus terlihat "held" oleh v3 dan sebaliknya.

TUGAS 1.1 - Port snapshot worker
- Baca utuh: worker-snapshot.ts, lib/aggregation/summary-snapshot.ts (recomputeTodaySnapshot, 4 query mentah), model DashboardSummarySnapshot, semua pemanggil (grep).
- Verifikasi KI-12: apakah bump sync_date terjadi di recomputeTodaySnapshot.
- Catatan Perilaku: SNAPSHOT_INTERVAL_SECONDS=60, SNAPSHOT_RUN_ON_START, run tumpang tindih, tabel yang ditulis. Pool maksimum 4.
- G4: replay worker lama/baru melalui runner 5.2 pada dua DB bayangan dari snapshot identik (atau reset state lengkap yang dibuktikan). Clock, sequence dan efek samping terisolasi; bandingkan isi snapshot sesuai oracle baseline/DBC. Jangan memakai satu DB yang sudah dimutasi versi pertama sebagai input versi kedua.
- G6: memori di bawah 256M selama 24 jam beban simulasi.
- Cutover: snapshot-worker tidak punya flag enable di v2, jadi cutover = hentikan proses PM2 lama lalu nyalakan baru (R-28).
```
**Gerbang fase:** berjalan berdampingan 3 hari pada database bayangan, tanpa selisih tak terjelaskan.

### Fase 2 - `projection-worker` dan `ops-worker`
```
TUGAS 2.1 - Projection worker
- Baca utuh: worker-projection.ts, lib/projection/{index,single,classify-validation}.ts, dan pemanggil. Antrian permintaan: tabel projection_request + Redis pub/sub PROJECTION_REQUEST_CHANNEL + debounce projection:debounce (30 dtk, di-set data-worker).
- Kontrak Field: pemetaan setiap kolom ticket_raw ke ticket (nama, sumber, kondisi). Kolom generated (operational_bucket, kpi_seg) TIDAK ditulis (R-30). Perhatikan status_manja, aturan flag, guard staleness.
- Pertahankan: PROJECTION_BATCH_SIZE, WRITE_CHUNK_SIZE, transaksi 120 dtk, cooldown ticket gagal, full scan terjadwal, serta KI-10, KI-11, KI-17 (dicatat, tidak diperbaiki).
- G4: replay ticket_raw identik pada dua state terisolasi sesuai 5.2; bandingkan ticket, checkpoint, status gagal, projection_request dan efek samping. Generated/default waktu mengikuti kontrak.

TUGAS 2.2 - Ops worker
- Prasyarat: core contract dan parity auto-assign/tech-events/cleanup yang dipakai sudah siap. Cron yang belum siap tidak dinyalakan. Cutover parsial membutuhkan saklar per cron yang disetujui.
- Baca utuh: worker.ts dan 12 cron (tech-events, gauge-reconcile, reguler-webhook, auto-assign, dlq-retry, health, reconciliation, reset stale assigned, bridge-DLQ, tech-event-cleanup, log-retention, transient-cleanup), pelanggan pub/sub worker:tech-events:request, serta modul yang dipanggil: app/libs/integrations/{dispatchTechEvents,dispatchRegulerWebhook,techEvents}.ts, lib/dlq, lib/ingestion (retryQuarantinedItems), lib/monitoring/health, lib/observability/notifier.
- runSync/runPush TIDAK dijadwalkan: jangan port, tanyakan (R-32, KI-13).
- Retensi dan cleanup: tulis ulang tanpa interpolasi string. Nama tabel dari whitelist lewat sql.identifier, nilai terikat. Uji bahwa batas hari dan ukuran chunk (500, jeda 100 ms) identik. SET SESSION hanya pada koneksi khusus (KI-19).
- G4: jalankan retensi pada dua DB bayangan dengan clock/state awal identik sesuai 5.2; bandingkan baris yang terhapus, batch, checkpoint dan efek samping.

TUGAS 2.3 - Audit purge
- Baca utuh: scripts/audit-log-purge.ts dan purgeAuditLogs (audit-log.query.ts). Port sebagai job sekali jalan; jadwal 03:00 dipertahankan (KI-11).
```

### Fase 3 - `data-worker` (ingestion + status-refresh)
**Peringatan:** modul ini terkait keluhan ticket hilang. Audit ekstra ketat. **Ruang lingkup port: ingestion dan status-refresh.** Active-refresh dimatikan di produksi dan tidak diport (R-32); hanya `resetAllStaleAssignedTickets` yang tetap hidup (Fase 2).
```
TUGAS 3.1 - Audit dan dokumentasi (tanpa kode)
- Baca utuh: worker-data.ts, lib/ingestion/{index,normalizer,conflict-resolver,single-incident-ingestion}.ts, lib/status-refresh.ts (termasuk ownership guard ±690-720 dan kandidat hot/safety), lib/external-db/{connection,types}.ts, lib/external-db/qosmic-bridge/status-refresh-adapter.ts, lib/distributed-lock.ts, lib/workers/task-runner.ts. Baca juga tiga worker legacy hanya untuk memahami sejarah lock.
- Jawab di Catatan Perilaku: (a) lock apa yang dipegang tiap task dan berapa lama (data_worker 2100 dtk; KI-14); (b) SELURUH penulis ticket_raw dan bagaimana mereka dicegah bertabrakan hari ini (KI-01); (c) bagaimana baris yang sync_date-nya kemarin dan muncul lagi hari ini diperbarui; (d) guard kepemilikan sumber (bridge vs piloting, mode nossaDown) per kolom; (e) bagaimana status-refresh memilih kandidat dan memakai PILOTING/BRIDGE batch; (f) aturan cursor/checkpoint (INGESTION_CURSOR_STALE_HOURS).
- Verifikasi di log produksi (oleh PakBreng): hitung "Deadlock found"/1213 dan "skipped" per hari, untuk menguji hipotesis keluhan ticket hilang.
- **Prasyarat tugas ini: jawaban OQ-01** (siapa yang menjadwalkan ingestion `nossa`/`nossa_closed`, KI-23) dan OQ-04 (interval nyata, KI-20). Tanpa itu, Catatan Perilaku data-worker tidak lengkap.
- BERHENTI setelah dokumen selesai dan minta persetujuan PakBreng sebelum menulis kode.

TUGAS 3.2 - Port dengan parity
- Pertahankan semantik ON DUPLICATE KEY UPDATE per kolom (termasuk IF nilai null dan guard sourceTable), transaksi serta ownership. Audit SQL/parameter sesuai R-16; bentuk string tidak wajib identik. Kolom generated tidak ditulis (R-30).
- Port perilaku lock apa adanya (KI-01, KI-14). Perbaikan desain lock adalah tugas terpisah setelah parity.
- G4: replay input nossa/nossa_closed/piloting pada state awal identik yang terisolasi sesuai 5.2; bandingkan ticket_raw per kolom, sync_date/synced_at, checkpoint, quarantine dan efek samping.
- G5: simulasi ingestion dan status-refresh berjalan bersamaan, catat berapa kali task di-skip dan jumlah deadlock.
- Cutover: matikan INGESTION_ENABLED/STATUS_REFRESH_ENABLED (atau DATA_WORKER_ENABLED) di v2 tepat sebelum menyalakan v3 (R-28).
```

### Fase 4 - `bridge-worker` (paling kritis)
```
TUGAS 4.1 - Baca dan dokumentasi
- Baca utuh: worker-bridge.ts, lib/external-db/qosmic-bridge/{bridge-queue,queue,client,nossa,status-refresh-adapter,window-planner,types}.ts, lib/distributed-lock.ts.
- Kontrak Field: queue/jobId/payload, dedup, prioritas dan concurrency aktual per queue (sumber: interactive 2, ingestion 1, backfill 1; verifikasi pemakaian env BULLMQ_CONCURRENCY). Limiter total 20 dengan pembagian config efektif (repository backfill 2, default client 6), retry/health/circuit, flag per job dan kill_timeout 120000. Pisahkan interval konfigurasi dari interval nyata KI-20. Uji semua versi/proses berbagi budget; local fallback saat Redis mati tidak otomatis menjaga kuota global tanpa uji multiproses.
TUGAS 4.2 - Port
- Jangan menjalankan consumer lama dan baru sebagai dua pemilik aktif fungsi/queue produksi yang sama. Uji memakai Redis/mock terpisah. Cutover dapat mempertahankan queue sementara dengan satu consumer kompatibel atau mengalihkan queue bersama seluruh producer; pilih dan uji kontrak 12.3. Jangan meninggalkan producer Fase 3/search menulis ke queue tanpa consumer.
- Token QOSMIC hanya dari env; tidak ada di kode, log, atau laporan (R-17).
- G6: rate limit tidak terlampaui (penghitung permintaan ke mock QOSMIC).
```

### Fase 5 - Lintas-modul API dan data referensi
```
TUGAS 5.0 - Lintas-modul (sebelum endpoint bisnis apa pun)
- Baca utuh dan buat Catatan Perilaku untuk: proxy.ts (silent refresh, role guard, whitelist helpdesk, Cache-Control per path, correlation id), server.ts (boot, SSE Redis, health check, shutdown, KI-16), app/libs/{auth,protectApi,internalRouteAuth,request-security,apiError,upload,roles,rolesUtil}.ts, lib/{api-rate-limit,ratelimit,rateLimitMiddleware,rate-limit-identifiers}.ts, lib/auth/login-captcha.ts, lib/sql/{query-gate,max-execution-time}.ts, lib/cache.ts (getOrSetCache, getOrSetCacheSwr) + lib/cache/scope-key.ts, app/libs/{sseBroadcast,dbHealthCheck}.ts, lib/sse-redis.ts, api/files/[...path]/route.ts, api/health.
- Implementasi: verifikasi token (v2 tetap menerbitkan), guard role, header keamanan (nilai v2 saat ini, R-20), rate limit per namespace, gate konkurensi query, cache SWR dengan prefiks v3:, hub SSE, route files dengan UPLOADS_ROOT yang sama (R-29), health.
- G7: uji RBAC tiap role, header, rate limit, path traversal, token kedaluwarsa dan silent refresh lintas dua aplikasi.

TUGAS 5.1 - Data referensi
- Baca utuh route lama dan helper scoping (getWorkzonesForUser, getBranchesForUser, resolveBranchScope): area, region, roles, workzone, branch/options, sa, technicians (daftar), kpi-targets.
- Kontrak Field per endpoint (6.2). Pertahankan header cache dari 2.2.
- G4 dengan setiap role dan kombinasi scope.
```

### Fase 6 - API Ticket, Dashboard, Clustering
```
- Satu alur terverifikasi per tugas. Gunakan seluruh feature matrix, termasuk claim/pickup/assign/unassign, close/bypass/reopen, update/manual/bulk, evidence/location/RCA, user/password/scope, attendance/gate/checkout, manhours/bobot/performance/ekspor, clustering dan auto-assign. Tentukan urutan dari dependency kontrak; daftar contoh bukan batas cakupan.
- Layanan "daily-ticket" tersebar di daily-ticket-helpers (1125), daily-ticket-table (911), daily-ticket-stats (690), daily-ticket-where (537), daily-ticket-kpi-matrix (446), kpi-bucket-sql (226), ticket-buckets (230): baca SEMUANYA sebelum menyentuh satu pun, lalu pecah per fungsi.
- Inventaris query mentah diturunkan dari commit sumber, bukan angka perkiraan lama. Fragmen string menjadi SQL Drizzle yang bisa disusun dengan parameter terikat (R-15). Audit SQL/parameter dan rencana eksekusi sesuai R-16; bentuk string tidak wajib identik. FULLTEXT dan aturan hasil tetap dijaga (R-30).
- Cache: key berversi (REKAP_WORKORDER_CACHE_VERSION v28) tetap dengan prefiks v3: selama uji berdampingan. Jaga SWR dan stampede guard (CACHE_COMPUTE_CONCURRENCY=6).
- Wajib G4 untuk kombinasi Branch/Workzone dan seluruh role/scope; SQL dinilai secara semantik, output/state/efek samping menurut oracle baseline atau delta DBC.
- closeTicket: jaga atomicity transaksi (update ticket, assignment history, status log, activity log, tech event, upsert service_location + history).
- Rekap workorder: port perilaku lama dulu. Pengurangan ±12 query menjadi 1-2 adalah tugas terpisah (KI-02) setelah parity.
- SSE: kontrak event tickets/events dan clustering/auto-assign sama persis dengan klien lama.
```

### Fase 7 - API War Map, KML, Geotagging, Network Intelligence, Integrasi
```
- Baca utuh: api/war-map/** (10 rute), lib/kml/parser.ts (app/libs/kml), service_location/history, kml_layer/sublayer/feature, import-tiket/*, notifications, push/fcm-token (firebase-admin), integrations/*, nossa, sync.
- Pertahankan: bbox query, cache 15 detik, rate limit 120/menit, normalisasi warna ODC/ODP/kabel, parser dual-mode (key:value untuk kabel, deskripsi mentah untuk ODC/ODP), nonaktifkan resolusi entitas eksternal XML (anti-XXE).
- RBAC: teknisi hanya baca. Endpoint preview/run/PATCH/DELETE KML hanya admin/superadmin/super_admin. Helpdesk hanya Tools index, War Map, dan Import KML (kontrak 2.2).
- api/push dan api/sync (Google Sheets) belum terbukti aktif: tanyakan sebelum port (R-32).
```

### Fase 8 - Frontend pilot (satu halaman ringan lintas role)
```
- Pilih satu halaman teknisi dan satu halaman admin berisiko rendah. Bangun layout dasar SvelteKit, hooks.server.ts yang meniru proxy.ts (A-09), tema gelap/terang, komponen bersama.
- Uji Nginx path routing dan sesi lintas dua aplikasi (login di lama, buka halaman baru tanpa login ulang, dan sebaliknya; silent refresh; cookie token terpasang pada redirect).
- Putuskan pustaka UI lewat ADR (A-07).
```

### Fase 9 - Frontend Teknisi (paling sensitif UX)
```
- Baca utuh dan buat Catatan Perilaku untuk: TeknisiDashboard, TicketDetailModal, ModalFooter (canClose enam kondisi, getCloseContent), AddressEditor, DeviceEditor, LocationTagger (state machine idle/confirm/editing/filled, pemindai QR), RcaSuggestionChips + useRcaSuggestions, CompletionChecklist, teknisi/join, useTicketEvents (SSE).
- Port perilaku apa adanya. Redesain closing-ticket adalah tugas terpisah di bawah flag; di v2 flag-nya NEXT_PUBLIC_TEKNISI_CLOSING_REDESIGN_ENABLED=true. Tentukan dari kode mana yang aktif, lalu port yang aktif.
- G8: uji dengan teknisi nyata di lapangan sebelum cutover.
```

### Fase 10 - Frontend Admin, Helpdesk, Superadmin
```
- Modul besar dipecah per alur/halaman dari feature matrix: seluruh 31 halaman admin, 7 teknisi, 3 helpdesk, 4 superadmin serta login/register/root. Sertakan profil/password, attendance gate, manhours/performa/ekspor, pengguna/role/scope, QR tim, tools/import, audit dan monitoring. Setiap halaman ditautkan ke method API dan acceptance criteria; jangan memakai daftar contoh sebagai cakupan final.
- Konsolidasi tiga page shell rekap-workorder dikerjakan sebagai tugas terpisah dan diuji untuk ketiga role (A-06).
- Pada fase ini penerbitan token (api/auth/*) boleh dipindah, sebagai tugas terakhir dan terpisah.
```

### Fase 11 - Kanal Android/WebView (Bersyarat)

```text
- OQ-12 menentukan apakah APK/WebView merupakan kanal yang sudah ada atau tambahan baru.
- Jika kanal lama: inventaris repository/artefak, bridge/native API, deep link, izin dan kontrak FCM; masukkan parity yang relevan sebelum kanal tersebut dialihkan.
- Jika APK baru: di luar rewrite parity, hanya dikerjakan setelah keputusan scope/spec tersendiri. Bukan syarat selesai rewrite web tanpa keputusan pemilik.
- Dukungan kamera/GPS/QR dan jaringan buruk pada web teknisi tetap wajib di Fase 9, terlepas dari keputusan APK.
- Jika WebView masuk cakupan, uji izin native dan Permissions-Policy, navigasi/sesi, GPS, QR/barcode serta FCM pada perangkat Android yang ditetapkan.
```

### Fase 12 - Cutover final dan decommission
```
- Hanya untuk modul dalam cakupan yang sudah lulus G8 dan memenuhi scorecard. Pisahkan milestone pengalihan trafik dari penghapusan kode: worker memerlukan observasi >=14 hari, API/UI >=30 hari sejak cutover terakhir yang stabil sebelum pensiun (15.3). Rollback/insiden terkait mengulang masa observasi unit terdampak.
- Skrip operasional yang diputuskan "diport" di docs/ops-scripts.md sudah tersedia di v3 sebelum v2 dimatikan.
- Pemilik menjalankan rotasi secret sebagai rencana terpisah: bedakan token upstream, akses/refresh dan token undangan/tim, koordinasikan semua producer/verifier lintas versi serta dampak logout/QR. Jangan merotasi satu sisi saat coexistence. Arsip/tag rollback dibuat sebelum Jalur R; hapus flag/prefiks/adapter hanya setelah semua pemakai berhenti dan kontrak penggantinya diuji. DDL/data tetap keputusan terpisah pemilik.
```

---

## 12. Rollout dan Rollback

Perpindahan dilakukan per fungsi/alur yang sudah memiliki kontrak, bukan sekadar per proses. Pada produksi hanya satu implementasi aktif untuk fungsi yang sama; fungsi berbeda yang menulis sumber daya sama tetap memerlukan ownership dan kebijakan kontensi. Pilot tidak mengirim notifikasi atau menulis data produksi ganda.

- Pilih routing per path/modul sebagai bentuk awal yang paling mudah dibuktikan. Canary pengguna/workzone hanya boleh dipakai setelah mekanisme cohort 12.4 siap; Nginx routing path saja belum membatasi pengguna.
- Setiap modul memiliki flag penyalaan yang default mati sebelum cutover. Flag keamanan mengikuti R-22; rollback tidak boleh menghidupkan celah aktif yang terbukti.
- Uji rollback sebelum cutover pada state yang sudah berubah, bukan hanya startup bersih. Pastikan versi lama dapat membaca hasil tulis baru, checkpoint, job/outbox dan file yang dihasilkan.
- Ambang rollback berasal dari scorecard: lonjakan error/timeout, lag/backlog, kebocoran scope, mismatch data, atau resource melewati batas. Catat pemilik, waktu deteksi dan batas waktu mengambil tindakan.
- Mengembalikan upstream adalah satu langkah rollback API/UI. Drain queue, pemulihan pemilik writer, kompatibilitas data dan rekonsiliasi juga wajib bila terdampak. Jangan mengembalikan snapshot DB produksi sebagai rollback rutin karena dapat menghapus transaksi sah.

### 12.1 Tabel Saklar Cutover Worker

Tabel berikut adalah kandidat berdasarkan repository. Verifikasi efek flag, kebutuhan restart dan konfigurasi efektif pada Fase 0.8 sebelum dipakai.

| Fungsi | Cara mematikan v2 | Cara menyalakan v3 | Syarat tambahan |
|---|---|---|---|
| Ingestion piloting | INGESTION_ENABLED=false di data-worker | V3_INGESTION_ENABLED=true | Ownership per sumber/kolom dan semua writer dipetakan |
| Status-refresh | STATUS_REFRESH_ENABLED=false | V3_STATUS_REFRESH_ENABLED=true | Writer lintas fungsi dan seeding/checkpoint diuji |
| Seluruh data-worker | DATA_WORKER_ENABLED=false | Start fungsi v3 yang siap | Hentikan siklus aktif secara terkontrol; jangan meninggalkan producer |
| Bridge | Stop consumer lama; kill_timeout 120 detik | Start consumer v3 sesudah drain/kontrak siap | Queue tetap kompatibel sementara atau producer+queue dialihkan bersama, dengan satu consumer owner |
| Projection | PROJECTION_ENABLED=false | V3_PROJECTION_ENABLED=true | Satu pengambil projection_request; pub/sub/debounce tidak kehilangan permintaan |
| Snapshot | Stop proses snapshot lama | Start snapshot v3 | Tidak ada flag enable sumber yang ditemukan; verifikasi runtime |
| Ops-cron | CRON_ENABLED=false untuk seluruh cron | Per-cron flag v3 | Alih sebagian cron memerlukan saklar lama yang disetujui lebih dulu; core service dependency siap |
| Audit purge | Matikan jadwal PM2 lama | Jadwal v3 | Pastikan tidak ada job purge aktif atau jadwal eksternal ganda |

### 12.2 Pilot, Cutover, Observasi, dan Pensiun

1. Pilot bayangan: dua DB snapshot identik, Redis/file/mock terisolasi, minimal 3 hari untuk worker atau 1 minggu API/UI. Ini membuktikan parity/beban tanpa dua penulis produksi.
2. Siap-cutover: seluruh gerbang tahap, scorecard, kontrak transisi, UAT dan rollback disetujui. Verifikasi jadwal serta operasi yang sedang aktif.
3. Cutover: alihkan satu pemilik menggunakan 12.1/12.3 di jendela yang disepakati; amati metrik dan rekonsiliasi.
4. Observasi produksi dimulai saat cutover stabil. Checkpoint pemantauan awal 3 hari worker/1 minggu API/UI bukan izin pensiun. Perpindahan unit berikutnya menunggu bukti unit sebelumnya stabil dan kapasitas coexistence aman.
5. Pensiun/hapus unit hanya setelah >=14 hari worker atau >=30 hari API/UI tanpa rollback/insiden terkait, serta seluruh 15.3 terpenuhi. Durasi bukan pengganti bukti tidak ada pemanggil/trafik dan approval manifes.

### 12.3 Kontrak Transisi Queue, Cache, dan Penulis Data

Buat `docs/transition-contract.md` sebelum port yang menyentuh batas antarversi. Setiap baris memuat nama sumber daya, producer/pemanggil, consumer/pembaca, pemilik lama/baru, schema/version payload, namespace/TTL, dedup/idempotensi, policy error, urutan alih, observasi dan rollback.

| Sumber daya | Kontrak minimum | Bukti sebelum cutover |
|---|---|---|
| BullMQ bridge interactive/ingestion/backfill | Semua producer, payload/jobId, QueueEvents, retry/delayed/failed, satu consumer owner | Producer v2 ke consumer v3 dan sebaliknya jika coexistence memerlukannya; waitUntilFinished dan dedup tetap bekerja |
| projection_request + pub/sub/debounce | Durable request vs sinyal, satu pengambil, checkpoint dan retry | Restart/subscriber terlambat tidak kehilangan kerja; tidak ada konsumsi ganda |
| Cache ticket/dashboard/teknisi/War Map | Namespace, format/nilai versi, scope key, TTL/SWR dan pemicu invalidasi dari kedua versi | Mutasi v2 dibaca v3 dan sebaliknya dalam batas stale disetujui; tidak ada data lintas role/scope |
| Lock/fencing/ownership | Resource bersama, key/protokol Lua, TTL/renewal, pembatalan dan enforcement penulis | Dua pihak tidak sama-sama menganggap pemilik; lock uji terisolasi; kehilangan Redis/lock diuji |
| Limiter/health QOSMIC | Total upstream bersama, budget job dari config efektif, health TTL dan failover | Semua versi/proses/retry/probe/fallback termasuk hitungan; Redis outage tidak menyebabkan klaim batas global palsu |
| ticket_raw/ticket dan outbox | Owner per sumber/kolom, aturan update manual, transaksi, urutan tulis dan retry | Import/search/refresh/ingestion bersamaan tidak merusak data; replay dan rollback diuji |
| SSE, notifikasi dan uploads | Format event, cakupan, dedup, invalidasi, akses URL/file dan kepemilikan kirim | Tidak ada pengiriman ganda nyata; URL lama tetap sesuai kontrak akses; UI lama/baru menerima perubahan |

**Pilihan queue:** (A) pertahankan nama/payload kompatibel sementara dengan satu consumer aktif dan adapter bertanggal pensiun; atau (B) pisahkan queue dan alihkan semua producer serta state job secara terencana. Pemisahan queue uji tetap wajib. Pilihan diputuskan per queue melalui ADR/transisi, bukan diubah diam-diam oleh fase consumer.

**Urutan alih queue/writer:** hentikan enqueue terkait atau alihkan ke jalur tahan yang disepakati; tunggu job/siklus aktif; catat waiting/delayed/failed, checkpoint dan owner; alihkan producer/consumer/QueueEvents sesuai kontrak; nyalakan satu pemilik; replay/reconcile; periksa backlog, lag dan duplikasi. Jika drain melewati batas, batalkan atau rollback sesuai rencana, bukan memaksa hapus job/lock. Job tertunda/gagal tidak boleh dilupakan.

**Invalidasi cache:** prefiks `v3:` saja tidak menyelesaikan konsistensi. Invalidator v2 saat ini menghapus pola tanpa prefiks tersebut. Tetapkan jembatan invalidasi/event untuk kedua namespace atau TTL/batas stale yang disetujui dan diuji. Perubahan v2 yang diperlukan dikerjakan melalui tugas sumber terpisah berizin. Jangan mengklaim konsisten sebelum jalur mutasi dari kedua sisi terbukti.

**Matriks writer:** untuk ingestion, bridge search/refresh/backfill, status-refresh, import, live-refresh, projection dan update manual, catat tabel/kunci baris/kolom yang boleh ditulis, owner sumber, transaksi/lock, nilai null, staleness dan konflik. Satu pemilik per fungsi tidak otomatis menyelesaikan konflik antar-fungsi.

### 12.4 Routing, Cohort dan Sesi Lintas Aplikasi

- Routing path/modul harus mempertahankan `_next/*`, aset/build SvelteKit, file/public, API belum pindah, redirect dan URL langsung. Build/deploy tidak menyalin uploads produksi.
- Jika memilih canary pengguna/workzone, cohort ditentukan server dari identitas tepercaya dan konsisten untuk halaman, API, request SSR, SSE/reconnect serta navigasi. Header publik dari klien tidak boleh menjadi dasar menaikkan akses. Cache tidak boleh mencampur cohort/role/scope.
- `hooks.server.ts` menjaga navigasi dan silent refresh; API tetap memverifikasi otorisasi sendiri. Request SSR ke API meneruskan cookie/header tepercaya yang diperlukan; cookie baru diteruskan ke browser pada respons/redirect yang benar. Uji origin/CSRF, expiry, refresh bersamaan, logout dan perubahan role.
- Uji navigasi v2 ke v3 dan balik, refresh/deep link, return URL, reload setelah deploy, aset kedua framework, dua tab/cohort, SSE di latar belakang, serta rollback routing. Penerbit token tetap v2 sampai kontrak pemindahannya siap.
- Pemilik deploy menyimpan konfigurasi upstream sebelumnya dan prosedur reload/rollback. Dokumen ini tidak memberi agent izin mengubah Nginx/PM2 produksi.

---

## 13. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Agent melenceng dari aturan | Lampiran A di `AGENTS.md`, Kondisi Berhenti, laporan berbukti, review PakBreng per fase |
| **Skala jauh lebih besar dari perkiraan** (156 rute, ±123 ribu baris, 45 halaman) | Strangler per modul, frontend paling akhir, berhenti di fase mana pun sah, jangan menjanjikan tenggat sebelum Fase 0-2 selesai dan ada data kecepatan nyata |
| Nuansa bisnis hilang saat tulis ulang | R-04..R-06, Catatan Perilaku, G4 parity dengan fixture kasus tepi |
| **Tidak ada suite uji di v2** | Harness HTTP/state/efek samping dan runner worker terisolasi (5.2); dump anonim serta fixture sintetis berlabel |
| **Waktu WIB tersimpan "apa adanya", kolom Timestamp, BigInt/Decimal** | R-27, R-31, ADR-002, uji roundtrip dua arah (Fase 0.6) |
| **Kolom generated, FULLTEXT, indeks khusus hilang dari skema Drizzle** | R-30, koreksi dengan `SHOW CREATE TABLE`, G9 pemeriksa selisih skema |
| **Skema berevolusi di v2 selama rewrite berjalan** | Prisma tetap pemilik DDL (R-13), G9 dijalankan tiap tugas yang menyentuh DB |
| **Dua penulis `ticket_raw`** (deadlock 1213) | R-28, tabel saklar 12.1, satu implementasi aktif per fungsi |
| **Key Redis bertabrakan** (cache, lock, BullMQ) | R-28 dan 12.3: namespace uji terisolasi, protokol lock produksi interoperabel, satu consumer owner, invalidasi lintas versi |
| **Koneksi MySQL habis** saat dua sistem hidup | Anggaran pool (Bagian 7), batas 80% `max_connections`, pool awal v3 setengah dari v2 |
| **SQL dirakit dari string dan terbawa ke v3** | R-15, inventaris kelas A/B/C (Fase 0.5), uji injeksi |
| **Kode mati ikut diport** | R-32, Kondisi Berhenti poin 11 |
| **Uploads 49 GB terduplikasi atau salah path** | R-29, `UPLOADS_ROOT` satu sumber |
| Bun tidak kompatibel dengan ioredis/BullMQ/firebase-admin/sharp | Fase 0.2 sebagai gerbang go/no-go; bridge worker dikerjakan paling akhir di antara worker |
| Semantik SQL atau transaksi berubah saat pindah ORM | R-16 dan G4: SQL/parameter/plan diaudit, hasil/state/atomicity dibuktikan; string SQL tidak harus identik |
| Sesi tidak konsisten antar dua aplikasi | Kontrak Sesi 2.2, penerbitan token tetap di v2 sampai akhir, uji lintas aplikasi di Fase 8 |
| Rahasia bocor | R-17, `.env`, rotasi token sebelum produksi |
| Scope creep dan feature drift | R-07..R-10, feature matrix 1.4, ID acceptance/tes, DBC dan keputusan fitur Ditahan/Tidak diport |
| Konteks governance hilang di clone lain | 0.4: dokumen tracked, AGENTS digabung, checkpoint memuat versi/commit |
| Rewrite tidak memberi peningkatan nyata | Scorecard Bagian 7, delta positif disetujui dan perbandingan workload/resource setara |
| Gaya kode/UI mengaburkan pekerjaan pengguna | R-53..R-64, design-contract dan G13; baseline visual dipertahankan sampai perubahan disetujui |
| **Kode lama dan baru bertumpuk dan membingungkan** | Bagian 15: migration-map (R-45), larangan versi ganda (R-46), Jalur R dengan syarat dan manifes, G12 |
| **Penghapusan terlalu cepat menghilangkan rollback** | Syarat 15.3 (observasi 14/30 hari, tag git, arsip, persetujuan), urutan 15.5, DDL/uploads/backup tidak pernah dihapus agent |
| **Perbaikan merusak paritas atau mengubah angka diam-diam** | Kelas P/F1/F2/S, DBC, uji merah dulu, bukti hasil identik (R-34..R-41) |
| **Agent melaporkan bug palsu atau optimasi tanpa bukti** | Standar bukti, wajib mencoba membantah, konfidensi, angka sebelum/sesudah (R-36, R-38) |
| **Celah keamanan v2 menunggu rewrite berbulan-bulan** | 14.9: tindakan segera oleh PakBreng, pelaporan segera S0/S1 (Bagian 8 poin 14) |
| Sistem lama tetap butuh maintenance | Perbaikan darurat dilakukan di `dompis_v2` oleh PakBreng dan dicatat di KI agar ikut diport; G9 menangkap perubahan skema |

---

## 14. Audit, Perbaikan, Optimasi, dan Perburuan Bug

Rewrite adalah satu-satunya kesempatan murah untuk membersihkan masalah lama, karena setiap modul dibaca penuh. Karena itu agent **wajib** mencari bug, query lambat, dan celah keamanan pada setiap modul, bukan hanya memindahkannya. Tetapi perbaikan tidak boleh merusak paritas dan tidak boleh mengubah perilaku yang terlihat pengguna tanpa persetujuan. Bagian ini mengatur caranya.

### 14.1 Kelas Perubahan

| Kelas | Arti | Contoh | Siapa menyetujui |
|---|---|---|---|
| **P** Paritas | Kontrak bisnis dan efek samping identik dengan baseline yang dipin, kecuali S yang wajib aman/nonaktif | Port biasa | Gerbang tahap P di 5.3; belum otomatis Siap-cutover |
| **F1** Perbaikan tak terlihat | Hasil/state bisnis tetap identik pada cakupan uji, kinerja/sumber daya atau mekanisme internal membaik | Kurangi N+1, batching setara, bersihkan kebocoran timer | Gerbang F, bukti hasil/efek samping dan angka relevan; tidak perlu persetujuan per butir |
| **F2** Perbaikan mengubah perilaku | Keluaran, angka, urutan, atau alur pengguna berubah | Perbaiki backoff scheduler (interval berubah), batasi SSE per cakupan, refresh token membaca DB | **Persetujuan tertulis PakBreng per butir** lewat DBC (14.5) |
| **S** Keamanan | Celah yang bisa dieksploitasi; tandai pula dampak kontraknya | Register berprivilege tanpa izin, akses bukti tanpa cakupan | Lapor segera untuk S0/S1, DBC bila kontrak berubah; aman atau jalur nonaktif sebelum cutover |

### 14.2 Alur per Modul: Port → Hunt → Fix → Verifikasi

```
P  Port + parity dan gerbang tahap P (5.3) -> commit "port(...)"; belum Siap-cutover
H  Hunt + diagnostik (14.3/14.4) -> laporan + reproducer merah terdaftar; suite wajib tetap hijau
F  Fix per temuan, satu temuan satu commit            -> commit "fix(...)" atau "perf(...)"
V  Verifikasi gerbang checkpoint tahap F/cutover + kontrak fitur/DBC + scorecard/transisi
```
- Jalur H berjalan **selalu**, walaupun tidak ada temuan: laporan memuat daftar cakupan (checklist 14.3 dan 14.4) dengan status centang atau N/A beralasan. "Tidak ada temuan" tanpa daftar cakupan dianggap H belum dikerjakan.
- Urutan H dan F tidak boleh mendahului P kecuali kelas **S**. Alasan: tanpa paritas terbukti, tidak ada patokan untuk menilai apakah perbaikan mengubah sesuatu.
- Cutover tidak boleh dilakukan jika jalur yang akan aktif masih memiliki kerentanan terbukti yang dapat dieksploitasi. Temuan penghalang kontrak/scorecard juga wajib ditutup. Temuan lain hanya boleh diterima/ditunda dengan pemilik, mitigasi, tenggat dan alasan tertulis; status keputusan bukan pengganti perbaikan keamanan yang wajib.

### 14.3 Protokol Perburuan Bug (Jalur H)

**Standar bukti.** Setiap temuan wajib memuat: ID (`KI-nn`), kategori (BUG, SEC, PERF, OPS, QUALITY), keparahan (S0 kritis, S1 tinggi, S2 sedang, S3 rendah), `file:baris`, mekanisme, skenario gagal konkret (input → keluaran salah), bukti, konfidensi, dampak, usulan perbaikan, kelas (F1/F2/S), dan nama uji regresi.

**Konfidensi:** `CONFIRMED` = direproduksi oleh uji yang gagal pada kode lama; `PLAUSIBLE` = mekanisme terbaca tetapi belum direproduksi; `REFUTED` = dibantah (agent menemukan penjagaan di tempat lain). Agent **wajib mencoba membantah temuannya sendiri** sebelum melaporkannya: cari penjagaan di pemanggil, middleware, constraint DB, dan konfigurasi. Dilarang melaporkan "bug" tanpa `file:baris` dan mekanisme, dilarang menyatakan "lebih cepat" tanpa angka, dan dilarang menyebut sesuatu CONFIRMED tanpa uji.

**Checklist cakupan.** Tiap butir dicentang atau ditulis N/A dengan alasan.

*Backend dan API*
- [ ] Setiap endpoint: validasi input dengan skema; batas `limit`/halaman; ukuran body; tipe (`1` vs `"1"`)
- [ ] Otorisasi **per objek** (IDOR): matriks role × sumber daya; teknisi tidak boleh mengakses ticket, bukti, atau lokasi milik orang lain
- [ ] *Mass assignment*: field yang boleh dikirim klien dipilih eksplisit (bandingkan KI-25)
- [ ] Race condition: klaim, assign, close ganda, double submit; gunakan transaksi dan update bersyarat (`WHERE status = ...` lalu cek `affectedRows`), bukan baca-lalu-tulis
- [ ] Idempotensi endpoint yang bisa diulang (close ticket, upload bukti, webhook)
- [ ] Pergantian hari WIB (23:59 → 00:01), `jam_expired` null, `service_no` yang muncul kembali, nilai kosong vs null
- [ ] Kebocoran: pesan error internal ke klien, PII atau rahasia di log, header
- [ ] SSRF dan jalur keluar (reverse-geocode, webhook, bridge); path traversal; XXE/ukuran pada KML dan XLSX
- [ ] Sumber daya: timer, stream, koneksi, listener yang tidak dibersihkan; berkas dibaca utuh ke memori (`arrayBuffer`); hasil query tak terbatas
- [ ] Kegagalan dependensi: Redis mati (fail-open atau fail-closed, per fitur, disengaja?), DB timeout, bridge down
- [ ] Rate limit: kunci identitas (KI-32), namespace, batas wajar untuk jalur mahal

*Worker dan pipeline data* (terkait keluhan "ticket tidak ada")
- [ ] Semantik lock: siapa memegang apa, TTL, perpanjangan, apa yang terjadi jika lock hilang di tengah tugas
- [ ] Penjadwal: interval nyata vs konfigurasi (KI-20); tugas fire-and-forget yang durasinya tak terukur
- [ ] Circuit breaker: apakah state bertahan antar siklus (KI-21); apakah error ditelan lalu dicatat sebagai sukses
- [ ] Upsert idempoten; urutan penulisan konsisten untuk menghindari deadlock 1213; retry dengan jitter; ukuran chunk yang bisa pulih (KI-22)
- [ ] `AbortSignal` diteruskan sampai query dan HTTP; shutdown tidak meninggalkan lock
- [ ] **Invarian data**: tulis di Catatan Perilaku (misalnya "setiap `ticket_raw` aktif terproyeksi ke `ticket` dalam N menit", "tidak ada `ticket` open yang `ticket_raw`-nya sudah closed lebih dari N menit") beserta **query pemeriksa read-only** yang dijalankan PakBreng di produksi. Rekonsiliasi harian yang ada hanya membandingkan tabel di `EXTERNAL_TABLE_NAMES` (KI-35)
- [ ] Memori: `Map`/cache modul-level yang tumbuh tanpa batas; hasil query besar dimuat penuh

*Frontend (Svelte)*
- [ ] Efek dan reaktivitas: `$effect` tanpa cleanup, efek yang memicu dirinya sendiri, `$derived` berisi efek samping, state turunan yang basi, reaktivitas dalam pada array besar (marker peta)
- [ ] Pengambilan data: balapan permintaan (batalkan yang lama), fetch ganda SSR+CSR, state loading/kosong/error ada semua, invalidasi setelah mutasi, rollback bila pembaruan optimistis gagal
- [ ] Kirim ganda: tombol close ticket, upload foto; tombol dinonaktifkan dan server idempoten
- [ ] Jaringan buruk (teknisi lapangan): batas waktu, percobaan ulang upload, status tertunda jelas, tidak ada kehilangan isian formulir
- [ ] Peta: `map.remove()` saat pindah halaman, debounce bbox, jumlah marker, kluster
- [ ] SSE: **satu koneksi bersama per tab** (di v2 tiap pemanggil `useTicketEvents` dan `WarMapClient` membuka sendiri, KI-43), backoff, putus saat tab/WebView di latar belakang
- [ ] Izin perangkat: kamera dan GPS ditolak, HTTP vs HTTPS, WebView APK (R-20)
- [ ] Keamanan: tidak ada `{@html}` dari data pengguna; token tidak terbaca JS; parameter redirect login tidak terbuka
- [ ] Tampilan: lebar 360 px, target sentuh ≥ 44 px, kontras, teks Bahasa Indonesia, tanggal WIB
- [ ] Bobot: ukuran bundle awal, pemuatan malas untuk peta dan grafik, virtualisasi daftar panjang; ukur di perangkat Android kelas menengah-bawah
- [ ] Penanganan error: `+error.svelte` per area, pesan ramah, tidak menampilkan jejak teknis

### 14.4 Protokol Audit Query dan Optimasi

Berlaku untuk setiap query Prisma dan mentah yang diport. Tidak ada optimasi tanpa ukuran (R-38).

| Langkah | Isi | Keluaran |
|---|---|---|
| Q1 Inventaris | Daftar semua query modul (ORM dan mentah) dengan `file:baris`, tabel, dan pemanggilnya | `docs/hunt/<modul>.md` bagian Query |
| Q2 Tangkap | SQL dan parameter disensor serta jumlah query/request per fixture; kaitkan dengan role/scope dan commit | Tabel endpoint, role, jumlah query, total ms |
| Q3 EXPLAIN | `EXPLAIN` (dan `EXPLAIN ANALYZE` bila MySQL ≥ 8.0.18; versi dicatat) pada DB dev berisi dump anonim **seukuran produksi** | Kolom `type`, `key`, `rows`, `filtered`, `Extra` |
| Q4 Temukan | Pola buruk (di bawah) | Daftar temuan PERF |
| Q5 Hipotesis | Satu hipotesis, satu perubahan | Rencana |
| Q6 Bukti identik | Untuk F1 banding hasil bertipe ketat, urutan yang bermakna, state dan efek samping. F2/S hanya menerima delta DBC | Tabel banding dan oracle tes |
| Q7 Ukur | Minimal 30 pengulangan untuk eksperimen awal, cold/warm dan ukuran data tercatat; benchmark final memakai workload/durasi/sampel memadai sesuai 7.1 dan melaporkan variasi | p50/p95 serta p99 bila sampel memadai; sebelum/sesudah |
| Q8 Putuskan | Simpan hanya bila lebih baik secara terukur dan tidak menambah beban tulis. Bila tidak, **buang** perubahan dan catat hasilnya | Keputusan |

**Pola yang dicari (Q4):** N+1 (jumlah query tumbuh bersama jumlah baris); `findMany` tanpa `take` atau tanpa filter (v2: heuristik 91 dari 184 panggilan, KI-37); `SELECT` semua kolom; `OFFSET` dalam; fungsi pada kolom berindeks (`DATE(col)`, `LOWER(col)`); `LIKE '%x'`; `OR` lintas kolom yang membuang indeks; `IN (subquery)` besar; ketidakcocokan collation/tipe (konversi implisit); `GROUP BY`/`ORDER BY` tanpa indeks (`Using temporary`, `Using filesort`); `COUNT(*)` berulang pada tabel besar; transaksi panjang; urutan penguncian tidak konsisten; upsert satu per satu padahal bisa dibatch; agregasi berat dihitung ulang per request (seharusnya snapshot/cache).

**Anggaran query:** kandidat awal daftar <=3 query, detail <=6, agregasi dari snapshot/cache, maksimum 3 query berat paralel per endpoint. Kalibrasikan dan setujui budget per endpoint sebelum enforcement; query wajib untuk otorisasi/audit tidak boleh dihapus demi angka. P/H mengukur dan mencatat N+1 warisan; F/cutover enforce budget dan tidak menerima pertumbuhan query per baris tanpa alasan algoritmik yang disetujui.

**Kebijakan indeks.** Agent **tidak menjalankan DDL** (R-13, R-40). Usulan indeks (menambah atau membuang) diajukan sebagai dokumen: tabel, kolom, alasan, bukti EXPLAIN, perkiraan dampak tulis, cara rollback. PakBreng menerapkannya lewat migrasi Prisma di v2. Tabel `ticket` sudah 31 indeks dan `ticket_raw` 8 indeks lebar (KI-36): **membuang** indeks yang tidak terpakai sama pentingnya dengan menambah, dan dibuktikan dengan `sys.schema_unused_indexes` / `sys.schema_redundant_indexes` serta statistik pemakaian produksi, bukan dari tebakan.

### 14.5 Perubahan Perilaku Disengaja (DBC) - template

Untuk setiap F2 dan setiap perbaikan S yang menyentuh kontrak 2.2. Disimpan di `docs/dbc/DBC-nn.md`, disetujui PakBreng sebelum kode ditulis.

```
DBC-nn | KI terkait | modul
Perilaku lama (dengan file:baris)  :
Perilaku baru                       :
Alasan dan bukti                    :
Siapa/apa yang terdampak (role, layar, angka, klien lama) :
Kompatibilitas dengan v2 yang hidup bersamaan (kontrak 2.2) :
Daftar delta output/state/efek samping yang diizinkan dan field yang tetap identik :
Oracle baseline, oracle perilaku baru, ID fitur dan ID tes :
Cara menyalakan: flag, default aman, pemilik, syarat pensiun; tidak mengaktifkan celah lama
Uji regresi (merah di kode lama, hijau di kode baru) :
Rollback aman (termasuk data, sesi, queue dan keamanan) :
Metrik sukses, dampak performa dan pemicu rollback :
Keputusan PakBreng: SETUJU / TOLAK / TUNDA   Tanggal (WIB):
```

### 14.6 Daftar Temuan Awal dan Pertanyaan Terbuka

Temuan awal ada di Bagian 6.3 (KI-01..KI-43) dengan status bukti statis. Verifikasi ulang pada commit terkait. OQ-01..OQ-08 membutuhkan bukti runtime/eksternal dari pemilik; perintah berikut hanya bahan pemeriksaan baca-saja yang tidak dijalankan oleh revisi PRD ini. Jangan menyertakan secret/PII dalam jawaban. OQ tambahan menentukan kesiapan dokumen/lingkungan, bukan alasan mengarang keputusan.

| ID | Pertanyaan | Cara memeriksa | Mengapa penting |
|---|---|---|---|
| **OQ-01** | **Siapa yang menjadwalkan ingestion `nossa` dan `nossa_closed` hari ini?** Di kode, job hanya dibuat oleh `processTable` untuk tabel bridge, tetapi data-worker dibatasi `EXTERNAL_TABLE_NAMES=piloting_tickets` dan bridge-worker hanya memproses antrean | `crontab -l` dan menu Cron aaPanel (cari pemanggilan `GET /api/internal/ingestion` dengan `x-cron-secret`); `pm2 logs dompis-data-worker --nostream --lines 3000 \| grep -E "Pushing bridge ingestion job\|cooldown active"`; `redis-cli TTL ingestion:bridge:nossa:cooldown`; SQL baca-saja: `SELECT sourceTable, COUNT(*), MAX(importedAt), MAX(lastSeenAt) FROM ticket_raw GROUP BY sourceTable;` | Bila tidak ada penjadwal, data `nossa` tidak diperbarui otomatis. Ini kandidat penyebab keluhan ticket tidak ada |
| OQ-02 | Apakah `/register` dan `POST /api/auth/register` terjangkau dari internet dan bisa membuat `role_id` 2, 3, 5, atau 6? | Uji di **staging**, bukan produksi | KI-25 |
| OQ-03 | Bagaimana Nginx/aaPanel (dan Cloudflare, bila ada) mengatur `X-Forwarded-For`? | Baca vhost: `proxy_set_header X-Forwarded-For $remote_addr;` atau `$proxy_add_x_forwarded_for`? | KI-32 |
| OQ-04 | Berapa interval nyata data-worker dan snapshot-worker? | Selisih waktu antar log `Data worker cycle complete` dan `Snapshot updated` | KI-20 |
| OQ-05 | `max_connections` dan `Max_used_connections` MySQL | `SHOW VARIABLES LIKE 'max_connections'; SHOW STATUS LIKE 'Max_used_connections';` | Anggaran pool (Bagian 7) |
| OQ-06 | Jumlah baris `service_area` | `SELECT COUNT(*) FROM service_area;` | KI-39 |
| OQ-07 | Apakah `api/push`, `api/sync`, `runSync`, `runPush` (Google Sheets) masih dipakai? | Cek pemanggil eksternal dan log akses 30 hari | R-32, Bagian 15 |
| OQ-08 | Adakah pemicu eksternal ke `/api/internal/*` (`ingestion`, `projection`, `workers`, `metrics`, `health`)? | Cron, uptime monitor, log akses Nginx | Kontrak yang harus diport atau dipensiunkan |


### 14.6.1 Register Keputusan Kesiapan Tambahan

Status keputusan pada revisi 1.8 dibedakan antara persetujuan rencana dan realisasinya. OQ-09/OQ-16 sudah terjawab sebagian melalui 0.7; butir lain tetap memerlukan bukti/keputusan yang disebutkan. Pemilik: PakBreng, dibantu hasil inventaris/spike agent ketika tugasnya diizinkan. Keputusan dicatat tanggal, bukti dan cakupannya; hanya pekerjaan yang bergantung padanya yang diblokir.

| ID | Keputusan/bukti yang diperlukan | Menghalangi sampai tersedia |
|---|---|---|
| OQ-09 | DISETUJUI: lokasi sumber/target/referensi dan commit sesuai 0.7. Target tersedia terpisah, berisi dokumen kanonis dan Git lokal; lingkungan referensi belum disiapkan | Verifikasi lingkungan tetap wajib sebelum scaffold; jangan bertanya ulang mengenai nama/path yang sudah disetujui |
| OQ-10 | Referensi HTTP/runner worker, clock/config uji, dua snapshot DB, Redis/mock/file isolasi dan pelaksana | Parity/roundtrip modul terkait |
| OQ-11 | Baseline terukur, workload, delta positif/ambang absolut scorecard dan toleransi metrik pelindung | Penilaian optimasi, pilot dan cutover modul terkait |
| OQ-12 | APK/WebView kanal lama atau tambahan; repo/artefak dan kontrak native bila ada | Hanya fase Android; parity web/perangkat tetap berjalan |
| OQ-13 | Baseline visual dipertahankan dan daftar perubahan solid/teks yang diizinkan pada design-contract | Perubahan visual di luar port baseline |
| OQ-14 | Strategi queue per sumber daya, semua producer/consumer, invalidasi lintas versi, ownership writer dan routing path/cohort | Implementasi adapter/transisi dan cutover terkait |
| OQ-15 | Config efektif QOSMIC per proses, pembagian kuota, pemicu Nossa, health/failover dan perilaku saat Redis mati | Finalisasi kontrak bridge serta cutover pipeline |
| OQ-16 | DISETUJUI SEBAGIAN: kandidat versi dan kebijakan Git pada 0.7; governance sudah tracked di Git lokal target. Toolchain/peer tambahan, lockfile dan kompatibilitas belum lengkap | Catat kebutuhan tambahan sesuai R-09 sebelum tahap pemakainya; GitHub dihubungkan pemilik |

Jawaban OQ-01/OQ-04/OQ-15 dapat berbagi bukti, tetapi tidak ditutup hanya dari komentar/config repository. Ketidaktersediaan bukti dicatat BLOCKED pada modul, tidak diubah menjadi asumsi produksi.

### 14.7 Target Perburuan per Fase

| Fase | Fokus H (daftar awal; agent menambah) |
|---|---|
| 0 | Baseline `tsc --noEmit` v2 (karena `ignoreBuildErrors: true`), jumlah `any` (280) dan `exhaustive-deps` yang dimatikan (14), EXPLAIN query terberat, jawaban OQ-01..OQ-08 |
| 1 | `scheduleEveryMinutes` (KI-20), `SET SESSION` via pool (KI-19), semantik `cleanupStaleLock` (umur dihitung dari awal lock, bukan perpanjangan terakhir), fencing token yang dibuat tetapi tidak ditegakkan oleh penulis |
| 2 | Reset stale ganda (KI-10), tumpukan 03:00 (KI-11), full scan yang dilewati diam-diam (KI-40), rotasi auto-assign (KI-39), `findMany` tanpa batas di `clusterAutoAssign.service.ts` |
| 3 | Circuit breaker (KI-21), `adaptiveWriteChunkSize` (KI-22), jalur kandidat bridge (KI-24), OQ-01 sebagai prasyarat, invarian data |
| 4 | Konkurensi penulis `ticket_raw` (KI-01), jalur enqueue bergantung env (KI-23), kuota bridge bersama (KI-31) |
| 5 | KI-25..KI-34: register, refresh token, berkas bukti, SSE (cakupan dan duplikasi), heartbeat, rate limit, normalisasi role |
| 6 | N+1 dan `findMany` tanpa batas, rekap workorder (KI-02), indeks (KI-36), IDOR per objek, race pada klaim/close |
| 7 | Ukuran dan struktur KML, XXE, bbox dan cache, RBAC KML |
| 8-10 | Checklist FE 14.3, file raksasa (`WarMapClient` 2822 baris, `SuperadminUsersClient` 2148, `TicketManagementBucketPage` 1768), SSE bersama (KI-43) |
| 11 | Izin WebView, perangkat kelas menengah-bawah, pemakaian baterai oleh SSE |

### 14.8 Prompt Siap Pakai Jalur H dan F

**Prompt H, setelah P/parity atau ketika audit keamanan memang ditugaskan:**

```text
Tugas H modul <ID>, PRD v1.8. Muat Bagian 0, aturan inti, 5.3, 14 dan spec modul.
1. Verifikasi commit sumber, kontrak fitur dan hasil P yang menjadi acuan. Audit S
   dapat mendahului P; jangan mengaktifkan jalur rentan untuk membuktikan parity.
2. Baca penuh source dalam cakupan dan pemanggil relevan. Coba bantah KI lama/baru.
3. Isi checklist 14.3 dan Q1-Q4. Catat SQL/parameter/EXPLAIN disensor.
4. Reproduksi pada referensi terisolasi. Reproducer merah berada di diagnostics/hunt,
   tercatat dalam manifest dan di luar discovery suite wajib yang dikonfigurasi.
   Simpan perintah, expected failure dan exit code. Jangan melemahkan tes yang ada.
5. Tulis docs/hunt/<modul>.md: kategori, severity, mekanisme, file:baris,
   kasus input/state, bukti, confidence, kelas F1/F2/S dan tindak lanjut.
6. G10 memeriksa laporan/manifest; G6/G11 diagnostik; suite wajib tetap hijau.
   S0/S1 segera dilaporkan, F2/S perubahan kontrak memerlukan draf DBC.
7. Jangan memperbaiki implementasi/menjalankan DDL dalam H. Laporan 9.1 dan checkpoint.
```

**Prompt F, satu temuan per tugas:**

```text
Tugas F <KI> modul <ID>, PRD v1.8. Temuan/bukti dan scope sudah tersedia.
Prasyarat: P lulus, kecuali S yang secara eksplisit boleh mendahului P.
Untuk F2/S perubahan kontrak, DBC disetujui; dependensi dan baseline yang perlu siap.
1. Konfirmasi reproducer merah dan oracle lama/baru. Jangan menguji pada produksi.
2. Buat fix kecil. Pindahkan reproducer menjadi regresi wajib; tampilkan hasil hijau.
3. Jalankan gerbang F 5.3. G4 F1 tetap identik; F2/S hanya berbeda sesuai delta DBC.
   Uji kontrak lain, state/efek samping dan kompatibilitas coexistence.
4. Untuk optimasi, bukti Q7/scorecard wajib: workload dan resource setara, hasil serta
   metrik pelindung terjaga, peningkatan melampaui variasi. Jika gagal, buang usulan
   optimasi dan catat; jangan melonggarkan target diam-diam.
5. Tidak ada DDL. Query/index usulan mengikuti 14.4. Flag/rollback keamanan tetap aman.
6. Jalankan suite penuh pada checkpoint yang relevan sebelum cutover.
7. Perbarui KI, feature matrix, migration-map, scorecard/DBC dan checkpoint; laporan 9.1.
   Commit fix/perf menyebut KI/DBC dan gerbang yang benar-benar dijalankan.
```

### 14.9 Tindakan Segera di `dompis_v2` (dikerjakan PakBreng, bukan agent)

Karena v2 masih melayani produksi dan v3 baru selesai berbulan-bulan lagi, temuan S tidak boleh menunggu rewrite. Agent tidak menyentuh v2 (R-01); PakBreng yang memutuskan dan menerapkan. Urutan prioritas dari audit:

1. **KI-25 (register publik).** Verifikasi di staging (OQ-02). Bila terbukti, pemilik menutup jalur atau mewajibkan otorisasi/invite akun yang tepat dan membatasi role sesuai kebijakan. Jangan menganggap `invite_token` QR tim otomatis cocok untuk registrasi akun; nilai scope/masa berlaku dan kontrak undangan terpisah. Audit akun terkait melalui prosedur pemilik.
2. **KI-23 / OQ-01.** Pastikan ingestion `nossa` benar-benar terjadwal. Ini bisa menjelaskan keluhan data tidak muncul.
3. **KI-26 (refresh token).** Minimal: baca ulang `users` saat refresh dan tolak bila user tidak ada atau role/branch berubah.
4. **KI-27 (berkas bukti tanpa autentikasi).** Pertimbangkan wajib sesi dan cache `private`. URL tersimpan di DB, jadi kontrak path harus tetap.
5. **KI-32 (X-Forwarded-For).** Periksa vhost (OQ-03).

---

## 15. Pensiun Kode Lama (Anti-Tumpang-Tindih)

Tujuan: setelah sebuah modul, fungsi, kelas, atau fitur selesai ditulis ulang **dan terbukti stabil**, versi lamanya dihapus, sehingga tidak ada dua sumber kebenaran yang membingungkan manusia maupun agent. Menghapus terlalu cepat berbahaya (rollback hilang), menghapus terlalu lambat membuat kode ganda menumpuk. Karena itu penghapusan diatur dengan syarat dan urutan, bukan dilakukan sambil lalu.

### 15.1 Dua Wilayah, Dua Aturan

| Wilayah | Siapa boleh menghapus | Kapan |
|---|---|---|
| **A. Di `dompis-v3`** (kode sementara, adapter, stub, flag, duplikat) | Agent, sebagai bagian tugas | Segera ketika tidak lagi diperlukan |
| **B. Di `dompis_v2`** (kode lama yang sudah digantikan) | **Hanya** lewat Manifes Pensiun dan izin tertulis PakBreng per batch (pengecualian R-01 yang diatur di R-47) | Setelah syarat 15.3 terpenuhi |

### 15.2 Peta Migrasi: Acuan Status Unit Kode

`docs/migration-map.md` adalah acuan status unit kode/operasional. Tiap unit memiliki satu baris, ID fitur terkait dan dependency; feature-parity-matrix tetap acuan kelengkapan alur pengguna. Diperbarui pada setiap commit yang mengubah statusnya. Keduanya tidak saling menggantikan.

| Unit v2 (path:simbol) | Jenis | Padanan v3 | Status | Tanggal status (WIB) | Keputusan khusus |
|---|---|---|---|---|---|
| contoh: `lib/aggregation/summary-snapshot.ts:recomputeTodaySnapshot` | fungsi | `apps/workers/src/snapshot/recompute.ts` | Belum → **Port** → **Paritas** → **Cutover** → **Observasi** → **Pensiun** → **Dihapus** | | |

Status khusus: **Tidak diport** (kode mati, R-32; butuh konfirmasi PakBreng; tetap masuk Manifes Pensiun) dan **Ditahan** (sengaja dibiarkan sampai fase akhir, dengan alasan, misalnya penerbitan token).

### 15.3 Syarat Sebuah Unit Boleh Dipensiunkan (semua harus terpenuhi)

1. Status **Observasi** selesai: **≥ 14 hari** untuk worker, **≥ 30 hari** untuk API/UI, sejak cutover tanpa rollback dan tanpa insiden terkait.
2. Pemanggil di v2 **nol**, dibuktikan `grep -rn` pada seluruh `app`, `lib`, `scripts`, `ecosystem.config.js`, konfigurasi Nginx, dan daftar cron (termasuk pemicu eksternal, OQ-08).
3. Trafik ke rute lama **nol** selama observasi (log akses), atau semua klien sudah dialihkan Nginx ke v3.
4. Flag penyalaan lama sudah mati dan tidak ada proses PM2 yang menjalankannya (tabel saklar 12.1).
5. Ada **tag git** `pre-retire-<modul>` di v2 dan arsip salinan penuh di luar repo (untuk rollback setelah penghapusan).
6. PakBreng menyetujui Manifes Pensiun secara tertulis (G12).

### 15.4 Manifes Pensiun (`docs/retirement/<modul>.md`)

```
# Manifes Pensiun: <modul>
Status migration-map: Observasi selesai pada <tanggal WIB>
Bukti syarat 15.3: (1) tanggal cutover dan insiden: ... (2) output grep pemanggil: ... (3) log akses: ... (4) flag/PM2: ... (5) tag git: ... (6) persetujuan: ...

Daftar hapus (tiap butir dengan path:baris atau nama persis)
- Berkas/rute/fungsi/kelas/komponen:
- Proses PM2, cron, jadwal ops:
- Variabel env yang tidak lagi dipakai siapa pun:
- Key Redis, antrean BullMQ, channel pub/sub (hapus data produksi hanya atas izin terpisah):
- Dependency package.json yang menjadi yatim (setelah semua pemakai hilang):
- Skrip operasional (scripts/) yang digantikan:
Daftar TAHAN (tidak dihapus agent): tabel/kolom/indeks DB, isi uploads, backup, rahasia
Dampak pada unit lain (file bercampur yang hanya sebagian dihapus):
Cara rollback (tag, arsip):
```

### 15.5 Urutan Penghapusan

1. **Matikan lalu amati** (sudah terjadi pada cutover): Nginx mengarah ke v3, flag v2 mati.
2. Verifikasi upstream lama tidak lagi menerima trafik untuk rute yang dialihkan. Respons 410/404 hanya boleh dipakai pada jalur lama yang memang dipensiunkan dan sudah disetujui; jangan mengubah URL publik yang sama dan masih aktif dilayani v3 menjadi 404.
3. **Hapus kode** (berkas, fungsi, kelas, komponen). File yang berisi campuran dipecah: hanya fungsi yang seluruh pemanggilnya sudah v3 yang dihapus.
4. **Hapus konfigurasi**: proses PM2, cron, env, key Redis sementara.
5. **Hapus dependency yatim** dari `package.json`.
6. **DDL dan data paling akhir**, setelah **seluruh** v2 pensiun, dan hanya lewat migrasi yang diterapkan PakBreng (R-13). Isi `uploads` dan backup **tidak pernah** dihapus oleh agent.
7. Setelah v2 mati total: hapus flag `V3_*_ENABLED`, prefiks cache `v3:`, adapter kompatibilitas, dan folder `spike/` di v3.

### 15.6 Prompt R (pensiun satu modul)

```
Kamu mengerjakan JALUR R (pensiun) untuk modul <MODUL>. Muat PRD v1.8 Bagian 0/15, aturan inti, AGENTS dan checkpoint.

SYARAT: status modul di docs/migration-map.md adalah Observasi dan sudah memenuhi 15.3. Jika tidak, BERHENTI.
LANGKAH:
1. Verifikasi SOURCE_ROOT/COMMIT dan salinan retire yang diizinkan. Baca penuh unit dalam cakupan dan petakan pemanggil dengan graphify/rg, termasuk konfigurasi dan pemicu eksternal.
2. Susun docs/retirement/<MODUL>.md sesuai 15.4, termasuk daftar TAHAN dan dampak pada unit lain.
3. BERHENTI dan minta persetujuan tertulis PakBreng atas manifes.
4. Setelah disetujui, kerjakan HANYA di branch retire/<MODUL> pada salinan git dompis_v2 yang disediakan PakBreng (bukan di folder produksi), per batch kecil sesuai urutan 15.5.
5. Tiap batch: bun/npm typecheck dan build salinan v2 untuk memastikan tidak ada impor yang putus, grep ulang tidak ada pemanggil tersisa, jalankan skrip uji parity v3 untuk memastikan v3 tidak terpengaruh. Tempel output nyata.
6. Perbarui docs/migration-map.md (Pensiun → Dihapus). Jangan menghapus DDL, uploads, backup, atau data Redis produksi.
7. Laporan Eksekusi (9.1) dengan daftar yang dihapus dan buktinya. Penggabungan ke produksi dilakukan PakBreng.
```

---

## 16. Standar Kode dan UI

Tujuan: kode mudah dirawat dan UI mendukung pekerjaan teknisi/helpdesk/admin. Kejelasan, aksesibilitas dan kontrak bisnis lebih penting daripada batas panjang mekanis. Pembersihan tidak memperluas tugas atau mengubah baseline tanpa keputusan.

### 16.1 Penamaan

| Hal | Pedoman | Contoh |
|---|---|---|
| Variabel/fungsi/parameter/properti internal | camelCase, fungsi menyebut tindakan, boolean is/has/can | ticketId, getTicket, canClose |
| Class/type/interface/komponen | PascalCase, tanpa awalan/akhiran kosong | Ticket, TicketCard.svelte |
| File TypeScript | camelCase, kecuali konvensi alat/rute | ticketList.ts, hooks.server.ts |
| Konstanta/env/kontrak eksternal | Pertahankan nama yang dituntut alat/kontrak | JWT_ACCESS_SECRET, id_user pada JSON lama |

Utamakan nama pendek dan jelas, biasanya 1 sampai 3 kata. Nama lebih panjang diperbolehkan bila diperlukan untuk membedakan aturan domain; tulis alasan pada review, bukan memendekkannya menjadi singkatan kabur. Hindari kata kosong seperti Enhanced/Smart/Unified/Comprehensive dan lapisan Manager/Handler/Helper/Util tanpa fungsi arsitektur yang nyata. Nama library, callback/tipe framework, field DB/JSON dan kontrak lama tidak dipaksa berubah agar lolos lint.

### 16.2 Bentuk Kode

- Satu fungsi satu tanggung jawab, target sekitar 40 baris; fungsi/transaksi yang lebih panjang membutuhkan alasan keterbacaan/atomicity. Jangan pecah transaksi menjadi langkah nonatomik demi angka.
- Gunakan early return dan parameter yang jelas; object parameter bila itu memperjelas makna, bukan sekadar menghindari batas lint. Hindari wrapper yang hanya meneruskan panggilan tanpa kebijakan.
- Jangan menambah abstraksi untuk kebutuhan yang belum ada. Batas otorisasi, validasi, transaksi atau dependency injection untuk pengujian dapat layak meskipun baru satu pemakai; jelaskan kegunaannya.
- Tipe eksplisit di batas input/output/kontrak, inferensi di internal. Aturan strict/any mengikuti R-23. Jangan memakai cast untuk menyembunyikan ketidakcocokan runtime.
- Tangani error di tempat yang bisa memulihkan atau memberi konteks; jangan telan kegagalan lalu melaporkan sukses. Hindari try/catch kosong, duplikasi validasi tanpa alasan, log berlebihan dan fallback spekulatif.
- Komentar menjelaskan alasan/jebakan yang tidak terlihat; ringkas tanpa promosi. Jangan menghapus komentar desain yang masih diperlukan. Kode mati dan adapter sementara mengikuti R-32/R-50, bukan dibuang tanpa audit.

### 16.3 Kontrak Visual dan Teks

Pada port, perilaku, istilah, informasi, navigasi, dan tampilan baseline dipertahankan. Sumber saat review memakai gradien pada absensi, tombol teknisi dan bucket admin. Karena itu larangan gradien tidak boleh sekaligus memaksa perubahan UI dalam commit port.

`docs/design-contract.md` mencatat token warna/jarak/tipografi/komponen sumber, screenshot acuan per state/tema, istilah/status, serta tiga kategori berikut:

1. Baseline dipertahankan pada P. Penggunaan visual sumber yang terdaftar mendapat pengecualian G13 dengan sumber dan cakupan yang jelas.
2. Perubahan visual menuju warna solid/tampilan lebih ringkas hanya setelah daftar komponen dan bentuk perubahan disetujui. Dikerjakan sebagai tugas visual terpisah; jangan merancang tema/navigasi baru atau menambah fitur.
3. Perubahan alur, informasi, makna status, teks kontraktual atau hak akses mengikuti DBC. Perubahan kosmetik murni cukup keputusan design-contract yang terlacak; jika dampaknya tidak jelas, jangan menebak.

Untuk UI/teks baru: gunakan warna token, hierarki yang sesuai pekerjaan, tanpa gradien/glow/glassmorphism/animasi hias generik, emoji dekoratif atau kartu berlapis tanpa kebutuhan. Teks baru tidak memakai em/en dash. Kutipan, data pengguna dan istilah sumber tidak diganti oleh pemindai gaya.

Label biasanya 1 sampai 3 kata; bantuan biasanya satu kalimat sekitar 15 kata. Informasi tindakan berisiko, validasi dan aksesibilitas boleh lebih panjang bila diperlukan. Error menjelaskan masalah dan langkah berikutnya, tanpa jejak teknis. Istilah status/bucket v2 tetap dipakai; jangan menggantinya dengan sinonim hanya untuk mengurangi panjang.

Halaman admin/helpdesk mengutamakan tabel, filter dan kepadatan informasi; teknisi mengutamakan target sentuh dan tindakan utama yang jelas. Wajib: loading/kosong/error, fokus/keyboard, dialog dapat ditutup, target sentuh memadai, kontras WCAG AA, tema yang benar-benar berfungsi, dan lebar 360 px tanpa informasi/tindakan terpotong. Teks reusable dikelola konsisten tanpa memindahkan seluruh teks sumber secara mekanis ke satu berkas raksasa.

### 16.4 Pemeriksaan G13 dan Review Diri

- Lint identifier sesuai konvensi dengan pengecualian kontrak/library. Kata terlarang ditinjau dalam konteks, bukan memblokir nama eksternal atau istilah domain yang sah.
- Periksa CSS/kelas/template terstruktur, termasuk bentuk Tailwind yang benar-benar dipakai. Substring from-/to-/gradient pada teks atau nama field tidak cukup menjadi bukti pelanggaran.
- Batasi pemeriksaan pada kode/teks yang relevan. Kecualikan data pengguna, fixture literal kontrak, kutipan/dokumen riwayat dan baseline visual yang tercatat; pengecualian punya sumber, pemilik dan syarat pensiun.
- Panjang fungsi/nama/teks/nesting menghasilkan laporan review. Pengecualian beralasan sah; jangan mengubah kontrak/atomicity demi lint.
- G13 tidak menggantikan build/runtime/browser check. Pada tugas UI, rekam state/tema/mobile/keyboard serta interaksi yang diperiksa; jangan mengklaim click-through hanya dari inspeksi kode.

Sebelum selesai, baca diff untuk menilai apakah nama, lapisan, komentar dan teks membantu pembaca/pengguna. Perbaiki hanya yang ada dalam cakupan tugas. Review dokumen memeriksa konsistensi aturan, rujukan, batas bukti, dan status keputusan; tes UI/runtime N/A bila tidak mengubah UI.

### 16.5 Prompt Tambahan Kode/UI

```text
Patuhi PRD v1.8 Bagian 16 dan design-contract modul.
Nama jelas, fungsi satu pekerjaan, tanpa lapisan spekulatif atau komentar promosi.
Kontrak lama dan atomicity tidak dikorbankan demi lint/panjang nama/fungsi.
Port mempertahankan visual baseline yang terdaftar; perubahan solid/teks hanya
sesuai keputusan desain. Perubahan alur/informasi mengikuti DBC.
Teks baru Bahasa Indonesia yang dimengerti teknisi/helpdesk, tanpa klaim buatan.
Jalankan G13 dan pemeriksaan UI yang berlaku. Dokumentasikan pengecualian,
state/tema/perangkat/interaksi yang diperiksa. Review diff dalam cakupan.
```

---

## Lampiran A - Indeks AGENTS untuk Target

Gabungkan indeks ini pada tahap fondasi yang telah diizinkan. Pertahankan instruksi proyek/skill/graphify yang masih berlaku; jangan menimpa AGENTS sumber. Versikan dokumen governance setelah pengecualian Git terarah disiapkan. Ringkasan tidak menggantikan aturan penuh bila ada konflik.

```markdown
# AGENTS.md - Rewrite Dompis, PRD v1.8

## Pembacaan pertama
Baca HANDOVER.md terlebih dahulu pada awal sesi/pergantian agent/model.
Kemudian verifikasi AGENTS, PRD dan bukti aktual sesuai 0.6/9.4.
Jika handover hilang, jangan mulai ulang dari tebakan.

## Tujuan dan kewenangan
Pertahankan kapabilitas/kontrak yang disepakati; tingkatkan performa, integritas data,
keamanan dan pemeliharaan dengan bukti. Jangan mulai rewrite hanya karena membaca
PRD. Ikuti izin tugas aktif; tugas dokumen hanya mengubah dokumen yang diizinkan.

## Konteks setiap tugas
Muat PRD-Dompis-v3-Agent-Governance.md menurut petunjuk pembuka, checkpoint,
spec modul, feature-parity-matrix, ADR/DBC dan kontrak desain/transisi yang relevan.
Verifikasi SOURCE_ROOT/COMMIT, TARGET_ROOT, referensi serta lingkungan dev (Bagian 0).
Sumber menjelaskan baseline; keputusan/DBC disetujui menjelaskan perubahan tujuan.

## Batas
- Sumber read-only; target terpisah dan tidak bersarang. Jangan install/build di sumber.
- Tidak mengakses DB produksi, menyimpan secret/PII, atau mengirim efek keluar nyata dari uji.
- DDL tetap milik migrasi Prisma/pemilik selama coexistence; jangan push/migrate Drizzle.
- Dependency memakai manifest/versi disetujui. Tambahan di luar manifest lewat ADR.
- Satu tugas satu cakupan. P/H/F/R dipisah; S tidak boleh diport sebagai celah aktif.
- Waktu WIB dan tipe MySQL, generated read-only, JSON/angka dan uploads mengikuti kontrak.
- Otorisasi data/mutasi ditegakkan API/core; guard UI hanya membantu navigasi.
- Jangan mengubah field, role/scope, alur, informasi, atau UI baseline tanpa keputusan terkait.
- Jangan menambah fitur, mengganti stack, merapikan di luar tugas atau menghapus kode tanpa audit.
- Satu pemilik aktif per fungsi produksi; writer lintas fungsi juga punya ownership.
- Queue/cache/lock/limiter/SSE mengikuti transition-contract 12.3. Alih consumer saja belum cukup.
- Kode jelas dan sederhana; gaya 16/design-contract tidak mengalahkan kontrak bisnis/atomicity.

## Pengujian dan status
Siklus Bagian 4 dan matriks gerbang 5.3 menentukan bukti tugas.
G4 memakai dua state awal identik, runner referensi/mock, dan pemeriksaan respons,
state serta efek samping. SQL dinilai semantiknya; delta F2/S hanya sesuai DBC.
H: reproducer merah terdaftar di luar discovery suite wajib; F: regresi wajib hijau.
Gerbang BLOCKED bukan PASS/N/A. Hentikan langkah terdampak, lanjutkan pekerjaan
independen yang diizinkan. Jangan melonggarkan gerbang setelah gagal.

## Hasil dan transisi
Port lulus belum Siap-cutover. Feature coverage, scorecard peningkatan positif,
keamanan, transisi, UAT dan rollback harus terpenuhi sebelum produksi (7, 9, 12).
Jalur rentan terbukti harus aman atau nonaktif; flag rollback tidak boleh menghidupkannya.
Pensiun setelah observasi >=14 hari worker / >=30 hari API/UI, bukti dan manifes
berizin (15). Jangan hapus DDL, uploads, backup, secret atau data Redis produksi.
Perbarui checkpoint, feature matrix, migration-map serta keputusan/bukti relevan.
Laporan 9.1 menyebut commit/lingkungan, gerbang aktual, blocker dan rollback.
Baca HANDOVER.md sebelum melanjutkan; cocokkan dengan bukti aktual,
pastikan penulis lama berhenti dan simpan handoff sesuai 9.4 sebelum berganti sesi.
```

## Lampiran B - Checklist Sesuai Tahap

- [ ] Kewenangan tugas, identitas workspace, versi PRD, commit dan scope file jelas
- [ ] ID modul/fitur, dependency dan acceptance criteria terdaftar; perubahan disetujui terlacak
- [ ] Sumber/pemanggil relevan dibaca penuh; Catatan Perilaku/Field sesuai tahap tersedia
- [ ] Tidak ada perluasan scope, source edit, dependency tambahan, DDL atau akses produksi tanpa kewenangan
- [ ] Gerbang tahap 5.3 mempunyai bukti; BLOCKED/N/A dibedakan, tidak ada PASS palsu
- [ ] P/F: parity state awal identik, output/efek samping dan oracle DBC teruji; SQL/tipe/waktu benar
- [ ] H: cakupan dan reproducer diagnostik terdokumentasi; F: regresi wajib terkait hijau
- [ ] Optimasi/cutover: scorecard terukur menunjukkan peningkatan disetujui dan metrik pelindung terjaga
- [ ] Cutover: feature coverage lengkap, keamanan aman/nonaktif, producer/consumer/cache/limiter/ownership siap
- [ ] UI: design-contract dipatuhi; baseline tidak diubah diam-diam; state/tema/mobile/keyboard diperiksa bila relevan
- [ ] R: syarat observasi/pemanggil/trafik/arsip dan manifes disetujui; data yang dilindungi tidak dihapus
- [ ] Checkpoint, migration-map dan feature matrix diperbarui sesuai perubahan status; secret/PII tidak masuk bukti
- [ ] Laporan menyatakan hasil tahap yang sebenarnya, risiko, blocker lokal, dan langkah berikutnya

## Lampiran C - Pelacakan Review ke Revisi 1.4

Status ditangani di bawah berarti kontrak dokumen telah direvisi, bukan kode atau infrastruktur sudah tersedia. Register OQ menyatakan prasyarat yang masih terbuka.

| Review | Bagian yang menutup kekurangan kontrak |
|---|---|
| RV-01 Workspace | 0.1, R-01/R-02, tugas 0.0, OQ-09 |
| RV-02 Parity mutasi/worker | 5.2, 0.7 sebelum 0.6, OQ-10 |
| RV-03 DBC/SQL | R-16/R-41, G4, 5.2, 14.5, Prompt F |
| RV-04 Queue/cache/writer | R-28, 12.1..12.4, OQ-14/OQ-15 |
| RV-05 Kelengkapan fitur | 1.3..1.5, 0.8, Fase 5..10 dan checklist cutover |
| RV-06 Performa nyata | 7.1..7.3, G6/G11, OQ-11 |
| RV-07 Hierarki/config efektif | 0.2, 2.1/2.2, R-03, OQ-01/OQ-15 |
| RV-08 Gerbang tahap | 4, 5.3, T-03/T-05, urutan Fase 0 dan H/F |
| RV-09 Keamanan/flag | 2.2, R-22/R-41/R-42, 14.1/14.2, Lampiran A |
| RV-10 Konteks/version control | Pembuka, 0.4, R-05/R-09, Prompt Induk, Lampiran A |
| RV-11 Gaya/baseline UI | R-60/R-62/R-64, 16, OQ-13 |
| RV-12 Fixture/isolasi | T-07, 5.2, 0.7 |
| RV-13 Canary/rollback | A-04, 12.1..12.4, OQ-14 |
| RV-14 APK/observasi/rujukan | Fase 11/12, 12.2, 15, R-59, 16 dan versi prompt |
