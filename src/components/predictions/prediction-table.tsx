"use client";

import { History } from "lucide-react";
import type { OnchainPrediction } from "@/lib/types";

interface PredictionTableProps {
  predictions: OnchainPrediction[];
}

const CATEGORY_LABELS: Record<number, string> = {
  0: "TREND",
  1: "RISK",
  2: "WHALE ALERT",
  3: "MARKET INSIGHT",
};

function truncateHash(hash: string): string {
  return hash.slice(0, 6) + "..." + hash.slice(-4);
}

export function PredictionTable({ predictions }: PredictionTableProps) {
  return (
    <div className="bg-surface border border-[#1A1A1A]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1A1A1A]">
            <th className="text-left text-[11px] uppercase tracking-[0.08em] text-warm-muted p-4">
              ID
            </th>
            <th className="text-left text-[11px] uppercase tracking-[0.08em] text-warm-muted p-4">
              DATE
            </th>
            <th className="text-left text-[11px] uppercase tracking-[0.08em] text-warm-muted p-4">
              CATEGORY
            </th>
            <th className="text-left text-[11px] uppercase tracking-[0.08em] text-warm-muted p-4">
              SENTIMENT
            </th>
            <th className="text-left text-[11px] uppercase tracking-[0.08em] text-warm-muted p-4">
              SUMMARY
            </th>
            <th className="text-left text-[11px] uppercase tracking-[0.08em] text-warm-muted p-4">
              HASH
            </th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((pred) => (
            <tr
              key={pred.id}
              className="border-b border-[#1A1A1A] last:border-0 hover:bg-elevated transition-colors duration-150"
            >
              <td className="p-4 font-mono text-sm tabular-nums text-warm-gray">
                #{pred.id}
              </td>
              <td className="p-4 font-mono text-xs text-warm-muted">
                {new Date(pred.timestamp * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="p-4">
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono text-amber bg-amber-faint">
                  {CATEGORY_LABELS[pred.category] ?? "UNKNOWN"}
                </span>
              </td>
              <td className="p-4 font-mono text-sm tabular-nums">
                <span className={pred.sentimentScore >= 50 ? "text-[#34D399]" : "text-[#F87171]"}>
                  {pred.sentimentScore}
                </span>
              </td>
              <td className="p-4 text-sm text-warm-gray max-w-xs truncate">
                {pred.summary}
              </td>
              <td className="p-4">
                <span className="text-xs font-mono text-warm-muted">
                  {truncateHash(pred.contentHash)}
                </span>
                {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS && (
                  <a
                    href={`https://testnet.bscscan.com/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}#readContract`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-[10px] font-mono text-amber hover:text-amber-dim underline underline-offset-2 transition-colors"
                  >
                    Contract
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {predictions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <History className="w-8 h-8 text-warm-muted/40 mb-3" />
          <p className="text-warm-muted text-sm">No predictions recorded yet.</p>
        </div>
      )}
    </div>
  );
}
