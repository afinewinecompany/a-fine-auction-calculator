/**
 * Roster Grouping Utility
 *
 * Utility functions for grouping drafted players by position category.
 * Used by RosterOverview component to organize players into Hitters, Pitchers, and Bench.
 *
 * Story: 12.2 - Display Complete Roster Organized by Position
 */

import type { DraftedPlayer } from '../types/draft.types';

/**
 * Grouped roster structure with players organized by category
 */
export interface GroupedRoster {
  /** Hitters: C, 1B, 2B, 3B, SS, OF, DH, UTIL, LF, CF, RF */
  hitters: DraftedPlayer[];
  /** Pitchers: SP, RP, P */
  pitchers: DraftedPlayer[];
  /** Bench: BN, BENCH, or unknown positions */
  bench: DraftedPlayer[];
}

/**
 * Hitter position codes (case-insensitive matching)
 */
const HITTER_POSITIONS = new Set([
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'OF',
  'LF',
  'CF',
  'RF',
  'DH',
  'UTIL',
]);

/**
 * Pitcher position codes (case-insensitive matching)
 */
const PITCHER_POSITIONS = new Set(['SP', 'RP', 'P']);

/**
 * Bench position codes (case-insensitive matching)
 */
const BENCH_POSITIONS = new Set(['BN', 'BENCH']);

/**
 * Extracts the primary position from a position string.
 * Handles comma-separated multi-position strings.
 *
 * @param position - Position string (e.g., "OF" or "OF,2B")
 * @returns The primary (first) position, uppercase
 */
function getPrimaryPosition(position: string): string {
  if (!position) return '';
  // Split by comma and take first position
  const primary = position.split(',')[0].trim().toUpperCase();
  return primary;
}

/**
 * Checks if a position is a hitter position.
 *
 * @param position - Position code to check
 * @returns true if the position is a hitter position
 */
export function isHitterPosition(position: string): boolean {
  const primary = getPrimaryPosition(position);
  return HITTER_POSITIONS.has(primary);
}

/**
 * Checks if a position is a pitcher position.
 *
 * @param position - Position code to check
 * @returns true if the position is a pitcher position
 */
export function isPitcherPosition(position: string): boolean {
  const primary = getPrimaryPosition(position);
  return PITCHER_POSITIONS.has(primary);
}

/**
 * Checks if a position is a bench position.
 *
 * @param position - Position code to check
 * @returns true if the position is a bench position
 */
export function isBenchPosition(position: string): boolean {
  const primary = getPrimaryPosition(position);
  return BENCH_POSITIONS.has(primary);
}

/**
 * Groups an array of drafted players into Hitters, Pitchers, and Bench categories.
 *
 * Position categorization:
 * - Hitters: C, 1B, 2B, 3B, SS, OF, LF, CF, RF, DH, UTIL
 * - Pitchers: SP, RP, P
 * - Bench: BN, BENCH, or any unknown position
 *
 * For multi-position players (e.g., "OF,2B"), the primary (first) position is used.
 *
 * @param roster - Array of drafted players to group
 * @returns GroupedRoster with players organized by category
 */
export function groupPlayersByPosition(roster: DraftedPlayer[]): GroupedRoster {
  const grouped: GroupedRoster = {
    hitters: [],
    pitchers: [],
    bench: [],
  };

  for (const player of roster) {
    if (isHitterPosition(player.position)) {
      grouped.hitters.push(player);
    } else if (isPitcherPosition(player.position)) {
      grouped.pitchers.push(player);
    } else {
      // Bench positions or unknown positions go to bench
      grouped.bench.push(player);
    }
  }

  return grouped;
}
