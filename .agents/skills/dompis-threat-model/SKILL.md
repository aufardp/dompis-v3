---
name: dompis-threat-model
description: "Memetakan ancaman dan trust boundary modul Dompis, termasuk auth, role/scope, upload, SSE, queue dan integrasi eksternal."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Threat Model Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Petakan aset, aktor, identitas proses, store dan aliran data modul yang ditugaskan. Tandai batas browser/API/core/MySQL/Redis/worker/bridge serta efek keluar.
2. Gunakan STRIDE per elemen: spoofing, tampering, repudiation, information disclosure, denial of service dan privilege escalation; jelaskan kondisi, kontrol dan resource terdampak.
3. Hubungkan kandidat dengan kode/config dan KI terkait. Bedakan TERBACA/PERLU-VERIFIKASI/HIPOTESIS dari reproduksi yang benar-benar dibuktikan; skor risiko tidak membuktikan kerentanan.
4. Rancang bukti lokal dengan identitas/fixture dummy, mock dan tanpa produksi. Periksa role/alias, cakupan wilayah/objek, sesi/revokasi, path upload, SSE, internal trigger dan secret leakage.
5. Catat mitigasi, owner, regression oracle dan DBC untuk perubahan kontrak F2/S. Jangan mengubah algoritma hash/token atau membuka jalur rentan demi parity; temuan S0/S1 dilaporkan sesuai PRD.

Hasil yang diharapkan: Data-flow/trust-boundary dan threat register berbukti, prioritas beserta ketidakpastian, mitigasi dan verifikasi yang diperlukan.

Adaptasi: Tidak memuat sibling security skill yang tidak terpasang atau mengeksekusi scanner upstream; DREAD bukan bukti, password hash lama tidak diganti diam-diam.

Sumber: [senior-security](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/senior-security/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
