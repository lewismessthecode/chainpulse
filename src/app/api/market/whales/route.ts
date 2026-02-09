import { NextResponse } from "next/server";
import { bscScan } from "@/lib/data-sources/bscscan";
import { cache } from "@/lib/cache";
import { CACHE_TTL, WHALE_MIN_VALUE_USD } from "@/lib/constants";
import type { WhaleAlert } from "@/lib/types";

const WATCHED_ADDRESSES = [
  "0x8894E0a0c962CB723c1853AE3ad79AC7a74ed908", // PancakeSwap deployer
  "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap Router
];

export async function GET(): Promise<NextResponse> {
  try {
    const cached = cache.get<WhaleAlert[]>("market-whales");
    if (cached) return NextResponse.json(cached);

    const transfersByAddress = await Promise.all(
      WATCHED_ADDRESSES.map((addr) => bscScan.getTokenTransfers(addr, 20)),
    );

    const whales: WhaleAlert[] = transfersByAddress
      .flat()
      .map((tx) => {
        const decimals = parseInt(tx.tokenDecimal, 10) || 18;
        const rawValue = parseFloat(tx.value) / Math.pow(10, decimals);

        return {
          txHash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: rawValue,
          token: tx.tokenName,
          tokenSymbol: tx.tokenSymbol,
          timestamp: parseInt(tx.timeStamp, 10),
          type: "transfer" as const,
        };
      })
      .filter((whale) => whale.value >= WHALE_MIN_VALUE_USD)
      .sort((a, b) => b.timestamp - a.timestamp);

    cache.set("market-whales", whales, CACHE_TTL.WHALES);
    return NextResponse.json(whales);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch whale alerts" },
      { status: 500 },
    );
  }
}
