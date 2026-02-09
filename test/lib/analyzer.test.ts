import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MarketOverview, TokenData, WhaleAlert } from "@/lib/types";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent };
    }
  },
}));

vi.mock("@/lib/blockchain/contract", () => ({
  getWriteContract: vi.fn(() => ({
    storePredictionBatch: vi.fn(() =>
      Promise.resolve({
        wait: () => Promise.resolve({ hash: "0xmocktxhash" }),
      })
    ),
    predictionCount: vi.fn(() => Promise.resolve(BigInt(5))),
  })),
}));

vi.mock("node:fs", () => {
  const mocks = {
    readFileSync: vi.fn(() => "[]"),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
  };
  return { ...mocks, default: mocks };
});

describe("runAnalysis", () => {
  const marketData: {
    overview: MarketOverview;
    tokens: TokenData[];
    whales: WhaleAlert[];
  } = {
    overview: {
      tvl: { current: 4_820_000_000, change24h: 2.5, history: [] },
      volume: { current: 892_000_000, change24h: -1.2, history: [] },
      protocolCount: 580,
      topProtocols: [],
    },
    tokens: [],
    whales: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return insights and transaction hash", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () =>
          JSON.stringify({
            insights: [
              {
                category: "TREND",
                title: "BNB Bullish",
                summary: "BNB shows upward momentum",
                fullAnalysis: "Detailed analysis of BNB trend...",
                sentimentScore: 75,
                confidence: 85,
                dataPoints: ["TVL up 2.5%"],
              },
            ],
          }),
      },
    });

    const { runAnalysis } = await import("@/lib/ai/analyzer");
    const result = await runAnalysis(marketData);

    expect(result.insights).toHaveLength(1);
    expect(result.insights[0].category).toBe("TREND");
    expect(result.insights[0].contentHash).toBeDefined();
    expect(result.txHash).toBe("0xmocktxhash");
  });

  it("should throw when AI returns invalid schema", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({ insights: [] }),
      },
    });

    const { runAnalysis } = await import("@/lib/ai/analyzer");
    await expect(runAnalysis(marketData)).rejects.toThrow();
  });
});
