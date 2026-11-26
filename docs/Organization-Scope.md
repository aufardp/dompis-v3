# Organization & Hierarchical Access — v1.3

## Kebijakan v1.3 (berlaku atas seluruh dokumen)
Pemilik mengizinkan agent lokal mengakses MySQL dan PostgreSQL, read dan write. Akses aktual bergantung pada credential, jaringan, privilege dan sandbox agent; jangan mengakali kontrol. Gunakan Database-Access.md sebagai kebijakan otoritatif. Read produksi yang ringan dan write rutin terukur dalam target yang telah didaftarkan tidak memerlukan konfirmasi per query. Operasi produksi berisiko tinggi, perubahan schema produksi, bulk correction, freeze/cutover dan tindakan irreversible memerlukan persetujuan runbook khusus. Source legacy tetap read-only; database bukan source code. Discovery tidak mengubah data bisnis produksi. Semua rancangan teknis termasuk DDL, jumlah tabel/index dan alias adalah kandidat, bukan kontrak tetap. Direct matching Workzone diutamakan; buktikan keunikan global setelah normalisasi, jika ambigu gunakan pembeda yang terverifikasi, jangan menebak. Alias hanya bila terbukti diperlukan. Requirement bisnis, integritas historis, keamanan dan stack tetap wajib. Lihat Discovery-Protocol.md dan Decision-Log.md.

Status: proposed implementation contract; owner requested five levels and multi-scope user. Choices below require review, especially global privilege, inactive policy and historical reparent reporting.

## 1. Model
`area (1) → (N) region → branch → service_area → workzone`. Ticket stores one nullable workzone_id (NULL means unmapped). Each master has native UUIDv7 PK, code, name, active, created_at and updated_at; parent FK NOT NULL for non-root; code unique within parent, root code globally unique. No duplicated ancestor IDs on tickets. Physical deletion blocked by application; FK NO ACTION protects references. Source geography raw values retained. `workzone_source_aliases` maps exact normalized (Regional, witel, Workzone) to approved workzone. REG-4/5 only. Source district/TIF names are evidence, not auto-mapping. No alias wildcard; missing tuple requires review, no auto-create.

## 2. Grants and permissions
One `user_scopes` row = one user + exactly one non-null target FK. Multiple rows allowed, even mixed levels. Unique NULLS NOT DISTINCT prevents identical grant; parent+child overlap allowed but deduped; no wildcard NULL. User role is action capability (RBAC), not geography. Authorization = authenticated active session AND permission AND scope AND requested filters. `global_scope` explicit administrative grant (not implied by role, missing grants or client request); grant changes only by authorized global superadmin at MVP; no delegated manager scope mutation until approved. Global doesn't imply PII/archive access. No users.area_id etc as second source of authorization. A user managing area A gets its active descendants, not area B. Scope of region R includes branches/SA/workzones; branch includes SA/workzones; SA includes workzones; leaf grant exactly one. New children inherit valid parent grants; preview affected users on every master create/move. User with mixed grants sees set union. Filters across dimensions AND/intersect, not union. No-grant user can login but gets empty list or 403 for restricted actions. Unknown tickets and inactive hierarchy excluded from ordinary reports; explicit remediation permission + approved global scope for review, separate endpoint, audit. Inactive flag does not delete history; historical access/report coverage changes documented. Default history grouping = current master path; effective-dated structure not MVP.

## 3. Examples (synthetic)
Area A contains R1/R2, R1 contains B1/B2, B1 contains SA1/SA2, SA1 contains W1/W2, SA2 contains W3. R2 contains W4 via its own branch/SA; B2 contains W5 via its own SA. Area B contains W6 via its own chain.

| User grants | Effective workzones |
|---|---|
| Area A | W1,W2,W3,W4,W5 |
| R1 | W1,W2,W3,W5 |
| B1 | W1,W2,W3 |
| SA1 | W1,W2 |
| W1 + W4 | W1,W4 |
| B1 + W1 | W1,W2,W3 (no duplicate) |
| none | none |
| global explicit | all active mapped workzones, including W6 |

## 4. Query contract
Example parameterized SQL for non-global request; $1 user UUID derived from session (not client). Validate action permission/session before query; in same transaction for consistency, re-check current permission/scope version where needed. The optional filters below are examples; build only supplied predicates using validated UUID bindings in Drizzle, not arbitrary SQL. Use `EXISTS`/semi-join, not ticket-to-grants fanout.

```sql
WITH allowed AS (
 SELECT w.id
 FROM workzone w
 JOIN service_area sa ON sa.id=w.service_area_id
 JOIN branch b ON b.id=sa.branch_id
 JOIN region r ON r.id=b.region_id
 JOIN area a ON a.id=r.area_id
 WHERE w.is_active AND sa.is_active AND b.is_active AND r.is_active AND a.is_active
   AND EXISTS (
     SELECT 1 FROM user_scopes g
     WHERE g.user_id=$1::uuid AND (
       g.area_id=a.id OR g.region_id=r.id OR g.branch_id=b.id
       OR g.service_area_id=sa.id OR g.workzone_id=w.id
     )
   )
   -- Append only supplied filter predicates on a/r/b/sa/w IDs.
)
SELECT t.id,t.incident,t.status,t.reported_at,t.workzone_id
FROM tickets t
WHERE t.workzone_id IN (SELECT id FROM allowed)
  AND t.lifecycle='open' AND t.reported_at IS NOT NULL
ORDER BY t.reported_at DESC,t.id DESC
LIMIT 50;
```
Global uses the same active dimension query without grant EXISTS only when server authorizes global explicitly; never arbitrary `WHERE TRUE` bypass. For leaf-only detail use same scope predicate; 404 outside scope. For list pagination add tuple cursor predicate. For reports group by joined master IDs after scope; never join grants into result multiplicity. Measure narrow, medium and broad plans; small hierarchy scan is reasonable. One hierarchy resolver shared by list, detail, filters, counts, export and reports. Cursor binds filter/sort/scope fingerprint and signed scope version. Do not persist per-user expanded workzone rows for every ancestor unless profiling proves necessary.

## 5. Admin and revocation
Proposed endpoints scoped hierarchy GETs, privileged CRUD (no physical delete), GET/PUT user grants with optimistic scope_version check. In grant transaction lock user, validate target exists and active ancestry, diff and audit, increment scope_version, revoke or invalidate active access. Prevent self-escalation and last global security admin lockout; require reauth for sensitive changes. Master edits serialized, preview effective scope/rollup changes, explicit approval; transaction updates hierarchy/alias and audit, increments all affected users' scope_version (all users initially acceptable for rare change). On hierarchy move all existing grants follow current ancestry automatically; compare before/after, no surprise access. Alias changes use reviewed correction job with ticket writer lock; no alias auto-discovery. Avoid permission caches initially; reauthorize every request; SSE sends generic revision only, terminate/revalidate at heartbeat; export per chunk; invalidate signed cursor/UI cached data. Existing in-flight response cannot be recalled; bound duration and recheck scope version before emitting sensitive result. Audit no raw customer data.

## 6. Acceptance tests
Synthetic multi-area tree; each level, union overlapping, disjoint leaves, empty/disabled grant, duplicate and invalid FK/NULL constraints, explicit global, global without PII permission, client forged scope, cross-sibling report/detail/export/SSE, nested filter intersection, unauthorized admin mutation, reparent and revocation, cursor tampering/version mismatch, unmapped ticket isolation, alias collision. Compare rollups to distinct ticket membership at every level; compare effective workzones per migrated user; assert no unapproved widening. Benchmark using actual generated SQL on staging. No runtime validation done in blueprint.
