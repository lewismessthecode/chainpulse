import { NextResponse } from "next/server";
import { defiLlama } from "@/lib/data-sources/defillama";
import { cache } from "@/lib/cache";
import { CACHE_TTL } from "@/lib/constants";
import type { MarketOverview } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    const cached = cache.get<MarketOverview>("market-overview");
    if (cached) return NextResponse.json(cached);

    const [tvlHistory, protocols, volumes] = await Promise.all([
      defiLlama.getBscTvl(),
      defiLlama.getBscProtocols(10),
      defiLlama.getBscDexVolumes(),
    ]);

    const latest = tvlHistory[tvlHistory.length - 1];
    const previous = tvlHistory[tvlHistory.length - 2];
    const tvlChange = previous
      ? ((latest.tvl - previous.tvl) / previous.tvl) * 100
      : 0;

    const overview: MarketOverview = {
      tvl: {
        current: latest?.tvl ?? 0,
        change24h: tvlChange,
        history: tvlHistory.slice(-30).map((point) => ({
          date: new Date(point.date * 1000).toISOString().split("T")[0],
          value: point.tvl,
        })),
      },
      volume: {
        current: volumes.totalVolume,
        change24h: volumes.changeVolume1d,
        history: [],
      },
      protocolCount: protocols.length,
      topProtocols: protocols.map((protocol) => ({
        name: protocol.name,
        tvl: protocol.tvl,
        change24h: protocol.change24h,
        volume24h: 0,
        logo: protocol.logo,
      })),
    };

    cache.set("market-overview", overview, CACHE_TTL.MARKET_OVERVIEW);
    return NextResponse.json(overview);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch market overview" },
      { status: 500 },
    );
  }
}
