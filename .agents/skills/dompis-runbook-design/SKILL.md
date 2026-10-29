---
name: dompis-runbook-design
description: "Menyusun runbook operasional Dompis dengan prasyarat, perintah terverifikasi, sinyal hasil, ownership dan rollback."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Runbook Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Identifikasi service/pemicu, versi/config efektif, owner, izin, dependency, state dan scope lingkungan; jangan menebak URL, branch, credential atau command yang belum ada.
2. Tuliskan preflight, urutan tindakan, expected output, batas waktu, sinyal berhenti/rollback, rekonsiliasi dan recovery untuk setiap langkah.
3. Bedakan diagnosis baca-saja, tindakan pemilik dan mutasi dev yang ditugaskan. DB produksi, DDL, real notification dan restart/deploy produksi bukan tindakan otomatis agent.
4. Cakup queue drain/retry/DLQ/checkpoint, limiter QOSMIC, lock/Redis outage, freshness serta ownership ketika relevan; backup tidak boleh ditimpa untuk sekadar mencoba rollback.
5. Verifikasi command dan hasil di lingkungan dev/staging yang diizinkan; langkah belum diuji ditandai UNVERIFIED/BLOCKED. Link ke HANDOVER untuk progres, jangan menduplikasinya ke runbook.

Hasil yang diharapkan: Runbook dapat ditinjau dengan command aktual atau placeholder yang jelas, evidence rehearsal, batas kewenangan dan risiko tersisa.

Adaptasi: Tidak membawa generator executable, endpoint contoh, atau menjalankan deploy/restart hanya untuk memvalidasi template.

Sumber: [runbook-generator](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/runbook-generator/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
