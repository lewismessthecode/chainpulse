import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PredictionTable } from "@/components/predictions/prediction-table";

const mockPredictions = [
  {
    id: 1,
    contentHash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef12345678",
    timestamp: 1707580800,
    category: 0,
    categoryName: "TREND",
    sentimentScore: 75,
    summary: "BSC TVL expected to grow by 5% in the next week.",
  },
  {
    id: 2,
    contentHash: "0xdef456789012345678901234567890abcdef1234567890abcdef1234567890abcd",
    timestamp: 1707494400,
    category: 1,
    categoryName: "RISK",
    sentimentScore: 30,
    summary: "Potential risk of liquidity drain from smaller protocols.",
  },
];

describe("PredictionTable", () => {
  it("renders prediction rows", () => {
    render(<PredictionTable predictions={mockPredictions} />);
    expect(screen.getByText(/BSC TVL expected/)).toBeInTheDocument();
    expect(screen.getByText(/Potential risk/)).toBeInTheDocument();
  });

  it("renders content hash links", () => {
    render(<PredictionTable predictions={mockPredictions} />);
    expect(screen.getByText(/0xabc1/)).toBeInTheDocument();
  });
});
