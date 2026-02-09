import { NextResponse } from "next/server";

import { runAnalysis } from "@/lib/ai/analyzer";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== process.env.CRON_SECRET) {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
