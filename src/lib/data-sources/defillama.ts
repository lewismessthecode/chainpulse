const BASE_URL = "https://api.llama.fi";

interface TvlDataPoint {
  date: number;
  tvl: number;
}

interface RawProtocol {
  name: string;
  chains: string[];
  tvl: number;
  change_1d: number | null;
  logo?: string;
}

interface BscProtocol {
  name: string;
  tvl: number;
  change24h: number;
  logo: string | undefined;
}

interface DexVolumes {
  totalVolume: number;
  changeVolume1d: number;
  protocols: Array<{ name: string; total24h: number }>;
}

export class DefiLlamaClient {
  private async fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
      throw new Error(`DeFiLlama API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async getBscTvl(): Promise<TvlDataPoint[]> {
    return this.fetchJson("/v2/historicalChainTvl/BSC");
  }

  async getBscProtocols(limit: number = 10): Promise<BscProtocol[]> {
    const all = await this.fetchJson<RawProtocol[]>("/protocols");

    return all
      .filter((p) => p.chains.includes("BSC"))
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, limit)
      .map((p) => ({
        name: p.name,
        tvl: p.tvl,
        change24h: p.change_1d ?? 0,
        logo: p.logo,
      }));
  }

  async getBscDexVolumes(): Promise<DexVolumes> {
    return this.fetchJson("/overview/dexs/BSC");
  }
}

export const defiLlama = new DefiLlamaClient();
