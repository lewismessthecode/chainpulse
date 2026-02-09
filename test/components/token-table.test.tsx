import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TokenTable } from "@/components/tokens/token-table";

const mockTokens = [
  {
    name: "Wrapped BNB",
    symbol: "WBNB",
    address: "0x1",
    price: 312.45,
    priceChange24h: 2.1,
    volume24h: 890000000,
    liquidity: 450000000,
    sparkline: [300, 305, 310, 308, 312],
  },
  {
    name: "PancakeSwap",
    symbol: "CAKE",
    address: "0x2",
    price: 3.82,
    priceChange24h: -1.5,
    volume24h: 45000000,
    liquidity: 120000000,
    sparkline: [4.0, 3.9, 3.85, 3.8, 3.82],
  },
];

describe("TokenTable", () => {
  it("renders token rows", () => {
    render(<TokenTable tokens={mockTokens} />);
    expect(screen.getByText("WBNB")).toBeInTheDocument();
    expect(screen.getByText("CAKE")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(<TokenTable tokens={mockTokens} />);
    expect(screen.getByText("TOKEN")).toBeInTheDocument();
    expect(screen.getByText("PRICE")).toBeInTheDocument();
    expect(screen.getByText("24H")).toBeInTheDocument();
  });

  it("renders sparkline SVGs", () => {
    const { container } = render(<TokenTable tokens={mockTokens} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });
});
