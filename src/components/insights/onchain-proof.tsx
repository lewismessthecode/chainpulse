"use client";

import { ArrowUpRight } from "lucide-react";

interface OnchainProofProps {
  txHash?: string;
  contentHash: string;
}

export function OnchainProof({ txHash, contentHash }: OnchainProofProps) {
  const truncatedHash = contentHash.slice(0, 6) + "..." + contentHash.slice(-4);
  const bscScanUrl = txHash
    ? `https://testnet.bscscan.com/tx/${txHash}`
    : undefined;

  return (
    <div className="flex items-center gap-2 text-[10px] font-mono">
      <span className="text-warm-muted">ID:</span>
      <span className="text-amber">{truncatedHash}</span>
      {bscScanUrl && (
        <a
          href={bscScanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-amber hover:text-amber-dim underline underline-offset-2 transition-colors"
        >
          Batch TX
          <ArrowUpRight className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  );
}
