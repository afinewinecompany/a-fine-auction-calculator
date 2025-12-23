/**
 * PlayerQueue Manual Mode Tests
 *
 * Tests for Story 10.2 - Enable Manual Sync Mode
 * Validates:
 * - Manual mode columns appear when isManualMode=true
 * - Bid input fields render for each player
 * - My Team checkboxes render for each player
 * - Manual mode columns hidden when isManualMode=false
 */

import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerQueue } from '@/features/draft/components/PlayerQueue';
import type { Player } from '@/features/draft/types/player.types';

// Mock player data
const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: 'Mike Trout',
    positions: ['OF'],
    team: 'LAA',
    projectedValue: 45,
    adjustedValue: 52,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: 'player-2',
    name: 'Shohei Ohtani',
    positions: ['DH', 'SP'],
    team: 'LAD',
    projectedValue: 50,
    adjustedValue: 58,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: 'player-3',
    name: 'Aaron Judge',
    positions: ['OF'],
    team: 'NYY',
    projectedValue: 40,
    adjustedValue: 46,
    tier: 'ELITE',
    status: 'drafted',
    draftedByTeam: 3,
    auctionPrice: 48,
  },
];

describe('PlayerQueue Manual Mode', () => {
  const defaultProps = {
    players: mockPlayers,
    onPlayerSelect: vi.fn(),
    isManualMode: false,
  };

  describe('Manual Mode Columns Visibility', () => {
    it('should not show manual mode columns when isManualMode is false', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={false} />);

      // Bid and My Team headers should not exist
      expect(screen.queryByText('Bid')).not.toBeInTheDocument();
      expect(screen.queryByText('My Team')).not.toBeInTheDocument();

      // Bid inputs should not exist
      expect(screen.queryByTestId('bid-input-player-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('my-team-checkbox-player-1')).not.toBeInTheDocument();
    });

    it('should show manual mode columns when isManualMode is true', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={true} />);

      // Headers should appear
      expect(screen.getByText('Bid')).toBeInTheDocument();
      expect(screen.getByText('My Team')).toBeInTheDocument();

      // Bid inputs should appear for each player
      expect(screen.getByTestId('bid-input-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('bid-input-player-2')).toBeInTheDocument();
      expect(screen.getByTestId('bid-input-player-3')).toBeInTheDocument();

      // My Team checkboxes should appear for each player
      expect(screen.getByTestId('my-team-checkbox-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('my-team-checkbox-player-2')).toBeInTheDocument();
      expect(screen.getByTestId('my-team-checkbox-player-3')).toBeInTheDocument();
    });

    it('should show manual mode columns with sortable headers', () => {
      const mockSortChange = vi.fn();
      render(
        <PlayerQueue
          {...defaultProps}
          isManualMode={true}
          sortState={{ column: 'adjustedValue', direction: 'desc' }}
          onSortChange={mockSortChange}
        />
      );

      // Both headers should appear
      expect(screen.getByText('Bid')).toBeInTheDocument();
      expect(screen.getByText('My Team')).toBeInTheDocument();
    });
  });

  describe('Bid Input Functionality', () => {
    it('should call onBidSubmit when bid is entered', async () => {
      const user = userEvent.setup();
      const onBidSubmit = vi.fn();

      render(
        <PlayerQueue
          {...defaultProps}
          isManualMode={true}
          onBidSubmit={onBidSubmit}
        />
      );

      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.type(bidInput, '35');
      await user.keyboard('{Enter}');

      expect(onBidSubmit).toHaveBeenCalledWith('player-1', 35);
    });

    it('should disable bid input for drafted players', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={true} />);

      // Player 3 is drafted, so input should be disabled
      const bidInput = screen.getByTestId('bid-input-player-3');
      expect(bidInput).toBeDisabled();

      // Available players should have enabled inputs
      expect(screen.getByTestId('bid-input-player-1')).not.toBeDisabled();
      expect(screen.getByTestId('bid-input-player-2')).not.toBeDisabled();
    });

    it('should show current auction price in bid input for drafted players', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={true} />);

      // Player 3 has auctionPrice of 48
      const bidInput = screen.getByTestId('bid-input-player-3') as HTMLInputElement;
      expect(bidInput.value).toBe('48');
    });
  });

  describe('My Team Checkbox Functionality', () => {
    it('should call onMyTeamToggle when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onMyTeamToggle = vi.fn();

      render(
        <PlayerQueue
          {...defaultProps}
          isManualMode={true}
          onMyTeamToggle={onMyTeamToggle}
        />
      );

      const checkbox = screen.getByTestId('my-team-checkbox-player-1');
      await user.click(checkbox);

      expect(onMyTeamToggle).toHaveBeenCalledWith('player-1', true);
    });

    it('should show checked state for my-team status players', () => {
      const playersWithMyTeam: Player[] = [
        ...mockPlayers.slice(0, 2),
        {
          ...mockPlayers[2],
          status: 'my-team',
        },
      ];

      render(
        <PlayerQueue
          {...defaultProps}
          players={playersWithMyTeam}
          isManualMode={true}
        />
      );

      // Player 3 is my-team, checkbox should be checked
      const checkbox = screen.getByTestId('my-team-checkbox-player-3');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should disable checkbox for drafted by others players', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={true} />);

      // Player 3 is drafted by another team
      const checkbox = screen.getByTestId('my-team-checkbox-player-3');
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Row Interaction with Manual Mode', () => {
    it('should not trigger row selection when clicking bid input', async () => {
      const user = userEvent.setup();
      const onPlayerSelect = vi.fn();

      render(
        <PlayerQueue
          {...defaultProps}
          isManualMode={true}
          onPlayerSelect={onPlayerSelect}
        />
      );

      const bidInput = screen.getByTestId('bid-input-player-1');
      await user.click(bidInput);

      expect(onPlayerSelect).not.toHaveBeenCalled();
    });

    it('should not trigger row selection when clicking checkbox', async () => {
      const user = userEvent.setup();
      const onPlayerSelect = vi.fn();

      render(
        <PlayerQueue
          {...defaultProps}
          isManualMode={true}
          onPlayerSelect={onPlayerSelect}
        />
      );

      const checkbox = screen.getByTestId('my-team-checkbox-player-1');
      await user.click(checkbox);

      expect(onPlayerSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels on bid inputs', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={true} />);

      const bidInput = screen.getByTestId('bid-input-player-1');
      expect(bidInput).toHaveAttribute('aria-label', 'Bid amount for Mike Trout');
    });

    it('should have proper aria-labels on checkboxes', () => {
      render(<PlayerQueue {...defaultProps} isManualMode={true} />);

      const checkbox = screen.getByTestId('my-team-checkbox-player-1');
      expect(checkbox).toHaveAttribute('aria-label', 'Mark Mike Trout as my team');
    });
  });
});
