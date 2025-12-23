/**
 * Tests for Inflation Calculations
 *
 * Story: 5.2 - Implement Basic Inflation Calculation
 *
 * Tests the calculateOverallInflation function that computes
 * the overall inflation rate based on actual vs. projected spending.
 */

import { vi } from 'vitest';
import {
  calculateOverallInflation,
  type DraftedPlayerInput,
  type ProjectionInput,
} from '@/features/inflation/utils/inflationCalculations';

describe('calculateOverallInflation', () => {
  // ============================================================================
  // Basic Calculation Tests
  // ============================================================================
  describe('basic inflation calculation', () => {
    it('should calculate positive inflation when actual spending exceeds projected', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 25 },
        { playerId: 'player2', auctionPrice: 30 },
        { playerId: 'player3', auctionPrice: 15 },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20 },
        { playerId: 'player2', projectedValue: 25 },
        { playerId: 'player3', projectedValue: 10 },
      ];

      // Total actual: 25 + 30 + 15 = 70
      // Total projected: 20 + 25 + 10 = 55
      // Inflation: (70 - 55) / 55 = 15 / 55 ≈ 0.2727 (27.27%)
      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBeCloseTo(15 / 55, 4);
    });

    it('should calculate negative inflation (deflation) when actual spending is below projected', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 15 },
        { playerId: 'player2', auctionPrice: 20 },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20 },
        { playerId: 'player2', projectedValue: 30 },
      ];

      // Total actual: 15 + 20 = 35
      // Total projected: 20 + 30 = 50
      // Inflation: (35 - 50) / 50 = -15 / 50 = -0.3 (-30% deflation)
      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBeCloseTo(-0.3, 4);
    });

    it('should return 0 when actual spending equals projected value', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 20 },
        { playerId: 'player2', auctionPrice: 30 },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20 },
        { playerId: 'player2', projectedValue: 30 },
      ];

      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBe(0);
    });
  });

  // ============================================================================
  // Edge Case Tests
  // ============================================================================
  describe('edge cases', () => {
    it('should return 0 for empty draftedPlayers array', () => {
      const draftedPlayers: DraftedPlayerInput[] = [];
      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20 },
      ];

      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBe(0);
    });

    it('should return 0 when total projected value is zero (division by zero)', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 10 },
        { playerId: 'player2', auctionPrice: 15 },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 0 },
        { playerId: 'player2', projectedValue: 0 },
      ];

      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBe(0);
    });

    it('should handle missing projections by treating them as 0 projected value', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 20 },
        { playerId: 'player2', auctionPrice: 30 }, // No projection for this player
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20 },
        // player2 has no projection
      ];

      // Total actual: 20 + 30 = 50
      // Total projected: 20 + 0 = 20 (missing projection = 0)
      // Inflation: (50 - 20) / 20 = 30 / 20 = 1.5 (150%)
      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBeCloseTo(1.5, 4);
    });

    it('should handle null projected values by treating them as 0', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 25 },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: null },
      ];

      // Total actual: 25
      // Total projected: 0 (null treated as 0)
      // Division by zero: returns 0
      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBe(0);
    });

    it('should handle negative auction prices gracefully and log warning', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: -5 }, // Invalid but handled
        { playerId: 'player2', auctionPrice: 30 },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 10 },
        { playerId: 'player2', projectedValue: 20 },
      ];

      // Total actual: -5 + 30 = 25
      // Total projected: 10 + 20 = 30
      // Inflation: (25 - 30) / 30 = -5 / 30 ≈ -0.1667
      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBeCloseTo(-5 / 30, 4);

      // Verify warning was logged for invalid data
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Negative auction price detected')
      );

      warnSpy.mockRestore();
    });

    it('should handle negative projected values gracefully', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 10 },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: -5 }, // Invalid but handled
      ];

      // Total actual: 10
      // Total projected: -5
      // Since projected is negative, return 0 to avoid weird results
      const result = calculateOverallInflation(draftedPlayers, projections);
      // When total projected <= 0, return 0 to avoid division by zero/negative
      expect(result).toBe(0);
    });

    it('should handle single player correctly', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 30 },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20 },
      ];

      // Inflation: (30 - 20) / 20 = 0.5 (50%)
      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBeCloseTo(0.5, 4);
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================
  describe('performance', () => {
    it('should calculate inflation for 200+ players in <100ms', () => {
      // Generate 250 players for the test
      const playerCount = 250;
      const draftedPlayers: DraftedPlayerInput[] = [];
      const projections: ProjectionInput[] = [];

      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i}`;
        draftedPlayers.push({
          playerId,
          auctionPrice: Math.floor(Math.random() * 50) + 1,
        });
        projections.push({
          playerId,
          projectedValue: Math.floor(Math.random() * 50) + 1,
        });
      }

      const startTime = performance.now();
      const result = calculateOverallInflation(draftedPlayers, projections);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      expect(typeof result).toBe('number');
      expect(executionTime).toBeLessThan(100); // Must complete in <100ms
    });

    it('should use efficient lookup for projections', () => {
      // Test with 500 players to stress-test the Map lookup
      const playerCount = 500;
      const draftedPlayers: DraftedPlayerInput[] = [];
      const projections: ProjectionInput[] = [];

      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i}`;
        draftedPlayers.push({
          playerId,
          auctionPrice: 20 + (i % 30),
        });
        projections.push({
          playerId,
          projectedValue: 15 + (i % 25),
        });
      }

      // Run multiple times to ensure consistent performance
      const times: number[] = [];
      for (let run = 0; run < 5; run++) {
        const startTime = performance.now();
        calculateOverallInflation(draftedPlayers, projections);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      // Average should be well under 100ms
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(50); // Should be much faster than 100ms
    });
  });

  // ============================================================================
  // Type Safety Tests
  // ============================================================================
  describe('type safety', () => {
    it('should accept DraftedPlayer objects with additional properties', () => {
      // This tests that our function works with actual DraftedPlayer objects
      // that have more properties than just playerId and auctionPrice
      const draftedPlayers = [
        {
          playerId: 'player1',
          auctionPrice: 25,
          playerName: 'Mike Trout',
          position: 'OF',
          draftedBy: 'user' as const,
          projectedValue: 20, // Additional property
          variance: 5,
          draftedAt: new Date().toISOString(),
        },
      ];

      const projections: ProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20 },
      ];

      // Should work without error, using only playerId and auctionPrice
      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBeCloseTo(0.25, 4); // (25-20)/20 = 0.25
    });

    it('should accept PlayerProjection objects with additional properties', () => {
      const draftedPlayers: DraftedPlayerInput[] = [
        { playerId: 'proj1', auctionPrice: 30 },
      ];

      const projections = [
        {
          playerId: 'proj1',
          projectedValue: 25,
          id: 'uuid',
          leagueId: 'league1',
          playerName: 'Aaron Judge',
          team: 'NYY',
          positions: ['OF'],
          projectionSource: 'fangraphs' as const,
          statsHitters: null,
          statsPitchers: null,
          tier: 'ELITE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = calculateOverallInflation(draftedPlayers, projections);
      expect(result).toBeCloseTo(0.2, 4); // (30-25)/25 = 0.2
    });
  });
});
