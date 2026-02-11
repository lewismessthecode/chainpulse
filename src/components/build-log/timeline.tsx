"use client";

import { motion } from "framer-motion";
import { Bot, Code2, FlaskConical, Shield, Rocket, GitBranch } from "lucide-react";
import type { ReactNode } from "react";

interface TimelineEntry {
  phase: string;
  title: string;
  description: string;
  icon: ReactNode;
  details: string[];
  aiTool: string;
}

const TIMELINE: TimelineEntry[] = [
  {
    phase: "Phase 1",
    title: "Architecture & Scaffold",
    description: "Claude Code designed the full system architecture: Next.js 16 App Router + Hardhat + Tailwind CSS 4 with \"Obsidian Terminal\" design system.",
    icon: <Code2 className="w-4 h-4" />,
    details: [
      "Next.js 16 with App Router + Turbopack",
      "Hardhat + Solidity 0.8.20 smart contract setup",
      "Tailwind CSS 4 with custom design tokens",
      "TypeScript strict mode throughout",
    ],
    aiTool: "Claude Code (Opus)",
  },
  {
    phase: "Phase 2",
    title: "Smart Contract — TDD",
    description: "Used test-driven development: wrote 14 contract tests first (RED), then implemented ChainPulseOracle to pass all tests (GREEN).",
    icon: <FlaskConical className="w-4 h-4" />,
    details: [
      "14 contract tests written before implementation",
      "ChainPulseOracle.sol: batch prediction storage",
      "keccak256 content hashing for verification",
      "Agent-based access control (OpenZeppelin Ownable)",
    ],
    aiTool: "Claude Code (Opus) — TDD Agent",
  },
  {
    phase: "Phase 3",
    title: "Dashboard & Data Layer",
    description: "Built 5 dashboard pages with real data from DeFiLlama, GeckoTerminal, and Moralis. SWR hooks with auto-refresh. 61+ unit tests.",
    icon: <GitBranch className="w-4 h-4" />,
    details: [
      "Market Overview with TVL/Volume charts (Recharts)",
      "AI Insights feed with sentiment badges",
      "Token Analytics with sparklines",
      "Whale Monitor with real Moralis data",
      "Prediction History from on-chain data",
    ],
    aiTool: "Claude Code (Opus) — Full-Stack Agent",
  },
  {
    phase: "Phase 4",
    title: "AI Analysis Engine",
    description: "Integrated Google Gemini for autonomous market analysis. AI generates insights, hashes them, and stores predictions on-chain via ChainPulseOracle.",
    icon: <Bot className="w-4 h-4" />,
    details: [
      "Gemini 2.0 Flash with structured JSON output",
      "Zod schema validation for AI responses",
      "Content hashing (keccak256) before on-chain storage",
      "Batch transaction for gas efficiency",
      "Cron-triggered autonomous analysis every 6 hours",
    ],
    aiTool: "Claude Code (Opus) — AI Integration",
  },
  {
    phase: "Phase 5",
    title: "Security & Hardening",
    description: "Rate limiting on all external APIs, error boundaries, proxy support for restricted networks, environment variable validation.",
    icon: <Shield className="w-4 h-4" />,
    details: [
      "Rate limiting: Moralis 40ms, GeckoTerminal 30/min",
      "React Error Boundary for crash resilience",
      "HTTPS proxy support (undici EnvHttpProxyAgent)",
      "Bearer token auth on cron endpoint",
    ],
    aiTool: "Claude Code (Opus) — Security Review",
  },
  {
    phase: "Phase 6",
    title: "Onchain Verification UI",
    description: "Built the verification flow: judges can click Verify on any AI insight to confirm the content hash matches what's stored on BSC — the core \"wow moment\".",
    icon: <Rocket className="w-4 h-4" />,
    details: [
      "Verification panel with hash comparison",
      "Real-time contract call to verifyPrediction()",
      "Visual feedback: VERIFIED / MISMATCH status",
      "BSCScan deep links for transaction proof",
    ],
    aiTool: "Claude Code (Opus) — Feature Agent",
  },
];

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function BuildTimeline() {
  return (
    <div className="relative">
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#1A1A1A]" />

      <div className="space-y-8">
        {TIMELINE.map((entry, i) => (
          <motion.div
            key={i}
            variants={item}
            className="relative pl-12"
          >
            <div className="absolute left-0 top-0 w-10 h-10 bg-surface border border-[#1A1A1A] flex items-center justify-center text-amber z-10">
              {entry.icon}
            </div>

            <div className="bg-surface border border-[#1A1A1A] p-5 hover:border-amber transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-mono text-amber bg-amber-faint">
                  {entry.phase}
                </span>
                <span className="text-[10px] font-mono text-warm-muted">
                  {entry.aiTool}
                </span>
              </div>

              <h3
                className="text-lg text-warm-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {entry.title}
              </h3>

              <p className="text-sm text-warm-gray leading-relaxed mb-3">
                {entry.description}
              </p>

              <ul className="space-y-1">
                {entry.details.map((detail, j) => (
                  <li key={j} className="text-xs text-warm-muted font-mono flex items-start gap-2">
                    <span className="text-amber mt-0.5">&#x2022;</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
