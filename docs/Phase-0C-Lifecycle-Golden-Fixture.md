# Phase 0C — Synthetic lifecycle golden fixture

Status: **owner-approved status mapping plus sanitized samples from both incident lookup endpoints**. The sanitized endpoint sample is in `Phase-0C-NOSSA-Incident-Fixture-Sanitized.json`; it records one incident observed open in `/nossa` and closed in `/nossa-closed`. It validates observed response envelopes/fields and an open→closed current-state change, but is not a post-close reopen sample and does not establish pagination completeness or conflict ordering.

## Status-to-lifecycle cases

| Synthetic case | Current upstream status | Expected lifecycle | Expected reopen transition |
|---|---|---|---|
| `open_new` | `NEW` | `open` | none |
| `open_draft` | `DRAFT` | `open` | none |
| `open_analysis` | `ANALYSIS` | `open` | none |
| `open_pending` | `PENDING` | `open` | none |
| `open_backend` | `BACKEND` | `open` | none |
| `closed_finalcheck` | `FINALCHECK` | `closed` | none |
| `closed_resolved` | `RESOLVED` | `closed` | none |
| `closed_mediacare` | `MEDIACARE` | `closed` | none |
| `closed_salamsim` | `SALAMSIM` | `closed` | none |
| `closed_closed` | `CLOSED` | `closed` | none |
| `legacy_open_unlisted` | `OPEN` | `unknown` | none |
| `legacy_close_unlisted` | `CLOSE` | `unknown` | none |
| `unrecognized_status` | `NEW_VENDOR_STATE` | `unknown` | none |
| `missing_status` | `NULL` | `unknown` | none |

## Synthetic same-incident transition cases

| Case | Previously observed status | Newly observed status | Expected current lifecycle | Expected transition |
|---|---|---|---|---|
| `closed_to_open_reopen` | `CLOSED` | `BACKEND` | `open` | `reopen` |
| `finalcheck_to_new_reopen` | `FINALCHECK` | `NEW` | `open` | `reopen` |
| `closed_to_closed` | `RESOLVED` | `CLOSED` | `closed` | no reopen |
| `open_to_open` | `PENDING` | `ANALYSIS` | `open` | no reopen |

## Deliberate coverage limits

- Case/status values are the exact labels supplied by the owner. No case folding, trimming, aliasing, or additional status value is assumed.
- Unlisted or null status remains `unknown`; never infer lifecycle from a new label or endpoint name. `OPEN` and `CLOSE` are not added because they are absent from the owner's explicit sets.
- A reopen requires observations for the same incident in closed then open groups. This fixture does not establish how either NOSSA endpoint exposes that transition or how to order conflicting source rows.
- No closure timestamp is derived from status. `resolved_at`, `closed_at`, timezone, source version/conflict, history retention, TTR/SLA, and KPI eligibility are outside this fixture and remain open.

These cases are the golden expected outcomes for the enumerated owner-approved lifecycle rule. The two endpoint payload shapes are now represented by a sanitized owner-supplied sample. A closed→open observation for the same incident is still needed to prove the source evidence/order used for an actual reopen; the business rule itself is already decided.
