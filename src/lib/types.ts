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
  fromLabel: string | null;
  toLabel: string | null;
  usdValue: number | null;
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
  categoryName: string;
  sentimentScore: number;
  summary: string;
}
