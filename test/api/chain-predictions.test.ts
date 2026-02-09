import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/chain/predictions/route";

vi.mock("@/lib/blockchain/contract", () => ({
  getReadContract: vi.fn().mockReturnValue({
    predictionCount: vi.fn().mockResolvedValue(BigInt(3)),
    getLatestPredictions: vi.fn().mockResolvedValue([
      {
        contentHash: "0xabc123",
        timestamp: BigInt(1707000000),
        category: BigInt(0),
        sentimentScore: BigInt(75),
        summary: "BNB trending up",
      },
    ]),
  }),
}));

describe("GET /api/chain/predictions", () => {
  it("should return predictions from contract", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("predictions");
    expect(data).toHaveProperty("total");
  });
});
