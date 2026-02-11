import { NextResponse } from "next/server";
import { getReadContract } from "@/lib/blockchain/contract";
import type { OnchainPrediction } from "@/lib/types";

const CATEGORY_NAMES = ["TREND", "RISK", "WHALE_ALERT", "MARKET_INSIGHT"];

interface RawPrediction {
  contentHash: string;
  timestamp: bigint;
  category: bigint;
  sentimentScore: bigint;
  summary: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`RPC timeout after ${ms}ms`)), ms),
    ),
  ]);
}

export async function GET(): Promise<NextResponse> {
  try {
    const contract = getReadContract();
    const count = await withTimeout(contract.predictionCount(), 8_000);
    const limit = Math.min(Number(count), 20);

    if (limit === 0) {
      return NextResponse.json({ predictions: [], total: 0 });
    }

    const raw: RawPrediction[] = await withTimeout(
      contract.getLatestPredictions(limit),
      8_000,
    );

    const predictions: OnchainPrediction[] = raw.map(
      (p: RawPrediction, i: number) => ({
        id: Number(count) - limit + i,
        contentHash: p.contentHash,
        timestamp: Number(p.timestamp),
        category: Number(p.category),
        categoryName: CATEGORY_NAMES[Number(p.category)] || "UNKNOWN",
        sentimentScore: Number(p.sentimentScore),
        summary: p.summary,
      }),
    );

    return NextResponse.json({ predictions, total: Number(count) });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 },
    );
  }
}
