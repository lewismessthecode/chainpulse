"use client";

import { Header } from "@/components/layout/header";
import { PredictionTable } from "@/components/predictions/prediction-table";
import { usePredictions } from "@/hooks/use-predictions";

export default function PredictionsPage() {
  const { predictions, isLoading } = usePredictions();

  return (
    <div>
      <Header />
      {isLoading ? (
        <div className="bg-surface border border-[#1A1A1A] p-5 h-96 animate-pulse" />
      ) : (
        <PredictionTable predictions={predictions} />
      )}
    </div>
  );
}
