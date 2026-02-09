"use client";

import { Header } from "@/components/layout/header";
import { TokenTable } from "@/components/tokens/token-table";
import { useTokens } from "@/hooks/use-tokens";

export default function TokensPage() {
  const { tokens, isLoading } = useTokens();

  return (
    <div>
      <Header />
      {isLoading ? (
        <div className="bg-surface border border-[#1A1A1A] p-5 h-96 animate-pulse" />
      ) : (
        <TokenTable tokens={tokens} />
      )}
    </div>
  );
}
