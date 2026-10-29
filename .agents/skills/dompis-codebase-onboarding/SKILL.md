---
name: dompis-codebase-onboarding
description: "Memetakan source Dompis dan dependensinya untuk inventaris rewrite atau orientasi agent baru setelah membaca handover."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Inventaris Source Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Cocokkan checkpoint, SOURCE_ROOT/COMMIT dan TARGET_ROOT dengan Git aktual; jangan menganggap folder target berisi scaffold.
2. Gunakan graphify query bila graph tersedia pada sumber, lalu rg untuk menemukan route, halaman, pemicu worker, script, config dan pemanggil eksternal dalam cakupan tugas.
3. Baca penuh file aplikasi dan pemanggil yang memengaruhi kontrak. Bedakan konfigurasi repository, konfigurasi efektif dan perilaku runtime yang belum terbukti.
4. Petakan hasil ke modul M00..M12 dan ID FEAT yang sudah ada; catat jumlah aktual, entry point, ownership, sumber file:baris dan unknown. Inventaris bukan izin mem-port semua temuan.
5. Perbarui artefak inventaris yang sudah ada sesuai tugas; jangan membuat onboarding atau catatan progres kedua yang menduplikasi HANDOVER.

Hasil yang diharapkan: Inventaris berisi scope, commit, pemanggil, ownership, bukti file:baris, ketidakpastian dan satu tugas lanjut yang prasyaratnya terpenuhi.

Adaptasi: Scanner upstream tidak dibawa; verifikasi dilakukan lewat file/Git aktual. Tidak menguji perintah setup di folder sumber. Resume memakai HANDOVER kanonis.

Sumber: [codebase-onboarding](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/codebase-onboarding/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
