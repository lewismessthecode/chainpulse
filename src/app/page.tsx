"use client";

import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TvlChart } from "@/components/dashboard/tvl-chart";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { ProtocolTable } from "@/components/dashboard/protocol-table";
import { useMarketData } from "@/hooks/use-market-data";

export default function DashboardPage() {
  const { data, isLoading } = useMarketData();

  if (isLoading || !data) {
    return (
      <div>
        <Header />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-[#1A1A1A] p-5 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="TOTAL VALUE LOCKED" value={data.tvl.current} prefix="$" change={data.tvl.change24h} description="Sum of all assets deposited in BNB Chain DeFi protocols" />
        <StatsCard label="DEX VOLUME (24H)" value={data.volume.current} prefix="$" change={data.volume.change24h} description="Total trading volume across all BNB Chain DEXes in the last 24 hours" />
        <StatsCard label="ACTIVE PROTOCOLS" value={data.protocolCount} description="Number of DeFi protocols tracked on BNB Chain" />
        <StatsCard label="TOP PROTOCOL TVL" value={data.topProtocols[0]?.tvl ?? 0} prefix="$" description="Total value locked in the largest BNB Chain DeFi protocol" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <TvlChart data={data.tvl.history} />
        <VolumeChart data={data.volume.history} />
      </div>

      <ProtocolTable protocols={data.topProtocols} />
    </div>
  );
}
