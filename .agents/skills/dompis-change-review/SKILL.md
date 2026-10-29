---
name: dompis-change-review
description: "Meninjau diff rewrite Dompis untuk kontrak, keamanan, dependency, performa, scope dan bukti sebelum commit atau merge yang ditugaskan."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Review Perubahan Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Baca tugas/spec/kelas perubahan dan diff aktual, lalu file terkait beserta pemanggilnya. Petakan dampak pada service, API, worker, config, tipe dan efek samping.
2. Periksa aturan PRD yang relevan, role/scope, transaksi/idempotensi, tipe/waktu, generated read-only, query binding dan ownership lintas versi.
3. Periksa test yang bermakna serta gerbang tahap: tidak ada penghapusan/pelemahan test, stub PASS, stderr disembunyikan, atau pipeline shell yang kehilangan exit code test.
4. Periksa memory/query/bundle, dependency manifest, parameter runtime dan batas scope. Rasio baris kode/test atau angka coverage generik tidak menggantikan acceptance proyek.
5. Setiap temuan menyebut file:baris, mekanisme, dampak, bukti dan koreksi terkecil. Pisahkan blocking, saran dan hal belum terverifikasi; jangan membuat temuan untuk memenuhi kuota.
6. Review dapat dilakukan lokal; jangan memposting komentar, menghubungi Jira/Linear, merge atau push tanpa instruksi. Perbarui handover sesuai batas tugas.

Hasil yang diharapkan: Temuan berprioritas, cakupan review, gerbang aktual, risiko tersisa dan kesiapan sesuai tahap; bukan klaim rewrite selesai.

Adaptasi: Menghapus akses Jira/Linear, coverage 100%/5% generik, auto-index, test piped to tail dan ketergantungan wajib pada remote PR.

Sumber: [pr-review-expert](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/pr-review-expert/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
