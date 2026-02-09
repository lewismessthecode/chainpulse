"use client";

interface SentimentBadgeProps {
  score: number;
}

export function SentimentBadge({ score }: SentimentBadgeProps) {
  const label = score >= 0.6 ? "BULLISH" : score <= 0.4 ? "BEARISH" : "NEUTRAL";
  const color =
    score >= 0.6
      ? "text-[#34D399] bg-[rgba(52,211,153,0.12)]"
      : score <= 0.4
        ? "text-[#F87171] bg-[rgba(248,113,113,0.12)]"
        : "text-warm-gray bg-elevated";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono ${color}`}
    >
      {label}
      <span className="opacity-60">{score.toFixed(1)}</span>
    </span>
  );
}
