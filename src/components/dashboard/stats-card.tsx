"use client";

import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface StatsCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  description?: string;
}

function formatValue(value: number, prefix?: string, suffix?: string): string {
  if (value == null || Number.isNaN(value)) return `${prefix ?? ""}0${suffix ?? ""}`;
  const formatted = value >= 1_000_000_000
    ? `${(value / 1_000_000_000).toFixed(2)}B`
    : value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
    ? `${(value / 1_000).toFixed(1)}K`
    : value.toFixed(2);
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}

export function StatsCard({ label, value, prefix, suffix, change, description }: StatsCardProps) {
  return (
    <motion.div
      className="bg-surface border border-[#1A1A1A] p-5 hover:border-amber transition-colors duration-150"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-warm-muted mb-3">
        {label}
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-block ml-1.5 cursor-help text-warm-muted/60 hover:text-amber"
                  aria-label="Info"
                >
                  {"\u2139"}
                </span>
              </TooltipTrigger>
              <TooltipContent
                className="bg-[#111] border border-amber/20 text-warm-muted text-xs px-3 py-2 max-w-[220px]"
                sideOffset={4}
              >
                {description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
    </motion.div>
  );
}
