"use client";

import { Header } from "@/components/layout/header";
import { TokenTable } from "@/components/tokens/token-table";
import { PageTransition, FadeInItem } from "@/components/shared/page-transition";
import { ApiError } from "@/components/shared/api-error";
import { useTokens } from "@/hooks/use-tokens";

export default function TokensPage() {
  const { tokens, isLoading, error, mutate } = useTokens();

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
          <TokenTable tokens={tokens} />
        )}
      </FadeInItem>
    </PageTransition>
  );
}
