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

interface VolumeChartProps {
  data: TimeSeriesPoint[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <div className="bg-surface border border-[#1A1A1A] p-5">
      <p className="text-[11px] uppercase tracking-[0.08em] text-warm-muted mb-4">
        DEX Volume
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
              tickFormatter={(v: number) => `$${(v / 1e6).toFixed(0)}M`}
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
            <Bar
              dataKey="value"
              fill="#E2A336"
              opacity={0.8}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
