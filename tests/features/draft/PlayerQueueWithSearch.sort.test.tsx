/**
 * Integration Tests for PlayerQueueWithSearch Sorting
 *
 * Story: 6.4 - Implement Sortable Table Columns
 * Updated: 6.8 - Implement Filter by Draft Status
 *
 * Tests the full sorting integration with search and Zustand store.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerQueueWithSearch } from '@/features/draft/components/PlayerQueueWithSearch';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import { DEFAULT_SORT } from '@/features/draft/types/sort.types';
import { DEFAULT_FILTER } from '@/features/draft/types/draft.types';
import type { Player } from '@/features/draft/types/player.types';

// Mock player data - intentionally unsorted to test default sort
// Note: All players are 'available' to work with default filter (Story 6.8)
const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'Charlie Morton',
    positions: ['SP'],
    team: 'ATL',
    projectedValue: 15,
    adjustedValue: 12,
    tier: 'LOWER',
    status: 'available',
  },
  {
    id: 'p2',
    name: 'Mike Trout',
    positions: ['CF', 'OF'],
    team: 'LAA',
    projectedValue: 50,
    adjustedValue: 55,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: 'p3',
    name: 'Aaron Judge',
    positions: ['RF'],
    team: 'NYY',
    projectedValue: 48,
    adjustedValue: 52,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: 'p4',
    name: 'Zack Wheeler',
    positions: ['SP'],
    team: 'PHI',
    projectedValue: 35,
    adjustedValue: 40,
    tier: 'MID',
    status: 'available', // Changed from 'drafted' to 'available' for sort tests
  },
];

describe('PlayerQueueWithSearch Sorting Integration', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useDraftStore.setState({ sortState: DEFAULT_SORT, filterState: DEFAULT_FILTER });
  });

  describe('default sort', () => {
    it('should display players sorted by adjustedValue descending by default', () => {
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      // Get all player name cells - they should be in order by adjusted value desc
      const rows = screen.getAllByRole('button', { name: /Select /i });

      // Mike Trout ($55) should be first
      expect(rows[0]).toHaveAttribute('aria-label', 'Select Mike Trout');
      // Aaron Judge ($52) should be second
      expect(rows[1]).toHaveAttribute('aria-label', 'Select Aaron Judge');
      // Zack Wheeler ($40) should be third
      expect(rows[2]).toHaveAttribute('aria-label', 'Select Zack Wheeler');
      // Charlie Morton ($12) should be last
      expect(rows[3]).toHaveAttribute('aria-label', 'Select Charlie Morton');
    });

    it('should show descending arrow on Adj. Value column by default', () => {
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      expect(screen.getByTestId('sort-desc-icon')).toBeInTheDocument();
    });
  });

  describe('clicking column headers', () => {
    it('should sort by name ascending when Player header is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      // Click on Player header
      await user.click(screen.getByRole('button', { name: /sort by player/i }));

      const rows = screen.getAllByRole('button', { name: /Select /i });

      // Aaron Judge should be first (alphabetically)
      expect(rows[0]).toHaveAttribute('aria-label', 'Select Aaron Judge');
      // Charlie Morton should be second
      expect(rows[1]).toHaveAttribute('aria-label', 'Select Charlie Morton');
      // Mike Trout should be third
      expect(rows[2]).toHaveAttribute('aria-label', 'Select Mike Trout');
      // Zack Wheeler should be last
      expect(rows[3]).toHaveAttribute('aria-label', 'Select Zack Wheeler');
    });

    it('should toggle to descending when same column is clicked again', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      // Click on Player header twice (first click: asc, second click: desc)
      await user.click(screen.getByRole('button', { name: /sort by player/i }));
      await user.click(screen.getByRole('button', { name: /sort by player/i }));

      const rows = screen.getAllByRole('button', { name: /Select /i });

      // Zack Wheeler should be first (reverse alphabetical)
      expect(rows[0]).toHaveAttribute('aria-label', 'Select Zack Wheeler');
      // Aaron Judge should be last
      expect(rows[3]).toHaveAttribute('aria-label', 'Select Aaron Judge');
    });

    it('should show ascending arrow after first click on new column', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      // Click on Player header
      await user.click(screen.getByRole('button', { name: /sort by player/i }));

      expect(screen.getByTestId('sort-asc-icon')).toBeInTheDocument();
    });
  });

  describe('sort with search', () => {
    it('should maintain sort order when searching', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      // Sort by name ascending first
      await user.click(screen.getByRole('button', { name: /sort by player/i }));

      // Search for players with 'a' in name
      const searchInput = screen.getByPlaceholderText(/search players/i);
      await user.type(searchInput, 'a');

      // Should show Aaron Judge, Charlie Morton, Zack Wheeler (all have 'a')
      // They should still be sorted alphabetically by name
      const rows = screen.getAllByRole('button', { name: /Select /i });

      expect(rows[0]).toHaveAttribute('aria-label', 'Select Aaron Judge');
      expect(rows[1]).toHaveAttribute('aria-label', 'Select Charlie Morton');
      expect(rows[2]).toHaveAttribute('aria-label', 'Select Zack Wheeler');
    });
  });

  describe('sort state persistence', () => {
    it('should persist sort state in Zustand store', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      // Click on Team header
      await user.click(screen.getByRole('button', { name: /sort by team/i }));

      // Check store state
      const { sortState } = useDraftStore.getState();
      expect(sortState.column).toBe('team');
      expect(sortState.direction).toBe('asc');
    });
  });

  describe('numerical vs string sorting', () => {
    it('should sort projected values numerically', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      // Click on Proj. Value header
      await user.click(screen.getByRole('button', { name: /sort by proj. value/i }));

      const rows = screen.getAllByRole('button', { name: /Select /i });

      // Should be sorted numerically ascending: 15, 35, 48, 50
      expect(rows[0]).toHaveAttribute('aria-label', 'Select Charlie Morton'); // 15
      expect(rows[1]).toHaveAttribute('aria-label', 'Select Zack Wheeler'); // 35
      expect(rows[2]).toHaveAttribute('aria-label', 'Select Aaron Judge'); // 48
      expect(rows[3]).toHaveAttribute('aria-label', 'Select Mike Trout'); // 50
    });

    it('should sort team names alphabetically', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<PlayerQueueWithSearch players={mockPlayers} onPlayerSelect={onSelect} />);

      // Click on Team header
      await user.click(screen.getByRole('button', { name: /sort by team/i }));

      const rows = screen.getAllByRole('button', { name: /Select /i });

      // Should be sorted alphabetically: ATL, LAA, NYY, PHI
      expect(rows[0]).toHaveAttribute('aria-label', 'Select Charlie Morton'); // ATL
      expect(rows[1]).toHaveAttribute('aria-label', 'Select Mike Trout'); // LAA
      expect(rows[2]).toHaveAttribute('aria-label', 'Select Aaron Judge'); // NYY
      expect(rows[3]).toHaveAttribute('aria-label', 'Select Zack Wheeler'); // PHI
    });
  });
});
