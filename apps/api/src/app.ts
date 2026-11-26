import { Elysia } from 'elysia';
import { closeDatabase, database, pingDatabase } from '@dompis/db';
import type { ReadinessState } from '@dompis/contracts';
import { createAuthRoutes } from './auth';
import { createTicketRoutes } from './tickets';

export function createApp() {
	return new Elysia()
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
