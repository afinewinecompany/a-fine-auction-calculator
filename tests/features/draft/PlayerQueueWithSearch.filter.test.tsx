/**
 * PlayerQueueWithSearch Filter Integration Tests
 *
 * Tests for filter functionality integration in PlayerQueueWithSearch.
 *
 * Story: 6.8 - Implement Filter by Draft Status
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerQueueWithSearch } from '@/features/draft/components/PlayerQueueWithSearch';
import { useDraftStore } from '@/features/draft';
import { DEFAULT_FILTER } from '@/features/draft/types/draft.types';
import { DEFAULT_SORT } from '@/features/draft/types/sort.types';
import type { Player } from '@/features/draft/types/player.types';

// Create a test player helper
function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: '1',
    name: 'Test Player',
    positions: ['OF'],
    team: 'TST',
    projectedValue: 30,
    adjustedValue: 32,
    tier: 'MID',
    status: 'available',
    ...overrides,
  };
}

// Test data with mixed statuses
const testPlayers: Player[] = [
  createPlayer({ id: '1', name: 'Available Player 1', status: 'available' }),
  createPlayer({ id: '2', name: 'Available Player 2', status: 'available' }),
  createPlayer({ id: '3', name: 'My Team Player', status: 'my-team', draftedByTeam: 1 }),
  createPlayer({ id: '4', name: 'Drafted Player', status: 'drafted', draftedByTeam: 2 }),
];

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PlayerQueueWithSearch - Filter Integration', () => {
  const onPlayerSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    useDraftStore.setState({
      drafts: {},
      sortState: DEFAULT_SORT,
      filterState: DEFAULT_FILTER,
    });
  });

  describe('Filter Controls', () => {
    it('renders StatusFilter component', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      expect(screen.getByTestId('status-filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter-available')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter-my-team')).toBeInTheDocument();
    });

    it('shows correct initial counts', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // 4 total, 2 available, 1 my-team
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Status Filter Behavior', () => {
    it('filters to show all players when "All" is selected', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      fireEvent.click(screen.getByTestId('status-filter-all'));

      // All 4 players should be visible
      expect(screen.getByText('Available Player 1')).toBeInTheDocument();
      expect(screen.getByText('Available Player 2')).toBeInTheDocument();
      expect(screen.getByText('My Team Player')).toBeInTheDocument();
      expect(screen.getByText('Drafted Player')).toBeInTheDocument();
    });

    it('filters to show only available players by default', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // Only available players should be visible (default filter)
      expect(screen.getByText('Available Player 1')).toBeInTheDocument();
      expect(screen.getByText('Available Player 2')).toBeInTheDocument();
      expect(screen.queryByText('My Team Player')).not.toBeInTheDocument();
      expect(screen.queryByText('Drafted Player')).not.toBeInTheDocument();
    });

    it('filters to show only my-team players when "My Team" is selected', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      fireEvent.click(screen.getByTestId('status-filter-my-team'));

      // Only my-team player should be visible
      expect(screen.queryByText('Available Player 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Available Player 2')).not.toBeInTheDocument();
      expect(screen.getByText('My Team Player')).toBeInTheDocument();
      expect(screen.queryByText('Drafted Player')).not.toBeInTheDocument();
    });
  });

  describe('Clear Filters Button', () => {
    it('shows clear button when non-default filter is active', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // Click "All" to change from default
      fireEvent.click(screen.getByTestId('status-filter-all'));

      expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();
    });

    it('hides clear button when only default filter is active', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // Default filter is "available", clear button should not be visible
      expect(screen.queryByTestId('clear-filters-button')).not.toBeInTheDocument();
    });

    it('resets filters when clear button is clicked', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // Change to "All" filter
      fireEvent.click(screen.getByTestId('status-filter-all'));
      expect(screen.getByText('Drafted Player')).toBeInTheDocument();

      // Click clear filters
      fireEvent.click(screen.getByTestId('clear-filters-button'));

      // Should be back to "available" only
      expect(screen.queryByText('Drafted Player')).not.toBeInTheDocument();
      expect(screen.getByText('Available Player 1')).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    it('combines search and status filter', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // Select "All" to show all players
      fireEvent.click(screen.getByTestId('status-filter-all'));

      // Type in search
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Available' } });

      // Should show only available players matching search
      expect(screen.getByText('Available Player 1')).toBeInTheDocument();
      expect(screen.getByText('Available Player 2')).toBeInTheDocument();
      expect(screen.queryByText('My Team Player')).not.toBeInTheDocument();
      expect(screen.queryByText('Drafted Player')).not.toBeInTheDocument();
    });

    it('search works within status filter context', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // Default is "available"
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Player 1' } });

      // Should show only "Available Player 1" (matches search and status)
      expect(screen.getByText('Available Player 1')).toBeInTheDocument();
      expect(screen.queryByText('Available Player 2')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty message for my-team when no players on team', () => {
      const noMyTeamPlayers = testPlayers.filter(p => p.status !== 'my-team');
      render(
        <PlayerQueueWithSearch players={noMyTeamPlayers} onPlayerSelect={onPlayerSelect} />
      );

      fireEvent.click(screen.getByTestId('status-filter-my-team'));

      expect(screen.getByText('No players on your team yet')).toBeInTheDocument();
    });

    it('shows clear filters button in empty state when filters active', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // Switch to my-team then search for something that won't match
      fireEvent.click(screen.getByTestId('status-filter-my-team'));
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      // Should show clear filters button in empty state
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });
  });

  describe('State Persistence', () => {
    it('persists filter state to store', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      fireEvent.click(screen.getByTestId('status-filter-all'));

      const state = useDraftStore.getState();
      expect(state.filterState.status).toBe('all');
    });

    it('persists search term to store', () => {
      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      const state = useDraftStore.getState();
      expect(state.filterState.searchTerm).toBe('test search');
    });

    it('uses filter state from store on mount', () => {
      // Set filter state before rendering
      useDraftStore.setState({
        ...useDraftStore.getState(),
        filterState: { status: 'all', searchTerm: '', position: undefined },
      });

      render(<PlayerQueueWithSearch players={testPlayers} onPlayerSelect={onPlayerSelect} />);

      // All players should be visible
      expect(screen.getByText('Available Player 1')).toBeInTheDocument();
      expect(screen.getByText('My Team Player')).toBeInTheDocument();
      expect(screen.getByText('Drafted Player')).toBeInTheDocument();
    });
  });
});
