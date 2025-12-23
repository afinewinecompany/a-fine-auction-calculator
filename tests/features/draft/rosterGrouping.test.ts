/**
 * Roster Grouping Utility Tests
 *
 * Tests for groupPlayersByPosition function that organizes
 * drafted players into Hitters, Pitchers, and Bench categories.
 *
 * Story: 12.2 - Display Complete Roster Organized by Position
 */

import {
  groupPlayersByPosition,
  isHitterPosition,
  isPitcherPosition,
  type GroupedRoster,
} from '@/features/draft/utils/rosterGrouping';
import type { DraftedPlayer } from '@/features/draft/types/draft.types';

const createMockPlayer = (overrides: Partial<DraftedPlayer> = {}): DraftedPlayer => ({
  playerId: 'player-1',
  playerName: 'Test Player',
  position: 'OF',
  purchasePrice: 20,
  projectedValue: 25,
  variance: -5,
  draftedBy: 'user',
  draftedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('rosterGrouping', () => {
  describe('groupPlayersByPosition', () => {
    it('should return empty arrays for empty roster', () => {
      const result = groupPlayersByPosition([]);

      expect(result.hitters).toEqual([]);
      expect(result.pitchers).toEqual([]);
      expect(result.bench).toEqual([]);
    });

    it('should group hitters correctly', () => {
      const roster: DraftedPlayer[] = [
        createMockPlayer({ playerId: '1', position: 'C' }),
        createMockPlayer({ playerId: '2', position: '1B' }),
        createMockPlayer({ playerId: '3', position: '2B' }),
        createMockPlayer({ playerId: '4', position: '3B' }),
        createMockPlayer({ playerId: '5', position: 'SS' }),
        createMockPlayer({ playerId: '6', position: 'OF' }),
        createMockPlayer({ playerId: '7', position: 'DH' }),
        createMockPlayer({ playerId: '8', position: 'UTIL' }),
      ];

      const result = groupPlayersByPosition(roster);

      expect(result.hitters).toHaveLength(8);
      expect(result.pitchers).toHaveLength(0);
      expect(result.bench).toHaveLength(0);
    });

    it('should group pitchers correctly', () => {
      const roster: DraftedPlayer[] = [
        createMockPlayer({ playerId: '1', position: 'SP' }),
        createMockPlayer({ playerId: '2', position: 'RP' }),
        createMockPlayer({ playerId: '3', position: 'P' }),
      ];

      const result = groupPlayersByPosition(roster);

      expect(result.hitters).toHaveLength(0);
      expect(result.pitchers).toHaveLength(3);
      expect(result.bench).toHaveLength(0);
    });

    it('should group bench players correctly', () => {
      const roster: DraftedPlayer[] = [
        createMockPlayer({ playerId: '1', position: 'BN' }),
        createMockPlayer({ playerId: '2', position: 'BENCH' }),
      ];

      const result = groupPlayersByPosition(roster);

      expect(result.hitters).toHaveLength(0);
      expect(result.pitchers).toHaveLength(0);
      expect(result.bench).toHaveLength(2);
    });

    it('should handle mixed roster correctly', () => {
      const roster: DraftedPlayer[] = [
        createMockPlayer({ playerId: '1', position: 'C', playerName: 'Catcher' }),
        createMockPlayer({ playerId: '2', position: 'SP', playerName: 'Starter' }),
        createMockPlayer({ playerId: '3', position: 'OF', playerName: 'Outfielder' }),
        createMockPlayer({ playerId: '4', position: 'RP', playerName: 'Reliever' }),
        createMockPlayer({ playerId: '5', position: 'BN', playerName: 'Bench Guy' }),
      ];

      const result = groupPlayersByPosition(roster);

      expect(result.hitters).toHaveLength(2);
      expect(result.pitchers).toHaveLength(2);
      expect(result.bench).toHaveLength(1);

      expect(result.hitters.map((p) => p.playerName)).toContain('Catcher');
      expect(result.hitters.map((p) => p.playerName)).toContain('Outfielder');
      expect(result.pitchers.map((p) => p.playerName)).toContain('Starter');
      expect(result.pitchers.map((p) => p.playerName)).toContain('Reliever');
      expect(result.bench.map((p) => p.playerName)).toContain('Bench Guy');
    });

    it('should handle multi-position players by primary position', () => {
      // Player eligible at multiple positions - use first position in comma-separated list
      const roster: DraftedPlayer[] = [
        createMockPlayer({ playerId: '1', position: 'OF,2B' }),
        createMockPlayer({ playerId: '2', position: 'SP,RP' }),
        createMockPlayer({ playerId: '3', position: '1B,OF,DH' }),
      ];

      const result = groupPlayersByPosition(roster);

      expect(result.hitters).toHaveLength(2);
      expect(result.pitchers).toHaveLength(1);
      expect(result.bench).toHaveLength(0);
    });

    it('should handle case-insensitive position strings', () => {
      const roster: DraftedPlayer[] = [
        createMockPlayer({ playerId: '1', position: 'of' }),
        createMockPlayer({ playerId: '2', position: 'sp' }),
        createMockPlayer({ playerId: '3', position: 'bn' }),
      ];

      const result = groupPlayersByPosition(roster);

      expect(result.hitters).toHaveLength(1);
      expect(result.pitchers).toHaveLength(1);
      expect(result.bench).toHaveLength(1);
    });

    it('should handle unknown positions as bench', () => {
      const roster: DraftedPlayer[] = [
        createMockPlayer({ playerId: '1', position: 'UNKNOWN' }),
        createMockPlayer({ playerId: '2', position: '' }),
      ];

      const result = groupPlayersByPosition(roster);

      expect(result.hitters).toHaveLength(0);
      expect(result.pitchers).toHaveLength(0);
      expect(result.bench).toHaveLength(2);
    });
  });

  describe('isHitterPosition', () => {
    it('should return true for all hitter positions', () => {
      const hitterPositions = ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH', 'UTIL', 'LF', 'CF', 'RF'];

      hitterPositions.forEach((pos) => {
        expect(isHitterPosition(pos)).toBe(true);
      });
    });

    it('should return false for pitcher positions', () => {
      const pitcherPositions = ['SP', 'RP', 'P'];

      pitcherPositions.forEach((pos) => {
        expect(isHitterPosition(pos)).toBe(false);
      });
    });

    it('should return false for bench positions', () => {
      expect(isHitterPosition('BN')).toBe(false);
      expect(isHitterPosition('BENCH')).toBe(false);
    });

    it('should handle case-insensitive input', () => {
      expect(isHitterPosition('of')).toBe(true);
      expect(isHitterPosition('Of')).toBe(true);
      expect(isHitterPosition('sp')).toBe(false);
    });
  });

  describe('isPitcherPosition', () => {
    it('should return true for all pitcher positions', () => {
      const pitcherPositions = ['SP', 'RP', 'P'];

      pitcherPositions.forEach((pos) => {
        expect(isPitcherPosition(pos)).toBe(true);
      });
    });

    it('should return false for hitter positions', () => {
      const hitterPositions = ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH', 'UTIL'];

      hitterPositions.forEach((pos) => {
        expect(isPitcherPosition(pos)).toBe(false);
      });
    });

    it('should return false for bench positions', () => {
      expect(isPitcherPosition('BN')).toBe(false);
      expect(isPitcherPosition('BENCH')).toBe(false);
    });

    it('should handle case-insensitive input', () => {
      expect(isPitcherPosition('sp')).toBe(true);
      expect(isPitcherPosition('Sp')).toBe(true);
      expect(isPitcherPosition('of')).toBe(false);
    });
  });

  describe('GroupedRoster type structure', () => {
    it('should have correct structure from groupPlayersByPosition', () => {
      const result: GroupedRoster = groupPlayersByPosition([]);

      expect(result).toHaveProperty('hitters');
      expect(result).toHaveProperty('pitchers');
      expect(result).toHaveProperty('bench');
      expect(Array.isArray(result.hitters)).toBe(true);
      expect(Array.isArray(result.pitchers)).toBe(true);
      expect(Array.isArray(result.bench)).toBe(true);
    });
  });
});
