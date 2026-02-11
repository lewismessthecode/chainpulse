import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeckoTerminalClient } from "@/lib/data-sources/geckoterminal";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("GeckoTerminalClient", () => {
  let client: GeckoTerminalClient;

  beforeEach(() => {
    client = new GeckoTerminalClient();
    mockFetch.mockReset();
  });

  it("should fetch trending pools on BSC", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "bsc_0x123",
              attributes: {
                name: "CAKE/WBNB",
                base_token_price_usd: "2.45",
                quote_token_price_usd: "312.50",
                volume_usd: { h24: "1500000" },
                reserve_in_usd: "5000000",
                price_change_percentage: { h24: "3.2" },
              },
            },
          ],
        }),
    });

    const result = await client.getTrendingPools();
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("CAKE/WBNB");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("networks/bsc/trending_pools"),
      expect.any(Object)
    );
  });

  it("should fetch top pools sorted by volume", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "bsc_0x456",
              attributes: {
                name: "BNB/USDT",
                base_token_price_usd: "312.50",
                quote_token_price_usd: "1.00",
                volume_usd: { h24: "8000000" },
                reserve_in_usd: "20000000",
                price_change_percentage: { h24: "-0.5" },
              },
            },
          ],
        }),
    });

    const result = await client.getTopPools("h24_volume_usd_desc", 10);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("BNB/USDT");
  });

  it("should fetch token info by address", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: "bsc_0x789",
            attributes: {
              name: "PancakeSwap Token",
              symbol: "CAKE",
              price_usd: "2.45",
              volume_usd: { h24: "50000000" },
            },
          },
        }),
    });

    const result = await client.getTokenInfo("0x789");
    expect(result.name).toBe("PancakeSwap Token");
    expect(result.symbol).toBe("CAKE");
  });

  it("should fetch pool OHLCV data and return close prices", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            attributes: {
              ohlcv_list: [
                [1707000000, 2.40, 2.50, 2.35, 2.45, 100000],
                [1707003600, 2.45, 2.55, 2.40, 2.50, 120000],
              ],
            },
          },
        }),
    });

    const result = await client.getPoolOhlcv("0x123");
    expect(result).toEqual([2.45, 2.50]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("pools/0x123/ohlcv/hour"),
      expect.any(Object)
    );
  });

  it("should return empty array on OHLCV fetch failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });

    const result = await client.getPoolOhlcv("0x123");
    expect(result).toEqual([]);
  });

  it("should throw on API errors", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(client.getTrendingPools()).rejects.toThrow();
  });
});
