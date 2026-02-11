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

interface TvlChartProps {
  data: TimeSeriesPoint[];
}

export function TvlChart({ data }: TvlChartProps) {
  return (
    <div className="bg-surface border border-[#1A1A1A] p-5">
      <p className="text-[11px] uppercase tracking-[0.08em] text-warm-muted mb-4">
        Total Value Locked
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="#1A1A1A" strokeDasharray="none" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#4A4744", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "#1A1A1A" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#4A4744", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1e9).toFixed(1)}B`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111111",
                border: "1px solid #1A1A1A",
                borderRadius: 0,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#E8E4DD",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#E2A336"
              strokeWidth={1.5}
              fill="rgba(226, 163, 54, 0.08)"
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
