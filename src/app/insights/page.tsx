"use client";

import { Header } from "@/components/layout/header";
import { InsightFeed } from "@/components/insights/insight-feed";
import { PageTransition, FadeInItem } from "@/components/shared/page-transition";
import { ApiError } from "@/components/shared/api-error";
import { useInsights } from "@/hooks/use-insights";

export default function InsightsPage() {
  const { insights, isLoading, error, mutate } = useInsights();

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
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-[#1A1A1A] p-5 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <InsightFeed insights={insights} />
        )}
      </FadeInItem>
    </PageTransition>
  );
}
