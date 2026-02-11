# Tasks 1-3: Scaffolding & Smart Contract

> **Status: DONE** — All 3 tasks completed, 14/14 Hardhat tests passing.
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 1: Project Scaffolding ✅

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `hardhat.config.ts`, `vitest.config.ts`
- Create: `.env.example`, `.gitignore`

**Step 1: Initialize Next.js project**

```bash
cd /Users/lewisliu/Dev/playground/good-vibes-only
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

**Step 2: Install all dependencies**

```bash
npm install ethers@^6.11.0 swr@^2.2.0 recharts@^2.12.0 framer-motion@^11.0.0 @google/generative-ai zod date-fns lucide-react class-variance-authority clsx tailwind-merge
npm install -D hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test prettier
```

**Step 3-10:** Configure Hardhat, Vitest, shadcn/ui, design system CSS, Tailwind config, .env.example.

**Step 11: Commit**
```bash
git commit -m "chore: scaffold Next.js 14 + Hardhat + shadcn/ui + design system"
```

---

## Task 2: Smart Contract — Write Failing Tests ✅

**Files:**
- Create: `contracts/ChainPulseOracle.sol` (empty placeholder)
- Create: `test/contracts/ChainPulseOracle.test.ts`

14 tests covering: Deployment, storePrediction, storePredictionBatch, verifyPrediction, getLatestPredictions, setAgentAddress.

**Commit:** `test: add ChainPulseOracle contract tests (red)`

---

## Task 3: Smart Contract — Implement to Pass ✅

**Files:**
- Modify: `contracts/ChainPulseOracle.sol`

Full implementation with Ownable, Prediction struct, all methods. **14/14 tests passing.**

**Commit:** `feat: implement ChainPulseOracle contract (green)`
