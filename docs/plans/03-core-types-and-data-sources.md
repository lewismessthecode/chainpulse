# Tasks 5-8: Core Types & Data Source Clients

> **Status: Pending**
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 5: Core Types and Cache

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/cache.ts`
- Create: `src/lib/constants.ts`
- Create: `test/lib/cache.test.ts`

**Step 1: Write cache tests**

```ts
// test/lib/cache.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryCache } from "@/lib/cache";

describe("MemoryCache", () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should store and retrieve values", () => {
    cache.set("key", { data: "test" }, 60_000);
    expect(cache.get("key")).toEqual({ data: "test" });
  });

  it("should return undefined for missing keys", () => {
    expect(cache.get("missing")).toBeUndefined();
  });

  it("should expire values after TTL", () => {
    cache.set("key", "value", 5_000);
    vi.advanceTimersByTime(6_000);
    expect(cache.get("key")).toBeUndefined();
  });

  it("should not expire values within TTL", () => {
    cache.set("key", "value", 5_000);
    vi.advanceTimersByTime(4_000);
    expect(cache.get("key")).toBe("value");
  });

  it("should overwrite existing keys", () => {
    cache.set("key", "old", 60_000);
    cache.set("key", "new", 60_000);
    expect(cache.get("key")).toBe("new");
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx vitest run test/lib/cache.test.ts
```

Expected: FAIL — module not found.

**Step 3: Implement types, cache, constants**

```ts
// src/lib/types.ts
export interface MarketOverview {
  tvl: { current: number; change24h: number; history: TimeSeriesPoint[] };
  volume: { current: number; change24h: number; history: TimeSeriesPoint[] };
  protocolCount: number;
  topProtocols: Protocol[];
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface Protocol {
  name: string;
  tvl: number;
  change24h: number;
  volume24h: number;
  logo?: string;
}

export interface TokenData {
  name: string;
  symbol: string;
  address: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  sparkline?: number[];
}

export interface WhaleAlert {
  txHash: string;
  from: string;
  to: string;
  value: number;
  token: string;
  tokenSymbol: string;
  timestamp: number;
  type: "transfer" | "swap";
}

export interface AIInsight {
  id: string;
  category: "TREND" | "RISK" | "WHALE_ALERT" | "MARKET_INSIGHT";
  title: string;
  summary: string;
  fullAnalysis: string;
  sentimentScore: number;
  confidence: number;
  dataPoints: string[];
  predictionId?: number;
  txHash?: string;
  contentHash: string;
  createdAt: string;
}

export interface OnchainPrediction {
  id: number;
  contentHash: string;
  timestamp: number;
  category: number;
  sentimentScore: number;
  summary: string;
}
```

```ts
// src/lib/cache.ts
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

export const cache = new MemoryCache();
```

```ts
// src/lib/constants.ts
export const CACHE_TTL = {
  MARKET_OVERVIEW: 5 * 60 * 1000,   // 5 min
  TOKENS: 2 * 60 * 1000,            // 2 min
  WHALES: 60 * 1000,                // 1 min
  INSIGHTS: 2 * 60 * 1000,          // 2 min
} as const;

export const WHALE_MIN_VALUE_USD = 50_000;

export const BSC_CHAIN_IDS = {
  MAINNET: 56,
  TESTNET: 97,
} as const;
```

**Step 4: Run tests to verify they pass**

```bash
npx vitest run test/lib/cache.test.ts
```

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/cache.ts src/lib/constants.ts test/lib/cache.test.ts
git commit -m "feat: add core types, cache, and constants"
```

---

## Task 6: DeFiLlama Data Source Client

**Files:**
- Create: `src/lib/data-sources/defillama.ts`
- Create: `test/lib/defillama.test.ts`

**Step 1: Write failing tests**

```ts
// test/lib/defillama.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefiLlamaClient } from "@/lib/data-sources/defillama";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("DefiLlamaClient", () => {
  let client: DefiLlamaClient;

  beforeEach(() => {
    client = new DefiLlamaClient();
    mockFetch.mockReset();
  });

  it("should fetch BSC TVL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ date: 1707000000, tvl: 4820000000 }]),
    });

    const result = await client.getBscTvl();
    expect(result).toEqual([{ date: 1707000000, tvl: 4820000000 }]);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.llama.fi/v2/historicalChainTvl/BSC"
    );
  });

  it("should fetch BSC protocols", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { name: "PancakeSwap", chains: ["BSC"], tvl: 2100000000, change_1d: 1.8 },
          { name: "Uniswap", chains: ["Ethereum"], tvl: 5000000000, change_1d: 0.5 },
        ]),
    });

    const result = await client.getBscProtocols(10);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("PancakeSwap");
  });

  it("should fetch DEX volumes for BSC", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          totalVolume: 892000000,
          changeVolume1d: -1.2,
          protocols: [],
        }),
    });

    const result = await client.getBscDexVolumes();
    expect(result.totalVolume).toBe(892000000);
  });

  it("should throw on API errors", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(client.getBscTvl()).rejects.toThrow();
  });
});
```

**Step 2: Run to verify fail**

```bash
npx vitest run test/lib/defillama.test.ts
```

**Step 3: Implement DeFiLlama client**

```ts
// src/lib/data-sources/defillama.ts
const BASE_URL = "https://api.llama.fi";

export class DefiLlamaClient {
  private async fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(`DeFiLlama API error: ${res.status}`);
    return res.json() as Promise<T>;
  }

  async getBscTvl(): Promise<Array<{ date: number; tvl: number }>> {
    return this.fetchJson("/v2/historicalChainTvl/BSC");
  }

  async getBscProtocols(limit: number = 10) {
    const all = await this.fetchJson<Array<{
      name: string; chains: string[]; tvl: number;
      change_1d: number | null; logo?: string;
    }>>("/protocols");

    return all
      .filter((p) => p.chains.includes("BSC"))
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, limit)
      .map((p) => ({
        name: p.name,
        tvl: p.tvl,
        change24h: p.change_1d ?? 0,
        logo: p.logo,
      }));
  }

  async getBscDexVolumes() {
    return this.fetchJson<{
      totalVolume: number;
      changeVolume1d: number;
      protocols: Array<{ name: string; total24h: number }>;
    }>("/overview/dexs/BSC");
  }
}

export const defiLlama = new DefiLlamaClient();
```

**Step 4: Run tests**

```bash
npx vitest run test/lib/defillama.test.ts
```

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/lib/data-sources/defillama.ts test/lib/defillama.test.ts
git commit -m "feat: add DeFiLlama data source client with tests"
```

---

## Task 7: GeckoTerminal Data Source Client

**Files:**
- Create: `src/lib/data-sources/geckoterminal.ts`
- Create: `test/lib/geckoterminal.test.ts`

**Step 1: Write failing tests** (same pattern — mock fetch, test response parsing, test rate limit queue, test error handling)

**Step 2: Run to verify fail**

**Step 3: Implement** — Base URL `https://api.geckoterminal.com/api/v2`, add request queue (max 30/min), methods: `getTrendingPools()`, `getTopPools(sort, limit)`, `getTokenInfo(address)`.

**Step 4: Run tests — ALL PASS**

**Step 5: Commit**

```bash
git commit -m "feat: add GeckoTerminal data source client with rate limiting"
```

---

## Task 8: BscScan Data Source Client

**Files:**
- Create: `src/lib/data-sources/bscscan.ts`
- Create: `test/lib/bscscan.test.ts`

Same TDD pattern. Methods: `getTransactions(address, limit)`, `getTokenTransfers(address, limit)`, `getBnbPrice()`. Rate limit: 5 req/sec queue.

**Commit:** `feat: add BscScan data source client`
