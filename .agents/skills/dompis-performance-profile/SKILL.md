---
name: dompis-performance-profile
description: "Menyusun baseline dan menguji bottleneck latency, memori, query, queue serta bundle Dompis dengan workload sebanding."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Profil Performa Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Pastikan workload, data anonim, lingkungan terisolasi dan target scorecard Bagian 7/OQ-11 tersedia. Pengukuran produksi disediakan pemilik; agent tidak terhubung ke DB produksi.
2. Rekam versi/konfigurasi, warmup, jumlah pengulangan, concurrency, p50/p95/p99, throughput, error, CPU, RSS tiap proses dan total web/API/workers beserta instance/pool.
3. Ukur query count/latency, EXPLAIN dev, pool, event-loop, queue wait/backlog, projection lag/freshness, cache serta bundle/UX sesuai gejala. Tools Node tidak otomatis kompatibel dengan Bun.
4. Uji satu hipotesis per tugas F setelah baseline P/H. Bandingkan sebelum/sesudah dengan workload identik serta hasil bisnis/tipe/atomicity tetap dilindungi.
5. Tolak klaim peningkatan dari perpindahan framework, grep file besar atau batas restart PM2. Catat overhead instrumentation, variansi dan metrik pelindung; target angka tidak dibuat dari contoh.

Hasil yang diharapkan: Scorecard dengan data sebelum/sesudah, bukti bottleneck, tradeoff, batas rollback dan keterbatasan; tanpa data, jangan mengklaim peningkatan.

Adaptasi: Profiling/load produksi dan recipe Node/Next bukan perintah langsung untuk target Bun/SvelteKit; scanner statis bukan benchmark.

Sumber: [performance-profiler](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/performance-profiler/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
