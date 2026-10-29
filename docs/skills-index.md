# Skill Proyek untuk Rewrite Dompis

Baca [HANDOVER](../HANDOVER.md) terlebih dahulu, lalu [AGENTS](../AGENTS.md), [PRD aktif](../PRD-Dompis-v3-Agent-Governance.md) dan bukti tugas. Skill membantu pelaksanaan; status progres hanya di HANDOVER.

## Batas penggunaan

- Instruksi pemilik dan kontrak PRD yang disetujui menentukan kewenangan serta hasil. Skill lokal tidak dapat mengganti stack, memperluas fitur, mengubah kontrak tanpa DBC atau melonggarkan gerbang.
- Pilih skill yang sesuai tugas; muat isinya ketika diperlukan. Jangan membaca seluruh katalog pada setiap sesi atau menjalankan seluruh fase karena skill terpasang. Pemilihan skill otomatis tetap boleh bila cocok dengan tugas; mutasi memerlukan kewenangan tugas tersebut.
- Sumber aplikasi tetap read-only. Tidak mengakses DB produksi, menjalankan DDL, menyalin uploads produksi, membocorkan secret/PII, mengirim efek keluar nyata dari uji atau mengaktifkan penulis produksi ganda.
- P/H/F/R tetap terpisah. Sumber menjelaskan baseline, spec/DBC disetujui menjelaskan tujuan, dan HANDOVER mencatat progres. Skill tidak membuka catatan progres atau memori kedua.
- Tidak ada hook, cron, auto-update, auto-memory, plugin/MCP baru, model override atau sub-agent otomatis dalam paket ini. Kerja paralel tetap mengikuti kewenangan dan pembagian scope PRD.
- Contoh/skrip upstream bukan perintah proyek. Paket lokal hanya memuat SKILL.md adaptasi; tidak ada Python/shell executable upstream. Alat verifikasi lokal hanya membaca file dan membandingkan manifest.
- Bila skill global/proyek lain bertentangan dengan kontrak Dompis, gunakan aturan Dompis pada tugas ini. Jangan menyalin instruksi upstream untuk menimpa HANDOVER/AGENTS/PRD.

## Pilih menurut tugas

| Skill lokal | Gunakan ketika | Tahap/artefak terkait |
|---|---|---|
| [dompis-codebase-onboarding](../.agents/skills/dompis-codebase-onboarding/SKILL.md) | Memetakan source Dompis dan dependensinya untuk inventaris rewrite atau orientasi agent baru setelah membaca handover. | Inventaris M00..M12; T-0.5/0.8 |
| [dompis-spec-workflow](../.agents/skills/dompis-spec-workflow/SKILL.md) | Menyusun spec kapabilitas rewrite Dompis dengan ID fitur, kontrak field, acceptance, dependency dan gerbang sebelum implementasi. | Spec/behavior/field contract sebelum P |
| [dompis-api-contract-review](../.agents/skills/dompis-api-contract-review/SKILL.md) | Meninjau parity kontrak endpoint Dompis: method/path, status, cookie, tipe respons, role/scope dan dampak perubahan API. | Route-inventory, P/F dan DBC |
| [dompis-api-parity-tests](../.agents/skills/dompis-api-parity-tests/SKILL.md) | Merancang atau menulis pengujian kontrak API Dompis pada harness dev terisolasi, termasuk state, efek samping, auth dan kasus race. | Harness T-0.7; G4 |
| [dompis-schema-review](../.agents/skills/dompis-schema-review/SKILL.md) | Memeriksa pemetaan MySQL ke Drizzle Dompis, tipe/waktu, generated columns, indeks dan kompatibilitas tanpa menjalankan DDL. | T-0.3/0.6; G9 |
| [dompis-migration-planning](../.agents/skills/dompis-migration-planning/SKILL.md) | Menyusun transisi modul Dompis, ownership producer/consumer/writer, rekonsiliasi dan rollback untuk coexistence v2-v3. | Transition-contract; cutover/R |
| [dompis-dependency-audit](../.agents/skills/dompis-dependency-audit/SKILL.md) | Meninjau manifest, lockfile, kompatibilitas Bun dan dependency Dompis tanpa mengubah versi atau memasang paket di luar kewenangan. | T-0.0/0.2; R-09 |
| [dompis-performance-profile](../.agents/skills/dompis-performance-profile/SKILL.md) | Menyusun baseline dan menguji bottleneck latency, memori, query, queue serta bundle Dompis dengan workload sebanding. | T-0.4; P/H baseline; F scorecard |
| [dompis-observability-design](../.agents/skills/dompis-observability-design/SKILL.md) | Merancang metrics/log/traces Dompis untuk kesegaran data, queue, limiter, error dan diagnosis regresi tanpa membocorkan rahasia. | Observability modul dan transisi |
| [dompis-threat-model](../.agents/skills/dompis-threat-model/SKILL.md) | Memetakan ancaman dan trust boundary modul Dompis, termasuk auth, role/scope, upload, SSE, queue dan integrasi eksternal. | Threat model; Jalur S |
| [dompis-change-review](../.agents/skills/dompis-change-review/SKILL.md) | Meninjau diff rewrite Dompis untuk kontrak, keamanan, dependency, performa, scope dan bukti sebelum commit atau merge yang ditugaskan. | Review sesuai gerbang tahap |
| [dompis-regression-proof](../.agents/skills/dompis-regression-proof/SKILL.md) | Membuktikan satu bug Dompis dengan assertion merah sebelum fix, hijau sesudah fix dan kontrol pembanding aman di lingkungan terisolasi. | H/F dan uji regresi |
| [dompis-ci-design](../.agents/skills/dompis-ci-design/SKILL.md) | Merancang atau meninjau quality gates CI Dompis dari manifest Bun dan gerbang PRD yang benar-benar tersedia. | T-0.9 dan quality gates |
| [dompis-feature-flags](../.agents/skills/dompis-feature-flags/SKILL.md) | Merancang flag dan rollback modul Dompis dengan satu pemilik aktif, default aman, observasi dan syarat pensiun sesuai PRD. | Flag/rollback/transisi |
| [dompis-runbook-design](../.agents/skills/dompis-runbook-design/SKILL.md) | Menyusun runbook operasional Dompis dengan prasyarat, perintah terverifikasi, sinyal hasil, ownership dan rollback. | Runbook dan rehearsal terisolasi |

## Lokasi dan sesi baru

Root kanonis adalah `.agents/skills/<nama>/SKILL.md`. Codex dan OpenCode mendukung lokasi proyek ini. `.claude/skills/<nama>` berisi symlink relatif ke folder yang sama untuk Claude Code; tidak ada salinan aturan kedua. CLAUDE.md hanya pengarah bootstrap ke HANDOVER dan AGENTS. Aturan global/setting platform dapat memengaruhi discovery, sehingga periksa daftar skill pada sesi yang dipakai.

Mulai sesi berikutnya dari `/Users/pakbreng/Projects/dompis-v3-app` agar skill proyek berada dalam workspace agent. Skill tersedia untuk sesi/turn berikutnya yang memuat ulang katalog. Jika alat tidak mendukung discovery skill, minta agent membaca file SKILL.md terpilih sesudah handover dan verifikasi konteks. Pada clone yang tidak memulihkan symlink, gunakan path kanonis sebagai fallback; jangan membuat fork isi skill.

Struktur dan symlink telah diverifikasi di filesystem, tetapi belum diuji dengan menjalankan setiap CLI/model agent. Instalasi ini tidak menjamin agent selalu menaati instruksi; verifikasi output dan bukti tiap tugas tetap diperlukan.

Contoh prompt tugas dokumen berikutnya:

```text
Baca HANDOVER.md terlebih dahulu, lalu AGENTS.md dan PRD aktif.
Laporkan checkpoint dan prasyarat yang belum lengkap. Gunakan
dompis-dependency-audit untuk meninjau sisa toolchain T-0.0.
Hanya audit dan usulan; jangan install dependency atau membuat scaffold.
```

## Provenance dan perubahan paket

Audit dan keputusan setiap entri tersedia di [laporan](skills-audit/REPORT.md) dan [registry](skills-audit/registry.json). Pin upstream dan hash lokal tersedia pada [.agents/skills-lock.json](../.agents/skills-lock.json); lisensi pada [THIRD_PARTY_NOTICES](skills-audit/THIRD_PARTY_NOTICES.md).

Periksa integritas dari root target:

```sh
python3 tools/skills/verify_skills.py
```

Pembaruan upstream harus diaudit terhadap commit tertentu, ditinjau delta-nya, lalu memperbarui skill lokal/manifest/bukti dan HANDOVER dalam tugas terpisah. Jangan menghapus pin atau mengunduh instruksi baru saat tugas aplikasi berjalan. Perubahan skill bukan bukti build/parity atau kenaikan kesiapan implementasi.

Dasar lokasi discovery diperiksa pada dokumentasi resmi: [OpenAI](https://learn.chatgpt.com/docs/build-skills), [Claude Code](https://code.claude.com/docs/en/skills), dan [OpenCode](https://opencode.ai/docs/skills/).
