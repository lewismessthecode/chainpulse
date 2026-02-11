# Tasks 9-11: Market API Routes

> **Status: Pending**
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 9: Market Overview API Route

**Files:**
- Create: `src/app/api/market/overview/route.ts`
- Create: `test/api/market-overview.test.ts`

**Step 1: Write failing test**

```ts
// test/api/market-overview.test.ts
import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/market/overview/route";

vi.mock("@/lib/data-sources/defillama", () => ({
  defiLlama: {
    getBscTvl: vi.fn().mockResolvedValue([
      { date: 1707000000, tvl: 4820000000 },
    ]),
    getBscProtocols: vi.fn().mockResolvedValue([
      { name: "PancakeSwap", tvl: 2100000000, change24h: 1.8 },
    ]),
    getBscDexVolumes: vi.fn().mockResolvedValue({
      totalVolume: 892000000,
      changeVolume1d: -1.2,
    }),
  },
}));

describe("GET /api/market/overview", () => {
  it("should return market overview with correct shape", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("tvl");
    expect(data).toHaveProperty("volume");
    expect(data).toHaveProperty("topProtocols");
    expect(data.tvl).toHaveProperty("current");
    expect(data.tvl).toHaveProperty("history");
  });
});
```

**Step 2: Run to verify fail**

**Step 3: Implement route** — Fetch from defiLlama client, use cache, format response matching `MarketOverview` type.

**Step 4: Run tests — PASS**

**Step 5: Commit**

```bash
git commit -m "feat: add market overview API route"
```

---

## Task 10: Tokens API Route

Same TDD pattern as Task 9 but for `GET /api/market/tokens` using GeckoTerminal client.

**Commit:** `feat: add tokens API route`

---

## Task 11: Whales API Route

Same TDD pattern for `GET /api/market/whales` using BscScan client. Filter transactions above `WHALE_MIN_VALUE_USD`.

**Commit:** `feat: add whales API route`
