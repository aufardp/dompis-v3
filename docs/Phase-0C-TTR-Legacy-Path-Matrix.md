# Phase 0C — TTR rule paths found in dompis_v2

Status: static source-code audit. This records observable legacy behavior and the maximum-hour catalogue supplied by the owner. It is not an instruction to copy the old implementation. No v3 calculation has been implemented or executed from this document.

## Owner-provided close limits

The owner already provided the maximum hours allowed for each ticket family to close; see [Legacy Classification and Time/TTR Reference](Phase-0C-Legacy-Classification-TTR-Reference.md). All former `RESELLER` criteria are `INDIBIZ` in v3. These limits are distinct from the changing NOSSA fields `TTR_Customer` and `TTR_END_TO_END`.

## What the legacy code calculates

| Output | Source path | Input clock and behavior |
|---|---|---|
| Stored TTR compliance | `app/libs/tickets/ttr-comply.ts` | Requires a legacy close status, `resolve_date`, parseable `reported_date`, and an applicable threshold. Deadline = reported + threshold. `resolve_date <= deadline` is comply. Missing/unknown/ineligible inputs return null. V3 lifecycle statuses must use the owner's approved status lists, not copy the old `CLOSE_STATUS_VALUES` verbatim. |
| B2C compliance threshold | `getComplyMaxTtrHours` + `app/config/customer-types.ts` | Only `DCS`/`PL-TSEL` segments use `customer_type`: Diamond 3h, Platinum 6h, Gold 12h, Reguler 24h. Empty/unrecognized type returns null for compliance; display helper fallback 24h is a separate path. |
| B2B compliance threshold | `getComplyMaxTtrHours` + `app/config/jenis-tiket.ts` | Neutral categories return null. Then TOP OLO special rule (4h without GAMAS reference, 7h with one), then DATIN-family tier (base/K1 1.5h, K2 3.6h, K3 7.2h; SIP TRUNK excluded from tier and flat 10h), then type-2 SLA override, then type-1 override. |
| SQM-CCAN work-hour compliance | `getComplyMaxTtrHours` and `computeSqmWorkHourCompliance` | `reported_date` is interpreted in WIB; eligible report hour is `08:00 <= time < 17:00`. Deadline is reported + 4h. Non-work-hour, invalid date, open status, or missing resolve time gives null. |
| MANJA compliance | `computeManjaCompliance` | Only `flagging_manja=P1` is eligible; deadline = `booking_date + 3h`, not reported date. P+ is not included by this compliance function. |
| Priority countdown | `app/libs/priority/ttr.ts` | Separate buckets: Diamond/VVIP 3h, Platinum 6h, MANJA 3h, regular 36h. Non-MANJA starts from reported date; MANJA prefers booking date and falls back to reported date. “Near” means 10% of bucket time remaining. Invalid far-future reported dates are rejected. |
| Displayed Max TTR | `app/libs/tickets/effective.ts` | Requires reported date. Precedence: booking + 3h; guarantee + P1/P+ reported + 3h; customer-specific stored max-TTR date; compliance threshold; static type display threshold (including neutral categories); finally customer-type fallback. This display date can differ from compliance deadline. |
| MTTR | `app/libs/tickets/mttr.ts`, dashboard services | Average elapsed seconds from reported date to selected end date. Dashboard selects `resolve_date` first, then `closed_at`; missing or negative durations are excluded. The overview query selects tickets resolved in period, or tickets with no resolve date but closed in period. |

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
| Regular priority countdown | type REG/REGULER, no MANJA flag, reported time present | 36h countdown, which is not the Reguler 24h compliance threshold |
| MTTR | reported 10:00, selected close/resolve 12:30 | 9,000 seconds; missing/negative duration is omitted from average |

## Contract gaps still open

- The owner-approved v3 status groups supersede the legacy close-list values. Unknown v3 status remains unknown.
- The owner-provided maximum-hour catalogue is known. Remaining work is exact golden parity for each separate path, not asking the owner for thresholds again.
- The supplied NOSSA sample shows `TTR_Customer` 4.056 then 4.06 and `TTR_END_TO_END` as number then string. One sample does not define units, rounding, whether those are elapsed hours, or the clock reset behavior.
- The old parser treats offsetless date strings as WIB; upstream meaning for each timestamp still requires an authoritative contract. The supplied ISO fields show `+07:00`; booking date is offsetless.
- The legacy dashboard contains date-window and denominator logic beyond the rule functions. Each v3 report needs an approved metric definition and golden input/output before KPI parity is claimed.

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
