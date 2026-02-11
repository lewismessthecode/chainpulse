import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhaleCard } from "@/components/whales/whale-card";

const mockAlert = {
  txHash: "0xabc123def456789012345678901234567890abcdef",
  from: "0x1111111111111111111111111111111111111111",
  to: "0x2222222222222222222222222222222222222222",
  value: 125000,
  token: "0x3333333333333333333333333333333333333333",
  tokenSymbol: "BNB",
  timestamp: 1707580800,
  type: "transfer" as const,
  fromLabel: "Binance" as string | null,
  toLabel: null as string | null,
  usdValue: 39_375_000 as number | null,
};

describe("WhaleCard", () => {
  it("renders whale alert amount", () => {
    render(<WhaleCard alert={mockAlert} />);
    expect(screen.getByText(/125,000/)).toBeInTheDocument();
  });

  it("renders truncated addresses", () => {
    render(<WhaleCard alert={mockAlert} />);
    expect(screen.getByText(/0x1111/)).toBeInTheDocument();
  });

  it("renders token symbol", () => {
    render(<WhaleCard alert={mockAlert} />);
    expect(screen.getByText("BNB")).toBeInTheDocument();
  });
});
