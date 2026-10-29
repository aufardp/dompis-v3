---
name: dompis-migration-planning
description: "Menyusun transisi modul Dompis, ownership producer/consumer/writer, rekonsiliasi dan rollback untuk coexistence v2-v3."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Perencanaan Transisi Modul Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Pilih satu kapabilitas dengan feature matrix dan migration-map. Identifikasi seluruh pemanggil API/UI/script/cron dan kontrak sesi/aset/routing.
2. Petakan ownership writer per fungsi/sumber/kolom, seluruh producer/consumer, job tertunda, checkpoint, cache/invalidation, SSE, lock/limiter dan outbox.
3. Rancang perpindahan bertahap dengan tepat satu implementasi aktif per fungsi produksi. Jangan menerapkan dual-write atau shadow mutasi produksi; parity memakai lingkungan dev terisolasi.
4. Rancang drain/alih producer dan consumer, rekonsiliasi, batas stale, sinyal berhenti dan rollback yang mempertahankan transaksi sah. QOSMIC tetap satu kuota lintas versi/proses.
5. Catat prasyarat cutover/UAT dan observasi sesuai PRD. Pensiun worker minimal 14 hari dan API/UI minimal 30 hari dengan syarat lengkap, pemanggil/trafik nol dan manifes disetujui; 72 jam monitoring bukan izin pensiun.

Hasil yang diharapkan: Transition-contract dan rencana rollback yang dapat ditinjau, dependency belum terpenuhi serta keputusan produksi yang tetap menjadi kewenangan pemilik.

Adaptasi: Tidak membawa CDC, dual-write, shadow traffic, repair otomatis, schema rollback atau penghapusan legacy otomatis dari contoh upstream.

Sumber: [migration-architect](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/migration-architect/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
