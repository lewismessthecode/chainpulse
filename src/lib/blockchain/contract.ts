import { ethers } from "ethers";
import { chainConfig } from "./config";
import { abi } from "./abi";

const bscNetwork = ethers.Network.from(chainConfig.chainId);

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(chainConfig.rpcUrl, bscNetwork, {
    staticNetwork: bscNetwork,
  });
}

export function getReadContract(): ethers.Contract {
  return new ethers.Contract(chainConfig.contractAddress, abi, getProvider());
}

export function getWriteContract(): ethers.Contract {
  const privateKey = process.env.AGENT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("AGENT_PRIVATE_KEY not set");
  }

  const wallet = new ethers.Wallet(privateKey, getProvider());
  return new ethers.Contract(chainConfig.contractAddress, abi, wallet);
}
