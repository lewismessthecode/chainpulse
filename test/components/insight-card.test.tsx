import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsightCard } from "@/components/insights/insight-card";

const mockInsight = {
  id: "1",
  category: "TREND" as const,
  title: "BSC TVL surges past $5B",
  summary: "Total value locked on BSC has increased by 12% in the last 24 hours.",
  fullAnalysis: "Detailed analysis text here.",
  sentimentScore: 0.8,
  confidence: 0.9,
  dataPoints: ["TVL: $5.2B", "24h Change: +12%"],
  contentHash: "0xabc123def456",
  createdAt: "2024-02-10T12:00:00Z",
  txHash: "0x1234567890abcdef",
};

describe("InsightCard", () => {
  it("renders title and summary", () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.getByText("BSC TVL surges past $5B")).toBeInTheDocument();
    expect(screen.getByText(/Total value locked/)).toBeInTheDocument();
  });

  it("renders category badge", () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.getByText("TREND")).toBeInTheDocument();
  });

  it("renders sentiment indicator", () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.getByText(/0.8/)).toBeInTheDocument();
  });

  it("renders on-chain proof when txHash exists", () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.getByText(/0xabc1/)).toBeInTheDocument();
  });
});
