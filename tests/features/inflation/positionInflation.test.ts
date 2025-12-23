/**
 * Tests for Position-Specific Inflation Calculations
 *
 * Story: 5.3 - Implement Position-Specific Inflation Tracking
 *
 * Tests the calculatePositionInflation function that computes
 * inflation rates independently for each position (C, 1B, 2B, SS, 3B, OF, SP, RP, UT).
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePositionInflation,
  POSITIONS,
  type PositionDraftedPlayerInput,
  type PositionProjectionInput,
  type Position,
} from '@/features/inflation';

describe('calculatePositionInflation', () => {
  // ============================================================================
  // Basic Position Inflation Tests
  // ============================================================================
  describe('basic position-specific inflation', () => {
    it('should calculate positive inflation for a single position', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 30, positions: ['SS'] },
        { playerId: 'player2', auctionPrice: 25, positions: ['SS'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: 25, positions: ['SS'] },
        { playerId: 'player2', projectedValue: 20, positions: ['SS'] },
      ];

      // SS total actual: 30 + 25 = 55
      // SS total projected: 25 + 20 = 45
      // SS inflation: (55 - 45) / 45 ≈ 0.222 (22.2%)
      const result = calculatePositionInflation(draftedPlayers, projections);
      expect(result.SS).toBeCloseTo(10 / 45, 4);
    });

    it('should calculate inflation independently for different positions', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 30, positions: ['SS'] },
        { playerId: 'player2', auctionPrice: 15, positions: ['1B'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: 25, positions: ['SS'] },
        { playerId: 'player2', projectedValue: 20, positions: ['1B'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // SS inflation: (30 - 25) / 25 = 0.2 (20%)
      expect(result.SS).toBeCloseTo(0.2, 4);

      // 1B deflation: (15 - 20) / 20 = -0.25 (-25%)
      expect(result['1B']).toBeCloseTo(-0.25, 4);

      // Other positions should be 0
      expect(result.C).toBe(0);
      expect(result['2B']).toBe(0);
      expect(result['3B']).toBe(0);
      expect(result.OF).toBe(0);
      expect(result.SP).toBe(0);
      expect(result.RP).toBe(0);
      expect(result.UT).toBe(0);
    });

    it('should calculate deflation when players sell below projected value', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 15, positions: ['OF'] },
        { playerId: 'player2', auctionPrice: 18, positions: ['OF'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20, positions: ['OF'] },
        { playerId: 'player2', projectedValue: 25, positions: ['OF'] },
      ];

      // OF actual: 15 + 18 = 33
      // OF projected: 20 + 25 = 45
      // OF deflation: (33 - 45) / 45 = -12 / 45 ≈ -0.267
      const result = calculatePositionInflation(draftedPlayers, projections);
      expect(result.OF).toBeCloseTo(-12 / 45, 4);
    });
  });

  // ============================================================================
  // All Positions Tests
  // ============================================================================
  describe('all 9 positions handling', () => {
    it('should return an object with all 9 positions', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [];
      const projections: PositionProjectionInput[] = [];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // Verify all 9 positions are present
      expect(Object.keys(result).sort()).toEqual([...POSITIONS].sort());
      expect(result.C).toBe(0);
      expect(result['1B']).toBe(0);
      expect(result['2B']).toBe(0);
      expect(result.SS).toBe(0);
      expect(result['3B']).toBe(0);
      expect(result.OF).toBe(0);
      expect(result.SP).toBe(0);
      expect(result.RP).toBe(0);
      expect(result.UT).toBe(0);
    });

    it('should initialize all positions to 0 when no players are drafted', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [];
      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: 25, positions: ['SS'] },
        { playerId: 'player2', projectedValue: 20, positions: ['1B'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      for (const position of POSITIONS) {
        expect(result[position]).toBe(0);
      }
    });

    it('should calculate inflation for each position with drafted players', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'c1', auctionPrice: 12, positions: ['C'] },
        { playerId: '1b1', auctionPrice: 22, positions: ['1B'] },
        { playerId: '2b1', auctionPrice: 18, positions: ['2B'] },
        { playerId: 'ss1', auctionPrice: 30, positions: ['SS'] },
        { playerId: '3b1', auctionPrice: 25, positions: ['3B'] },
        { playerId: 'of1', auctionPrice: 35, positions: ['OF'] },
        { playerId: 'sp1', auctionPrice: 40, positions: ['SP'] },
        { playerId: 'rp1', auctionPrice: 8, positions: ['RP'] },
        { playerId: 'ut1', auctionPrice: 15, positions: ['UT'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'c1', projectedValue: 10, positions: ['C'] },
        { playerId: '1b1', projectedValue: 20, positions: ['1B'] },
        { playerId: '2b1', projectedValue: 20, positions: ['2B'] },
        { playerId: 'ss1', projectedValue: 25, positions: ['SS'] },
        { playerId: '3b1', projectedValue: 25, positions: ['3B'] },
        { playerId: 'of1', projectedValue: 30, positions: ['OF'] },
        { playerId: 'sp1', projectedValue: 35, positions: ['SP'] },
        { playerId: 'rp1', projectedValue: 10, positions: ['RP'] },
        { playerId: 'ut1', projectedValue: 12, positions: ['UT'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // Each position calculated independently
      expect(result.C).toBeCloseTo((12 - 10) / 10, 4); // 20%
      expect(result['1B']).toBeCloseTo((22 - 20) / 20, 4); // 10%
      expect(result['2B']).toBeCloseTo((18 - 20) / 20, 4); // -10%
      expect(result.SS).toBeCloseTo((30 - 25) / 25, 4); // 20%
      expect(result['3B']).toBeCloseTo((25 - 25) / 25, 4); // 0%
      expect(result.OF).toBeCloseTo((35 - 30) / 30, 4); // ~16.7%
      expect(result.SP).toBeCloseTo((40 - 35) / 35, 4); // ~14.3%
      expect(result.RP).toBeCloseTo((8 - 10) / 10, 4); // -20%
      expect(result.UT).toBeCloseTo((15 - 12) / 12, 4); // 25%
    });
  });

  // ============================================================================
  // Multi-Position Player Tests
  // ============================================================================
  describe('multi-position player handling', () => {
    it('should split value equally across eligible positions for multi-position player', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 30, positions: ['2B', 'SS'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20, positions: ['2B', 'SS'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // Value split equally: 30/2 = 15 actual per position, 20/2 = 10 projected per position
      // 2B inflation: (15 - 10) / 10 = 0.5 (50%)
      // SS inflation: (15 - 10) / 10 = 0.5 (50%)
      expect(result['2B']).toBeCloseTo(0.5, 4);
      expect(result.SS).toBeCloseTo(0.5, 4);
    });

    it('should handle player eligible at 3 positions', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'utility', auctionPrice: 24, positions: ['1B', '2B', '3B'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'utility', projectedValue: 18, positions: ['1B', '2B', '3B'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // Value split 3 ways: 24/3 = 8 actual per position, 18/3 = 6 projected per position
      // Inflation per position: (8 - 6) / 6 ≈ 0.333 (33.3%)
      expect(result['1B']).toBeCloseTo(2 / 6, 4);
      expect(result['2B']).toBeCloseTo(2 / 6, 4);
      expect(result['3B']).toBeCloseTo(2 / 6, 4);
    });

    it('should combine single and multi-position players at same position', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'ss_only', auctionPrice: 25, positions: ['SS'] },
        { playerId: 'ss_2b', auctionPrice: 20, positions: ['2B', 'SS'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'ss_only', projectedValue: 20, positions: ['SS'] },
        { playerId: 'ss_2b', projectedValue: 16, positions: ['2B', 'SS'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // SS: 25 (full) + 10 (half of 20) = 35 actual, 20 (full) + 8 (half of 16) = 28 projected
      // SS inflation: (35 - 28) / 28 = 0.25 (25%)
      expect(result.SS).toBeCloseTo(7 / 28, 4);

      // 2B: 10 (half of 20) actual, 8 (half of 16) projected
      // 2B inflation: (10 - 8) / 8 = 0.25 (25%)
      expect(result['2B']).toBeCloseTo(2 / 8, 4);
    });

    it('should not double-count player value across positions', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'multi', auctionPrice: 40, positions: ['SS', '2B', '3B', 'OF'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'multi', projectedValue: 32, positions: ['SS', '2B', '3B', 'OF'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // Each position gets 40/4 = 10 actual, 32/4 = 8 projected
      // Verify total actual apportioned equals original value
      const totalActual =
        (result.SS * 8 + 8) +
        (result['2B'] * 8 + 8) +
        (result['3B'] * 8 + 8) +
        (result.OF * 8 + 8);
      // Each position: (10 - 8) / 8 = 0.25
      // So reconstructed actual per pos = 0.25 * 8 + 8 = 10, total = 40
      expect(totalActual).toBeCloseTo(40, 2);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('edge cases', () => {
    it('should return 0% inflation for position with no drafted players', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 30, positions: ['SS'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: 25, positions: ['SS'] },
        { playerId: 'player2', projectedValue: 20, positions: ['1B'] }, // Not drafted
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      expect(result.SS).toBeCloseTo(0.2, 4); // 20% inflation
      expect(result['1B']).toBe(0); // No drafted players at 1B
    });

    it('should handle empty projections for a position', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 30, positions: ['C'] },
      ];

      const projections: PositionProjectionInput[] = [
        // No projection for C position
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // Player drafted but no projection - treat as 0 projected value
      // Division by zero protection: return 0
      expect(result.C).toBe(0);
    });

    it('should handle players with unknown/invalid positions gracefully', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 30, positions: ['SS'] },
        { playerId: 'player2', auctionPrice: 20, positions: ['DH' as Position] }, // Invalid position
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: 25, positions: ['SS'] },
        { playerId: 'player2', projectedValue: 15, positions: ['DH' as Position] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // SS should be calculated normally
      expect(result.SS).toBeCloseTo(0.2, 4);

      // DH (invalid) should be ignored, all valid positions should still exist
      expect(Object.keys(result).sort()).toEqual([...POSITIONS].sort());
    });

    it('should handle player with empty positions array', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 30, positions: [] },
        { playerId: 'player2', auctionPrice: 25, positions: ['SS'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: 20, positions: [] },
        { playerId: 'player2', projectedValue: 20, positions: ['SS'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // Player with no positions should be ignored
      expect(result.SS).toBeCloseTo(0.25, 4); // Only player2 counted
    });

    it('should handle null projected values by treating as 0', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'player1', auctionPrice: 20, positions: ['OF'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'player1', projectedValue: null, positions: ['OF'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // Projected value null = 0, division by zero protection
      expect(result.OF).toBe(0);
    });
  });

  // ============================================================================
  // Position Independence Tests
  // ============================================================================
  describe('position independence', () => {
    it('should calculate OF inflation independently from SS inflation', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'of1', auctionPrice: 50, positions: ['OF'] },
        { playerId: 'of2', auctionPrice: 45, positions: ['OF'] },
        { playerId: 'ss1', auctionPrice: 10, positions: ['SS'] },
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'of1', projectedValue: 40, positions: ['OF'] },
        { playerId: 'of2', projectedValue: 40, positions: ['OF'] },
        { playerId: 'ss1', projectedValue: 20, positions: ['SS'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // OF: (50 + 45 - 80) / 80 = 15/80 = 0.1875 (18.75% inflation)
      expect(result.OF).toBeCloseTo(15 / 80, 4);

      // SS: (10 - 20) / 20 = -0.5 (-50% deflation)
      expect(result.SS).toBeCloseTo(-0.5, 4);

      // These are completely independent calculations
      // Changing OF shouldn't affect SS at all
    });

    it('should not let high inflation at one position affect other positions', () => {
      const draftedPlayers: PositionDraftedPlayerInput[] = [
        { playerId: 'sp1', auctionPrice: 100, positions: ['SP'] }, // 100% overpay
      ];

      const projections: PositionProjectionInput[] = [
        { playerId: 'sp1', projectedValue: 50, positions: ['SP'] },
      ];

      const result = calculatePositionInflation(draftedPlayers, projections);

      // SP: 100% inflation
      expect(result.SP).toBeCloseTo(1.0, 4);

      // All other positions should be 0, not affected by SP inflation
      expect(result.C).toBe(0);
      expect(result['1B']).toBe(0);
      expect(result['2B']).toBe(0);
      expect(result.SS).toBe(0);
      expect(result['3B']).toBe(0);
      expect(result.OF).toBe(0);
      expect(result.RP).toBe(0);
      expect(result.UT).toBe(0);
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================
  describe('performance', () => {
    it('should complete calculation in <100ms with large dataset', () => {
      // Generate 300 players across all positions
      const playerCount = 300;
      const draftedPlayers: PositionDraftedPlayerInput[] = [];
      const projections: PositionProjectionInput[] = [];

      const positionArray = [...POSITIONS];

      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i}`;
        const primaryPosition = positionArray[i % positionArray.length];
        // Some players are multi-position (every 5th player)
        const positions: Position[] =
          i % 5 === 0
            ? [primaryPosition, positionArray[(i + 1) % positionArray.length]]
            : [primaryPosition];

        draftedPlayers.push({
          playerId,
          auctionPrice: Math.floor(Math.random() * 50) + 1,
          positions,
        });

        projections.push({
          playerId,
          projectedValue: Math.floor(Math.random() * 50) + 1,
          positions,
        });
      }

      const startTime = performance.now();
      const result = calculatePositionInflation(draftedPlayers, projections);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // Verify result is valid
      expect(Object.keys(result)).toHaveLength(9);
      for (const position of POSITIONS) {
        expect(typeof result[position]).toBe('number');
      }

      // Must complete in <100ms as per AC
      expect(executionTime).toBeLessThan(100);
    });

    it('should handle 500+ players efficiently', () => {
      const playerCount = 500;
      const draftedPlayers: PositionDraftedPlayerInput[] = [];
      const projections: PositionProjectionInput[] = [];

      const positionArray = [...POSITIONS];

      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i}`;
        const position = positionArray[i % positionArray.length];

        draftedPlayers.push({
          playerId,
          auctionPrice: 20 + (i % 30),
          positions: [position],
        });

        projections.push({
          playerId,
          projectedValue: 15 + (i % 25),
          positions: [position],
        });
      }

      const times: number[] = [];
      for (let run = 0; run < 5; run++) {
        const startTime = performance.now();
        calculatePositionInflation(draftedPlayers, projections);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(100); // Should be well under 100ms
    });
  });
});
