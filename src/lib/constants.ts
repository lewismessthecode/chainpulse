export const CACHE_TTL = {
  MARKET_OVERVIEW: 5 * 60 * 1000,
  TOKENS: 2 * 60 * 1000,
  WHALES: 60 * 1000,
  INSIGHTS: 2 * 60 * 1000,
} as const;

export const WHALE_MIN_VALUE_USD = 50_000;

export const BSC_CHAIN_IDS = {
  MAINNET: 56,
  TESTNET: 97,
} as const;
