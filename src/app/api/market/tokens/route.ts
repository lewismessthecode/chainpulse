import { NextResponse } from "next/server";
import { geckoTerminal } from "@/lib/data-sources/geckoterminal";
import { cache } from "@/lib/cache";
import { CACHE_TTL } from "@/lib/constants";
import type { TokenData } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    const cached = cache.get<TokenData[]>("market-tokens");
    if (cached) return NextResponse.json(cached);

    const pools = await geckoTerminal.getTopPools("h24_volume_usd_desc", 20);

    const sparklines = await Promise.all(
      pools.slice(0, 10).map((pool) =>
        geckoTerminal.getPoolOhlcv(pool.id.replace("bsc_", ""))
      )
    );

    const tokens: TokenData[] = pools.map((pool, i) => ({
      name: pool.name,
      symbol: pool.name.split("/")[0],
      address: pool.id.replace("bsc_", ""),
      price: pool.price,
      priceChange24h: pool.priceChange24h,
      volume24h: pool.volume24h,
      liquidity: pool.liquidity,
      sparkline: i < 10 ? sparklines[i] : undefined,
    }));

    cache.set("market-tokens", tokens, CACHE_TTL.TOKENS);
    return NextResponse.json(tokens);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 },
    );
  }
}
