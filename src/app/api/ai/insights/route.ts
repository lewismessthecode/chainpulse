import { existsSync, readFileSync } from "node:fs";
import { NextResponse } from "next/server";
import path from "node:path";

import type { AIInsight } from "@/lib/types";

const TMP_PATH = path.join("/tmp", "insights.json");
const BUNDLED_PATH = path.join(process.cwd(), "data", "insights.json");

function getInsightsPath(): string {
  if (existsSync(TMP_PATH)) return TMP_PATH;
  return BUNDLED_PATH;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const category = searchParams.get("category");

    let insights: AIInsight[] = [];

    const insightsPath = getInsightsPath();
    if (existsSync(insightsPath)) {
      insights = JSON.parse(readFileSync(insightsPath, "utf-8"));
    }

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
