# Sync Engine — implementation specification

One Bun worker, one shared request budget, no Redis, no projection queue. PostgreSQL advisory lock on a dedicated connection; loss of lock connection stops worker. API never calls upstream directly. Source scope fixed REG-4/REG-5. Manual refresh is a bounded worker request, not a synchronous fetch.

## Scheduling and coverage
- Initial open bootstrap: scan bounded Status_Date windows across all accessible active history, including old active tickets; no assumption that last 7 days covers open backlog. Ask upstream owner about earliest open date and completeness. Do not mark bootstrap complete without coverage evidence.
- Live open stream: every 2 minutes, closed every 5 minutes initially. Poll bounded overlapping windows (start with 15-minute overlap, extend if late changes measured); fixed upper bound per run. The bridge filters Status_Date, NOT Last_Update_Ticket. Edits that do not change Status_Date require periodic reconciliation of open history and rolling closed history; no guaranteed CDC.
- Historical closed backfill from 2026-01-01, windows <=7 days initially, split as needed; dates earlier than floor unsupported for bulk import. Maintain contiguous coverage per stream, never advance across incomplete windows. Prioritize live over historical requests; reserve at most 6/min for backfill from initial 20/min local budget; documented upstream max 50/min configurable. Honor Retry-After globally; one active fetch, no parallel key sharding.
- No source absence-based closing or deletion. Flag stale/inconsistent active records for bounded incident lookup. Source status CLOSED observed in /nossa; stream label is not lifecycle. GAMAS lookup rows use each Incident independently, not requested parent. Track coverage gaps rather than fabricate completeness.

## Pagination algorithm
```text
scan(stream, from, to):  # internal half-open second-aligned window
  validate bounds, convert to source timezone (verify WIB)
  offset = 0
  while offset <= 5000:
    fetch limit=1000, offset, date_from=from, date_to=to-1 second
    validate response and actual applied filters
    validate each row, verify dates inside window, canonical merge
    if page length < 1000: finish provisional coverage; break
    if offset == 5000:
      if window width <= 1 second: record unresolved gap; stop
      split window in halves; rescan both (writes idempotent); stop
    offset += 1000
  reconcile boundary seconds and overlapping windows
  only advance contiguous coverage after all pages and splits succeed
```
The upstream order is Status_Date DESC; ties and concurrent updates can shift offsets. A short page is not proof of snapshot completeness. Detect repeats, out-of-window data, metadata mismatch and boundary density; replay overlap, report uncertain coverage; seek provider secondary sort/snapshot support for strict completeness. Verify inclusive fractional-second behavior; if upper bound cannot include all fractions use overlapping inclusive next boundary and dedupe. Do not silently mark dense same-second windows complete. Checkpoint on restart from window start, not stale offset. Quarantine required-field rejects and mark partial.

## Canonical write
Fetch and validate outside transaction. Deduplicate by normalized incident, sort keys, merge batches 200–500 rows. Lock existing rows, insert with UUIDv7 only for new incident; preserve UUID on update. Compare verified source_updated_at, then relevant status evidence only where comparable. Equal timestamp conflicting facts -> quarantine/reconcile; no fixed closed priority. Missing values must not erase known values. Newer verified reopen clears current closure timestamp while event history persists. CLOSED is provisional terminal; other statuses require business sign-off. Closed date remains NULL until approved timestamp mapping; exclude from close-date KPI. TTR source values remain numeric without unit assumption. Rule version changes explicit maintenance, not replay-induced full writes. Hash normalized merged facts, not raw payload or fetch timestamp. No-op does not change version, history, updated_at or revision. Transaction commits changed tickets + transition events + revision + page progress; publish compact PG NOTIFY transactionally. Crash before commit rollback; replay safe. Durable rejected rows bounded and redacted.

## Tests required
Replay same page twice, out-of-order closed/open, newer reopen, conflicting equal version, missing/explicit null, GAMAS fallback, 1000/6000 overflow, single-second saturation, page drift, inclusive boundaries, 429 Retry-After, 401 stop, 502 retry, crash before/after commit, lost advisory lock, stale SSE reconnect, partial checkpoint, source update without status change. Use fake upstream and synthetic rows; no production data in tests.
