"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerify } from "@/hooks/use-verify";
import { chainConfig } from "@/lib/blockchain/config";
import type { AIInsight } from "@/lib/types";

interface VerificationPanelProps {
  insight: AIInsight;
  isOpen: boolean;
}

function rebuildOriginalContent(insight: AIInsight): string {
  return JSON.stringify({
    category: insight.category,
    title: insight.title,
    summary: insight.summary,
    fullAnalysis: insight.fullAnalysis,
    sentimentScore: insight.sentimentScore,
    confidence: insight.confidence,
    dataPoints: insight.dataPoints,
  });
}

export function VerificationPanel({ insight, isOpen }: VerificationPanelProps) {
  const { verify, isVerifying, result, error, reset } = useVerify();

  const handleVerify = () => {
    if (insight.predictionId === undefined) return;
    const content = rebuildOriginalContent(insight);
    verify(insight.predictionId, content);
  };

  const truncate = (hash: string) => hash ? hash.slice(0, 10) + "..." + hash.slice(-6) : "N/A";
  const bscScanUrl = insight.txHash
    ? `${chainConfig.explorerUrl}/tx/${insight.txHash}`
    : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="pt-4 mt-4 border-t border-border-subtle">
            <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-mono mb-3">
              Onchain Verification
            </p>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-text-muted w-24">Local Hash:</span>
                <span className="text-text-secondary">{truncate(insight.contentHash)}</span>
              </div>
              {insight.predictionId !== undefined && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-text-muted w-24">Prediction ID:</span>
                  <span className="text-text-secondary">#{insight.predictionId}</span>
                </div>
              )}
            </div>

            {!result && !error && (
              <button
                onClick={handleVerify}
                disabled={isVerifying || insight.predictionId === undefined}
                className="px-4 py-2 bg-accent-faint border border-accent-theme text-accent-theme text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-accent-glow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Onchain"
                )}
              </button>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {result.verified ? (
                  <div className="flex items-center gap-2 text-positive text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    VERIFIED — HASHES MATCH
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-negative text-xs font-mono">
                    <XCircle className="w-4 h-4" />
                    MISMATCH — CONTENT DIFFERS
                  </div>
                )}
                {bscScanUrl && (
                  <a
                    href={bscScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-accent-theme font-mono hover:text-accent-hover underline underline-offset-2 transition-colors"
                  >
                    View on BSCScan
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </a>
                )}
                <button
                  onClick={reset}
                  className="block text-[10px] text-text-muted font-mono hover:text-text-secondary transition-colors mt-1"
                >
                  Reset
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <p className="text-negative text-xs font-mono">{error}</p>
                <button
                  onClick={reset}
                  className="text-[10px] text-text-muted font-mono hover:text-text-secondary transition-colors"
                >
                  Try again
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
