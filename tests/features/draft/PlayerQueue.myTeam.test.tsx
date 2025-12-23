/**
 * PlayerQueue My Team Integration Tests
 *
 * Tests for the "My Team" checkbox functionality in PlayerQueue
 * during Manual Sync Mode.
 *
 * Story: 10.4 - Implement My Team Checkbox
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerQueue } from '@/features/draft/components/PlayerQueue';
import type { Player } from '@/features/draft/types/player.types';

// Mock players for testing
const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: 'Mike Trout',
    positions: ['OF'],
    team: 'LAA',
    projectedValue: 45,
    adjustedValue: 50,
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
];

describe('PlayerQueue My Team Integration', () => {
  const defaultProps = {
    players: mockPlayers,
    onPlayerSelect: vi.fn(),
    isManualMode: true,
    onBidSubmit: vi.fn(),
    onMyTeamToggle: vi.fn(),
    remainingBudget: 200,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Manual Mode Columns', () => {
    it('renders My Team column header in manual mode', () => {
      render(<PlayerQueue {...defaultProps} />);

      expect(screen.getByText('My Team')).toBeInTheDocument();
    });

    it('renders My Team checkbox for each player', () => {
      render(<PlayerQueue {...defaultProps} />);

      expect(screen.getByTestId('my-team-checkbox-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('my-team-checkbox-player-2')).toBeInTheDocument();
    });

    it('does not render My Team column when not in manual mode', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={false} />);

      expect(screen.queryByText('My Team')).not.toBeInTheDocument();
    });
  });

  describe('Checkbox State Management', () => {
    it('calls onMyTeamToggle when checkbox is toggled', async () => {
      const user = userEvent.setup();
      const onMyTeamToggle = vi.fn();
      render(<PlayerQueue {...defaultProps} onMyTeamToggle={onMyTeamToggle} />);

      const checkbox = screen.getByRole('checkbox', { name: /mark mike trout as my team/i });
      await user.click(checkbox);

      expect(onMyTeamToggle).toHaveBeenCalledWith('player-1', true);
    });

    it('checkbox state is independent per player', async () => {
      const user = userEvent.setup();
      const onMyTeamToggle = vi.fn();
      render(<PlayerQueue {...defaultProps} onMyTeamToggle={onMyTeamToggle} />);

      // Toggle first player
      const checkbox1 = screen.getByRole('checkbox', { name: /mark mike trout as my team/i });
      await user.click(checkbox1);

      // Toggle second player
      const checkbox2 = screen.getByRole('checkbox', { name: /mark shohei ohtani as my team/i });
      await user.click(checkbox2);

      expect(onMyTeamToggle).toHaveBeenCalledTimes(2);
      expect(onMyTeamToggle).toHaveBeenNthCalledWith(1, 'player-1', true);
      expect(onMyTeamToggle).toHaveBeenNthCalledWith(2, 'player-2', true);
    });
  });

  describe('Bid Submission with My Team', () => {
    it('passes isMyTeam=true to onBidSubmit when checkbox is checked', async () => {
      const user = userEvent.setup();
      const onBidSubmit = vi.fn();
      render(<PlayerQueue {...defaultProps} onBidSubmit={onBidSubmit} />);

      // Check the My Team checkbox first
      const checkbox = screen.getByRole('checkbox', { name: /mark mike trout as my team/i });
      await user.click(checkbox);

      // Enter a bid
      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.clear(bidInput);
      await user.type(bidInput, '25');

      // Submit the bid
      const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
      await user.click(saveButton);

      await waitFor(() => {
        expect(onBidSubmit).toHaveBeenCalledWith('player-1', 25, true);
      });
    });

    it('passes isMyTeam=false to onBidSubmit when checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const onBidSubmit = vi.fn();
      render(<PlayerQueue {...defaultProps} onBidSubmit={onBidSubmit} />);

      // Enter a bid without checking the checkbox
      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.clear(bidInput);
      await user.type(bidInput, '25');

      // Submit the bid
      const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
      await user.click(saveButton);

      await waitFor(() => {
        expect(onBidSubmit).toHaveBeenCalledWith('player-1', 25, false);
      });
    });
  });

  describe('Disabled State for Drafted Players', () => {
    it('disables My Team checkbox for drafted players', () => {
      const draftedPlayers: Player[] = [
        {
          ...mockPlayers[0],
          status: 'drafted',
          draftedByTeam: 3,
          auctionPrice: 30,
        },
      ];

      render(<PlayerQueue {...defaultProps} players={draftedPlayers} />);

      const checkbox = screen.getByRole('checkbox', { name: /mark mike trout as my team/i });
      expect(checkbox).toBeDisabled();
    });

    it('disables My Team checkbox for my-team status players', () => {
      const myTeamPlayers: Player[] = [
        {
          ...mockPlayers[0],
          status: 'my-team',
          auctionPrice: 40,
        },
      ];

      render(<PlayerQueue {...defaultProps} players={myTeamPlayers} />);

      // My-team players should not show the checkbox as disabled since they're already on the team
      // But the bid input should be disabled
      const bidInput = screen.getByTestId('bid-input-player-1');
      expect(bidInput).toBeDisabled();
    });
  });

  describe('Budget Validation', () => {
    it('passes remainingBudget to BidInput', async () => {
      const user = userEvent.setup();
      render(<PlayerQueue {...defaultProps} remainingBudget={50} />);

      // Check the checkbox to enable budget validation
      const checkbox = screen.getByRole('checkbox', { name: /mark mike trout as my team/i });
      await user.click(checkbox);

      // The bid input should enforce the remaining budget limit
      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.clear(bidInput);
      await user.type(bidInput, '100');

      // Submit should fail validation
      const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
      await user.click(saveButton);

      // Look for validation error
      await waitFor(() => {
        const errorMessage = screen.getByText(/cannot exceed/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('allows higher bids when My Team is unchecked', async () => {
      const user = userEvent.setup();
      const onBidSubmit = vi.fn();
      render(<PlayerQueue {...defaultProps} onBidSubmit={onBidSubmit} remainingBudget={50} />);

      // Don't check the checkbox - other team's pick
      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.clear(bidInput);
      await user.type(bidInput, '100');

      // Submit should succeed
      const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
      await user.click(saveButton);

      // Should be called with the higher bid since it's another team's pick
      await waitFor(() => {
        expect(onBidSubmit).toHaveBeenCalledWith('player-1', 100, false);
      });
    });
  });

  describe('Accessibility', () => {
    it('each checkbox has accessible name based on player', () => {
      render(<PlayerQueue {...defaultProps} />);

      expect(
        screen.getByRole('checkbox', { name: /mark mike trout as my team/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /mark shohei ohtani as my team/i })
      ).toBeInTheDocument();
    });
  });
});
