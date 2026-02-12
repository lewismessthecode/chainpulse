"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ChartColors {
  grid: string;
  text: string;
  axis: string;
  line: string;
  fill: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  positive: string;
  negative: string;
  barFill: string;
}

const LIGHT_CHART_COLORS: ChartColors = {
  grid: "hsl(40, 8%, 88%)",
  text: "hsl(30, 5%, 42%)",
  axis: "hsl(40, 8%, 88%)",
  line: "hsl(38, 80%, 50%)",
  fill: "hsla(38, 80%, 50%, 0.08)",
  tooltipBg: "hsl(0, 0%, 100%)",
  tooltipBorder: "hsl(40, 8%, 88%)",
  tooltipText: "hsl(30, 8%, 12%)",
  positive: "hsl(152, 69%, 40%)",
  negative: "hsl(0, 72%, 51%)",
  barFill: "hsl(38, 80%, 50%)",
};

const DARK_CHART_COLORS: ChartColors = {
  grid: "hsl(225, 12%, 18%)",
  text: "hsl(40, 5%, 42%)",
  axis: "hsl(225, 12%, 18%)",
  line: "hsl(38, 80%, 55%)",
  fill: "hsla(38, 80%, 55%, 0.08)",
  tooltipBg: "hsl(225, 13%, 16%)",
  tooltipBorder: "hsl(225, 12%, 24%)",
  tooltipText: "hsl(40, 10%, 93%)",
  positive: "hsl(152, 69%, 55%)",
  negative: "hsl(0, 84%, 65%)",
  barFill: "hsl(38, 80%, 55%)",
};

export function useChartColors(): ChartColors | null {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return resolvedTheme === "dark" ? DARK_CHART_COLORS : LIGHT_CHART_COLORS;
}
