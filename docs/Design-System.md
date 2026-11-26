# Design System — DOMPIS Ticket Workspace

Arah visual: dark operational console, kontras tinggi dan tetap terbaca untuk penggunaan harian. Bahasa Indonesia untuk UI, status asli NOSSA dipertahankan. Svelte components reusable; CSS custom properties, no heavy UI framework wajib. Ikon SVG sederhana, font system atau self-hosted. Hindari gradient, glassmorphism, animasi berlebihan.

## Tokens
| Token | Default | Fungsi |
|---|---|---|
| background | #101220 | canvas utama |
| surface | #181A29 | panel dan input |
| raised | #2A2F45 | kartu dan lapisan terangkat |
| text | #FFFFFF | teks utama |
| muted | #C5CAD3 | teks sekunder dan pemisah |
| primary | #AD0E27 | aksi utama, brand, focus |
| primary-deep | #750A1C | hover dan penekanan/error |

Gunakan tint background ringan dengan teks kontras AA; uji setiap kombinasi dan focus ring 2px. Jangan warna saja: badge selalu label. Spacing 4/8/12/16/24/32; radius 6–10px; shadow minimal. Base text 14px, table 13–14, page title 24, KPI 28, numeric tabular. Desktop sidebar 232px collapsible 64px; header 56px; content 24px; mobile drawer, padding 12px. Table row 40–48px, header sticky, horizontal scroll pada mobile, tidak shrink teks ke ukuran kecil. Interactive touch min 44px.

## Information architecture
Sidebar: Ticket Management (Overview + bucket), Semesta, Rekap Workorder, Detail WO HI; Settings hanya authorized. Header: breadcrumb, last successful sync open/closed WIB, freshness badge (Segar/Tertunda/Gagal/Belum sinkron), profile. Tidak ada menu teknisi. Ticket Management default route setelah login.

```text
┌────────────────┬──────────────────────────────────────────────────┐
│ DOMPIS         │ Ticket Management      Sinkron: 14.02 WIB   User │
│ Overview       ├──────────────────────────────────────────────────┤
│ Customer       │ Open     Close hari ini     Overdue    Anomali    │
│ Proactive      │  ...           ...             ...        ...    │
│ Unspec         ├──────────────────────────────────────────────────┤
│ Non Technical  │ Branch | Workzone | Dept | Bucket | Status      │
│ SQM Update     │ Cari incident / service no       Reset | Export  │
│ Obsolete       ├──────────────────────────────────────────────────┤
│ Semesta        │ Incident | Status | Workzone | Age | SLA | ...   │
│ Rekap WO       │ ...                                              │
│ Detail WO HI   │ 50 baris   Sebelumnya | Berikutnya                │
└────────────────┴──────────────────────────────────────────────────┘
```

## Components & interactions
- `AppShell`, `SidebarNav`, `FreshnessIndicator`, `MetricCard`, `OperationalFilters`, `TicketTable`, `StatusBadge`, `TicketDrawer`, `CursorPager`, `EmptyState`, `ErrorState`, `ExportDialog`, `RekapMatrix`, `TrendChart`. Svelte typed props; no arbitrary HTML from source payload.
- Filter chips reflect active filter; dependent workzone choices from allowed scope; URL query state; debounce search 300ms and cancel stale requests; change filters resets cursor. Exact incident/service number search; no sensitive contact info as default list.
- Ticket table: incident link, status, bucket, dept, workzone, reported, age, booking, TTR deadline, last source update; columns configurable locally but scope unchanged. Click detail drawer with status history, reason/solution, restricted contact fields. Full route deep link, keyboard focus trap and return focus on close. No assign controls.
- Overview: count chips link to same list filter. Rekap matrix: sticky workzone and header; click cell drilldown, same filter semantics; zero distinct from unavailable. Semesta: date-range filter, summary first then charts on demand; chart table alternate accessible. Detail WO HI: operational compact table; separate closed and open views if needed.
- Loading skeleton first load, background refresh keep previous rows with stale label only if same scope/filter; errors actionable retry; no false zero for API failure. Disable export while requested; accessible live region for updates, do not announce every row. Relative age local timer once/minute, server metric asOf fixed. Unknown/missing values show “—” with explanatory tooltip.
- No manual refresh that fans out to NOSSA; refresh reads DB. SSE event invalidates visible query only; fallback polling. Don't load inactive menus. Paginated 50 default, max 100. Lazy charts/export. Keep production JS budget measured (initial target <200 KB gzip excluding optional lazy charts), no unbounded DOM.

## QA visual
Desktop 1440/1280, tablet 768, mobile 390; 200% zoom; keyboard only; screen reader labels; contrast; long incident/summary; null field, 401/403/503, offline, slow network, stale data, scope changed mid-request. Test Svelte escape and CSP, no `{@html}` untrusted. Status selalu memiliki label teks; warna saja tidak menjadi penanda status. Tema terang dapat dipertimbangkan setelah MVP bila kebutuhan pengguna tervalidasi.

## v1.3 historical provenance
Ticket detail may display `Data historis (migrasi)` for unverified legacy record and `Terverifikasi NOSSA` only after accepted source observation. Coverage gaps/unknown timestamp explicitly shown; do not hide old tickets solely because they lack live verification. Historical vs live filter optional if approved; not a default extra query. No raw legacy payload dump in UI; scoped allowlisted details only. Reports distinguish unavailable SLA and unexplained/approved reconciliation deltas during pilot.

## v1.3 organization UI
Cascading filters Area → Region → Branch → Service Area → Workzone; multi-workzone choice permitted inside authorized selection. A user with several disjoint grants sees only authorized paths and their labels, not sibling counts; parent filter is intersection, never expansion. On parent change clear incompatible child and cursor, cancel stale request. URL stores UUID filters (not authority). User admin screen: role separate, grant level selector + searchable scoped target + multi-grant chips, preview effective workzones, overlap warning, explicit global confirmation, audit and revoke. Hierarchy admin: parent selection, active state, preview affected users/tickets before changes; no hard delete. Show current hierarchy basis on historical reports. Unknown geography quality panel restricted to privileged review, not ordinary list counts. Preserve focus, keyboard navigation, contrast and mobile filter drawer. On revocation invalidate local query cache and clear sensitive previous data.
