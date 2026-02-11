# ChainPulse Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI-powered onchain market intelligence dashboard for BNB Chain DeFi that stores prediction hashes on-chain for verifiable accountability.

**Architecture:** Next.js 14 App Router frontend fetches BSC market data from DeFiLlama/GeckoTerminal/BscScan, feeds it to Gemini AI for analysis, stores prediction hashes on a Solidity contract on BSC, and displays everything in a distinctive "Obsidian Terminal" dark dashboard. SWR for client state, JSON file store server-side, no database.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Ethers.js v6, Hardhat, Solidity, Google Gemini API, Vitest, Playwright

---

## Reference: Design System ("Obsidian Terminal")

> Keep this section as reference. Do NOT skip it — every component must follow these specs.

### Colors (CSS Variables for `globals.css`)

```css
:root {
  --bg-void: #000000;
  --bg-surface: #0A0A0A;
  --bg-elevated: #111111;
  --bg-overlay: #141414;
  --border-subtle: #1A1A1A;
  --border-muted: #252525;
  --border-active: #E2A336;
  --text-primary: #E8E4DD;
  --text-secondary: #8A8580;
  --text-muted: #4A4744;
  --amber: #E2A336;
  --amber-dim: #C48A20;
  --amber-glow: rgba(226, 163, 54, 0.15);
  --amber-faint: rgba(226, 163, 54, 0.06);
  --positive: #34D399;
  --positive-dim: rgba(52, 211, 153, 0.12);
  --negative: #F87171;
  --negative-dim: rgba(248, 113, 113, 0.12);
  --chart-line: #E2A336;
  --chart-fill: rgba(226, 163, 54, 0.08);
  --chart-grid: #1A1A1A;
}
```

### Typography

| Role | Font | Usage |
|------|------|-------|
| Display | `Instrument Serif`, Georgia, serif | Page titles, section headers, insight titles |
| Data | `JetBrains Mono`, monospace | Prices, hashes, tx IDs, all numbers |
| Body | `Plus Jakarta Sans`, system-ui | Labels, descriptions, buttons, nav |

### Rules

- Border-radius: **always 0** (sharp corners everywhere)
- Cards: `bg-surface border border-[#1A1A1A] hover:border-amber transition-colors duration-150`
- Labels: 11px uppercase `letter-spacing: 0.08em` color `text-muted`
- Stats: 48px JetBrains Mono `tabular-nums`
- Tables: horizontal dividers only, no zebra, no vertical borders
- Animations: ease-out only. NO bounce/spring/elastic.
- Signature: animated SVG "pulse line" (ECG heartbeat) in amber on insight cards

### Tailwind Config Additions

```ts
colors: {
  void: '#000000', surface: '#0A0A0A', elevated: '#111111',
  amber: { DEFAULT: '#E2A336', dim: '#C48A20' },
  warm: { white: '#E8E4DD', gray: '#8A8580', muted: '#4A4744' },
},
fontFamily: {
  display: ['Instrument Serif', 'Georgia', 'serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
},
```

---

## Reference: Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_BSC_CHAIN_ID=97
NEXT_PUBLIC_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
AGENT_PRIVATE_KEY=0x...
DEPLOYER_PRIVATE_KEY=0x...
BSCSCAN_API_KEY=...
GEMINI_API_KEY=...
CRON_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `hardhat.config.ts`, `vitest.config.ts`
- Create: `.env.example`, `.gitignore`

**Step 1: Initialize Next.js project**

```bash
cd /Users/lewisliu/Dev/playground/good-vibes-only
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Expected: Project created with `src/app/` structure.

**Step 2: Install all dependencies**

```bash
npm install ethers@^6.11.0 swr@^2.2.0 recharts@^2.12.0 framer-motion@^11.0.0 @google/generative-ai zod date-fns lucide-react class-variance-authority clsx tailwind-merge
npm install -D hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test prettier
```

**Step 3: Initialize Hardhat alongside Next.js**

```bash
npx hardhat init
```

Select "Create a TypeScript project". When it asks about the project root, accept defaults. If it conflicts with existing tsconfig, we'll fix in next step.

**Step 4: Configure `hardhat.config.ts`**

```ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    bscMainnet: {
      url: "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
    },
  },
};

export default config;
```

**Step 5: Configure `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

**Step 6: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables: yes. Then override `--radius` to `0` in globals.css.

Install core components:

```bash
npx shadcn@latest add button card badge table tabs skeleton tooltip sheet dialog
```

**Step 7: Set up design system in `globals.css`**

Replace the shadcn defaults with the full Obsidian Terminal color palette (see Reference section above). Set all `--radius` values to `0rem`. Import Google Fonts in `layout.tsx`.

**Step 8: Configure Tailwind config**

Add custom colors, fontFamily, and borderRadius from the Reference section.

**Step 9: Create `.env.example`**

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_BSC_CHAIN_ID=97
NEXT_PUBLIC_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
AGENT_PRIVATE_KEY=
DEPLOYER_PRIVATE_KEY=
BSCSCAN_API_KEY=
GEMINI_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 10: Verify scaffolding works**

```bash
npm run dev
npx hardhat compile
```

Expected: Next.js runs on localhost:3000. Hardhat compiles (no contracts yet, that's fine).

**Step 11: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Next.js 14 + Hardhat + shadcn/ui + design system"
```

---

## Task 2: Smart Contract — Write Failing Tests

**Files:**
- Create: `contracts/ChainPulseOracle.sol` (empty placeholder)
- Create: `test/contracts/ChainPulseOracle.test.ts`

**Step 1: Create empty contract placeholder**

```solidity
// contracts/ChainPulseOracle.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChainPulseOracle {}
```

**Step 2: Write the failing tests**

```ts
// test/contracts/ChainPulseOracle.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainPulseOracle } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ChainPulseOracle", function () {
  let oracle: ChainPulseOracle;
  let owner: SignerWithAddress;
  let agent: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  beforeEach(async function () {
    [owner, agent, unauthorized] = await ethers.getSigners();
    const Oracle = await ethers.getContractFactory("ChainPulseOracle");
    oracle = await Oracle.deploy(agent.address);
    await oracle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set correct owner", async function () {
      expect(await oracle.owner()).to.equal(owner.address);
    });

    it("should set correct agent address", async function () {
      expect(await oracle.agentAddress()).to.equal(agent.address);
    });
  });

  describe("storePrediction", function () {
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test prediction content"));
    const category = 0; // TREND
    const sentiment = 50;
    const summary = "BSC TVL rising steadily";

    it("should store prediction from agent and emit event", async function () {
      const tx = await oracle.connect(agent).storePrediction(
        contentHash, category, sentiment, summary
      );
      const receipt = await tx.wait();

      expect(await oracle.predictionCount()).to.equal(1);

      const prediction = await oracle.getPrediction(0);
      expect(prediction.contentHash).to.equal(contentHash);
      expect(prediction.category).to.equal(category);
      expect(prediction.sentimentScore).to.equal(sentiment);
      expect(prediction.summary).to.equal(summary);
    });

    it("should store prediction from owner", async function () {
      await oracle.connect(owner).storePrediction(
        contentHash, category, sentiment, summary
      );
      expect(await oracle.predictionCount()).to.equal(1);
    });

    it("should reject from unauthorized address", async function () {
      await expect(
        oracle.connect(unauthorized).storePrediction(
          contentHash, category, sentiment, summary
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject sentiment score out of range", async function () {
      await expect(
        oracle.connect(agent).storePrediction(contentHash, category, 101, summary)
      ).to.be.revertedWith("Score out of range");

      await expect(
        oracle.connect(agent).storePrediction(contentHash, category, -101, summary)
      ).to.be.revertedWith("Score out of range");
    });

    it("should reject summary over 200 chars", async function () {
      const longSummary = "x".repeat(201);
      await expect(
        oracle.connect(agent).storePrediction(contentHash, category, sentiment, longSummary)
      ).to.be.revertedWith("Summary too long");
    });
  });

  describe("storePredictionBatch", function () {
    it("should store multiple predictions in one tx", async function () {
      const hashes = [
        ethers.keccak256(ethers.toUtf8Bytes("pred1")),
        ethers.keccak256(ethers.toUtf8Bytes("pred2")),
      ];
      const categories = [0, 1];
      const sentiments = [60, -30];
      const summaries = ["Bull trend", "Risk alert"];

      await oracle.connect(agent).storePredictionBatch(
        hashes, categories, sentiments, summaries
      );

      expect(await oracle.predictionCount()).to.equal(2);
    });

    it("should reject mismatched array lengths", async function () {
      await expect(
        oracle.connect(agent).storePredictionBatch(
          [ethers.keccak256(ethers.toUtf8Bytes("a"))],
          [0, 1], // mismatched
          [50],
          ["test"]
        )
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("verifyPrediction", function () {
    it("should return true for matching content", async function () {
      const content = "test prediction content";
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes(content));

      await oracle.connect(agent).storePrediction(contentHash, 0, 50, "test");

      expect(await oracle.verifyPrediction(0, content)).to.be.true;
    });

    it("should return false for non-matching content", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("original"));
      await oracle.connect(agent).storePrediction(contentHash, 0, 50, "test");

      expect(await oracle.verifyPrediction(0, "tampered")).to.be.false;
    });
  });

  describe("getLatestPredictions", function () {
    it("should return latest N predictions in reverse order", async function () {
      for (let i = 0; i < 5; i++) {
        await oracle.connect(agent).storePrediction(
          ethers.keccak256(ethers.toUtf8Bytes(`pred${i}`)),
          0, i * 10, `Summary ${i}`
        );
      }

      const latest = await oracle.getLatestPredictions(3);
      expect(latest.length).to.equal(3);
      expect(latest[0].summary).to.equal("Summary 4");
      expect(latest[2].summary).to.equal("Summary 2");
    });
  });

  describe("setAgentAddress", function () {
    it("should update agent address from owner", async function () {
      await oracle.connect(owner).setAgentAddress(unauthorized.address);
      expect(await oracle.agentAddress()).to.equal(unauthorized.address);
    });

    it("should reject from non-owner", async function () {
      await expect(
        oracle.connect(agent).setAgentAddress(unauthorized.address)
      ).to.be.reverted;
    });
  });
});
```

**Step 3: Run tests to verify they fail**

```bash
npx hardhat test
```

Expected: FAIL — contract has no functions yet.

**Step 4: Commit failing tests**

```bash
git add test/contracts/ChainPulseOracle.test.ts contracts/ChainPulseOracle.sol
git commit -m "test: add ChainPulseOracle contract tests (red)"
```

---

## Task 3: Smart Contract — Implement to Pass

**Files:**
- Modify: `contracts/ChainPulseOracle.sol`

**Step 1: Implement the full contract**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ChainPulseOracle is Ownable {
    enum PredictionCategory { TREND, RISK, WHALE_ALERT, MARKET_INSIGHT }

    struct Prediction {
        bytes32 contentHash;
        uint256 timestamp;
        PredictionCategory category;
        int8 sentimentScore;
        string summary;
    }

    uint256 public predictionCount;
    mapping(uint256 => Prediction) public predictions;
    address public agentAddress;

    event PredictionStored(
        uint256 indexed predictionId,
        bytes32 indexed contentHash,
        PredictionCategory category,
        int8 sentimentScore,
        uint256 timestamp,
        string summary
    );

    event AgentAddressUpdated(address indexed oldAgent, address indexed newAgent);

    modifier onlyAgent() {
        require(msg.sender == agentAddress || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address _agentAddress) Ownable(msg.sender) {
        agentAddress = _agentAddress;
    }

    function storePrediction(
        bytes32 _contentHash,
        PredictionCategory _category,
        int8 _sentimentScore,
        string calldata _summary
    ) external onlyAgent returns (uint256) {
        require(_sentimentScore >= -100 && _sentimentScore <= 100, "Score out of range");
        require(bytes(_summary).length <= 200, "Summary too long");

        uint256 predictionId = predictionCount;
        predictions[predictionId] = Prediction({
            contentHash: _contentHash,
            timestamp: block.timestamp,
            category: _category,
            sentimentScore: _sentimentScore,
            summary: _summary
        });

        emit PredictionStored(predictionId, _contentHash, _category, _sentimentScore, block.timestamp, _summary);
        predictionCount++;
        return predictionId;
    }

    function storePredictionBatch(
        bytes32[] calldata _contentHashes,
        PredictionCategory[] calldata _categories,
        int8[] calldata _sentimentScores,
        string[] calldata _summaries
    ) external onlyAgent {
        require(
            _contentHashes.length == _categories.length &&
            _categories.length == _sentimentScores.length &&
            _sentimentScores.length == _summaries.length,
            "Array length mismatch"
        );
        for (uint256 i = 0; i < _contentHashes.length; i++) {
            uint256 predictionId = predictionCount;
            predictions[predictionId] = Prediction({
                contentHash: _contentHashes[i],
                timestamp: block.timestamp,
                category: _categories[i],
                sentimentScore: _sentimentScores[i],
                summary: _summaries[i]
            });
            emit PredictionStored(predictionId, _contentHashes[i], _categories[i], _sentimentScores[i], block.timestamp, _summaries[i]);
            predictionCount++;
        }
    }

    function verifyPrediction(uint256 _predictionId, string calldata _content) external view returns (bool) {
        require(_predictionId < predictionCount, "Prediction does not exist");
        return predictions[_predictionId].contentHash == keccak256(abi.encodePacked(_content));
    }

    function getPrediction(uint256 _predictionId) external view returns (Prediction memory) {
        require(_predictionId < predictionCount, "Prediction does not exist");
        return predictions[_predictionId];
    }

    function getLatestPredictions(uint256 _count) external view returns (Prediction[] memory) {
        uint256 count = _count > predictionCount ? predictionCount : _count;
        Prediction[] memory result = new Prediction[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = predictions[predictionCount - 1 - i];
        }
        return result;
    }

    function setAgentAddress(address _newAgent) external onlyOwner {
        address old = agentAddress;
        agentAddress = _newAgent;
        emit AgentAddressUpdated(old, _newAgent);
    }
}
```

**Step 2: Run tests to verify they pass**

```bash
npx hardhat test
```

Expected: ALL PASS (13 tests).

**Step 3: Commit**

```bash
git add contracts/ChainPulseOracle.sol
git commit -m "feat: implement ChainPulseOracle contract (green)"
```

---

## Task 4: Deploy Contract to BSC Testnet

**Files:**
- Create: `scripts/deploy.ts`

**Step 1: Write deploy script**

```ts
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const agentAddress = process.env.AGENT_WALLET_ADDRESS || deployer.address;
  const Oracle = await ethers.getContractFactory("ChainPulseOracle");
  const oracle = await Oracle.deploy(agentAddress);
  await oracle.waitForDeployment();

  const address = await oracle.getAddress();
  console.log("ChainPulseOracle deployed to:", address);
  console.log("Agent address:", agentAddress);
  console.log("\nUpdate .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

**Step 2: Get testnet BNB from faucet**

Visit https://www.bnbchain.org/en/testnet-faucet and request tBNB for your deployer wallet.

**Step 3: Deploy to testnet**

```bash
npx hardhat run scripts/deploy.ts --network bscTestnet
```

Expected: Contract address printed. Copy to `.env.local`.

**Step 4: Verify on BscScan**

```bash
npx hardhat verify --network bscTestnet DEPLOYED_ADDRESS "AGENT_ADDRESS"
```

**Step 5: Commit**

```bash
git add scripts/deploy.ts
git commit -m "feat: add deploy script, deploy to BSC testnet"
```

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

---

## Task 17: Layout Shell (Sidebar + Header)

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/shared/live-indicator.tsx`

**Step 1: Implement layout.tsx** with Google Fonts (Instrument Serif, JetBrains Mono, Plus Jakarta Sans), dark body class, sidebar + main content area.

**Step 2: Implement sidebar** — 56px fixed left, Lucide icons (LayoutDashboard, Brain, Coins, Fish, History), amber active state, pulsing live indicator at bottom.

**Step 3: Implement header** — Instrument Serif page title, date display, live indicator.

**Step 4: Run dev server and visual check**

```bash
npm run dev
```

Expected: Black background, sidebar with amber accents, correct fonts loading.

**Commit:** `feat: add layout shell with Obsidian Terminal design system`

---

## Task 18: Dashboard Page — Stats Cards + Charts

**Files:**
- Create: `src/components/dashboard/stats-card.tsx`
- Create: `src/components/shared/animated-number.tsx`
- Create: `src/components/dashboard/tvl-chart.tsx`
- Create: `src/components/dashboard/volume-chart.tsx`
- Create: `src/hooks/use-market-data.ts`
- Modify: `src/app/page.tsx`

**Step 1: Write component tests**

```ts
// test/components/stats-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "@/components/dashboard/stats-card";

describe("StatsCard", () => {
  it("renders label and value", () => {
    render(<StatsCard label="TOTAL VALUE LOCKED" value={4820000000} prefix="$" change={2.4} />);
    expect(screen.getByText("TOTAL VALUE LOCKED")).toBeInTheDocument();
  });

  it("shows positive change in green", () => {
    render(<StatsCard label="TVL" value={100} change={2.4} />);
    const change = screen.getByText(/2.4%/);
    expect(change.className).toContain("text-[#34D399]");
  });

  it("shows negative change in red", () => {
    render(<StatsCard label="TVL" value={100} change={-1.2} />);
    const change = screen.getByText(/1.2%/);
    expect(change.className).toContain("text-[#F87171]");
  });
});
```

**Step 2: Run to fail, implement components, run to pass**

**Step 3: Wire up dashboard page** with SWR hook calling `/api/market/overview`. Four stats cards at top, TVL area chart + volume bar chart below, using Recharts with amber styling.

**Step 4: Visual check** — `npm run dev`, verify amber charts, sharp corners, correct fonts.

**Commit:** `feat: add dashboard page with stats cards and charts`

---

## Task 19: Dashboard Page — Protocol Table

**Files:**
- Create: `src/components/dashboard/protocol-table.tsx`

TDD: Test renders rows, test sorts by column. Implement with sharp borders, monospace numbers, horizontal dividers only.

**Commit:** `feat: add protocol table to dashboard`

---

## Task 20: AI Insights Page

**Files:**
- Create: `src/components/insights/pulse-line.tsx`
- Create: `src/components/insights/sentiment-badge.tsx`
- Create: `src/components/insights/onchain-proof.tsx`
- Create: `src/components/insights/insight-card.tsx`
- Create: `src/components/insights/insight-feed.tsx`
- Create: `src/hooks/use-insights.ts`
- Create: `src/app/insights/page.tsx`

**Step 1: Write tests** for pulse-line (renders SVG), sentiment-badge (color by value), onchain-proof (truncated hash, BscScan link), insight-card (all sections render), insight-feed (multiple cards, category filter).

**Step 2: Implement components** following design system — pulse line SVG with stroke-dasharray animation, amber proof badges, Instrument Serif titles.

**Step 3: Visual check**

**Commit:** `feat: add AI insights page with pulse line and on-chain proof`

---

## Task 21: Token Analytics Page

**Files:**
- Create: `src/components/tokens/sparkline.tsx`
- Create: `src/components/tokens/token-table.tsx`
- Create: `src/hooks/use-tokens.ts`
- Create: `src/app/tokens/page.tsx`

TDD: Table renders columns, sorts on click, sparkline renders SVG. Dense monospace data table with 80x24px amber sparklines inline.

**Commit:** `feat: add token analytics page with sortable table and sparklines`

---

## Task 22: Whale Monitor Page

**Files:**
- Create: `src/components/whales/whale-card.tsx`
- Create: `src/components/whales/whale-feed.tsx`
- Create: `src/components/whales/activity-chart.tsx`
- Create: `src/hooks/use-whale-alerts.ts`
- Create: `src/app/whales/page.tsx`

TDD: Card renders amount/addresses, feed orders reverse-chronological. Framer Motion slide-in from right with amber flash for new alerts.

**Commit:** `feat: add whale monitor page with alert feed`

---

## Task 23: Predictions Page

**Files:**
- Create: `src/components/predictions/prediction-table.tsx`
- Create: `src/components/predictions/verify-modal.tsx`
- Create: `src/hooks/use-predictions.ts`
- Create: `src/app/predictions/page.tsx`

TDD: Table renders prediction rows with BscScan links. Verify modal computes keccak256 client-side and shows match/mismatch.

**Commit:** `feat: add predictions page with on-chain verification`

---

## Task 24: Visual Polish + Responsive

**Files:**
- Modify: multiple component files
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/components/shared/loading-skeleton.tsx`

**Step 1:** Add staggered fade-in-up page load animations (framer-motion `motion.div` with `delay` prop)

**Step 2:** Add noise texture overlay to cards via CSS `::before` pseudo-element

**Step 3:** Ensure all numbers use `font-variant-numeric: tabular-nums`

**Step 4:** Build mobile bottom tab bar, test at 375px width

**Step 5:** Add loading skeletons for all data-fetching components

**Step 6:** Create `public/favicon.svg` (amber pulse line icon)

**Step 7:** Add OpenGraph meta tags to `layout.tsx`

**Commit:** `feat: add visual polish, animations, and responsive design`

---

## Task 25: E2E Tests

**Files:**
- Create: `test/e2e/critical-path.spec.ts`
- Create: `playwright.config.ts`

**Step 1: Configure Playwright**

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true },
});
```

**Step 2: Write E2E tests**

```ts
// test/e2e/critical-path.spec.ts
import { test, expect } from "@playwright/test";

test("dashboard loads and shows market data", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=TOTAL VALUE LOCKED")).toBeVisible();
  await expect(page.locator("text=24H VOLUME")).toBeVisible();
});

test("navigate to insights page", async ({ page }) => {
  await page.goto("/insights");
  await expect(page.locator("h1")).toContainText("Insights");
});

test("navigate to tokens page", async ({ page }) => {
  await page.goto("/tokens");
  await expect(page.locator("table")).toBeVisible();
});

test("navigate to whales page", async ({ page }) => {
  await page.goto("/whales");
  await expect(page.locator("h1")).toContainText("Whale");
});

test("mobile viewport shows bottom nav", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar"]')).toBeHidden();
});
```

**Step 3: Run E2E**

```bash
npx playwright test
```

**Commit:** `test: add Playwright E2E tests for critical paths`

---

## Task 26: Deploy to BSC Mainnet

**Step 1:** Get BNB for mainnet (Binance CEX → BSC wallet, ~$5-10)

**Step 2:** Deploy contract

```bash
npx hardhat run scripts/deploy.ts --network bscMainnet
```

**Step 3:** Verify on BscScan

```bash
npx hardhat verify --network bscMainnet DEPLOYED_ADDRESS "AGENT_ADDRESS"
```

**Step 4:** Update `.env.local` with mainnet values (chain ID 56, mainnet RPC, mainnet contract)

**Step 5:** Seed data — trigger 3-5 analysis cycles

```bash
curl -X POST http://localhost:3000/api/ai/analyze -H "Authorization: Bearer $CRON_SECRET"
```

**Step 6:** Verify predictions on BscScan

**Commit:** `feat: deploy to BSC mainnet and seed predictions`

---

## Task 27: Deploy Frontend to Vercel

**Step 1:** Push to GitHub

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

**Step 2:** Connect to Vercel, set environment variables (all from `.env.local` except `DEPLOYER_PRIVATE_KEY`)

**Step 3:** Configure Vercel cron in `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/analyze", "schedule": "0 */4 * * *" }]
}
```

**Step 4:** Production smoke test — all 5 pages load, data is fresh, proof badges link to mainnet BscScan

**Commit:** `chore: add Vercel cron config`

---

## Task 28: README + Submission

**Files:**
- Create: `README.md`

Write: project overview, architecture diagram, live demo link, contract addresses (testnet + mainnet), setup instructions, tech stack, screenshots, AI Build Log.

Record 2-3 minute demo video. Submit to DoraHacks. Post on X.

**Commit:** `docs: add README with setup instructions and architecture`

---

## Summary

| Task | Description | Tests | Day |
|------|-------------|-------|-----|
| 1 | Project scaffolding | - | 1 |
| 2-3 | Smart contract (test → implement) | 13 Hardhat | 1 |
| 4 | Deploy to BSC testnet | Manual verify | 1 |
| 5 | Core types + cache | 5 Vitest | 2 |
| 6 | DeFiLlama client | 4 Vitest | 2 |
| 7 | GeckoTerminal client | 4 Vitest | 2 |
| 8 | BscScan client | 4 Vitest | 2 |
| 9-11 | Market API routes (overview, tokens, whales) | 8 Vitest | 3 |
| 12-13 | Blockchain helpers + chain API routes | 5 Vitest | 3 |
| 14 | AI prompts + schema | 3 Vitest | 4 |
| 15 | AI analyzer orchestrator | 9 Vitest | 4 |
| 16 | AI API routes | 5 Vitest | 4 |
| 17 | Layout shell (sidebar + header) | Visual | 5 |
| 18 | Dashboard stats + charts | 3 Vitest | 5 |
| 19 | Dashboard protocol table | 2 Vitest | 5 |
| 20 | AI Insights page | 7 Vitest | 6 |
| 21 | Token Analytics page | 3 Vitest | 6 |
| 22 | Whale Monitor page | 3 Vitest | 7 |
| 23 | Predictions page | 2 Vitest | 7 |
| 24 | Visual polish + responsive | Visual | 8 |
| 25 | E2E tests | 5 Playwright | 8 |
| 26 | Deploy to BSC mainnet | Manual smoke | 9 |
| 27 | Deploy to Vercel | Manual smoke | 9 |
| 28 | README + submission | - | 10 |

**Total automated tests:** 13 Hardhat + ~60 Vitest + 5 Playwright = ~78 tests
