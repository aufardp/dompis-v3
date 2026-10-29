# HANDOVER - Rewrite Dompis

## Mulai di Sini pada Setiap Sesi atau Pergantian Model

File ini di `/Users/pakbreng/Projects/dompis-v3-app/HANDOVER.md` adalah satu-satunya catatan progres dan serah terima aktif. HANDOVER, AGENTS, PRD dan laporan review di target adalah salinan kanonis; handover sumber hanya pengarah. Baca penuh sebelum membaca dokumen proyek lain untuk memulai/resume tugas. Jika platform sudah memuat AGENTS.md otomatis, gunakan instruksi bootstrap itu untuk membuka file ini terlebih dahulu, lalu lanjutkan verifikasi sesuai urutan berikut.

1. Baca HANDOVER.md: checkpoint, pekerjaan selesai/parsial, izin, blocker, owner dan langkah berikutnya.
2. Baca [AGENTS.md](AGENTS.md) untuk batas kerja dan aturan proyek yang aktif.
3. Baca [PRD aktif](PRD-Dompis-v3-Agent-Governance.md), bagian inti dan bagian tugas terkait; cocokkan versi serta keputusan yang berlaku.
4. Baca spec, ADR/DBC, matriks fitur/migrasi, laporan dan bukti yang relevan jika sudah tersedia. Kemudian cocokkan dengan source/target, branch/HEAD, diff serta file untracked/ignored aktual.
5. Laporkan checkpoint yang diverifikasi, status implementasi, tugas terakhir/parsial, blocker dan satu langkah berikutnya sebelum menulis. Pembacaan file saja bukan izin implementasi atau bukti hasil tes.
6. Pastikan penulis lama berhenti pada scope yang sama. Jika sesi/model sebelumnya terputus, verifikasi perubahan setelah checkpoint dan proses/job yang mungkin masih aktif; jangan mengulang mutasi dari tebakan.
7. Lanjutkan hanya tugas dengan dependency dan kewenangan terpenuhi. Konflik antara ringkasan ini, PRD, keputusan pemilik dan bukti aktual diselesaikan menurut hierarki PRD 0.2; catatan progres tidak dapat memperluas izin.
8. Sesudah batas tugas dan sebelum berhenti/berganti agent/model, perbarui file ini dengan waktu WIB, checkpoint baru, status/bukti, perubahan belum commit, resource aktif dan langkah lanjut. Pertahankan riwayat; jangan menggandakan progres aktif ke file lain.

Jika file ini hilang/tidak terbaca, jangan membuat handover kosong, menganggap pekerjaan belum ada, atau memulai scaffold. Minta salinan kanonis dari pemilik dan batasi pekerjaan pada pemeriksaan yang tidak bergantung pada progres tersebut.

## Checkpoint Aktif

| Field | Nilai |
|---|---|
| Checkpoint-ID | CP-0005 |
| Diperbarui | 2026-10-29 15:52:39 WIB |
| PRD aktif | [PRD v1.9](PRD-Dompis-v3-Agent-Governance.md) |
| Instruksi agent | [AGENTS.md](AGENTS.md) |
| Status implementasi | BELUM DIMULAI; belum ada scaffold atau modul rewrite yang diimplementasikan dalam pekerjaan ini |
| Status kesiapan | SIAP-DOKUMEN; target dan Git lokal tersedia, dokumen kanonis tracked; toolchain/lingkungan uji belum lengkap |
| Tahap terakhir | Audit statis skill pihak ketiga dan pemasangan 15 adaptasi proyek docs-only dengan provenance, indeks dan verifikasi integritas |
| Tugas terakhir / tugas aktif | DOC-SKILLS-AUDIT DONE; T-0.0 tetap IN_REVIEW; implementasi aplikasi belum dimulai |
| Pemilik penulisan dokumen | Tidak ada setelah penutupan CP-0005; penulis paket governance/skill selesai |
| Tugas berikutnya | Dari workspace target, baca handover dan verifikasi Git/skill. Gunakan dompis-dependency-audit untuk meninjau sisa T-0.0 (toolchain/peer/lingkungan spike); instalasi/scaffold menunggu tugas yang mencakupnya |

File ini mencatat progres aktual. PRD mencatat tujuan/aturan; tugas dokumentasi DONE tidak berarti implementasi atau Fase 0 sudah selesai. Persentase keseluruhan belum dihitung karena tugas port per fitur belum dipecah/disetujui.

## Lingkungan dan Batas Kewenangan

| Aspek | Bukti/status |
|---|---|
| Workspace dokumentasi saat ini | `/Users/pakbreng/Projects/dompis-v3-app`; dokumen kanonis berada di target |
| SOURCE_ROOT | Disetujui: `/Users/pakbreng/Projects/dompis-v3`; sumber dilindungi |
| SOURCE_COMMIT disetujui / HEAD teramati | `3ab0381ebeab90e4ca819fd93976eb16406eec1c`; HEAD cocok saat pencatatan; bukan commit yang memuat dokumen lokal baru |
| TARGET_ROOT / target branch / target HEAD | `/Users/pakbreng/Projects/dompis-v3-app`; branch lokal `rewrite/bootstrap`; baseline sebelum tugas skill `226ebfe`. Checkpoint ini dicatat bersama commit paket skill; gunakan `git log -1 --oneline` untuk HEAD aktual |
| Referensi HTTP / runner worker | REFERENCE_ROOT disetujui: `/Users/pakbreng/Projects/dompis-v2-ref`; folder, URL dan runner belum dibuat/disiapkan |
| DB/Redis/mock/fixture target | Belum disiapkan/diverifikasi untuk rewrite |
| GitHub target | Repository baru akan dibuat/dihubungkan pemilik; URL/remote belum diberikan; tidak ada create-repo/push oleh agent |
| Keputusan/kewenangan sesi ini | Pemilik meminta audit masing-masing skill dan pemasangan untuk rewrite. Dipasang 15 adaptasi relevan; seluruh entry point dicatat dalam audit statis. Izin ini mencakup tooling/governance skill, bukan scaffold/dependency runtime/DB/deploy/GitHub |
| Perubahan lokal yang harus dipertahankan | Skill kanonis .agents/skills, alias .claude/skills, CLAUDE bootstrap, manifest/index/audit/notices, tools/skills/verify_skills.py serta PRD/AGENTS/HANDOVER; dicatat sebagai satu commit tugas skill terpisah dari baseline governance awal |
| Status transport dokumen | Governance target tracked di Git lokal dan .gitignore tidak mengabaikannya. Belum ada remote/push; dokumen baru tersedia melalui clone setelah pemilik menerbitkan repository |
| Proses aplikasi/worker yang dimulai oleh sesi dokumentasi ini | Tidak ada; proses lain di mesin tidak diaudit oleh catatan ini |

Saat pindah mesin/clone, pastikan dokumen kanonis beserta bukti tersedia dari repository target yang benar. Git lokal sudah disiapkan, tetapi GitHub belum terhubung. Jika file wajib tidak tersedia, jangan melanjutkan dari tebakan. Jangan memakai arsip PRD/AGENTS di sumber sebagai kontrak aktif.

## Pekerjaan Dokumentasi

| ID | Hasil | Status | Bukti |
|---|---|---|---|
| DOC-REVIEW | Mencocokkan PRD v1.3 dengan inventaris dan sumber terarah; 14 temuan | DONE | [Laporan review](REVIEW-PRD-Dompis-v3-Agent-Governance.md); batas pemeriksaan tertulis di laporan |
| DOC-PRD | Merevisi kontrak fitur, performa, parity, transisi dan aturan agent ke v1.4 | DONE | PRD dan Lampiran C; 64 aturan dan 43 KI dipertahankan |
| DOC-AGENTS | Menyelaraskan instruksi proyek dan baseline QOSMIC dengan PRD | DONE | AGENTS; blok graphify dan antislop dipertahankan |
| DOC-HANDOFF | Menambah protokol resume/handoff dan checkpoint awal pada v1.5 | DONE | Riwayat CP-0001 dan protokol yang dipertahankan di PRD |
| DOC-HANDOVER-FIRST | Menetapkan HANDOVER.md sebagai pembacaan pertama dan satu checkpoint aktif pada v1.6 | DONE | Verifikasi dokumen lulus: urutan bootstrap/resume, tautan, versi, riwayat CP-0001, 10 tugas fondasi dan aturan lama tetap terjaga |
| DOC-FOUNDATION-DECISION | Mencatat persetujuan lokasi, kandidat dependency dan kebijakan Git pada PRD v1.7 | DONE | PRD 0.1/0.7, AGENTS dan CP-0003; verifikasi dokumen lulus, folder dan instalasi belum dijalankan |
| DOC-WORKSPACE-BOOTSTRAP | Menetapkan target sebagai kanonis, menyalin review, menyiapkan .gitignore dan mencatat governance di Git lokal | DONE | PRD v1.8, CP-0004; verifikasi dokumen/ignore/tracked dan commit awal lokal |
| DOC-SKILLS-AUDIT | Audit statis snapshot claude-skills dan pemasangan 15 adaptasi proyek, manifest/index/verifier serta aturan pemakaian | DONE | [Audit](docs/skills-audit/REPORT.md), [indeks](docs/skills-index.md), manifest hash dan verifikasi struktur/integritas; bukan pengujian aplikasi |

## Antrean Fondasi

Daftar ini berasal dari PRD Fase 0. TODO berarti belum dikerjakan, bukan otomatis siap dieksekusi. Semua tugas implementasi tetap menunggu kewenangan pemilik; dependency yang belum tersedia dicatat pada kolom prasyarat.

| ID | Pekerjaan | Status | Prasyarat/keputusan utama |
|---|---|---|---|
| T-0.0 | Kunci identitas sumber/target, manifest dan kewenangan | IN_REVIEW | Lokasi/commit, daftar kandidat awal dan kebijakan Git disetujui (0.7). Toolchain/peer tambahan dan verifikasi lingkungan belum lengkap; bukan izin menjalankan seluruh fase |
| T-0.1 | Scaffold monorepo target | TODO | T-0.0 selesai; lokasi target terpisah dan izin implementasi tersedia |
| T-0.2 | Spike kompatibilitas runtime/library | TODO | Manifest versi/spike disetujui, target/lingkungan uji tersedia |
| T-0.3 | Introspect dan verifikasi pemetaan skema | TODO | DB dev anonim; bukan izin menjalankan DDL |
| T-0.4 | Baseline dan target scorecard | TODO | OQ-11; produksi diukur pemilik, dev sesuai kewenangan |
| T-0.5 | Inventaris SQL mentah | TODO | Commit sumber terkunci; audit baca-saja dalam scope tugas |
| T-0.7 | Referensi dan harness HTTP/worker | TODO | OQ-10; state/mock/clock/runner terisolasi |
| T-0.6 | Roundtrip waktu dan tipe | TODO | T-0.7 lebih dahulu; driver/schema dan fixture dev siap |
| T-0.8 | Inventaris fitur/config/skrip dan kontrak transisi | TODO | Commit/config/pemanggil eksternal dapat dibuktikan; OQ terkait dijawab |
| T-0.9 | Perkakas gerbang, coverage, desain dan migration-map | TODO | Struktur target dan kontrak artefak siap; tidak ada stub PASS palsu |

Fase 1 sampai 12 belum dimulai. Fase Android bersyarat sesuai OQ-12. Tugas port per kapabilitas M00..M12 dibuat setelah inventaris/spec terkait tersedia; jangan menganggap seluruh pekerjaan hanya sepuluh tugas fondasi di atas.

## Bukti dan Status Pengujian

- Pemeriksaan struktur/konsistensi dokumen v1.4 sebelumnya lulus pada sesi dokumentasi. Ini bukan hasil G0..G13 aplikasi target.
- Pemeriksaan dokumentasi v1.5 melalui Python pada sesi ini lulus (exit code 0): format Markdown dan tautan lokal pada ketiga file, konsistensi versi 1.5, keberadaan protokol/checkpoint, 10 ID tugas fondasi unik, serta kelestarian 64 aturan R, 43 KI, 14 pemetaan review dan blok graphify/antislop. Pemeriksaan ini hanya memverifikasi dokumen; tidak menyatakan kesiapan runtime atau kebenaran seluruh fitur aplikasi.
- Verifikasi dokumentasi v1.6 melalui Python lulus (exit code 0): format/tautan keempat file, bootstrap dan prompt yang mendahulukan HANDOVER, kesesuaian versi 1.6, riwayat CP-0001 dan sepuluh tugas fondasi dipertahankan, execution-state hanya pengarah, 64 aturan/43 KI serta blok graphify/antislop tetap tersedia. Validasi ini bukan pengujian aplikasi.
- Verifikasi dokumentasi v1.7 melalui Python lulus (exit code 0): konsistensi versi/path disetujui, Markdown/tautan, CP-0001/CP-0002 tetap ada, 64 aturan/43 KI/14 pemetaan review/10 tugas fondasi tetap lengkap, serta graphify/antislop tidak berubah. Pemeriksaan baca-saja mengonfirmasi HEAD sumber cocok dan folder target/referensi belum ada. Ini bukan bukti instalasi, kompatibilitas, atau pengujian aplikasi.
- Verifikasi v1.8: tautan dokumen aktif, format Markdown, kesesuaian versi, riwayat checkpoint, 64 aturan/43 KI/14 pemetaan review/10 tugas fondasi serta keutuhan blok graphify/antislop diperiksa. Laporan review identik dengan sumber; Git lokal memuat tepat empat Markdown governance dan .gitignore, tanpa remote. Pola ignore diuji terhadap dokumen, lockfile/migrasi serta contoh path rahasia/build/uploads. Hasil pemeriksaan ini hanya untuk persiapan workspace.
- Perintah pencatatan lokal: `git init -b rewrite/bootstrap`, `git add -- .gitignore AGENTS.md HANDOVER.md PRD-Dompis-v3-Agent-Governance.md REVIEW-PRD-Dompis-v3-Agent-Governance.md`, dan `git commit -m "chore: initialize rewrite governance baseline"`. Verifikasi dilakukan dengan `git ls-files`, `git check-ignore --no-index`, `git diff --check`, `git status --porcelain`, `git log -1 --oneline` dan `git remote`; tidak ada perintah push.
- Audit/paket skill v1.9: 468 entry point (401 utama + 67 integrasi), 5.824 file inventaris/4.182 teks dipindai; review semantik manual 15 entry point terpilih. Pemeriksaan statis seluruh katalog tidak sama dengan audit manual/runtime seluruh skrip. Hasil, alasan individual, indikator dan batas bukti ada pada laporan/registry.
- Validasi paket: quick_validate lokal untuk 15 skill; `python3 tools/skills/verify_skills.py` memeriksa hash/provenance, registry dan alias. Empat kasus negatif di salinan sementara harus gagal (isi berubah, alias hilang, file tambahan, provenance berubah). File/Git/dokumen diperiksa; tidak ada executable/hook upstream, instalasi global atau auto-update. CLI/model agent baru belum dijalankan; efektivitas workflow tetap memerlukan bukti tugas.
- Build, unit/integrasi aplikasi, parity, load/soak dan security runtime tidak dijalankan dalam pekerjaan dokumentasi. Pada tugas dokumen statusnya N/A; pada tugas implementasi yang memerlukannya bukti tersebut tetap belum tersedia.
- Tidak ada hasil peningkatan RAM/latensi/throughput yang dapat diklaim. Target numerik menunggu baseline dan keputusan OQ-11.
- Tidak ada commit implementasi rewrite, deploy/cutover atau pensiun kode yang dilakukan oleh sesi dokumentasi ini.

## Keputusan dan Blocker Terbuka

Ikuti register OQ-01..OQ-16 di PRD. OQ-09/OQ-16 terjawab sebagian oleh keputusan pemilik pada PRD 0.7; prasyarat lingkungan dan kebutuhan tambahan tetap harus diverifikasi.

Keputusan tersimpan: sumber/commit, target dompis-v3-app, path referensi, kandidat versi, kebijakan dokumen tracked, dan rencana repo GitHub baru oleh pemilik (PRD 0.7). Target dan repository Git lokal sudah tersedia. Yang belum selesai: toolchain/peer tambahan, lockfile, koneksi GitHub oleh pemilik, lingkungan referensi (OQ-10), baseline/target (OQ-11), dan bukti config/pemicu Nossa (OQ-01/OQ-04/OQ-15) untuk modul terkait. APK, perubahan visual dan kebijakan transisi tetap keputusan eksplisit pada tahapnya.

## Serah Terima dan Langkah Lanjut

1. Agent/model pengganti membaca HANDOVER.md terlebih dahulu, lalu AGENTS, PRD aktif dan dokumen bukti terkait. Periksa file/Git aktual, versi PRD, HEAD, perubahan lokal/ignored dan bukti yang dirujuk.
2. Jangan mengulang review atau revisi yang sudah tersedia tanpa alasan perubahan kontrak/sumber. Jangan menganggap file ini menyatakan scaffold/harness sudah ada.
3. Laporan pertama agent pengganti menyebut: implementasi belum dimulai; lokasi dan kandidat versi sudah disetujui pada PRD 0.7; target dompis-v3-app dan Git lokal sudah tersedia, dokumen target kanonis serta tracked; referensi dan remote GitHub belum disiapkan; sisa T-0.0 memerlukan kelengkapan toolchain dan lingkungan spike.
4. Jika pemilik hanya meminta pembahasan/dokumen, lanjutkan sebatas itu. Jika memberi tugas memulai fondasi, kerjakan prasyarat T-0.0 terlebih dahulu.
5. Sebelum menulis, pastikan penulis lama berhenti pada scope yang sama, lalu catat pemilik/scope baru. Status di Markdown bukan lock teknis atau persetujuan otomatis.
6. Sebelum berhenti, tingkatkan nomor checkpoint, perbarui waktu WIB, status tugas/gerbang/keputusan, perubahan parsial, resource aktif dan langkah berikutnya. Pertahankan riwayat dan bukti.

## Riwayat Checkpoint

| Checkpoint | Waktu | Cakupan dan hasil | Status handoff |
|---|---|---|---|
| CP-0001 | 2026-10-29 13:20:25 WIB | Inisialisasi progres dan validasi dokumen selesai; implementasi belum dimulai | READY_FOR_HANDOFF; penulis dokumentasi berhenti, belum ada izin implementasi |
| CP-0002 | 2026-10-29 13:43:20 WIB | Migrasi checkpoint kanonis ke HANDOVER.md dan aturan pembacaan pertama selesai diverifikasi; kode rewrite tetap belum dimulai | READY_FOR_HANDOFF; penulis dokumentasi berhenti, belum ada izin implementasi |
| CP-0003 | 2026-10-29 14:48:20 WIB | Keputusan pemilik dicatat dan diverifikasi: target dompis-v3-app, sumber/commit/referensi serta kandidat fondasi; GitHub baru dibuat/dihubungkan pemilik; kode belum ditulis | READY_FOR_HANDOFF; sisa T-0.0 IN_REVIEW; sesi dokumentasi selesai |
| CP-0004 | 2026-10-29 15:05:33 WIB | Target menjadi root dokumen kanonis; review disalin; .gitignore dan Git lokal pada rewrite/bootstrap mencatat baseline governance. Handover sumber menjadi pengarah; implementasi aplikasi belum dimulai | READY_FOR_HANDOFF; sisa T-0.0 IN_REVIEW; GitHub belum terhubung |
| CP-0005 | 2026-10-29 15:52:39 WIB | Audit statis snapshot claude-skills dan 15 adaptasi docs-only terpasang, indeks/manifest/validator serta bootstrap diperiksa; PRD v1.9. Tidak menjalankan implementasi aplikasi | READY_FOR_HANDOFF; T-0.0 IN_REVIEW; tanpa remote/push atau proses aplikasi baru |
