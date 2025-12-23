/**
 * Player Sorting Utility
 *
 * Provides sorting of players by various columns with ascending/descending support.
 * Handles numerical and string comparisons appropriately.
 *
 * Story: 6.4 - Implement Sortable Table Columns
 */

import type { Player } from '../types/player.types';
import type { SortState } from '../types/sort.types';

/**
 * Get the sortable value from a player for a given column.
 * Handles array fields (positions) by using the first element.
 */
function getSortValue(player: Player, column: SortState['column']): string | number {
  const value = player[column];

  // Handle array fields (positions) - use first element for sorting
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value;
}

/**
 * Sort players by the specified column and direction.
 * Does not mutate the original array.
 *
 * @param players - Array of players to sort
 * @param sort - Sort state with column and direction
 * @returns New sorted array of players
 *
 * @example
 * ```ts
 * const sorted = sortPlayers(players, { column: 'adjustedValue', direction: 'desc' });
 * // Returns players sorted by adjusted value, highest first
 * ```
 */
export function sortPlayers(players: Player[], sort: SortState): Player[] {
  // Return empty array for empty input
  if (players.length === 0) {
    return [];
  }

  return [...players].sort((a, b) => {
    const aValue = getSortValue(a, sort.column);
    const bValue = getSortValue(b, sort.column);

    // Numerical comparison for number values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      // Handle NaN values - treat as equal to avoid inconsistent sort results
      if (isNaN(aValue) || isNaN(bValue)) return 0;
      return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // String comparison for text values
    const comparison = String(aValue).localeCompare(String(bValue));
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}
