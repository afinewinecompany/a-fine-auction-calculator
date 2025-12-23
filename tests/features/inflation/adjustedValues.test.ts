/**
 * Tests for Dynamic Adjusted Player Values
 *
 * Story: 5.6 - Calculate Dynamic Adjusted Player Values
 *
 * Tests the calculateAdjustedValues function that combines inflation factors
 * to produce adjusted player values.
 */

import {
  calculateAdjustedValues,
  calculateSingleAdjustedValue,
  type AdjustedValuePlayerInput,
  type AdjustedValueInflationState,
} from '@/features/inflation/utils/inflationCalculations';
import {
  PlayerTier,
  createDefaultPositionRates,
  createDefaultTierRates,
} from '@/features/inflation/types/inflation.types';

// Helper to create default inflation state
function createTestInflationState(
  overrides: Partial<AdjustedValueInflationState> = {}
): AdjustedValueInflationState {
  return {
    positionRates: createDefaultPositionRates(),
    tierRates: createDefaultTierRates(),
    budgetDepletionMultiplier: 1.0,
    ...overrides,
  };
}

describe('calculateAdjustedValues', () => {
  // ============================================================================
  // Basic Formula Tests
  // ============================================================================
  describe('basic formula application', () => {
    it('should return base value when all inflation factors are 0', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 30, position: 'SS', tier: PlayerTier.ELITE },
        { playerId: 'p2', projectedValue: 15, position: 'OF', tier: PlayerTier.MID },
      ];
      const inflationState = createTestInflationState();

      const result = calculateAdjustedValues(players, inflationState);

      expect(result.get('p1')).toBe(30);
      expect(result.get('p2')).toBe(15);
    });

    it('should apply position inflation correctly', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 100, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.15; // 15% position inflation
      const inflationState = createTestInflationState({ positionRates });

      const result = calculateAdjustedValues(players, inflationState);

      // 100 * 1.15 * 1.0 * 1.0 = 115
      expect(result.get('p1')).toBe(115);
    });

    it('should apply tier inflation correctly', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 100, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.ELITE] = 0.20; // 20% tier inflation
      const inflationState = createTestInflationState({ tierRates });

      const result = calculateAdjustedValues(players, inflationState);

      // 100 * 1.0 * 1.20 * 1.0 = 120
      expect(result.get('p1')).toBe(120);
    });

    it('should apply budget depletion multiplier correctly', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 100, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const inflationState = createTestInflationState({
        budgetDepletionMultiplier: 0.8, // 20% budget depletion
      });

      const result = calculateAdjustedValues(players, inflationState);

      // 100 * 1.0 * 1.0 * 0.8 = 80
      expect(result.get('p1')).toBe(80);
    });

    it('should apply all factors multiplicatively', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 30, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.15; // 15% position inflation
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.ELITE] = 0.20; // 20% tier inflation
      const inflationState = createTestInflationState({
        positionRates,
        tierRates,
        budgetDepletionMultiplier: 0.9,
      });

      const result = calculateAdjustedValues(players, inflationState);

      // 30 * 1.15 * 1.20 * 0.9 = 37.26 -> 37 (rounded)
      expect(result.get('p1')).toBe(37);
    });
  });

  // ============================================================================
  // Rounding Tests
  // ============================================================================
  describe('rounding behavior', () => {
    it('should round to whole dollars', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 33, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.10; // 10% inflation
      const inflationState = createTestInflationState({ positionRates });

      const result = calculateAdjustedValues(players, inflationState);

      // 33 * 1.10 = 36.3 -> 36 (rounded down)
      expect(result.get('p1')).toBe(36);
    });

    it('should round up at .5 threshold', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 25, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.10; // 10% inflation
      const inflationState = createTestInflationState({ positionRates });

      const result = calculateAdjustedValues(players, inflationState);

      // 25 * 1.10 = 27.5 -> 28 (rounded up)
      expect(result.get('p1')).toBe(28);
    });
  });

  // ============================================================================
  // Non-Negative Tests
  // ============================================================================
  describe('non-negative constraint', () => {
    it('should never return negative values', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 5, position: 'SS', tier: PlayerTier.LOWER },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = -0.90; // 90% deflation
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.LOWER] = -0.50; // 50% deflation
      const inflationState = createTestInflationState({
        positionRates,
        tierRates,
        budgetDepletionMultiplier: 0.1, // severe depletion
      });

      const result = calculateAdjustedValues(players, inflationState);

      // Even with extreme deflation, should not go negative
      expect(result.get('p1')).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for zero projected value', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 0, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.50; // 50% inflation
      const inflationState = createTestInflationState({ positionRates });

      const result = calculateAdjustedValues(players, inflationState);

      expect(result.get('p1')).toBe(0);
    });

    it('should return 0 for null projected value', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: null, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const inflationState = createTestInflationState();

      const result = calculateAdjustedValues(players, inflationState);

      expect(result.get('p1')).toBe(0);
    });
  });

  // ============================================================================
  // Multi-Position Tests
  // ============================================================================
  describe('multi-position handling', () => {
    it('should use primary position when provided', () => {
      const players: AdjustedValuePlayerInput[] = [
        {
          playerId: 'p1',
          projectedValue: 100,
          position: 'SS',
          positions: ['2B', 'SS'],
          tier: PlayerTier.ELITE,
        },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.20;
      positionRates['2B'] = 0.10;
      const inflationState = createTestInflationState({ positionRates });

      const result = calculateAdjustedValues(players, inflationState);

      // Should use primary position (SS at 20%)
      expect(result.get('p1')).toBe(120);
    });

    it('should use first position from positions array if no primary', () => {
      const players: AdjustedValuePlayerInput[] = [
        {
          playerId: 'p1',
          projectedValue: 100,
          positions: ['2B', 'SS'],
          tier: PlayerTier.ELITE,
        },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['2B'] = 0.15;
      positionRates['SS'] = 0.25;
      const inflationState = createTestInflationState({ positionRates });

      const result = calculateAdjustedValues(players, inflationState);

      // Should use first position (2B at 15%)
      expect(result.get('p1')).toBe(115);
    });
  });

  // ============================================================================
  // Missing Data Tests
  // ============================================================================
  describe('missing data handling', () => {
    it('should default to MID tier when tier is missing', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 100, position: 'SS' },
      ];
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.MID] = 0.10; // 10% mid tier inflation
      const inflationState = createTestInflationState({ tierRates });

      const result = calculateAdjustedValues(players, inflationState);

      // Should use MID tier (10% inflation)
      expect(result.get('p1')).toBe(110);
    });

    it('should use 0 inflation when position is missing', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 100, tier: PlayerTier.ELITE },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.20; // Won't be applied
      const inflationState = createTestInflationState({ positionRates });

      const result = calculateAdjustedValues(players, inflationState);

      // No position inflation applied
      expect(result.get('p1')).toBe(100);
    });

    it('should handle player with no position and no tier', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 100 },
      ];
      const inflationState = createTestInflationState();

      const result = calculateAdjustedValues(players, inflationState);

      // Should still work with default values
      expect(result.get('p1')).toBe(100);
    });
  });

  // ============================================================================
  // Multiple Players Tests
  // ============================================================================
  describe('multiple players', () => {
    it('should calculate values for multiple players correctly', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 50, position: 'SS', tier: PlayerTier.ELITE },
        { playerId: 'p2', projectedValue: 25, position: 'OF', tier: PlayerTier.MID },
        { playerId: 'p3', projectedValue: 10, position: 'C', tier: PlayerTier.LOWER },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.10;
      positionRates['OF'] = 0.05;
      positionRates['C'] = -0.10;
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.ELITE] = 0.15;
      tierRates[PlayerTier.MID] = 0.05;
      tierRates[PlayerTier.LOWER] = -0.05;
      const inflationState = createTestInflationState({
        positionRates,
        tierRates,
        budgetDepletionMultiplier: 1.0,
      });

      const result = calculateAdjustedValues(players, inflationState);

      // p1: 50 * 1.10 * 1.15 = 63.25 -> 63
      expect(result.get('p1')).toBe(63);
      // p2: 25 * 1.05 * 1.05 = 27.5625 -> 28
      expect(result.get('p2')).toBe(28);
      // p3: 10 * 0.90 * 0.95 = 8.55 -> 9
      expect(result.get('p3')).toBe(9);
    });

    it('should return empty map for empty player array', () => {
      const players: AdjustedValuePlayerInput[] = [];
      const inflationState = createTestInflationState();

      const result = calculateAdjustedValues(players, inflationState);

      expect(result.size).toBe(0);
    });
  });

  // ============================================================================
  // Performance Tests (AC: <2 seconds for 2000+ players)
  // ============================================================================
  describe('performance', () => {
    it('should process 2000+ players in <2 seconds', () => {
      const playerCount = 2500;
      const positions = ['C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP'] as const;
      const tiers = [PlayerTier.ELITE, PlayerTier.MID, PlayerTier.LOWER];

      const players: AdjustedValuePlayerInput[] = [];
      for (let i = 0; i < playerCount; i++) {
        players.push({
          playerId: `player${i}`,
          projectedValue: Math.floor(Math.random() * 50) + 1,
          position: positions[i % positions.length],
          tier: tiers[i % tiers.length],
        });
      }

      const positionRates = createDefaultPositionRates();
      positions.forEach((pos, i) => {
        positionRates[pos] = (i - 4) * 0.05; // -0.20 to +0.15
      });
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.ELITE] = 0.15;
      tierRates[PlayerTier.MID] = 0.05;
      tierRates[PlayerTier.LOWER] = -0.10;
      const inflationState = createTestInflationState({
        positionRates,
        tierRates,
        budgetDepletionMultiplier: 0.95,
      });

      const startTime = performance.now();
      const result = calculateAdjustedValues(players, inflationState);
      const endTime = performance.now();

      expect(result.size).toBe(playerCount);
      expect(endTime - startTime).toBeLessThan(2000); // <2 seconds
    });

    it('should be efficient with O(n) complexity', () => {
      const inflationState = createTestInflationState();

      // Test with 1000 players
      const players1000 = Array.from({ length: 1000 }, (_, i) => ({
        playerId: `p${i}`,
        projectedValue: 20,
        position: 'SS' as const,
        tier: PlayerTier.MID,
      }));

      const start1 = performance.now();
      calculateAdjustedValues(players1000, inflationState);
      const time1000 = performance.now() - start1;

      // Test with 2000 players
      const players2000 = Array.from({ length: 2000 }, (_, i) => ({
        playerId: `p${i}`,
        projectedValue: 20,
        position: 'SS' as const,
        tier: PlayerTier.MID,
      }));

      const start2 = performance.now();
      calculateAdjustedValues(players2000, inflationState);
      const time2000 = performance.now() - start2;

      // Time should roughly double (O(n) complexity)
      // Allow for some variance due to JIT, GC, etc.
      expect(time2000).toBeLessThan(time1000 * 3);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('edge cases', () => {
    it('should handle extreme positive inflation', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 20, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 1.0; // 100% inflation
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.ELITE] = 1.0; // 100% inflation
      const inflationState = createTestInflationState({
        positionRates,
        tierRates,
        budgetDepletionMultiplier: 2.0,
      });

      const result = calculateAdjustedValues(players, inflationState);

      // 20 * 2.0 * 2.0 * 2.0 = 160
      expect(result.get('p1')).toBe(160);
    });

    it('should handle extreme negative inflation (deflation)', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 20, position: 'SS', tier: PlayerTier.LOWER },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = -0.50; // 50% deflation
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.LOWER] = -0.50; // 50% deflation
      const inflationState = createTestInflationState({
        positionRates,
        tierRates,
        budgetDepletionMultiplier: 0.5,
      });

      const result = calculateAdjustedValues(players, inflationState);

      // 20 * 0.5 * 0.5 * 0.5 = 2.5 -> 3 (rounded)
      expect(result.get('p1')).toBe(3);
    });

    it('should handle very small projected values', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 1, position: 'SS', tier: PlayerTier.LOWER },
      ];
      const inflationState = createTestInflationState();

      const result = calculateAdjustedValues(players, inflationState);

      expect(result.get('p1')).toBe(1);
    });

    it('should handle very large projected values', () => {
      const players: AdjustedValuePlayerInput[] = [
        { playerId: 'p1', projectedValue: 100, position: 'SS', tier: PlayerTier.ELITE },
      ];
      const positionRates = createDefaultPositionRates();
      positionRates['SS'] = 0.30;
      const tierRates = createDefaultTierRates();
      tierRates[PlayerTier.ELITE] = 0.25;
      const inflationState = createTestInflationState({
        positionRates,
        tierRates,
        budgetDepletionMultiplier: 1.5,
      });

      const result = calculateAdjustedValues(players, inflationState);

      // 100 * 1.30 * 1.25 * 1.5 = 243.75 -> 244
      expect(result.get('p1')).toBe(244);
    });
  });
});

describe('calculateSingleAdjustedValue', () => {
  it('should calculate single player value correctly', () => {
    const player: AdjustedValuePlayerInput = {
      playerId: 'p1',
      projectedValue: 30,
      position: 'SS',
      tier: PlayerTier.ELITE,
    };
    const positionRates = createDefaultPositionRates();
    positionRates['SS'] = 0.10;
    const tierRates = createDefaultTierRates();
    tierRates[PlayerTier.ELITE] = 0.15;
    const inflationState = createTestInflationState({
      positionRates,
      tierRates,
      budgetDepletionMultiplier: 1.0,
    });

    const result = calculateSingleAdjustedValue(player, inflationState);

    // 30 * 1.10 * 1.15 = 37.95 -> 38
    expect(result).toBe(38);
  });

  it('should produce same result as batch calculation', () => {
    const player: AdjustedValuePlayerInput = {
      playerId: 'p1',
      projectedValue: 45,
      position: 'OF',
      tier: PlayerTier.MID,
    };
    const positionRates = createDefaultPositionRates();
    positionRates['OF'] = 0.08;
    const tierRates = createDefaultTierRates();
    tierRates[PlayerTier.MID] = 0.12;
    const inflationState = createTestInflationState({
      positionRates,
      tierRates,
      budgetDepletionMultiplier: 0.95,
    });

    const singleResult = calculateSingleAdjustedValue(player, inflationState);
    const batchResult = calculateAdjustedValues([player], inflationState);

    expect(singleResult).toBe(batchResult.get('p1'));
  });
});
