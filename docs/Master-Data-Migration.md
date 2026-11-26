# Master data & user migration — v1.3

## Kebijakan v1.3 (berlaku atas seluruh dokumen)
Pemilik mengizinkan agent lokal mengakses MySQL dan PostgreSQL, read dan write. Akses aktual bergantung pada credential, jaringan, privilege dan sandbox agent; jangan mengakali kontrol. Gunakan Database-Access.md sebagai kebijakan otoritatif. Read produksi yang ringan dan write rutin terukur dalam target yang telah didaftarkan tidak memerlukan konfirmasi per query. Operasi produksi berisiko tinggi, perubahan schema produksi, bulk correction, freeze/cutover dan tindakan irreversible memerlukan persetujuan runbook khusus. Source legacy tetap read-only; database bukan source code. Discovery tidak mengubah data bisnis produksi. Semua rancangan teknis termasuk DDL, jumlah tabel/index dan alias adalah kandidat, bukan kontrak tetap. Direct matching Workzone diutamakan; buktikan keunikan global setelah normalisasi, jika ambigu gunakan pembeda yang terverifikasi, jangan menebak. Alias hanya bila terbukti diperlukan. Requirement bisnis, integritas historis, keamanan dan stack tetap wajib. Lihat Discovery-Protocol.md dan Decision-Log.md.

Based on uploaded `prisma/schema.prisma` models, not live DB. Local agent must verify actual deployed DDL, data and access behavior; no direct MySQL RENAME. All target entity IDs UUIDv7.

| Legacy table/fields | New target | Transformation |
|---|---|---|
| no direct top-level equivalent | area | approved new code/name + region membership; no guessed mapping |
| region: id_region,nama_region,is_active | region | UUID, approved area_id and code; preserve name/active |
| branch: id_branch,nama_branch,kode_branch,region_id | branch | UUID, region ID mapping, code/name; reject orphan |
| area: id_area,nama_area,branch_id | service_area | UUID, branch mapping, approved stable code (legacy lacks explicit code), name |
| service_area: id_sa,nama_sa,area_id | workzone | UUID, service_area mapping via old area_id; verify actual NOSSA workzone code/name, resolve null/duplicates |
| users: id_user,nik,nama,jabatan,username,password,role_id,region_id,branch_id,area_id | users | UUID; normalized username, display_name, approved role + active flag; verify hash or reset; nik/jabatan only approved retention; direct location values used for access review, not copied as FK |
| user_region.region_id | user_scopes.region_id | review effective access, old→new mapped UUID |
| user_branch.branch_id | user_scopes.branch_id | same |
| user_area.area_id | user_scopes.service_area_id | old area is SA, NOT new top area |
| user_sa.sa_id | user_scopes.workzone_id | old SA is workzone |
| users.region_id / branch_id / area_id | candidate grants | audit old precedence/intersection; do not blindly union |
| ticket.workzone/witel | tickets.workzone_id + raw fields | approved mapping via old workzone and source geography; unknown remains NULL |
| NOSSA Regional/witel/Workzone | workzone_source_aliases | owner-approved normalized exact triplet, no auto-create |

## 1. Extract and inventory
Read verified restore using read-only account, capture SHOW CREATE TABLE and row counts, distinct codes/names, null parent, duplicates, orphan FK, direct vs junction grant, username collision, role definitions and password hash algorithm (never output hashes). Check actual code and endpoints for effective legacy access; old request globalScope/role exceptions are NOT automatic new authority. Obtain owner-approved top area mapping and alias crosswalk. No production connection without approval.

## 2. Stable mapping & import order
Persist restricted encrypted manifest keyed by `(snapshot_id, source_table, old_id)` with target table/UUID, source row hash, disposition/reason, parent mapping and run ID. Use separate persistent target mapping manifest/checkpoint across reruns; preallocate UUIDv7 once, fsync/atomic persist before inserts; on crash replay same UUID with compare/hash; guard wrong snapshot/target. For top area use owner-approved stable code and manifest. Do not derive UUID from old ID or silently merge duplicate names. For final delta keep existing mapping independent of snapshot via approved mapping carry-forward. Preserve verified master created_at/updated_at timestamps, normalized to timestamptz; when missing use local import time and record provenance in manifest. For users, original timestamps retained if verified and needed; preserve approved attributes in restricted archive/backup. No new permanent legacy ID indexes on hot ticket table. Full backup protected; no raw credentials in manifest. Order: area→region→branch→service_area→workzone→aliases→users→user_scopes→tickets→archive, validate each stage. Ticket archive preserves old ticket ID and source provenance. Use short transactions with checkpoint, dry-run default, explicit apply. Abort on unknown active parent; quarantine/approved inactive exclusion. If target exists verify stable UUID and payload before apply; no destructive recreate. Freeze/reconcile master and grants with final delta.

## 3. Scope safety
Use legacy read-only effective access evaluation on restored snapshot for baseline, not a blind translation of role or direct/junction columns. For each user compare old effective leaf set mapped to target UUID vs proposed set; any addition/removal or active path change must be reviewed and approved. Conflicting old sources, null target, missing role, unmapped workzone or collision -> suspend account pending resolution; do not turn null into global. Explicit top area grants are new owner decisions, never inferred. Overlap permitted after approval and dedup. Legacy technicians excluded from active roles unless explicitly remapped for allowed product function. No old sessions/token migration. Password hash reviewed; reset and activate securely if unsupported. Role/PII/audit scope tested separately.

## 4. Validation & rollback
Use Migration-Validation.md ORG gates. Exact ID accounting by source table, parent chain, no duplicate target grant, no orphan, per-user delta and approved exceptions, counts by each level at fixed revision. Preserve manifest and read-only source backup for rollback; never overwrite production master data. Cutover after approved grant reconciliation and fresh login. Stop new traffic/worker if access leak; revert only to verified safe old setup, preserve new database for investigation. Local users/master edits after cutover must be reconciled, not lost silently. These are planning steps, no source migration executed.
