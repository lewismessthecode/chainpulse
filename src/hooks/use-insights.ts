"use client";

import useSWR from "swr";
import type { AIInsight } from "@/lib/types";
import { fetcher } from "./fetcher";

export function useInsights() {
  const { data, error, isLoading } = useSWR<{ insights: AIInsight[] }>(
    "/api/ai/insights",
    fetcher,
    { refreshInterval: 120_000 }
  );

  return { insights: data?.insights ?? [], error, isLoading };
}
