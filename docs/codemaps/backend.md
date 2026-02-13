# Backend Codemap

> Freshness: 2026-02-13 | Source: src/app/api/, src/lib/

## API Routes

| Route | Method | Auth | Source | Cache TTL | Lines |
|-------|--------|------|--------|-----------|-------|
| `/api/market/overview` | GET | - | DeFiLlama | 5min | 59 |
| `/api/market/tokens` | GET | - | GeckoTerminal | 2min | 39 |
| `/api/market/whales` | GET | - | Moralis | 1min | 84 |
| `/api/chain/predictions` | GET | - | BSC Contract | - | 58 |
| `/api/chain/verify` | POST | - | BSC Contract | - | 37 |
| `/api/ai/analyze` | POST | Bearer | Gemini -> BSC | - | 63 |
| `/api/ai/insights` | GET | - | Vercel Blob / JSON | - | 43 |
| `/api/cron/analyze` | GET | Bearer | Delegates to analyze | - | 36 |

## Data Sources (`src/lib/data-sources/`)

### DeFiLlama (`defillama.ts`, 63 lines)
- **Exports**: `DefiLlamaClient`, `defiLlama` singleton
- **Methods**: `getBscTvl()`, `getBscProtocols(limit)`, `getBscDexVolumes()`
- **Rate limit**: None
- **Base URL**: `api.llama.fi`

### GeckoTerminal (`geckoterminal.ts`, 172 lines)
- **Exports**: `GeckoTerminalClient`, `geckoTerminal` singleton, `Pool`, `TokenInfo`
- **Methods**: `getTrendingPools()`, `getTopPools(sort, limit)`, `getPoolOhlcv(address)`, `getTokenInfo(address)`
- **Rate limit**: Queue, 30 req/min, 2s polling
- **Base URL**: `api.geckoterminal.com/api/v2`

### Moralis (`moralis.ts`, 149 lines)
- **Exports**: `MoralisClient`, `getMoralisClient()` singleton, `TokenTransfer`
- **Methods**: `getTokenTransfers(address, limit)`, `getTokenPrice(tokenAddress)`
- **Rate limit**: Interval, 40ms (~25 req/sec), 40k CU/day
- **Base URL**: `deep-index.moralis.io/api/v2.2`

## AI Engine (`src/lib/ai/`)

### Analyzer (`analyzer.ts`, 84 lines)
- **Export**: `runAnalysis(marketData)` async
- **Flow**: Build prompt -> Gemini 2.0 Flash (temp 0.7) -> Zod validate -> keccak256 hash -> batch write to contract -> save insights
- **Model config**: Structured JSON output, topP 0.9

### Prompts (`prompts.ts`, 123 lines)
- **Exports**: `SYSTEM_INSTRUCTION`, `buildAnalysisPrompt(data)`, `sanitizeForPrompt()`
- **Security**: Strips control chars, JSON braces, instruction hijacking keywords

### Schema (`schema.ts`, 18 lines)
- **Exports**: `insightSchema`, `analysisResponseSchema`, `InsightOutput`, `AnalysisResponse`
- **Constraints**: 1-5 insights, title<=80, summary<=200, fullAnalysis<=5000, sentiment -100..100, confidence 0..100

## Blockchain (`src/lib/blockchain/`)

### Contract Helpers (`contract.ts`, 28 lines)
- **Exports**: `getProvider()`, `getReadContract()`, `getWriteContract()`
- **Note**: Marked `"server-only"` — cannot import from client components

### ABI (`abi.ts`, 405 lines)
- Full ABI for ChainPulseOracle: 6 read + 3 write + 2 admin functions

### Config (`config.ts`, 12 lines)
- **Export**: `chainConfig` — rpcUrl, contractAddress, chainId, explorerUrl

## Core Utilities

| File | Lines | Exports | Purpose |
|------|-------|---------|---------|
| `cache.ts` | 40 | `MemoryCache`, `cache` | TTL cache, LRU eviction, max 100 entries |
| `insights-store.ts` | 64 | `loadInsights`, `saveInsights` | Vercel Blob (prod) / filesystem (dev), max 500 insights |
| `types.ts` | 69 | 7 interfaces | MarketOverview, TokenData, WhaleAlert, AIInsight, OnchainPrediction, Protocol, TimeSeriesPoint |
| `constants.ts` | 13 | `CACHE_TTL`, `WHALE_MIN_VALUE_USD`, `BSC_CHAIN_IDS` | Cache durations, $50k whale threshold, chain IDs |
| `format.ts` | 23 | `formatUsd`, `formatValue` | B/M/K abbreviations |
| `nav-items.ts` | 10 | `NAV_ITEMS` | 6 routes with lucide icons |
| `utils.ts` | 6 | `cn()` | clsx + tailwind-merge |
| `instrumentation.ts` | 15 | register hook | undici EnvHttpProxyAgent setup |

## Config Files

| File | Lines | Purpose |
|------|-------|---------|
| `hardhat.config.ts` | 32 | Solidity 0.8.20, BSC testnet/mainnet, TypeChain, ethers v6 |
| `next.config.ts` | 25 | External packages (undici), security headers (HSTS, X-Frame, etc.) |
| `vitest.config.ts` | 18 | jsdom, React plugin, excludes contracts/e2e |
| `playwright.config.ts` | 17 | 30s timeout, 1 retry, auto-starts dev server |
