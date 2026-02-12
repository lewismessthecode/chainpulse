"use client";

import { Header } from "@/components/layout/header";
import { WhaleFeed } from "@/components/whales/whale-feed";
import { PageTransition, FadeInItem } from "@/components/shared/page-transition";
import { ApiError } from "@/components/shared/api-error";
import { useWhaleAlerts } from "@/hooks/use-whale-alerts";

export default function WhalesPage() {
  const { alerts, isLoading, error, mutate } = useWhaleAlerts();

  if (error) {
    return (
      <div>
        <Header />
        <ApiError onRetry={() => mutate()} />
      </div>
    );
  }

  return (
    <PageTransition>
      <FadeInItem>
        <Header />
      </FadeInItem>
      <FadeInItem>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border-subtle p-4 h-28 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <WhaleFeed alerts={alerts} />
        )}
      </FadeInItem>
    </PageTransition>
  );
}
