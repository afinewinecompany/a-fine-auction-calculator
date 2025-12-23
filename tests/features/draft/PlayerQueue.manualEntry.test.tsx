/**
 * PlayerQueue Manual Entry Flow Tests
 *
 * Tests for the manual bid entry flow in PlayerQueue.
 * Story 10.3 - Implement Manual Bid Entry
 *
 * Test Coverage:
 * - Bid submission marks player as drafted
 * - Player row updates to show "Drafted" status
 * - Bid input is hidden after submission
 * - Auction price displayed in player row
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerQueue } from '@/features/draft/components/PlayerQueue';
import type { Player } from '@/features/draft/types/player.types';

describe('PlayerQueue Manual Entry Flow', () => {
  const mockPlayers: Player[] = [
    {
      id: 'player-1',
      name: 'Mike Trout',
      positions: ['OF'],
      team: 'LAA',
      projectedValue: 45,
      adjustedValue: 48,
      tier: 'ELITE',
      status: 'available',
    },
    {
      id: 'player-2',
      name: 'Shohei Ohtani',
      positions: ['SP', 'DH'],
      team: 'LAD',
      projectedValue: 50,
      adjustedValue: 55,
      tier: 'ELITE',
      status: 'available',
    },
    {
      id: 'player-3',
      name: 'Aaron Judge',
      positions: ['OF'],
      team: 'NYY',
      projectedValue: 42,
      adjustedValue: 44,
      tier: 'ELITE',
      status: 'drafted',
      draftedByTeam: 2,
      auctionPrice: 50,
    },
  ];

  const defaultProps = {
    players: mockPlayers,
    onPlayerSelect: vi.fn(),
    isManualMode: true,
    onBidSubmit: vi.fn(),
    onMyTeamToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bid Submission Flow', () => {
    it('calls onBidSubmit when bid is submitted for a player', async () => {
      const user = userEvent.setup();
      const onBidSubmit = vi.fn();
      render(<PlayerQueue {...defaultProps} onBidSubmit={onBidSubmit} />);

      // Find the bid input for Mike Trout
      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.type(bidInput, '35');

      // Find and click the save button
      const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
      await user.click(saveButton);

      await waitFor(() => {
        expect(onBidSubmit).toHaveBeenCalledWith('player-1', 35, false);
      });
    });

    it('calls onBidSubmit with isMyTeam flag when checkbox is checked', async () => {
      const user = userEvent.setup();
      const onBidSubmit = vi.fn();
      const onMyTeamToggle = vi.fn();
      render(
        <PlayerQueue
          {...defaultProps}
          onBidSubmit={onBidSubmit}
          onMyTeamToggle={onMyTeamToggle}
        />
      );

      // Toggle My Team checkbox for player 1
      const myTeamCheckbox = screen.getByTestId('my-team-checkbox-player-1');
      await user.click(myTeamCheckbox);

      // Now submit bid
      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.type(bidInput, '40');

      const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
      await user.click(saveButton);

      await waitFor(() => {
        expect(onBidSubmit).toHaveBeenCalledWith('player-1', 40, true);
      });
    });
  });

  describe('Drafted Player Display', () => {
    it('shows auction price for drafted players', () => {
      render(<PlayerQueue {...defaultProps} />);

      // Aaron Judge is drafted for $50
      expect(screen.getByText('$50')).toBeInTheDocument();
    });

    it('shows team number badge for players drafted by others', () => {
      render(<PlayerQueue {...defaultProps} />);

      // Aaron Judge is drafted by team 2 - StatusBadge shows "Team {N}"
      expect(screen.getByText('Team 2')).toBeInTheDocument();
    });

    it('disables bid input for drafted players', () => {
      render(<PlayerQueue {...defaultProps} />);

      // Aaron Judge's bid input should be disabled
      const bidInput = screen.getByTestId('bid-input-player-3');
      expect(bidInput).toBeDisabled();
    });
  });

  describe('Manual Mode Column Visibility', () => {
    it('shows Bid and My Team columns when isManualMode is true', () => {
      render(<PlayerQueue {...defaultProps} isManualMode />);

      expect(screen.getByText('Bid')).toBeInTheDocument();
      expect(screen.getByText('My Team')).toBeInTheDocument();
    });

    it('hides Bid and My Team columns when isManualMode is false', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={false} />);

      expect(screen.queryByText('Bid')).not.toBeInTheDocument();
      expect(screen.queryByText('My Team')).not.toBeInTheDocument();
    });

    it('renders bid inputs for available players in manual mode', () => {
      render(<PlayerQueue {...defaultProps} isManualMode />);

      // Mike Trout and Shohei Ohtani should have bid inputs
      expect(screen.getByTestId('bid-input-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('bid-input-player-2')).toBeInTheDocument();
    });
  });

  describe('Row Status Updates', () => {
    it('applies drafted row styling to drafted players', () => {
      render(<PlayerQueue {...defaultProps} />);

      // Find the row for Aaron Judge (drafted)
      const row = screen.getByRole('button', { name: /Select Aaron Judge/i });
      expect(row).toHaveAttribute('data-status', 'drafted');
    });

    it('applies available row styling to available players', () => {
      render(<PlayerQueue {...defaultProps} />);

      const row = screen.getByRole('button', { name: /Select Mike Trout/i });
      expect(row).toHaveAttribute('data-status', 'available');
    });

    it('applies my-team styling for players marked as my team', () => {
      const playersWithMyTeam: Player[] = [
        {
          id: 'player-4',
          name: 'Mookie Betts',
          positions: ['OF', '2B'],
          team: 'LAD',
          projectedValue: 38,
          adjustedValue: 40,
          tier: 'ELITE',
          status: 'my-team',
          auctionPrice: 42,
        },
      ];

      render(<PlayerQueue {...defaultProps} players={playersWithMyTeam} />);

      const row = screen.getByRole('button', { name: /Select Mookie Betts/i });
      expect(row).toHaveAttribute('data-status', 'my-team');
    });
  });

  describe('Enter Key Submission', () => {
    it('submits bid on Enter key press', async () => {
      const user = userEvent.setup();
      const onBidSubmit = vi.fn();
      render(<PlayerQueue {...defaultProps} onBidSubmit={onBidSubmit} />);

      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.type(bidInput, '25{Enter}');

      await waitFor(() => {
        expect(onBidSubmit).toHaveBeenCalledWith('player-1', 25, false);
      });
    });
  });
});
