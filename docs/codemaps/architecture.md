# Architecture Codemap

> Freshness: 2026-02-13 | Source: package.json, src/

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Framer Motion |
| Charts | Recharts |
| Data Fetching | SWR (client), fetch + in-memory TTL cache (server) |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Blockchain | ethers.js v6, Hardhat, Solidity 0.8.20 |
| Validation | Zod |
| Theme | next-themes (system/light/dark) |
| Storage | Vercel Blob (prod), filesystem (local) |
| Testing | Vitest + Testing Library, Playwright, Hardhat + Chai |

## Data Flow

```
External APIs (DeFiLlama, GeckoTerminal, Moralis)
  -> API Routes (server, TTL cache)
    -> SWR Hooks (client, 60-120s refresh)
      -> React Components

POST /api/ai/analyze (cron or manual)
  -> Fetch market data from own API routes
  -> Gemini AI generates 1-5 insights (Zod-validated)
  -> keccak256 hash each insight
  -> storePredictionBatch on ChainPulseOracle (BSC)
  -> Save insights to Vercel Blob / local JSON
```

## Directory Map

```
src/
  app/                  # Pages (6) + API routes (7) + layout + globals.css
  components/           # 35 components organized by feature
    dashboard/          # StatsCard, TvlChart, VolumeChart, ProtocolTable, HeroSection
    insights/           # InsightFeed, InsightCard, SentimentBadge, OnchainProof, VerificationPanel
    tokens/             # TokenTable, Sparkline
    whales/             # WhaleFeed, WhaleCard
    predictions/        # PredictionTable
    build-log/          # BuildTimeline
    layout/             # Sidebar, Header, MobileNav
    shared/             # PageTransition, LiveIndicator, ApiError, ErrorBoundary
    theme/              # ThemeProvider, ThemeToggle
    ui/                 # 9 shadcn primitives (Button, Card, Badge, Table, etc.)
  hooks/                # 8 hooks (6 SWR data + useVerify + useChartColors)
  lib/
    ai/                 # Gemini analyzer, prompts, Zod schemas
    blockchain/         # Contract helpers, ABI (405 lines), chain config
    data-sources/       # DeFiLlama, GeckoTerminal (rate-limited), Moralis (rate-limited)
    cache.ts            # In-memory TTL + LRU (max 100 entries)
    insights-store.ts   # Vercel Blob (prod) / filesystem (dev) abstraction
    types.ts            # 7 shared interfaces
    constants.ts        # Cache TTLs, whale threshold, chain IDs
    format.ts           # USD/value formatting (B/M/K)
    nav-items.ts        # Route config with icons
    utils.ts            # cn() Tailwind merge
  instrumentation.ts    # HTTP proxy setup (undici EnvHttpProxyAgent)
contracts/              # ChainPulseOracle.sol (Solidity 0.8.20)
test/                   # 21 test files mirroring src structure
docs/                   # Plans (10), CONTRIB.md, RUNBOOK.md, codemaps/
```

## Key Patterns

- **Singleton API clients**: `defiLlama`, `geckoTerminal`, `getMoralisClient()` — instantiated once
- **Cache-aside**: API routes check TTL cache before fetching externals
- **Rate limiting**: Queue-based (GeckoTerminal 30/min), interval-based (Moralis 40ms)
- **Auth**: Constant-time Bearer token comparison for cron/analyze endpoints
- **Prompt safety**: Sanitize market data before injecting into AI prompts
- **Theme-aware charts**: `useChartColors()` hook returns light/dark Recharts palettes
- **Storage abstraction**: `insights-store.ts` picks Vercel Blob or filesystem by `VERCEL` env var
