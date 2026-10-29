---
name: dompis-observability-design
description: "Merancang metrics/log/traces Dompis untuk kesegaran data, queue, limiter, error dan diagnosis regresi tanpa membocorkan rahasia."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Observability Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Turunkan sinyal dari alur pengguna, ownership dan scorecard yang disetujui: request/error/duration, resource saturation, queue wait/depth, ingestion/projection lag dan kelengkapan data.
2. Gunakan correlation ID yang menghubungkan request-job-projection tanpa token, password, payload pelanggan atau label metrik ber-cardinality tak terbatas.
3. Catat kesehatan limiter global QOSMIC, retry/timeout, lock renewal, stale checkpoint, DLQ dan efek Redis outage sesuai kontrak; angka config repository bukan config efektif.
4. Untuk setiap alert tentukan sinyal, window, ambang yang disetujui, owner, tindakan/runbook, debounce/hysteresis dan recovery. Jangan memasang Grafana/Prometheus/SaaS atau mengirim notifikasi tanpa tugas yang mencakupnya.
5. Verifikasi metric benar-benar emitted, label stabil, log tersensor, trace context tersambung dan overhead terukur di dev. Dashboard template atau gambar panel bukan bukti telemetry runtime.

Hasil yang diharapkan: Rancangan sinyal/alert dan bukti dev yang tersedia; konfigurasi deployment/threshold yang belum disepakati tetap terbuka.

Adaptasi: Tidak memaksakan stack monitoring/provider atau deployment alert; metrik freshness dan kuota bersama Dompis ditambahkan.

Sumber: [observability-designer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/observability-designer/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
