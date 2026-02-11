"use client";

import { useState } from "react";
import type { TokenData } from "@/lib/types";
import { Sparkline } from "./sparkline";

interface TokenTableProps {
  tokens: TokenData[];
}

type SortKey = "name" | "price" | "priceChange24h" | "volume24h" | "liquidity";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function TokenTable({ tokens }: TokenTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("volume24h");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...tokens].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: "name", label: "TOKEN" },
    { key: "price", label: "PRICE" },
    { key: "priceChange24h", label: "24H" },
    { key: "volume24h", label: "VOLUME" },
    { key: "liquidity", label: "LIQUIDITY" },
  ];

  return (
    <div className="bg-surface border border-[#1A1A1A]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1A1A1A]">
            {headers.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="text-left text-[11px] uppercase tracking-[0.08em] text-warm-muted p-4 cursor-pointer hover:text-warm-gray transition-colors"
              >
                {label}
                {sortKey === key && (
                  <span className="ml-1 text-amber">
                    {sortAsc ? "\u2191" : "\u2193"}
                  </span>
                )}
              </th>
            ))}
            <th className="text-left text-[11px] uppercase tracking-[0.08em] text-warm-muted p-4">
              TREND
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((token) => (
            <tr
              key={token.address}
              className="border-b border-[#1A1A1A] last:border-0 hover:bg-elevated transition-colors duration-150"
            >
              <td className="p-4">
                <div>
                  <span className="text-warm-white text-sm font-medium">
                    {token.symbol}
                  </span>
                  <span className="text-warm-muted text-xs ml-2">
                    {token.name}
                  </span>
                </div>
              </td>
              <td className="p-4 font-mono text-sm tabular-nums text-warm-white">
                {formatUsd(token.price)}
              </td>
              <td className="p-4 font-mono text-sm tabular-nums">
                <span
                  className={
                    token.priceChange24h >= 0
                      ? "text-[#34D399]"
                      : "text-[#F87171]"
                  }
                >
                  {token.priceChange24h >= 0 ? "+" : ""}
                  {token.priceChange24h.toFixed(1)}%
                </span>
              </td>
              <td className="p-4 font-mono text-sm tabular-nums text-warm-gray">
                {formatUsd(token.volume24h)}
              </td>
              <td className="p-4 font-mono text-sm tabular-nums text-warm-gray">
                {formatUsd(token.liquidity)}
              </td>
              <td className="p-4">
                {token.sparkline && token.sparkline.length > 1 ? (
                  <Sparkline data={token.sparkline} />
                ) : (
                  <span className="text-xs text-warm-muted font-mono">--</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
