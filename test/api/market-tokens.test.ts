import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/market/tokens/route";

vi.mock("@/lib/data-sources/geckoterminal", () => ({
  geckoTerminal: {
    getTopPools: vi.fn().mockResolvedValue([
      {
        id: "bsc_0x123",
        name: "CAKE/WBNB",
        price: 2.45,
        volume24h: 1500000,
        liquidity: 5000000,
        priceChange24h: 3.2,
      },
    ]),
  },
}));

vi.mock("@/lib/cache", () => ({
  cache: { get: vi.fn().mockReturnValue(undefined), set: vi.fn() },
}));

describe("GET /api/market/tokens", () => {
  it("should return tokens array", async () => {
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("name");
    expect(data[0]).toHaveProperty("price");
  });
});
