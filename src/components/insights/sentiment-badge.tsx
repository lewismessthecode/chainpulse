"use client";

interface SentimentBadgeProps {
  score: number;
}

export function SentimentBadge({ score }: SentimentBadgeProps) {
  const label = score >= 30 ? "BULLISH" : score <= -30 ? "BEARISH" : "NEUTRAL";
  const color =
    score >= 30
      ? "text-positive bg-positive-dim"
      : score <= -30
        ? "text-negative bg-negative-dim"
        : "text-text-secondary bg-elevated";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono rounded ${color}`}
    >
      {label}
      <span className="opacity-60">{score > 0 ? "+" : ""}{score}</span>
    </span>
  );
}
