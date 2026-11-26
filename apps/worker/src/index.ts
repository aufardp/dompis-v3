if (Bun.env.SYNC_ENABLED !== 'true') {
	console.info({ event: 'sync_worker_disabled' });
	process.exit(0);
}

console.error({ event: 'sync_worker_not_implemented' });
process.exit(1);
