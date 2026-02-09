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

export async function GET(): Promise<NextResponse> {
  try {
    const contract = getReadContract();
    const count = await contract.predictionCount();
    const limit = Math.min(Number(count), 20);

    if (limit === 0) {
      return NextResponse.json({ predictions: [], total: 0 });
    }

    const raw: RawPrediction[] = await contract.getLatestPredictions(limit);

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
