/**
 * PlayerQueueWithSearch Component
 *
 * Combines PlayerQueue with instant search, status filtering, and sorting.
 * Uses useMemo for performance-optimized filtering and sorting.
 *
 * Story: 6.3 - Implement Instant Player Search
 * Updated: 6.4 - Implement Sortable Table Columns
 * Updated: 6.8 - Implement Filter by Draft Status
 * Updated: 6.10 - Implement Mobile-Responsive Design
 */

import { useMemo, useCallback } from 'react';
import { cn } from '@/components/ui/utils';
import { PlayerQueue } from './PlayerQueue';
import { PlayerSearch } from './PlayerSearch';
import { StatusFilter } from './StatusFilter';
import { ClearFiltersButton } from './ClearFiltersButton';
import {
  filterPlayers,
  filterByStatus,
  getFilterCounts,
  hasActiveFilters,
} from '../utils/filterPlayers';
import { sortPlayers } from '../utils/sortPlayers';
import { useDraftStore } from '../stores/draftStore';
import type { Player } from '../types/player.types';
import type { SortColumn } from '../types/sort.types';
import type { StatusFilter as StatusFilterType } from '../types/draft.types';

export interface PlayerQueueWithSearchProps {
  /** Array of players to display */
  players: Player[];
  /** Callback when a player row is selected */
  onPlayerSelect: (player: Player) => void;
  /** Optional CSS class name */
  className?: string;
  /** Whether the table is loading */
  isLoading?: boolean;
  /** Whether to auto-focus search on mount (default: true per AC) */
  autoFocusSearch?: boolean;
}

/**
 * PlayerQueueWithSearch component
 *
 * Provides instant player search with the following features:
 * - Case-insensitive filtering
 * - Partial name matching
 * - Support for accented characters
 * - Status filtering (all, available, my-team)
 * - Performance optimized with useMemo
 * - Auto-focus option
 * - Result count display
 * - Clear filters button
 */
export function PlayerQueueWithSearch({
  players,
  onPlayerSelect,
  className,
  isLoading = false,
  autoFocusSearch = true,
}: PlayerQueueWithSearchProps) {
  // Sort and filter state from Zustand store (Story 6.8)
  const sortState = useDraftStore(state => state.sortState);
  const toggleSort = useDraftStore(state => state.toggleSort);
  const filterState = useDraftStore(state => state.filterState);
  const setStatusFilter = useDraftStore(state => state.setStatusFilter);
  const setSearchFilter = useDraftStore(state => state.setSearchFilter);
  const clearFilters = useDraftStore(state => state.clearFilters);

  // Get search term from store
  const searchTerm = filterState.searchTerm;

  // Calculate filter counts from unfiltered player list (Story 6.8)
  const filterCounts = useMemo(() => getFilterCounts(players), [players]);

  // Memoized filtered and sorted results for performance
  // Order: 1. Filter by search, 2. Filter by status, 3. Sort by column (Story 6.8)
  const processedPlayers = useMemo(() => {
    const searchFiltered = filterPlayers(players, searchTerm);
    const statusFiltered = filterByStatus(searchFiltered, filterState.status);
    return sortPlayers(statusFiltered, sortState);
  }, [players, searchTerm, filterState.status, sortState]);

  // Handle search change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchFilter(value);
    },
    [setSearchFilter]
  );

  // Handle status filter change (Story 6.8)
  const handleStatusChange = useCallback(
    (status: StatusFilterType) => {
      setStatusFilter(status);
    },
    [setStatusFilter]
  );

  // Handle sort column change
  const handleSortChange = useCallback(
    (column: SortColumn) => {
      toggleSort(column);
    },
    [toggleSort]
  );

  // Handle clear filters (Story 6.8)
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Check if any filters are active (Story 6.8)
  const filtersActive = hasActiveFilters(filterState.status, searchTerm);

  // Check if we should show empty results state
  const showNoResults = !isLoading && processedPlayers.length === 0;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Filter Toolbar (Story 6.8) */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
        {/* Status Filter */}
        <StatusFilter
          value={filterState.status}
          onChange={handleStatusChange}
          counts={filterCounts}
        />

        {/* Clear Filters Button */}
        <ClearFiltersButton onClear={handleClearFilters} isActive={filtersActive} />
      </div>

      {/* Search Input */}
      <PlayerSearch
        value={searchTerm}
        onChange={handleSearchChange}
        totalCount={players.length}
        filteredCount={processedPlayers.length}
        autoFocus={autoFocusSearch}
      />

      {/* No Results State */}
      {showNoResults && (
        <div className="bg-slate-950 rounded-lg p-8 text-center">
          <div className="text-slate-400">
            {searchTerm.trim().length > 0
              ? `No players found matching "${searchTerm}"`
              : filterState.status === 'my-team'
                ? 'No players on your team yet'
                : 'No players available'}
          </div>
          {filtersActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Player Queue with Sorting */}
      {!showNoResults && (
        <PlayerQueue
          players={processedPlayers}
          onPlayerSelect={onPlayerSelect}
          isLoading={isLoading}
          sortState={sortState}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
}

export default PlayerQueueWithSearch;
