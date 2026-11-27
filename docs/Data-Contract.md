# Data Contract — QOSMIC Metabase Bridge v1.0

## Kebijakan v1.3 (berlaku atas seluruh dokumen)
Pemilik mengizinkan agent lokal mengakses MySQL dan PostgreSQL, read dan write. Akses aktual bergantung pada credential, jaringan, privilege dan sandbox agent; jangan mengakali kontrol. Gunakan Database-Access.md sebagai kebijakan otoritatif. Read produksi yang ringan dan write rutin terukur dalam target yang telah didaftarkan tidak memerlukan konfirmasi per query. Operasi produksi berisiko tinggi, perubahan schema produksi, bulk correction, freeze/cutover dan tindakan irreversible memerlukan persetujuan runbook khusus. Source legacy tetap read-only; database bukan source code. Discovery tidak mengubah data bisnis produksi. Semua rancangan teknis termasuk DDL, jumlah tabel/index dan alias adalah kandidat, bukan kontrak tetap. Direct matching Workzone diutamakan; buktikan keunikan global setelah normalisasi, jika ambigu gunakan pembeda yang terverifikasi, jangan menebak. Alias hanya bila terbukti diperlukan. Requirement bisnis, integritas historis, keamanan dan stack tetap wajib. Lihat Discovery-Protocol.md dan Decision-Log.md.


Source: supplied Metabase Bridge API OAS 3.0 documentation, 25 Nov 2026; supplied 100-row `/nossa` sample and owner-provided same-incident lookup samples from `/nossa` and `/nossa-closed`. No live network calls were performed. This is supplied documentation/sample evidence, not an assertion of live availability.

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

`ORDER BY Status_Date DESC` is not a total order when timestamps tie. No server cursor or secondary sort documented. `meta.count` is interpreted as page count, observed as 100 in the 100-row sample; do not assume it is a total. Resource evidence differs by supplied artifact: the 100-row `/nossa` sample contains `resource=nossa` even for rows whose status is closed, while the owner's incident lookup on `/nossa-closed` returns `resource=nossa_closed`. Preserve the endpoint requested and observed resource as provenance; do not derive lifecycle from either label. No other resource alias is verified. `filters` is an object in the owner incident samples and OAS, while a no-filter sample used `[]`; accept only those documented shapes and validate according to request mode. `is_induk`, `matched_by`, and `induk_gamas` are optional; validate when present. `generated_at` is envelope time, never row version.

## Errors
401 stop stream and alert; 422 reject parameters/no blind retries; 429 respect Retry-After (seconds), pause shared budget; 502 bounded retry with jitter; network/503/504 similarly bounded. HTTP 200 with ok=false or malformed envelope fails window. No upstream request in browser or API request path.

## Observations
100-row sample: 100 distinct incident IDs, union 103 keys. Status distribution: BACKEND 56, ANALYSIS 16, CLOSED 11, MEDIACARE 10, FINALCHECK 4, RESOLVED 3. REG-4 41 / REG-5 59. Every row in that sample has `resource=nossa`, including CLOSED statuses. The separate owner incident lookup pair returns `resource=nossa` for the open request and `resource=nossa_closed` for the closed request. Stream/resource labels are not a lifecycle contract. `C_RESOLVE_DATE` appears even in a non-CLOSED status in the 100-row sample; it is the owner's selected compliance comparison field, but no automatic closed timestamp alias is inferred from it. `Last_Update_Ticket` and `Status_Date` must be retained separately; neither `inserted_date` nor `generated_at` is a safe modification cursor.

TTR fields contain decimals, strings (including .085), zero and null. Preserve exact numeric source values; do not treat them as seconds/hours until a UI/use contract requires that semantic. `C_SLG_TTR` unit unknown. Owner samples show explicit `+07:00` offsets on ISO report/resolve/status fields and an offsetless `C_BOOKING_DATE`; the legacy parser interprets offsetless values as WIB, but that alone does not prove upstream meaning. Preserve raw value and defer conversion of offsetless source timestamps until a sanitized source fixture or authoritative contract confirms it. Explicit offsets must be honored. Source numeric segment 1/2/3 is not equivalent to KPI segment without rules. `C_PARENT_ID` UUID is external metadata, not local PK or necessarily GAMAS parent; `Induk_gamas` is explicit source GAMAS reference.

The supplied closed incident row contains two JSON property names with a leading CRLF (`JML_TIKET_ANAK_GAMAS` and `TOTAL_INTERNET_INDIHOME`). An adapter may remove that exact control-character prefix from JSON property names before schema lookup, while retaining the raw property name in bounded parser diagnostics. It must reject or quarantine collisions created by normalization and must not apply broad key rewriting to arbitrary unknown fields. This is a fixture-specific compatibility rule, not evidence that every upstream response contains malformed keys.

## Release gates
The owner-provided sanitized incident pair already supplies a closed response and demonstrates the open→closed endpoint shape change; do not request that pair again. Still obtain a sanitized same-incident closed→open response or authoritative source version/order evidence; confirm closed-window completeness, offsetless timestamp behavior, stable window ordering, and GAMAS lookup before claiming replay correctness. Owner lifecycle taxonomy and compliance inputs/comparison are already recorded in ADR-048/050/052 and PRD AC09; fixtures validate mapping/replay, not reopen those decisions. Preserve upstream `TTR_Customer`/`TTR_END_TO_END` values without assigning units; determine unit/rounding only if v3 displays or consumes them. Test multiple pages and dense same-second timestamps using synthetic fixtures; no live call without the separate approved runbook. No inferred values for absent fields. Do not publish unverified KPI as zero or compliant. Original samples contain customer identifiers and free text; deliberately excluded from distributable blueprint.

## v1.3 historical coverage
API bulk history floor is not a data retention floor for local PostgreSQL. Existing pre-2026 data must be migrated from MySQL if eligible; do not delete it or label it verified by NOSSA. Legacy incident VARCHAR(100) may exceed upstream lookup limit; do not call endpoint for incompatible identifiers. The sanitized owner-supplied closed incident fixture is available; the remaining source gates are closed→open/version ordering, pagination/window completeness, and offsetless timestamp semantics. Owner lifecycle and compliance rules are recorded separately and are not pending repeat approval.

## v1.3 boundary
New top-level area/region hierarchy is internal master data; upstream remains fixed REG-4/REG-5 and no additional endpoint. `Regional`, `witel`, `Workzone`, TIF fields do not define trusted application authorization. Verify aliases with owner; do not send internal area IDs to upstream or assume organization name maps automatically.
