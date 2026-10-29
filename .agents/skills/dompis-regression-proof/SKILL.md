---
name: dompis-regression-proof
description: "Membuktikan satu bug Dompis dengan assertion merah sebelum fix, hijau sesudah fix dan kontrol pembanding aman di lingkungan terisolasi."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Bukti Regresi Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Pilih satu KI/bug yang ditugaskan; cocokkan mekanisme, kontrak dan riwayat. Nyatakan mana yang terbukti, terbaca atau belum diketahui sebelum memperbaiki.
2. Tentukan command test yang tersedia dan failure assertion yang mengukur akibat bagi pengguna/state. Jalankan pada keadaan belum diperbaiki; error import atau not implemented bukan reproducer yang sah.
3. Terapkan fix terkecil di target dalam tugas F/S yang sah. Jalankan command/assertion yang sama dan simpan hasil hijau.
4. Bila perlu membuktikan test peka terhadap fix, jalankan pembanding tanpa fix di salinan/worktree dev terisolasi, bukan dengan revert/stash/reset di source atau workspace bersama. Jika pembanding tidak tersedia, catat batas bukti.
5. Jalankan gerbang regresi relevan, simpan command/exit/output yang tersensor dan state akhir. Model/structural/characterization test diberi label dan tidak dilaporkan sebagai parity runtime.

Hasil yang diharapkan: Bukti merah/hijau dan pembanding bila dijalankan, penyebab, kelas test, hasil gerbang serta ketidakpastian yang tersisa.

Adaptasi: Mengganti revert langsung pada file sumber/shared dengan pembanding terisolasi. Menjaga attribution RooAGI/MIT dan tidak mengklaim uji yang belum dijalankan.

Sumber: [red-green-proof](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering-team/skills/red-green-proof/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
