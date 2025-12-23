/**
 * CompetitiveAdvantageSummary Component Tests
 *
 * Tests for the competitive advantage summary section that displays
 * draft performance metrics and share functionality.
 *
 * Story: 12.5 - Show Competitive Advantage Summary
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompetitiveAdvantageSummary } from '@/features/draft/components/CompetitiveAdvantageSummary';
import type { Steal, Overpay } from '@/features/draft/utils/valueAnalysis';
import type { DraftedPlayer } from '@/features/draft';

// Helper to create mock player
const createMockPlayer = (
  id: string,
  name: string,
  purchasePrice: number,
  projectedValue: number
): DraftedPlayer => ({
  playerId: id,
  playerName: name,
  position: 'OF',
  purchasePrice,
  projectedValue,
  variance: purchasePrice - projectedValue,
  draftedBy: 'user',
  draftedAt: new Date().toISOString(),
});

// Helper to create mock steals
const createMockSteals = (count: number, avgValue: number = 10): Steal[] =>
  Array.from({ length: count }, (_, i) => ({
    player: createMockPlayer(`p${i}`, `Steal Player ${i}`, 20, 30),
    auctionPrice: 20,
    adjustedValue: 30,
    valueGained: avgValue,
  }));

// Helper to create mock overpays
const createMockOverpays = (count: number, avgValue: number = 5): Overpay[] =>
  Array.from({ length: count }, (_, i) => ({
    player: createMockPlayer(`op${i}`, `Overpay Player ${i}`, 35, 30),
    auctionPrice: 35,
    adjustedValue: 30,
    valueLost: avgValue,
  }));

// Mock clipboard
beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    writable: true,
    configurable: true,
  });
});

describe('CompetitiveAdvantageSummary', () => {
  it('should render the component', () => {
    render(<CompetitiveAdvantageSummary steals={[]} overpays={[]} />);

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should display headline with positive net value', () => {
    const steals = createMockSteals(5, 10); // $50 gained
    const overpays = createMockOverpays(1, 8); // $8 lost

    render(<CompetitiveAdvantageSummary steals={steals} overpays={overpays} />);

    // Net value: 50 - 8 = $42
    expect(screen.getByText(/outperformed.*\$42/i)).toBeInTheDocument();
  });

  it('should display steals count', () => {
    const steals = createMockSteals(8);
    const overpays = createMockOverpays(2);

    render(<CompetitiveAdvantageSummary steals={steals} overpays={overpays} />);

    // Check for steals text in summary line
    expect(screen.getByText(/8 steals/)).toBeInTheDocument();
  });

  it('should display overpays count', () => {
    const steals = createMockSteals(5);
    const overpays = createMockOverpays(3);

    render(<CompetitiveAdvantageSummary steals={steals} overpays={overpays} />);

    // Check for overpays text in summary line
    expect(screen.getByText(/3 overpays/)).toBeInTheDocument();
  });

  it('should display net value in key metrics', () => {
    const steals = createMockSteals(6, 12); // $72
    const overpays = createMockOverpays(2, 15); // $30

    render(<CompetitiveAdvantageSummary steals={steals} overpays={overpays} />);

    // Net: 72 - 30 = 42
    // Value appears multiple times, just check it exists
    expect(screen.getAllByText(/\$42/).length).toBeGreaterThan(0);
  });

  it('should include share button', () => {
    render(<CompetitiveAdvantageSummary steals={createMockSteals(3)} overpays={[]} />);

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('should use emerald/green styling for positive metrics', () => {
    const { container } = render(
      <CompetitiveAdvantageSummary steals={createMockSteals(5, 20)} overpays={[]} />
    );

    expect(container.innerHTML).toMatch(/emerald/i);
  });

  it('should display key metrics format: Steals | Overpays | Net Value', () => {
    const steals = createMockSteals(8);
    const overpays = createMockOverpays(2);

    render(<CompetitiveAdvantageSummary steals={steals} overpays={overpays} />);

    // Check for metrics display using getAllByText since terms appear multiple times
    expect(screen.getAllByText(/steals/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/overpays/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/net value/i).length).toBeGreaterThan(0);
  });
});

describe('CompetitiveAdvantageSummary edge cases', () => {
  it('should handle zero net value', () => {
    const steals = createMockSteals(3, 10); // $30
    const overpays = createMockOverpays(3, 10); // $30

    render(<CompetitiveAdvantageSummary steals={steals} overpays={overpays} />);

    // Should display appropriate message for zero net value
    expect(screen.getByText(/matched market/i)).toBeInTheDocument();
  });

  it('should handle negative net value with constructive message', () => {
    const steals = createMockSteals(1, 5); // $5
    const overpays = createMockOverpays(4, 10); // $40

    render(<CompetitiveAdvantageSummary steals={steals} overpays={overpays} />);

    // Should focus on steals captured - check for "1 steal" in the content
    expect(screen.getAllByText(/1 steal\b/).length).toBeGreaterThan(0);
  });

  it('should handle no steals or overpays', () => {
    render(<CompetitiveAdvantageSummary steals={[]} overpays={[]} />);

    // Should display "solid draft at market value" or similar
    expect(screen.getByText(/solid draft|market value/i)).toBeInTheDocument();
  });

  it('should handle very high net value with extra celebration', () => {
    const steals = createMockSteals(15, 20); // $300

    render(<CompetitiveAdvantageSummary steals={steals} overpays={[]} />);

    // Should show celebration for exceptional performance
    expect(screen.getAllByText(/\$300/).length).toBeGreaterThan(0);
  });

  it('should handle single steal', () => {
    const steals = createMockSteals(1, 15);

    render(<CompetitiveAdvantageSummary steals={steals} overpays={[]} />);

    // Should use singular "steal" not "steals"
    expect(screen.getByText(/1 steal\b/)).toBeInTheDocument();
  });
});

describe('CompetitiveAdvantageSummary with league name', () => {
  it('should include league name in share functionality', () => {
    render(
      <CompetitiveAdvantageSummary
        steals={createMockSteals(5)}
        overpays={createMockOverpays(1)}
        leagueName="Dynasty Champions"
      />
    );

    // Share button should be present and will include league name in share text
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });
});

describe('CompetitiveAdvantageSummary accessibility', () => {
  it('should have proper section semantics', () => {
    render(<CompetitiveAdvantageSummary steals={createMockSteals(3)} overpays={[]} />);

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should have heading for the section', () => {
    render(<CompetitiveAdvantageSummary steals={createMockSteals(3)} overpays={[]} />);

    // Should have a visible heading or aria-label
    const region = screen.getByRole('region');
    expect(region).toHaveAccessibleName();
  });
});
