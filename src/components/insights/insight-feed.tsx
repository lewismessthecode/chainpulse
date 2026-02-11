"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
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

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

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

      <motion.div
        className="space-y-4"
        variants={stagger}
        initial="hidden"
        animate="show"
        key={category}
      >
        {filtered.map((insight) => (
          <motion.div key={insight.id} variants={fadeUp}>
            <InsightCard insight={insight} />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Brain className="w-8 h-8 text-warm-muted/40 mb-3" />
          <p className="text-warm-muted text-sm">
            No insights yet. AI analysis hasn&apos;t been triggered.
          </p>
          <p className="text-warm-muted/60 text-xs mt-2">
            Send a POST request to /api/ai/analyze to generate insights.
          </p>
        </div>
      )}
    </div>
  );
}
