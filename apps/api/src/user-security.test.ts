import { expect, test } from 'bun:test';
import { validateMutationSecurity } from './auth';

const origin = 'https://dompis.example.test';
const token = 'A'.repeat(43);

test('admin mutations require the configured origin and matching CSRF token', () => {
	const validRequest = new Request(`${origin}/api/admin/users`, {
		method: 'POST',
		headers: { origin, 'x-csrf-token': token }
	});
	expect(validateMutationSecurity(validRequest, token, origin)).toBe('allowed');

	const crossOriginRequest = new Request(`${origin}/api/admin/users`, {
		method: 'POST',
		headers: { origin: 'https://attacker.example.test', 'x-csrf-token': token }
	});
	expect(validateMutationSecurity(crossOriginRequest, token, origin)).toBe('origin_rejected');

	const mismatchedTokenRequest = new Request(`${origin}/api/admin/users`, {
		method: 'POST',
		headers: { origin, 'x-csrf-token': 'B'.repeat(43) }
	});
	expect(validateMutationSecurity(mismatchedTokenRequest, token, origin)).toBe('csrf_rejected');
	expect(validateMutationSecurity(validRequest, undefined, origin)).toBe('csrf_rejected');
	expect(validateMutationSecurity(validRequest, token, undefined)).toBe('origin_rejected');
});
