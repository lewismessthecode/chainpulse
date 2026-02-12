import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/market/whales/route";

const mockGetTokenTransfers = vi.fn();
const mockGetTokenPrice = vi.fn();

vi.mock("@/lib/data-sources/moralis", () => ({
  getMoralisClient: () => ({
    getTokenTransfers: (...args: unknown[]) => mockGetTokenTransfers(...args),
    getTokenPrice: (...args: unknown[]) => mockGetTokenPrice(...args),
  }),
}));

vi.mock("@/lib/cache", () => ({
  cache: { get: vi.fn().mockReturnValue(undefined), set: vi.fn() },
}));

function makeTransfer(overrides: Record<string, unknown> = {}) {
  return {
    hash: "0xabc",
    from: "0x111",
    to: "0x222",
    value: "100000000000000000000000",
    tokenName: "Tether USD",
    tokenSymbol: "USDT",
    tokenDecimal: "18",
    timeStamp: "1707000000",
    valueDecimal: 250_255,
    possibleSpam: false,
    securityScore: 98,
    fromEntity: "Binance",
    toEntity: null,
    tokenAddress: "0x55d398326f99059ff775485246999027b3197955",
    ...overrides,
  };
}

describe("GET /api/market/whales", () => {
  beforeEach(() => {
    mockGetTokenTransfers.mockReset();
    mockGetTokenPrice.mockReset();
  });

  it("should return whale alerts with USD values and labels", async () => {
    mockGetTokenTransfers.mockResolvedValue([makeTransfer()]);
    mockGetTokenPrice.mockResolvedValue(1.0);

    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].fromLabel).toBe("Binance");
    expect(data[0].toLabel).toBeNull();
    expect(data[0].usdValue).toBe(250_255);
  });

  it("should filter out spam tokens", async () => {
    mockGetTokenTransfers.mockResolvedValue([
      makeTransfer({ possibleSpam: true, securityScore: 4, tokenSymbol: "SCAM" }),
    ]);
    mockGetTokenPrice.mockResolvedValue(1.0);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });

  it("should filter out low security score tokens", async () => {
    mockGetTokenTransfers.mockResolvedValue([
      makeTransfer({ securityScore: 20, tokenSymbol: "LOW" }),
    ]);
    mockGetTokenPrice.mockResolvedValue(1.0);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });

  it("should filter out transfers below USD threshold", async () => {
    mockGetTokenTransfers.mockResolvedValue([
      makeTransfer({ valueDecimal: 100 }),
    ]);
    mockGetTokenPrice.mockResolvedValue(1.0);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });

  it("should exclude tokens with no price available", async () => {
    mockGetTokenTransfers.mockResolvedValue([makeTransfer()]);
    mockGetTokenPrice.mockRejectedValue(new Error("Not found"));

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });

  it("should sort by USD value descending", async () => {
    mockGetTokenTransfers
      .mockResolvedValueOnce([
        makeTransfer({ hash: "0x1", valueDecimal: 100_000, tokenAddress: "0xA" }),
        makeTransfer({ hash: "0x2", valueDecimal: 500_000, tokenAddress: "0xA" }),
      ])
      .mockResolvedValueOnce([]);
    mockGetTokenPrice.mockResolvedValue(1.0);

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveLength(2);
    expect(data[0].usdValue).toBe(500_000);
    expect(data[1].usdValue).toBe(100_000);
  });
});
