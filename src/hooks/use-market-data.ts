"use client";

import useSWR from "swr";
import type { MarketOverview } from "@/lib/types";
import { fetcher } from "./fetcher";

export function useMarketData() {
  const { data, error, isLoading } = useSWR<MarketOverview>(
    "/api/market/overview",
    fetcher,
    { refreshInterval: 60_000 }
  );

  return { data, error, isLoading };
}
