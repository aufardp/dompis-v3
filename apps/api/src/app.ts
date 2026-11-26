import { Elysia } from 'elysia';
import { randomUUID } from 'node:crypto';
import { closeDatabase, database, pingDatabase } from '@dompis/db';
import type { ReadinessState } from '@dompis/contracts';
import { createAuthRoutes } from './auth';
import { createTicketRoutes } from './tickets';

export function createApp() {
	return new Elysia()
		.onRequest(({ set }) => {
			set.headers['x-content-type-options'] = 'nosniff';
			set.headers['x-frame-options'] = 'DENY';
			set.headers['referrer-policy'] = 'no-referrer';
		})
		.onError(({ code, error, set }) => {
			const requestId = randomUUID();
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

			try {
				await pingDatabase(database);
				return { status: 'ready' };
			} catch (error: unknown) {
				console.error({
					event: 'readiness_check_failed',
					errorType: error instanceof Error ? error.name : 'unknown'
				});
				set.status = 503;
				return { status: 'not_ready', reason: 'database_unavailable' };
			}
		})
		.use(createAuthRoutes(database, Bun.env.APP_ORIGIN))
		.use(createTicketRoutes(database))
		.onStop(async () => {
			await closeDatabase();
		});
}
