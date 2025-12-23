/**
 * filterByStatus Utility Tests
 *
 * Tests for the status-based player filtering logic.
 *
 * Story: 6.8 - Implement Filter by Draft Status
 */

import { describe, it, expect } from 'vitest';
import {
  filterByStatus,
  getFilterCounts,
  hasActiveFilters,
} from '@/features/draft/utils/filterPlayers';
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
  createPlayer({ id: '3', name: 'Available Player 3', status: 'available' }),
  createPlayer({ id: '4', name: 'My Team Player 1', status: 'my-team', draftedByTeam: 1 }),
  createPlayer({ id: '5', name: 'My Team Player 2', status: 'my-team', draftedByTeam: 1 }),
  createPlayer({ id: '6', name: 'Drafted Player 1', status: 'drafted', draftedByTeam: 2 }),
  createPlayer({ id: '7', name: 'Drafted Player 2', status: 'drafted', draftedByTeam: 3 }),
];

describe('filterByStatus', () => {
  describe('All Filter', () => {
    it('returns all players when filter is "all"', () => {
      const result = filterByStatus(testPlayers, 'all');
      expect(result).toHaveLength(testPlayers.length);
    });

    it('returns empty array when player list is empty', () => {
      const result = filterByStatus([], 'all');
      expect(result).toHaveLength(0);
    });
  });

  describe('Available Filter', () => {
    it('returns only available players when filter is "available"', () => {
      const result = filterByStatus(testPlayers, 'available');
      expect(result).toHaveLength(3);
      result.forEach(player => {
        expect(player.status).toBe('available');
      });
    });

    it('returns correct players by name', () => {
      const result = filterByStatus(testPlayers, 'available');
      const names = result.map(p => p.name);
      expect(names).toContain('Available Player 1');
      expect(names).toContain('Available Player 2');
      expect(names).toContain('Available Player 3');
      expect(names).not.toContain('My Team Player 1');
      expect(names).not.toContain('Drafted Player 1');
    });

    it('returns empty array when no available players', () => {
      const allDrafted = testPlayers.map(p => ({ ...p, status: 'drafted' as const }));
      const result = filterByStatus(allDrafted, 'available');
      expect(result).toHaveLength(0);
    });
  });

  describe('My Team Filter', () => {
    it('returns only my-team players when filter is "my-team"', () => {
      const result = filterByStatus(testPlayers, 'my-team');
      expect(result).toHaveLength(2);
      result.forEach(player => {
        expect(player.status).toBe('my-team');
      });
    });

    it('returns correct players by name', () => {
      const result = filterByStatus(testPlayers, 'my-team');
      const names = result.map(p => p.name);
      expect(names).toContain('My Team Player 1');
      expect(names).toContain('My Team Player 2');
      expect(names).not.toContain('Available Player 1');
      expect(names).not.toContain('Drafted Player 1');
    });

    it('returns empty array when no my-team players', () => {
      const noMyTeam = testPlayers.filter(p => p.status !== 'my-team');
      const result = filterByStatus(noMyTeam, 'my-team');
      expect(result).toHaveLength(0);
    });
  });

  describe('Preserves Order', () => {
    it('maintains original player order', () => {
      const result = filterByStatus(testPlayers, 'all');
      const originalIndices = result.map(p => testPlayers.findIndex(tp => tp.id === p.id));
      const isSorted = originalIndices.every((val, i, arr) => i === 0 || arr[i - 1] < val);
      expect(isSorted).toBe(true);
    });
  });
});

describe('getFilterCounts', () => {
  it('returns correct counts for all statuses', () => {
    const counts = getFilterCounts(testPlayers);
    expect(counts.all).toBe(7);
    expect(counts.available).toBe(3);
    expect(counts.myTeam).toBe(2);
  });

  it('returns zeros for empty player list', () => {
    const counts = getFilterCounts([]);
    expect(counts.all).toBe(0);
    expect(counts.available).toBe(0);
    expect(counts.myTeam).toBe(0);
  });

  it('handles all available players', () => {
    const allAvailable = testPlayers.map(p => ({ ...p, status: 'available' as const }));
    const counts = getFilterCounts(allAvailable);
    expect(counts.all).toBe(7);
    expect(counts.available).toBe(7);
    expect(counts.myTeam).toBe(0);
  });

  it('handles all my-team players', () => {
    const allMyTeam = testPlayers.map(p => ({ ...p, status: 'my-team' as const }));
    const counts = getFilterCounts(allMyTeam);
    expect(counts.all).toBe(7);
    expect(counts.available).toBe(0);
    expect(counts.myTeam).toBe(7);
  });
});

describe('hasActiveFilters', () => {
  describe('Status Filter', () => {
    it('returns false when status is "available" (default)', () => {
      const result = hasActiveFilters('available', '');
      expect(result).toBe(false);
    });

    it('returns true when status is "all"', () => {
      const result = hasActiveFilters('all', '');
      expect(result).toBe(true);
    });

    it('returns true when status is "my-team"', () => {
      const result = hasActiveFilters('my-team', '');
      expect(result).toBe(true);
    });
  });

  describe('Search Filter', () => {
    it('returns true when search term has content', () => {
      const result = hasActiveFilters('available', 'test');
      expect(result).toBe(true);
    });

    it('returns false when search term is empty', () => {
      const result = hasActiveFilters('available', '');
      expect(result).toBe(false);
    });

    it('returns false when search term is only whitespace', () => {
      const result = hasActiveFilters('available', '   ');
      expect(result).toBe(false);
    });
  });

  describe('Combined Filters', () => {
    it('returns true when both status and search are active', () => {
      const result = hasActiveFilters('all', 'test');
      expect(result).toBe(true);
    });

    it('returns true when only status is active', () => {
      const result = hasActiveFilters('my-team', '');
      expect(result).toBe(true);
    });

    it('returns true when only search is active', () => {
      const result = hasActiveFilters('available', 'test');
      expect(result).toBe(true);
    });
  });
});
