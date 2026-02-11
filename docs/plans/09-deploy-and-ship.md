# Tasks 26-28: Deploy & Ship

> **Status: Pending**
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 26: Deploy to BSC Mainnet

**Step 1:** Get BNB for mainnet (Binance CEX -> BSC wallet, ~$5-10)

**Step 2:** Deploy contract

```bash
npx hardhat run scripts/deploy.ts --network bscMainnet
```

**Step 3:** Verify on BscScan

```bash
npx hardhat verify --network bscMainnet DEPLOYED_ADDRESS "AGENT_ADDRESS"
```

**Step 4:** Update `.env.local` with mainnet values (chain ID 56, mainnet RPC, mainnet contract)

**Step 5:** Seed data — trigger 3-5 analysis cycles

```bash
curl -X POST http://localhost:3000/api/ai/analyze -H "Authorization: Bearer $CRON_SECRET"
```

**Step 6:** Verify predictions on BscScan

**Commit:** `feat: deploy to BSC mainnet and seed predictions`

---

## Task 27: Deploy Frontend to Vercel

**Step 1:** Push to GitHub

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

**Step 2:** Connect to Vercel, set environment variables (all from `.env.local` except `DEPLOYER_PRIVATE_KEY`)

**Step 3:** Configure Vercel cron in `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/analyze", "schedule": "0 */4 * * *" }]
}
```

**Step 4:** Production smoke test — all 5 pages load, data is fresh, proof badges link to mainnet BscScan

**Commit:** `chore: add Vercel cron config`

---

## Task 28: README + Submission

**Files:**
- Create: `README.md`

Write: project overview, architecture diagram, live demo link, contract addresses (testnet + mainnet), setup instructions, tech stack, screenshots, AI Build Log.

Record 2-3 minute demo video. Submit to DoraHacks. Post on X.

**Commit:** `docs: add README with setup instructions and architecture`

---

## Summary

| Task | Description | Tests | Batch |
|------|-------------|-------|-------|
| 1 | Project scaffolding | - | DONE |
| 2-3 | Smart contract (test -> implement) | 14 Hardhat | DONE |
| 4 | Deploy to BSC testnet | Manual verify | 2 |
| 5 | Core types + cache | 5 Vitest | 3 |
| 6 | DeFiLlama client | 4 Vitest | 3 |
| 7 | GeckoTerminal client | 4 Vitest | 3 |
| 8 | BscScan client | 4 Vitest | 3 |
| 9-11 | Market API routes | 8 Vitest | 4 |
| 12-13 | Blockchain helpers + chain API routes | 5 Vitest | 4 |
| 14 | AI prompts + schema | 3 Vitest | 5 |
| 15 | AI analyzer orchestrator | 9 Vitest | 5 |
| 16 | AI API routes | 5 Vitest | 5 |
| 17 | Layout shell | Visual | 6 |
| 18 | Dashboard stats + charts | 3 Vitest | 6 |
| 19 | Dashboard protocol table | 2 Vitest | 6 |
| 20 | AI Insights page | 7 Vitest | 7 |
| 21 | Token Analytics page | 3 Vitest | 7 |
| 22 | Whale Monitor page | 3 Vitest | 7 |
| 23 | Predictions page | 2 Vitest | 7 |
| 24 | Visual polish + responsive | Visual | 8 |
| 25 | E2E tests | 5 Playwright | 8 |
| 26 | Deploy to BSC mainnet | Manual smoke | 9 |
| 27 | Deploy to Vercel | Manual smoke | 9 |
| 28 | README + submission | - | 9 |

**Total automated tests:** 14 Hardhat + ~60 Vitest + 5 Playwright = ~79 tests
