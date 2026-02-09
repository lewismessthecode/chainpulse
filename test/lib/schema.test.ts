import { describe, it, expect } from "vitest";
import { analysisResponseSchema } from "@/lib/ai/schema";

describe("analysisResponseSchema", () => {
  it("should parse valid analysis response", () => {
    const valid = {
      insights: [
        {
          category: "TREND",
          title: "BNB Bullish Momentum",
          summary: "BNB shows upward trend",
          fullAnalysis: "Detailed analysis...",
          sentimentScore: 75,
          confidence: 85,
          dataPoints: ["TVL up 5%"],
        },
      ],
    };
    const result = analysisResponseSchema.parse(valid);
    expect(result.insights).toHaveLength(1);
  });

  it("should reject invalid category", () => {
    const invalid = {
      insights: [
        {
          category: "INVALID",
          title: "Test",
          summary: "Test",
          fullAnalysis: "Test",
          sentimentScore: 0,
          confidence: 50,
          dataPoints: [],
        },
      ],
    };
    expect(() => analysisResponseSchema.parse(invalid)).toThrow();
  });

  it("should reject out-of-range sentiment score", () => {
    const invalid = {
      insights: [
        {
          category: "TREND",
          title: "Test",
          summary: "Test",
          fullAnalysis: "Test",
          sentimentScore: 150,
          confidence: 50,
          dataPoints: [],
        },
      ],
    };
    expect(() => analysisResponseSchema.parse(invalid)).toThrow();
  });
});
