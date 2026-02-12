"use client";

import { ArrowUpRight } from "lucide-react";
import { chainConfig } from "@/lib/blockchain/config";

interface OnchainProofProps {
  txHash?: string;
  contentHash: string;
}

export function OnchainProof({ txHash, contentHash }: OnchainProofProps) {
  const truncatedHash = contentHash
    ? contentHash.slice(0, 6) + "..." + contentHash.slice(-4)
    : "N/A";
  const bscScanUrl = txHash
    ? `${chainConfig.explorerUrl}/tx/${txHash}`
    : undefined;

  return (
    <div className="flex items-center gap-2 text-[10px] font-mono">
      <span className="text-text-muted">ID:</span>
      <span className="text-accent-theme">{truncatedHash}</span>
      {bscScanUrl && (
        <a
          href={bscScanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-accent-theme hover:text-accent-hover underline underline-offset-2 transition-colors"
        >
          Batch TX
          <ArrowUpRight className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  );
}
