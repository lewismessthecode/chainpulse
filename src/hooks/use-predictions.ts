"use client";

import useSWR from "swr";
import { fetcher } from "./fetcher";
import type { OnchainPrediction } from "@/lib/types";

export function usePredictions() {
  const { data, error, isLoading } = useSWR<{ predictions: OnchainPrediction[] }>(
    "/api/chain/predictions",
    fetcher,
    { refreshInterval: 120_000 }
  );

  return { predictions: data?.predictions ?? [], error, isLoading };
}
