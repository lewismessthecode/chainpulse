# Task 4: Deploy Contract to BSC Testnet

> **Status: Pending**
> **Reference:** See `00-reference.md` for design system and env vars.
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Task 4: Deploy Contract to BSC Testnet

**Files:**
- Create: `scripts/deploy.ts`

**Step 1: Write deploy script**

```ts
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const agentAddress = process.env.AGENT_WALLET_ADDRESS || deployer.address;
  const Oracle = await ethers.getContractFactory("ChainPulseOracle");
  const oracle = await Oracle.deploy(agentAddress);
  await oracle.waitForDeployment();

  const address = await oracle.getAddress();
  console.log("ChainPulseOracle deployed to:", address);
  console.log("Agent address:", agentAddress);
  console.log("\nUpdate .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

**Step 2: Get testnet BNB from faucet**

Visit https://www.bnbchain.org/en/testnet-faucet and request tBNB for your deployer wallet.

**Step 3: Deploy to testnet**

```bash
npx hardhat run scripts/deploy.ts --network bscTestnet
```

Expected: Contract address printed. Copy to `.env.local`.

**Step 4: Verify on BscScan**

```bash
npx hardhat verify --network bscTestnet DEPLOYED_ADDRESS "AGENT_ADDRESS"
```

**Step 5: Commit**

```bash
git add scripts/deploy.ts
git commit -m "feat: add deploy script, deploy to BSC testnet"
```
