# Tasks 24-25: Visual Polish & E2E Tests

> **Status: Pending**
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 24: Visual Polish + Responsive

**Files:**
- Modify: multiple component files
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/components/shared/loading-skeleton.tsx`

**Step 1:** Add staggered fade-in-up page load animations (framer-motion `motion.div` with `delay` prop)

**Step 2:** Add noise texture overlay to cards via CSS `::before` pseudo-element

**Step 3:** Ensure all numbers use `font-variant-numeric: tabular-nums`

**Step 4:** Build mobile bottom tab bar, test at 375px width

**Step 5:** Add loading skeletons for all data-fetching components

**Step 6:** Create `public/favicon.svg` (amber pulse line icon)

**Step 7:** Add OpenGraph meta tags to `layout.tsx`

**Commit:** `feat: add visual polish, animations, and responsive design`

---

## Task 25: E2E Tests

**Files:**
- Create: `test/e2e/critical-path.spec.ts`
- Create: `playwright.config.ts`

**Step 1: Configure Playwright**

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true },
});
```

**Step 2: Write E2E tests**

```ts
// test/e2e/critical-path.spec.ts
import { test, expect } from "@playwright/test";

test("dashboard loads and shows market data", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=TOTAL VALUE LOCKED")).toBeVisible();
  await expect(page.locator("text=24H VOLUME")).toBeVisible();
});

test("navigate to insights page", async ({ page }) => {
  await page.goto("/insights");
  await expect(page.locator("h1")).toContainText("Insights");
});

test("navigate to tokens page", async ({ page }) => {
  await page.goto("/tokens");
  await expect(page.locator("table")).toBeVisible();
});

test("navigate to whales page", async ({ page }) => {
  await page.goto("/whales");
  await expect(page.locator("h1")).toContainText("Whale");
});

test("mobile viewport shows bottom nav", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar"]')).toBeHidden();
});
```

**Step 3: Run E2E**

```bash
npx playwright test
```

**Commit:** `test: add Playwright E2E tests for critical paths`
