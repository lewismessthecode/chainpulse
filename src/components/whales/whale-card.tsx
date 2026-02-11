"use client";

import type { WhaleAlert } from "@/lib/types";

interface WhaleCardProps {
  alert: WhaleAlert;
}

function formatValue(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function truncateAddress(address: string): string {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

function formatAddress(address: string, label: string | null): string {
  if (label) return `${label} (${truncateAddress(address)})`;
  return truncateAddress(address);
}

export function WhaleCard({ alert }: WhaleCardProps) {
  const bscScanUrl = `https://testnet.bscscan.com/tx/${alert.txHash}`;
  const timeStr = new Date(alert.timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-surface border border-[#1A1A1A] p-4 hover:border-amber transition-colors duration-150">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono ${
            alert.type === "swap"
              ? "text-[#60A5FA] bg-[rgba(96,165,250,0.12)]"
              : "text-amber bg-amber-faint"
          }`}>
            {alert.type}
          </span>
          <span className="text-[10px] text-warm-muted font-mono">{timeStr}</span>
        </div>
        <a
          href={bscScanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-amber hover:text-amber-dim underline underline-offset-2 transition-colors"
        >
          {truncateAddress(alert.txHash)}
        </a>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-mono tabular-nums text-warm-white">
          {formatValue(alert.value)}
        </span>
        <span className="text-sm font-mono text-amber">{alert.tokenSymbol}</span>
      </div>

      {alert.usdValue != null && (
        <div className="mb-2">
          <span className="text-sm font-mono tabular-nums text-warm-muted">
            ≈ ${formatValue(alert.usdValue)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs font-mono text-warm-muted">
        <span className="text-warm-gray">{formatAddress(alert.from, alert.fromLabel)}</span>
        <span className="text-warm-muted">&rarr;</span>
        <span className="text-warm-gray">{formatAddress(alert.to, alert.toLabel)}</span>
      </div>
    </div>
  );
}
