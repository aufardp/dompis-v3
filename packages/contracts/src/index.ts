export type ReadinessState =
	| { status: 'ready' }
	| { status: 'not_ready'; reason: 'database_not_configured' | 'database_unavailable' };
