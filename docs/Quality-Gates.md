# Quality gates
| Gate | Evidence required |
|---|---|
| 0 Discovery | actual source/DDL, contract, rule and scope evidence; ADRs; unresolved blockers tracked |
| 1 Foundation | pinned versions, strict typecheck, build, disposable migration and restore |
| 2 Auth | cross-scope deny, overlap dedup, revoke, global explicit, audit, no secret leaks |
| 3A ETL | all eligible IDs accounted, mapping, rejects, restart/idempotence, historical KPI reconciliation |
| 3B Sync | pagination, retries, reopen, null/missing, changed-only, checkpoint and freshness tests |
| 4 Ticket | scoped list/detail/summary parity, pagination, UI states |
| 5 Reports | golden fixtures, approved denominators and drilldown parity |
| 6 Performance | measured SLO, security, concurrency, backup/restore and failure tests |
| 7 Cutover | approved runbook, final delta, no unexplained loss, rollback verified |

Every gate records command, actual result, artifacts, blockers and reviewer. Failed or unrun tests are not passed. Business rule conflicts and high-risk production changes require owner decision. Routine registered DB access does not require per-query approval.
