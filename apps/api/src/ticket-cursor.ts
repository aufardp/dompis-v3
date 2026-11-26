import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AuthorizationContext, TicketListPosition } from '@dompis/db';

interface CursorPayload {
	v: 1;
	userId: string;
	authorization: string;
	filters: string;
	reportedAt: string | null;
	id: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

function digest(value: string): string {
	return createHash('sha256').update(value).digest('hex');
}

function authorizationFingerprint(context: AuthorizationContext): string {
	return digest(JSON.stringify({
		userId: context.userId,
		scopeVersion: context.scopeVersion,
		globalScope: context.globalScope,
		permissions: [...context.permissions].sort()
	}));
}

function isCursorPayload(value: unknown): value is CursorPayload {
	if (typeof value !== 'object' || value === null) return false;
	const payload = value as Record<string, unknown>;
	return payload.v === 1 &&
		typeof payload.userId === 'string' && UUID_PATTERN.test(payload.userId) &&
		typeof payload.authorization === 'string' && /^[0-9a-f]{64}$/.test(payload.authorization) &&
		typeof payload.filters === 'string' && /^[0-9a-f]{64}$/.test(payload.filters) &&
		(payload.reportedAt === null || typeof payload.reportedAt === 'string' && TIMESTAMP_PATTERN.test(payload.reportedAt)) &&
		typeof payload.id === 'string' && UUID_PATTERN.test(payload.id);
}

export function createTicketCursorCodec(secret: Uint8Array = randomBytes(32)) {
	if (secret.byteLength < 32) throw new Error('ticket_cursor_secret_too_short');

	return {
		encode(context: AuthorizationContext, filters: string, position: TicketListPosition): string {
			const payload: CursorPayload = {
				v: 1,
				userId: context.userId,
				authorization: authorizationFingerprint(context),
				filters: digest(filters),
				reportedAt: position.reportedAt,
				id: position.id
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
			const signature = createHmac('sha256', secret).update(encodedPayload).digest('base64url');
			return `${encodedPayload}.${signature}`;
		},

		decode(
			value: string,
			context: AuthorizationContext,
			filters: string
		): TicketListPosition | null {
			if (value.length > 2048) return null;
			const parts = value.split('.');
			if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0] ?? '') || !/^[A-Za-z0-9_-]+$/.test(parts[1] ?? '')) {
				return null;
			}
			const encodedPayload = parts[0]!;
			const suppliedSignature = Buffer.from(parts[1]!, 'base64url');
			const expectedSignature = createHmac('sha256', secret).update(encodedPayload).digest();
			if (suppliedSignature.byteLength !== expectedSignature.byteLength || !timingSafeEqual(suppliedSignature, expectedSignature)) {
				return null;
			}

			let payload: unknown;
			try {
				payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as unknown;
			} catch {
				return null;
			}
			if (!isCursorPayload(payload) ||
				payload.userId !== context.userId ||
				payload.authorization !== authorizationFingerprint(context) ||
				payload.filters !== digest(filters)) {
				return null;
			}
			if (payload.reportedAt !== null && !Number.isFinite(Date.parse(payload.reportedAt))) return null;
			return { reportedAt: payload.reportedAt, id: payload.id };
		}
	};
}
