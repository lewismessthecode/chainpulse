import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefiLlamaClient } from "@/lib/data-sources/defillama";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("DefiLlamaClient", () => {
  let client: DefiLlamaClient;

  beforeEach(() => {
    client = new DefiLlamaClient();
    mockFetch.mockReset();
  });

  it("should fetch BSC TVL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ date: 1707000000, tvl: 4820000000 }]),
    });

    const result = await client.getBscTvl();
    expect(result).toEqual([{ date: 1707000000, tvl: 4820000000 }]);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.llama.fi/v2/historicalChainTvl/BSC"
    );
  });

  it("should fetch BSC protocols", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { name: "PancakeSwap", chains: ["Binance"], tvl: 2100000000, change_1d: 1.8 },
          { name: "Uniswap", chains: ["Ethereum"], tvl: 5000000000, change_1d: 0.5 },
        ]),
    });

    const result = await client.getBscProtocols(10);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("PancakeSwap");
  });

  it("should fetch DEX volumes for BSC", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          total24h: 892000000,
          change_1d: -1.2,
          totalDataChart: [[1707000000, 500000000], [1707100000, 600000000]],
          protocols: [],
        }),
    });

    const result = await client.getBscDexVolumes();
    expect(result.total24h).toBe(892000000);
    expect(result.totalDataChart).toHaveLength(2);
    expect(result.totalDataChart[0]).toEqual([1707000000, 500000000]);
  });

  it("should throw on API errors", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(client.getBscTvl()).rejects.toThrow();
  });
});
