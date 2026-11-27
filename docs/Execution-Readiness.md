# Execution Readiness — 2026-11-27

## Status

The documentation set is consolidated and suitable as the reference for the next controlled engineering work. **Phase 0C is not complete**, and this document does not approve data migration, live NOSSA requests, schema changes on production, or cutover.

| Workstream | State | What can run next |
|---|---|---|
| Phase 0A–0B discovery | Complete per recorded evidence | Reopen only if new source evidence contradicts the documented findings |
| Phase 0C contract/access | Open; owner decisions already recorded are not being requested again | Continue static/source-fixture analysis and gather the specific evidence below |
| Phase 0D design | Static review complete; final design/data-readiness gate open | Reconcile candidate schema and migration plan against approved contracts; keep unresolved fields explicitly nullable/quarantined |
| Phase 1 foundation | Local gate complete | Use existing foundation; production/staging readiness is not implied |
| Phase 2 organization/auth | Implementation gate complete locally | Do not infer operational grants for deferred/equivalent roles |
| Phase 3A historical migration | Not ready | Do not start ETL until snapshot, retention, least-privilege, and restore gates pass |

## Confirmed owner decisions — do not ask again

- Lifecycle: open = `NEW`, `DRAFT`, `ANALYSIS`, `PENDING`, `BACKEND`; closed = `FINALCHECK`, `RESOLVED`, `MEDIACARE`, `SALAMSIM`, `CLOSED`; other values remain unknown. A listed closed state followed by a listed open state for the same incident is a reopen.
- Compliance: `reported_date + applicable maximum threshold` compared with `resolve_date`; equality is comply. Compliance, countdown, and displayed Max TTR are separate rules. Regular countdown is 24 hours. MTTR is deferred.
- Former `RESELLER` criteria are now `INDIBIZ`; live legacy `source_vlookup` is the authority for ticket type 1 and 2.
- Organization mapping: legacy `region→region`, `branch→branch`, `area→service_area`, `service_area→workzone`, within target hierarchy `Area→Region→Branch→Service Area→Workzone`. This is a table/level mapping, not a request for a row-by-row Area–Region owner crosswalk.
- Superadmin has full application control and is the only role allowed into User Management. `officer`, `team_leader`, `senior_leader` are equivalent with no operational capabilities granted yet. `helpdesk` and `teknisi` are deferred. No technician assignment is in scope.
- Semesta uses `reported_date`; Rekap Workorder and Detail WO HI default to active plus closed today; hourly close uses `closed_at` in WIB. MTTR stays deferred.
- Semesta's initial range is **30 days**, shared by summary and trend. GAUL/recurring is **deferred from the initial release** pending a separate definition.

Details and history remain in [Decision Log](Decision-Log.md), [Business Rules](Business-Rules.md), and [PRD](PRD.md).

The remaining owner choice is archive access and retention for sensitive legacy fields; its examples and two simple options are in [Phase 0C Owner Decision Packet](Phase-0C-Owner-Decision-Packet.md). The owner has identified MySQL `dompis_db` in phpMyAdmin as the intended migration source. Technical gates remain for a consistent immutable snapshot, least-privilege read/migration roles, and isolated restore evidence.

## Remaining gates, in execution order

1. **NOSSA contract evidence:** obtain an approved sanitized same-incident closed→open example or authoritative version/order contract; verify pagination stability, equal-timestamp ordering, closed-window boundaries/completeness, and timestamp fields without offsets. Until then, do not claim replay can safely determine the latest incident state.
2. **Semesta/report contract:** the initial range is 30 days and GAUL is deferred. Define membership/denominator only for KPI metrics not already defined in PRD before displaying them. GAUL-specific decisions are not a blocker while the feature remains deferred.
3. **Historical field and retention policy:** complete the 84-field source/transform eligibility review, archive allowlist, PII/free-text access, retention duration, and deletion/expiry mechanism. Current 38/8/38 disposition counts are draft inventory groupings, not permission to copy or discard fields.
4. **Migration source and safe rehearsal:** MySQL `dompis_db` in the owner's phpMyAdmin is the selected source. Register a consistent immutable snapshot and least-privilege read role; create/verify a separate least-privilege PostgreSQL migration role; perform schema/data restore rehearsal only on isolated disposable targets and record checksums/reconciliation. Never use the current PostgreSQL superuser for application or ETL runtime.
5. **Phase 0C/0D exit review:** update evidence, run the documented migration validation matrix on synthetic/approved snapshot data, reconcile all eligible old IDs, scopes and tickets, and review rollback. Then record explicit phase exit; only after that schedule Phase 3A.

## Safe work that can proceed now

- Static implementation design, API/schema contract reconciliation, synthetic fixture authoring from sanitized examples, and migration tooling design without connecting to external endpoints or copying customer data.
- Phase 1/2 maintenance using disposable/synthetic data and documented local safeguards.
- Candidate schema and index review using query shapes and synthetic plans; do not freeze fields whose business/retention semantics are open.

## Prohibited until gates are evidenced

- Historical ETL, snapshot creation from the unclassified source, bulk copy/archive of PII, runtime MySQL connection, live NOSSA calls, production DDL/DML, role grants on a shared/production DB, or cutover.
- Treating unmatched Workzone values as grounds to drop tickets. Preserve the ticket and original key; unmatched rows remain unmapped and outside ordinary scoped reporting until a verified mapping exists.
- Treating documentation complete as phase complete or release approval.

## Acceptance for this documentation pass

- Root docs index links point to files present in the repository.
- README, implementation plan, and phase readiness documents agree on phase state and next gates.
- Owner-approved facts are separated from technical evidence and unresolved policies.
- `git diff --check` passes; no database, endpoint, application code, dependency, or test suite is touched by this documentation pass.

## Rollback

This is documentation-only. Revert this file and the linked documentation changes as a single documentation change set; no data/schema/runtime rollback is needed.
