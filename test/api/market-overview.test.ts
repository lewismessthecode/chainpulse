import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/market/overview/route";

vi.mock("@/lib/data-sources/defillama", () => ({
  defiLlama: {
    getBscTvl: vi.fn().mockResolvedValue([
      { date: 1707000000, tvl: 4820000000 },
      { date: 1706900000, tvl: 4700000000 },
    ]),
    getBscProtocols: vi.fn().mockResolvedValue([
      { name: "PancakeSwap", tvl: 2100000000, change24h: 1.8 },
    ]),
    getBscDexVolumes: vi.fn().mockResolvedValue({
      total24h: 892000000,
      change_1d: -1.2,
      totalDataChart: [[1707000000, 500000000], [1707100000, 600000000]],
    }),
  },
}));

vi.mock("@/lib/cache", () => ({
  cache: { get: vi.fn().mockReturnValue(undefined), set: vi.fn() },
}));

describe("GET /api/market/overview", () => {
  it("should return market overview with correct shape", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("tvl");
    expect(data).toHaveProperty("volume");
    expect(data).toHaveProperty("topProtocols");
    expect(data.tvl).toHaveProperty("current");
    expect(data.tvl).toHaveProperty("history");
    expect(data.volume.current).toBe(892000000);
    expect(data.volume.history).toHaveLength(2);
    expect(data.volume.history[0]).toHaveProperty("date");
    expect(data.volume.history[0]).toHaveProperty("value");
  });
});
