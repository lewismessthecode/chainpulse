export const chainConfig = {
  rpcUrl:
    process.env.NEXT_PUBLIC_BSC_RPC_URL ||
    "https://data-seed-prebsc-1-s1.binance.org:8545",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  chainId: Number(process.env.NEXT_PUBLIC_BSC_CHAIN_ID || 97),
};
