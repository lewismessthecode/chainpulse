import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { runAnalysis } from "@/lib/ai/analyzer";

function safeCompare(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || !safeCompare(token, cronSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const [overviewRes, tokensRes, whalesRes] = await Promise.all([
      fetch(`${appUrl}/api/market/overview`),
      fetch(`${appUrl}/api/market/tokens`),
      fetch(`${appUrl}/api/market/whales`),
    ]);

    const [overview, tokens, whales] = await Promise.all([
      overviewRes.json(),
      tokensRes.json(),
      whalesRes.json(),
    ]);

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
