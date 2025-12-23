/**
 * Tests for SpendingBreakdown Component
 * Story: 7.3 - Display Money Spent Breakdown by Position
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpendingBreakdown } from "@/features/draft/components/SpendingBreakdown";
import type { DraftedPlayer } from "@/features/draft/types/roster.types";

describe("SpendingBreakdown", () => {
  describe("rendering", () => {
    it("should render the spending breakdown container", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      expect(screen.getByTestId("spending-breakdown")).toBeInTheDocument();
    });
    it("should render all three category sections", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      expect(screen.getByTestId("hitters-section")).toBeInTheDocument();
      expect(screen.getByTestId("pitchers-section")).toBeInTheDocument();
      expect(screen.getByTestId("bench-section")).toBeInTheDocument();
    });
    it("should have correct aria-label", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      expect(screen.getByRole("region")).toHaveAttribute("aria-label", "Spending breakdown by position");
    });
  });

  describe("category headers", () => {
    it("should render all headers", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      expect(screen.getByText("Hitters")).toBeInTheDocument();
      expect(screen.getByText("Pitchers")).toBeInTheDocument();
      expect(screen.getByText("Bench")).toBeInTheDocument();
    });
    it("should apply slate-300 styling", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      screen.getAllByText(/Hitters|Pitchers|Bench/).forEach((h) => expect(h).toHaveClass("text-slate-300"));
    });
  });

  describe("empty state handling", () => {
    it("should show empty state for hitters", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      expect(screen.getByTestId("empty-hitters")).toHaveTextContent("(No hitters drafted yet)");
    });
    it("should show empty state for pitchers", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      expect(screen.getByTestId("empty-pitchers")).toHaveTextContent("(No pitchers drafted yet)");
    });
    it("should show empty state for bench", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      expect(screen.getByTestId("empty-bench")).toHaveTextContent("(No bench drafted yet)");
    });
    it("should apply italic slate-500 styling", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} />);
      const e = screen.getByTestId("empty-hitters");
      expect(e).toHaveClass("italic");
      expect(e).toHaveClass("text-slate-500");
    });
  });

  describe("position grouping", () => {
    const hitters: DraftedPlayer[] = [
      { playerId: "1", name: "P1", position: "OF", auctionPrice: 25 },
      { playerId: "2", name: "P2", position: "OF", auctionPrice: 17 },
      { playerId: "3", name: "P3", position: "1B", auctionPrice: 30 },
    ];
    const pitchers: DraftedPlayer[] = [
      { playerId: "4", name: "SP1", position: "SP", auctionPrice: 35 },
      { playerId: "5", name: "RP1", position: "RP", auctionPrice: 10 },
    ];
    it("should display OF correctly", () => {
      render(<SpendingBreakdown roster={{ hitters, pitchers: [], bench: [] }} />);
      const l = screen.getByTestId("position-line-OF");
      expect(l).toHaveTextContent("OF:");
      expect(l).toHaveTextContent("$42");
      expect(l).toHaveTextContent("2 players");
    });
    it("should display 1B correctly", () => {
      render(<SpendingBreakdown roster={{ hitters, pitchers: [], bench: [] }} />);
      const l = screen.getByTestId("position-line-1B");
      expect(l).toHaveTextContent("1B:");
      expect(l).toHaveTextContent("$30");
      expect(l).toHaveTextContent("1 player");
    });
    it("should display SP correctly", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers, bench: [] }} />);
      const l = screen.getByTestId("position-line-SP");
      expect(l).toHaveTextContent("SP:");
      expect(l).toHaveTextContent("$35");
    });
  });

  describe("singular/plural", () => {
    it("shows singular for 1", () => {
      render(<SpendingBreakdown roster={{ hitters: [{ playerId: "1", name: "P1", position: "C", auctionPrice: 20 }], pitchers: [], bench: [] }} />);
      expect(screen.getByTestId("position-line-C")).toHaveTextContent("1 player");
    });
    it("shows plural for 2", () => {
      render(<SpendingBreakdown roster={{ hitters: [{ playerId: "1", name: "P1", position: "OF", auctionPrice: 20 }, { playerId: "2", name: "P2", position: "OF", auctionPrice: 15 }], pitchers: [], bench: [] }} />);
      expect(screen.getByTestId("position-line-OF")).toHaveTextContent("2 players");
    });
  });

  describe("sum validation", () => {
    it("should not warn when sums match", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<SpendingBreakdown roster={{ hitters: [{ playerId: "1", name: "P1", position: "OF", auctionPrice: 25 }], pitchers: [], bench: [] }} />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("className", () => {
    it("should apply custom className", () => {
      render(<SpendingBreakdown roster={{ hitters: [], pitchers: [], bench: [] }} className="custom" />);
      expect(screen.getByTestId("spending-breakdown")).toHaveClass("custom");
    });
  });
});
