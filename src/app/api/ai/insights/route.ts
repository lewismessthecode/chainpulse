import { NextResponse } from "next/server";

import { loadInsights } from "@/lib/insights-store";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") ?? "10", 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, 100)
      : 10;
    const VALID_CATEGORIES = ["TREND", "RISK", "WHALE_ALERT", "MARKET_INSIGHT"];
    const category = searchParams.get("category");
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 },
      );
    }

    let insights = await loadInsights();

    if (category) {
      insights = insights.filter((insight) => insight.category === category);
    }

    const total = insights.length;
    const start = (page - 1) * limit;
    const paginated = insights.slice(start, start + limit);

    return NextResponse.json({
      insights: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
