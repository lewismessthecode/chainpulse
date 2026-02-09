import type { MarketOverview, TokenData, WhaleAlert } from "@/lib/types";

export function buildAnalysisPrompt(data: {
  overview: MarketOverview;
  tokens: TokenData[];
  whales: WhaleAlert[];
}): string {
  const tvlBillions = (data.overview.tvl.current / 1e9).toFixed(2);
  const tvlChange = data.overview.tvl.change24h;
  const tvlSign = tvlChange > 0 ? "+" : "";
  const volumeMillions = (data.overview.volume.current / 1e6).toFixed(0);

  const protocolLines = data.overview.topProtocols
    .slice(0, 10)
    .map((p) => {
      const sign = p.change24h > 0 ? "+" : "";
      return `- ${p.name}: $${(p.tvl / 1e9).toFixed(2)}B (${sign}${p.change24h.toFixed(1)}%)`;
    })
    .join("\n");

  const tokenLines = data.tokens
    .slice(0, 10)
    .map((t) => {
      const sign = t.priceChange24h > 0 ? "+" : "";
      return `- ${t.symbol}: $${t.price.toFixed(4)} (${sign}${t.priceChange24h.toFixed(1)}%) Vol: $${(t.volume24h / 1e6).toFixed(1)}M`;
    })
    .join("\n");

  const whaleLines = data.whales
    .slice(0, 5)
    .map(
      (w) =>
        `- ${w.type}: ${w.value.toLocaleString()} ${w.tokenSymbol} (${w.from.slice(0, 8)}... → ${w.to.slice(0, 8)}...)`,
    )
    .join("\n");

  return `You are ChainPulse, an autonomous AI market intelligence agent analyzing BNB Chain DeFi.

## Current BSC Market Data

### Overview
- Total Value Locked: $${tvlBillions}B (${tvlSign}${tvlChange.toFixed(1)}% 24h)
- DEX Volume 24h: $${volumeMillions}M
- Active Protocols: ${data.overview.protocolCount}

### Top Protocols by TVL
${protocolLines}

### Top Tokens by Volume
${tokenLines}

### Recent Whale Activity
${whaleLines}

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
