import { describe, it, expect } from "vitest";
import { buildAnalysisPrompt } from "@/lib/ai/prompts";
import type { MarketOverview, TokenData, WhaleAlert } from "@/lib/types";

describe("buildAnalysisPrompt", () => {
  const overview: MarketOverview = {
    tvl: { current: 4_820_000_000, change24h: 2.5, history: [] },
    volume: { current: 892_000_000, change24h: -1.2, history: [] },
    protocolCount: 580,
    topProtocols: [
      { name: "PancakeSwap", tvl: 2_100_000_000, change24h: 1.8, volume24h: 500_000_000 },
      { name: "Venus", tvl: 1_200_000_000, change24h: -0.5, volume24h: 200_000_000 },
    ],
  };

  const tokens: TokenData[] = [
    {
      name: "BNB",
      symbol: "BNB",
      address: "0x0",
      price: 315.42,
      priceChange24h: 3.2,
      volume24h: 125_000_000,
      liquidity: 500_000_000,
    },
  ];

  const whales: WhaleAlert[] = [
    {
      txHash: "0xabc123",
      from: "0x1234567890abcdef",
      to: "0xfedcba0987654321",
      value: 50000,
      token: "0x0",
      tokenSymbol: "BNB",
      timestamp: Date.now(),
      type: "transfer",
    },
  ];

  it("should include market overview data", () => {
    const prompt = buildAnalysisPrompt({ overview, tokens, whales });
    expect(prompt).toContain("4.82");
    expect(prompt).toContain("+2.5");
    expect(prompt).toContain("892");
    expect(prompt).toContain("580");
  });

  it("should include top protocols", () => {
    const prompt = buildAnalysisPrompt({ overview, tokens, whales });
    expect(prompt).toContain("PancakeSwap");
    expect(prompt).toContain("Venus");
  });

  it("should include token data", () => {
    const prompt = buildAnalysisPrompt({ overview, tokens, whales });
    expect(prompt).toContain("BNB");
    expect(prompt).toContain("315.42");
  });

  it("should include whale activity", () => {
    const prompt = buildAnalysisPrompt({ overview, tokens, whales });
    expect(prompt).toContain("transfer");
    expect(prompt).toContain("50,000");
  });

  it("should include JSON response instructions", () => {
    const prompt = buildAnalysisPrompt({ overview, tokens, whales });
    expect(prompt).toContain("Respond with JSON");
    expect(prompt).toContain('"insights"');
  });
});
