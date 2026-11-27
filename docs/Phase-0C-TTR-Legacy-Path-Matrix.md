# Phase 0C — TTR rule paths found in dompis_v2

Status: static source-code audit. This records observable legacy behavior and the maximum-hour catalogue supplied by the owner. It is not an instruction to copy the old implementation. No v3 calculation has been implemented or executed from this document.

## Owner-provided close limits

The owner already provided the maximum hours allowed for each ticket family to close; see [Legacy Classification and Time/TTR Reference](Phase-0C-Legacy-Classification-TTR-Reference.md). All former `RESELLER` criteria are `INDIBIZ` in v3. These limits are distinct from the changing NOSSA fields `TTR_Customer` and `TTR_END_TO_END`.

Additional v3 owner decisions: **Regular priority countdown is 24 hours** (override the legacy 36-hour countdown); **MTTR is deferred** and is not a current Phase 0C blocker or an implementation requirement until resumed.

## What the legacy code calculates

| Output | Source path | Input clock and behavior |
|---|---|---|
| Stored TTR compliance | `app/libs/tickets/ttr-comply.ts` | Requires a legacy close status, `resolve_date`, parseable `reported_date`, and an applicable threshold. Deadline = reported + threshold. `resolve_date <= deadline` is comply. Missing/unknown/ineligible inputs return null. V3 lifecycle statuses must use the owner's approved status lists, not copy the old `CLOSE_STATUS_VALUES` verbatim. |
| B2C compliance threshold | `getComplyMaxTtrHours` + `app/config/customer-types.ts` | Only `DCS`/`PL-TSEL` segments use `customer_type`: Diamond 3h, Platinum 6h, Gold 12h, Reguler 24h. Empty/unrecognized type returns null for compliance; display helper fallback 24h is a separate path. |
| B2B compliance threshold | `getComplyMaxTtrHours` + `app/config/jenis-tiket.ts` | Neutral categories return null. Then TOP OLO special rule (4h without GAMAS reference, 7h with one), then DATIN-family tier (base/K1 1.5h, K2 3.6h, K3 7.2h; SIP TRUNK excluded from tier and flat 10h), then type-2 SLA override, then type-1 override. |
| SQM-CCAN work-hour compliance | `getComplyMaxTtrHours` and `computeSqmWorkHourCompliance` | `reported_date` is interpreted in WIB; eligible report hour is `08:00 <= time < 17:00`. Deadline is reported + 4h. Non-work-hour, invalid date, open status, or missing resolve time gives null. |
| MANJA compliance | `computeManjaCompliance` | Only `flagging_manja=P1` is eligible; deadline = `booking_date + 3h`, not reported date. P+ is not included by this compliance function. |
| Priority countdown | `app/libs/priority/ttr.ts` | Legacy buckets: Diamond/VVIP 3h, Platinum 6h, MANJA 3h, regular 36h. Owner v3 override: regular countdown **24h**. Non-MANJA starts from reported date; MANJA prefers booking date and falls back to reported date. “Near” means 10% of bucket time remaining. Invalid far-future reported dates are rejected. |
| Displayed Max TTR | `app/libs/tickets/effective.ts` | `reported_date` must parse first. A valid booking date wins and gives booking +3h, regardless of guarantee/flag. If booking is absent/invalid, exact normalized `guarantee` plus raw P1/P+ flag gives reported +3h. Otherwise try customer-specific stored max-TTR date, compliance threshold, static type display threshold (including neutral categories), and customer-type fallback. This display date can differ from compliance deadline. |
| MTTR | `app/libs/tickets/mttr.ts`, dashboard services | Legacy source behavior was previously documented, but the owner has asked to defer MTTR. Do not include MTTR in current implementation or keep it as an active Phase 0C decision gate. |

## Small synthetic parity cases from code inspection

These expected cases make the old behavior concrete. They are documentation fixtures only; no test suite or implementation has run them.

| Case | Synthetic inputs | Legacy expected result |
|---|---|---|
| B2C Diamond | DCS, HVC_DIAMOND, reported 10:00, resolve 12:00 | Compliance deadline 13:00; comply |
| B2C unknown type | DCS, blank/unknown customer type, closed with valid dates | Compliance status and deadline null; display fallback may still show 24h |
| Indibiz | B2B, type Indibiz, no earlier conditional override | Maximum close limit 24h per owner catalogue and executable config |
| TOP OLO without/with GAMAS | B2B, TOP OLO, reference absent/present | 4h / 7h respectively |
| DATIN K2 | B2B, DATIN family, suffix K2 | 3.6h; K3 is 7.2h; no suffix/K1 is 1.5h |
| SQM-CCAN at 16:59/17:00 WIB | closed, valid reported+resolve | 16:59 is eligible for 4h compliance; 17:00 is not evaluated |
| MANJA P1 | closed, valid booking time, `flagging_manja=P1` | Compliance deadline is booking +3h |
| MANJA P+ | `flagging_manja=P+` | Not eligible in `computeManjaCompliance`; other display/countdown paths have their own P+ handling |
| Regular priority countdown | type REG/REGULER, no MANJA flag, reported time present | Legacy was 36h; v3 owner decision overrides countdown to 24h, matching the supplied Reguler maximum-close limit |
| Booking Max TTR | parseable reported + booking timestamps | Display deadline = booking +3h; booking branch precedes guarantee, flag, stored Max TTR and type rules |
| Guarantee Max TTR | no valid booking date; guarantee status `GUARANTEE`; raw flag P1 or P+ | Display deadline = reported +3h; other flags do not activate this branch |
| Booking prerequisite | booking date parses but reported date is missing/unparseable | Display Max TTR is null because the function validates reported date before checking booking |

## Contract gaps still open

- The owner-approved v3 status groups supersede the legacy close-list values. Unknown v3 status remains unknown.
- The owner-provided maximum-hour catalogue is known. Remaining work is exact golden parity for each separate path, not asking the owner for thresholds again.
- The supplied NOSSA sample shows `TTR_Customer` 4.056 then 4.06 and `TTR_END_TO_END` as number then string. These are not inputs to the owner-approved compliance calculation; preserve their source values and determine units/rounding only if v3 displays or consumes them.
- The old parser treats offsetless date strings as WIB. Supplied `Reported_Date` and `C_RESOLVE_DATE` have `+07:00`; `C_BOOKING_DATE` is offsetless. Use explicit source offsets when present and preserve the legacy WIB interpretation for offsetless booking input, subject to a sanitized source fixture. This does not change compliance's explicit `reported_date`/`resolve_date` rule.
- PRD and owner decisions define SLA compliance inputs, comparison, menu date basis/populations, and current lifecycle statuses. Remaining report contract work is Semesta default interval/granularity, any KPI membership/denominator not already defined by PRD, recurring/GAUL rules if retained, and golden input/output parity. MTTR is explicitly deferred.

## Source files inspected

- `dompis_v2/app/libs/tickets/ttr-comply.ts`
- `dompis_v2/app/libs/priority/ttr.ts`
- `dompis_v2/app/libs/tickets/effective.ts`
- `dompis_v2/app/libs/tickets/mttr.ts`
- `dompis_v2/app/config/customer-types.ts`
- `dompis_v2/app/config/jenis-tiket.ts`
- `dompis_v2/app/config/priority-rules.ts`
- `dompis_v2/app/libs/services/dashboard-overview.ts`
- `dompis_v2/app/api/dashboard/ttr-compliance-overview/route.ts`
