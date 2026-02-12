import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/chain/verify": { max: 20, windowMs: 60_000 },
  "/api/ai/analyze": { max: 5, windowMs: 60_000 },
  "/api/cron/analyze": { max: 5, windowMs: 60_000 },
};

const DEFAULT_LIMIT = { max: 60, windowMs: 60_000 };

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

let lastCleanup = Date.now();

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const now = Date.now();
  if (now - lastCleanup > 60_000) {
    cleanup();
    lastCleanup = now;
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const routePath = request.nextUrl.pathname;
  const { max, windowMs } = LIMITS[routePath] ?? DEFAULT_LIMIT;

  const key = `${ip}:${routePath}`;
  const entry = store.get(key);

  if (entry && now < entry.resetAt) {
    if (entry.count >= max) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          },
        },
      );
    }
    entry.count++;
  } else {
    store.set(key, { count: 1, resetAt: now + windowMs });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
