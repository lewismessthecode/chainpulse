# ChainPulse Runbook

> Auto-generated from `package.json` and `.env.example` on 2026-02-13

## Deployment

### Frontend (Vercel)

1. Push to `main` branch triggers auto-deploy
2. Set all env vars from `.env.example` in Vercel dashboard (except `DEPLOYER_PRIVATE_KEY`)
3. Configure cron in `vercel.json` (daily, midnight UTC — Hobby plan limit):
   ```json
   { "crons": [{ "path": "/api/cron/analyze", "schedule": "0 0 * * *" }] }
   ```

### Smart Contract (BSC)

```bash
npx hardhat compile
npx hardhat test                    # verify before deploy
npm run deploy:testnet              # BSC Testnet
```

For mainnet:
```bash
npx hardhat ignition deploy ignition/modules/ChainPulseOracle.ts --network bscMainnet
npx hardhat verify --network bscMainnet <ADDRESS> "<AGENT_ADDRESS>"
```

Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in env after deploy.

### Production Build

```bash
npm run build    # creates .next/ output
npm run start    # serves production build
```

## Monitoring

### Health Checks

| Endpoint | Method | Expected | Check |
|----------|--------|----------|-------|
| `/api/market/overview` | GET | 200 + JSON with `tvl` | DeFiLlama connectivity |
| `/api/market/tokens` | GET | 200 + JSON array | GeckoTerminal connectivity |
| `/api/market/whales` | GET | 200 + JSON with `transfers` | Moralis connectivity |
| `/api/ai/insights` | GET | 200 + JSON with `insights` | Insights data available |
| `/api/chain/predictions` | GET | 200 + JSON | BSC RPC + contract reachable |

### Cron Job (AI Analysis)

Triggered via `GET /api/cron/analyze` with `Authorization: Bearer <CRON_SECRET>`.

Verify cron is running:
```bash
curl -s http://localhost:3000/api/cron/analyze \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected: `{"success": true, "insightCount": 3, "txHash": "0x..."}`

### Key Metrics to Watch

- Vercel Blob storage usage (insights stored as `insights.json` blob in production)
- BSC wallet balance (needs tBNB/BNB for gas)
- Moralis CU usage (40k/day free tier)
- GeckoTerminal rate limit (30 req/min)

## Common Issues and Fixes

### Server Won't Start

| Error | Cause | Fix |
|-------|-------|-----|
| `EnvHttpProxyAgent is not a constructor` | Node.js built-in undici missing class | Install `undici` npm package: `npm install undici` |
| `EADDRINUSE: address already in use :::3000` | Port occupied | `lsof -ti:3000 \| xargs kill -9` |
| `MODULE_NOT_FOUND` | Missing deps | `rm -rf node_modules && npm install` |

### API Routes Return Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `fetch failed` on analyze | Proxy misconfigured for localhost | Ensure `NO_PROXY=localhost,127.0.0.1` in `.env.local` |
| `fetch failed` on external APIs | Behind proxy without config | Set `HTTPS_PROXY` and `NO_PROXY` in `.env.local` |
| 401 on `/api/ai/analyze` | Wrong CRON_SECRET | Match Bearer token to `.env.local` value |
| 500 on `/api/market/whales` | Invalid Moralis key | Verify `MORALIS_API_KEY` at moralis.io |
| Empty insights | AI analysis never triggered | `POST /api/ai/analyze` with Bearer token |

### Blockchain Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `AGENT_PRIVATE_KEY not set` | Missing env var | Add to `.env.local` |
| `insufficient funds` | Wallet out of BNB | Get tBNB from [faucet](https://www.bnbchain.org/en/testnet-faucet) |
| `execution reverted: Not authorized` | Wrong wallet | Ensure `AGENT_PRIVATE_KEY` matches contract's `agentAddress` |
| Contract reads fail | Wrong contract address | Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` matches deployed contract |

### Proxy Issues (Node.js 24)

Node.js 24's built-in undici does **not** include `EnvHttpProxyAgent`. The project installs `undici` from npm to get proxy support. The `src/instrumentation.ts` file configures the global fetch dispatcher.

If behind a proxy:
```bash
# .env.local
HTTPS_PROXY=http://127.0.0.1:1082
NO_PROXY=localhost,127.0.0.1
```

`EnvHttpProxyAgent` respects `NO_PROXY`, so localhost calls (used by the analyze route) bypass the proxy while external API calls go through it.

## Rollback Procedures

### Frontend Rollback (Vercel)

1. Go to Vercel dashboard > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

### Smart Contract

The contract is immutable once deployed. To "rollback":

1. Deploy a new contract instance
2. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` to the new address
3. Redeploy frontend
4. Old predictions remain on-chain at the old address

### Data Rollback

Insights are stored in **Vercel Blob** (production) or `data/insights.json` (local dev). Max 500 insights are retained.

**Production (Vercel Blob):**
```bash
# Delete the blob via Vercel dashboard or Vercel Blob API, then re-trigger:
curl -X POST https://your-app.vercel.app/api/ai/analyze \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Local dev:**
```bash
rm data/insights.json
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Architecture Quick Reference

```
External APIs (DeFiLlama, GeckoTerminal, Moralis)
  -> Next.js API Routes (server, TTL cache)
    -> SWR Hooks (client, refresh intervals)
      -> React Components

POST /api/ai/analyze
  -> Fetch market data from own API routes
  -> Gemini AI generates insights
  -> Write prediction hashes on-chain (ChainPulseOracle)
  -> Save insights to data/insights.json
```

### SWR Refresh Intervals

| Hook | Endpoint | Interval |
|------|----------|----------|
| `useMarketData` | `/api/market/overview` | 60s |
| `useTokens` | `/api/market/tokens` | 120s |
| `useWhaleAlerts` | `/api/market/whales` | 60s |
| `useInsights` | `/api/ai/insights` | 120s |
| `usePredictions` | `/api/chain/predictions` | 120s |
