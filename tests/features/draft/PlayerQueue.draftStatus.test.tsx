/**
 * PlayerQueue Draft Status Tests
 *
 * Tests for draft status display including:
 * - StatusBadge integration
 * - Row styling based on draft status
 * - Player count display
 *
 * Story: 6.7 - Display Player Draft Status
 */

import { render, screen } from '@testing-library/react';
import { PlayerQueue } from '@/features/draft/components/PlayerQueue';
import type { Player } from '@/features/draft/types/player.types';

// Helper to create test players
function createTestPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Test Player',
    positions: ['1B'],
    team: 'NYY',
    projectedValue: 30,
    adjustedValue: 35,
    tier: 'MID',
    status: 'available',
    ...overrides,
  };
}

describe('PlayerQueue Draft Status Display', () => {
  const defaultProps = {
    players: [],
    onPlayerSelect: vi.fn(),
  };

  // ============================================================================
  // Row Styling Tests
  // ============================================================================
  describe('Row Styling', () => {
    describe('Available players', () => {
      it('renders available players with full opacity', () => {
        const player = createTestPlayer({ status: 'available' });
        render(<PlayerQueue {...defaultProps} players={[player]} />);

        const row = screen.getByRole('button', { name: /Test Player/i });
        expect(row.className).not.toContain('opacity');
      });

      it('does not apply special border to available players', () => {
        const player = createTestPlayer({ status: 'available' });
        render(<PlayerQueue {...defaultProps} players={[player]} />);

        const row = screen.getByRole('button', { name: /Test Player/i });
        expect(row.className).not.toContain('border-emerald');
      });
    });

    describe('My Team players', () => {
      it('applies emerald border to my-team players', () => {
        const player = createTestPlayer({ status: 'my-team' });
        render(<PlayerQueue {...defaultProps} players={[player]} />);

        const row = screen.getByRole('button', { name: /Test Player/i });
        // Check for left border styling (border-l-4 border-l-emerald-500)
        expect(row.className).toContain('border-l-emerald');
      });

      it('does not reduce opacity for my-team players', () => {
        const player = createTestPlayer({ status: 'my-team' });
        render(<PlayerQueue {...defaultProps} players={[player]} />);

        const row = screen.getByRole('button', { name: /Test Player/i });
        // Check that opacity-60 is not present (my team should be visible)
        expect(row.className).not.toContain('opacity-60');
      });
    });

    describe('Drafted by others players', () => {
      it('reduces opacity for drafted players', () => {
        const player = createTestPlayer({ status: 'drafted', draftedByTeam: 5 });
        render(<PlayerQueue {...defaultProps} players={[player]} />);

        const row = screen.getByRole('button', { name: /Test Player/i });
        expect(row.className).toContain('opacity');
      });

      it('does not apply emerald border to drafted players', () => {
        const player = createTestPlayer({ status: 'drafted', draftedByTeam: 5 });
        render(<PlayerQueue {...defaultProps} players={[player]} />);

        const row = screen.getByRole('button', { name: /Test Player/i });
        expect(row.className).not.toContain('border-emerald');
      });
    });
  });

  // ============================================================================
  // Status Badge Integration Tests
  // ============================================================================
  describe('Status Badge Integration', () => {
    it('displays StatusBadge for available players', () => {
      const player = createTestPlayer({ status: 'available' });
      render(<PlayerQueue {...defaultProps} players={[player]} />);

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('displays StatusBadge for my-team players', () => {
      const player = createTestPlayer({ status: 'my-team' });
      render(<PlayerQueue {...defaultProps} players={[player]} />);

      expect(screen.getByText('My Team')).toBeInTheDocument();
    });

    it('displays StatusBadge with team number for drafted players', () => {
      const player = createTestPlayer({ status: 'drafted', draftedByTeam: 7 });
      render(<PlayerQueue {...defaultProps} players={[player]} />);

      expect(screen.getByText('Team 7')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Player Count Display Tests
  // ============================================================================
  describe('Player Count Display', () => {
    it('displays count of available players', () => {
      const players = [
        createTestPlayer({ id: '1', status: 'available' }),
        createTestPlayer({ id: '2', status: 'available' }),
        createTestPlayer({ id: '3', status: 'drafted', draftedByTeam: 1 }),
        createTestPlayer({ id: '4', status: 'my-team' }),
      ];
      render(<PlayerQueue {...defaultProps} players={players} />);

      // Should show "2 available of 4 total"
      expect(screen.getByText(/2 available/i)).toBeInTheDocument();
      expect(screen.getByText(/4 total/i)).toBeInTheDocument();
    });

    it('updates count when all players are available', () => {
      const players = [
        createTestPlayer({ id: '1', status: 'available' }),
        createTestPlayer({ id: '2', status: 'available' }),
        createTestPlayer({ id: '3', status: 'available' }),
      ];
      render(<PlayerQueue {...defaultProps} players={players} />);

      expect(screen.getByText(/3 available/i)).toBeInTheDocument();
      expect(screen.getByText(/3 total/i)).toBeInTheDocument();
    });

    it('shows 0 available when all players are drafted', () => {
      const players = [
        createTestPlayer({ id: '1', status: 'drafted', draftedByTeam: 1 }),
        createTestPlayer({ id: '2', status: 'my-team' }),
      ];
      render(<PlayerQueue {...defaultProps} players={players} />);

      expect(screen.getByText(/0 available/i)).toBeInTheDocument();
      expect(screen.getByText(/2 total/i)).toBeInTheDocument();
    });

    it('displays count with correct formatting', () => {
      const players = [
        createTestPlayer({ id: '1', status: 'available' }),
        createTestPlayer({ id: '2', status: 'drafted', draftedByTeam: 2 }),
      ];
      render(<PlayerQueue {...defaultProps} players={players} />);

      // Look for the combined text format
      const countElement = screen.getByTestId('player-count');
      expect(countElement).toHaveTextContent('Showing 1 available of 2 total players');
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================
  describe('Accessibility', () => {
    it('provides accessible label for player count', () => {
      const players = [
        createTestPlayer({ id: '1', status: 'available' }),
        createTestPlayer({ id: '2', status: 'drafted', draftedByTeam: 1 }),
      ];
      render(<PlayerQueue {...defaultProps} players={players} />);

      const countElement = screen.getByTestId('player-count');
      expect(countElement).toHaveAttribute('aria-live', 'polite');
    });

    it('row has appropriate aria attributes for status', () => {
      const player = createTestPlayer({ status: 'my-team' });
      render(<PlayerQueue {...defaultProps} players={[player]} />);

      const row = screen.getByRole('button', { name: /Test Player/i });
      expect(row).toHaveAttribute('data-status', 'my-team');
    });
  });

  // ============================================================================
  // Mixed Status Display Tests
  // ============================================================================
  describe('Mixed Status Display', () => {
    it('correctly styles multiple players with different statuses', () => {
      const players = [
        createTestPlayer({ id: '1', name: 'Available Player', status: 'available' }),
        createTestPlayer({ id: '2', name: 'My Player', status: 'my-team' }),
        createTestPlayer({
          id: '3',
          name: 'Drafted Player',
          status: 'drafted',
          draftedByTeam: 3,
        }),
      ];
      render(<PlayerQueue {...defaultProps} players={players} />);

      // Check all three status badges are visible
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('My Team')).toBeInTheDocument();
      expect(screen.getByText('Team 3')).toBeInTheDocument();

      // Check row styling
      const availableRow = screen.getByRole('button', { name: /Available Player/i });
      const myTeamRow = screen.getByRole('button', { name: /My Player/i });
      const draftedRow = screen.getByRole('button', { name: /Drafted Player/i });

      expect(availableRow.className).not.toContain('opacity');
      expect(myTeamRow.className).toContain('border-l-emerald');
      expect(draftedRow.className).toContain('opacity');
    });
  });
});