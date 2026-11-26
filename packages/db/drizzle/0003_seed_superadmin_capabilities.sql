-- Owner-approved superadmin capabilities. Other roles remain deny-by-default.
-- Seed only capability catalog and grants; no user or global-scope rows are changed.
INSERT INTO "permissions" ("code", "description")
VALUES
	('tickets.read', 'Read tickets within the effective data scope'),
	('reports.semesta.read', 'Read the Semesta report'),
	('reports.workorder.read', 'Read the Rekap Workorder report'),
	('reports.wo_hi.read', 'Read the Detail WO HI report'),
	('sync.monitor', 'Read synchronization monitoring state'),
	('organization.read', 'Read organization hierarchy'),
	('organization.manage', 'Manage organization hierarchy'),
	('users.read', 'Read user management records'),
	('users.manage', 'Create, deactivate, and manage user scopes'),
	('audit.read', 'Read allowlisted audit events')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT role_row."id", permission_row."id"
FROM "roles" AS role_row
CROSS JOIN "permissions" AS permission_row
WHERE role_row."code" = 'superadmin'
	AND permission_row."code" IN (
		'tickets.read',
		'reports.semesta.read',
		'reports.workorder.read',
		'reports.wo_hi.read',
		'sync.monitor',
		'organization.read',
		'organization.manage',
		'users.read',
		'users.manage',
		'audit.read'
	)
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
