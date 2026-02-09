"use client";

import useSWR from "swr";
import type { OnchainPrediction } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePredictions() {
  const { data, error, isLoading } = useSWR<{ predictions: OnchainPrediction[] }>(
    "/api/chain/predictions",
    fetcher,
    { refreshInterval: 120_000 }
  );

  return { predictions: data?.predictions ?? [], error, isLoading };
}
