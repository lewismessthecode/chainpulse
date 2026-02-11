# ChainPulse Onboarding SOP — From Zero to Running

## Context

This is a step-by-step guide for a brand-new developer (or yourself on a new machine) to get ChainPulse fully running: local dev, smart contract on BSC Testnet, all API integrations working, and AI analysis pipeline operational.

**Prerequisites**: macOS/Linux, Node.js 18+, a web browser, ~1 hour of time.

---

## Phase 1: Clone & Install (5 min)

```bash
git clone <your-repo-url> chainpulse
cd chainpulse
npm install
```

Verify it worked:
```bash
npx vitest run          # Should see 57 tests pass
npx hardhat compile     # Should compile ChainPulseOracle.sol
```

---

## Phase 2: Create Your Wallet (10 min)

You need a crypto wallet for deploying the contract and signing AI predictions. **This is a testnet wallet — no real money involved.**

### Option A: MetaMask (GUI)

1. Install MetaMask browser extension → https://metamask.io
2. Create a new wallet, save your seed phrase
3. **Add BSC Testnet network** to MetaMask:
   - Network name: `BSC Testnet`
   - RPC URL: `https://data-seed-prebsc-1-s1.binance.org:8545`
   - Chain ID: `97`
   - Symbol: `tBNB`
   - Explorer: `https://testnet.bscscan.com`
4. **Export private key**: MetaMask → Account → Account Details → Show Private Key
5. Copy the private key (starts with a hex string, no `0x` prefix needed)

### Option B: Hardhat (CLI, no browser needed)

```bash
node -e "const w = require('ethers').Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey);"
```

Save both the **address** and **private key**.

---

## Phase 3: Get Testnet BNB (5 min)

You need testnet BNB to pay gas fees for deploying the contract and storing predictions.

1. Go to **BSC Testnet Faucet**: https://www.bnbchain.org/en/testnet-faucet
2. Paste your wallet address from Phase 2
3. Request tBNB (you'll get 0.1-0.5 tBNB — more than enough)
4. Wait ~30 seconds, then verify on https://testnet.bscscan.com/address/YOUR_ADDRESS

> If the official faucet is down, try: https://testnet.binance.org/faucet-smart

---

## Phase 4: Get API Keys (15 min)

### 4a. Moralis API Key (whale monitoring)

1. Go to https://moralis.io → Sign Up (free)
2. After login, go to **Settings** → **API Keys**
3. Copy the **API Key** (starts with `eyJ...` or similar long string)
4. Free tier: 40,000 CU/day — more than enough for dev

### 4b. Google Gemini API Key (AI analysis)

1. Go to https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click **Create API Key** → choose any Google Cloud project (or create one)
4. Copy the key (starts with `AI...`)
5. Free tier: 15 requests/minute — enough for development

### 4c. CRON_SECRET (self-generated)

This is a password you make up to protect the cron endpoint. Generate one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output.

---

## Phase 5: Configure Environment (5 min)

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in every value:

```bash
# --- Blockchain ---
NEXT_PUBLIC_BSC_CHAIN_ID=97
NEXT_PUBLIC_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=              # ← leave empty for now, fill after Phase 6
NEXT_PUBLIC_APP_URL=http://localhost:3000

# --- Wallet Keys ---
DEPLOYER_PRIVATE_KEY=your_private_key_from_phase_2
AGENT_PRIVATE_KEY=your_private_key_from_phase_2    # can be the same wallet for dev

# --- API Keys ---
MORALIS_API_KEY=your_moralis_key_from_4a
GEMINI_API_KEY=your_gemini_key_from_4b

# --- Auth ---
CRON_SECRET=your_random_hex_from_4c
```

> **Note**: `DEPLOYER_PRIVATE_KEY` and `AGENT_PRIVATE_KEY` can be the same wallet for development. In production, use separate wallets (deployer = owner, agent = limited writer).

---

## Phase 6: Deploy Smart Contract to BSC Testnet (10 min)

### 6a. Compile

```bash
npx hardhat compile
```

Expected output: `Compiled 1 Solidity file successfully`

### 6b. Run Contract Tests (optional but recommended)

```bash
npx hardhat test
```

Expected: 13 tests pass.

### 6c. Deploy

```bash
npx hardhat ignition deploy ignition/modules/ChainPulseOracle.ts --network bscTestnet
```

**What happens**: Hardhat deploys `ChainPulseOracle.sol` to BSC Testnet. The constructor receives your wallet address as the `agentAddress` (the wallet authorized to write predictions on-chain).

**Expected output** (example):

```
Deploying ChainPulseOracle...
ChainPulseOracle deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

### 6d. Save the Contract Address

Copy the deployed address and paste it into `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### 6e. Verify on BscScan (optional)

Check your contract at: `https://testnet.bscscan.com/address/YOUR_CONTRACT_ADDRESS`

You should see "Contract Creation" transaction.

---

## Phase 7: Start Development Server (2 min)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### What you should see:

| Page | What Loads | Requires |
|------|-----------|----------|
| `/` (Dashboard) | TVL chart, protocol list, volume stats | Nothing (DeFiLlama has no API key) |
| `/tokens` | Top tokens by volume, prices, sparklines | Nothing (GeckoTerminal has no API key) |
| `/whales` | Whale transfer cards with USD values, entity labels | `MORALIS_API_KEY` |
| `/insights` | AI-generated market insights | Run AI analysis first (Phase 8) |
| `/predictions` | On-chain prediction records | `NEXT_PUBLIC_CONTRACT_ADDRESS` |

> **Dashboard and Tokens should load immediately.** If they show data, your setup is working.

---

## Phase 8: Trigger AI Analysis (5 min)

This fetches live market data, sends it to Gemini for analysis, and writes prediction hashes on-chain.

### 8a. Start dev server (if not already running)

```bash
npm run dev
```

### 8b. Trigger via curl

```bash
curl -s http://localhost:3000/api/cron/analyze \
  -H "Authorization: Bearer YOUR_CRON_SECRET" | npx -y json
```

Replace `YOUR_CRON_SECRET` with the value from your `.env.local`.

### 8c. Expected response

```json
{
  "insights": [
    {
      "category": "TREND",
      "title": "BNB Chain TVL Shows Steady Growth",
      "summary": "TVL increased 2.1% in 24h...",
      "sentimentScore": 65,
      "confidence": 80,
      "contentHash": "0xabc123...",
      "predictionId": 0
    }
  ],
  "txHash": "0xdef456..."
}
```

### 8d. Verify on-chain

1. Copy the `txHash` from the response
2. Go to `https://testnet.bscscan.com/tx/YOUR_TX_HASH`
3. You should see a `StorePredictionBatch` transaction

### 8e. Visit the app

- `/insights` → Shows the AI-generated insights
- `/predictions` → Shows on-chain prediction records with content hashes

---

## Phase 9: Verify Everything Works (Checklist)

```bash
# Tests
npx vitest run              # 57 unit tests pass
npx hardhat test            # 13 contract tests pass
npx playwright test         # 6 E2E tests pass (starts dev server automatically)
```

| Check | Command / URL | Expected |
|-------|--------------|----------|
| Dashboard loads | http://localhost:3000 | TVL chart, protocols, volume |
| Tokens load | http://localhost:3000/tokens | Token list with prices |
| Whales load | http://localhost:3000/whales | Whale cards with USD + labels |
| API: overview | `curl http://localhost:3000/api/market/overview` | JSON with tvl, volume, protocols |
| API: whales | `curl http://localhost:3000/api/market/whales` | JSON array with fromLabel, usdValue |
| AI analysis | curl with Bearer token (Phase 8) | Insights + txHash |
| On-chain | BscScan testnet | Contract + tx visible |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `npm run dev` fails | Missing deps | `rm -rf node_modules && npm install` |
| Dashboard shows no data | DeFiLlama API down (rare) | Wait and retry; it has no API key requirement |
| Whales page empty | Missing Moralis key | Check `MORALIS_API_KEY` in `.env.local` |
| AI analysis returns 401 | Wrong CRON_SECRET | Ensure curl header matches `.env.local` value exactly |
| AI analysis fails with "AGENT_PRIVATE_KEY not set" | Missing wallet key | Add `AGENT_PRIVATE_KEY` to `.env.local` |
| Contract deploy fails "insufficient funds" | No testnet BNB | Get more from faucet (Phase 3) |
| Contract deploy fails "accounts is empty" | Missing deployer key | Add `DEPLOYER_PRIVATE_KEY` to `.env.local` |
| Predictions page empty | No contract address or no analysis run | Deploy contract (Phase 6) + run analysis (Phase 8) |
| TypeScript errors | Outdated build | `npm run build` to check, fix any issues |

---

## Quick Reference

| What | Value |
|------|-------|
| BSC Testnet RPC | `https://data-seed-prebsc-1-s1.binance.org:8545` |
| BSC Testnet Chain ID | `97` |
| BSC Testnet Explorer | `https://testnet.bscscan.com` |
| BSC Testnet Faucet | `https://www.bnbchain.org/en/testnet-faucet` |
| Moralis Dashboard | `https://moralis.io` |
| Gemini API Keys | `https://aistudio.google.com/apikey` |
| Dev Server | `http://localhost:3000` |
| Contract | `ChainPulseOracle.sol` (Solidity 0.8.20, OpenZeppelin Ownable) |
