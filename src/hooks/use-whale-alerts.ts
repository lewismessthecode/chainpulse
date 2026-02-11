"use client";

import useSWR from "swr";
import type { WhaleAlert } from "@/lib/types";
import { fetcher } from "./fetcher";

export function useWhaleAlerts() {
  const { data, error, isLoading } = useSWR<WhaleAlert[]>(
    "/api/market/whales",
    fetcher,
    { refreshInterval: 60_000 }
  );

  return { alerts: data ?? [], error, isLoading };
}
