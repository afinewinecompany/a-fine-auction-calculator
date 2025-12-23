/**
 * RosterOverview Component Tests
 *
 * Tests for the RosterOverview placeholder component.
 * This component will display the complete roster organized by position.
 *
 * Story: 12.1 - Create Post-Draft Summary Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RosterOverview } from '@/features/draft/components/RosterOverview';
import type { DraftedPlayer } from '@/features/draft';

describe('RosterOverview', () => {
  const mockRoster: DraftedPlayer[] = [
    {
      playerId: '1',
      playerName: 'Mike Trout',
      position: 'OF',
      purchasePrice: 45,
      projectedValue: 40,
      variance: 5,
      draftedBy: 'user',
      draftedAt: new Date().toISOString(),
    },
    {
      playerId: '2',
      playerName: 'Aaron Judge',
      position: 'OF',
      purchasePrice: 50,
      projectedValue: 48,
      variance: 2,
      draftedBy: 'user',
      draftedAt: new Date().toISOString(),
    },
  ];

  it('renders the section heading', () => {
    render(<RosterOverview roster={mockRoster} />);
    expect(screen.getByText('Roster Overview')).toBeInTheDocument();
  });

  it('renders with empty roster', () => {
    render(<RosterOverview roster={[]} />);
    expect(screen.getByText('Roster Overview')).toBeInTheDocument();
  });

  it('displays placeholder message for future implementation', () => {
    render(<RosterOverview roster={mockRoster} />);
    expect(
      screen.getByText(/Roster details will be displayed here/i)
    ).toBeInTheDocument();
  });

  it('has correct section styling with slate background', () => {
    const { container } = render(<RosterOverview roster={mockRoster} />);
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('bg-slate-900');
  });

  it('accepts rosterSummary prop when provided', () => {
    render(
      <RosterOverview
        roster={mockRoster}
        rosterSummary={{
          totalSlots: 23,
          filledSlots: 2,
          byPosition: {
            C: { filled: 0, total: 1 },
            '1B': { filled: 0, total: 1 },
            '2B': { filled: 0, total: 1 },
            SS: { filled: 0, total: 1 },
            '3B': { filled: 0, total: 1 },
            OF: { filled: 2, total: 5 },
            UTIL: { filled: 0, total: 1 },
            SP: { filled: 0, total: 6 },
            RP: { filled: 0, total: 3 },
            BN: { filled: 0, total: 3 },
          },
        }}
      />
    );
    expect(screen.getByText('Roster Overview')).toBeInTheDocument();
  });
});
