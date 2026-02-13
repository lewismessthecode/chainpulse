# Contributing to ChainPulse

> Auto-generated from `package.json` and `.env.example` on 2026-02-13

## Prerequisites

- Node.js 24+ (uses built-in undici for proxy support)
- npm 10+
- Git

## Quick Start

```bash
git clone <repo-url> chainpulse && cd chainpulse
npm install
cp .env.example .env.local   # then fill in values (see Environment Setup)
npm run dev                   # http://localhost:3000
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev` | Start Next.js dev server with Turbopack |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint (v9, flat config) |
| `npm run deploy:testnet` | `hardhat ignition deploy ...` | Deploy ChainPulseOracle to BSC Testnet |

### Additional Commands (not in package.json)

| Command | Description |
|---------|-------------|
| `npx vitest run` | Run all unit tests (~49 tests) |
| `npx vitest run <file>` | Run a single test file |
| `npx vitest run -t "<name>"` | Run test by name pattern |
| `npx playwright test` | Run E2E tests (auto-starts dev server) |
| `npx playwright test --headed` | E2E with visible browser |
| `npx hardhat test` | Run smart contract tests (13 tests) |
| `npx hardhat compile` | Compile Solidity contracts |

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description | How to Get |
|----------|----------|-------------|------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Yes | Deployed ChainPulseOracle address | Deploy contract (see SETUP.md Phase 6) |
| `NEXT_PUBLIC_BSC_CHAIN_ID` | No | BSC chain ID (default: `97` testnet) | Pre-filled |
| `NEXT_PUBLIC_BSC_RPC_URL` | No | BSC RPC endpoint (default: testnet) | Pre-filled |
| `AGENT_PRIVATE_KEY` | Yes | Wallet for writing predictions on-chain | Create wallet (see SETUP.md Phase 2) |
| `DEPLOYER_PRIVATE_KEY` | Yes | Wallet for deploying contracts | Same or separate wallet |
| `MORALIS_API_KEY` | Yes | Moralis API access (whale data) | [moralis.io](https://moralis.io) free tier |
| `GEMINI_API_KEY` | Yes | Google Gemini for AI analysis | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `CRON_SECRET` | Yes | Bearer token for cron endpoint | Self-generated hex string |
| `BSCSCAN_API_KEY` | No | BscScan API key for contract verification | [bscscan.com](https://bscscan.com) |
| `HTTPS_PROXY` | No | HTTP proxy for server-side API calls | Only if behind a firewall |
| `NO_PROXY` | No | Hosts to bypass proxy | e.g. `localhost,127.0.0.1` |
| `APP_URL` | No | Server-only app URL for internal API calls | Defaults to `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL (default: `http://localhost:3000`) | Pre-filled |

## Development Workflow

1. **Branch** from `main`
2. **Write tests first** (Vitest for unit/integration, Playwright for E2E)
3. **Implement** to pass tests
4. **Lint**: `npm run lint`
5. **Test**: `npx vitest run`
6. **Commit** using conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`

## Testing

### Unit Tests (Vitest + Testing Library)

```bash
npx vitest run                              # all tests
npx vitest run test/lib/cache.test.ts       # single file
npx vitest run -t "should return insights"  # by name
```

- Config: `vitest.config.ts`
- Setup: `test/vitest-setup.ts`
- Environment: jsdom
- Path alias: `@` maps to `./src`
- Excludes: `test/contracts/`, `test/e2e/`

### E2E Tests (Playwright)

```bash
npx playwright test           # headless
npx playwright test --headed  # with browser
```

- Config: `playwright.config.ts`
- Test dir: `test/e2e/`
- Auto-starts dev server on port 3000

### Contract Tests (Hardhat + Chai)

```bash
npx hardhat test
```

- Test dir: `test/contracts/`
- Separate from Vitest (run via Hardhat)

## Project Structure

```
src/
  app/             # Next.js App Router pages + API routes
  components/      # React components by feature
  hooks/           # SWR data fetching hooks
  lib/
    ai/            # Gemini AI: analyzer, prompts, schema
    blockchain/    # ethers.js contract helpers, ABI
    cache.ts       # In-memory TTL cache
    data-sources/  # DeFiLlama, GeckoTerminal, Moralis clients
    types.ts       # Shared TypeScript interfaces
contracts/         # Solidity (ChainPulseOracle.sol)
test/              # Mirrors src structure
docs/              # Plans and documentation
```

## Design System

"Clean Data Studio" theme with light/dark mode (`next-themes`, `attribute="class"`):
- **Light mode**: warm-tinted whites (`hsl(40, 10%, 98%)` background)
- **Dark mode**: rich dark grays (`hsl(225, 15%, 10%)` background, not pure black)
- Accent: amber/gold (BNB Chain brand) — `hsl(38, 80%, 50%)` light / `hsl(38, 80%, 55%)` dark
- Display font: Geist (`font-display` class)
- Body font: Plus Jakarta Sans
- Data font: JetBrains Mono (monospaced numerics)
- Border-radius: `0.5rem` (8px) — modern rounded corners
- Animations: ease-out only, Framer Motion for transitions
- CSS tokens: `bg-surface`, `bg-elevated`, `text-text-primary`, `text-accent-theme`, etc. in `globals.css`

## External API Rate Limits

| API | Rate Limit | Notes |
|-----|-----------|-------|
| Moralis | ~25 req/sec (40ms interval) | 40k CU/day free tier |
| GeckoTerminal | 30 req/min | Queue-based limiter |
| DeFiLlama | No limit | Generous public API |
