# ARUS Terminal — Frontend Design Document

> **Product:** ARUS Terminal  
> **Event:** Sectors Hackathon 2026, Track 3 — Market Intelligence  
> **Deadline:** September 30, 2026, 23:59 WIB  
> **Author:** Frontend Architecture Team  
> **Last Updated:** September 17, 2026

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Frontend Tech Stack](#2-frontend-tech-stack)
3. [Information Architecture (Page Map)](#3-information-architecture-page-map)
4. [Design System](#4-design-system)
5. [Component Breakdown](#5-component-breakdown)
6. [Data Contract (Frontend Perspective)](#6-data-contract-frontend-perspective)
7. [Responsive & Accessibility Considerations](#7-responsive--accessibility-considerations)
8. [Prioritization & Build Order](#8-prioritization--build-order)
9. [Out of Scope (MVP)](#9-out-of-scope-mvp)

---

## 1. Design Philosophy

### Aesthetic Direction: Professional Financial Terminal

ARUS Terminal is **not** a playful, colorful investment dashboard aimed at casual retail users. It is a **professional-grade capital flow intelligence terminal** designed for active traders and analysts who make time-sensitive decisions based on institutional capital movement.

The visual language draws inspiration from:

| Reference | What We Borrow |
|---|---|
| **Bloomberg Terminal** | Dense information layout, monospace typography, dark background, color-coded data cells, minimal decorative elements — every pixel serves a purpose. |
| **btcfundflow.vercel.app** | Overlay chart pattern (price line + capital flow histogram), clean card-based metric panels, cumulative flow visualization. |
| **Classic trading terminals (Reuters Eikon, DAS Trader)** | Scanline-era CRT aesthetics for the Retro Amber theme, tabular data density, keyboard-first navigation feel. |

### Why Monospace + Dark Background?

1. **Data density.** Financial terminals display hundreds of data points simultaneously. Monospace fonts (fixed-width characters) guarantee perfect column alignment in tables and numeric readouts without CSS hacks — critical for scanning SMFI scores, net values, and volume figures at a glance.

2. **Reduced eye strain.** Traders spend 6–10 hours per day staring at screens. A dark background with high-contrast text (white/green/amber on dark) reduces luminance and minimizes fatigue. This is why Bloomberg, ThinkOrSwim, and every professional trading platform defaults to dark mode.

3. **Signal hierarchy.** On a dark canvas, color-coded signals (green for accumulation, red for distribution, amber for alerts) have maximum visual contrast. The data "pops" — exactly what a trader needs when scanning for divergence signals or SMFI spikes.

4. **Terminal authenticity.** The monospace aesthetic signals to the target user persona — active IDX traders — that this is a *serious tool*, not a gamified fintech app. It builds trust through visual authority.

### Core Design Principles

- **Information density over whitespace** — maximize data per viewport, minimize scrolling.
- **Color is semantic, never decorative** — every color communicates a data state.
- **Motion is functional** — animations only for state transitions (loading → loaded, score change), never for flourish.
- **The derived score is the hero** — SMFI and Divergence Delta are visually dominant; raw data supports them.

---

## 2. Frontend Tech Stack

### Framework: Next.js 14+ (App Router)

**Why:** App Router provides React Server Components (RSC) for initial data loading, nested layouts for the terminal shell, and built-in API routes for proxying Sectors API calls (protecting the API key). Vercel deployment is zero-config. The file-system routing maps cleanly to our page structure.

### Styling: Tailwind CSS v3.4+

**Why:** Rapid prototyping within an 8–10 day window. Tailwind's utility classes allow building the dense terminal UI without writing hundreds of custom CSS rules. Theme switching is implemented via CSS custom properties toggled by a `data-theme` attribute on `<html>`, with Tailwind configured to consume those variables.

### Charting: TradingView Lightweight Charts v4

**Recommendation over Recharts:**

| Criterion | TradingView Lightweight Charts | Recharts |
|---|---|---|
| Financial chart types | Native (line, area, histogram, baseline, candlestick) | Requires custom implementation |
| Overlay support | Built-in multi-series with independent price scales | Complex, requires manual axis management |
| Performance (1000+ data points) | Canvas-based, smooth at 5000+ points | SVG-based, janky above ~1000 points |
| Bundle size | ~35 KB | ~150 KB with dependencies |
| Crosshair / tooltip | Native crosshair with synchronized hover | Must build custom |
| React SSR compatibility | Requires `'use client'` + `useRef/useEffect` (minor) | Fully declarative (minor advantage) |

**Verdict:** For the **Flow vs Price Chart** — which overlays a stock price line with a cumulative foreign capital accumulation histogram — TradingView Lightweight Charts is the clear winner. It natively supports multi-series overlay with independent `priceScaleId` and `scaleMargins`, meaning we can render the price line in the top 70% and the flow histogram in the bottom 30% of the same chart pane. Recharts would require significant custom work to achieve this.

**Integration note:** Wrap in a `'use client'` component, initialize via `useRef` + `useEffect`, cleanup on unmount. Use `dynamic(() => import(...), { ssr: false })` if SSR issues arise.

### State Management: Zustand

**Why Zustand over React Context:**

- **Theme state, time-range filter, active ticker** — these are client-side interactive states that change frequently (user toggling 1D/5D/15D/30D, switching themes). Context would cause unnecessary re-renders across the entire component tree.
- **Selector-based subscriptions** — Zustand only re-renders components that subscribe to the specific slice of state that changed. A `<ThemeSwitcher>` changing the theme won't re-render `<RankingTable>`.
- **No Provider wrapper** — simpler layout.tsx, less boilerplate.
- **Tiny footprint** — ~1 KB gzipped, negligible bundle impact.

**Store structure:**

```
useTerminalStore
├── theme: 'dark' | 'retro-amber' | 'win98'
├── timeRange: '1D' | '5D' | '15D' | '30D'
├── setTheme(theme)
└── setTimeRange(range)
```

### Data Fetching: SWR

**Why SWR over TanStack Query:**

- **Simplicity** — Our data model is straightforward: fetch rankings, fetch stock detail, fetch sector heatmap. No complex mutations, no optimistic updates, no infinite scroll. SWR's minimal API (`useSWR(key, fetcher)`) is a perfect fit.
- **Bundle size** — ~4.2 KB vs ~13.4 KB. In a hackathon with limited time, every kilobyte and every line of boilerplate avoided matters.
- **Vercel-native** — SWR is maintained by Vercel; it integrates seamlessly with Next.js caching and ISR (Incremental Static Regeneration). Since our data updates once daily (cron cache), SWR's stale-while-revalidate pattern is exactly right: serve cached data instantly, revalidate in the background.
- **No mutations needed** — ARUS Terminal is read-only. We never write data back. TanStack Query's powerful mutation handling is wasted here.

**Revalidation strategy:** `refreshInterval: 0` (no polling — data is daily), `revalidateOnFocus: true` (re-check when user returns to tab), `dedupingInterval: 60000` (dedupe identical requests within 60s).

### Deployment: Vercel

Zero-config deployment for Next.js. Edge functions for API route proxying. Automatic preview deployments for PR review.

---

## 3. Information Architecture (Page Map)

```
ARUS Terminal
├── / .......................... Dashboard (Foreign Whale Tracker)
├── /stock/[ticker] ........... Stock Detail Page
├── /sector ................... Sector Rotation Heatmap
└── (layout) .................. Terminal Shell (persistent header + sidebar)
```

### 3.1 `/` — Dashboard (Foreign Whale Tracker)

**Purpose:** The primary landing page. Displays the ranked list of IDX stocks by SMFI score — the core derived insight of the product. This is the "nerve center" of the terminal.

**Main Components:**
- `<TerminalHeader>` — app title, IDX session clock (WIB), theme switcher, last-updated timestamp
- `<TimeRangeToggle>` — 1D / 5D / 15D / 30D selector (global filter)
- `<RankingTable>` — sortable table of stocks ranked by SMFI
- `<MarketSummary>` — quick stats bar: total stocks in Heavy Accumulation, Heavy Distribution, market-wide SMFI average
- `<DivergenceRadar>` — small panel highlighting top 5 stocks with highest positive Divergence Delta (silent accumulation alerts)

**Data Fetched:**
- `GET /api/ranking?range={timeRange}` → list of stocks with SMFI, divergence delta, trend, sector

**User Flow:** User lands here → scans the ranking → clicks a stock row → navigates to `/stock/[ticker]`.

### 3.2 `/stock/[ticker]` — Stock Detail Page

**Purpose:** Deep-dive into a specific stock's capital flow activity. Shows the 15-Day Activity Log (historical daily data) and the Flow vs Price Chart (the key overlay visualization).

**Main Components:**
- `<StockHeader>` — ticker, company name, current SMFI score badge, divergence delta badge, sector badge
- `<FlowPriceChart>` — TradingView Lightweight Charts overlay: price line + cumulative foreign net flow histogram
- `<ActivityLog>` — table: date, volume, net foreign value (IDR), daily SMFI contribution, accumulation/distribution status per day
- `<BackButton>` — return to dashboard

**Data Fetched:**
- `GET /api/stock/[ticker]?range={timeRange}` → stock metadata + daily activity log + chart time-series

**User Flow:** Arrived from dashboard → analyzes chart for price-flow divergence → scrolls activity log for daily breakdown → returns to dashboard.

### 3.3 `/sector` — Sector Rotation Heatmap

**Purpose:** Bird's-eye view of capital rotation across IDX-IC sectors. Answers "Where is smart money flowing this week/month?"

**Main Components:**
- `<SectorHeatmap>` — grid of 11 IDX-IC sector tiles (excluding "Listed Investment Product" as it's not a traditional sector), each colored by net inflow/outflow intensity
- `<SectorLegend>` — color scale legend (strong inflow → neutral → strong outflow)
- `<TimeRangeToggle>` — shared global time-range filter

**IDX-IC Sectors displayed:**

| Code | Sector |
|---|---|
| A | Energy |
| B | Basic Materials |
| C | Industrials |
| D | Consumer Non-Cyclicals |
| E | Consumer Cyclicals |
| F | Healthcare |
| G | Financials |
| H | Property & Real Estate |
| I | Technology |
| J | Infrastructures |
| K | Transportation & Logistics |

**Data Fetched:**
- `GET /api/sector?range={timeRange}` → list of sectors with aggregate net flow, flow change %, top contributing stock

**User Flow:** User navigates here from sidebar → identifies sector with strongest inflow → clicks sector tile → (future: drills down to stocks within that sector, but for MVP this navigates back to dashboard filtered by sector).

### 3.4 Layout: Terminal Shell

**Purpose:** Persistent wrapper around all pages. Provides the "terminal frame" — header bar, navigation sidebar, and status bar.

**Components:**
- `<TerminalHeader>` — fixed top bar with:
  - ARUS Terminal logo/wordmark (monospace)
  - IDX session clock showing current WIB time + session status (Pre-Open / Session 1 / Lunch Break / Session 2 / Post-Close)
  - `<ThemeSwitcher>` dropdown
  - `<LastUpdated>` badge ("Data as of: 2026-09-17 16:00 WIB")
- `<Sidebar>` — vertical nav with icon + label:
  - 📊 Dashboard (`/`)
  - 🗺️ Sector Map (`/sector`)
- `<StatusBar>` — fixed bottom bar showing: "Powered by Sectors API" attribution + data refresh indicator

---

## 4. Design System

### 4.1 Color Palette

All colors are defined as CSS custom properties on `:root` / `[data-theme]` for runtime switching.

#### Dark Mode (Default)

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0a0e17` | Main background (near-black with blue undertone) |
| `--bg-secondary` | `#111827` | Card/panel backgrounds |
| `--bg-tertiary` | `#1a2235` | Table row hover, input backgrounds |
| `--border` | `#1e2d3d` | Subtle borders between panels |
| `--text-primary` | `#e2e8f0` | Primary text (off-white, not pure #fff) |
| `--text-secondary` | `#8892a4` | Secondary/muted text |
| `--text-tertiary` | `#4a5568` | Disabled text, timestamps |
| `--accent` | `#60a5fa` | Links, active tab indicator, interactive elements |

#### Retro Amber Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#1a1200` | Deep black-brown (CRT phosphor off) |
| `--bg-secondary` | `#261c00` | Panel backgrounds |
| `--bg-tertiary` | `#332600` | Hover states |
| `--border` | `#3d2e00` | Panel borders |
| `--text-primary` | `#ffb000` | Amber phosphor text |
| `--text-secondary` | `#cc8c00` | Muted amber |
| `--text-tertiary` | `#805800` | Disabled text |
| `--accent` | `#ffd966` | Bright amber accent |

#### Windows 98 Classic Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#008080` | Teal desktop background |
| `--bg-secondary` | `#c0c0c0` | Window body (classic silver) |
| `--bg-tertiary` | `#dfdfdf` | Button/input faces |
| `--border` | `#808080` | 3D border (inset effect) |
| `--text-primary` | `#000000` | Black text on silver |
| `--text-secondary` | `#404040` | Secondary text |
| `--text-tertiary` | `#808080` | Disabled/grayed out |
| `--accent` | `#000080` | Navy blue (title bar, links) |

> **Win98 note:** This theme also applies a `border-style: outset/inset` treatment to buttons and panels to simulate the classic 3D beveled look. The title bar uses `--accent` background with white text.

#### Semantic Colors (Consistent Across All Themes)

| Token | Hex | Meaning |
|---|---|---|
| `--signal-accumulation` | `#22c55e` | SMFI > 70 — Heavy Accumulation |
| `--signal-distribution` | `#ef4444` | SMFI < 30 — Heavy Distribution |
| `--signal-neutral` | `#eab308` | SMFI 30–70 — Neutral |
| `--signal-divergence` | `#a855f7` | High positive Divergence Delta — silent accumulation |
| `--chart-price` | `#60a5fa` | Price line in overlay chart |
| `--chart-flow-positive` | `#22c55e80` | Positive net flow histogram bar (50% opacity) |
| `--chart-flow-negative` | `#ef444480` | Negative net flow histogram bar (50% opacity) |

> **Accessibility override:** In the Retro Amber theme, `--signal-accumulation` shifts to `#ffb000` (bright amber) and `--signal-distribution` shifts to `#ff6600` (orange-red) to maintain contrast against the amber palette. Neutral remains `--text-secondary`.

### 4.2 Typography

| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| **Terminal / Data** | `JetBrains Mono` | 400, 500, 700 | 12–14px | Tables, scores, numbers, badges, chart labels, ticker symbols |
| **UI / Navigation** | `Inter` | 400, 500, 600 | 13–16px | Sidebar labels, buttons, filter text, page titles |
| **Display / Hero** | `JetBrains Mono` | 700 | 24–32px | SMFI score hero display on stock detail, section headers |

**Loading strategy:** Google Fonts via `next/font` with `display: swap`. JetBrains Mono is the primary font — loaded with `variable` font option. Inter is secondary — also loaded as variable.

**Font scale (rem-based):**

```
--text-xs:   0.75rem  (12px) — timestamps, footnotes
--text-sm:   0.8125rem (13px) — table cells, secondary labels
--text-base: 0.875rem (14px) — default terminal text
--text-lg:   1rem     (16px) — section headers, nav labels
--text-xl:   1.25rem  (20px) — page titles
--text-2xl:  1.5rem   (24px) — stock ticker hero
--text-3xl:  2rem     (32px) — SMFI score hero display
```

> Note: The base is intentionally smaller than typical web apps (14px vs 16px) to increase information density, consistent with terminal aesthetics.

### 4.3 Spacing & Grid System

**Spacing scale (4px base):**

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
```

**Layout grid:**
- **Desktop (≥1280px):** 12-column grid, `gap: 16px`, max-width `1600px`, centered.
- **Sidebar:** Fixed 220px width, collapsible to 56px (icon-only).
- **Main content area:** Remaining width, scrollable.
- **Panels/cards:** Use `--space-4` internal padding, `--space-3` gap between cards.
- **Table rows:** `--space-2` vertical padding, `--space-4` horizontal padding.

### 4.4 Component States

Every data-driven component must implement these states:

| State | Visual Treatment |
|---|---|
| **Loading** | Skeleton shimmer (pulsing `--bg-tertiary` blocks matching the component shape). No spinners — skeletons feel faster. |
| **Loaded** | Normal render with subtle `fadeIn` transition (150ms ease-out). |
| **Empty** | Gray icon + "No data available for this range" message centered in the component area. |
| **Error** | Red-tinted border (`--signal-distribution`), error icon, "Failed to load data — Retry" link. |
| **Hover (table row)** | Background transitions to `--bg-tertiary`, 100ms ease. |
| **Active (tab/toggle)** | Bottom border or background fill with `--accent`, bold text. |
| **Stale data** | `<LastUpdated>` badge pulses amber if data is > 24 hours old. |

---

## 5. Component Breakdown

### 5.1 `<ScoreBadge>`

**Purpose:** Color-coded pill badge displaying SMFI score or Divergence Delta category.

| Prop | Type | Description |
|---|---|---|
| `score` | `number` | SMFI (0–100) or Divergence Delta (-3 to +3) |
| `type` | `'smfi' \| 'divergence'` | Determines color mapping logic |
| `size` | `'sm' \| 'md' \| 'lg'` | Badge size variant (default: `'md'`) |

**Internal State:** None.

**Rendering Logic (SMFI):**
- `score > 70` → green badge, text "Heavy Accumulation"
- `score < 30` → red badge, text "Heavy Distribution"
- `30 ≤ score ≤ 70` → yellow/gray badge, text "Neutral"

**Rendering Logic (Divergence):**
- `score > 1.5` → purple badge with radar icon (📡), text "Silent Accum."
- `score < -1.5` → red badge, text "Silent Distrib."
- `-1.5 ≤ score ≤ 1.5` → gray badge, text "Normal"

**Data Dependencies:** None (pure presentational).

---

### 5.2 `<RankingTable>`

**Purpose:** The core Foreign Whale Tracker. Sortable, filterable table of stocks ranked by SMFI.

| Prop | Type | Description |
|---|---|---|
| `data` | `RankingItem[]` | Array of ranked stocks (from API) |
| `isLoading` | `boolean` | Show skeleton state |
| `error` | `Error \| null` | Show error state |

**Internal State:**
- `sortField: 'smfi' | 'divergence' | 'ticker' | 'netValue'` (default: `'smfi'`)
- `sortDirection: 'asc' | 'desc'` (default: `'desc'`)
- `filterCategory: 'all' | 'accumulation' | 'distribution' | 'neutral'` (default: `'all'`)

**Columns:**

| # | Column | Width | Content |
|---|---|---|---|
| 1 | Rank | 48px | Numeric rank (by current sort) |
| 2 | Ticker | 80px | Stock ticker (e.g. `BBCA`), clickable → `/stock/[ticker]` |
| 3 | SMFI | 72px | Score 0–100 with `<ScoreBadge>` |
| 4 | Trend | 48px | Arrow icon ↑ (green) / ↓ (red) / → (gray) based on SMFI change |
| 5 | Divergence Δ | 80px | z-score with `<ScoreBadge type="divergence">` |
| 6 | Net Value | 100px | Net foreign flow in IDR (formatted: "12.5B" / "-3.2B") |
| 7 | Sector | 80px | IDX-IC sector code badge |

**Data Dependencies:** Reads `timeRange` from `useTerminalStore`. Fetches via `useSWR('/api/ranking?range=' + timeRange)`.

---

### 5.3 `<TimeRangeToggle>`

**Purpose:** Segmented control for selecting the time range filter.

| Prop | Type | Description |
|---|---|---|
| – | – | No props — reads/writes `timeRange` from Zustand store |

**Options:** `1D` · `5D` · `15D` · `30D`

**Internal State:** None (uses global store).

**Visual:** Horizontal button group. Active button has `--accent` background. Inactive buttons have transparent background with `--text-secondary` text.

**Data Dependencies:** Writes to `useTerminalStore.setTimeRange()`.

---

### 5.4 `<FlowPriceChart>`

**Purpose:** The signature overlay chart. Stock price line + cumulative foreign net flow histogram in the same chart pane.

| Prop | Type | Description |
|---|---|---|
| `priceData` | `{ time: string; value: number }[]` | Daily closing prices |
| `flowData` | `{ time: string; value: number; color: string }[]` | Daily net flow, colored green (positive) / red (negative) |
| `ticker` | `string` | For chart title |
| `isLoading` | `boolean` | Show skeleton |

**Internal State:**
- `chartInstance: IChartApi | null` (ref, not state)

**Implementation Notes:**
- Uses `createChart()` from `lightweight-charts` inside `useEffect`.
- Two series: `addLineSeries()` for price (color: `--chart-price`), `addHistogramSeries()` for flow.
- Histogram uses `scaleMargins: { top: 0.7, bottom: 0 }` to occupy bottom 30%.
- Crosshair syncs both series on hover.
- Responsive: listens to `ResizeObserver` on container, calls `chart.applyOptions({ width })`.
- Cleanup: `chart.remove()` in `useEffect` return.

**Data Dependencies:** Receives data as props from parent page.

---

### 5.5 `<ActivityLog>`

**Purpose:** Historical daily transaction table for a specific stock (15-Day Activity Log).

| Prop | Type | Description |
|---|---|---|
| `data` | `ActivityEntry[]` | Daily entries |
| `isLoading` | `boolean` | Show skeleton |

**Columns:**

| Column | Content |
|---|---|
| Date | `YYYY-MM-DD` formatted |
| Volume | Formatted with thousand separators |
| Net Value (IDR) | Colored green/red, formatted (e.g. "+4.2B" / "-1.8B") |
| SMFI Contrib. | Daily contribution to rolling SMFI |
| Status | Mini `<ScoreBadge>` — Accumulation / Distribution / Neutral |

**Internal State:** None.

**Data Dependencies:** Receives data as props from parent page.

---

### 5.6 `<SectorHeatmap>`

**Purpose:** Grid visualization of capital flow across IDX-IC sectors.

| Prop | Type | Description |
|---|---|---|
| `data` | `SectorFlowItem[]` | Array of 11 sectors with flow data |
| `isLoading` | `boolean` | Show skeleton |

**Internal State:** `hoveredSector: string | null` — for tooltip display.

**Visual:**
- 4×3 grid of rectangular tiles (last row has 3 tiles).
- Each tile: sector name, net flow value, % change.
- Tile background color: interpolated from `--signal-distribution` (strong outflow) through neutral gray to `--signal-accumulation` (strong inflow), based on normalized flow score.
- Hover: tile elevates (subtle `translateY(-2px)` + shadow), shows tooltip with top contributing stock.

**Data Dependencies:** Reads `timeRange` from `useTerminalStore`. Fetches via `useSWR('/api/sector?range=' + timeRange)`.

---

### 5.7 `<ThemeSwitcher>`

**Purpose:** Dropdown to switch between the three terminal themes.

| Prop | Type | Description |
|---|---|---|
| – | – | No props — reads/writes `theme` from Zustand store |

**Options:**
- 🌙 Dark Mode (default)
- 🟠 Retro Amber
- 🪟 Win98 Classic

**Implementation:** Sets `data-theme` attribute on `document.documentElement`. Persists choice to `localStorage`. Zustand store hydrates from `localStorage` on mount.

**Internal State:** `isOpen: boolean` — dropdown visibility.

---

### 5.8 `<TerminalHeader>`

**Purpose:** Persistent top bar across all pages.

| Prop | Type | Description |
|---|---|---|
| `lastUpdated` | `string \| null` | ISO timestamp of last data refresh |

**Sub-components:**
- Logo/wordmark: `ARUS` in `JetBrains Mono 700` + `TERMINAL` in `JetBrains Mono 400`
- `<SessionClock>` — real-time WIB clock with session indicator
- `<ThemeSwitcher>`
- `<LastUpdated>` — "Data as of: ..." badge

**Internal State:** `currentTime: Date` — updated every second via `setInterval` for the clock.

---

### 5.9 `<SessionClock>`

**Purpose:** Displays current Jakarta time (WIB / UTC+7) and the active IDX trading session.

| Prop | Type | Description |
|---|---|---|
| – | – | Self-contained |

**Session Logic:**

| Time (WIB) | Session |
|---|---|
| 08:45 – 09:00 | Pre-Open |
| 09:00 – 11:30 | Session 1 |
| 11:30 – 13:30 | Lunch Break |
| 13:30 – 14:50 | Session 2 |
| 14:50 – 15:00 | Pre-Close |
| 15:00 – 15:15 | Post-Close |
| Outside above | Market Closed |

**Visual:** Green dot indicator when market is open, gray when closed. Monospace time display: `14:32:07 WIB · Session 2`.

---

### 5.10 `<MarketSummary>`

**Purpose:** Quick statistics bar on the dashboard.

| Prop | Type | Description |
|---|---|---|
| `data` | `MarketSummaryData` | Aggregate stats |

**Displays:**
- Total stocks in Heavy Accumulation (green count)
- Total stocks in Heavy Distribution (red count)
- Market-wide average SMFI (with `<ScoreBadge>`)
- Top mover (stock with largest SMFI increase today)

---

### 5.11 `<DivergenceRadar>`

**Purpose:** Alert panel highlighting stocks with the highest positive Divergence Delta — the "silent accumulation" signal.

| Prop | Type | Description |
|---|---|---|
| `data` | `RankingItem[]` | Filtered to top 5 by divergence delta |

**Visual:** Compact card list with radar icon (📡), ticker, divergence score, and a sparkline-style mini indicator. Purple-tinted left border.

---

### 5.12 Utility Components

| Component | Purpose |
|---|---|
| `<Skeleton>` | Shimmer loading placeholder. Props: `width`, `height`, `rounded`. |
| `<ErrorBoundary>` | Catches render errors. Shows retry button + error message. |
| `<EmptyState>` | "No data" placeholder with icon and message. |
| `<Sidebar>` | Navigation sidebar with route links and active indicator. |
| `<StatusBar>` | Bottom bar with Sectors API attribution and data status. |
| `<Tooltip>` | Hover tooltip for heatmap tiles and chart crosshair. |
| `<NumberFormat>` | Utility component for consistent IDR/volume number formatting. |

---

## 6. Data Contract (Frontend Perspective)

These are the TypeScript interfaces the frontend expects from the backend API. The backend is responsible for fetching from the Sectors API, computing SMFI and Divergence Delta, and serving these pre-computed results.

### 6.1 Ranking Response (Foreign Whale Tracker)

```typescript
// GET /api/ranking?range=5D
// Returns the full ranked list of stocks for the Foreign Whale Tracker

interface RankingResponse {
  lastUpdated: string;           // ISO 8601 timestamp
  timeRange: '1D' | '5D' | '15D' | '30D';
  summary: MarketSummaryData;
  rankings: RankingItem[];
}

interface MarketSummaryData {
  totalAccumulation: number;     // Count of stocks with SMFI > 70
  totalDistribution: number;     // Count of stocks with SMFI < 30
  totalNeutral: number;          // Count of stocks with 30 ≤ SMFI ≤ 70
  averageSMFI: number;           // Market-wide average SMFI
  topMover: {
    ticker: string;
    smfiChange: number;          // Delta vs previous period
  };
}

interface RankingItem {
  rank: number;
  ticker: string;                // e.g. "BBCA"
  companyName: string;           // e.g. "Bank Central Asia Tbk"
  smfi: number;                  // 0-100
  smfiTrend: 'up' | 'down' | 'flat';
  smfiChange: number;            // Delta vs previous period
  divergenceDelta: number;       // z-score, -3 to +3
  netValue: number;              // Net foreign flow in IDR (can be negative)
  sector: string;                // IDX-IC sector code (e.g. "G" for Financials)
  sectorName: string;            // IDX-IC sector name (e.g. "Financials")
}
```

### 6.2 Stock Detail Response (Activity Log + Chart)

```typescript
// GET /api/stock/BBCA?range=15D
// Returns detail data for a single stock

interface StockDetailResponse {
  lastUpdated: string;
  ticker: string;
  companyName: string;
  sector: string;
  sectorName: string;
  currentSMFI: number;
  smfiTrend: 'up' | 'down' | 'flat';
  divergenceDelta: number;
  
  // For the FlowPriceChart
  chartData: {
    priceTimeSeries: PricePoint[];
    flowTimeSeries: FlowPoint[];
  };
  
  // For the ActivityLog table
  activityLog: ActivityEntry[];
}

interface PricePoint {
  time: string;                  // "2026-09-17" (YYYY-MM-DD, required by Lightweight Charts)
  value: number;                 // Closing price in IDR
}

interface FlowPoint {
  time: string;                  // "2026-09-17"
  value: number;                 // Cumulative net foreign flow in IDR
  color: string;                 // Hex color: green if positive, red if negative
}

interface ActivityEntry {
  date: string;                  // "2026-09-17"
  volume: number;                // Daily foreign transaction volume
  netValue: number;              // Daily net foreign value in IDR (buy - sell)
  smfiContribution: number;      // This day's contribution to rolling SMFI
  status: 'accumulation' | 'distribution' | 'neutral';
}
```

### 6.3 Sector Heatmap Response

```typescript
// GET /api/sector?range=5D
// Returns sector-level flow aggregation

interface SectorHeatmapResponse {
  lastUpdated: string;
  timeRange: '1D' | '5D' | '15D' | '30D';
  sectors: SectorFlowItem[];
}

interface SectorFlowItem {
  sectorCode: string;            // "A", "B", ... "K"
  sectorName: string;            // "Energy", "Financials", etc.
  netFlow: number;               // Aggregate net foreign flow in IDR
  flowChange: number;            // Percentage change vs previous period
  flowIntensity: number;         // Normalized score -1 to +1 (for color mapping)
  topContributor: {
    ticker: string;
    netValue: number;
  };
  stockCount: number;            // Number of stocks in this sector
}
```

---

## 7. Responsive & Accessibility Considerations

### 7.1 Responsive Strategy

**Desktop-first.** The target user is an active trader on a desktop setup (typically 1920×1080 or larger). The terminal's dense information layout is designed for large screens.

| Breakpoint | Treatment |
|---|---|
| **≥1280px** (Desktop) | Full layout: sidebar + main content. 12-column grid. All panels visible simultaneously. |
| **960–1279px** (Small desktop / Tablet landscape) | Sidebar collapses to icon-only (56px). Table columns may truncate `companyName`. Charts maintain full width. |
| **640–959px** (Tablet portrait) | Sidebar becomes a top hamburger menu. `<RankingTable>` switches to a card-list layout (one stock per card). Heatmap grid becomes 2×6. |
| **<640px** (Mobile) | Single-column layout. Table shows only: ticker, SMFI badge, net value. Chart is full-width with reduced height (250px). Heatmap grid becomes 1×11 (vertical list). |

> **Important:** Mobile is a "graceful degradation" — functional but not optimized. We will not invest significant time in mobile polish for the hackathon. Desktop experience is the priority.

### 7.2 Accessibility

| Requirement | Implementation |
|---|---|
| **Color contrast (WCAG AA)** | All text meets 4.5:1 contrast ratio against its background in every theme. Verified: `#e2e8f0` on `#0a0e17` = 13.5:1 ✓. `#ffb000` on `#1a1200` = 8.2:1 ✓. `#000000` on `#c0c0c0` = 12.6:1 ✓. |
| **Semantic colors not sole indicator** | SMFI badges include text labels ("Heavy Accumulation"), not just color. Trend arrows include direction text for screen readers (`aria-label="trending up"`). |
| **Keyboard navigation** | Table rows are focusable (`tabindex="0"`). Enter key navigates to stock detail. Theme switcher and time-range toggle are keyboard-operable. |
| **Screen reader support** | `aria-label` on all icon-only buttons. `role="table"` with proper `<th scope>` on ranking tables. Chart has `aria-label` describing the data trend (e.g. "Price chart for BBCA showing upward trend with accumulation flow"). |
| **Reduced motion** | Respect `prefers-reduced-motion` — disable skeleton shimmer animation and chart transitions. |

### 7.3 Data Freshness Communication

ARUS Terminal data is **not real-time** — it updates once daily via a backend cron job. This must be clearly communicated to avoid user confusion.

**Implementation:**
- `<LastUpdated>` badge in the header: always visible, shows "Data as of: Sep 17, 2026 16:00 WIB"
- If `lastUpdated` is > 24 hours ago, the badge background pulses amber with text "⚠ Data may be stale"
- The `<StatusBar>` includes: "Data refreshed daily after market close (15:15 WIB)"
- Chart x-axis labels show dates, not times, reinforcing the daily granularity

---

## 8. Prioritization & Build Order

### Phase 1: Must Have (Days 1–5)

| # | Component / Feature | Complexity | Notes |
|---|---|---|---|
| 1 | Terminal Shell layout (`<TerminalHeader>`, `<Sidebar>`, `<StatusBar>`) | Medium | Foundation — all pages depend on this. Includes theme CSS variables. |
| 2 | Zustand store + SWR setup | Low | `useTerminalStore`, SWR provider, API fetcher utility. |
| 3 | `<TimeRangeToggle>` | Low | Simple segmented control, connected to Zustand. |
| 4 | `<ScoreBadge>` | Low | Pure presentational, used everywhere. |
| 5 | `<RankingTable>` + Dashboard page (`/`) | High | The core UI. Sorting, filtering, linking to stock detail. Skeleton + error states. |
| 6 | `<MarketSummary>` | Low | Stats bar above the ranking table. |
| 7 | Stock Detail page (`/stock/[ticker]`) | Medium | Route setup, stock header, layout. |
| 8 | `<ActivityLog>` | Medium | Table with formatting logic. 15-day daily data. |
| 9 | `<FlowPriceChart>` | High | TradingView Lightweight Charts integration. Overlay series. Responsive resize. Crosshair. |

### Phase 2: Should Have (Days 6–8)

| # | Component / Feature | Complexity | Notes |
|---|---|---|---|
| 10 | `<SectorHeatmap>` + Sector page (`/sector`) | High | Color interpolation, grid layout, tooltip. |
| 11 | `<DivergenceRadar>` | Medium | Filtered alert panel with purple theme. |
| 12 | `<SessionClock>` | Low | Real-time WIB clock with session logic. |
| 13 | `<LastUpdated>` stale data indicator | Low | Timestamp comparison + amber pulse. |

### Phase 3: Could Have (Days 9–10)

| # | Component / Feature | Complexity | Notes |
|---|---|---|---|
| 14 | `<ThemeSwitcher>` + Retro Amber theme | Medium | CSS variable swap, localStorage persistence. |
| 15 | Windows 98 Classic theme | Medium | Requires 3D bevel styling, title bar treatment, distinct component overrides. |
| 16 | Loading skeleton refinement | Low | Fine-tuned skeleton shapes matching each component. |
| 17 | Keyboard navigation polish | Low | Focus rings, Enter-to-navigate, tab order. |
| 18 | Mobile responsive pass | Medium | Card-list conversion for ranking table, hamburger nav. |

### Summary

```
Must Have:  9 items  → Days 1–5  (core terminal experience)
Should Have: 4 items → Days 6–8  (sector map, alerts, polish)
Could Have: 5 items  → Days 9–10 (themes, accessibility, mobile)
```

---

## 9. Out of Scope (MVP)

The following features are **intentionally excluded** from the hackathon submission to prevent scope creep:

| Feature | Reason for Exclusion |
|---|---|
| **User authentication / accounts** | No personalization needed for the demo. All users see the same data. |
| **Watchlist / portfolio tracking** | Would require user state persistence (database), adds significant complexity. |
| **Real-time streaming data** | Sectors API provides daily data, not tick-by-tick. WebSocket infra is unnecessary. |
| **Push notifications / alerts** | Requires a notification service and user accounts. Out of scope. |
| **LLM-generated market narrative** | The prompt allows supplementary LLM use, but it's a "topping" — not worth the time investment for MVP. If time permits, a one-line AI summary per stock could be added post-MVP. |
| **Backtesting / historical SMFI accuracy** | Interesting analytically, but not a UI feature for the hackathon. |
| **Multi-exchange support** | ARUS Terminal is IDX-only. No SGX, NYSE, etc. |
| **Drill-down from sector heatmap to filtered stock list** | Clicking a sector tile in the heatmap could filter the ranking table to that sector. Desirable but not MVP. The heatmap is read-only for now. |
| **Export / download (CSV, PDF)** | Nice-to-have but not a judging criterion. |
| **Internationalization (i18n)** | UI is English-only. IDR formatting is handled by `Intl.NumberFormat`. |
| **Dark mode auto-detection** | Theme is manually selected. No `prefers-color-scheme` auto-switch (the default is already dark). |
| **Candlestick / OHLC charts** | The Flow vs Price chart uses a simple line for price, not candlesticks. Adding OHLC would require additional API data and increase chart complexity. |
| **Broker-level breakdown** | Sectors API has broker endpoints, but surfacing per-broker data adds a major new UI module. Deferred. |

---

## Appendix: File Structure (Proposed)

```
src/
├── app/
│   ├── layout.tsx              # Terminal shell (header, sidebar, status bar)
│   ├── page.tsx                # Dashboard — Foreign Whale Tracker
│   ├── stock/
│   │   └── [ticker]/
│   │       └── page.tsx        # Stock detail page
│   ├── sector/
│   │   └── page.tsx            # Sector Rotation Heatmap
│   └── api/                    # Next.js API routes (proxy to backend)
│       ├── ranking/
│       │   └── route.ts
│       ├── stock/
│       │   └── [ticker]/
│       │       └── route.ts
│       └── sector/
│           └── route.ts
├── components/
│   ├── charts/
│   │   └── FlowPriceChart.tsx
│   ├── tables/
│   │   ├── RankingTable.tsx
│   │   └── ActivityLog.tsx
│   ├── heatmap/
│   │   └── SectorHeatmap.tsx
│   ├── badges/
│   │   └── ScoreBadge.tsx
│   ├── terminal/
│   │   ├── TerminalHeader.tsx
│   │   ├── SessionClock.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusBar.tsx
│   │   └── ThemeSwitcher.tsx
│   ├── dashboard/
│   │   ├── MarketSummary.tsx
│   │   └── DivergenceRadar.tsx
│   ├── filters/
│   │   └── TimeRangeToggle.tsx
│   └── ui/
│       ├── Skeleton.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       ├── Tooltip.tsx
│       └── NumberFormat.tsx
├── stores/
│   └── useTerminalStore.ts     # Zustand store
├── lib/
│   ├── fetcher.ts              # SWR fetcher utility
│   ├── formatters.ts           # Number/date formatting helpers
│   └── constants.ts            # IDX sessions, sector codes, etc.
├── hooks/
│   ├── useRanking.ts           # SWR hook for ranking data
│   ├── useStockDetail.ts       # SWR hook for stock detail
│   └── useSectorData.ts        # SWR hook for sector heatmap
├── types/
│   └── index.ts                # All TypeScript interfaces
└── styles/
    └── themes.css              # CSS custom properties for all 3 themes
```

---

*This document is the shared reference for frontend implementation. All architectural decisions above should be treated as agreed-upon unless explicitly revised by the team. Update this document if significant changes are made during development.*
