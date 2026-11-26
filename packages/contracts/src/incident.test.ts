import { expect, test } from 'bun:test';
import { normalizeIncident } from './incident';

test('normalizes only ASCII incident keys without losing characters', () => {
	expect(normalizeIncident(' abC-001_x ')).toEqual({
		ok: true,
		incident: 'ABC-001_X',
		changed: true
	});
	expect(normalizeIncident('0000123')).toEqual({ ok: true, incident: '0000123', changed: false });
	expect(normalizeIncident('a'.repeat(100))).toEqual({ ok: true, incident: 'A'.repeat(100), changed: true });
	expect(normalizeIncident('A'.repeat(101))).toEqual({ ok: false, reason: 'too_long' });
	expect(normalizeIncident('   ')).toEqual({ ok: false, reason: 'blank' });
	expect(normalizeIncident(null)).toEqual({ ok: false, reason: 'not_string' });
	expect(normalizeIncident(123)).toEqual({ ok: false, reason: 'not_string' });
	expect(normalizeIncident('AB/123')).toEqual({ ok: false, reason: 'invalid_characters' });
	expect(normalizeIncident('ß-123')).toEqual({ ok: false, reason: 'invalid_characters' });
	expect(normalizeIncident('AB 123')).toEqual({ ok: false, reason: 'invalid_characters' });
});

test('normalization is idempotent for accepted incident keys', () => {
	const first = normalizeIncident('  dom-001  ');
	if (!first.ok) throw new Error('expected_incident_to_be_valid');
	const second = normalizeIncident(first.incident);
	expect(second).toEqual({ ok: true, incident: first.incident, changed: false });
});
