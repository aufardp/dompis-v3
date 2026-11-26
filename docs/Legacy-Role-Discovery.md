# Legacy role discovery

Date: 2026-11-26. Scope: static, read-only inspection of the legacy `dompis_v2` source checkout. This is evidence about source-defined role vocabulary, not a live database inventory or an authorization approval for DOMPIS v3.

The owner has since approved the **target names** below. This changes naming requirements only; it does not approve or transfer any permission, scope, account state, or legacy user assignment.

| Legacy key | DOMPIS v3 target name | Decision |
|---|---|---|
| `superadmin` | `superadmin` | Keep |
| `admin` | `team_leader` | Rename |
| `helpdesk` | `helpdesk` | Keep |
| `teknisi` | `teknisi` | Keep role name; technician assignment remains out of scope |
| `senior_leader` | `senior_leader` | Keep |
| `admin_branch` | `officer` | Rename |

The target role-name set is therefore `superadmin`, `team_leader`, `helpdesk`, `teknisi`, `senior_leader`, and `officer`. Do not treat legacy IDs or permissions as target IDs/permissions.

## Role vocabulary found

The legacy role helper documents role IDs and keys as follows:

| Legacy ID | Legacy key | Display label evidenced in source | Evidence / caveat |
|---:|---|---|---|
| 1 | `superadmin` | Superadmin | `app/libs/roles.ts` maps key to ID; exact display label was not verified from live data. |
| 2 | `admin` | Admin | `app/libs/roles.ts` maps key to ID; exact display label was not verified from live data. |
| 3 | `helpdesk` | Helpdesk | `app/libs/roles.ts` maps key to ID; exact display label was not verified from live data. |
| 4 | `teknisi` | Teknisi | `app/libs/roles.ts` maps key to ID; exact display label was not verified from live data. |
| 5 | `senior_leader` | Senior Leader | Migration `202608040001_user_scope_general_manager` inserted this label/key; migration `202608040002_rename_general_manager_to_senior_leader` records a rename from `general_manager`. |
| 6 | `admin_branch` | Admin Branch | Migration `202608040003_add_admin_branch_role` inserted this label/key. |

The legacy role normalizer also accepts spelling aliases: `super_admin` and `super-admin` for `superadmin`; `technician` for `teknisi`; `sl` and `seniorleader` for `senior_leader`; and `adminbranch` for `admin_branch`. These are code compatibility aliases, not distinct roles and not additional target names.

## What this does not establish

- It does not establish that all six rows exist in the current/production legacy database, or which users currently have each role.
- It does not establish the complete effective permission matrix. Authorization also depends on route guards, user scope paths and feature-specific checks; the legacy source has role-specific exceptions.
- It does not authorize copying role IDs, names, permissions, or user assignments into v3. V3 roles and permissions remain unseeded and protected routes remain deny-by-default until the owner validates role/action/global-scope/account-activation parity.
- `teknisi` is recorded here only as a legacy role; technician assignment is outside the current v3 product scope.

## Read-only evidence inspected

- `dompis_v2/app/libs/roles.ts`: normalized keys, aliases, and documented ID mapping.
- `dompis_v2/prisma/schema.prisma`: legacy `roles` table fields and user relation.
- `dompis_v2/prisma/migrations/202608040001_user_scope_general_manager/migration.sql`, `202608040002_rename_general_manager_to_senior_leader/migration.sql`, and `202608040003_add_admin_branch_role/migration.sql`: source history for role 5 and role 6.
- `dompis_v2/app/libs/services/users.service.ts`: examples of role-aware user administration checks; not treated as a complete authorization specification.

No credential/configuration files, database records, or customer data were read by this static audit.

Follow-up static guard analysis, candidate v3 capabilities, discrepancies, and owner decisions are recorded in `Authorization-Capability-Discovery.md`. Those candidates do not approve or seed permissions.

## Legacy User Management follow-up — read-only source inspection

The legacy `/superadmin/users` screen contains hierarchy, create-user, and user-list/edit flows. Its user form exposes role selection and a combination of primary region/branch/area/service-area fields plus multi-select region/branch/area scopes. The page's local visibility check allows `superadmin` and `admin_branch`, while the corresponding user APIs also admit `admin` and `helpdesk` (and then apply separate branch checks). This UI/API mismatch reinforces that legacy access behavior is not a reliable v3 policy.

Static source evidence:

- `app/superadmin/users/page.tsx`: page gate accepts `superadmin` or `admin_branch`.
- `app/superadmin/users/SuperadminUsersClient.tsx`: hierarchy/create/list tabs, role and hierarchy-scope editing, delete confirmation, and reset-password action. Client-side target-role guard is not a server authorization boundary.
- `app/api/users/route.ts`: GET and POST accept `admin`, `helpdesk`, and `superadmin`; POST separately checks role assignment and branch scope.
- `app/api/users/[id]/route.ts`: GET/PUT/DELETE accept `admin`, `helpdesk`, and `superadmin`, with separate target-role and branch-scope checks.
- `app/libs/services/users.service.ts`: `deleteUser` deletes user-to-scope joins and then physically deletes the user row. This risks losing attribution/history and must not be copied into v3; owner-requested “hapus” is represented as account deactivation in v3 to preserve references and audit history.
- `app/api/users/[id]/reset-password/route.ts`: legacy reset behavior was previously found to set password to username; v3 explicitly rejects that unsafe pattern.

No database connection, credentials, live user data, or customer records were accessed. These findings are source-only. The owner has now approved a superadmin-only v3 User Management capability for adding users, removing/deactivating accounts, and managing hierarchical scopes. The authorization matrix and exact outstanding role/credential actions are recorded in `Authorization-Capability-Discovery.md` and ADR-036; no code, grants, migrated accounts, or database records changed in this documentation task.
