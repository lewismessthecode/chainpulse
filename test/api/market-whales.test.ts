import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/market/whales/route";

vi.mock("@/lib/data-sources/bscscan", () => ({
  bscScan: {
    getTokenTransfers: vi.fn().mockResolvedValue([
      {
        hash: "0xabc",
        from: "0x111",
        to: "0x222",
        value: "100000000000000000000000",
        tokenName: "BUSD",
        tokenSymbol: "BUSD",
        tokenDecimal: "18",
        timeStamp: "1707000000",
      },
      {
        hash: "0xdef",
        from: "0x333",
        to: "0x444",
        value: "100",
        tokenName: "Small",
        tokenSymbol: "SML",
        tokenDecimal: "18",
        timeStamp: "1707000001",
      },
    ]),
    getBnbPrice: vi
      .fn()
      .mockResolvedValue({ price: 312.5, timestamp: 1707000000 }),
  },
}));

vi.mock("@/lib/cache", () => ({
  cache: { get: vi.fn().mockReturnValue(undefined), set: vi.fn() },
}));

describe("GET /api/market/whales", () => {
  it("should return whale alerts array", async () => {
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
  });
});
