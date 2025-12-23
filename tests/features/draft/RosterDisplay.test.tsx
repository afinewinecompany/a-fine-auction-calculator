/**
 * RosterDisplay Component Tests
 *
 * Tests for the RosterDisplay component that displays roster composition
 * organized by position category (Hitters, Pitchers, Bench).
 *
 * Story: 7.5 - Display Roster Composition by Position
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RosterDisplay, type RosterPlayer } from '@/features/draft/components/RosterDisplay';

// Mock player data
const mockHitters: RosterPlayer[] = [
  { playerId: '1', name: 'Mike Trout', position: 'OF', auctionPrice: 42 },
  { playerId: '2', name: 'Freddie Freeman', position: '1B', auctionPrice: 35 },
  { playerId: '3', name: 'Mookie Betts', position: '2B', auctionPrice: 38 },
];

const mockPitchers: RosterPlayer[] = [
  { playerId: '4', name: 'Gerrit Cole', position: 'SP', auctionPrice: 28 },
  { playerId: '5', name: 'Josh Hader', position: 'RP', auctionPrice: 15 },
];

const mockBench: RosterPlayer[] = [
  { playerId: '6', name: 'Backup Player', position: 'BN', auctionPrice: 1 },
];

describe('RosterDisplay', () => {
  describe('rendering', () => {
    it('renders the component with correct test id', () => {
      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: [], bench: [] }}
        />
      );
      expect(screen.getByTestId('roster-display')).toBeInTheDocument();
    });

    it('renders all three category sections', () => {
      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: [], bench: [] }}
        />
      );
      expect(screen.getByTestId('hitters-section')).toBeInTheDocument();
      expect(screen.getByTestId('pitchers-section')).toBeInTheDocument();
      expect(screen.getByTestId('bench-section')).toBeInTheDocument();
    });

    it('has correct aria label for accessibility', () => {
      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: [], bench: [] }}
        />
      );
      expect(screen.getByRole('region', { name: /roster composition/i })).toBeInTheDocument();
    });
  });

  describe('player display', () => {
    it('displays hitters with name, position, and price', () => {
      render(
        <RosterDisplay
          roster={{ hitters: mockHitters, pitchers: [], bench: [] }}
        />
      );

      expect(screen.getByText('Mike Trout')).toBeInTheDocument();
      expect(screen.getByText('Freddie Freeman')).toBeInTheDocument();
      expect(screen.getByText('Mookie Betts')).toBeInTheDocument();
      expect(screen.getByText('$42')).toBeInTheDocument();
      expect(screen.getByText('$35')).toBeInTheDocument();
      expect(screen.getByText('$38')).toBeInTheDocument();
    });

    it('displays pitchers with name, position, and price', () => {
      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: mockPitchers, bench: [] }}
        />
      );

      expect(screen.getByText('Gerrit Cole')).toBeInTheDocument();
      expect(screen.getByText('Josh Hader')).toBeInTheDocument();
      expect(screen.getByText('$28')).toBeInTheDocument();
      expect(screen.getByText('$15')).toBeInTheDocument();
    });

    it('displays bench players with name, position, and price', () => {
      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: [], bench: mockBench }}
        />
      );

      expect(screen.getByText('Backup Player')).toBeInTheDocument();
      expect(screen.getByText('$1')).toBeInTheDocument();
    });

    it('displays player entry with correct test id', () => {
      render(
        <RosterDisplay
          roster={{ hitters: mockHitters, pitchers: [], bench: [] }}
        />
      );

      expect(screen.getByTestId('player-entry-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-entry-2')).toBeInTheDocument();
      expect(screen.getByTestId('player-entry-3')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state message when no hitters drafted', () => {
      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: mockPitchers, bench: [] }}
        />
      );

      expect(screen.getByTestId('empty-hitters')).toBeInTheDocument();
      expect(screen.getByText(/no hitters drafted yet/i)).toBeInTheDocument();
    });

    it('shows empty state message when no pitchers drafted', () => {
      render(
        <RosterDisplay
          roster={{ hitters: mockHitters, pitchers: [], bench: [] }}
        />
      );

      expect(screen.getByTestId('empty-pitchers')).toBeInTheDocument();
      expect(screen.getByText(/no pitchers drafted yet/i)).toBeInTheDocument();
    });

    it('shows empty state message when no bench players drafted', () => {
      render(
        <RosterDisplay
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: [] }}
        />
      );

      expect(screen.getByTestId('empty-bench')).toBeInTheDocument();
      expect(screen.getByText(/no bench drafted yet/i)).toBeInTheDocument();
    });

    it('shows all empty states when roster is empty', () => {
      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: [], bench: [] }}
        />
      );

      expect(screen.getByTestId('empty-hitters')).toBeInTheDocument();
      expect(screen.getByTestId('empty-pitchers')).toBeInTheDocument();
      expect(screen.getByTestId('empty-bench')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('sorts hitters by position order', () => {
      const unsortedHitters: RosterPlayer[] = [
        { playerId: '1', name: 'OF Player', position: 'OF', auctionPrice: 10 },
        { playerId: '2', name: 'C Player', position: 'C', auctionPrice: 20 },
        { playerId: '3', name: '1B Player', position: '1B', auctionPrice: 15 },
      ];

      render(
        <RosterDisplay
          roster={{ hitters: unsortedHitters, pitchers: [], bench: [] }}
        />
      );

      const entries = screen.getAllByTestId(/player-entry-/);
      // C should be first (index 0), then 1B (index 1), then OF (index 2)
      expect(entries[0]).toHaveTextContent('C Player');
      expect(entries[1]).toHaveTextContent('1B Player');
      expect(entries[2]).toHaveTextContent('OF Player');
    });

    it('sorts pitchers by position order (SP before RP)', () => {
      const unsortedPitchers: RosterPlayer[] = [
        { playerId: '1', name: 'RP Player', position: 'RP', auctionPrice: 10 },
        { playerId: '2', name: 'SP Player', position: 'SP', auctionPrice: 20 },
      ];

      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: unsortedPitchers, bench: [] }}
        />
      );

      const entries = screen.getAllByTestId(/player-entry-/);
      expect(entries[0]).toHaveTextContent('SP Player');
      expect(entries[1]).toHaveTextContent('RP Player');
    });

    it('sorts players alphabetically when same position', () => {
      const samePositionHitters: RosterPlayer[] = [
        { playerId: '1', name: 'Zebra Player', position: 'OF', auctionPrice: 10 },
        { playerId: '2', name: 'Alpha Player', position: 'OF', auctionPrice: 20 },
        { playerId: '3', name: 'Beta Player', position: 'OF', auctionPrice: 15 },
      ];

      render(
        <RosterDisplay
          roster={{ hitters: samePositionHitters, pitchers: [], bench: [] }}
        />
      );

      const entries = screen.getAllByTestId(/player-entry-/);
      expect(entries[0]).toHaveTextContent('Alpha Player');
      expect(entries[1]).toHaveTextContent('Beta Player');
      expect(entries[2]).toHaveTextContent('Zebra Player');
    });
  });

  describe('scrollable container', () => {
    it('has max-height class for scrolling', () => {
      render(
        <RosterDisplay
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: mockBench }}
        />
      );

      const container = screen.getByTestId('roster-display');
      expect(container.className).toContain('max-h-64');
      expect(container.className).toContain('overflow-y-auto');
    });

    it('has roster-scroll class for custom scrollbar styling', () => {
      render(
        <RosterDisplay
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: mockBench }}
        />
      );

      const container = screen.getByTestId('roster-display');
      expect(container.className).toContain('roster-scroll');
    });
  });

  describe('custom className', () => {
    it('applies custom className to container', () => {
      render(
        <RosterDisplay
          roster={{ hitters: [], pitchers: [], bench: [] }}
          className="custom-class"
        />
      );

      const container = screen.getByTestId('roster-display');
      expect(container.className).toContain('custom-class');
    });
  });

  describe('full roster display', () => {
    it('displays all players from all categories', () => {
      render(
        <RosterDisplay
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: mockBench }}
        />
      );

      // Verify all players are displayed
      expect(screen.getByText('Mike Trout')).toBeInTheDocument();
      expect(screen.getByText('Freddie Freeman')).toBeInTheDocument();
      expect(screen.getByText('Mookie Betts')).toBeInTheDocument();
      expect(screen.getByText('Gerrit Cole')).toBeInTheDocument();
      expect(screen.getByText('Josh Hader')).toBeInTheDocument();
      expect(screen.getByText('Backup Player')).toBeInTheDocument();

      // Verify no empty states are shown
      expect(screen.queryByTestId('empty-hitters')).not.toBeInTheDocument();
      expect(screen.queryByTestId('empty-pitchers')).not.toBeInTheDocument();
      expect(screen.queryByTestId('empty-bench')).not.toBeInTheDocument();
    });
  });
});
