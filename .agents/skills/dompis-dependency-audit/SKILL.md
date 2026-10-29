---
name: dompis-dependency-audit
description: "Meninjau manifest, lockfile, kompatibilitas Bun dan dependency Dompis tanpa mengubah versi atau memasang paket di luar kewenangan."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Audit Dependency Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Inventaris manifest/lockfile target dan kandidat PRD 0.7; bedakan versi yang disetujui, terpasang, terkunci dan kompatibilitas yang belum diuji.
2. Periksa peer/runtime/adapter/Vite/plugin, batas dukungan Bun dan kebutuhan nyata tiap paket menggunakan dokumentasi resmi yang berlaku.
3. Catat dependency langsung/transitif, lisensi, provenance, rilis/advisory bertanggal dan ruang penggunaan. Scanner offline dengan aturan tetap tidak membuktikan bebas CVE terkini.
4. Buat usulan pin/patch dengan alasan, alternatif, dampak kontrak, spike, regression checks dan rollback; perubahan di luar manifest mengikuti R-09.
5. Jangan menerapkan patch secara otomatis atau menjalankan installer/update tanpa scope yang mengizinkannya. Jangan mengubah package/lockfile sumber.

Hasil yang diharapkan: Inventaris dependency, bukti advisory/kompatibilitas, selisih manifest dan rencana perubahan yang dapat ditinjau; unknown tetap tercatat.

Adaptasi: Menghapus apply-immediately untuk patch serta ketergantungan pada scanner CVE offline; manifest PRD dan persetujuan yang sudah ada dipertahankan.

Sumber: [dependency-auditor](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/dependency-auditor/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
