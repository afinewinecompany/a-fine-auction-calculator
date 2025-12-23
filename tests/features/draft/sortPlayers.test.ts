/**
 * Tests for sortPlayers Utility
 *
 * Story: 6.4 - Implement Sortable Table Columns
 *
 * Tests the player sorting utility function.
 */

import { describe, it, expect } from 'vitest';
import { sortPlayers } from '@/features/draft/utils/sortPlayers';
import type { Player } from '@/features/draft/types/player.types';
import type { SortState } from '@/features/draft/types/sort.types';

// Mock player data for testing
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
  {
    id: 'p4',
    name: 'Bobby Witt Jr.',
    positions: ['SS', '3B'],
    team: 'KC',
    projectedValue: 42,
    adjustedValue: 38,
    tier: 'ELITE',
    status: 'my-team',
  },
  {
    id: 'p5',
    name: 'Charlie Morton',
    positions: ['SP'],
    team: 'ATL',
    projectedValue: 15,
    adjustedValue: 12,
    tier: 'LOWER',
    status: 'available',
  },
];

describe('sortPlayers', () => {
  // ============================================================================
  // Numerical Sorting Tests
  // ============================================================================
  describe('numerical sorting', () => {
    it('should sort by adjustedValue descending', () => {
      const sort: SortState = { column: 'adjustedValue', direction: 'desc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].name).toBe('Mike Trout'); // 55
      expect(sorted[1].name).toBe('Aaron Judge'); // 52
      expect(sorted[2].name).toBe('Zack Wheeler'); // 40
      expect(sorted[3].name).toBe('Bobby Witt Jr.'); // 38
      expect(sorted[4].name).toBe('Charlie Morton'); // 12
    });

    it('should sort by adjustedValue ascending', () => {
      const sort: SortState = { column: 'adjustedValue', direction: 'asc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].name).toBe('Charlie Morton'); // 12
      expect(sorted[4].name).toBe('Mike Trout'); // 55
    });

    it('should sort by projectedValue descending', () => {
      const sort: SortState = { column: 'projectedValue', direction: 'desc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].name).toBe('Mike Trout'); // 50
      expect(sorted[1].name).toBe('Aaron Judge'); // 48
    });

    it('should sort by projectedValue ascending', () => {
      const sort: SortState = { column: 'projectedValue', direction: 'asc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].name).toBe('Charlie Morton'); // 15
      expect(sorted[4].name).toBe('Mike Trout'); // 50
    });
  });

  // ============================================================================
  // String Sorting Tests
  // ============================================================================
  describe('string sorting', () => {
    it('should sort by name ascending (alphabetical)', () => {
      const sort: SortState = { column: 'name', direction: 'asc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].name).toBe('Aaron Judge');
      expect(sorted[1].name).toBe('Bobby Witt Jr.');
      expect(sorted[2].name).toBe('Charlie Morton');
      expect(sorted[3].name).toBe('Mike Trout');
      expect(sorted[4].name).toBe('Zack Wheeler');
    });

    it('should sort by name descending (reverse alphabetical)', () => {
      const sort: SortState = { column: 'name', direction: 'desc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].name).toBe('Zack Wheeler');
      expect(sorted[4].name).toBe('Aaron Judge');
    });

    it('should sort by team ascending', () => {
      const sort: SortState = { column: 'team', direction: 'asc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].team).toBe('ATL'); // Charlie Morton
      expect(sorted[1].team).toBe('KC'); // Bobby Witt Jr.
      expect(sorted[2].team).toBe('LAA'); // Mike Trout
      expect(sorted[3].team).toBe('NYY'); // Aaron Judge
      expect(sorted[4].team).toBe('PHI'); // Zack Wheeler
    });

    it('should sort by team descending', () => {
      const sort: SortState = { column: 'team', direction: 'desc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].team).toBe('PHI');
      expect(sorted[4].team).toBe('ATL');
    });
  });

  // ============================================================================
  // Array Field Sorting Tests
  // ============================================================================
  describe('array field sorting (positions)', () => {
    it('should sort by positions ascending (first position)', () => {
      const sort: SortState = { column: 'positions', direction: 'asc' };
      const sorted = sortPlayers(mockPlayers, sort);

      // Should sort by first position in array
      // CF, RF, SP, SS, SP -> alphabetically: CF, RF, SP, SP, SS
      expect(sorted[0].positions[0]).toBe('CF'); // Mike Trout
      expect(sorted[1].positions[0]).toBe('RF'); // Aaron Judge
    });

    it('should sort by positions descending', () => {
      const sort: SortState = { column: 'positions', direction: 'desc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].positions[0]).toBe('SS'); // Bobby Witt Jr.
    });
  });

  // ============================================================================
  // Tier Sorting Tests
  // ============================================================================
  describe('tier sorting', () => {
    it('should sort by tier ascending', () => {
      const sort: SortState = { column: 'tier', direction: 'asc' };
      const sorted = sortPlayers(mockPlayers, sort);

      // ELITE, LOWER, MID alphabetically
      expect(sorted[0].tier).toBe('ELITE');
      expect(sorted[sorted.length - 1].tier).toBe('MID');
    });

    it('should sort by tier descending', () => {
      const sort: SortState = { column: 'tier', direction: 'desc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].tier).toBe('MID');
    });
  });

  // ============================================================================
  // Status Sorting Tests
  // ============================================================================
  describe('status sorting', () => {
    it('should sort by status ascending', () => {
      const sort: SortState = { column: 'status', direction: 'asc' };
      const sorted = sortPlayers(mockPlayers, sort);

      // available, drafted, my-team alphabetically
      expect(sorted[0].status).toBe('available');
    });

    it('should sort by status descending', () => {
      const sort: SortState = { column: 'status', direction: 'desc' };
      const sorted = sortPlayers(mockPlayers, sort);

      expect(sorted[0].status).toBe('my-team');
    });
  });

  // ============================================================================
  // Immutability Tests
  // ============================================================================
  describe('immutability', () => {
    it('should not mutate the original array', () => {
      const originalFirst = mockPlayers[0];
      const sort: SortState = { column: 'name', direction: 'asc' };

      const sorted = sortPlayers(mockPlayers, sort);

      // Original array should be unchanged
      expect(mockPlayers[0]).toBe(originalFirst);
      // Sorted array should be different reference
      expect(sorted).not.toBe(mockPlayers);
    });
  });

  // ============================================================================
  // Edge Cases Tests
  // ============================================================================
  describe('edge cases', () => {
    it('should handle empty array', () => {
      const sort: SortState = { column: 'adjustedValue', direction: 'desc' };
      const sorted = sortPlayers([], sort);

      expect(sorted).toHaveLength(0);
    });

    it('should handle single player', () => {
      const sort: SortState = { column: 'adjustedValue', direction: 'desc' };
      const sorted = sortPlayers([mockPlayers[0]], sort);

      expect(sorted).toHaveLength(1);
      expect(sorted[0].name).toBe('Mike Trout');
    });

    it('should handle player with empty positions array', () => {
      const playersWithEmptyPositions: Player[] = [
        {
          id: 'p1',
          name: 'Player A',
          positions: [], // Empty positions array
          team: 'NYY',
          projectedValue: 30,
          adjustedValue: 35,
          tier: 'MID',
          status: 'available',
        },
        {
          id: 'p2',
          name: 'Player B',
          positions: ['SP'],
          team: 'LAD',
          projectedValue: 40,
          adjustedValue: 45,
          tier: 'ELITE',
          status: 'available',
        },
      ];

      const sort: SortState = { column: 'positions', direction: 'asc' };
      const sorted = sortPlayers(playersWithEmptyPositions, sort);

      // Empty positions should sort before 'SP' (empty string < 'SP')
      expect(sorted).toHaveLength(2);
      expect(sorted[0].name).toBe('Player A'); // Empty positions sorts first
      expect(sorted[1].name).toBe('Player B'); // 'SP' sorts after
    });

    it('should handle player with undefined-like values gracefully', () => {
      const playersWithNullish: Player[] = [
        {
          id: 'p1',
          name: 'Player A',
          positions: ['SP'],
          team: 'NYY',
          projectedValue: 0, // Zero value
          adjustedValue: 0,
          tier: 'LOWER',
          status: 'available',
        },
        {
          id: 'p2',
          name: 'Player B',
          positions: ['C'],
          team: 'LAD',
          projectedValue: 50,
          adjustedValue: 55,
          tier: 'ELITE',
          status: 'available',
        },
      ];

      const sort: SortState = { column: 'adjustedValue', direction: 'asc' };
      const sorted = sortPlayers(playersWithNullish, sort);

      // Zero should sort correctly (not be treated as falsy)
      expect(sorted[0].name).toBe('Player A'); // 0
      expect(sorted[1].name).toBe('Player B'); // 55
    });
  });
});
