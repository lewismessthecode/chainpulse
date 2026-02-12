import { describe, it, expect, vi, beforeEach } from "vitest";
import { MoralisClient } from "@/lib/data-sources/moralis";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const ADDR_A = "0x1111111111111111111111111111111111111111";
const ADDR_B = "0x2222222222222222222222222222222222222222";
const ADDR_C = "0x3333333333333333333333333333333333333333";
const ADDR_D = "0x4444444444444444444444444444444444444444";
const TOKEN_ADDR = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const BUSD_ADDR = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const USDT_ADDR = "0xcccccccccccccccccccccccccccccccccccccccc";

function makeMoralisTransfer(overrides: Record<string, unknown> = {}) {
  return {
    transaction_hash: "0xabc123",
    from_address: ADDR_A,
    to_address: ADDR_B,
    value: "5000000000000000000",
    token_name: "PancakeSwap Token",
    token_symbol: "CAKE",
    token_decimals: "18",
    block_timestamp: "2024-02-04T12:00:00.000Z",
    value_decimal: "5.0",
    possible_spam: false,
    security_score: 92,
    from_address_entity: "Binance",
    to_address_entity: null,
    address: TOKEN_ADDR,
    ...overrides,
  };
}

describe("MoralisClient", () => {
  let client: MoralisClient;

  beforeEach(() => {
    client = new MoralisClient("test-api-key");
    mockFetch.mockReset();
  });

  it("should fetch token transfers with correct URL and headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          result: [makeMoralisTransfer()],
          page: 0,
          page_size: 10,
        }),
    });

    const result = await client.getTokenTransfers(ADDR_A, 10);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        `deep-index.moralis.io/api/v2.2/${ADDR_A.toLowerCase()}/erc20/transfers?chain=bsc&limit=10`
      ),
      expect.objectContaining({
        headers: {
          accept: "application/json",
          "X-API-Key": "test-api-key",
        },
      })
    );
    expect(result.length).toBe(1);
  });

  it("should map Moralis response to TokenTransfer format with new fields", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          result: [
            makeMoralisTransfer({
              transaction_hash: "0xdef456",
              from_address: ADDR_C,
              to_address: ADDR_D,
              value: "100000000000000000000",
              token_name: "BUSD Token",
              token_symbol: "BUSD",
              token_decimals: "18",
              value_decimal: "100.0",
              possible_spam: false,
              security_score: 95,
              from_address_entity: "Binance",
              to_address_entity: "PancakeSwap",
              address: BUSD_ADDR,
            }),
          ],
          page: 0,
          page_size: 50,
        }),
    });

    const result = await client.getTokenTransfers(ADDR_C);

    expect(result[0]).toEqual({
      hash: "0xdef456",
      from: ADDR_C,
      to: ADDR_D,
      value: "100000000000000000000",
      tokenName: "BUSD Token",
      tokenSymbol: "BUSD",
      tokenDecimal: "18",
      timeStamp: String(
        Math.floor(new Date("2024-02-04T12:00:00.000Z").getTime() / 1000)
      ),
      valueDecimal: 100.0,
      possibleSpam: false,
      securityScore: 95,
      fromEntity: "Binance",
      toEntity: "PancakeSwap",
      tokenAddress: BUSD_ADDR,
    });
  });

  it("should throw on API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(client.getTokenTransfers(ADDR_A, 10)).rejects.toThrow(
      "Moralis API HTTP error: 401"
    );
  });

  it("should handle empty results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          result: [],
          page: 0,
          page_size: 50,
        }),
    });

    const result = await client.getTokenTransfers(ADDR_A, 10);
    expect(result).toEqual([]);
  });

  it("should default missing optional fields safely", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          result: [
            {
              transaction_hash: "0xmin",
              from_address: ADDR_A,
              to_address: ADDR_B,
              value: "1000",
              token_name: "Unknown",
              token_symbol: "UNK",
              token_decimals: "18",
              block_timestamp: "2024-02-04T12:00:00.000Z",
            },
          ],
          page: 0,
          page_size: 50,
        }),
    });

    const result = await client.getTokenTransfers(ADDR_A);

    expect(result[0].possibleSpam).toBe(false);
    expect(result[0].securityScore).toBe(0);
    expect(result[0].fromEntity).toBeNull();
    expect(result[0].toEntity).toBeNull();
    expect(result[0].tokenAddress).toBe("");
    expect(result[0].valueDecimal).toBe(0);
  });

  it("should reject invalid addresses", async () => {
    await expect(client.getTokenTransfers("bad-address")).rejects.toThrow(
      "Invalid Ethereum address"
    );
  });

  describe("getTokenPrice", () => {
    it("should fetch token price with correct URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            usdPrice: 1.0001,
            tokenSymbol: "USDT",
          }),
      });

      const price = await client.getTokenPrice(USDT_ADDR);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `deep-index.moralis.io/api/v2.2/erc20/${USDT_ADDR.toLowerCase()}/price?chain=bsc`
        ),
        expect.objectContaining({
          headers: {
            accept: "application/json",
            "X-API-Key": "test-api-key",
          },
        })
      );
      expect(price).toBe(1.0001);
    });

    it("should throw on price API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(client.getTokenPrice(USDT_ADDR)).rejects.toThrow(
        "Moralis API HTTP error: 404"
      );
    });

    it("should reject invalid token addresses", async () => {
      await expect(client.getTokenPrice("0xBadToken")).rejects.toThrow(
        "Invalid Ethereum address"
      );
    });
  });
});
