"use client";

import { Header } from "@/components/layout/header";
import { BuildTimeline } from "@/components/build-log/timeline";
import { PageTransition, FadeInItem } from "@/components/shared/page-transition";

export default function BuildLogPage() {
  return (
    <PageTransition>
      <FadeInItem>
        <Header />
      </FadeInItem>

      <FadeInItem>
        <div className="mb-8">
          <p className="text-sm text-warm-gray leading-relaxed max-w-2xl">
            ChainPulse was built entirely with Claude Code (Opus) using an agent-driven workflow.
            Every phase — from architecture to smart contract to AI integration — was
            designed, implemented, tested, and reviewed by AI agents.
          </p>
        </div>
      </FadeInItem>

      <FadeInItem>
        <BuildTimeline />
      </FadeInItem>
    </PageTransition>
  );
}
