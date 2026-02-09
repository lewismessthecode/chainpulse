import { describe, it, expect, vi, beforeEach } from "vitest";
import { BscScanClient } from "@/lib/data-sources/bscscan";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("BscScanClient", () => {
  let client: BscScanClient;

  beforeEach(() => {
    client = new BscScanClient("test-api-key");
    mockFetch.mockReset();
  });

  it("should fetch transactions for an address", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "1",
          result: [
            {
              hash: "0xabc123",
              from: "0x111",
              to: "0x222",
              value: "1000000000000000000",
              timeStamp: "1707000000",
              functionName: "transfer",
            },
          ],
        }),
    });

    const result = await client.getTransactions("0x111", 10);
    expect(result.length).toBe(1);
    expect(result[0].hash).toBe("0xabc123");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("api.bscscan.com")
    );
  });

  it("should fetch token transfers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "1",
          result: [
            {
              hash: "0xdef456",
              from: "0x333",
              to: "0x444",
              value: "5000000000000000000",
              tokenName: "PancakeSwap Token",
              tokenSymbol: "CAKE",
              tokenDecimal: "18",
              timeStamp: "1707000000",
            },
          ],
        }),
    });

    const result = await client.getTokenTransfers("0x333", 10);
    expect(result.length).toBe(1);
    expect(result[0].tokenSymbol).toBe("CAKE");
  });

  it("should fetch BNB price", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "1",
          result: { ethusd: "312.50", ethusd_timestamp: "1707000000" },
        }),
    });

    const result = await client.getBnbPrice();
    expect(result.price).toBe(312.5);
  });

  it("should throw on API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "0",
          message: "NOTOK",
          result: "Error",
        }),
    });
    await expect(client.getTransactions("0x111", 10)).rejects.toThrow();
  });
});
