# ChainPulse

AI-powered onchain market intelligence dashboard for BNB Chain DeFi.

Built with Next.js 16, Tailwind CSS 4, Recharts, ethers.js, and Google Gemini.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Market Overview -- TVL/volume charts, protocol table, stats cards |
| `/insights` | AI Insights -- AI-generated market analysis with on-chain proof badges |
| `/tokens` | Token Analytics -- sortable token table with sparklines |
| `/whales` | Whale Monitor -- real-time whale transaction feed |
| `/predictions` | Prediction History -- on-chain prediction verification table |

## Prerequisites

- Node.js 18+
- npm

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `BSCSCAN_API_KEY` | For whale data | [BscScan API key](https://bscscan.com/apis) |
| `GEMINI_API_KEY` | For AI insights | [Google AI Studio key](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | For predictions | Deployed ChainPulseOracle contract address |
| `NEXT_PUBLIC_BSC_RPC_URL` | For predictions | BSC RPC endpoint (default: BSC Testnet) |
| `NEXT_PUBLIC_BSC_CHAIN_ID` | For predictions | Chain ID (default: `97` for testnet) |
| `AGENT_PRIVATE_KEY` | For AI writes | Private key for the AI agent wallet |
| `CRON_SECRET` | For cron jobs | Bearer token for `/api/cron/analyze` |
| `NEXT_PUBLIC_APP_URL` | Optional | App URL (default: `http://localhost:3000`) |

The dashboard pages (Market Overview, Tokens) work without any API keys -- they fetch from public DeFiLlama and GeckoTerminal APIs. BscScan and Gemini keys are only needed for whale monitoring and AI analysis features.

3. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx vitest run` | Run unit tests (49 tests) |
| `npx playwright test` | Run E2E tests (6 tests) |

## Testing

**Unit tests** (Vitest + Testing Library):

```bash
npx vitest run
```

18 test files, 49 tests covering data clients, API routes, components, AI engine, and blockchain helpers.

**E2E tests** (Playwright):

```bash
npx playwright install chromium   # first time only
npx playwright test
```

6 tests covering critical navigation paths and responsive layout.

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/market/overview` | GET | TVL, volume, top protocols |
| `/api/market/tokens` | GET | Top BSC tokens by volume |
| `/api/market/whales` | GET | Recent whale transactions |
| `/api/chain/predictions` | GET | On-chain predictions |
| `/api/chain/verify` | POST | Verify prediction hash |
| `/api/ai/analyze` | POST | Trigger AI market analysis |
| `/api/ai/insights` | GET | Fetch stored AI insights |
| `/api/cron/analyze` | GET | Cron-triggered analysis |

## Architecture

```
src/
  app/                    # Next.js App Router pages + API routes
  components/
    dashboard/            # Stats cards, charts, protocol table
    insights/             # AI insight cards, sentiment badges, proof links
    tokens/               # Token table with sparklines
    whales/               # Whale alert cards and feed
    predictions/          # Prediction verification table
    layout/               # Sidebar, header, mobile nav
    shared/               # Live indicator, page transitions
  hooks/                  # SWR data fetching hooks
  lib/
    ai/                   # Gemini prompts, schema validation, analyzer
    blockchain/           # Contract ABI, config, helpers (ethers.js)
    data-sources/         # DeFiLlama, GeckoTerminal, BscScan clients
    cache.ts              # In-memory TTL cache
    constants.ts          # App constants
    types.ts              # Shared TypeScript types
test/
  api/                    # API route tests
  components/             # Component tests
  lib/                    # Library/client tests
  e2e/                    # Playwright E2E tests
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Data Fetching**: SWR
- **Blockchain**: ethers.js v6
- **AI**: Google Gemini 2.0 Flash
- **Validation**: Zod v4
- **Testing**: Vitest, Testing Library, Playwright
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
