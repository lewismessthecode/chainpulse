# Tasks 17-19: Layout Shell & Dashboard

> **Status: Pending**
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 17: Layout Shell (Sidebar + Header)

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/shared/live-indicator.tsx`

**Step 1: Implement layout.tsx** with Google Fonts (Instrument Serif, JetBrains Mono, Plus Jakarta Sans), dark body class, sidebar + main content area.

**Step 2: Implement sidebar** — 56px fixed left, Lucide icons (LayoutDashboard, Brain, Coins, Fish, History), amber active state, pulsing live indicator at bottom.

**Step 3: Implement header** — Instrument Serif page title, date display, live indicator.

**Step 4: Run dev server and visual check**

```bash
npm run dev
```

Expected: Black background, sidebar with amber accents, correct fonts loading.

**Commit:** `feat: add layout shell with Obsidian Terminal design system`

---

## Task 18: Dashboard Page — Stats Cards + Charts

**Files:**
- Create: `src/components/dashboard/stats-card.tsx`
- Create: `src/components/shared/animated-number.tsx`
- Create: `src/components/dashboard/tvl-chart.tsx`
- Create: `src/components/dashboard/volume-chart.tsx`
- Create: `src/hooks/use-market-data.ts`
- Modify: `src/app/page.tsx`

**Step 1: Write component tests**

```ts
// test/components/stats-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "@/components/dashboard/stats-card";

describe("StatsCard", () => {
  it("renders label and value", () => {
    render(<StatsCard label="TOTAL VALUE LOCKED" value={4820000000} prefix="$" change={2.4} />);
    expect(screen.getByText("TOTAL VALUE LOCKED")).toBeInTheDocument();
  });

  it("shows positive change in green", () => {
    render(<StatsCard label="TVL" value={100} change={2.4} />);
    const change = screen.getByText(/2.4%/);
    expect(change.className).toContain("text-[#34D399]");
  });

  it("shows negative change in red", () => {
    render(<StatsCard label="TVL" value={100} change={-1.2} />);
    const change = screen.getByText(/1.2%/);
    expect(change.className).toContain("text-[#F87171]");
  });
});
```

**Step 2: Run to fail, implement components, run to pass**

**Step 3: Wire up dashboard page** with SWR hook calling `/api/market/overview`. Four stats cards at top, TVL area chart + volume bar chart below, using Recharts with amber styling.

**Step 4: Visual check** — `npm run dev`, verify amber charts, sharp corners, correct fonts.

**Commit:** `feat: add dashboard page with stats cards and charts`

---

## Task 19: Dashboard Page — Protocol Table

**Files:**
- Create: `src/components/dashboard/protocol-table.tsx`

TDD: Test renders rows, test sorts by column. Implement with sharp borders, monospace numbers, horizontal dividers only.

**Commit:** `feat: add protocol table to dashboard`
