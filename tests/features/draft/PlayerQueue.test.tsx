/**
 * Tests for PlayerQueue Component
 *
 * Story: 6.2 - Implement PlayerQueue Component Foundation
 *
 * Tests the player list table component for drafts.
 */

import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerQueue } from '@/features/draft/components/PlayerQueue';
import type { Player } from '@/features/draft/types/player.types';

// Mock player data
const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'Mike Trout',
    positions: ['CF', 'OF'],
    team: 'LAA',
    projectedValue: 50,
    adjustedValue: 55,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: 'p2',
    name: 'Mookie Betts',
    positions: ['RF', '2B'],
    team: 'LAD',
    projectedValue: 45,
    adjustedValue: 42,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: 'p3',
    name: 'Jose Ramirez',
    positions: ['3B'],
    team: 'CLE',
    projectedValue: 35,
    adjustedValue: 35,
    tier: 'MID',
    status: 'drafted',
    draftedByTeam: 5,
  },
  {
    id: 'p4',
    name: 'Player Four',
    positions: ['SS'],
    team: 'NYY',
    projectedValue: 20,
    adjustedValue: 22,
    tier: 'MID',
    status: 'my-team',
  },
  {
    id: 'p5',
    name: 'Player Five',
    positions: ['C'],
    team: 'BOS',
    projectedValue: 10,
    adjustedValue: 8,
    tier: 'LOWER',
    status: 'available',
  },
];

describe('PlayerQueue', () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================
  describe('rendering', () => {
    it('should render table with all players', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      // Check all player names are rendered
      expect(screen.getByText('Mike Trout')).toBeInTheDocument();
      expect(screen.getByText('Mookie Betts')).toBeInTheDocument();
      expect(screen.getByText('Jose Ramirez')).toBeInTheDocument();
      expect(screen.getByText('Player Four')).toBeInTheDocument();
      expect(screen.getByText('Player Five')).toBeInTheDocument();
    });

    it('should render all column headers', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      expect(screen.getByText('Player')).toBeInTheDocument();
      expect(screen.getByText('Positions')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Proj. Value')).toBeInTheDocument();
      expect(screen.getByText('Adj. Value')).toBeInTheDocument();
      expect(screen.getByText('Tier')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render empty state when no players', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={[]} onPlayerSelect={onSelect} />);

      expect(screen.getByText('No players available')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={[]} onPlayerSelect={onSelect} isLoading />);

      expect(screen.getByText('Loading players...')).toBeInTheDocument();
    });

    it('should render positions as comma-separated list', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      expect(screen.getByText('CF, OF')).toBeInTheDocument();
      expect(screen.getByText('RF, 2B')).toBeInTheDocument();
      expect(screen.getByText('3B')).toBeInTheDocument();
    });

    it('should render team abbreviations', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      expect(screen.getByText('LAA')).toBeInTheDocument();
      expect(screen.getByText('LAD')).toBeInTheDocument();
      expect(screen.getByText('CLE')).toBeInTheDocument();
      expect(screen.getByText('NYY')).toBeInTheDocument();
      expect(screen.getByText('BOS')).toBeInTheDocument();
    });

    it('should render projected values formatted as currency', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      // Projected values
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('$45')).toBeInTheDocument();
    });

    it('should render adjusted values formatted as currency', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      // Adjusted values
      expect(screen.getByText('$55')).toBeInTheDocument();
      expect(screen.getByText('$42')).toBeInTheDocument();
    });

    it('should render tier badges', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      // All tiers should be present
      expect(screen.getAllByText('T1')).toHaveLength(2); // TierBadge shows T1 for ELITE
      expect(screen.getAllByText('T2')).toHaveLength(2); // TierBadge shows T2 for MID
      expect(screen.getAllByText('T3')).toHaveLength(1); // TierBadge shows T3 for LOWER
    });
  });

  // ============================================================================
  // Status Display Tests
  // ============================================================================
  describe('status display', () => {
    it('should show Available for available players', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      // Multiple available players
      const availableElements = screen.getAllByText('Available');
      expect(availableElements.length).toBeGreaterThan(0);
    });

    it('should show My Team for user drafted players', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      expect(screen.getByText('My Team')).toBeInTheDocument();
    });

    it('should show team number for drafted players', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      expect(screen.getByText('Team 5')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================
  describe('interactions', () => {
    it('should call onPlayerSelect when row is clicked', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const row = screen.getByRole('button', { name: /Select Mike Trout/i });
      await user.click(row);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockPlayers[0]);
    });

    it('should call onPlayerSelect when Enter key is pressed', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const row = screen.getByRole('button', { name: /Select Mike Trout/i });
      fireEvent.keyDown(row, { key: 'Enter' });

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockPlayers[0]);
    });

    it('should call onPlayerSelect when Space key is pressed', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const row = screen.getByRole('button', { name: /Select Mike Trout/i });
      fireEvent.keyDown(row, { key: ' ' });

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockPlayers[0]);
    });

    it('should not call onPlayerSelect for other keys', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const row = screen.getByRole('button', { name: /Select Mike Trout/i });
      fireEvent.keyDown(row, { key: 'Tab' });

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Styling Tests
  // ============================================================================
  describe('styling', () => {
    it('should have dark background', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('bg-slate-950');
    });

    it('should apply custom className', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <PlayerQueue
          players={mockPlayers}
          onPlayerSelect={onSelect}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should render drafted players with reduced opacity', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const draftedRow = screen.getByRole('button', { name: /Select Jose Ramirez/i });
      expect(draftedRow).toHaveClass('opacity-60');
    });

    it('should have min-height for touch targets', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const rows = screen.getAllByRole('button');
      rows.forEach(row => {
        expect(row).toHaveClass('min-h-[44px]');
      });
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================
  describe('accessibility', () => {
    it('should have proper table structure', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      // 8 columns: Player, Positions, Team, Proj. Value, Adj. Value, Tier, Status, Value (Story 6.6)
      expect(screen.getAllByRole('columnheader')).toHaveLength(8);
      expect(screen.getAllByRole('button')).toHaveLength(mockPlayers.length);
    });

    it('should have aria-label on player name header', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const playerHeader = screen.getByRole('columnheader', { name: /Player/i });
      expect(playerHeader).toHaveAttribute('aria-label', 'Player Name');
    });

    it('should have aria-label on each row', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const row = screen.getByRole('button', { name: /Select Mike Trout/i });
      expect(row).toHaveAttribute('aria-label', 'Select Mike Trout');
    });

    it('should be keyboard navigable', () => {
      const onSelect = vi.fn();
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      const rows = screen.getAllByRole('button');
      rows.forEach(row => {
        expect(row).toHaveAttribute('tabindex', '0');
      });
    });
  });

  // ============================================================================
  // Value Styling Tests (Story 6.5 - Prominent Adjusted Value Styling)
  // ============================================================================
  describe('value styling', () => {
    it('should always show emerald-400 for adjusted values regardless of comparison', () => {
      const player: Player = {
        id: 'p1',
        name: 'Test Player',
        positions: ['OF'],
        team: 'TST',
        projectedValue: 30,
        adjustedValue: 35,
        tier: 'MID',
        status: 'available',
      };
      const onSelect = vi.fn();
      render(<PlayerQueue players={[player]} onPlayerSelect={onSelect} />);

      const adjustedValueCell = screen.getByText('$35');
      expect(adjustedValueCell).toHaveClass('text-emerald-400');
    });

    it('should apply text-xl and font-bold to adjusted value', () => {
      const player: Player = {
        id: 'p1',
        name: 'Test Player',
        positions: ['OF'],
        team: 'TST',
        projectedValue: 30,
        adjustedValue: 25,
        tier: 'MID',
        status: 'available',
      };
      const onSelect = vi.fn();
      render(<PlayerQueue players={[player]} onPlayerSelect={onSelect} />);

      const adjustedValueCell = screen.getByText('$25');
      expect(adjustedValueCell).toHaveClass('text-xl');
      expect(adjustedValueCell).toHaveClass('font-bold');
      expect(adjustedValueCell).toHaveClass('text-emerald-400');
    });

    it('should apply slate-400 and text-sm to projected value cell', () => {
      const player: Player = {
        id: 'p1',
        name: 'Test Player',
        positions: ['OF'],
        team: 'TST',
        projectedValue: 30,
        adjustedValue: 30,
        tier: 'MID',
        status: 'available',
      };
      const onSelect = vi.fn();
      render(<PlayerQueue players={[player]} onPlayerSelect={onSelect} />);

      // Projected value should be in its table cell with slate-400 styling
      // The cell has text-sm text-slate-400 classes
      const projectedValueSpan = screen.getByTestId('projected-value');
      expect(projectedValueSpan.closest('td')).toHaveClass('text-slate-400');
      expect(projectedValueSpan.closest('td')).toHaveClass('text-sm');
    });

    it('should show emerald for adjusted value when equal to projected', () => {
      const player: Player = {
        id: 'p1',
        name: 'Unchanged Player',
        positions: ['OF'],
        team: 'TST',
        projectedValue: 30,
        adjustedValue: 30,
        tier: 'MID',
        status: 'available',
      };
      const onSelect = vi.fn();
      render(<PlayerQueue players={[player]} onPlayerSelect={onSelect} />);

      // Use data-testid to reliably get the adjusted value element
      const adjustedValueCell = screen.getByTestId('adjusted-value');
      expect(adjustedValueCell).toHaveClass('text-emerald-400');
      expect(adjustedValueCell).toHaveClass('text-xl');
      expect(adjustedValueCell).toHaveClass('font-bold');
    });

    it('should have aria-labels on value elements for accessibility', () => {
      const player: Player = {
        id: 'p1',
        name: 'Accessible Player',
        positions: ['OF'],
        team: 'TST',
        projectedValue: 30,
        adjustedValue: 35,
        tier: 'MID',
        status: 'available',
      };
      const onSelect = vi.fn();
      render(<PlayerQueue players={[player]} onPlayerSelect={onSelect} />);

      const adjustedValue = screen.getByTestId('adjusted-value');
      const projectedValue = screen.getByTestId('projected-value');

      expect(adjustedValue).toHaveAttribute('aria-label', 'Adjusted value: $35');
      expect(projectedValue).toHaveAttribute('aria-label', 'Projected value: $30');
    });
  });
});
