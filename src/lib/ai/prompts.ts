import type { MarketOverview, TokenData, WhaleAlert } from "@/lib/types";

/**
 * Sanitize external string data before interpolation into AI prompts.
 * Strips control characters, braces (to prevent JSON injection), and
 * instruction-like patterns that could hijack the prompt.
 */
function sanitizeForPrompt(input: string, maxLength = 100): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/[{}[\]]/g, "")
    .replace(/\b(ignore|forget|disregard|override|system|instruction)\b/gi, "")
    .slice(0, maxLength)
    .trim();
}

export const SYSTEM_INSTRUCTION = `You are ChainPulse, an autonomous AI market intelligence agent specialized in BNB Chain (BSC) DeFi analysis.

## Your Role
- Analyze real-time BNB Chain DeFi data and produce actionable market intelligence
- Every insight you generate will be hashed (keccak256) and stored on-chain via ChainPulseOracle smart contract
- Your analysis must be data-driven, specific, and reference concrete metrics

## BNB Chain Context
- BNB Chain is the 3rd largest DeFi ecosystem by TVL (after Ethereum and Tron)
- Key protocols: PancakeSwap (dominant DEX), Venus (lending), Alpaca Finance, BiSwap
- BNB is the native gas token; BUSD was depegged, USDT/USDC are primary stablecoins
- BSC has 3-second block times and low gas fees (~$0.05 per tx)

## Scoring Calibration
- sentimentScore: -100 to 100
  - TVL drop >10% in 24h = -40 to -60
  - TVL drop 3-10% = -15 to -35
  - TVL flat (+/-3%) = -10 to +10
  - TVL growth 3-10% = +15 to +35
  - TVL growth >10% = +40 to +60
- confidence: 0 to 100
  - Multiple corroborating data points = 70-90
  - Single data point = 40-60
  - Speculative or extrapolated = 20-40`;

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
      const name = sanitizeForPrompt(p.name, 50);
      const sign = p.change24h > 0 ? "+" : "";
      return `- ${name}: $${(p.tvl / 1e9).toFixed(2)}B (${sign}${p.change24h.toFixed(1)}%)`;
    })
    .join("\n");

  const tokenLines = data.tokens
    .slice(0, 10)
    .map((t) => {
      const symbol = sanitizeForPrompt(t.symbol, 20);
      const sign = t.priceChange24h > 0 ? "+" : "";
      return `- ${symbol}: $${t.price.toFixed(4)} (${sign}${t.priceChange24h.toFixed(1)}%) Vol: $${(t.volume24h / 1e6).toFixed(1)}M`;
    })
    .join("\n");

  const whaleLines = data.whales
    .slice(0, 5)
    .map((w) => {
      const usd = w.usdValue != null ? `$${w.usdValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "unknown";
      const fromLabel = sanitizeForPrompt(w.fromLabel ?? `${w.from.slice(0, 8)}...`, 40);
      const toLabel = sanitizeForPrompt(w.toLabel ?? `${w.to.slice(0, 8)}...`, 40);
      const tokenSymbol = sanitizeForPrompt(w.tokenSymbol, 20);
      return `- ${sanitizeForPrompt(w.type, 20)}: ${usd} (${w.value.toLocaleString()} ${tokenSymbol}) from ${fromLabel} to ${toLabel}`;
    })
    .join("\n");

  return `## Current BSC Market Data

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
- fullAnalysis: detailed 2-3 paragraphs with specific numbers and context
- sentimentScore: -100 (very bearish) to 100 (very bullish), calibrated per the scoring guide
- confidence: 0-100, based on data corroboration
- dataPoints: list specific metrics referenced (e.g. "TVL: $4.2B", "PancakeSwap +3.2%")

## Example Output
{
  "insights": [
    {
      "category": "TREND",
      "title": "PancakeSwap TVL Surges 8% as DEX Volume Hits $180M",
      "summary": "PancakeSwap leads BSC recovery with 8% TVL growth and $180M daily volume, signaling renewed trader confidence.",
      "fullAnalysis": "PancakeSwap has seen a significant 8% increase in total value locked over the past 24 hours, bringing its TVL to $2.1B. This growth coincides with a surge in DEX volume to $180M, the highest level in two weeks.\\n\\nThe uptick appears driven by increased trading activity in BNB/USDT and CAKE/BNB pairs, with several large whale transactions observed moving funds into PancakeSwap liquidity pools. This pattern typically precedes sustained bullish momentum.\\n\\nHowever, traders should note that overall BSC TVL remains 15% below its 30-day high, suggesting this may be a localized protocol-level trend rather than a broad ecosystem recovery.",
      "sentimentScore": 35,
      "confidence": 75,
      "dataPoints": ["PancakeSwap TVL: $2.1B (+8%)", "DEX Volume: $180M", "BSC TVL: $4.2B"]
    }
  ]
}

Respond with JSON: { "insights": [...] }`;
}
