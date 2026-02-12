"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/types";
import { useChartColors } from "@/hooks/use-chart-colors";

interface TvlChartProps {
  data: TimeSeriesPoint[];
}

export function TvlChart({ data }: TvlChartProps) {
  const colors = useChartColors();

  if (!colors) {
    return (
      <div className="bg-surface border border-border-subtle p-5 rounded-lg">
        <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted mb-4">
          Total Value Locked
        </p>
        <div className="h-64 animate-pulse bg-elevated rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-subtle p-5 rounded-lg">
      <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted mb-4">
        Total Value Locked
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} key={colors.line}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="none" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: colors.text, fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: colors.axis }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: colors.text, fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1e9).toFixed(1)}B`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: colors.tooltipText,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.line}
              strokeWidth={1.5}
              fill={colors.fill}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
