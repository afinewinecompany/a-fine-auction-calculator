/**
 * Performance Tests for Player Sorting
 *
 * Story: 6.4 - Implement Sortable Table Columns
 *
 * Validates that sorting 2000+ players completes in <100ms.
 */

import { describe, it, expect } from 'vitest';
import { sortPlayers } from '@/features/draft/utils/sortPlayers';
import type { Player } from '@/features/draft/types/player.types';
import type { SortState } from '@/features/draft/types/sort.types';

/**
 * Generate mock players for performance testing
 */
function generateMockPlayers(count: number): Player[] {
  const tiers: Player['tier'][] = ['ELITE', 'MID', 'LOWER'];
  const statuses: Player['status'][] = ['available', 'drafted', 'my-team'];
  const teams = ['NYY', 'LAD', 'BOS', 'CHC', 'HOU', 'ATL', 'PHI', 'SD', 'LAA', 'SF'];
  const positions = ['C', '1B', '2B', '3B', 'SS', 'OF', 'SP', 'RP'];

  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i}`,
    name: `Player ${String(i).padStart(4, '0')}`,
    positions: [positions[i % positions.length]],
    team: teams[i % teams.length],
    projectedValue: Math.floor(Math.random() * 50) + 1,
    adjustedValue: Math.floor(Math.random() * 60) + 1,
    tier: tiers[i % tiers.length],
    status: statuses[i % statuses.length],
  }));
}

describe('Sort Performance', () => {
  // Generate test data once
  const players2000 = generateMockPlayers(2000);
  const players5000 = generateMockPlayers(5000);

  describe('sorting 2000+ players', () => {
    it('should sort by adjustedValue descending in <100ms', () => {
      const sort: SortState = { column: 'adjustedValue', direction: 'desc' };

      const start = performance.now();
      const sorted = sortPlayers(players2000, sort);
      const duration = performance.now() - start;

      expect(sorted).toHaveLength(2000);
      expect(duration).toBeLessThan(100);

      // Verify sorting is correct
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].adjustedValue).toBeGreaterThanOrEqual(sorted[i].adjustedValue);
      }
    });

    it('should sort by name ascending in <100ms', () => {
      const sort: SortState = { column: 'name', direction: 'asc' };

      const start = performance.now();
      const sorted = sortPlayers(players2000, sort);
      const duration = performance.now() - start;

      expect(sorted).toHaveLength(2000);
      expect(duration).toBeLessThan(100);

      // Verify sorting is correct
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].name.localeCompare(sorted[i].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort by projectedValue ascending in <100ms', () => {
      const sort: SortState = { column: 'projectedValue', direction: 'asc' };

      const start = performance.now();
      const sorted = sortPlayers(players2000, sort);
      const duration = performance.now() - start;

      expect(sorted).toHaveLength(2000);
      expect(duration).toBeLessThan(100);
    });

    it('should sort by team descending in <100ms', () => {
      const sort: SortState = { column: 'team', direction: 'desc' };

      const start = performance.now();
      const sorted = sortPlayers(players2000, sort);
      const duration = performance.now() - start;

      expect(sorted).toHaveLength(2000);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('sorting 5000 players (stress test)', () => {
    it('should sort by adjustedValue in <200ms', () => {
      const sort: SortState = { column: 'adjustedValue', direction: 'desc' };

      const start = performance.now();
      const sorted = sortPlayers(players5000, sort);
      const duration = performance.now() - start;

      expect(sorted).toHaveLength(5000);
      expect(duration).toBeLessThan(200);
    });
  });

  describe('multiple consecutive sorts', () => {
    it('should handle rapid sort changes efficiently', () => {
      const sorts: SortState[] = [
        { column: 'adjustedValue', direction: 'desc' },
        { column: 'name', direction: 'asc' },
        { column: 'team', direction: 'desc' },
        { column: 'projectedValue', direction: 'asc' },
        { column: 'adjustedValue', direction: 'asc' },
      ];

      const start = performance.now();
      for (const sort of sorts) {
        sortPlayers(players2000, sort);
      }
      const totalDuration = performance.now() - start;
      const averageDuration = totalDuration / sorts.length;

      // Average sort should still be under 100ms
      expect(averageDuration).toBeLessThan(100);
    });
  });
});
