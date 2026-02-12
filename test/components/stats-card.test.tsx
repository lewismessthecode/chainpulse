import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "@/components/dashboard/stats-card";

describe("StatsCard", () => {
  it("renders label and value", () => {
    render(<StatsCard label="TOTAL VALUE LOCKED" value={4820000000} prefix="$" change={2.4} />);
    expect(screen.getByText("TOTAL VALUE LOCKED")).toBeInTheDocument();
  });

  it("shows positive change in green", () => {
    render(<StatsCard label="TVL" value={100} change={2.4} />);
    const change = screen.getByText(/2.4%/);
    expect(change.className).toContain("text-positive");
  });

  it("shows negative change in red", () => {
    render(<StatsCard label="TVL" value={100} change={-1.2} />);
    const change = screen.getByText(/1.2%/);
    expect(change.className).toContain("text-negative");
  });

  it("renders info icon when description is provided", () => {
    render(<StatsCard label="TVL" value={100} description="Test description" />);
    expect(screen.getByLabelText("Info")).toBeInTheDocument();
  });

  it("does not render info icon when no description", () => {
    render(<StatsCard label="TVL" value={100} />);
    expect(screen.queryByLabelText("Info")).not.toBeInTheDocument();
  });
});
