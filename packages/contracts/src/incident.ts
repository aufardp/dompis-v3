export type IncidentNormalizationError = 'not_string' | 'blank' | 'invalid_characters' | 'too_long';

export type IncidentNormalization =
	| { readonly ok: true; readonly incident: string; readonly changed: boolean }
	| { readonly ok: false; readonly reason: IncidentNormalizationError };

const LEGACY_INCIDENT_CHARACTERS = /^[A-Za-z0-9_-]+$/;
const CANONICAL_INCIDENT = /^[A-Z0-9_-]{1,100}$/;

/**
 * Normalizes only the documented ASCII incident key. It never truncates,
 * coerces non-string input, or Unicode-folds characters into another key.
 */
export function normalizeIncident(value: unknown): IncidentNormalization {
	if (typeof value !== 'string') return { ok: false, reason: 'not_string' };
	const trimmed = value.replace(/^ +| +$/g, '');
	if (trimmed.length === 0) return { ok: false, reason: 'blank' };
	if (!LEGACY_INCIDENT_CHARACTERS.test(trimmed)) {
		return { ok: false, reason: 'invalid_characters' };
	}
	if (trimmed.length > 100) return { ok: false, reason: 'too_long' };

	const incident = trimmed.toUpperCase();
	if (!CANONICAL_INCIDENT.test(incident)) return { ok: false, reason: 'invalid_characters' };
	return { ok: true, incident, changed: incident !== value };
}
