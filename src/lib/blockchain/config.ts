export const chainConfig = {
  rpcUrl:
    process.env.NEXT_PUBLIC_BSC_RPC_URL ||
    "https://bsc-testnet-rpc.publicnode.com",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  chainId: Number(process.env.NEXT_PUBLIC_BSC_CHAIN_ID || 97),
};
