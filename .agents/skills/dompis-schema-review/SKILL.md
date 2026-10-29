---
name: dompis-schema-review
description: "Memeriksa pemetaan MySQL ke Drizzle Dompis, tipe/waktu, generated columns, indeks dan kompatibilitas tanpa menjalankan DDL."
license: MIT
metadata:
  upstream-commit: "0496583603e56cdd5022dd61c823bd784a80a752"
  distribution: "dompis-project-adaptation"
---

# Review Pemetaan MySQL Dompis

Jika konteks sesi belum diverifikasi, baca [HANDOVER](../../../HANDOVER.md) terlebih dahulu, lalu AGENTS dan PRD aktif. Ikuti [kebijakan skill proyek](../../../docs/skills-index.md#batas-penggunaan). Skill ini membantu tugas yang sudah diizinkan; pemasangannya bukan izin memulai implementasi atau produksi.

1. Gunakan hanya DB dev anonim dengan kewenangan yang tercatat. Sumber DDL adalah SHOW CREATE TABLE dev; cocokkan schema Prisma, migrasi dan hasil introspect.
2. Petakan seluruh kolom/relasi/default/nullability, DateTime/Timestamp/Date, BigInt/Decimal/JSON, presisi dan serialisasi. Verifikasi default sisi klien dan @updatedAt Prisma satu per satu.
3. Generated columns hanya-baca dan tidak masuk INSERT/UPDATE/upsert. Pertahankan FULLTEXT, indeks DESC dan nama map; catat perbedaan introspect sebagai temuan.
4. Uji roundtrip lintas driver/versi sesuai T-0.6 setelah referensi T-0.7 siap; jangan memperbaiki nowWib atau mengubah ID, soft delete, tenant, tipe waktu maupun skema pada tugas port.
5. Usulan indeks/constraint/skema hanya dokumen dengan query/EXPLAIN, dampak tulis dan rollback. Pemilik menerapkan DDL lewat migrasi Prisma selama coexistence.

Hasil yang diharapkan: Matriks pemetaan, selisih DDL, bukti tipe/waktu, hasil G9 yang sah atau blocker, dan usulan terpisah bila diperlukan.

Adaptasi: Menghapus RLS/PostgreSQL, partial index generik, seed otomatis, perubahan UUID/soft delete serta generate/push/migrate Drizzle; MySQL tetap.

Sumber: [database-schema-designer](https://github.com/alirezarezvani/claude-skills/blob/0496583603e56cdd5022dd61c823bd784a80a752/engineering/skills/database-schema-designer/SKILL.md), commit `0496583603e5`. Ini adaptasi dokumentasi proyek, bukan paket upstream utuh; skrip/hook dan dependency upstream tidak disertakan. Atribusi dan lisensi: [THIRD_PARTY_NOTICES](../../../docs/skills-audit/THIRD_PARTY_NOTICES.md).
