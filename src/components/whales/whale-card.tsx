"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { chainConfig } from "@/lib/blockchain/config";
import type { WhaleAlert } from "@/lib/types";

interface WhaleCardProps {
  alert: WhaleAlert;
}

const KNOWN_EXCHANGES = ["binance", "coinbase", "kraken", "okx", "bybit", "kucoin", "gate.io", "htx", "bitfinex"];

function isExchange(label: string | null): boolean {
  if (!label) return false;
  const lower = label.toLowerCase();
  return KNOWN_EXCHANGES.some((ex) => lower.includes(ex));
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
  const bscScanUrl = `${chainConfig.explorerUrl}/tx/${alert.txHash}`;
  const timeStr = new Date(alert.timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fromExchange = isExchange(alert.fromLabel);
  const toExchange = isExchange(alert.toLabel);
  const flowBadge = fromExchange && !toExchange
    ? { label: "OUTFLOW", color: "text-negative bg-negative-dim" }
    : !fromExchange && toExchange
    ? { label: "INFLOW", color: "text-positive bg-positive-dim" }
    : null;

  return (
    <motion.div
      className="bg-surface border border-border-subtle p-4 rounded-lg hover:border-accent-theme transition-colors duration-150"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono rounded ${
            alert.type === "swap"
              ? "text-[#60A5FA] bg-[rgba(96,165,250,0.12)]"
              : "text-accent-theme bg-accent-faint"
          }`}>
            {alert.type}
          </span>
          {flowBadge && (
            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono rounded ${flowBadge.color}`}>
              {flowBadge.label}
            </span>
          )}
          <span className="text-[10px] text-text-muted font-mono">{timeStr}</span>
        </div>
        <a
          href={bscScanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-accent-theme hover:text-accent-hover underline underline-offset-2 transition-colors"
        >
          {truncateAddress(alert.txHash)}
        </a>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-mono tabular-nums text-text-primary">
          {formatValue(alert.value)}
        </span>
        <span className="text-sm font-mono text-accent-theme">{alert.tokenSymbol}</span>
      </div>

      {alert.usdValue != null && (
        <div className="mb-2">
          <span className="text-sm font-mono tabular-nums text-text-muted">
            &asymp; ${formatValue(alert.usdValue)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
        <span className="text-text-secondary">{formatAddress(alert.from, alert.fromLabel)}</span>
        <ArrowRight className="w-3 h-3 text-text-muted" />
        <span className="text-text-secondary">{formatAddress(alert.to, alert.toLabel)}</span>
      </div>
    </motion.div>
  );
}
