import { existsSync, readFileSync } from "node:fs";
import { NextResponse } from "next/server";
import path from "node:path";

import type { AIInsight } from "@/lib/types";

const INSIGHTS_PATH = path.join(process.cwd(), "data", "insights.json");

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const category = searchParams.get("category");

    let insights: AIInsight[] = [];

    if (existsSync(INSIGHTS_PATH)) {
      insights = JSON.parse(readFileSync(INSIGHTS_PATH, "utf-8"));
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
