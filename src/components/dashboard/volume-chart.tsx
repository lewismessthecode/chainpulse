"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/types";
import { useChartColors } from "@/hooks/use-chart-colors";

interface VolumeChartProps {
  data: TimeSeriesPoint[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  const colors = useChartColors();

  if (!colors) {
    return (
      <div className="bg-surface border border-border-subtle p-5 rounded-lg">
        <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted mb-4">
          DEX Volume
        </p>
        <div className="h-64 animate-pulse bg-elevated rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-subtle p-5 rounded-lg">
      <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted mb-4">
        DEX Volume
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} key={colors.barFill}>
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
              tickFormatter={(v: number) => `$${(v / 1e6).toFixed(0)}M`}
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
            <Bar
              dataKey="value"
              fill={colors.barFill}
              opacity={0.8}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
