"use client";

import type { AIInsight } from "@/lib/types";
import { PulseLine } from "./pulse-line";
import { SentimentBadge } from "./sentiment-badge";
import { OnchainProof } from "./onchain-proof";

interface InsightCardProps {
  insight: AIInsight;
}

const CATEGORY_COLORS: Record<string, string> = {
  TREND: "text-amber bg-amber-faint",
  RISK: "text-[#F87171] bg-[rgba(248,113,113,0.12)]",
  WHALE_ALERT: "text-[#60A5FA] bg-[rgba(96,165,250,0.12)]",
  MARKET_INSIGHT: "text-[#34D399] bg-[rgba(52,211,153,0.12)]",
};

export function InsightCard({ insight }: InsightCardProps) {
  const categoryStyle =
    CATEGORY_COLORS[insight.category] ?? "text-warm-gray bg-elevated";

  return (
    <article className="bg-surface border border-[#1A1A1A] p-5 hover:border-amber transition-colors duration-150">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono ${categoryStyle}`}
          >
            {insight.category}
          </span>
          <SentimentBadge score={insight.sentimentScore} />
        </div>
        <PulseLine className="w-20 h-5 opacity-40" />
      </div>

      <h3
        className="text-lg text-warm-white mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {insight.title}
      </h3>

      <p className="text-sm text-warm-gray leading-relaxed mb-4">
        {insight.summary}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {insight.dataPoints.map((point, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-[10px] font-mono text-warm-muted bg-elevated border border-[#1A1A1A]"
          >
            {point}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
        <OnchainProof
          txHash={insight.txHash}
          contentHash={insight.contentHash}
        />
        <span className="text-[10px] text-warm-muted font-mono">
          {new Date(insight.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </article>
  );
}
