# Frontend Codemap

> Freshness: 2026-02-13 | Source: src/app/, src/components/, src/hooks/

## Pages

| Route | File | Lines | Hook | Key Components |
|-------|------|-------|------|----------------|
| `/` | `app/page.tsx` | 69 | `useMarketData` | HeroSection, StatsCard x4, TvlChart, VolumeChart, ProtocolTable |
| `/insights` | `app/insights/page.tsx` | 42 | `useInsights` | InsightFeed |
| `/tokens` | `app/tokens/page.tsx` | 35 | `useTokens` | TokenTable |
| `/whales` | `app/whales/page.tsx` | 39 | `useWhaleAlerts` | WhaleFeed |
| `/predictions` | `app/predictions/page.tsx` | 35 | `usePredictions` | PredictionTable |
| `/build-log` | `app/build-log/page.tsx` | 29 | - | BuildTimeline |

**Pattern**: All pages are `"use client"`, wrap content in `PageTransition` + `FadeInItem`, handle loading (skeletons) and errors (`ApiError`).

## Layout (`app/layout.tsx`, 72 lines)

- **Fonts**: Geist (display), Plus Jakarta Sans (body), JetBrains Mono (data)
- **Providers**: ThemeProvider (system/light/dark, attribute="class")
- **Structure**: Sidebar (desktop) + MobileNav (bottom) + ErrorBoundary

## Components by Feature

### Dashboard (5 files, ~402 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `HeroSection` | 80 | Contract info, prediction count, LIVE badge, Framer Motion |
| `StatsCard` | 76 | Stat with label, value, change %, tooltip, hover animation |
| `TvlChart` | 79 | Recharts Area chart, theme-aware via `useChartColors` |
| `VolumeChart` | 78 | Recharts Bar chart, theme-aware |
| `ProtocolTable` | 89 | Sortable table (TVL/volume/change columns) |

### Insights (6 files, ~406 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `InsightFeed` | 88 | Category filter tabs + stagger animation |
| `InsightCard` | 96 | Insight display with sentiment, data points, proof |
| `SentimentBadge` | 24 | BULLISH/NEUTRAL/BEARISH pill |
| `PulseLine` | 20 | Animated SVG heartbeat |
| `OnchainProof` | 36 | Content hash + BSCScan link |
| `VerificationPanel` | 142 | Hash verification UI with contract interaction |

### Tokens (2 files, ~160 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `TokenTable` | 124 | Sortable table with price, change, volume, liquidity, sparkline |
| `Sparkline` | 36 | SVG mini chart, green/red by direction |

### Whales (2 files, ~153 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `WhaleFeed` | 51 | Sorted whale alerts with stagger animation |
| `WhaleCard` | 102 | Transfer card with INFLOW/OUTFLOW exchange detection |

### Predictions (1 file, 104 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `PredictionTable` | 104 | On-chain predictions with hash, sentiment, BSCScan link |

### Build Log (1 file, 152 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `BuildTimeline` | 152 | 6-phase project timeline with tech stack badges |

### Layout (3 files, ~122 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `Sidebar` | 51 | Desktop fixed left sidebar (56px), nav icons + theme toggle |
| `Header` | 37 | Page title (from pathname) + date + LiveIndicator |
| `MobileNav` | 34 | Bottom nav bar (mobile only, 64px) |

### Shared (4 files, ~139 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `PageTransition` | 38 | Framer Motion stagger wrapper + `FadeInItem` |
| `LiveIndicator` | 15 | Pulsing green dot + "Live" |
| `ApiError` | 29 | Error display with retry button |
| `ErrorBoundary` | 57 | React class error boundary |

### Theme (2 files, ~56 lines)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `ThemeProvider` | 17 | next-themes wrapper |
| `ThemeToggle` | 39 | Light/dark/system cycle button |

### UI Primitives (9 files, ~782 lines)

All shadcn/ui built on Radix UI: `Button`, `Card`, `Badge`, `Table`, `Tabs`, `Skeleton`, `Tooltip`, `Sheet`, `Dialog`

## Hooks (`src/hooks/`)

### Data Hooks (SWR)

| Hook | File | Endpoint | Refresh | Returns |
|------|------|----------|---------|---------|
| `useMarketData` | `use-market-data.ts` | `/api/market/overview` | 60s | `MarketOverview` |
| `useTokens` | `use-tokens.ts` | `/api/market/tokens` | 120s | `TokenData[]` |
| `useWhaleAlerts` | `use-whale-alerts.ts` | `/api/market/whales` | 60s | `WhaleAlert[]` |
| `useInsights` | `use-insights.ts` | `/api/ai/insights` | 120s | `AIInsight[]` |
| `usePredictions` | `use-predictions.ts` | `/api/chain/predictions` | 120s | `OnchainPrediction[]` |

Shared `fetcher.ts` (5 lines): throws on non-ok responses so SWR treats them as errors.

### Utility Hooks

| Hook | File | Lines | Purpose |
|------|------|-------|---------|
| `useVerify` | `use-verify.ts` | 49 | POST to `/api/chain/verify`, returns `{ verify, isVerifying, result, error, reset }` |
| `useChartColors` | `use-chart-colors.ts` | 57 | Returns theme-aware Recharts color object, `null` until mounted (SSR-safe) |

## Design System ("Clean Data Studio")

### CSS Tokens (`globals.css`, 225 lines)

**Surfaces**: `bg-surface` / `bg-elevated` / `bg-overlay`
**Text**: `text-text-primary` / `text-text-secondary` / `text-text-muted`
**Accent**: `text-accent-theme` / `bg-accent-faint` / `bg-accent-glow`
**Semantic**: `text-positive` / `text-negative` + `-dim` background variants
**Charts**: `--chart-line` / `--chart-fill` / `--chart-grid`

**Light**: warm whites (hsl 40, 10%, 98%), cool text, amber accent hsl(38,80%,50%)
**Dark**: rich dark grays (hsl 225, 15%, 10%), warm text, amber hsl(38,80%,55%)
**Radius**: 0.5rem (8px)
**Fonts**: Geist (display), Plus Jakarta Sans (body), JetBrains Mono (mono)

## Stats

- **Pages**: 6 routes + 1 layout
- **Components**: 35 total (~2,476 lines)
- **Hooks**: 8 total (~186 lines)
- **Avg component size**: ~71 lines
