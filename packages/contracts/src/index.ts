export type ReadinessState =
	| { status: 'ready' }
	| { status: 'not_ready'; reason: 'database_not_configured' | 'database_unavailable' };

export { normalizeIncident } from './incident';
export type { IncidentNormalization, IncidentNormalizationError } from './incident';
