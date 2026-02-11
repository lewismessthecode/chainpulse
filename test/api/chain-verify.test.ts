import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/chain/verify/route";

vi.mock("@/lib/blockchain/contract", () => ({
  getReadContract: vi.fn().mockReturnValue({
    verifyPrediction: vi.fn().mockResolvedValue(true),
  }),
}));

describe("POST /api/chain/verify", () => {
  it("should verify a prediction hash", async () => {
    const request = new Request("http://localhost:3000/api/chain/verify", {
      method: "POST",
      body: JSON.stringify({ predictionId: 0, content: '{"test":"data"}' }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(data).toHaveProperty("verified");
    expect(data.verified).toBe(true);
  });
});
