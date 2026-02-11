"use client";

import { usePathname } from "next/navigation";
import { LiveIndicator } from "@/components/shared/live-indicator";

const PAGE_TITLES: Record<string, string> = {
  "/": "Market Overview",
  "/insights": "AI Insights",
  "/tokens": "Token Analytics",
  "/whales": "Whale Monitor",
  "/predictions": "Prediction History",
  "/build-log": "AI Build Log",
};

export function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "ChainPulse";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="flex items-end justify-between pb-6 mb-6 border-b border-[#1A1A1A]">
      <h1
        className="text-3xl text-warm-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <LiveIndicator />
        <span className="text-xs text-warm-muted font-mono">{dateStr}</span>
      </div>
    </header>
  );
}
