"use client";

import { useState } from "react";
import type { Protocol } from "@/lib/types";

interface ProtocolTableProps {
  protocols: Protocol[];
}

type SortKey = "name" | "tvl" | "change24h" | "volume24h";

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function ProtocolTable({ protocols }: ProtocolTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("tvl");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...protocols].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
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
    { key: "name", label: "PROTOCOL" },
    { key: "tvl", label: "TVL" },
    { key: "change24h", label: "24H CHANGE" },
    { key: "volume24h", label: "VOLUME 24H" },
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
                  <span className="ml-1 text-amber">{sortAsc ? "\u2191" : "\u2193"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((protocol) => (
            <tr
              key={protocol.name}
              className="border-b border-[#1A1A1A] last:border-0 hover:bg-elevated transition-colors duration-150"
            >
              <td className="p-4 text-warm-white text-sm">{protocol.name}</td>
              <td className="p-4 font-mono text-sm tabular-nums text-warm-white">
                {formatUsd(protocol.tvl)}
              </td>
              <td className="p-4 font-mono text-sm tabular-nums">
                <span className={protocol.change24h >= 0 ? "text-[#34D399]" : "text-[#F87171]"}>
                  {protocol.change24h >= 0 ? "+" : ""}{protocol.change24h.toFixed(1)}%
                </span>
              </td>
              <td className="p-4 font-mono text-sm tabular-nums text-warm-gray">
                {formatUsd(protocol.volume24h)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
