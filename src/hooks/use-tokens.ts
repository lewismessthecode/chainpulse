"use client";

import useSWR from "swr";
import type { TokenData } from "@/lib/types";
import { fetcher } from "./fetcher";

export function useTokens() {
  const { data, error, isLoading, mutate } = useSWR<TokenData[]>(
    "/api/market/tokens",
    fetcher,
    { refreshInterval: 120_000 }
  );

  return { tokens: data ?? [], error, isLoading, mutate };
}
