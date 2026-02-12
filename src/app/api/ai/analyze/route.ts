import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { runAnalysis } from "@/lib/ai/analyzer";

function safeCompare(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || !safeCompare(token, cronSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json(
        { error: "APP_URL not configured" },
        { status: 500 },
      );
    }

    const responses = await Promise.all([
      fetch(`${appUrl}/api/market/overview`),
      fetch(`${appUrl}/api/market/tokens`),
      fetch(`${appUrl}/api/market/whales`),
    ]);

    for (const res of responses) {
      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to fetch market data for analysis" },
          { status: 502 },
        );
      }
    }

    const [overview, tokens, whales] = await Promise.all(
      responses.map((r) => r.json()),
    );

    const result = await runAnalysis({ overview, tokens, whales });

    return NextResponse.json({
      success: true,
      insightCount: result.insights.length,
      txHash: result.txHash,
    });
  } catch {
    return NextResponse.json(
      { error: "Analysis failed. Please try again later." },
      { status: 500 },
    );
  }
}
