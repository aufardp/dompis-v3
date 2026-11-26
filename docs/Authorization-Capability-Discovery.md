# Authorization Capability Discovery

Tanggal: 2026-11-26. Status: **partial owner approval recorded; non-superadmin operational grants remain deferred**.

This document records static, read-only evidence from `dompis_v2` and owner decisions for v3. Approved grants below are target policy only; they do not migrate old assignments, activate accounts, or imply that the feature APIs/UI already exist. No live user rows or credentials were inspected for this analysis.

## Owner decision recorded — 2026-11-26

- `superadmin` has full application control. For this capability worksheet this is interpreted to include the listed product reads, sync monitoring, organization administration, user administration, and audit reading, plus explicit global data scope. This interpretation is captured in ADR-036 for later review if the owner intends “full control” to exclude global ticket/report visibility.
- User Management is restricted to `superadmin`. The explicitly requested operations are add users, remove users, and manage each user's hierarchical scope. User deletion in v3 is defined as deactivation/soft deletion so historical ownership, references, and audit history remain intact; this is a data-integrity interpretation, not a claim about the legacy behavior.
- `officer`, `team_leader`, and `senior_leader` form one equivalent authorization cohort for now. This means their eventual capability sets must match each other; the owner has not yet selected which product capabilities that set includes. No operational capability is granted by this equivalence statement alone.
- `helpdesk` and `teknisi` permissions are deferred. They receive no grants by default. Technician assignment remains out of scope.
- This is not approval to migrate/activate legacy users or to import legacy role permissions/scopes. Protect self-demotion/scope removal and last-active-superadmin safeguards in implementation.

## Target role vocabulary

| Legacy key | v3 role name approved by owner | Capability disposition |
|---|---|---|
| `superadmin` | `superadmin` | Full application capability set approved below |
| `admin` | `team_leader` | Equivalent cohort with officer/senior_leader; capability set deferred |
| `helpdesk` | `helpdesk` | Permission decision deferred; deny-by-default |
| `teknisi` | `teknisi` | Permission decision deferred; no technician-assignment capability |
| `senior_leader` | `senior_leader` | Equivalent cohort with officer/team_leader; capability set deferred |
| `admin_branch` | `officer` | Equivalent cohort with team_leader/senior_leader; capability set deferred |

Owner approval covers names only. Legacy numeric IDs, role keys, UI menus, and endpoint guards are not v3 permissions.

## Candidate v3 capabilities for owner decision

The following are action-level candidates derived from the approved product scope. All role assignments remain **unapproved**. `—` means no grant is proposed or implied here.

| Capability candidate | superadmin | team_leader | helpdesk | teknisi | senior_leader | officer | Product basis |
|---|---:|---:|---:|---:|---:|---:|---|
| `tickets.read` | superadmin | — | — | — | — | — | Owner-approved full application control; others deferred |
| `reports.semesta.read` | superadmin | — | — | — | — | — | Semesta |
| `reports.workorder.read` | superadmin | — | — | — | — | — | Rekap Workorder |
| `reports.wo_hi.read` | superadmin | — | — | — | — | — | Detail WO HI |
| `sync.monitor` | superadmin | — | — | — | — | — | Sync Monitoring support feature |
| `organization.read` | superadmin | — | — | — | — | — | Organization Management |
| `organization.manage` | superadmin | — | — | — | — | — | Hierarchy mutations; audit required |
| `users.read` | superadmin | — | — | — | — | — | User Management is superadmin-only |
| `users.manage` | superadmin | — | — | — | — | — | Create, deactivate, manage hierarchical scope; audit required |
| `audit.read` | superadmin | — | — | — | — | — | Audit metadata still needs an allowlist and retention policy |

Authentication self-service (login, logout, current-session lookup) is a session capability, not a role grant. Ticket mutation, technician assignment, legacy clustering, maps, attendance, push, and other out-of-PRD capabilities are excluded.

## Legacy evidence and discrepancies

| Concern | Static evidence in legacy checkout | Finding for v3 |
|---|---|---|
| Generic API role equivalence | `app/libs/protectApi.ts:47-62` | Non-strict guards treat `senior_leader` and `admin_branch` as equivalent to `admin`/`superadmin`; strict guards use exact matching. This broad role equivalence is not a safe v3 rule. |
| User list/create/update | `app/api/users/route.ts:16-100`; `app/api/users/[id]/route.ts:35-145` | Several operations allow `admin`, `helpdesk`, and `superadmin`, then apply separate branch/target checks. These layers do not form one documented capability contract. |
| Role assignment | `app/libs/services/users.service.ts:608-615`; `app/api/users/route.ts:55-74` | The helper restricts only target roles 1, 5, and 6; other role IDs are assignable by any caller that reached it. Do not port this behavior or map IDs. |
| User target protection | `app/api/users/[id]/route.ts:19-32, 96-120` | Only role IDs 1 and 6 receive explicit target protection; branch scoping is separate and uses legacy fields. V3 must use explicit permission and current hierarchical scope. |
| Organization mutation | `app/api/area/route.ts:67-145` | Area create/update/delete use strict `superadmin`; GET allows `admin`, `helpdesk`, and `superadmin`. This is endpoint-specific evidence, not approval for `organization.manage`. |
| Audit read | `app/api/audit-log/route.ts:16` and `app/admin/audit-log/page.tsx:20-25` | Both page/API check exact `superadmin`; no equivalent role inheritance there. V3 `audit.read` assignment still requires approval. |
| Menu and routing | `app/components/layout/Sidebar.tsx:315-370`; `app/page.tsx:10-31`; `app/components/auth/LoginForm.tsx:15-32` | Menu visibility and post-login route differ by role; they do not establish server authorization. Helpdesk and technician have separate landing routes in legacy, but technician product features are excluded in v3. |
| Branch/user scope | `app/libs/services/users.service.ts:608-615`; `app/helpers/ticket.helpers.ts:138-177` | `admin_branch` receives legacy branch behavior through user-linked data while the proposed v3 role `officer` must use explicit `user_scopes`. Do not infer equivalent scope from the role name. |
| Password reset | `app/api/users/[id]/reset-password/route.ts:15-56` | Legacy resets a password to the username. This unsafe behavior is explicitly rejected; v3 must use a secure reset flow and audit it. |

The source has additional guards on out-of-scope routes (technician, attendance, clustering, maps, push, and manual ticket operations). Their presence is not a reason to add those features or permissions to DOMPIS v3.

## Remaining owner decisions required before other grants / rollout

1. Define the equal capability set for `officer`, `team_leader`, and `senior_leader`; their equivalence to one another is approved, the set is not.
2. Decide any future `helpdesk` and `teknisi` capabilities; they remain deny-by-default now.
3. Confirm whether superadmin user control includes role changes and credential resets; implement secure, audited flows only (never reproduce the legacy username-as-password reset).
4. Confirm whether superadmin scope changes may target all accounts including other superadmins; retain self-protection and last-active-superadmin safeguards unless explicitly revised.
5. Approve audit metadata visibility/retention; protect credentials, tokens, customer PII, and raw upstream payloads.
6. Approve account activation and per-user migration parity separately; no legacy account or grant activates automatically.

The approved superadmin permission catalog and role grants are seeded in local development by migration `0003_seed_superadmin_capabilities.sql`: ten permissions, ten grants to `superadmin`, zero grants to other roles. No user was provisioned and no user's global scope was changed. Other role grants remain denied. Static legacy evidence cannot resolve remaining decisions because legacy route checks conflict and some are explicitly unsafe.

## Approval worksheet

Use this section to record the owner decision. An empty cell means **deny**. Role name alone does not imply global scope. This worksheet is intentionally not pre-filled from legacy behavior.

### A. Role capabilities

For each capability, list only role codes explicitly granted it. Omitted roles stay denied.

| Capability | Granted role codes (owner fills) | Approved by / date |
|---|---|---|
| `tickets.read` | `superadmin` | Owner, 2026-11-26 |
| `reports.semesta.read` | `superadmin` | Owner, 2026-11-26 |
| `reports.workorder.read` | `superadmin` | Owner, 2026-11-26 |
| `reports.wo_hi.read` | `superadmin` | Owner, 2026-11-26 |
| `sync.monitor` | `superadmin` | Owner, 2026-11-26 |
| `organization.read` | `superadmin` | Owner, 2026-11-26 |
| `organization.manage` | `superadmin` | Owner, 2026-11-26 |
| `users.read` | `superadmin` | Owner, 2026-11-26 |
| `users.manage` | `superadmin` | Owner, 2026-11-26 |
| `audit.read` | `superadmin` | Owner, 2026-11-26 |

Allowed codes: `superadmin`, `team_leader`, `helpdesk`, `teknisi`, `senior_leader`, `officer`. `teknisi` receives no assignment/dispatch feature because that is outside the product scope.

### B. Global scope and account administration

| Decision | Owner response |
|---|---|
| Roles allowed to hold explicit global data scope (write `none` if nobody) | `superadmin` (inferred from full application control; see ADR-036) |
| Roles allowed to grant/revoke global scope | `superadmin` (within user management) |
| Roles allowed to create/deactivate accounts | `superadmin`; physical deletion is not allowed |
| Roles allowed to change another user's role | Pending explicit definition |
| Roles allowed to reset another user's credentials | Pending secure reset policy |
| Roles allowed to grant/revoke hierarchical scopes | `superadmin` |
| May an administrator change their own role or scope? (yes/no) | No self-demotion / self-scope removal by default; guardrail pending implementation review |
| Last active global administrator must not be removable (confirm/modify) | Yes as a safety invariant; implementation and recovery path pending |

### C. Audit and migrated account activation

| Decision | Owner response |
|---|---|
| Roles allowed to read audit events | `superadmin` |
| Audit metadata fields approved for display (default: action, target type/ID, timestamp, request ID; no PII/secrets) |  |
| Audit retention period (or identify the existing policy to follow) |  |
| Activate migrated accounts automatically? (recommended default: no) |  |
| Approve old-to-new role and per-user effective-scope crosswalk separately? (yes/no; this requires a validated migration manifest) |  |

Once answered, record the approval date and update both this worksheet and `Decision-Log.md`. Do not seed grants or expose admin mutations until the corresponding answers are approved and tests cover the effective authorization behavior.
