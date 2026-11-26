# Business Rules Registry — candidate inventory, not approved rules
Status: Phase 0 baseline. Evidence below from supplied archives and QOSMIC documentation/sample; local agent verifies current checkout and obtains business sign-off. Do not implement disputed KPI logic as fact. Shared pure TS domain for classification; shared SQL predicates for list/aggregation with golden fixture parity, not two divergent rules.

| ID | Candidate / question | Evidence | Gate |
|---|---|---|---|
| BR-01 | identity normalized incident; endpoint not lifecycle | payload /nossa has CLOSED rows; contract | approved conflict/reopen rules; test identical, stale, equal-conflict |
| BR-02 | Customer: source CUSTOMER + TECHNICAL + allowed types | app/config/operational-buckets.ts | confirm classification and eligibility |
| BR-03 | Proactive: PROACTIVE, TECHNICAL, channel 50/83, SQM/SQM-CCAN | same config | verify PREMAN migration and overlap precedence |
| BR-04 | Unspec: PROACTIVE channel 28 and technical unspec types | same config | verify non-KPI, B2B rules |
| BR-05 | Non Technical: NONTECHNICAL/BILLING, unknown handling | same config | distinguish unknown from classified nontechnical |
| BR-06 | SQM Update requires local sqm_update_reason | same config | legacy-only fact availability and future source-only policy |
| BR-07 | Obsolete candidate classification_path Z_PERMINTAAN_044 | same config + NOSSA ISOBSOLETE | verify precedence and divergence |
| BR-08 | B2C candidates DCS, PL-TSEL | same config | validate B2B/netral/unknown; source Segment != KPI segment |
| BR-09 | legacy KPI statuses ANALYSIS/BACKEND/DRAFT/FINALCHECK/PENDING; open/closed status distinct from KPI eligibility | same config | verify RESOLVED/MEDIACARE/FINALCHECK and unknown statuses |
| BR-10 | daily board active + closed today, old customer sync_date/pending exceptions | daily-ticket-where.ts | remove sync_date dependency; approve carry-over and local pending behavior |
| BR-11 | TTR/SLA and compliance, booking and work-hour exclusions | app/libs/priority/ttr.ts, app/libs/tickets/ttr-comply.ts (inspect locally) | raw TTR unit, timezone, clock basis and threshold signed off; don't infer closed_at from resolve |
| BR-12 | Semesta by reported range; historical KPI baseline | Source-Audit.md / old report paths | compare per-date/scope/bucket; approve legacy vs new classification differences |
| BR-13 | Rekap Workorder matrix, open/close, hourly, drilldown | lib/rekap/rekap-classify.ts + report routes (inspect locally) | approve date basis/denominator; remove technician metrics |
| BR-14 | Detail WO HI operational date filter, actual close/resolve | PRD + old route (verify locally) | approve date basis, field requirements |
| BR-15 | GAUL/recurring and GAMAS children | payload GAUL/Induk_gamas + contract fallback | verify counting and no double incident; don't conflate lookup parent with row incident |
| BR-16 | Organizational scope is five-level grant union, filter intersection | owner v1.3 requirement, Organization-Scope.md | effective-access comparison, approve inactive/global policy |
| BR-17 | No hard-coded active workzone list as authorization or KPI | legacy config contains list | replace with approved hierarchy; KPI eligibility separate if business owner requires it |

## Rule acceptance template
For each ID add source file/line + commit, plain-language rule, required fields and types, precedence, null/unknown treatment, time window/timezone, permitted scope, test input/output (synthetic), metric numerator/denominator and membership, conflict with old results, proposed correction, approver/date, rule version. State candidate/validated/rejected; unknown fields not filled with zero. Mutually exclusive bucket priority approved; overlays explicitly separate. Archive original historical values; no automatic reclassify without bounded versioned job and before/after count. KPI publication blocked until definition validated. No technician workflow. No source code copied.
