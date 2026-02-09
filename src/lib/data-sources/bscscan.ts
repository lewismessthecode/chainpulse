const BASE_URL = "https://api.bscscan.com/api";

interface BscScanResponse<T> {
  status: string;
  message: string;
  result: T;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  functionName: string;
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
}

interface BnbPriceResult {
  ethusd: string;
  ethusd_timestamp: string;
}

export class BscScanClient {
  private apiKey: string;
  private lastRequest = 0;
  private minInterval = 200; // 5 req/sec

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BSCSCAN_API_KEY || "";
  }

  private async rateLimitedFetch<T>(
    params: Record<string, string>
  ): Promise<T> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;

    if (elapsed < this.minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minInterval - elapsed)
      );
    }

    this.lastRequest = Date.now();

    const query = new URLSearchParams({
      ...params,
      apikey: this.apiKey,
    }).toString();

    const response = await fetch(`${BASE_URL}?${query}`);

    if (!response.ok) {
      throw new Error(`BscScan API HTTP error: ${response.status}`);
    }

    const data = (await response.json()) as BscScanResponse<T>;

    if (data.status === "0" && data.message === "NOTOK") {
      throw new Error(`BscScan API error: ${data.result}`);
    }

    return data.result;
  }

  async getTransactions(
    address: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    return this.rateLimitedFetch<Transaction[]>({
      module: "account",
      action: "txlist",
      address,
      startblock: "0",
      endblock: "99999999",
      page: "1",
      offset: String(limit),
      sort: "desc",
    });
  }

  async getTokenTransfers(
    address: string,
    limit: number = 50
  ): Promise<TokenTransfer[]> {
    return this.rateLimitedFetch<TokenTransfer[]>({
      module: "account",
      action: "tokentx",
      address,
      startblock: "0",
      endblock: "99999999",
      page: "1",
      offset: String(limit),
      sort: "desc",
    });
  }

  async getBnbPrice(): Promise<{ price: number; timestamp: number }> {
    const result = await this.rateLimitedFetch<BnbPriceResult>({
      module: "stats",
      action: "bnbprice",
    });

    return {
      price: parseFloat(result.ethusd),
      timestamp: parseInt(result.ethusd_timestamp, 10),
    };
  }
}

export const bscScan = new BscScanClient();
