---
name: dompis-spec-workflow
description: "Menyusun spec kapabilitas rewrite Dompis dengan ID fitur, kontrak field, acceptance, dependency dan gerbang sebelum implementasi."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Spec Kapabilitas Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Pilih satu tugas dan modul dari antrean yang sah. Muat PRD dan keputusan yang relevan; gunakan keputusan yang sudah disetujui tanpa meminta ulang.
2. Susun Catatan Perilaku dan Kontrak Field dari source terkunci: input/output, tipe JSON, waktu WIB, otorisasi, transaksi, efek samping dan pemanggil.
3. Tulis requirement dan Given/When/Then dengan keterlacakan ke FEAT, kasus gagal/tepi/race dan ukuran performa yang telah disepakati; keputusan belum ada ditulis terbuka, bukan ditebak.
4. Tentukan scope file, dependency, kelas P/H/F1/F2/S, gerbang menurut PRD 5.3 serta rollback. Port, hunt dan fix tetap tugas terpisah.
5. Tinjau kelengkapan requirement terhadap acceptance dan bukti. Test stub yang gagal karena belum diimplementasikan bukan reproducer bug atau bukti parity; kelulusan skor template bukan persetujuan spec.

Hasil yang diharapkan: Spec siap ditinjau, peta requirement-ke-acceptance, keputusan yang masih terbuka dan status kesiapan yang jujur.

Adaptasi: Menghapus asumsi validator 80+, stub gagal sebagai bukti, interview ulang otomatis, parallel agent otomatis dan approval berulang untuk scope yang sudah sah.

Sumber: [spec-driven-workflow](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/spec-driven-workflow/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
