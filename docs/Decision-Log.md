# Architecture decision log (append-only)
| ID | Decision | Status | Evidence / review |
|---|---|---|---|
| ADR-001 | Greenfield stack and historical migration | Owner requirement | conversation |
| ADR-002 | Five-level hierarchy, multi-scope | Owner requirement | conversation; effective access validation pending |
| ADR-003 | Direct workzone matching first | Proposed | prove normalized uniqueness and coverage |
| ADR-004 | 17-table candidate, 7 ticket secondary indexes | Proposed | benchmark; remove aliases if unnecessary |
| ADR-005 | MySQL/PG read-write access | Owner authorized | Database-Access.md; actual credentials not verified |
| ADR-006 | Current hierarchy for historical reports | Proposed | owner must validate reparenting semantics |

Append ID/date/status/context/evidence/alternatives/decision/consequences/test/rollback/owner approval if required. Supersede rather than erase decisions. Update schema, docs and Handover in same change.
