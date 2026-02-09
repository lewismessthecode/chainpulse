"use client";

import useSWR from "swr";
import type { TokenData } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTokens() {
  const { data, error, isLoading } = useSWR<TokenData[]>(
    "/api/market/tokens",
    fetcher,
    { refreshInterval: 120_000 }
  );

  return { tokens: data ?? [], error, isLoading };
}
