# Tasks 12-16: Blockchain Helpers & AI Engine

> **Status: Pending**
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 12: Blockchain Contract Helpers

**Files:**
- Create: `src/lib/blockchain/config.ts`
- Create: `src/lib/blockchain/contract.ts`
- Create: `src/lib/blockchain/abi.ts` (copy from Hardhat artifacts after compile)

**Step 1: Build config**

```ts
// src/lib/blockchain/config.ts
export const chainConfig = {
  rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  chainId: Number(process.env.NEXT_PUBLIC_BSC_CHAIN_ID || 97),
};
```

**Step 2: Build contract helper**

```ts
// src/lib/blockchain/contract.ts
import { ethers } from "ethers";
import { chainConfig } from "./config";
import { abi } from "./abi";

export function getProvider() {
  return new ethers.JsonRpcProvider(chainConfig.rpcUrl);
}

export function getReadContract() {
  return new ethers.Contract(chainConfig.contractAddress, abi, getProvider());
}

export function getWriteContract() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY not set");
  const wallet = new ethers.Wallet(privateKey, getProvider());
  return new ethers.Contract(chainConfig.contractAddress, abi, wallet);
}
```

**Step 3: Copy ABI from `artifacts/contracts/ChainPulseOracle.sol/ChainPulseOracle.json`**

```bash
npx hardhat compile
```

Export just the abi array from the artifact JSON into `src/lib/blockchain/abi.ts`.

**Step 4: Commit**

```bash
git commit -m "feat: add blockchain contract helpers and ABI"
```

---

## Task 13: Chain API Routes (Predictions + Verify)

**Files:**
- Create: `src/app/api/chain/predictions/route.ts`
- Create: `src/app/api/chain/verify/route.ts`

TDD: Write tests that mock `getReadContract()`, verify response shapes. Implement routes that call contract read methods.

**Commit:** `feat: add chain predictions and verify API routes`

---

## Task 14: AI Analysis Engine — Prompts and Schema

**Files:**
- Create: `src/lib/ai/prompts.ts`
- Create: `src/lib/ai/schema.ts`
- Create: `test/lib/schema.test.ts`

**Step 1: Write Zod schema with tests**

```ts
// src/lib/ai/schema.ts
import { z } from "zod";

export const insightSchema = z.object({
  category: z.enum(["TREND", "RISK", "WHALE_ALERT", "MARKET_INSIGHT"]),
  title: z.string().max(80),
  summary: z.string().max(200),
  fullAnalysis: z.string(),
  sentimentScore: z.number().int().min(-100).max(100),
  confidence: z.number().int().min(0).max(100),
  dataPoints: z.array(z.string()),
});

export const analysisResponseSchema = z.object({
  insights: z.array(insightSchema).min(1).max(5),
});

export type InsightOutput = z.infer<typeof insightSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
```

Test: Parse valid JSON, reject invalid JSON, reject out-of-range values.

**Step 2: Write prompt template**

```ts
// src/lib/ai/prompts.ts
import { MarketOverview, TokenData, WhaleAlert } from "@/lib/types";

export function buildAnalysisPrompt(data: {
  overview: MarketOverview;
  tokens: TokenData[];
  whales: WhaleAlert[];
}): string {
  return `You are ChainPulse, an autonomous AI market intelligence agent analyzing BNB Chain DeFi.

## Current BSC Market Data

### Overview
- Total Value Locked: $${(data.overview.tvl.current / 1e9).toFixed(2)}B (${data.overview.tvl.change24h > 0 ? "+" : ""}${data.overview.tvl.change24h.toFixed(1)}% 24h)
- DEX Volume 24h: $${(data.overview.volume.current / 1e6).toFixed(0)}M
- Active Protocols: ${data.overview.protocolCount}

### Top Protocols by TVL
${data.overview.topProtocols.slice(0, 10).map((p) => `- ${p.name}: $${(p.tvl / 1e9).toFixed(2)}B (${p.change24h > 0 ? "+" : ""}${p.change24h.toFixed(1)}%)`).join("\n")}

### Top Tokens by Volume
${data.tokens.slice(0, 10).map((t) => `- ${t.symbol}: $${t.price.toFixed(4)} (${t.priceChange24h > 0 ? "+" : ""}${t.priceChange24h.toFixed(1)}%) Vol: $${(t.volume24h / 1e6).toFixed(1)}M`).join("\n")}

### Recent Whale Activity
${data.whales.slice(0, 5).map((w) => `- ${w.type}: ${w.value.toLocaleString()} ${w.tokenSymbol} (${w.from.slice(0, 8)}... → ${w.to.slice(0, 8)}...)`).join("\n")}

## Task
Generate 3-5 market insights. For EACH, provide:
- category: TREND | RISK | WHALE_ALERT | MARKET_INSIGHT
- title: concise headline (max 80 chars)
- summary: brief (max 200 chars, stored on-chain)
- fullAnalysis: detailed 2-3 paragraphs
- sentimentScore: -100 (very bearish) to 100 (very bullish)
- confidence: 0-100
- dataPoints: list specific data referenced

Respond with JSON: { "insights": [...] }`;
}
```

**Commit:** `feat: add AI prompts and Zod validation schema`

---

## Task 15: AI Analyzer Orchestrator

**Files:**
- Create: `src/lib/ai/analyzer.ts`
- Create: `test/lib/analyzer.test.ts`

**Step 1: Write tests** — Mock Gemini API, mock contract write, verify: prompt built correctly, Gemini called, response parsed, hash computed, stored on-chain, saved to file.

**Step 2: Implement analyzer**

```ts
// src/lib/ai/analyzer.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ethers } from "ethers";
import { buildAnalysisPrompt } from "./prompts";
import { analysisResponseSchema, InsightOutput } from "./schema";
import { getWriteContract } from "@/lib/blockchain/contract";
import { AIInsight } from "@/lib/types";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const INSIGHTS_PATH = path.join(process.cwd(), "data", "insights.json");

export async function runAnalysis(marketData: {
  overview: any;
  tokens: any[];
  whales: any[];
}): Promise<{ insights: AIInsight[]; txHash: string }> {
  // 1. Build prompt
  const prompt = buildAnalysisPrompt(marketData);

  // 2. Call Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // 3. Parse and validate
  const parsed = analysisResponseSchema.parse(JSON.parse(text));

  // 4. Hash each insight and store on-chain
  const contract = getWriteContract();
  const categoryMap = { TREND: 0, RISK: 1, WHALE_ALERT: 2, MARKET_INSIGHT: 3 };

  const hashes: string[] = [];
  const categories: number[] = [];
  const sentiments: number[] = [];
  const summaries: string[] = [];

  const insights: AIInsight[] = parsed.insights.map((insight, i) => {
    const contentJson = JSON.stringify(insight);
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(contentJson));
    hashes.push(contentHash);
    categories.push(categoryMap[insight.category]);
    sentiments.push(insight.sentimentScore);
    summaries.push(insight.summary);

    return {
      id: `${Date.now()}-${i}`,
      ...insight,
      contentHash,
      createdAt: new Date().toISOString(),
    };
  });

  // 5. Batch store on-chain
  const tx = await contract.storePredictionBatch(hashes, categories, sentiments, summaries);
  const receipt = await tx.wait();

  // 6. Update insights with tx hash and prediction IDs
  const predictionCount = await contract.predictionCount();
  insights.forEach((insight, i) => {
    insight.txHash = receipt.hash;
    insight.predictionId = Number(predictionCount) - insights.length + i;
  });

  // 7. Save to file store
  const existing = loadInsights();
  const updated = [...insights, ...existing];
  saveInsights(updated);

  return { insights, txHash: receipt.hash };
}

function loadInsights(): AIInsight[] {
  if (!existsSync(INSIGHTS_PATH)) return [];
  return JSON.parse(readFileSync(INSIGHTS_PATH, "utf-8"));
}

function saveInsights(insights: AIInsight[]): void {
  const dir = path.dirname(INSIGHTS_PATH);
  if (!existsSync(dir)) {
    const { mkdirSync } = require("fs");
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(INSIGHTS_PATH, JSON.stringify(insights, null, 2));
}
```

**Step 3: Run tests — PASS**

**Commit:** `feat: add AI analyzer orchestrator with on-chain storage`

---

## Task 16: AI API Routes

**Files:**
- Create: `src/app/api/ai/analyze/route.ts`
- Create: `src/app/api/ai/insights/route.ts`
- Create: `src/app/api/cron/analyze/route.ts`

TDD for each: test auth (cron secret), test response shape, test pagination for insights.

**Commit:** `feat: add AI analyze and insights API routes`
