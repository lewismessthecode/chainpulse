# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChainPulse is an AI-powered onchain market intelligence dashboard for BNB Chain DeFi. Built with Next.js 16 (App Router), React 19, and a Solidity smart contract (ChainPulseOracle) deployed on BSC. It aggregates data from DeFiLlama, GeckoTerminal, and Moralis, runs AI analysis via Google Gemini, and anchors predictions on-chain.

## Commands

```bash
npm run dev          # Start Next.js dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint (v9, flat config)
npx vitest run       # Run all 49 unit tests
npx vitest run test/lib/cache.test.ts          # Run single test file
npx vitest run -t "should return insights"     # Run test by name
npx playwright test                            # Run E2E tests (auto-starts dev server)
npx playwright test --headed                   # E2E with visible browser
npx hardhat test                               # Smart contract tests
npx hardhat compile                            # Compile Solidity contracts
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
  → Saves insights to data/insights.json
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

"Obsidian Terminal" — pure black backgrounds (`#000`), amber accent (`#D4A017`), monospaced numerics (JetBrains Mono), sharp corners (no border-radius), ease-out animations only. Display font: Instrument Serif. Body font: Plus Jakarta Sans. Tailwind CSS 4 with custom theme tokens in `src/app/globals.css`.

## Environment Variables

See `.env.example`. Required for full functionality:
- `MORALIS_API_KEY` — Moralis API access (whale transfer data)
- `GEMINI_API_KEY` — Google Gemini for AI analysis
- `NEXT_PUBLIC_CONTRACT_ADDRESS` — Deployed ChainPulseOracle address
- `NEXT_PUBLIC_BSC_RPC_URL` — BSC RPC endpoint
- `AGENT_PRIVATE_KEY` — Wallet for writing predictions on-chain
- `CRON_SECRET` — Bearer token for cron endpoint
- `HTTPS_PROXY` / `NO_PROXY` — Optional, for environments behind a firewall. Uses npm `undici` package (not Node.js built-in) for `EnvHttpProxyAgent` support. Configured in `src/instrumentation.ts`.

## Smart Contract

`ChainPulseOracle.sol` (Solidity 0.8.20) stores AI predictions with content hashes on BSC. Supports batch storage, hash verification, and agent-based access control. ABI is in `src/lib/blockchain/abi.ts`. TypeChain types in `typechain-types/`.
