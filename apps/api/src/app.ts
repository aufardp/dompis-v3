import { Elysia } from 'elysia';
import { randomUUID } from 'node:crypto';
import { closeDatabase, database, pingDatabase } from '@dompis/db';
import type { ReadinessState } from '@dompis/contracts';
import { createAuthRoutes } from './auth';
import { createTicketRoutes } from './tickets';

function isValidAppOrigin(value: string | undefined): value is string {
	if (!value) return false;
	try {
		const origin = new URL(value);
		return (origin.protocol === 'http:' || origin.protocol === 'https:') && origin.origin === value;
	} catch {
		return false;
	}
}

export function createApp() {
	const configuredAppOrigin = Bun.env.APP_ORIGIN;
	const appOrigin = isValidAppOrigin(configuredAppOrigin) ? configuredAppOrigin : undefined;
	const appOriginFailure = configuredAppOrigin ? 'auth_origin_invalid' as const : 'auth_origin_not_configured' as const;

	return new Elysia()
		.onRequest(({ set }) => {
			set.headers['x-request-id'] = randomUUID();
			set.headers['x-content-type-options'] = 'nosniff';
			set.headers['x-frame-options'] = 'DENY';
			set.headers['referrer-policy'] = 'no-referrer';
		})
		.onError(({ code, error, set }) => {
			const responseRequestId = set.headers['x-request-id'];
			const requestId = typeof responseRequestId === 'string' ? responseRequestId : randomUUID();
			const statusCode = error instanceof Error && 'status' in error &&
				typeof error.status === 'number' && error.status >= 400 && error.status <= 599
				? error.status
				: code === 'NOT_FOUND' ? 404 : 500;
			const publicError = statusCode === 404
				? 'not_found'
				: statusCode < 500 ? 'invalid_request' : 'internal_error';

			set.status = statusCode;
			set.headers['x-request-id'] = requestId;
			if (statusCode >= 500) {
				console.error({
					event: 'api_request_failed',
					requestId,
					errorCode: code,
					errorType: error instanceof Error ? error.name : 'unknown'
				});
			}
			return { error: publicError, requestId };
		})
		.get('/health/live', () => ({ status: 'alive' as const }))
		.get('/health/ready', async ({ set }): Promise<ReadinessState> => {
			if (!database) {
				set.status = 503;
				return { status: 'not_ready', reason: 'database_not_configured' };
			}
			if (!appOrigin) {
				set.status = 503;
				return { status: 'not_ready', reason: appOriginFailure };
			}

			try {
				await pingDatabase(database);
				return { status: 'ready' };
			} catch (error: unknown) {
				const requestId = set.headers['x-request-id'];
				console.error({
					event: 'readiness_check_failed',
					requestId: typeof requestId === 'string' ? requestId : 'unknown',
					errorType: error instanceof Error ? error.name : 'unknown'
				});
				set.status = 503;
				return { status: 'not_ready', reason: 'database_unavailable' };
			}
		})
		.use(createAuthRoutes(database, appOrigin))
		.use(createTicketRoutes(database))
		.onStop(async () => {
			await closeDatabase();
		});
}
