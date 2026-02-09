"use client";

interface StatsCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
}

function formatValue(value: number, prefix?: string, suffix?: string): string {
  const formatted = value >= 1_000_000_000
    ? `${(value / 1_000_000_000).toFixed(2)}B`
    : value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
    ? `${(value / 1_000).toFixed(1)}K`
    : value.toFixed(2);
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}

export function StatsCard({ label, value, prefix, suffix, change }: StatsCardProps) {
  return (
    <div className="bg-surface border border-[#1A1A1A] p-5 hover:border-amber transition-colors duration-150">
      <p className="text-[11px] uppercase tracking-[0.08em] text-warm-muted mb-3">
        {label}
      </p>
      <p className="text-4xl font-mono tabular-nums text-warm-white mb-2">
        {formatValue(value, prefix, suffix)}
      </p>
      {change !== undefined && (
        <span
          className={`text-sm font-mono ${
            change >= 0 ? "text-[#34D399]" : "text-[#F87171]"
          }`}
        >
          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
