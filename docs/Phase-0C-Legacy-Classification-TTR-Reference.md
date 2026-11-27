# Phase 0C — Legacy Classification and Time/TTR Reference

Status: **discovery evidence only; not a v3 business-rule approval**. This page reorganizes the classification/TTR findings relayed by the application owner from another AI agent's audit of `dompis_v2`. The reported query counts and distributions below have not been independently reproduced in this task. Do not seed `source_vlookup`, implement a classifier, calculate a KPI, or clean source values from this page alone.

## 1. Provenance and count reconciliation

The relayed report says it queried `dompis_db.ticket` (about 2.67 million rows) and reviewed `app/config/jenis-tiket.ts`, `app/config/customer-types.ts`, and `app/libs/tickets/ttr-comply.ts`. Exact SQL, filter predicates, snapshot identity, query timestamp, and output artifact were not supplied. Treat its figures as owner-provided secondary evidence, not a reproduced database result.

This differs materially from the registered local discovery read recorded in `Phase-0C-Contract-Access-Discovery.md`: that bounded audit counted exactly **1,108,814** rows in `ticket`. The two figures must not be combined or treated as the same population. Reconcile database identity/provenance, snapshot time, row filters, and whether archive/other tables were included before using either as a migration baseline. The current database registration is not an immutable migration snapshot.

| Evidence | Reported population | Status |
|---|---:|---|
| Owner-relayed other-agent audit | about 2.67 million `ticket` rows | Exact count and predicates unavailable; not reproduced |
| Registered local discovery audit | 1,108,814 `ticket` rows | Exact bounded read in prior discovery; source provenance still unclassified |

## 2. Classification flow and `source_vlookup`

The old classifier is a chain of rules and lookups, not a direct one-column mapping. Legacy behavior reviewed in source indicates direct overrides can precede lookup. The lookup paths include channel/value ID to `jenis_tiket`; B2C `customer_type_key` to `jenis_tiket_2_val`; and B2B `service_type` through `realm_b2b`/flags before deriving the second type. The old application loaded mapping rows into in-memory Maps; that is evidence of implementation shape, not an instruction to reproduce it.

The v3 `source_vlookup` Drizzle table is now represented in the schema as a local reference table. It is not yet populated, and its candidate columns/keys do not establish real-world uniqueness, precedence, or canonicalization. Tickets should retain approved classification snapshots so later lookup edits do not silently rewrite history. Before implementing classification, verify actual mapping rows, duplicate keys, normalization, null behavior, direct-override precedence, and the expected output for sanitized golden cases. No fuzzy lookup or guessed parent is allowed.

### Additional legacy source audit: mapping rows are not the whole classifier

Read-only inspection of the legacy Prisma model, seed script, and classifier, plus a bounded aggregate profile of the registered local MySQL table on 2026-11-27, shows:

- The legacy `source_vlookup` primary key is an auto-increment `id`; `value_id`, `customer_type_key`, `realm_b2b`, and the output fields have ordinary non-unique indexes. The DDL/model therefore does not guarantee one row per lookup key.
- A checked-in seed script contains mappings for multiple key families in the same table and uses MySQL `ON DUPLICATE KEY UPDATE`. A static parse of that script found 134 rows, 134 distinct `value_id` values, 19 populated `customer_type_key` values, and 40 populated `realm_b2b` values. Under trim+uppercase comparison, the populated key columns had no duplicate key groups or conflicting mapped outputs in this seed. This is a static seed profile, not proof that the deployed table equals the live table or that it is the authoritative mapping set. The seed was inspected, not executed or imported.
- A bounded read-only aggregate on the registered local `dompis_db.source_vlookup` found 135 rows, 135 distinct `value_id` values, 20 populated/distinct normalized customer-type keys, and 40 populated/distinct normalized realm keys. Duplicate-group, excess-row, and conflicting-output counts were zero for all three lookup families using exact numeric `value_id` and trim+uppercase text keys. Metadata reported 9 columns and 6 indexes (one unique index, five non-unique). No mapping values were emitted. Compared with the checked-in seed, the live table has one additional row and one additional distinct customer-type key; the identity/value of that difference was not queried.
- The classifier reads all rows without an explicit ordering and constructs three in-memory Maps. If actual table rows contain repeated `value_id`, uppercased `customer_type_key`, or uppercased `realm_b2b` keys, a later row overwrites an earlier Map entry. The checked-in seed profile had no such repeated keys under trim+uppercase, but no unique constraint protects the live table and the deployed rows have not been profiled. Duplicate-key classification could therefore depend on returned row order if live duplicates exist.
- Key normalization is not uniform: `customer_type_key` and `realm_b2b` are uppercased while building Maps; the inspected code does not trim those stored keys there. Lookup inputs are normalized differently by path. A v3 normalized key contract must be explicit and tested rather than inferred from this behavior.
- The classifier applies ordered direct overrides before B2C/B2B lookup branches. Inspected override families include content/nontechnical symptom, TSEL service/summary, GAMAS summary, PREMAN, InfraCare marker, non-numbering, billing, and B2C unspec. Override ordering can change both output fields; `source_vlookup` alone cannot reproduce the classifier.
- B2C lookup uses `channel → value_id → jenis_tiket` and `customer_type → customer_type_key → jenis_tiket_2_val`, with pass-through/default cases. B2B has classification-path and service/source/realm branches, derives type 1 from type 2, and may append a K-tier suffix. These are observed implementation paths, not v3-approved rules.

Implication for v3: the current local table profile and checked-in seed both show no duplicate keys for the three lookup families under the tested canonicalization, but the deployed mapping differs from the seed and its data provenance is unclassified. This is useful key-integrity evidence for this local database only; it is not an immutable migration snapshot or owner approval of mapping values. Before importing any mapping set, establish which source is authoritative and profile its exact rows under the approved normalization. Define key semantics and rule precedence, then add only constraints supported by that approved contract. Implement an explicit, versioned precedence table and golden fixtures separately from the mapping storage. The current v3 Drizzle schema intentionally has no lookup indexes or seed data pending source/provenance and normalization approval.

## 3. Reported classification inventory — snapshot profile, not a fixed target

The other-agent report states that its queried population had 20 distinct `jenis_tiket_1`, 46 distinct `jenis_tiket_2`, and 62 observed pairs, with 1,072,690 rows containing a type. The following type-1 distribution is retained only as a **reported snapshot profile** that may help reconcile the same source snapshot and exact query predicates. These counts are not a product requirement, expected count for a future/live database, or a release acceptance threshold. They will naturally change as tickets arrive, change, or are filtered differently.

The listed type-1 counts sum arithmetically to 1,072,690. This checks only the supplied list's addition; it does not validate the query or population. Before using this profile for migration reconciliation, establish the database/snapshot identity, extraction time, eligibility/filter predicates, classification version, and null/unknown treatment. Compare source and target aggregates only for that same frozen population and rule version; investigate any unexplained delta rather than forcing the target to these numbers. The previously recorded 1,108,814-row local audit remains a separate, unreconciled population.

| `jenis_tiket_1` | Reported tickets |
|---|---:|
| Reguler | 378,661 |
| SQM | 230,133 |
| PERMINTAAN | 110,244 |
| UNKNOWN | 79,983 |
| UNSPEC | 73,047 |
| INFRACARE | 58,145 |
| NON DATIN | 43,536 |
| SQM-CCAN | 38,553 |
| NON NUMBERING | 12,715 |
| TSEL | 11,566 |
| GAMAS | 11,530 |
| UNSPEC B2B | 11,093 |
| DATIN | 5,946 |
| PREMAN | 3,350 |
| DIGITAL_SPBU | 1,402 |
| VPN IP | 1,127 |
| BILLING | 902 |
| TOP OLO | 741 |
| DWDM | 11 |
| REG | 5 |
| **Total (reported)** | **1,072,690** |

## 4. Separate time and TTR concepts

Do not collapse the following into one “TTR rule.” The legacy implementation and the owner-relayed report describe several separate outputs and clocks. The report's type counts in this section are not independently validated.

### 4.1 B2C compliance threshold

For reported `customer_segment` DCS/PL-TSEL, the report says threshold selection is from `customer_type`, rather than `jenis_tiket_2`:

| `customer_type` | Reported threshold |
|---|---:|
| HVC_DIAMOND | 3 hours |
| HVC_PLATINUM | 6 hours |
| HVC_GOLD | 12 hours |
| REGULER | 24 hours |
| blank/unrecognized | 24 hours per relayed report |

The report estimates PL-TSEL at about 853,745 tickets, roughly 80% of that report's population. A behavior discrepancy remains: code inspection documented in `Business-Rules.md` says the legacy compliance path returns not-evaluated/null for an unrecognized B2C customer type, while a helper/display fallback may show 24 hours. Confirm the exact path and denominator before treating 24h as a compliance fallback.

### 4.2 Type/segment thresholds reported for other paths

| Type or family | Reported behavior | Reported count / qualification |
|---|---|---|
| REG / REGULER, SQM, HVC | 3 / 6 / 12 / 24h selected by B2C customer type | 299,900 / 243,002 / 14,436 respectively |
| UNKNOWN | 24h display; neutral and excluded from compliance | 160,040 |
| PERMINTAAN | 24h | 110,424 |
| UNSPEC | 24h | 74,080 |
| INFRACARE | 24h display; neutral and excluded from compliance | 58,145 |
| SQM-CCAN | 4h; only when reported time is 08:00–17:00 WIB | 39,953 |
| INDIBIZ | 24h in executable config; legacy matrix says 4h | 33,081 |
| NON NUMBERING | 24h display; neutral | 12,715 |
| UNSPEC B2B | 24h | 11,093 |
| RESELLER | 24h in executable config; legacy matrix says 6h | 9,569 |
| WIFI-ID | 24h | 3,006 |
| TSEL / TSEL LOW | 24h | 5,407 / 4,971 |
| TSEL MINOR / MAJOR / CRITICAL | 16h / 8h / 4h | 1,092 / 67 / 53 |
| TSEL PREMIUM SITE | 2h | 0 reported rows |
| GAMAS | 4h display; neutral/excluded from compliance | 764 |
| GAMAS DISTRIBUSI / FEEDER / GPON / ODP | 4h / 10h / 1h / 3h display; reported neutral | 4,283 / 940 / 983 / 4,560 |
| PREMAN / DIGITAL_SPBU / BILLING | 24h display; reported neutral | 3,350 / 1,402 / 902 |
| TOP OLO | 4h, or 7h when `ticket_id_gamas` is present | 764 |
| DWDM / SIP TRUNK | 7.2h / 10h | 11 / 1 |

The counts above are heterogeneous report outputs and must not be added as if their predicates were mutually exclusive. Several overlap the type-1 inventory and/or represent type-2 counts.

### 4.3 DATIN-family tiers

The report describes a family rule for `jenis_tiket_1 = DATIN` or `jenis_tiket_2` in DATIN/ASTINET/VPN-IP/METRO-E/IP-TRANSIT family:

| Tier | Reported threshold |
|---|---:|
| no suffix / K1 | 1.5 hours |
| K2 | 3.6 hours |
| K3 | 7.2 hours |
| SIP TRUNK | 10 hours, stated exception |

Reported examples include ASTINET K1 1,151, K2 764, K3 2,855; METRO_E K1 226; VPN IP K1 1,187; IP_TRANSIT K1 2. Confirm suffix parsing, family membership, precedence, and the population because example counts do not reconcile to the preceding type-2 summary as presented.

### 4.4 Conditional clocks and other metrics

| Case | Relayed legacy behavior | Clock basis / open validation |
|---|---|---|
| MANJA with `flagging_manja = P1` | 3h | `booking_date`; confirm missing booking handling |
| Guarantee with P1/P+ flag | 3h | `reported_date`; confirm exact flag predicates and precedence |
| SQM-CCAN | 4h in work hours | `reported_date`, 08:00–17:00 WIB; exact endpoint inclusivity/work calendar needs confirmation |
| TOP OLO | 4h or 7h with GAMAS ticket reference | `reported_date`; confirm source field and null/empty semantics |
| TTR compliance | Compares resolve time with threshold deadline; legacy source review says equality is compliant | Exact eligibility, date fields, pause rules, denominator, and v3 metric approval remain open |
| Priority countdown | Separate priority buckets/countdown | Not the same metric as compliance; candidate legacy values are documented in `Business-Rules.md` |
| Displayed Max TTR | Separate display precedence/fallback | A UI value is not necessarily an SLA result |
| MTTR | Duration from reported to resolve/close according to legacy report path | Denominator, close timestamp, reopened tickets, and null/negative handling need approval |

The upstream NOSSA numeric TTR field units remain unknown. A legacy parser interpreting offsetless timestamps as WIB is not proof of the source system's timezone contract.

## 5. Reported source-data anomalies

| Value/pattern | Reported amount | Safe treatment during discovery |
|---|---:|---|
| `#N/A` in type 2 | 2,227 | Preserve as observed evidence; determine whether lookup miss, source literal, or export artifact |
| `Reguler` / `REG` / `REGULER` | counts differ by field/context | Do not merge or rewrite until canonical mapping and historical snapshot policy are approved |
| `DATIN - DATIN - K2` | 3 | Malformed-looking value; inspect sanitized source and mapping behavior |
| `CCAN` | 4 | Report says expected `SQM-CCAN`; requires source-backed confirmation before correction |
| `InfraCare` vs `INFRACARE` | 216 `InfraCare` | Case/value variation; do not normalize destructively |
| `CUSTOMER SEGMENT`, `tes`, `21/01/1900` | 3 total | Possible sheet/header/test/date artifacts; eligibility/disposition requires evidence |

## 6. Reconciliation checklist before implementation

- [ ] Identify which database/snapshot and exact row predicate produced the approximately 2.67m figure; reconcile with the local 1,108,814-row audit.
- [ ] Obtain sanitized SQL/aggregate definitions for unique values, pairs, ticket counts, and every per-rule count.
- [ ] Verify all 46 type-2 values and all 62 pairs, including null/blank handling; current relayed report lists only the rule-relevant subset.
- [ ] Profile actual `source_vlookup` rows for duplicate lookup keys, casing, nulls, precedence, and unmapped values. Approve canonical output without mutating historical source values.
- [ ] Confirm whether the deployed mapping is maintained by a source table, checked-in seed, or both; compare provenance and avoid running legacy seed code.
- [ ] Prove deterministic results for duplicate normalized keys and override precedence; add only evidence-backed v3 uniqueness constraints and indexes.
- [ ] Resolve executable-config vs documentation conflicts (at least INDIBIZ and RESELLER) with the application owner.
- [ ] Resolve blank/unrecognized B2C customer type behavior separately for display, compliance eligibility, and KPI denominator.
- [ ] Approve the threshold/clock basis for each product surface; separate compliance, countdown, display Max TTR, and MTTR.
- [ ] Confirm work-hour calendar, timezone, boundary inclusivity, booking/guarantee/GAMAS predicates, suffix parsing, and tier family membership.
- [ ] Build sanitized golden fixtures and expected outputs after business rules are approved; record rule version and reclassification/rollback plan.

Until these items are resolved, the figures and rules are discovery references only. No v3 classifier, SLA, TTR, or KPI behavior is approved by this document.

## Related documents

- `Business-Rules.md` — candidate business rules and legacy implementation conflicts.
- `Phase-0B-Discovery.md` — source-code evidence paths and broader legacy findings.
- `Phase-0C-Owner-Decision-Packet.md` — owner decisions and missing approvals.
- `Phase-0C-Contract-Access-Discovery.md` — source registration and migration baselines.
- `Database.md` / `schema-proposed.sql` — candidate `source_vlookup` storage; no mapping data is seeded.
