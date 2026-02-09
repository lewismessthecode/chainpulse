"use client";

import { Header } from "@/components/layout/header";
import { WhaleFeed } from "@/components/whales/whale-feed";
import { useWhaleAlerts } from "@/hooks/use-whale-alerts";

export default function WhalesPage() {
  const { alerts, isLoading } = useWhaleAlerts();

  return (
    <div>
      <Header />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-[#1A1A1A] p-4 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <WhaleFeed alerts={alerts} />
      )}
    </div>
  );
}
