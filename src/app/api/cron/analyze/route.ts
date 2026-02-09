import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Cron analysis failed" }, { status: 500 });
  }
}
