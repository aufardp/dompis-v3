export type ReadinessState =
	| { status: 'ready' }
	| {
			status: 'not_ready';
			reason: 'database_not_configured' | 'database_unavailable' | 'auth_origin_not_configured' | 'auth_origin_invalid';
		};

export { normalizeIncident } from './incident';
export type { IncidentNormalization, IncidentNormalizationError } from './incident';
