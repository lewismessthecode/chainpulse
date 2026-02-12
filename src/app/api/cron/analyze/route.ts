import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function safeCompare(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || !safeCompare(token, cronSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "APP_URL not configured" }, { status: 500 });
    }

    const res = await fetch(`${appUrl}/api/ai/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Cron analysis failed" }, { status: 500 });
  }
}
