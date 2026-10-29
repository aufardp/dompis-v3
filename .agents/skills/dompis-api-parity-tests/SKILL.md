---
name: dompis-api-parity-tests
description: "Merancang atau menulis pengujian kontrak API Dompis pada harness dev terisolasi, termasuk state, efek samping, auth dan kasus race."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Pengujian Parity API Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Pastikan spec, manifest test runner, referensi HTTP/worker dan izin pengujian tersedia; jangan menginstal Supertest/Vitest/Pytest karena contoh upstream.
2. Gunakan dua state awal identik atau reset lengkap yang terbukti, fixture anonim, clock terkendali serta mock QOSMIC/FCM/webhook. Setiap test punya ID acceptance dan oracle.
3. Cakup sukses, input hilang/null/tipe salah/batas, role/alias, cakupan wilayah/objek, sesi kedaluwarsa, replay/idempotensi, race, upload dan rate limit sesuai endpoint.
4. Bandingkan status/header/cookie/redirect serta JSON dengan tipe ketat, state DB, histori, audit, file fixture, queue/outbox dan invalidasi cache yang menjadi kontrak.
5. Expected status/error mengikuti baseline aman atau DBC, bukan tabel HTTP generik. Ketiadaan SQL injection dibuktikan lewat hasil/state/invariant; status 200 saja bukan bukti sanitasi.
6. Catat command yang benar-benar tersedia, exit code, failure assertion, commit dan lingkungan. Jangan menjalankan cleanup data di sumber atau produksi.

Hasil yang diharapkan: Kasus uji bermakna dengan hasil nyata atau status BLOCKED dan prasyarat spesifik; bukan daftar test stub yang dilaporkan PASS.

Adaptasi: Mengganti template Next/Express dan status generik dengan kontrak Elysia/SvelteKit yang diuji; tidak membawa dependency atau cleanup DB otomatis.

Sumber: [api-test-suite-builder](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/api-test-suite-builder/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
