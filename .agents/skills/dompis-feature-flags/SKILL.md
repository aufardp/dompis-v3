---
name: dompis-feature-flags
description: "Merancang flag dan rollback modul Dompis dengan satu pemilik aktif, default aman, observasi dan syarat pensiun sesuai PRD."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Flag dan Rollback Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Tentukan tujuan, owner, dependency, default aman, cohort/path routing dan kondisi rollback berdasarkan risiko modul; jangan menambah provider flag atau A/B fitur baru tanpa keputusan.
2. Petakan seluruh writer/producer/consumer yang terpengaruh; persentase rollout tidak boleh menghasilkan dua penulis aktif pada fungsi/resource yang sama tanpa kontrak ownership.
3. Definisikan pemantauan latensi/error/freshness/kuota, threshold disetujui, cara menonaktifkan dan verifikasi state/queue setelahnya.
4. Flag keamanan tidak boleh menghidupkan kembali celah lama. Rollback harus aman bagi sesi, job tertunda dan transaksi sah.
5. Uji kedua cabang aman di staging/dev sesuai izin. Catat tanggal/syarat pensiun pada migration-map; aturan observasi/penghapusan mengikuti PRD, bukan default cleanup 7 hari atau batas usia scanner.

Hasil yang diharapkan: Kontrak flag, owner, kill switch/rollback, kasus uji serta syarat pensiun; eksekusi rollout tetap tugas terpisah.

Adaptasi: Menghapus context: fork, pemilihan SaaS otomatis, cleanup 7+ hari dan batas flag generik; tidak memasang slash command yang menghapus kode.

Sumber: [feature-flags-architect](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/feature-flags-architect/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
