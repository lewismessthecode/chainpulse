const BASE_URL = "https://api.geckoterminal.com/api/v2";
const NETWORK = "bsc";
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const QUEUE_POLL_MS = 2_000;

interface PoolAttributes {
  name: string;
  base_token_price_usd: string;
  quote_token_price_usd: string;
  volume_usd: { h24: string };
  reserve_in_usd: string;
  price_change_percentage: { h24: string };
}

interface PoolData {
  id: string;
  attributes: PoolAttributes;
}

interface TokenAttributes {
  name: string;
  symbol: string;
  price_usd: string;
  volume_usd: { h24: string };
}

export interface Pool {
  id: string;
  name: string;
  price: number;
  volume24h: number;
  liquidity: number;
  priceChange24h: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  price: number;
  volume24h: number;
}

function mapPoolData(pool: PoolData): Pool {
  return {
    id: pool.id,
    name: pool.attributes.name,
    price: parseFloat(pool.attributes.base_token_price_usd),
    volume24h: parseFloat(pool.attributes.volume_usd.h24),
    liquidity: parseFloat(pool.attributes.reserve_in_usd),
    priceChange24h: parseFloat(pool.attributes.price_change_percentage.h24),
  };
}

export class GeckoTerminalClient {
  private queue: Array<() => void> = [];
  private processing = false;
  private requestCount = 0;
  private windowStart = Date.now();

  private async rateLimitedFetch<T>(path: string): Promise<T> {
    await this.waitForSlot();

    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`GeckoTerminal API error: ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  private waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      this.resetWindowIfExpired();

      if (this.requestCount < RATE_LIMIT) {
        this.requestCount++;
        resolve();
        return;
      }

      this.queue.push(resolve);
      this.processQueue();
    });
  }

  private resetWindowIfExpired(): void {
    if (Date.now() - this.windowStart > RATE_WINDOW_MS) {
      this.requestCount = 0;
      this.windowStart = Date.now();
    }
  }

  private processQueue(): void {
    if (this.processing) return;
    this.processing = true;

    const interval = setInterval(() => {
      this.resetWindowIfExpired();

      while (this.queue.length > 0 && this.requestCount < RATE_LIMIT) {
        this.requestCount++;
        const next = this.queue.shift();
        next?.();
      }

      if (this.queue.length === 0) {
        clearInterval(interval);
        this.processing = false;
      }
    }, QUEUE_POLL_MS);
  }

  async getTrendingPools(): Promise<Pool[]> {
    const data = await this.rateLimitedFetch<{ data: PoolData[] }>(
      `/networks/${NETWORK}/trending_pools`
    );
    return data.data.map(mapPoolData);
  }

  async getTopPools(
    sort: string = "h24_volume_usd_desc",
    limit: number = 20
  ): Promise<Pool[]> {
    const data = await this.rateLimitedFetch<{ data: PoolData[] }>(
      `/networks/${NETWORK}/pools?sort=${sort}&page=1`
    );
    return data.data.slice(0, limit).map(mapPoolData);
  }

  async getTokenInfo(address: string): Promise<TokenInfo> {
    const data = await this.rateLimitedFetch<{
      data: { id: string; attributes: TokenAttributes };
    }>(`/networks/${NETWORK}/tokens/${address}`);

    return {
      name: data.data.attributes.name,
      symbol: data.data.attributes.symbol,
      price: parseFloat(data.data.attributes.price_usd),
      volume24h: parseFloat(data.data.attributes.volume_usd.h24),
    };
  }
}

export const geckoTerminal = new GeckoTerminalClient();
