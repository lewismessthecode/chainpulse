# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChainPulse is an AI-powered onchain market intelligence dashboard for BNB Chain DeFi. Built with Next.js 16 (App Router), React 19, and a Solidity smart contract (ChainPulseOracle) deployed on BSC. It aggregates data from DeFiLlama, GeckoTerminal, and Moralis, runs AI analysis via Google Gemini, and anchors predictions on-chain.

## Commands

```bash
npm run dev          # Start Next.js dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint (v9, flat config)
npx vitest run       # Run all unit tests
npx vitest run test/lib/cache.test.ts          # Run single test file
npx vitest run -t "should return insights"     # Run test by name
npx playwright test                            # Run E2E tests (auto-starts dev server)
npx playwright test --headed                   # E2E with visible browser
npx hardhat test                               # Smart contract tests
npx hardhat compile                            # Compile Solidity contracts
npm run deploy:testnet                         # Deploy contract to BSC testnet
```

## Architecture

### Data Flow

```
External APIs (DeFiLlama, GeckoTerminal, Moralis)
  → Next.js API Routes (server, with in-memory TTL cache)
    → SWR Hooks (client, with refresh intervals)
      → React Components

Cron/Manual trigger → POST /api/ai/analyze
  → Gemini AI generates insights
  → Writes predictions on-chain (ChainPulseOracle contract)
  → Saves insights via insights-store (Vercel Blob in prod, data/insights.json locally)
```

### Key Directories

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components organized by feature (dashboard, insights, tokens, whales, predictions)
- `src/hooks/` — SWR-based data fetching hooks, shared `fetcher.ts` for error-resilient fetch
- `src/lib/data-sources/` — API clients for DeFiLlama, GeckoTerminal, Moralis (each with rate limiting)
- `src/lib/ai/` — Gemini AI integration: analyzer orchestrator, Zod schemas, prompt builders
- `src/lib/blockchain/` — ethers.js v6 contract helpers, ABI, chain config
- `src/lib/types.ts` — All shared TypeScript interfaces
- `src/lib/cache.ts` — In-memory TTL cache used by API routes
- `src/lib/insights-store.ts` — Insights persistence abstraction (Vercel Blob in production, local file fallback)
- `src/middleware.ts` — Rate limiting middleware for all API routes (per-IP limits)
- `contracts/` — Solidity smart contract (ChainPulseOracle.sol, OpenZeppelin, Hardhat)
- `test/` — Mirrors src structure: `test/api/`, `test/components/`, `test/lib/`, `test/e2e/`, `test/contracts/`

### API Routes

| Route | Method | Data Source |
|---|---|---|
| `/api/market/overview` | GET | DeFiLlama |
| `/api/market/tokens` | GET | GeckoTerminal |
| `/api/market/whales` | GET | Moralis |
| `/api/chain/predictions` | GET | Smart contract (BSC) |
| `/api/chain/verify` | POST | Smart contract (BSC) |
| `/api/ai/analyze` | POST | Gemini AI → on-chain |
| `/api/ai/insights` | GET | data/insights.json |
| `/api/cron/analyze` | GET | Bearer-protected cron trigger |

### SWR Hooks

All hooks import from `src/hooks/fetcher.ts` which throws on non-ok responses (so SWR treats errors correctly). Refresh intervals: market data 60s, tokens/insights 120s, whales 60s.

### External API Rate Limits

- **Moralis**: ~25 req/sec (40ms interval, 40k CU/day free tier)
- **GeckoTerminal**: 30 req/min (queue-based limiter)
- **DeFiLlama**: No rate limiter (generous limits)

## Testing

- **Unit tests**: Vitest + Testing Library + jsdom. Setup in `test/vitest-setup.ts`. Contract tests and E2E are excluded from vitest config.
- **E2E tests**: Playwright, configured in `playwright.config.ts`. Test dir: `test/e2e/`. Auto-starts dev server on port 3000.
- **Contract tests**: Hardhat + Chai matchers. Test dir: `test/contracts/`. Separate from vitest.
- Path alias `@` → `./src` works in both app code and vitest.

## Design System

"Clean Data Studio" — modern, professional DeFi dashboard with light/dark mode support via `next-themes`.

- **Theme**: System/light/dark toggle in sidebar. `attribute="class"` on `<html>`, `suppressHydrationWarning`.
- **Light mode**: Warm-tinted whites (`hsl(40, 10%, 98%)` background), cool text (`hsl(30, 8%, 12%)`).
- **Dark mode**: Rich dark grays (`hsl(225, 15%, 10%)` background, not pure black), warm light text (`hsl(40, 10%, 93%)`).
- **Accent**: Amber/gold (BNB Chain brand) — `hsl(38, 80%, 50%)` light / `hsl(38, 80%, 55%)` dark.
- **Semantic colors**: `--positive` (green), `--negative` (red), with `-dim` variants for backgrounds.
- **Border radius**: `0.5rem` (8px) — modern rounded corners.
- **Typography**: Geist (display/headings via `font-display` class), Plus Jakarta Sans (body), JetBrains Mono (data/mono).
- **Animations**: ease-out only. Framer Motion for page transitions and hover effects.
- **CSS tokens**: `bg-surface`, `bg-elevated`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `border-border-subtle`, `text-accent-theme`, `bg-accent-faint`, `text-positive`, `text-negative`. Defined in `src/app/globals.css`.
- **Chart theming**: `useChartColors()` hook in `src/hooks/use-chart-colors.ts` returns light/dark Recharts color objects. Charts re-render on theme change via `key={colors.line}`.

## Environment Variables

See `.env.example`. Required for full functionality:
- `MORALIS_API_KEY` — Moralis API access (whale transfer data)
- `GEMINI_API_KEY` — Google Gemini for AI analysis
- `NEXT_PUBLIC_CONTRACT_ADDRESS` — Deployed ChainPulseOracle address
- `NEXT_PUBLIC_BSC_RPC_URL` — BSC RPC endpoint
- `AGENT_PRIVATE_KEY` — Wallet for writing predictions on-chain
- `CRON_SECRET` — Bearer token for cron endpoint
- `DEPLOYER_PRIVATE_KEY` — Wallet for deploying contracts to BSC
- `BSCSCAN_API_KEY` — BSCScan API key for contract verification
- `APP_URL` — Server-only app URL for internal API calls
- `HTTPS_PROXY` / `NO_PROXY` — Optional, for environments behind a firewall. Uses npm `undici` package (not Node.js built-in) for `EnvHttpProxyAgent` support. Configured in `src/instrumentation.ts`.

## Smart Contract

`ChainPulseOracle.sol` (Solidity 0.8.20) stores AI predictions with content hashes on BSC. Supports batch storage, hash verification, and agent-based access control. ABI is in `src/lib/blockchain/abi.ts`. TypeChain types in `typechain-types/`.

## Deployment

- **Hosting**: Vercel (configured via `vercel.json`)
- **Cron**: Daily at midnight UTC — triggers `/api/cron/analyze` (Vercel Hobby plan limit: 1 cron job)
- **Contract deployment**: Hardhat Ignition modules in `ignition/`. History in `ignition/deployments/`.
