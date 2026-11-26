INSERT INTO "roles" ("code", "name")
VALUES
	('superadmin', 'Superadmin'),
	('team_leader', 'Team Leader'),
	('helpdesk', 'Helpdesk'),
	('teknisi', 'Teknisi'),
	('senior_leader', 'Senior Leader'),
	('officer', 'Officer')
ON CONFLICT ("code") DO NOTHING;
