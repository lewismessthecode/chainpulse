"use client";

import { useState } from "react";
import type { AIInsight } from "@/lib/types";
import { InsightCard } from "./insight-card";

interface InsightFeedProps {
  insights: AIInsight[];
}

const CATEGORIES = [
  "ALL",
  "TREND",
  "RISK",
  "WHALE_ALERT",
  "MARKET_INSIGHT",
] as const;

export function InsightFeed({ insights }: InsightFeedProps) {
  const [category, setCategory] = useState<string>("ALL");

  const filtered =
    category === "ALL"
      ? insights
      : insights.filter((i) => i.category === category);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] font-mono transition-colors duration-150 ${
              category === cat
                ? "bg-amber text-black"
                : "bg-elevated text-warm-muted hover:text-warm-gray border border-[#1A1A1A]"
            }`}
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
        {filtered.length === 0 && (
          <p className="text-warm-muted text-sm text-center py-12">
            No insights found.
          </p>
        )}
      </div>
    </div>
  );
}
