"use client";

import { motion } from "framer-motion";
import { Fish } from "lucide-react";
import type { WhaleAlert } from "@/lib/types";
import { WhaleCard } from "./whale-card";

interface WhaleFeedProps {
  alerts: WhaleAlert[];
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function WhaleFeed({ alerts }: WhaleFeedProps) {
  const sorted = [...(alerts ?? [])].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div>
      {sorted.length > 0 ? (
        <motion.div
          className="space-y-3"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {sorted.map((alert) => (
            <motion.div key={alert.txHash} variants={fadeUp}>
              <WhaleCard alert={alert} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Fish className="w-8 h-8 text-text-muted/40 mb-3" />
          <p className="text-text-muted text-sm">No whale alerts detected.</p>
        </div>
      )}
    </div>
  );
}
