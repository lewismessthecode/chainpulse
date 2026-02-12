"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { AIInsight } from "@/lib/types";
import { PulseLine } from "./pulse-line";
import { SentimentBadge } from "./sentiment-badge";
import { OnchainProof } from "./onchain-proof";
import { VerificationPanel } from "./verification-panel";

interface InsightCardProps {
  insight: AIInsight;
}

const CATEGORY_COLORS: Record<string, string> = {
  TREND: "text-accent-theme bg-accent-faint",
  RISK: "text-negative bg-negative-dim",
  WHALE_ALERT: "text-[#60A5FA] bg-[rgba(96,165,250,0.12)]",
  MARKET_INSIGHT: "text-positive bg-positive-dim",
};

export function InsightCard({ insight }: InsightCardProps) {
  const [showVerify, setShowVerify] = useState(false);
  const categoryStyle =
    CATEGORY_COLORS[insight.category] ?? "text-text-secondary bg-elevated";

  return (
    <motion.article
      className="bg-surface border border-border-subtle p-5 rounded-lg hover:border-accent-theme transition-colors duration-150"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono rounded ${categoryStyle}`}
          >
            {insight.category}
          </span>
          <SentimentBadge score={insight.sentimentScore} />
        </div>
        <PulseLine className="w-20 h-5 opacity-40" />
      </div>

      <h3 className="text-lg text-text-primary mb-2 font-display">
        {insight.title}
      </h3>

      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {insight.summary}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {insight.dataPoints.map((point, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-[10px] font-mono text-text-muted bg-elevated border border-border-subtle rounded"
          >
            {point}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-3">
          <OnchainProof
            txHash={insight.txHash}
            contentHash={insight.contentHash}
          />
          {insight.predictionId !== undefined && (
            <button
              onClick={() => setShowVerify((prev) => !prev)}
              aria-expanded={showVerify}
              aria-label={showVerify ? "Hide verification panel" : "Verify insight onchain"}
              className="inline-flex items-center gap-1 text-[10px] font-mono text-text-muted hover:text-accent-theme transition-colors"
            >
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
              {showVerify ? "Hide" : "Verify"}
            </button>
          )}
        </div>
        <span className="text-[10px] text-text-muted font-mono">
          {new Date(insight.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <VerificationPanel insight={insight} isOpen={showVerify} />
    </motion.article>
  );
}
