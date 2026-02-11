const BASE_URL = "https://deep-index.moralis.io/api/v2.2";

interface MoralisTransfer {
  transaction_hash: string;
  from_address: string;
  to_address: string;
  value: string;
  token_name: string;
  token_symbol: string;
  token_decimals: string;
  block_timestamp: string;
  value_decimal: string;
  possible_spam: boolean;
  security_score: number;
  from_address_entity: string | null;
  to_address_entity: string | null;
  address: string;
}

interface MoralisResponse {
  result: MoralisTransfer[];
  cursor?: string;
  page: number;
  page_size: number;
}

interface MoralisPriceResponse {
  usdPrice: number;
  tokenSymbol: string;
}

export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  timeStamp: string;
  valueDecimal: number;
  possibleSpam: boolean;
  securityScore: number;
  fromEntity: string | null;
  toEntity: string | null;
  tokenAddress: string;
}

function toUnixSeconds(iso: string): string {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) {
    return "0";
  }
  return String(Math.floor(ms / 1000));
}

function mapTransfer(t: MoralisTransfer): TokenTransfer {
  return {
    hash: t.transaction_hash,
    from: t.from_address,
    to: t.to_address,
    value: t.value,
    tokenName: t.token_name,
    tokenSymbol: t.token_symbol,
    tokenDecimal: t.token_decimals,
    timeStamp: toUnixSeconds(t.block_timestamp),
    valueDecimal: parseFloat(t.value_decimal) || 0,
    possibleSpam: t.possible_spam ?? false,
    securityScore: t.security_score ?? 0,
    fromEntity: t.from_address_entity ?? null,
    toEntity: t.to_address_entity ?? null,
    tokenAddress: t.address ?? "",
  };
}

export class MoralisClient {
  private apiKey: string;
  private lastRequest = 0;
  private minInterval = 40; // ~25 req/sec (50 CU each, 40k CU/day)

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.MORALIS_API_KEY || "";
  }

  private async apiFetch<T>(url: string): Promise<T> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;

    if (elapsed < this.minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minInterval - elapsed)
      );
    }

    this.lastRequest = Date.now();

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "X-API-Key": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Moralis API HTTP error: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getTokenTransfers(
    address: string,
    limit: number = 50
  ): Promise<TokenTransfer[]> {
    const url = `${BASE_URL}/${address}/erc20/transfers?chain=bsc&limit=${limit}`;
    const data = await this.apiFetch<MoralisResponse>(url);
    return data.result.map(mapTransfer);
  }

  async getTokenPrice(tokenAddress: string): Promise<number> {
    const url = `${BASE_URL}/erc20/${tokenAddress}/price?chain=bsc`;
    const data = await this.apiFetch<MoralisPriceResponse>(url);
    return data.usdPrice;
  }
}

export const moralis = new MoralisClient();
