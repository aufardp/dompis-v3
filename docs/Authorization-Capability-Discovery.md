# Authorization Capability Discovery

Tanggal: 2026-11-26. Status: **evidence extracted; target role-to-capability mapping requires owner approval**.

This document records static, read-only evidence from `dompis_v2` to prepare the v3 authorization decision. It is not an approval, does not migrate old assignments, and must not be interpreted as an effective permission matrix. No live user rows or credentials were inspected for this analysis.

## Target role vocabulary

| Legacy key | v3 role name approved by owner | Capability disposition |
|---|---|---|
| `superadmin` | `superadmin` | Not assigned by this discovery |
| `admin` | `team_leader` | Not assigned by this discovery |
| `helpdesk` | `helpdesk` | Not assigned by this discovery |
| `teknisi` | `teknisi` | No technician-assignment capability; remains outside product scope |
| `senior_leader` | `senior_leader` | Not assigned by this discovery |
| `admin_branch` | `officer` | Not assigned by this discovery |

Owner approval covers names only. Legacy numeric IDs, role keys, UI menus, and endpoint guards are not v3 permissions.

## Candidate v3 capabilities for owner decision

The following are action-level candidates derived from the approved product scope. All role assignments remain **unapproved**. `—` means no grant is proposed or implied here.

| Capability candidate | superadmin | team_leader | helpdesk | teknisi | senior_leader | officer | Product basis |
|---|---:|---:|---:|---:|---:|---:|---|
| `tickets.read` | — | — | — | — | — | — | Ticket Management read-only MVP |
| `reports.semesta.read` | — | — | — | — | — | — | Semesta |
| `reports.workorder.read` | — | — | — | — | — | — | Rekap Workorder |
| `reports.wo_hi.read` | — | — | — | — | — | — | Detail WO HI |
| `sync.monitor` | — | — | — | — | — | — | Sync Monitoring support feature |
| `organization.read` | — | — | — | — | — | — | Organization Management |
| `organization.manage` | — | — | — | — | — | — | Hierarchy mutations; preview/audit required |
| `users.read` | — | — | — | — | — | — | User Management |
| `users.manage` | — | — | — | — | — | — | User/role/scope administration; audit required |
| `audit.read` | — | — | — | — | — | — | Audit Log; scope and metadata exposure need owner decision |

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

## Owner decisions required before grants

1. Approve each role-to-capability cell above, including deny-by-default for omitted cells.
2. Approve whether `superadmin` receives any global scope; role name alone must never imply global data access.
3. Approve who can create/deactivate users, change roles, reset credentials, grant/revoke scopes, and manage organization nodes; define self-change and last-administrator protections.
4. Approve whether `senior_leader` and `officer` have any operational report access, and whether `helpdesk` can view tickets, reports, or user records.
5. Approve `audit.read` audience, metadata visibility, and retention; protect credentials, tokens, customer PII, and raw upstream payloads from audit metadata.
6. Approve account activation and per-user migration parity separately from role capability; no legacy account or grant activates automatically.

Until decisions are recorded, v3 role catalog rows remain labels only, `role_permissions` remains empty, and protected operations deny access. Static legacy evidence may inform owner review but cannot resolve these decisions because legacy route checks conflict and some are explicitly unsafe.
