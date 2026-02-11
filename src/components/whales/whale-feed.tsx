"use client";

import type { WhaleAlert } from "@/lib/types";
import { WhaleCard } from "./whale-card";

interface WhaleFeedProps {
  alerts: WhaleAlert[];
}

export function WhaleFeed({ alerts }: WhaleFeedProps) {
  const sorted = [...(alerts ?? [])].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-3">
      {sorted.map((alert) => (
        <WhaleCard key={alert.txHash} alert={alert} />
      ))}
      {sorted.length === 0 && (
        <p className="text-warm-muted text-sm text-center py-12">No whale alerts detected.</p>
      )}
    </div>
  );
}
