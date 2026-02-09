"use client";

import useSWR from "swr";
import type { MarketOverview } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMarketData() {
  const { data, error, isLoading } = useSWR<MarketOverview>(
    "/api/market/overview",
    fetcher,
    { refreshInterval: 60_000 }
  );

  return { data, error, isLoading };
}
