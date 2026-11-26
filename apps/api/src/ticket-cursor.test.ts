import { expect, test } from 'bun:test';
import { createTicketCursorCodec } from './ticket-cursor';
import type { AuthorizationContext } from '@dompis/db';

const context: AuthorizationContext = {
	userId: '018e4f3a-7b2c-7abc-8def-0123456789ab',
	username: 'synthetic-user',
	displayName: 'Synthetic User',
	globalScope: false,
	scopeVersion: 4,
	permissions: new Set(['tickets.read'])
};

test('ticket cursor signature binds position, filters, user, scope, and authorization', () => {
	const codec = createTicketCursorCodec(new Uint8Array(32).fill(7));
	const filters = JSON.stringify({ lifecycle: 'open', limit: 50 });
	const position = { reportedAt: '2026-11-26T10:00:00.123456Z', id: '018e4f3a-7b2c-7abc-8def-0123456789cd' };
	const cursor = codec.encode(context, filters, position);

	expect(codec.decode(cursor, context, filters)).toEqual(position);
	expect(codec.decode(cursor, context, `${filters} `)).toBeNull();
	expect(codec.decode(`${cursor.slice(0, -1)}x`, context, filters)).toBeNull();
	expect(codec.decode(cursor, { ...context, scopeVersion: 5 }, filters)).toBeNull();
	expect(codec.decode(cursor, { ...context, globalScope: true }, filters)).toBeNull();
	expect(codec.decode(cursor, { ...context, permissions: new Set() }, filters)).toBeNull();
	expect(codec.decode(cursor, { ...context, userId: '018e4f3a-7b2c-7abc-8def-0123456789ac' }, filters)).toBeNull();
	expect(codec.decode('malformed.cursor.value', context, filters)).toBeNull();
	expect(() => createTicketCursorCodec(new Uint8Array(16))).toThrow('ticket_cursor_secret_too_short');
});

test('ticket cursor codec preserves null timestamps for anomaly rows', () => {
	const codec = createTicketCursorCodec(new Uint8Array(32).fill(9));
	const filters = '{}';
	const position = { reportedAt: null, id: '018e4f3a-7b2c-7abc-8def-0123456789ef' };
	expect(codec.decode(codec.encode(context, filters, position), context, filters)).toEqual(position);
});
