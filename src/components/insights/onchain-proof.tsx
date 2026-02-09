"use client";

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
      <span className="text-warm-muted">HASH:</span>
      <span className="text-amber">{truncatedHash}</span>
      {bscScanUrl && (
        <a
          href={bscScanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber hover:text-amber-dim underline underline-offset-2 transition-colors"
        >
          Verify on BscScan
        </a>
      )}
    </div>
  );
}
