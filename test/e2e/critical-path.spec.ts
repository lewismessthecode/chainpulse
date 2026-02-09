import { test, expect } from "@playwright/test";

test("dashboard loads and shows market data labels", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=TOTAL VALUE LOCKED")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("text=DEX VOLUME")).toBeVisible();
});

test("navigate to insights page", async ({ page }) => {
  await page.goto("/insights");
  await expect(page.locator("h1")).toContainText("Insights");
});

test("navigate to tokens page", async ({ page }) => {
  await page.goto("/tokens");
  await expect(page.locator("h1")).toContainText("Token");
});

test("navigate to whales page", async ({ page }) => {
  await page.goto("/whales");
  await expect(page.locator("h1")).toContainText("Whale");
});

test("navigate to predictions page", async ({ page }) => {
  await page.goto("/predictions");
  await expect(page.locator("h1")).toContainText("Prediction");
});

test("mobile viewport shows bottom nav", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('[data-testid="sidebar"]')).toBeHidden();
});
