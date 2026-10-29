# AGENTS.md - Dompis, selaras PRD v1.8

## Instruksi Pertama untuk Agent atau Model Baru

Sebelum membaca dokumen proyek lain, menelusuri source atau melakukan perubahan, **baca [HANDOVER.md](HANDOVER.md) sampai selesai**. Aturan ini berlaku saat awal sesi, pergantian agent/model, dan pemulihan setelah sesi terputus. Jika AGENTS ini dimuat otomatis oleh platform, bagian ini adalah bootstrap untuk mengarahkan pembacaan berikutnya ke HANDOVER.

Urutan wajib: **HANDOVER.md -> AGENTS.md -> PRD aktif -> spec/keputusan/bukti tugas -> verifikasi file/Git aktual**. Setelah verifikasi, laporkan checkpoint-ID, versi PRD, status implementasi, tugas terakhir/parsial, blocker dan satu langkah berikutnya sebelum menulis.

Jika HANDOVER hilang atau bertentangan dengan bukti aktual, jangan membuat progres kosong atau menjalankan ulang scaffold/mutasi. Ikuti prosedur pemulihan PRD 9.4. HANDOVER mencatat progres; kewenangan tetap dari instruksi pemilik dan aturan PRD. Perbarui HANDOVER pada batas tugas dan sebelum berhenti/berganti model; satu scope hanya memiliki satu penulis aktif.

## Tujuan dan status workspace

Pertahankan seluruh kapabilitas yang disepakati dan tingkatkan performa, integritas data, keamanan serta kemudahan pemeliharaan dengan bukti. Kontrak utama: [PRD-Dompis-v3-Agent-Governance.md](PRD-Dompis-v3-Agent-Governance.md), versi 1.8.

Workspace aktif dan root dokumen kanonis adalah `/Users/pakbreng/Projects/dompis-v3-app`. Sumber `/Users/pakbreng/Projects/dompis-v3` berisi aplikasi Next.js/React/Prisma dengan `package.json.name=dompis_v2` dan tetap dilindungi. Target rewrite adalah SvelteKit + Bun + Elysia + Drizzle dengan MySQL tetap. Target saat ini berisi governance dan Git lokal; scaffold aplikasi belum tersedia. HANDOVER sumber hanya pengarah; gunakan PRD/AGENTS target sebagai kontrak aktif.

Status dokumen: final sebagai panduan rewrite, dengan prasyarat pelaksanaan pada PRD Bagian 0 dan register OQ di 14.6. Final dokumen tidak berarti SIAP-PORT atau SIAP-CUTOVER.

Scope persiapan yang diizinkan pemilik mencakup dokumen kanonis/pengarah sumber, penyalinan laporan review, `.gitignore`, inisialisasi Git lokal dan pencatatan awal governance. Jangan menjalankan scaffold, mengubah kode/config aplikasi, menginstal dependency, menjalankan build/worker/tes aplikasi, mengakses DB atau melakukan deploy berdasarkan pembacaan dokumen ini. Pekerjaan implementasi berikutnya memerlukan instruksi tugas yang mencakupnya; keputusan yang sudah disetujui tidak perlu dimintakan ulang.

## Konteks dan urutan otoritas

- Instruksi eksplisit pemilik menentukan ruang lingkup dan kewenangan tugas. Catat perubahan keputusan; jangan menganggap dokumen sebagai izin melakukan semua fase.
- PRD aktif, spec fitur, ADR dan DBC disetujui menentukan perilaku tujuan. Kode pada commit sumber dan konfigurasi efektif menjelaskan baseline; komentar/ringkasan bukan bukti runtime.
- Setelah HANDOVER, verifikasi AGENTS lalu baca PRD penuh pada awal keterlibatan. Pada tugas berikutnya muat Bagian 0, 1, 3, 4, 5 dan 8, lalu bagian modul/H/F/R/UI yang relevan. Muat ulang perubahan bila versi/kontrak berubah.
- Gunakan [laporan review](REVIEW-PRD-Dompis-v3-Agent-Governance.md) sebagai riwayat temuan; aturan pelaksanaan mengikuti PRD aktif, bukan rekomendasi review lama yang belum disetujui.
- Baca [handover kanonis](HANDOVER.md) terlebih dahulu pada setiap awal sesi/pergantian agent/model. Implementasi rewrite saat checkpoint awal belum dimulai.
- Artefak target seperti feature-parity-matrix, route-inventory, spec, migration-map, scorecard, design-contract dan transition-contract digunakan **bila sudah dibuat**. Jangan mengklaim artefak, script atau hasil tes tersedia tanpa memeriksanya.

Keputusan pemilik pada PRD 0.7: SOURCE_ROOT `/Users/pakbreng/Projects/dompis-v3`, SOURCE_COMMIT `3ab0381ebeab90e4ca819fd93976eb16406eec1c`, TARGET_ROOT `/Users/pakbreng/Projects/dompis-v3-app`, dan REFERENCE_ROOT `/Users/pakbreng/Projects/dompis-v2-ref`. Target sudah tersedia dengan Git lokal pada branch `rewrite/bootstrap`; referensi belum disiapkan. Pemilik akan membuat dan menghubungkan repository GitHub baru; remote belum tersedia. Jangan bertanya ulang nama/path yang disetujui, mengganti baseline diam-diam, membuat repository GitHub/push, atau menganggap instalasi/kompatibilitas sudah lulus. Kandidat dependency dan kebijakan Git ada pada PRD 0.7; tooling/peer tambahan harus dicatat sesuai R-09. Verifikasi keadaan aktual sebelum tahap pemakainya; target performa tetap menunggu baseline.

## Cakupan tugas dan larangan

1. Satu tugas satu alur/kapabilitas dalam peta M00..M12, dengan ID fitur, acceptance criteria, dependency, scope file, gerbang tahap dan rollback. Fitur tidak boleh hilang hanya karena tidak disebut dalam contoh fase.
2. Sumber read-only selama rewrite. Jangan install, generate, build, format atau menghapus isinya. Perubahan dokumen sumber yang ditugaskan eksplisit diperbolehkan. Perubahan kode sumber/darurat dan pensiun mengikuti kewenangan terpisah PRD.
3. Tidak terhubung ke DB produksi atau menaruh token/password/PII di kode, config, log dan laporan. Pengujian memakai snapshot anonim, state dev terisolasi dan mock efek keluar; tidak mengirim FCM/webhook nyata.
4. Selama coexistence, DDL milik migrasi Prisma yang diterapkan pemilik. Jangan menjalankan drizzle-kit push/migrate atau DDL lain. Usulan indeks/skema memerlukan bukti, dampak tulis dan rollback sesuai PRD.
5. Dependency menggunakan manifest/versi yang disetujui. Tambahan/penggantian di luar manifest melalui ADR dan keputusan pemilik; jangan mengganti stack karena spike gagal tanpa keputusan.
6. Pertahankan kontrak waktu WIB, DateTime/Timestamp/Date, BigInt/Decimal/JSON dan tipe respons. Generated columns tidak ditulis. Uploads produksi tidak disalin, dipindah atau dibawa dalam build.
7. Otorisasi data/mutasi ditegakkan di API/core, mencakup role/alias, scope wilayah dan akses objek. Guard UI hanya membantu navigasi. Jangan mengakses DB dari apps/web.
8. Jangan menambah fitur, memperluas refactor, mengubah field/status/alur atau membuang kode yang tampak mati tanpa keputusan terkait. Pisahkan port P, hunt H, fix F dan pensiun R.
9. Celah keamanan terbukti tidak boleh diwarisi sebagai jalur aktif. F2/S perubahan kontrak memerlukan DBC; flag/rollback tidak boleh menghidupkan celah lama. S0/S1 dilaporkan segera tanpa mengeksploitasi produksi.
10. Nama dan kode mengikuti PRD Bagian 16. Kontrak bisnis, atomicity dan aksesibilitas tidak dikorbankan untuk batas panjang/lint. Port UI mengikuti baseline/design-contract; perubahan visual atau istilah tidak dilakukan diam-diam. APK baru bukan kewajiban tersirat.

## Siklus kerja dan bukti

Ikuti Siklus PRD Bagian 4: verifikasi konteks, baca sumber/pemanggil relevan, catat perilaku/field, rencana, implementasi sesuai izin, gerbang, parity, laporan dan commit bila termasuk tugas. Baca penuh file aplikasi dalam cakupan dan dependency yang memengaruhi perilaku; tidak perlu membaca rekursif seluruh source library pihak ketiga.

Gerbang G0..G13 mengikuti **matriks tahap di 5.3**, bukan kewajiban menjalankan semua perintah pada setiap edit:

| Tahap | Bukti yang diperlukan |
|---|---|
| Dokumen | Konsistensi kontrak, rujukan, Markdown dan status keputusan; build/tes aplikasi N/A |
| Fondasi | Identitas/manifest, lingkungan terisolasi, harness/perkakas dan kontrak pilot siap; stub gagal bukan PASS |
| P | Parity dan gerbang relevan; G6/G11 mencatat masalah baseline; belum Siap-cutover |
| H | Cakupan dan reproducer diagnostik merah terdaftar di luar discovery suite wajib; suite wajib tetap hijau |
| F | Reproducer menjadi regresi wajib hijau; kontrak/DBC dan target terdampak teruji |
| Cutover | Feature coverage, scorecard peningkatan terukur, keamanan, kontrak transisi, UAT dan rollback lulus |
| R | Observasi >=14 hari worker atau >=30 hari API/UI, pemanggil/trafik nol, arsip/tag serta manifes disetujui |

- Parity memakai dua state awal identik atau reset lengkap yang terbukti, clock/normalisasi terbatas, runner referensi untuk worker dan mock dependensi. Bandingkan respons, state bisnis dan efek samping.
- P/F1 identik dalam cakupan kontrak. F2/S hanya berbeda pada delta DBC yang disetujui; kontrak lain tetap dilindungi.
- SQL dan parameter diaudit secara semantik, hasil, rencana eksekusi serta transaksi. String SQL/alias antar-ORM tidak wajib identik.
- Dump anonim memberi basis realistis; fixture sintetis berlabel diperlukan untuk null, batas tipe, race, input berbahaya, pergantian hari dan outage.
- Catat perintah aktual, commit/lingkungan, waktu, exit code dan bukti disensor. PASS, FAIL, BLOCKED dan N/A beralasan tidak boleh dicampur. Perintah target Bun hanya dijalankan setelah target/script tersedia dan tugas mengizinkannya.
- Blocker menghentikan langkah yang bergantung padanya, bukan pekerjaan independen yang sah. Jangan melonggarkan gerbang atau menganggap diamnya pemilik sebagai persetujuan.

## Resume dan pergantian agent

PRD menetapkan kontrak, HANDOVER.md menetapkan progres operasional; jangan menyalin progres harian ke beberapa dokumen aktif. Protokol lengkap ada di PRD 0.5/0.6 dan 9.4/9.5.

1. Baca HANDOVER.md terlebih dahulu, lalu AGENTS, PRD aktif dan bukti tugas terkait; verifikasi checkpoint-ID, source/target, branch/HEAD, diff serta file untracked/ignored relevan. Agent lain tidak diasumsikan berbagi memori atau otomatis memuat dokumen ini.
2. Cocokkan tugas DONE dan bukti gerbang dengan file/commit/lingkungan aktual. Checkpoint bisa tertinggal bila sesi putus. Tugas IN_PROGRESS tidak otomatis selesai atau aman diulang.
3. Laporkan tahap, tugas terakhir, pekerjaan parsial, blocker dan satu langkah berikutnya. Lanjutkan hanya tugas yang dependency dan izinnya terpenuhi; jangan mengulang scaffold/mutasi dari tebakan.
4. Default satu penulis aktif per scope. Pastikan agent lama berhenti sebelum mengambil alih; catat pemilik/scope sesi. Markdown bukan lock teknis. Kerja paralel memerlukan kewenangan dan pemisahan scope/worktree, bukan diaktifkan otomatis.
5. Simpan checkpoint sesudah batas tugas/perubahan keputusan/blocker dan sebelum berhenti/berganti agent. Catat file belum commit, gerbang, keputusan, resource/proses aktif dan langkah berikutnya; jangan memaksa commit/reset/stash untuk menyembunyikan pekerjaan parsial.
6. Pakai status TODO/IN_PROGRESS/BLOCKED/IN_REVIEW/DONE dengan definisi PRD. Jangan menghitung dokumen selesai sebagai implementasi selesai atau mengarang persentase saat daftar pekerjaan belum lengkap.
7. Jika dokumen kanonis tidak tersedia di clone/mesin lain, hentikan perubahan yang bergantung padanya dan minta salinan tepercaya. Jangan menyalin rahasia/data produksi untuk melengkapi konteks.

## Ukuran hasil dan transisi

Perpindahan stack atau build sukses belum memenuhi tujuan rewrite. Scorecard PRD Bagian 7 harus berisi baseline/workload, delta peningkatan positif, ambang absolut, metrik pelindung dan batas rollback yang disepakati. Ukur total web + API + workers beserta seluruh instance/pool; batas restart PM2 bukan RSS baseline.

Satu implementasi aktif per fungsi produksi; penulis lintas fungsi tetap membutuhkan ownership sumber/kolom dan kebijakan konflik. Queue/cache/lock/limiter/SSE/checkpoint/outbox mengikuti PRD 12.3. Memindahkan consumer saja atau menambahkan prefiks cache tidak menjamin konsistensi. Drain/alih seluruh producer yang relevan, uji invalidasi lintas versi, kompatibilitas data dan rollback tanpa membuang transaksi sah.

Pensiun mengikuti PRD Bagian 15, melalui salinan/branch yang diizinkan dan manifes per batch. Jangan menghapus tabel/kolom/indeks, uploads, backup, rahasia atau data Redis produksi. Adapter sementara memiliki pemilik, syarat pensiun dan migration-map.

## Baseline QOSMIC yang perlu dijaga

Ringkasan ini berasal dari kode/config repository pada review 29 Oktober 2026; verifikasi commit dan config efektif saat mengerjakan modul. Kontrak lengkap berada di PRD 2.2 dan 12.3.

- `lib/ingestion/index.ts` melakukan enqueue BullMQ untuk tabel bridge; consumer pada `lib/external-db/qosmic-bridge/bridge-queue.ts` menjalankan iterator dan `processRawRows`. Jalur MySQL piloting memiliki kontrak tersendiri.
- Search Nossa membaca ticket_raw lokal dahulu. Bila tidak ditemukan dan BRIDGE_JOB_SEARCH_ENABLED aktif, search enqueue job interaktif, menunggu sampai 5 detik dan membaca ulang lokal bila berhasil. Fallback dapat memakai kuota bridge; timeout HTTP tidak membuktikan job batal.
- Total kuota upstream 20 req/menit dibagi bersama seluruh konsumen/versi, termasuk retry/probe/fallback. Backfill pada PM2 repository 2/menit, default client 6; non-backfill dihitung total dikurangi backfill. Jangan menetapkan 14+6 sebagai fakta konfigurasi efektif semua proses.
- Data-worker di konfigurasi repository dibatasi piloting_tickets; active-refresh dan backfill startup data-worker mati. Jadwal ingestion Nossa dan interval runtime masih memerlukan bukti pemilik (OQ-01/OQ-04/OQ-15).
- Client memeriksa URL/token untuk deteksi konfigurasi; jangan menganggap QOSMIC_BRIDGE_ENABLED otomatis menjadi master switch efektif atau menjamin fallback MySQL tanpa menelusuri pemakai flag.
- Timeout/retry, concurrency per queue, sliding-window limiter, health/failover, checkpoint, guard sumber/null dan pemetaan normalizer harus dicatat dalam spec lalu diuji. Limiter lokal per proses saat Redis gagal tidak otomatis menjaga batas global.

## Laporan dan kelanjutan sesi

Laporan mengikuti PRD 9.1: ID tugas/fitur/modul, versi/commit, scope perubahan, gerbang aktual, delta DBC, angka performa bila relevan, risiko, blocker lokal dan rollback. Port lulus tidak boleh dilaporkan sebagai rewrite selesai.

Perbarui HANDOVER.md, feature matrix, migration-map dan keputusan sesuai tahap setelah artefaknya tersedia. Setelah pergantian sesi, cocokkan checkpoint dengan commit/file aktual dan baca perubahan sumber yang relevan. Jangan mengganti baseline atau mengulang keputusan tanpa mencatat alasannya.

Governance target beserta `.gitignore` sudah dicatat di Git lokal. Pertahankan HANDOVER, AGENTS, PRD, laporan review dan dokumen governance berikutnya sebagai file tracked; jangan menambahkan aturan menyeluruh `*.md`. Aturan ignore Markdown di sumber tidak diubah. Periksa branch/HEAD, diff dan status tracked aktual saat resume. Repository belum terhubung ke GitHub; clone/CI belum dapat mengambil catatan lokal sampai pemilik menerbitkannya.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop skill for the task:
- Core filter, always on: `antislop`
- UI / visual: `antislop-ui`
- Copy & text: `antislop-copywriting`
- People: `antislop-human`
- Mobile / responsive: `antislop-layoutmobile`
- Code comments: `antislop-code`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->
