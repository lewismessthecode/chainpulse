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
      totalVolume: 892000000,
      changeVolume1d: -1.2,
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
  });
});
