import { NextResponse } from "next/server";
import { getMoralisClient } from "@/lib/data-sources/moralis";
import { cache } from "@/lib/cache";
import { CACHE_TTL, WHALE_MIN_VALUE_USD } from "@/lib/constants";
import type { WhaleAlert } from "@/lib/types";

const MIN_SECURITY_SCORE = 50;

const WATCHED_ADDRESSES: { address: string; limit: number }[] = [
  { address: "0xF977814e90dA44bFA03b6295A0616a897441aceC", limit: 100 }, // Binance Hot Wallet 14
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", limit: 50 },  // Binance Hot Wallet 6
];

async function fetchPriceMap(tokenAddresses: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  const results = await Promise.all(
    tokenAddresses.map(async (addr) => {
      try {
        const price = await getMoralisClient().getTokenPrice(addr);
        return { addr, price };
      } catch {
        return { addr, price: 0 };
      }
    }),
  );
  for (const { addr, price } of results) {
    priceMap.set(addr.toLowerCase(), price);
  }
  return priceMap;
}

export async function GET(): Promise<NextResponse> {
  try {
    const cached = cache.get<WhaleAlert[]>("market-whales");
    if (cached) return NextResponse.json(cached);

    const transfersByAddress = await Promise.all(
      WATCHED_ADDRESSES.map(async ({ address, limit }) => {
        try {
          return await getMoralisClient().getTokenTransfers(address, limit);
        } catch {
          return [];
        }
      }),
    );

    const qualityTransfers = transfersByAddress
      .flat()
      .filter((tx) => !tx.possibleSpam && tx.securityScore >= MIN_SECURITY_SCORE);

    const uniqueTokens = [...new Set(qualityTransfers.map((tx) => tx.tokenAddress.toLowerCase()))];
    const priceMap = await fetchPriceMap(uniqueTokens);

    const whales: WhaleAlert[] = qualityTransfers
      .map((tx) => {
        const price = priceMap.get(tx.tokenAddress.toLowerCase()) ?? 0;
        const usdValue = tx.valueDecimal * price;

        return {
          txHash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.valueDecimal,
          token: tx.tokenName,
          tokenSymbol: tx.tokenSymbol,
          timestamp: parseInt(tx.timeStamp, 10),
          type: "transfer" as const,
          fromLabel: tx.fromEntity,
          toLabel: tx.toEntity,
          usdValue: price > 0 ? usdValue : null,
        };
      })
      .filter((whale) => whale.usdValue !== null && whale.usdValue >= WHALE_MIN_VALUE_USD)
      .sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0));

    cache.set("market-whales", whales, CACHE_TTL.WHALES);
    return NextResponse.json(whales);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch whale alerts" },
      { status: 500 },
    );
  }
}
