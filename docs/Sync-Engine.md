# Sync Engine — implementation specification

## Kebijakan v1.3 (berlaku atas seluruh dokumen)
Pemilik mengizinkan agent lokal mengakses MySQL dan PostgreSQL, read dan write. Akses aktual bergantung pada credential, jaringan, privilege dan sandbox agent; jangan mengakali kontrol. Gunakan Database-Access.md sebagai kebijakan otoritatif. Read produksi yang ringan dan write rutin terukur dalam target yang telah didaftarkan tidak memerlukan konfirmasi per query. Operasi produksi berisiko tinggi, perubahan schema produksi, bulk correction, freeze/cutover dan tindakan irreversible memerlukan persetujuan runbook khusus. Source legacy tetap read-only; database bukan source code. Discovery tidak mengubah data bisnis produksi. Semua rancangan teknis termasuk DDL, jumlah tabel/index dan alias adalah kandidat, bukan kontrak tetap. Direct matching Workzone diutamakan; buktikan keunikan global setelah normalisasi, jika ambigu gunakan pembeda yang terverifikasi, jangan menebak. Alias hanya bila terbukti diperlukan. Requirement bisnis, integritas historis, keamanan dan stack tetap wajib. Lihat Discovery-Protocol.md dan Decision-Log.md.


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
Fetch and validate outside transaction. Deduplicate by normalized incident, sort keys, merge batches 200–500 rows. Lock existing rows, insert with UUIDv7 only for new incident; preserve UUID on update. Compare verified source_updated_at, then relevant status evidence only where comparable. Equal timestamp conflicting facts -> quarantine/reconcile; no fixed closed priority. Missing values must not erase known values. Newer verified reopen clears current closure timestamp while event history persists. CLOSED is provisional terminal; other statuses require business sign-off. Closed date remains NULL until approved timestamp mapping; exclude from close-date KPI. TTR source values remain numeric without unit assumption. Rule version changes explicit maintenance, not replay-induced full writes. Hash deterministic accepted upstream facts only, excluding legacy-only fields, raw payload order and fetch timestamp. Compare merged canonical fields separately, including null-safe provenance and rule_version; source_hash alone is not the no-op guard. Define reproducible source-fact presence semantics in the adapter and test legacy merge and replay. No-op does not change version, history, updated_at or revision. Transaction commits changed tickets + transition events + revision + page progress; publish compact PG NOTIFY transactionally. Crash before commit rollback; replay safe. Durable rejected rows bounded and redacted.

## Tests required
Replay same page twice, out-of-order closed/open, newer reopen, conflicting equal version, missing/explicit null, GAMAS fallback, 1000/6000 overflow, single-second saturation, page drift, inclusive boundaries, 429 Retry-After, 401 stop, 502 retry, crash before/after commit, lost advisory lock, stale SSE reconnect, partial checkpoint, source update without status change. Use fake upstream and synthetic rows; no production data in tests.

## v1.3 reconciliation of migrated tickets
- Migration initializes historical tickets with `data_origin=legacy`, `source_endpoint=NULL`, `source_hash=NULL`, `first_source_seen_at=NULL`, and no synthetic upstream version/events. Legacy observed dates are not proof of upstream version. `migrated_at` is never a merge clock. Preserve archive unchanged during live sync.
- First live observation: compare trustworthy comparable status/update evidence (e.g. verified legacy status_at vs incoming status_at for status only); if incoming is demonstrably older, reject/record stale; if incompatible/ambiguous or equal with contradictory values, quarantine and queue controlled lookup. Do not accept merely because current record is legacy. On confirmed authoritative newer or equivalent observation, merge accepted present fields, set first_source_seen_at, source_endpoint and source_hash atomically; identical business facts may still require this one provenance update. No fabricated status event for unchanged status. Later replays are no-op. Keep legacy-only fields preserved separately and available for approved reports; no arbitrary clear on absent key. Explicit null clears only approved field semantics. Version and revision change only for committed state change, including accepted provenance transition as defined.
- Legacy closure evidence and source closure date are distinct; preserve verified historical dates until a confirmed reopen or authoritative correction. Never close from absence. Manual/unknown legacy tickets not matched upstream stay last-known historical/unknown pending explicit policy; UI label provenance and freshness. `legacy_migration` checkpoint independent of open/closed/backfill; migration must not claim upstream coverage. Prioritize open reconciliation + recent closed overlap after import, then backfill gaps from 2026 only. No unnecessary re-fetch of all historical tickets.
- Test migrated open -> closed, migrated closed -> reopen, stale backfill, missing fields, old-only pre-2026, unknown status/scope, identical first source then replay, long incident, collisions, no history fabrication. Migration and worker share lock; default worker off during import. See Migration-Validation.md.

## v1.3 scope mapping and corrections
Validate fixed REG-4/REG-5 contract and match normalized Workzone directly if unique; otherwise use verified source triplet/alias during normalization. Bulk resolve once per batch; no auto-create master hierarchy or grants. Unknown or conflicting geography flagged, retained for privileged review and not visible to normal scope; do not fabricate source values. Source change may move canonical ticket to a different approved workzone only under freshness/conflict policy. Master/alias correction is explicit audited bounded maintenance, not ordinary ingestion; review affected tickets, recompute derived scope with no fabricated source timestamp, bump canonical version/revision when changed, coordinate writer lock. Scope revision invalidates authorized lists independently of data revision. No broadening of upstream scope from new area hierarchy.
