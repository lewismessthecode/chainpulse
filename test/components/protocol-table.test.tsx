import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProtocolTable } from "@/components/dashboard/protocol-table";

const mockProtocols = [
  { name: "PancakeSwap", tvl: 2100000000, change24h: 1.8, volume24h: 500000000 },
  { name: "Venus", tvl: 1500000000, change24h: -0.5, volume24h: 200000000 },
];

describe("ProtocolTable", () => {
  it("renders protocol rows", () => {
    render(<ProtocolTable protocols={mockProtocols} />);
    expect(screen.getByText("PancakeSwap")).toBeInTheDocument();
    expect(screen.getByText("Venus")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(<ProtocolTable protocols={mockProtocols} />);
    expect(screen.getByText("PROTOCOL")).toBeInTheDocument();
    expect(screen.getByText("TVL")).toBeInTheDocument();
  });
});
