const chainId = Number(process.env.NEXT_PUBLIC_BSC_CHAIN_ID || 97);

export const chainConfig = {
  rpcUrl:
    process.env.NEXT_PUBLIC_BSC_RPC_URL ||
    "https://bsc-testnet-rpc.publicnode.com",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  chainId,
  explorerUrl: chainId === 56
    ? "https://bscscan.com"
    : "https://testnet.bscscan.com",
};
