# Data Contract — QOSMIC Metabase Bridge v1.0

Source: supplied Metabase Bridge API OAS 3.0 documentation, 25 Nov 2026; supplied 100-row NOSSA response and single incident example. No live network calls were performed. This is a documented upstream contract, not an assertion of live availability.

## Endpoints
Base URL `https://qosmic.solusee.id/api/metabase-bridge`; server-side Bearer API key. Scope fixed REG-4 and REG-5. GET `/nossa` and `/nossa-closed` only. `/ticket-by-service` documented but excluded by product scope. Search service_no in local database.

| Parameter | Contract |
|---|---|
| incident | exact, letters/numbers/-/_, max 32; fallback GAMAS parent returns children |
| status | exact status, omit for ingestion |
| date_from/date_to | inclusive Status_Date, YYYY-MM-DD or YYYY-MM-DD HH:mm:ss; date-only upper covers whole day |
| limit | default 100, max 1000 |
| offset | max 5000 |
| closed date window | default 7 days, max 31 days without incident |
| closed history floor | 2026-01-01 for non-incident scans; earlier date clamped, wholly earlier range 422 |
| rate | documented 50/min/key, configurable; local start 20/min, increase only after approval and measurement |

`ORDER BY Status_Date DESC` is not a total order when timestamps tie. No server cursor or secondary sort documented. `meta.count` interpreted as page count, verified in sample (100); do not assume total. Documentation example for closed response shows resource=nossa; accept expected `nossa_closed` only by default, test actual behavior and explicitly configure any verified alias. `filters` is object in docs but [] in actual no-filter sample. Accept object or empty array only. `is_induk`, `matched_by`, `induk_gamas` optional; validate when present. `generated_at` is envelope time, never row version.

## Errors
401 stop stream and alert; 422 reject parameters/no blind retries; 429 respect Retry-After (seconds), pause shared budget; 502 bounded retry with jitter; network/503/504 similarly bounded. HTTP 200 with ok=false or malformed envelope fails window. No upstream request in browser or API request path.

## Observations
100 rows, 100 distinct incident IDs, union 103 keys. Status distribution: BACKEND 56, ANALYSIS 16, CLOSED 11, MEDIACARE 10, FINALCHECK 4, RESOLVED 3. REG-4 41 / REG-5 59. All samples are resource=nossa, including CLOSED rows. The docs' descriptions of the streams are not a lifecycle contract. Resolved date appears even in non-CLOSED status; actual closed timestamp field not established. `Last_Update_Ticket` and `Status_Date` must be retained separately; neither `inserted_date` nor generated_at is a safe modification cursor.

TTR fields contain decimals, strings (including .085), zero and null. Preserve exact numeric source values; do not treat them as seconds/hours until signed off. `C_SLG_TTR` unit unknown. Booking timestamps may lack zone; contract timezone must be confirmed (proposed WIB for offsetless values). Explicit offsets honored. Source numeric segment 1/2/3 not equivalent to KPI segment without rules. `C_PARENT_ID` UUID is external metadata, not local PK or necessarily GAMAS parent; `Induk_gamas` is explicit source GAMAS reference.

## Release gates
Obtain sanitized actual closed response (including CLOSED, reopened incident if available), confirm resource field, closure timestamp mapping, status taxonomy, TTR units, historical completeness, timezone for offsetless dates, stable window ordering and behavior of GAMAS lookup. Test multiple pages and dense same-second timestamps. No inferred values for absent fields. Do not publish unverified KPI as zero or compliant. Original samples contain customer identifiers and free text; deliberately excluded from distributable blueprint.

## v1.1 historical coverage
API bulk history floor is not a data retention floor for local PostgreSQL. Existing pre-2026 data must be migrated from MySQL if eligible; do not delete it or label it verified by NOSSA. Legacy incident VARCHAR(100) may exceed upstream lookup limit; do not call endpoint for incompatible identifiers. Actual closed fixture and timestamp/SLA semantics still release gates.
