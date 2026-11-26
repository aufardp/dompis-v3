import { Elysia } from 'elysia';
import { closeDatabase, database, pingDatabase } from '@dompis/db';
import type { ReadinessState } from '@dompis/contracts';

const app = new Elysia()
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
	.onStop(async () => {
		await closeDatabase();
	});

const configuredPort = Number(Bun.env.API_PORT ?? '3000');
const port = Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort <= 65535
	? configuredPort
	: 3000;
const hostname = Bun.env.API_HOST ?? '127.0.0.1';

app.listen({ hostname, port });
console.info({ event: 'api_started', hostname, port });
