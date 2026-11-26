# Legacy role discovery

Date: 2026-11-26. Scope: static, read-only inspection of the legacy `dompis_v2` source checkout. This is evidence about source-defined role vocabulary, not a live database inventory or an authorization approval for DOMPIS v3.

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

The role normalizer also accepts spelling aliases: `super_admin` and `super-admin` for `superadmin`; `technician` for `teknisi`; `sl` and `seniorleader` for `senior_leader`; and `adminbranch` for `admin_branch`. These are code compatibility aliases, not distinct roles.

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
