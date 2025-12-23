/**
 * Tests for PlayerQueue Sorting Integration
 *
 * Story: 6.4 - Implement Sortable Table Columns
 *
 * Tests the sorting functionality in the PlayerQueue component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerQueue } from '@/features/draft/components/PlayerQueue';
import type { Player } from '@/features/draft/types/player.types';
import type { SortState } from '@/features/draft/types/sort.types';

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
    name: 'Aaron Judge',
    positions: ['RF'],
    team: 'NYY',
    projectedValue: 48,
    adjustedValue: 52,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: 'p3',
    name: 'Zack Wheeler',
    positions: ['SP'],
    team: 'PHI',
    projectedValue: 35,
    adjustedValue: 40,
    tier: 'MID',
    status: 'drafted',
  },
];

describe('PlayerQueue Sorting', () => {
  // ============================================================================
  // Sortable Headers Tests
  // ============================================================================
  describe('sortable headers', () => {
    it('should render sortable headers for all columns', () => {
      const onSelect = vi.fn();
      const onSort = vi.fn();
      const sort: SortState = { column: 'adjustedValue', direction: 'desc' };

      render(
        <PlayerQueue
          players={mockPlayers}
          onPlayerSelect={onSelect}
          sortState={sort}
          onSortChange={onSort}
        />
      );

      // All column headers should be sortable buttons
      expect(screen.getByRole('button', { name: /sort by player/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by positions/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by team/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by proj. value/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by adj. value/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by tier/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by status/i })).toBeInTheDocument();
    });

    it('should show sort direction indicator for active column', () => {
      const onSelect = vi.fn();
      const onSort = vi.fn();
      const sort: SortState = { column: 'adjustedValue', direction: 'desc' };

      render(
        <PlayerQueue
          players={mockPlayers}
          onPlayerSelect={onSelect}
          sortState={sort}
          onSortChange={onSort}
        />
      );

      expect(screen.getByTestId('sort-desc-icon')).toBeInTheDocument();
    });

    it('should call onSortChange when header is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onSort = vi.fn();
      const sort: SortState = { column: 'adjustedValue', direction: 'desc' };

      render(
        <PlayerQueue
          players={mockPlayers}
          onPlayerSelect={onSelect}
          sortState={sort}
          onSortChange={onSort}
        />
      );

      await user.click(screen.getByRole('button', { name: /sort by player/i }));

      expect(onSort).toHaveBeenCalledWith('name');
    });
  });

  // ============================================================================
  // Backward Compatibility Tests
  // ============================================================================
  describe('backward compatibility', () => {
    it('should render without sort props (no sorting enabled)', () => {
      const onSelect = vi.fn();

      render(<PlayerQueue players={mockPlayers} onPlayerSelect={onSelect} />);

      // Should still render the table with headers
      expect(screen.getByText('Player')).toBeInTheDocument();
      expect(screen.getByText('Mike Trout')).toBeInTheDocument();
    });
  });
});
