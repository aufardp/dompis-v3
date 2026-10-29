---
name: dompis-ci-design
description: "Merancang atau meninjau quality gates CI Dompis dari manifest Bun dan gerbang PRD yang benar-benar tersedia."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Rancangan CI Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Inventaris package scripts, Bun/version/lockfile dan struktur target yang benar-benar ada; jangan membuat perintah lint/test/build palsu atau menyalin npm defaults.
2. Petakan G0..G13 ke tahap dokumen/fondasi/P/H/F/cutover sesuai PRD 5.3. Gerbang belum tersedia adalah BLOCKED pada tahap pemakainya; jangan menulis exit 0 sebagai pengganti.
3. Rancang job reproducible dengan versi action/runtime terkunci sesuai kebijakan, izin minimum, cache key berbasis lockfile dan pemisahan artefak dari rahasia/uploads.
4. Uji harness dengan fixture anonim, DB/Redis/mock terisolasi dan tanpa endpoint produksi. Pastikan failure dan exit code mencapai CI.
5. Pisahkan CI dari deploy; izin memasang skill atau menulis pipeline tidak memberi izin mengaktifkan workflow remote, memasang secret, menerapkan DDL atau deploy/push.

Hasil yang diharapkan: Peta gerbang-ke-job dan konfigurasi yang sesuai tugas, command tersedia, prasyarat lingkungan dan hasil validasi yang nyata.

Adaptasi: Generator/default npm dan deploy otomatis tidak dibawa; tidak membuat workflow aplikasi dalam sesi pemasangan skill ini.

Sumber: [ci-cd-pipeline-builder](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/ci-cd-pipeline-builder/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
