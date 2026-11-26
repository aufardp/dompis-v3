import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline';
import { StringDecoder } from 'node:string_decoder';
import { SQL } from 'bun';

const roleOptions = [
	{ code: 'superadmin', name: 'Superadmin' },
	{ code: 'team_leader', name: 'Team Leader' },
	{ code: 'helpdesk', name: 'Helpdesk' },
	{ code: 'teknisi', name: 'Teknisi' },
	{ code: 'senior_leader', name: 'Senior Leader' },
	{ code: 'officer', name: 'Officer' }
] as const;

type RoleCode = (typeof roleOptions)[number]['code'];

interface IdentityRow {
	database_name: string;
	server_address: string | null;
	server_port: number;
	server_version_num: number;
}

interface CountRow {
	count: number;
}

interface RoleRow {
	code: string;
	active: boolean;
}

interface BootstrapStateRow {
	user_count: number;
	permission_count: number;
	grant_count: number;
	bootstrap_count: number;
}

interface RoleIdRow {
	id: string;
}

interface UserIdRow {
	id: string;
}

class BootstrapFailure extends Error {
	constructor(readonly code: string) {
		super(code);
	}
}

function readDatabaseUrl(): URL {
	const connectionString = Bun.env.DATABASE_URL;
	if (!connectionString) throw new BootstrapFailure('database_url_missing');

	let url: URL;
	try {
		url = new URL(connectionString);
	} catch {
		throw new BootstrapFailure('database_url_invalid');
	}

	const databaseName = decodeURIComponent(url.pathname.slice(1));
	if (
		url.protocol !== 'postgresql:' ||
		!['127.0.0.1', 'localhost', '::1'].includes(url.hostname) ||
		(url.port || '5432') !== '5432' ||
		databaseName !== 'dompis_v3' ||
		Bun.env.NODE_ENV === 'production'
	) {
		throw new BootstrapFailure('bootstrap_target_rejected');
	}

	return url;
}

function readLine(prompt: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const terminal = createInterface({ input: process.stdin, output: process.stdout });
		const onClose = () => reject(new BootstrapFailure('bootstrap_input_closed'));
		terminal.once('close', onClose);
		terminal.question(prompt, (answer) => {
			terminal.off('close', onClose);
			terminal.close();
			resolve(answer);
		});
	});
}

function readHidden(prompt: string): Promise<string> {
	const input = process.stdin;
	if (!input.isTTY || !process.stdout.isTTY || typeof input.setRawMode !== 'function') {
		return Promise.reject(new BootstrapFailure('interactive_terminal_required'));
	}

	process.stdout.write(prompt);
	input.setRawMode(true);
	input.resume();
	const decoder = new StringDecoder('utf8');

	return new Promise((resolve, reject) => {
		let value = '';
		const cleanup = () => {
			input.off('data', onData);
			input.setRawMode(false);
			input.pause();
			process.stdout.write('\n');
		};
		const onData = (chunk: Buffer) => {
			for (const character of decoder.write(chunk)) {
				if (character === '\u0003' || character === '\u0004') {
					cleanup();
					reject(new BootstrapFailure('bootstrap_cancelled'));
					return;
				}
				if (character === '\r' || character === '\n') {
					cleanup();
					resolve(value);
					return;
				}
				if (character === '\u007f' || character === '\b') {
					value = Array.from(value).slice(0, -1).join('');
					continue;
				}
				if (character >= ' ') value += character;
			}
		};
		input.on('data', onData);
	});
}

async function main(): Promise<void> {
	const url = readDatabaseUrl();
	const client = new SQL({ url: url.toString(), max: 1, connectionTimeout: 5 });

	try {
		const identityRows = await client<IdentityRow[]>`
			SELECT current_database() AS database_name,
				inet_server_addr()::text AS server_address,
				inet_server_port() AS server_port,
			current_setting('server_version_num')::int AS server_version_num
		`;
		const identity = identityRows[0];
		const serverAddress = identity?.server_address;
		if (
			identity?.database_name !== 'dompis_v3' ||
			!['127.0.0.1', '::1'].includes(String(serverAddress)) ||
			Number(identity.server_port) !== 5432 ||
			Number(identity.server_version_num) < 180000 ||
			Number(identity.server_version_num) >= 190000
		) {
			throw new BootstrapFailure('bootstrap_target_rejected');
		}

		const userCountRows = await client<CountRow[]>`SELECT count(*)::int AS count FROM users`;
		if (Number(userCountRows[0]?.count) !== 0) {
			throw new BootstrapFailure('bootstrap_already_completed');
		}
		const bootstrapAuditRows = await client<CountRow[]>`
			SELECT count(*)::int AS count FROM audit_events WHERE action = 'auth.bootstrap_user'
		`;
		if (Number(bootstrapAuditRows[0]?.count) !== 0) {
			throw new BootstrapFailure('bootstrap_already_completed');
		}

		const catalogRows = await client<RoleRow[]>`SELECT code, active FROM roles`;
		const activeRoleCodes = new Set(
			catalogRows
				.filter((role) => role.active === true)
				.map((role) => String(role.code))
		);
		if (!roleOptions.every((role) => activeRoleCodes.has(role.code))) {
			throw new BootstrapFailure('approved_role_catalog_incomplete');
		}

		const username = (await readLine('Username: ')).trim().toLowerCase();
		const displayName = (await readLine('Nama tampilan: ')).trim();
		if (!username || username.length > 160 || displayName.length < 1 || displayName.length > 120) {
			throw new BootstrapFailure('bootstrap_input_invalid');
		}

		console.info('Role tersedia:');
		for (const role of roleOptions) console.info(`- ${role.code} (${role.name})`);
		const requestedRole = (await readLine('Role akun pertama: ')).trim();
		if (!roleOptions.some((role) => role.code === requestedRole)) {
			throw new BootstrapFailure('bootstrap_role_invalid');
		}
		const roleCode = requestedRole as RoleCode;

		let password = await readHidden('Password (minimal 12 karakter): ');
		let confirmation = await readHidden('Ulangi password: ');
		if (password.length < 12 || password.length > 1024 || password !== confirmation) {
			password = '';
			confirmation = '';
			throw new BootstrapFailure('bootstrap_password_invalid');
		}
		const passwordHash = await Bun.password.hash(password, { algorithm: 'argon2id' });
		password = '';
		confirmation = '';

		const requestId = randomUUID();
		let createdUserId: string | undefined;
		await client.begin(async (transaction) => {
			await transaction`LOCK TABLE roles, permissions, role_permissions IN SHARE MODE`;
			await transaction`LOCK TABLE users IN EXCLUSIVE MODE`;

			const stateRows = await transaction<BootstrapStateRow[]>`
				SELECT
					(SELECT count(*)::int FROM users) AS user_count,
					(SELECT count(*)::int FROM permissions) AS permission_count,
					(SELECT count(*)::int FROM role_permissions) AS grant_count,
					(SELECT count(*)::int FROM audit_events WHERE action = 'auth.bootstrap_user') AS bootstrap_count
			`;
			const state = stateRows[0];
			if (
				Number(state?.user_count) !== 0 ||
				Number(state.permission_count) !== 0 ||
				Number(state.grant_count) !== 0 ||
				Number(state.bootstrap_count) !== 0
			) {
				throw new BootstrapFailure('bootstrap_state_not_empty');
			}

			const activeRoles = await transaction<RoleIdRow[]>`
				SELECT id::text AS id FROM roles WHERE code = ${roleCode} AND active = true LIMIT 1
			`;
			const roleId = activeRoles[0]?.id;
			if (typeof roleId !== 'string') throw new BootstrapFailure('bootstrap_role_unavailable');

			const insertedUsers = await transaction<UserIdRow[]>`
				INSERT INTO users (username, display_name, password_hash, role_id, global_scope, active)
				VALUES (${username}, ${displayName}, ${passwordHash}, ${roleId}::uuid, false, true)
				RETURNING id::text AS id
			`;
			createdUserId = insertedUsers[0]?.id;
			if (typeof createdUserId !== 'string') throw new BootstrapFailure('bootstrap_user_insert_failed');

			await transaction`
				INSERT INTO audit_events (actor_id, action, target_id, request_id, metadata)
				VALUES (NULL, 'auth.bootstrap_user', ${createdUserId}::uuid, ${requestId}, ${JSON.stringify({ roleCode })}::jsonb)
			`;
		});

		console.info('Akun awal dibuat. Permission dan scope tidak diberikan; role hanya menentukan katalog akun.');
	} finally {
		await client.close();
	}
}

await main().catch((error: unknown) => {
	const errorCode = error instanceof BootstrapFailure ? error.code : 'bootstrap_failed';
	console.error(errorCode);
	process.exitCode = 1;
});
