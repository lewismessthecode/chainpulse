# Data Models Codemap

> Freshness: 2026-02-13 | Source: src/lib/types.ts, src/lib/ai/schema.ts, contracts/

## TypeScript Interfaces (`src/lib/types.ts`, 69 lines)

### MarketOverview
```
tvl:       { current: number, change24h: number, history: TimeSeriesPoint[] }
volume:    { current: number, change24h: number, history: TimeSeriesPoint[] }
protocolCount: number
topProtocols:  Protocol[]
```

### Protocol
```
name: string, tvl: number, change24h: number, volume24h: number, logo?: string
```

### TimeSeriesPoint
```
date: string, value: number
```

### TokenData
```
name: string, symbol: string, address: string, price: number,
priceChange24h: number, volume24h: number, liquidity: number, sparkline?: number[]
```

### WhaleAlert
```
txHash: string, from: string, to: string, value: number,
token: string, tokenSymbol: string, timestamp: number,
type: "transfer" | "swap", fromLabel: string | null, toLabel: string | null,
usdValue: number | null
```

### AIInsight
```
id: string, category: "TREND" | "RISK" | "WHALE_ALERT" | "MARKET_INSIGHT",
title: string, summary: string, fullAnalysis: string,
sentimentScore: number, confidence: number, dataPoints: string[],
predictionId?: number, txHash?: string, contentHash: string, createdAt: string
```

### OnchainPrediction
```
id: number, contentHash: string, timestamp: number, category: number,
categoryName: string, sentimentScore: number, summary: string
```

## Zod Schemas (`src/lib/ai/schema.ts`, 18 lines)

### insightSchema
```
category:      enum [TREND, RISK, WHALE_ALERT, MARKET_INSIGHT]
title:         string, max 80
summary:       string, max 200 (stored on-chain)
fullAnalysis:  string, max 5000
sentimentScore: int, -100..100
confidence:    int, 0..100
dataPoints:    string[], max 20 items, each max 200
```

### analysisResponseSchema
```
insights: insightSchema[], 1..5 items
```

## Smart Contract (`contracts/ChainPulseOracle.sol`, Solidity 0.8.20)

### Storage
```solidity
uint256 public predictionCount
mapping(uint256 => Prediction) public predictions
address public agentAddress
```

### Structs
```solidity
Prediction { bytes32 contentHash, uint256 timestamp, PredictionCategory category,
             int8 sentimentScore, string summary }
```

### Enums
```solidity
PredictionCategory { TREND=0, RISK=1, WHALE_ALERT=2, MARKET_INSIGHT=3 }
```

### Functions

| Function | Access | Returns |
|----------|--------|---------|
| `storePrediction(hash, category, sentiment, summary)` | onlyAgent | uint256 (prediction ID) |
| `storePredictionBatch(hashes[], cats[], sents[], sums[])` | onlyAgent | - |
| `verifyPrediction(id, content)` | public view | bool |
| `getPrediction(id)` | public view | Prediction |
| `getLatestPredictions(count)` | public view | Prediction[] |
| `predictionCount()` | public view | uint256 |
| `setAgentAddress(newAgent)` | onlyOwner | - |

### Events
- `PredictionStored(predictionId indexed, contentHash indexed, category, sentimentScore, timestamp, summary)`
- `AgentAddressUpdated(oldAgent indexed, newAgent indexed)`

### Validation
- `sentimentScore`: -100 to 100
- `summary`: max 200 bytes
- `onlyAgent`: sender must be agentAddress or owner

## API Response Shapes

### GET /api/market/overview -> MarketOverview

### GET /api/market/tokens -> TokenData[]

### GET /api/market/whales -> WhaleAlert[]

### GET /api/chain/predictions
```json
{ "predictions": OnchainPrediction[], "total": number }
```

### POST /api/chain/verify
- **Request**: `{ "predictionId": 0..1000000, "content": string 1..10000 }`
- **Response**: `{ "verified": boolean, "predictionId": number }`

### POST /api/ai/analyze (Bearer auth)
- **Response**: `{ "success": true, "insightCount": number, "txHash": string }`

### GET /api/ai/insights?page=1&limit=10&category=TREND
- **Response**: `{ "insights": AIInsight[], "total": number, "page": number, "limit": number, "totalPages": number }`

## Constants (`src/lib/constants.ts`)

| Constant | Value |
|----------|-------|
| `CACHE_TTL.MARKET_OVERVIEW` | 5 min |
| `CACHE_TTL.TOKENS` | 2 min |
| `CACHE_TTL.WHALES` | 1 min |
| `CACHE_TTL.INSIGHTS` | 2 min |
| `WHALE_MIN_VALUE_USD` | $50,000 |
| `BSC_CHAIN_IDS.MAINNET` | 56 |
| `BSC_CHAIN_IDS.TESTNET` | 97 |

## Test Coverage

| Area | Files | Framework |
|------|-------|-----------|
| API routes | 5 | Vitest |
| Components | 6 | Vitest + Testing Library |
| Libraries | 7 | Vitest |
| Contract | 1 | Hardhat + Chai |
| E2E | 1 | Playwright |
| **Total** | **20** | |
