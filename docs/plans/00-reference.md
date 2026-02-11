# ChainPulse — Reference & Shared Context

> **For Claude:** This file contains shared design tokens, env vars, and architecture context referenced by all task files. Read this FIRST before any task file.

**Goal:** Build an AI-powered onchain market intelligence dashboard for BNB Chain DeFi that stores prediction hashes on-chain for verifiable accountability.

**Architecture:** Next.js 14 App Router frontend fetches BSC market data from DeFiLlama/GeckoTerminal/BscScan, feeds it to Gemini AI for analysis, stores prediction hashes on a Solidity contract on BSC, and displays everything in a distinctive "Obsidian Terminal" dark dashboard. SWR for client state, JSON file store server-side, no database.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Ethers.js v6, Hardhat, Solidity, Google Gemini API, Vitest, Playwright

---

## Design System ("Obsidian Terminal")

> Keep this section as reference. Do NOT skip it — every component must follow these specs.

### Colors (CSS Variables for `globals.css`)

```css
:root {
  --bg-void: #000000;
  --bg-surface: #0A0A0A;
  --bg-elevated: #111111;
  --bg-overlay: #141414;
  --border-subtle: #1A1A1A;
  --border-muted: #252525;
  --border-active: #E2A336;
  --text-primary: #E8E4DD;
  --text-secondary: #8A8580;
  --text-muted: #4A4744;
  --amber: #E2A336;
  --amber-dim: #C48A20;
  --amber-glow: rgba(226, 163, 54, 0.15);
  --amber-faint: rgba(226, 163, 54, 0.06);
  --positive: #34D399;
  --positive-dim: rgba(52, 211, 153, 0.12);
  --negative: #F87171;
  --negative-dim: rgba(248, 113, 113, 0.12);
  --chart-line: #E2A336;
  --chart-fill: rgba(226, 163, 54, 0.08);
  --chart-grid: #1A1A1A;
}
```

### Typography

| Role | Font | Usage |
|------|------|-------|
| Display | `Instrument Serif`, Georgia, serif | Page titles, section headers, insight titles |
| Data | `JetBrains Mono`, monospace | Prices, hashes, tx IDs, all numbers |
| Body | `Plus Jakarta Sans`, system-ui | Labels, descriptions, buttons, nav |

### Rules

- Border-radius: **always 0** (sharp corners everywhere)
- Cards: `bg-surface border border-[#1A1A1A] hover:border-amber transition-colors duration-150`
- Labels: 11px uppercase `letter-spacing: 0.08em` color `text-muted`
- Stats: 48px JetBrains Mono `tabular-nums`
- Tables: horizontal dividers only, no zebra, no vertical borders
- Animations: ease-out only. NO bounce/spring/elastic.
- Signature: animated SVG "pulse line" (ECG heartbeat) in amber on insight cards

### Tailwind Config Additions

```ts
colors: {
  void: '#000000', surface: '#0A0A0A', elevated: '#111111',
  amber: { DEFAULT: '#E2A336', dim: '#C48A20' },
  warm: { white: '#E8E4DD', gray: '#8A8580', muted: '#4A4744' },
},
fontFamily: {
  display: ['Instrument Serif', 'Georgia', 'serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
},
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_BSC_CHAIN_ID=97
NEXT_PUBLIC_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
AGENT_PRIVATE_KEY=0x...
DEPLOYER_PRIVATE_KEY=0x...
BSCSCAN_API_KEY=...
GEMINI_API_KEY=...
CRON_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Task Index

| File | Tasks | Status |
|------|-------|--------|
| `01-scaffolding-and-contract.md` | 1-3 | DONE |
| `02-deploy-contract.md` | 4 | Pending |
| `03-core-types-and-data-sources.md` | 5-8 | Pending |
| `04-market-api-routes.md` | 9-11 | Pending |
| `05-blockchain-and-ai-engine.md` | 12-16 | Pending |
| `06-layout-and-dashboard.md` | 17-19 | Pending |
| `07-feature-pages.md` | 20-23 | Pending |
| `08-polish-and-testing.md` | 24-25 | Pending |
| `09-deploy-and-ship.md` | 26-28 | Pending |
