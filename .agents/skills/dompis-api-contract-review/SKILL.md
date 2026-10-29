---
name: dompis-api-contract-review
description: "Meninjau parity kontrak endpoint Dompis: method/path, status, cookie, tipe respons, role/scope dan dampak perubahan API."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Review Kontrak API Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Baca route sumber pada commit baseline, pemanggil UI/worker/script dan spec endpoint. Inventaris seluruh method yang diekspor, bukan hanya nama file.
2. Bandingkan method/path, query/body, status, header, cookie/redirect, error, pagination, unduhan dan tipe JSON secara ketat. Pertahankan field eksternal sesuai kontrak walaupun gaya internal camelCase.
3. Periksa validasi, identitas, role/alias, scope wilayah/objek, rate limit dan efek samping di API/core. Jangan memindahkan akses DB ke apps/web.
4. Catat delta nyata beserta konsumen yang terdampak. Usulan normalisasi URL, envelope, nama field atau enum adalah perubahan kontrak; penambahan enum tidak otomatis kompatibel.
5. Untuk P/F1 minta parity pada state terisolasi; F2/S hanya menerima delta DBC yang disetujui. Skor lint REST tidak menggantikan gerbang proyek atau bukti runtime.

Hasil yang diharapkan: Matriks kontrak lama/target, temuan berbukti, kelas perubahan, dampak pemanggil dan bukti gerbang yang masih diperlukan.

Adaptasi: Tidak memaksakan kebab-case, camelCase respons, URL /v1, envelope atau alat lint upstream pada kontrak lama.

Sumber: [api-design-reviewer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/api-design-reviewer/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
