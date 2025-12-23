/**
 * Tests for Tier-Specific Inflation Calculations
 *
 * Story: 5.4 - Implement Tier-Specific Inflation Tracking
 *
 * Tests the tier assignment and tier-specific inflation calculation functions
 * that model the "run on bank" theory in auction drafts.
 */

import {
  getPercentile,
  assignPlayerTier,
  calculateTierInflation,
  type TierDraftedPlayerInput,
  type TierProjectionInput,
} from '@/features/inflation/utils/inflationCalculations';
import { PlayerTier } from '@/features/inflation/types/inflation.types';

// ============================================================================
// getPercentile Tests
// ============================================================================
describe('getPercentile', () => {
  describe('basic percentile calculation', () => {
    it('should return 0 for the highest value', () => {
      const sortedValues = [100, 80, 60, 40, 20];
      expect(getPercentile(100, sortedValues)).toBe(0);
    });

    it('should return correct percentile for middle values', () => {
      const sortedValues = [100, 80, 60, 40, 20];
      // 60 is the 3rd value (index 2), 2 values above it
      // percentile = 2/5 * 100 = 40
      expect(getPercentile(60, sortedValues)).toBe(40);
    });

    it('should return correct percentile for lowest value', () => {
      const sortedValues = [100, 80, 60, 40, 20];
      // 20 is the lowest, 4 values above it
      // percentile = 4/5 * 100 = 80
      expect(getPercentile(20, sortedValues)).toBe(80);
    });

    it('should handle value not in array (between values)', () => {
      const sortedValues = [100, 80, 60, 40, 20];
      // 70 is between 80 and 60, so 2 values are above it (100, 80)
      // percentile = 2/5 * 100 = 40
      expect(getPercentile(70, sortedValues)).toBe(40);
    });

    it('should handle value below all values', () => {
      const sortedValues = [100, 80, 60, 40, 20];
      // 10 is below all values, all 5 are above it
      // percentile = 5/5 * 100 = 100
      expect(getPercentile(10, sortedValues)).toBe(100);
    });

    it('should handle value above all values', () => {
      const sortedValues = [100, 80, 60, 40, 20];
      // 150 is above all values, 0 values above it
      // percentile = 0/5 * 100 = 0
      expect(getPercentile(150, sortedValues)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should return 0 for empty array', () => {
      expect(getPercentile(50, [])).toBe(0);
    });

    it('should return 0 for single value equal to input', () => {
      expect(getPercentile(50, [50])).toBe(0);
    });

    it('should return 100 for single value above input', () => {
      expect(getPercentile(30, [50])).toBe(100);
    });

    it('should handle equal values (ties)', () => {
      const sortedValues = [100, 80, 80, 80, 20];
      // For value 80, only 1 value (100) is strictly greater
      // percentile = 1/5 * 100 = 20
      expect(getPercentile(80, sortedValues)).toBe(20);
    });
  });
});

// ============================================================================
// assignPlayerTier Tests
// ============================================================================
describe('assignPlayerTier', () => {
  // Create a pool of 100 players with values from 1-100 for consistent percentile testing
  const createProjectionPool = (count: number): TierProjectionInput[] => {
    return Array.from({ length: count }, (_, i) => ({
      playerId: `player${i + 1}`,
      projectedValue: count - i, // 100, 99, 98, ..., 1
    }));
  };

  describe('tier assignment based on percentiles', () => {
    it('should assign ELITE to top 10% of players', () => {
      const projections = createProjectionPool(100);

      // Top 10% = values 91-100 (positions 1-10)
      expect(assignPlayerTier(100, projections)).toBe(PlayerTier.ELITE);
      expect(assignPlayerTier(95, projections)).toBe(PlayerTier.ELITE);
      expect(assignPlayerTier(91, projections)).toBe(PlayerTier.ELITE);
    });

    it('should assign MID to 10-40% of players', () => {
      const projections = createProjectionPool(100);

      // 10-40% = values 61-90 (positions 11-40)
      expect(assignPlayerTier(90, projections)).toBe(PlayerTier.MID);
      expect(assignPlayerTier(75, projections)).toBe(PlayerTier.MID);
      expect(assignPlayerTier(61, projections)).toBe(PlayerTier.MID);
    });

    it('should assign LOWER to bottom 60% of players', () => {
      const projections = createProjectionPool(100);

      // Bottom 60% = values 1-60 (positions 41-100)
      expect(assignPlayerTier(60, projections)).toBe(PlayerTier.LOWER);
      expect(assignPlayerTier(30, projections)).toBe(PlayerTier.LOWER);
      expect(assignPlayerTier(1, projections)).toBe(PlayerTier.LOWER);
    });

    it('should handle boundary at 10% correctly', () => {
      const projections = createProjectionPool(100);

      // Value 91 is at position 10 (10th from top)
      // percentile = 9/100 * 100 = 9 < 10, so ELITE
      expect(assignPlayerTier(91, projections)).toBe(PlayerTier.ELITE);

      // Value 90 is at position 11 (11th from top)
      // percentile = 10/100 * 100 = 10 >= 10, so MID
      expect(assignPlayerTier(90, projections)).toBe(PlayerTier.MID);
    });

    it('should handle boundary at 40% correctly', () => {
      const projections = createProjectionPool(100);

      // Value 61 is at position 40 (40th from top)
      // percentile = 39/100 * 100 = 39 < 40, so MID
      expect(assignPlayerTier(61, projections)).toBe(PlayerTier.MID);

      // Value 60 is at position 41 (41st from top)
      // percentile = 40/100 * 100 = 40 >= 40, so LOWER
      expect(assignPlayerTier(60, projections)).toBe(PlayerTier.LOWER);
    });
  });

  describe('edge cases', () => {
    it('should return LOWER for empty projections array', () => {
      expect(assignPlayerTier(50, [])).toBe(PlayerTier.LOWER);
    });

    it('should handle single player pool', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: 50 },
      ];

      // Single player is always top (percentile 0), so ELITE
      expect(assignPlayerTier(50, projections)).toBe(PlayerTier.ELITE);
    });

    it('should handle null projected values in pool', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: 100 },
        { playerId: 'p2', projectedValue: null },
        { playerId: 'p3', projectedValue: 50 },
      ];

      // null treated as 0, sorted: [100, 50, 0]
      // 100 is at percentile 0 (ELITE)
      expect(assignPlayerTier(100, projections)).toBe(PlayerTier.ELITE);
    });

    it('should handle equal projected values (ties)', () => {
      const projections: TierProjectionInput[] = Array.from({ length: 10 }, (_, i) => ({
        playerId: `player${i}`,
        projectedValue: 50, // All same value
      }));

      // All players have same value, percentile should be 0 for all
      expect(assignPlayerTier(50, projections)).toBe(PlayerTier.ELITE);
    });

    it('should handle very small pool (3 players)', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: 100 },
        { playerId: 'p2', projectedValue: 50 },
        { playerId: 'p3', projectedValue: 10 },
      ];

      // With 3 players:
      // 100: percentile = 0/3 * 100 = 0 (ELITE)
      // 50: percentile = 1/3 * 100 = 33.33 (MID)
      // 10: percentile = 2/3 * 100 = 66.67 (LOWER)
      expect(assignPlayerTier(100, projections)).toBe(PlayerTier.ELITE);
      expect(assignPlayerTier(50, projections)).toBe(PlayerTier.MID);
      expect(assignPlayerTier(10, projections)).toBe(PlayerTier.LOWER);
    });
  });
});

// ============================================================================
// calculateTierInflation Tests
// ============================================================================
describe('calculateTierInflation', () => {
  // Helper to create projection pool for tier calculations
  const createProjectionPool = (count: number): TierProjectionInput[] => {
    return Array.from({ length: count }, (_, i) => ({
      playerId: `player${i + 1}`,
      projectedValue: count - i, // 100, 99, ..., 1
    }));
  };

  describe('basic tier inflation calculation', () => {
    it('should calculate positive inflation for elite tier', () => {
      const projections = createProjectionPool(100);
      const draftedPlayers: TierDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 120 }, // Projected: 100, Elite
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      // Elite inflation: (120 - 100) / 100 = 0.20 (20%)
      expect(result[PlayerTier.ELITE]).toBeCloseTo(0.20, 4);
      expect(result[PlayerTier.MID]).toBe(0);
      expect(result[PlayerTier.LOWER]).toBe(0);
    });

    it('should calculate inflation per tier independently', () => {
      const projections = createProjectionPool(100);
      const draftedPlayers: TierDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 115 }, // Projected: 100, Elite
        { playerId: 'player15', auctionPrice: 110 }, // Projected: 86, Mid
        { playerId: 'player60', auctionPrice: 35 }, // Projected: 41, Lower
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      // Elite: (115 - 100) / 100 = 0.15
      expect(result[PlayerTier.ELITE]).toBeCloseTo(0.15, 4);
      // Mid: (110 - 86) / 86 ≈ 0.279
      expect(result[PlayerTier.MID]).toBeCloseTo(24 / 86, 4);
      // Lower: (35 - 41) / 41 ≈ -0.146
      expect(result[PlayerTier.LOWER]).toBeCloseTo(-6 / 41, 4);
    });

    it('should return example from AC: { ELITE: 15%, MID: 22%, LOWER: -5% }', () => {
      // Create a scenario that produces approximately these rates
      const projections: TierProjectionInput[] = [
        // Elite tier (top 10%)
        { playerId: 'elite1', projectedValue: 50, tier: PlayerTier.ELITE },
        { playerId: 'elite2', projectedValue: 45, tier: PlayerTier.ELITE },
        // Mid tier (10-40%)
        { playerId: 'mid1', projectedValue: 25, tier: PlayerTier.MID },
        { playerId: 'mid2', projectedValue: 20, tier: PlayerTier.MID },
        // Lower tier (40%+)
        { playerId: 'lower1', projectedValue: 10, tier: PlayerTier.LOWER },
        { playerId: 'lower2', projectedValue: 10, tier: PlayerTier.LOWER },
      ];

      const draftedPlayers: TierDraftedPlayerInput[] = [
        // Elite: projected 95, actual ~109.25 = 15% inflation
        { playerId: 'elite1', auctionPrice: 57.5, tier: PlayerTier.ELITE }, // +15%
        { playerId: 'elite2', auctionPrice: 51.75, tier: PlayerTier.ELITE }, // +15%
        // Mid: projected 45, actual ~54.9 = 22% inflation
        { playerId: 'mid1', auctionPrice: 30.5, tier: PlayerTier.MID }, // +22%
        { playerId: 'mid2', auctionPrice: 24.4, tier: PlayerTier.MID }, // +22%
        // Lower: projected 20, actual 19 = -5% deflation
        { playerId: 'lower1', auctionPrice: 9.5, tier: PlayerTier.LOWER }, // -5%
        { playerId: 'lower2', auctionPrice: 9.5, tier: PlayerTier.LOWER }, // -5%
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      expect(result[PlayerTier.ELITE]).toBeCloseTo(0.15, 2);
      expect(result[PlayerTier.MID]).toBeCloseTo(0.22, 2);
      expect(result[PlayerTier.LOWER]).toBeCloseTo(-0.05, 2);
    });

    it('should handle mid-tier inflating faster than elite (run on bank theory)', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'elite1', projectedValue: 50, tier: PlayerTier.ELITE },
        { playerId: 'mid1', projectedValue: 25, tier: PlayerTier.MID },
        { playerId: 'mid2', projectedValue: 20, tier: PlayerTier.MID },
      ];

      const draftedPlayers: TierDraftedPlayerInput[] = [
        // Elite: only 10% inflation
        { playerId: 'elite1', auctionPrice: 55, tier: PlayerTier.ELITE },
        // Mid: 30% inflation (higher than elite!)
        { playerId: 'mid1', auctionPrice: 32.5, tier: PlayerTier.MID },
        { playerId: 'mid2', auctionPrice: 26, tier: PlayerTier.MID },
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      // Verify mid-tier inflation > elite tier inflation
      expect(result[PlayerTier.MID]).toBeGreaterThan(result[PlayerTier.ELITE]);
      expect(result[PlayerTier.ELITE]).toBeCloseTo(0.10, 2);
      expect(result[PlayerTier.MID]).toBeCloseTo(0.30, 2);
    });
  });

  describe('tier independence', () => {
    it('should calculate each tier independently (elite inflation does not affect lower)', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'elite1', projectedValue: 50, tier: PlayerTier.ELITE },
        { playerId: 'lower1', projectedValue: 5, tier: PlayerTier.LOWER },
      ];

      // Only draft elite player
      const draftedPlayers: TierDraftedPlayerInput[] = [
        { playerId: 'elite1', auctionPrice: 75, tier: PlayerTier.ELITE }, // 50% inflation
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      // Elite has high inflation
      expect(result[PlayerTier.ELITE]).toBeCloseTo(0.50, 4);
      // Lower and Mid should be 0 (no drafted players in those tiers)
      expect(result[PlayerTier.MID]).toBe(0);
      expect(result[PlayerTier.LOWER]).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should return all zeros for empty draftedPlayers array', () => {
      const projections = createProjectionPool(100);
      const result = calculateTierInflation([], projections);

      expect(result[PlayerTier.ELITE]).toBe(0);
      expect(result[PlayerTier.MID]).toBe(0);
      expect(result[PlayerTier.LOWER]).toBe(0);
    });

    it('should return 0 for tier with no drafted players', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'elite1', projectedValue: 50, tier: PlayerTier.ELITE },
        { playerId: 'mid1', projectedValue: 25, tier: PlayerTier.MID },
        { playerId: 'lower1', projectedValue: 5, tier: PlayerTier.LOWER },
      ];

      // Only draft mid-tier player
      const draftedPlayers: TierDraftedPlayerInput[] = [
        { playerId: 'mid1', auctionPrice: 30, tier: PlayerTier.MID },
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      expect(result[PlayerTier.ELITE]).toBe(0);
      expect(result[PlayerTier.MID]).toBeCloseTo(0.20, 4); // (30-25)/25
      expect(result[PlayerTier.LOWER]).toBe(0);
    });

    it('should handle very few players in pool', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: 50 },
        { playerId: 'p2', projectedValue: 25 },
      ];

      const draftedPlayers: TierDraftedPlayerInput[] = [
        { playerId: 'p1', auctionPrice: 60 },
        { playerId: 'p2', auctionPrice: 30 },
      ];

      // With 2 players, p1 (50) is top 50% so ELITE, p2 (25) is bottom 50% so LOWER
      const result = calculateTierInflation(draftedPlayers, projections);

      expect(typeof result[PlayerTier.ELITE]).toBe('number');
      expect(typeof result[PlayerTier.MID]).toBe('number');
      expect(typeof result[PlayerTier.LOWER]).toBe('number');
    });

    it('should handle drafted player with no projection', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: 50, tier: PlayerTier.ELITE },
      ];

      const draftedPlayers: TierDraftedPlayerInput[] = [
        { playerId: 'p1', auctionPrice: 60, tier: PlayerTier.ELITE },
        { playerId: 'p2', auctionPrice: 20, tier: PlayerTier.LOWER }, // No projection
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      // Elite: (60-50)/50 = 0.20
      expect(result[PlayerTier.ELITE]).toBeCloseTo(0.20, 4);
      // Lower: 20 actual, 0 projected - returns 0 (division by zero protection)
      expect(result[PlayerTier.LOWER]).toBe(0);
    });

    it('should handle null projected values', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: null, tier: PlayerTier.ELITE },
      ];

      const draftedPlayers: TierDraftedPlayerInput[] = [
        { playerId: 'p1', auctionPrice: 30, tier: PlayerTier.ELITE },
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      // null projected value = 0, so division by zero returns 0
      expect(result[PlayerTier.ELITE]).toBe(0);
    });

    it('should use pre-assigned tier on player if available', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: 50 },
        { playerId: 'p2', projectedValue: 25 },
      ];

      const draftedPlayers: TierDraftedPlayerInput[] = [
        // Force this to MID even though percentile would say otherwise
        { playerId: 'p1', auctionPrice: 60, tier: PlayerTier.MID },
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      // Should use MID tier as specified
      expect(result[PlayerTier.MID]).toBeCloseTo(0.20, 4);
      expect(result[PlayerTier.ELITE]).toBe(0);
    });

    it('should use pre-assigned tier on projection if player tier not set', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: 50, tier: PlayerTier.LOWER },
      ];

      const draftedPlayers: TierDraftedPlayerInput[] = [
        { playerId: 'p1', auctionPrice: 60 }, // No tier set
      ];

      const result = calculateTierInflation(draftedPlayers, projections);

      // Should use LOWER tier from projection
      expect(result[PlayerTier.LOWER]).toBeCloseTo(0.20, 4);
      expect(result[PlayerTier.ELITE]).toBe(0);
    });
  });

  describe('performance', () => {
    it('should calculate tier inflation for 300+ players in <100ms', () => {
      // Generate 350 players
      const playerCount = 350;
      const projections: TierProjectionInput[] = [];
      const draftedPlayers: TierDraftedPlayerInput[] = [];

      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i}`;
        const projectedValue = Math.floor(Math.random() * 50) + 1;
        projections.push({ playerId, projectedValue });

        // Draft about half the players
        if (i % 2 === 0) {
          draftedPlayers.push({
            playerId,
            auctionPrice: projectedValue * (0.8 + Math.random() * 0.4), // 80-120% of projected
          });
        }
      }

      const startTime = performance.now();
      const result = calculateTierInflation(draftedPlayers, projections);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      expect(typeof result[PlayerTier.ELITE]).toBe('number');
      expect(typeof result[PlayerTier.MID]).toBe('number');
      expect(typeof result[PlayerTier.LOWER]).toBe('number');
      expect(executionTime).toBeLessThan(100); // Must complete in <100ms
    });

    it('should use efficient lookup for projections', () => {
      // Test with 500 players
      const playerCount = 500;
      const projections: TierProjectionInput[] = [];
      const draftedPlayers: TierDraftedPlayerInput[] = [];

      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i}`;
        projections.push({
          playerId,
          projectedValue: 50 - (i % 50),
        });
        draftedPlayers.push({
          playerId,
          auctionPrice: 45 + (i % 10),
        });
      }

      // Run multiple times to ensure consistent performance
      const times: number[] = [];
      for (let run = 0; run < 5; run++) {
        const startTime = performance.now();
        calculateTierInflation(draftedPlayers, projections);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(100);
    });
  });

  describe('type safety', () => {
    it('should accept DraftedPlayer objects with additional properties', () => {
      const projections: TierProjectionInput[] = [
        { playerId: 'p1', projectedValue: 50, tier: PlayerTier.ELITE },
      ];

      const draftedPlayers = [
        {
          playerId: 'p1',
          auctionPrice: 60,
          tier: PlayerTier.ELITE,
          playerName: 'Mike Trout',
          position: 'OF',
          draftedBy: 'user' as const,
        },
      ];

      const result = calculateTierInflation(draftedPlayers, projections);
      expect(result[PlayerTier.ELITE]).toBeCloseTo(0.20, 4);
    });
  });
});
