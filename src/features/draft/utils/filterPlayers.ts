/**
 * Player Filtering Utility
 *
 * Provides instant filtering of players by name with case-insensitive
 * and partial matching support. Also supports status-based filtering.
 *
 * Story: 6.3 - Implement Instant Player Search
 * Updated: 6.8 - Implement Filter by Draft Status
 */

import type { Player } from '../types/player.types';
import type { StatusFilter, FilterCounts } from '../types/draft.types';

/**
 * Normalize a string for search comparison.
 * Handles accented characters by converting to their base form.
 */
function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks
}

/**
 * Filter players by search term with case-insensitive partial matching.
 *
 * @param players - Array of players to filter
 * @param searchTerm - Search string to filter by
 * @returns Filtered array of players matching the search term
 *
 * @example
 * ```ts
 * const filtered = filterPlayers(players, 'Acu');
 * // Returns players whose names contain "Acu" (case-insensitive)
 * // E.g., "Ronald Acuña Jr." matches
 * ```
 */
export function filterPlayers(players: Player[], searchTerm: string): Player[] {
  // Return all players if search is empty
  if (!searchTerm.trim()) {
    return players;
  }

  const normalizedSearch = normalizeForSearch(searchTerm.trim());

  return players.filter(player => {
    const normalizedName = normalizeForSearch(player.name);
    return normalizedName.includes(normalizedSearch);
  });
}

/**
 * Filter players by draft status.
 *
 * @param players - Array of players to filter
 * @param status - Status filter: 'all', 'available', or 'my-team'
 * @returns Filtered array of players matching the status
 *
 * Story: 6.8 - Implement Filter by Draft Status
 *
 * @example
 * ```ts
 * const available = filterByStatus(players, 'available');
 * // Returns only undrafted players
 *
 * const myTeam = filterByStatus(players, 'my-team');
 * // Returns only players drafted by user
 * ```
 */
export function filterByStatus(players: Player[], status: StatusFilter): Player[] {
  switch (status) {
    case 'all':
      return players;
    case 'available':
      return players.filter(player => player.status === 'available');
    case 'my-team':
      return players.filter(player => player.status === 'my-team');
    default:
      return players;
  }
}

/**
 * Calculate filter counts for all status options.
 *
 * @param players - Array of players to count
 * @returns Object with counts for each filter option
 *
 * Story: 6.8 - Implement Filter by Draft Status
 *
 * @example
 * ```ts
 * const counts = getFilterCounts(players);
 * // { all: 250, available: 180, myTeam: 8 }
 * ```
 */
export function getFilterCounts(players: Player[]): FilterCounts {
  return {
    all: players.length,
    available: players.filter(p => p.status === 'available').length,
    myTeam: players.filter(p => p.status === 'my-team').length,
  };
}

/**
 * Check if any filters are active (non-default).
 *
 * @param status - Current status filter
 * @param searchTerm - Current search term
 * @returns True if any filter is active
 *
 * Story: 6.8 - Implement Filter by Draft Status
 */
export function hasActiveFilters(status: StatusFilter, searchTerm: string): boolean {
  // 'available' is the default, so only non-default status counts as active
  const hasStatusFilter = status !== 'available';
  const hasSearchFilter = searchTerm.trim().length > 0;
  return hasStatusFilter || hasSearchFilter;
}
