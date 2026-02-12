"use client";

import { useState } from "react";
import { formatUsd } from "@/lib/format";
import type { Protocol } from "@/lib/types";

interface ProtocolTableProps {
  protocols: Protocol[];
}

type SortKey = "name" | "tvl" | "change24h" | "volume24h";

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
    <div className="bg-surface border border-border-subtle rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            {headers.map(({ key, label }) => (
              <th
                key={key}
                scope="col"
                aria-sort={sortKey === key ? (sortAsc ? "ascending" : "descending") : "none"}
                tabIndex={0}
                onClick={() => handleSort(key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSort(key); } }}
                className="text-left text-[11px] uppercase tracking-[0.08em] text-text-muted p-4 cursor-pointer hover:text-text-secondary transition-colors"
              >
                {label}
                {sortKey === key && (
                  <span className="ml-1 text-accent-theme">{sortAsc ? "\u2191" : "\u2193"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((protocol) => (
            <tr
              key={protocol.name}
              className="border-b border-border-subtle last:border-0 hover:bg-elevated transition-colors duration-150"
            >
              <td className="p-4 text-text-primary text-sm">{protocol.name}</td>
              <td className="p-4 font-mono text-sm tabular-nums text-text-primary">
                {formatUsd(protocol.tvl)}
              </td>
              <td className="p-4 font-mono text-sm tabular-nums">
                <span className={protocol.change24h >= 0 ? "text-positive" : "text-negative"}>
                  {protocol.change24h >= 0 ? "+" : ""}{protocol.change24h.toFixed(1)}%
                </span>
              </td>
              <td className="p-4 font-mono text-sm tabular-nums text-text-secondary">
                {formatUsd(protocol.volume24h)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
