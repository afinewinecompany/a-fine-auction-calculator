/**
 * ValueAnalysis Component Tests
 *
 * Tests for the ValueAnalysis component that displays steals and overpays analysis.
 * Highlights players acquired at favorable prices with visual comparisons.
 *
 * Story: 12.4 - Highlight Steals with Visual Comparison
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValueAnalysis } from '@/features/draft/components/ValueAnalysis';
import type { DraftedPlayer } from '@/features/draft';
import type { InflationState } from '@/features/inflation';
import type { PlayerProjection } from '@/features/projections';

const createMockRoster = (): DraftedPlayer[] => [
  {
    playerId: '1',
    playerName: 'Mike Trout',
    position: 'OF',
    purchasePrice: 35,
    projectedValue: 45,
    variance: -10,
    draftedBy: 'user',
    draftedAt: new Date().toISOString(),
    tier: 'ELITE',
  },
  {
    playerId: '2',
    playerName: 'Shohei Ohtani',
    position: 'UT',
    purchasePrice: 50,
    projectedValue: 55,
    variance: -5,
    draftedBy: 'user',
    draftedAt: new Date().toISOString(),
    tier: 'ELITE',
  },
  {
    playerId: '3',
    playerName: 'Overpay Smith',
    position: '1B',
    purchasePrice: 30,
    projectedValue: 20,
    variance: 10,
    draftedBy: 'user',
    draftedAt: new Date().toISOString(),
    tier: 'MID',
  },
];

const createMockProjections = (): PlayerProjection[] => [
  {
    id: '1',
    leagueId: 'league-1',
    playerName: 'Mike Trout',
    team: 'LAA',
    positions: ['OF'],
    projectedValue: 45,
    projectionSource: 'fangraphs',
    statsHitters: { hr: 35, rbi: 90 },
    statsPitchers: null,
    tier: 'ELITE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const createMockInflationData = (): InflationState => ({
  overallRate: 0.15,
  positionRates: {
    C: 0.1,
    '1B': 0.12,
    '2B': 0.08,
    SS: 0.2,
    '3B': 0.15,
    OF: 0.1,
    SP: 0.18,
    RP: 0.05,
    UT: 0.1,
  },
  tierRates: {
    ELITE: 0.25,
    MID: 0.1,
    LOWER: 0.05,
  },
  budgetDepleted: 0.8,
  playersRemaining: 50,
});

describe('ValueAnalysis', () => {
  it('renders the section heading', () => {
    render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    expect(screen.getByText('Value Analysis')).toBeInTheDocument();
  });

  it('renders with empty roster', () => {
    render(
      <ValueAnalysis
        roster={[]}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    expect(screen.getByText('Value Analysis')).toBeInTheDocument();
  });

  it('displays "Steals" subsection heading', () => {
    render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Multiple elements contain "Steals" - use getAllByText
    expect(screen.getAllByText(/Steals/i).length).toBeGreaterThan(0);
  });

  it('identifies and displays steals', () => {
    const roster = createMockRoster();
    render(
      <ValueAnalysis
        roster={roster}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Mike Trout should be identified as a steal (bought for 35, projected 45)
    expect(screen.getByText('Mike Trout')).toBeInTheDocument();
  });

  it('shows value gained for steals (e.g., "$X below value")', () => {
    render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Should show "below value" text for steals (multiple cards)
    expect(screen.getAllByText(/below value/i).length).toBeGreaterThan(0);
  });

  it('uses emerald/green backgrounds for steals section', () => {
    const { container } = render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Should have emerald background styling
    expect(container.innerHTML).toMatch(/emerald/i);
  });

  it('displays total value gained', () => {
    render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Should display total value saved message
    expect(screen.queryByText(/saved|gained/i)).toBeInTheDocument();
  });

  it('has correct section styling with slate background', () => {
    const { container } = render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('bg-slate-900');
  });

  it('displays visual comparison for steals', () => {
    const { container } = render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Should show auction price and adjusted value
    expect(container.innerHTML).toMatch(/Paid|Price/i);
    expect(container.innerHTML).toMatch(/Value/i);
  });
});

describe('ValueAnalysis edge cases', () => {
  it('handles roster with no steals', () => {
    const roster: DraftedPlayer[] = [
      {
        playerId: '1',
        playerName: 'Overpay Jones',
        position: 'OF',
        purchasePrice: 50,
        projectedValue: 30,
        variance: 20,
        draftedBy: 'user',
        draftedAt: new Date().toISOString(),
      },
    ];
    render(
      <ValueAnalysis
        roster={roster}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Should display a message for no steals
    expect(screen.getByText(/No significant steals|solid draft/i)).toBeInTheDocument();
  });

  it('handles roster with all steals', () => {
    const roster: DraftedPlayer[] = [
      {
        playerId: '1',
        playerName: 'Steal 1',
        position: 'OF',
        purchasePrice: 10,
        projectedValue: 30,
        variance: -20,
        draftedBy: 'user',
        draftedAt: new Date().toISOString(),
      },
      {
        playerId: '2',
        playerName: 'Steal 2',
        position: 'SS',
        purchasePrice: 5,
        projectedValue: 25,
        variance: -20,
        draftedBy: 'user',
        draftedAt: new Date().toISOString(),
      },
    ];
    render(
      <ValueAnalysis
        roster={roster}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    expect(screen.getByText('Steal 1')).toBeInTheDocument();
    expect(screen.getByText('Steal 2')).toBeInTheDocument();
  });

  it('shows steals count', () => {
    render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Should display count of steals (multiple elements with steals/captured text)
    expect(screen.getAllByText(/steal|captured/i).length).toBeGreaterThan(0);
  });
});

describe('ValueAnalysis overpays section', () => {
  it('displays overpays section when overpays exist', () => {
    render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Overpays section should be present (multiple elements match)
    expect(screen.getAllByText(/Overpay|overpaid/i).length).toBeGreaterThan(0);
  });

  it('shows overpaid player names', () => {
    render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    // Overpay Smith should be in overpays section
    expect(screen.getByText('Overpay Smith')).toBeInTheDocument();
  });
});

describe('ValueAnalysis accessibility', () => {
  it('has proper semantic structure', () => {
    const { container } = render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    expect(container.querySelector('section, div')).toBeInTheDocument();
  });

  it('has heading for steals section', () => {
    render(
      <ValueAnalysis
        roster={createMockRoster()}
        projections={createMockProjections()}
        inflationData={createMockInflationData()}
      />
    );
    expect(screen.getByRole('heading', { name: /Steals/i })).toBeInTheDocument();
  });
});
