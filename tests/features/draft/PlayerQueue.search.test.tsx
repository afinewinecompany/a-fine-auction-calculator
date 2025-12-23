/**
 * PlayerQueue Search Integration Tests
 *
 * Tests for search functionality integrated with PlayerQueue.
 *
 * Story: 6.3 - Implement Instant Player Search
 * Updated: 6.8 - Implement Filter by Draft Status
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { PlayerQueueWithSearch } from '@/features/draft/components/PlayerQueueWithSearch';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import { DEFAULT_SORT } from '@/features/draft/types/sort.types';
import { DEFAULT_FILTER } from '@/features/draft/types/draft.types';
import type { Player } from '@/features/draft/types/player.types';

// Mock player data - all 'available' for search tests
const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Ronald Acuña Jr.',
    positions: ['OF'],
    team: 'ATL',
    projectedValue: 45,
    adjustedValue: 48,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: '2',
    name: 'Shohei Ohtani',
    positions: ['DH', 'SP'],
    team: 'LAD',
    projectedValue: 50,
    adjustedValue: 55,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: '3',
    name: 'Mike Trout',
    positions: ['OF'],
    team: 'LAA',
    projectedValue: 40,
    adjustedValue: 42,
    tier: 'ELITE',
    status: 'available', // Changed from 'drafted' for search tests
  },
  {
    id: '4',
    name: 'Mookie Betts',
    positions: ['OF', '2B'],
    team: 'LAD',
    projectedValue: 38,
    adjustedValue: 40,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: '5',
    name: 'Freddie Freeman',
    positions: ['1B'],
    team: 'LAD',
    projectedValue: 35,
    adjustedValue: 36,
    tier: 'MID',
    status: 'available',
  },
];

describe('PlayerQueueWithSearch', () => {
  const defaultProps = {
    players: mockPlayers,
    onPlayerSelect: vi.fn(),
  };

  beforeEach(() => {
    // Reset store to default state before each test
    useDraftStore.setState({ sortState: DEFAULT_SORT, filterState: DEFAULT_FILTER });
  });

  describe('Search Filtering', () => {
    it('shows all players when search is empty', () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      expect(screen.getByText('Ronald Acuña Jr.')).toBeInTheDocument();
      expect(screen.getByText('Shohei Ohtani')).toBeInTheDocument();
      expect(screen.getByText('Mike Trout')).toBeInTheDocument();
      expect(screen.getByText('Mookie Betts')).toBeInTheDocument();
      expect(screen.getByText('Freddie Freeman')).toBeInTheDocument();
    });

    it('filters players by partial name match', async () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await userEvent.type(searchInput, 'Acu');

      expect(screen.getByText('Ronald Acuña Jr.')).toBeInTheDocument();
      expect(screen.queryByText('Shohei Ohtani')).not.toBeInTheDocument();
      expect(screen.queryByText('Mike Trout')).not.toBeInTheDocument();
    });

    it('performs case-insensitive search', async () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await userEvent.type(searchInput, 'OHTANI');

      expect(screen.getByText('Shohei Ohtani')).toBeInTheDocument();
      expect(screen.queryByText('Ronald Acuña Jr.')).not.toBeInTheDocument();
    });

    it('handles special characters (accents)', async () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      // Search without accent should find player with accent
      await userEvent.type(searchInput, 'Acuna');

      expect(screen.getByText('Ronald Acuña Jr.')).toBeInTheDocument();
    });

    it('shows multiple matches', async () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      // Search for "LAD" team - Ohtani, Betts, Freeman are on LAD
      // But we search by name, so let's search common substring
      await userEvent.type(searchInput, 'e'); // matches Shohei, Mike, Mookie, Freddie

      expect(screen.getByText('Shohei Ohtani')).toBeInTheDocument();
      expect(screen.getByText('Mike Trout')).toBeInTheDocument();
      expect(screen.getByText('Mookie Betts')).toBeInTheDocument();
      expect(screen.getByText('Freddie Freeman')).toBeInTheDocument();
      expect(screen.queryByText('Ronald Acuña Jr.')).not.toBeInTheDocument();
    });

    it('shows empty state when no matches found', async () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await userEvent.type(searchInput, 'xyz123nonexistent');

      expect(screen.getByText(/no players found/i)).toBeInTheDocument();
    });

    it('clears search and shows all players', async () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await userEvent.type(searchInput, 'Acuna');

      // Verify filtered
      expect(screen.queryByText('Shohei Ohtani')).not.toBeInTheDocument();

      // Clear search (use specific aria-label to distinguish from Clear Filters)
      const clearSearchButton = screen.getByRole('button', { name: /clear search/i });
      await userEvent.click(clearSearchButton);

      // Verify all players shown
      expect(screen.getByText('Shohei Ohtani')).toBeInTheDocument();
      expect(screen.getByText('Mike Trout')).toBeInTheDocument();
    });
  });

  describe('Result Count', () => {
    it('displays total count when search is empty', () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      expect(screen.getByText('5 of 5 players')).toBeInTheDocument();
    });

    it('updates count when filtering', async () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await userEvent.type(searchInput, 'Acuna');

      expect(screen.getByText('1 of 5 players')).toBeInTheDocument();
    });

    it('shows zero count when no matches', async () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      await userEvent.type(searchInput, 'zzzzz');

      expect(screen.getByText('0 of 5 players')).toBeInTheDocument();
    });
  });

  describe('Auto-focus', () => {
    it('search input receives focus on mount by default (per AC)', () => {
      render(<PlayerQueueWithSearch {...defaultProps} />);

      expect(screen.getByRole('searchbox')).toHaveFocus();
    });

    it('can disable auto-focus when needed', () => {
      render(<PlayerQueueWithSearch {...defaultProps} autoFocusSearch={false} />);

      expect(screen.getByRole('searchbox')).not.toHaveFocus();
    });
  });
});
