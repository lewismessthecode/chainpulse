"use client";

import { Header } from "@/components/layout/header";
import { PredictionTable } from "@/components/predictions/prediction-table";
import { PageTransition, FadeInItem } from "@/components/shared/page-transition";
import { ApiError } from "@/components/shared/api-error";
import { usePredictions } from "@/hooks/use-predictions";

export default function PredictionsPage() {
  const { predictions, isLoading, error, mutate } = usePredictions();

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
          <div className="bg-surface border border-[#1A1A1A] p-5 h-96 animate-pulse" />
        ) : (
          <PredictionTable predictions={predictions} />
        )}
      </FadeInItem>
    </PageTransition>
  );
}
