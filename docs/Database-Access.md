# Database access and change control
Owner grants local agent MySQL and PostgreSQL read/write access. This is authorization, not a connection or credential. Register each target (engine, host, port, database, environment, allowed schemas, owner, role); verify identity before every write session using SELECT DATABASE(), @@hostname, @@port, CURRENT_USER() on MySQL or current_database(), inet_server_addr(), inet_server_port(), current_user on PG. Unknown target = stop writes. Never log DSN/password, commit secrets, export customer data to external services, or open public ports.

## Registered target — legacy local discovery only (2026-11-27)

| Attribute | Registration |
|---|---|
| Engine/address/database | MySQL 8.0.46, loopback `127.0.0.1:3306`, database `dompis_db`, container label `mysql_baru`; session identity was rechecked on 2026-11-27 |
| Environment/data provenance | Local legacy database; underlying row provenance is **unclassified** and may contain production-derived records. It is not disposable and is not an approved consistent migration snapshot. |
| Owner/authorization | DOMPIS application owner authorized local MySQL read/write access in the master engineering instruction; discovery task limits this registration to read-only. |
| Permitted scope | Metadata and bounded aggregate `SELECT` only on `ticket`, `source_vlookup`, `area`, `region`, `branch`, `service_area`, `users`, and `user_*` grant tables; read-only transaction, explicit statement timeout, no row-level PII output. For `source_vlookup`, output only aggregate counts/duplicate-conflict counts and column metadata; do not emit mapping values. |
| Role/credential | Effective principal observed as `root@%` on 2026-11-27; use existing local secret injection without displaying or recording credentials. This role is broader than discovery needs and was used only in explicit read-only transactions; no separate least-privilege migration role is registered. |
| Prohibited by this registration | DML/DDL, raw row exports, schema changes, migration, backup/cutover, ETL, or treating this live local database as a consistent snapshot. |

This registration authorizes only low-impact discovery queries described above. It does not satisfy Phase 0C/3A source snapshot, read-only migration-role, backup/restore, or retention gates.

The `source_vlookup` addition is a bounded Phase 0C/C0C-05 discovery allowance based on the application owner's standing database-access authorization. Its purpose is to compare deployed mapping-key integrity with the checked-in legacy seed. It does not authorize exporting mapping rows, executing the legacy seed, DML/DDL, or treating the live database as an approved migration snapshot. Record only sanitized aggregates in `Handover.md`.

## Registered target — local PostgreSQL development metadata (2026-11-27)

| Attribute | Registration |
|---|---|
| Engine/address/database | PostgreSQL 18.7, local Unix socket (configured port 5432), database `dompis_v3`; session identity checked on 2026-11-27 |
| Environment/data provenance | Local DOMPIS v3 development database. Treat as persistent/non-disposable; a bounded metadata check found 19 public tables (no business row counts queried). A separate `dompis_v3_dev` database is not present. |
| Owner/authorization | DOMPIS application owner; local metadata and bounded synthetic test access only. |
| Permitted scope | Metadata and rollback-only synthetic test transactions in `public`; no business-data migration or bulk operations under this registration. |
| Role | Effective session role observed as `pakbreng`; bounded `pg_roles` check found `SUPERUSER`, `CREATEDB`, `CREATEROLE`, and `REPLICATION`. This is an administrative role, not an application or migration least-privilege role. No role/privilege changes were made. |
| Prohibited by this registration | Reset/drop/truncate, production migration, bulk writes, legacy import, or assuming the database is empty/disposable. |

This registration confirms the current local development target identity and PostgreSQL version only. Native `uuidv7()` is available. It does not satisfy the isolated restore/rollback rehearsal or migration-role portion of C0C-06. Do not use the observed superuser as a runtime or ETL credential.

| Operation | Dev / isolated restore / staging | Production |
|---|---|---|
| Metadata, bounded SELECT, EXPLAIN | Allowed | Allowed, time/row budget |
| DML INSERT/UPDATE/DELETE | Allowed within task | Routine scoped reversible writes allowed within registered runbook; preview count and predicate, audit |
| CREATE/ALTER/index/migration | Allowed on registered targets | Approved change runbook required |
| Bulk repair, DROP/TRUNCATE, privilege changes, cutover | Isolated disposable targets only with explicit target guard | Specific owner confirmation and tested restore |

Use separate LEGACY_MYSQL_READ_URL, LEGACY_MYSQL_WRITE_URL, DATABASE_URL, WORKER_DATABASE_URL, MIGRATION_DATABASE_URL, PG_ADMIN_URL only where needed; env ignored by git, secrets injected locally. No superuser for runtime. MySQL write role restricted to approved schema/tables; legacy application code remains read-only. Do not use production as test fixture. Routine production write means a known business operation or bounded reversible correction with documented target and max affected rows, not arbitrary exploratory DML. Discovery is read-only for business records; create scratch objects only in designated isolated DB. No approval per ordinary bounded query. If runbook scope or row count exceeded, rollback and stop.

Before writes: identify target, inspect schema and dependencies, preview matching rows, capture rollback evidence (encrypted if sensitive), set lock/statement budgets, verify backup/restore for risky changes, document expected count. Use parameterized queries, explicit transaction, check affected rows before commit; rollback on discrepancy. MySQL DDL can implicitly commit; do not rely on rollback for it. PG concurrent index creation has transaction restrictions; use reviewed engine-specific migration. Never EXPLAIN ANALYZE write statements in production; it executes them. Use plain EXPLAIN and isolated restore for expensive analysis. No disabling FK/checks or killing processes without specific authorization. Monitor lock waits, I/O, replication and latency; stop on abnormal load. Record target label, SQL template (no sensitive values), counts, timing, result and rollback in Handover. Revoke temporary migration roles after completion. Existing live MySQL remains source of historical snapshot, not permanent runtime dependency. No automatic writes to legacy from new worker.
