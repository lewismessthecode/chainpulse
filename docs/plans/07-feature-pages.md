# Tasks 20-23: Feature Pages

> **Status: Pending**
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 20: AI Insights Page

**Files:**
- Create: `src/components/insights/pulse-line.tsx`
- Create: `src/components/insights/sentiment-badge.tsx`
- Create: `src/components/insights/onchain-proof.tsx`
- Create: `src/components/insights/insight-card.tsx`
- Create: `src/components/insights/insight-feed.tsx`
- Create: `src/hooks/use-insights.ts`
- Create: `src/app/insights/page.tsx`

**Step 1: Write tests** for pulse-line (renders SVG), sentiment-badge (color by value), onchain-proof (truncated hash, BscScan link), insight-card (all sections render), insight-feed (multiple cards, category filter).

**Step 2: Implement components** following design system — pulse line SVG with stroke-dasharray animation, amber proof badges, Instrument Serif titles.

**Step 3: Visual check**

**Commit:** `feat: add AI insights page with pulse line and on-chain proof`

---

## Task 21: Token Analytics Page

**Files:**
- Create: `src/components/tokens/sparkline.tsx`
- Create: `src/components/tokens/token-table.tsx`
- Create: `src/hooks/use-tokens.ts`
- Create: `src/app/tokens/page.tsx`

TDD: Table renders columns, sorts on click, sparkline renders SVG. Dense monospace data table with 80x24px amber sparklines inline.

**Commit:** `feat: add token analytics page with sortable table and sparklines`

---

## Task 22: Whale Monitor Page

**Files:**
- Create: `src/components/whales/whale-card.tsx`
- Create: `src/components/whales/whale-feed.tsx`
- Create: `src/components/whales/activity-chart.tsx`
- Create: `src/hooks/use-whale-alerts.ts`
- Create: `src/app/whales/page.tsx`

TDD: Card renders amount/addresses, feed orders reverse-chronological. Framer Motion slide-in from right with amber flash for new alerts.

**Commit:** `feat: add whale monitor page with alert feed`

---

## Task 23: Predictions Page

**Files:**
- Create: `src/components/predictions/prediction-table.tsx`
- Create: `src/components/predictions/verify-modal.tsx`
- Create: `src/hooks/use-predictions.ts`
- Create: `src/app/predictions/page.tsx`

TDD: Table renders prediction rows with BscScan links. Verify modal computes keccak256 client-side and shows match/mismatch.

**Commit:** `feat: add predictions page with on-chain verification`
