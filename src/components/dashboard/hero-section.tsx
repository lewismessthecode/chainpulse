"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/hooks/fetcher";
import { chainConfig } from "@/lib/blockchain/config";
import type { OnchainPrediction } from "@/lib/types";

const CONTRACT_ADDRESS = chainConfig.contractAddress;
const BSCSCAN_URL = CONTRACT_ADDRESS
  ? `${chainConfig.explorerUrl}/address/${CONTRACT_ADDRESS}`
  : "";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, ease: "easeOut" } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HeroSection() {
  const { data } = useSWR<{ predictions: OnchainPrediction[] }>(
    "/api/chain/predictions",
    fetcher,
    {
      errorRetryCount: 2,
      errorRetryInterval: 10_000,
      revalidateOnFocus: false,
    },
  );
  const predictionCount = data?.predictions?.length ?? 0;

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="py-12 md:py-16 mb-8 border-b border-border-subtle"
    >
      <motion.h1
        variants={item}
        className="text-4xl md:text-5xl text-text-primary mb-4 font-display"
      >
        Onchain Market Intelligence
      </motion.h1>

      <motion.p variants={item} className="text-base text-text-secondary max-w-xl mb-8">
        AI-powered analysis of BNB Chain DeFi. Every prediction verified onchain.
      </motion.p>

      <motion.div variants={item} className="flex flex-wrap gap-3">
        <a
          href={BSCSCAN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-faint border border-border-subtle text-accent-theme text-xs font-mono rounded-lg hover:border-accent-theme transition-colors"
        >
          CONTRACT {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
          <ArrowUpRight className="w-3 h-3" />
        </a>

        <span className="inline-flex items-center px-3 py-1.5 bg-accent-faint border border-border-subtle text-accent-theme text-xs font-mono rounded-lg">
          {predictionCount} PREDICTIONS
        </span>

        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-faint border border-border-subtle text-accent-theme text-xs font-mono rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
          </span>
          LIVE
        </span>
      </motion.div>
    </motion.section>
  );
}
