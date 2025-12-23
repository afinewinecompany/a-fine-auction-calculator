/**
 * Tests for Variance Calculations
 *
 * Story: 8.3 - Display Variance Tracking for Drafted Players
 */

import { describe, it, expect } from 'vitest';
import {
  VARIANCE_THRESHOLD,
  calculateVariancePercent,
  categorizeVariance,
  calculatePlayerVariance,
  calculateVarianceSummary,
  formatVariancePercent,
  getVarianceColor,
  getVarianceBackground,
  type PlayerVariance,
} from '@/features/draft/utils/varianceCalculations';
import type { DraftedPlayer } from '@/features/draft/types/draft.types';

describe('varianceCalculations', () => {
  describe('VARIANCE_THRESHOLD', () => {
    it('should be 5% (0.05)', () => {
      expect(VARIANCE_THRESHOLD).toBe(0.05);
    });
  });

  describe('calculateVariancePercent', () => {
    it('should calculate positive variance (overpay)', () => {
      // Player worth $30, bought for $35 = 16.7% overpay
      const result = calculateVariancePercent(35, 30);
      expect(result).toBeCloseTo(0.167, 2);
    });

    it('should calculate negative variance (steal)', () => {
      // Player worth $30, bought for $25 = 16.7% steal
      const result = calculateVariancePercent(25, 30);
      expect(result).toBeCloseTo(-0.167, 2);
    });

    it('should return 0 for exact match', () => {
      const result = calculateVariancePercent(30, 30);
      expect(result).toBe(0);
    });

    it('should handle zero adjusted value with positive price', () => {
      const result = calculateVariancePercent(10, 0);
      expect(result).toBe(1);
    });

    it('should handle zero adjusted value with zero price', () => {
      const result = calculateVariancePercent(0, 0);
      expect(result).toBe(0);
    });

    it('should handle $1 players correctly', () => {
      // Player worth $1, bought for $5 = 400% overpay
      const result = calculateVariancePercent(5, 1);
      expect(result).toBe(4);
    });
  });

  describe('categorizeVariance', () => {
    it('should categorize as steal when variance <= -5%', () => {
      expect(categorizeVariance(-0.05)).toBe('steal');
      expect(categorizeVariance(-0.10)).toBe('steal');
      expect(categorizeVariance(-0.50)).toBe('steal');
    });

    it('should categorize as overpay when variance >= +5%', () => {
      expect(categorizeVariance(0.05)).toBe('overpay');
      expect(categorizeVariance(0.10)).toBe('overpay');
      expect(categorizeVariance(0.50)).toBe('overpay');
    });

    it('should categorize as fair when variance is between -5% and +5%', () => {
      expect(categorizeVariance(0)).toBe('fair');
      expect(categorizeVariance(0.04)).toBe('fair');
      expect(categorizeVariance(-0.04)).toBe('fair');
      expect(categorizeVariance(0.049)).toBe('fair');
      expect(categorizeVariance(-0.049)).toBe('fair');
    });
  });

  describe('calculatePlayerVariance', () => {
    const mockPlayer: DraftedPlayer = {
      playerId: 'player-1',
      playerName: 'Mike Trout',
      position: 'OF',
      purchasePrice: 35,
      projectedValue: 30,
      variance: 5,
      draftedBy: 'user',
      draftedAt: '2024-01-01T00:00:00Z',
    };

    it('should calculate variance for an overpay', () => {
      const result = calculatePlayerVariance(mockPlayer, 30);

      expect(result.playerId).toBe('player-1');
      expect(result.playerName).toBe('Mike Trout');
      expect(result.position).toBe('OF');
      expect(result.purchasePrice).toBe(35);
      expect(result.adjustedValue).toBe(30);
      expect(result.variance).toBe(5);
      expect(result.variancePercent).toBeCloseTo(0.167, 2);
      expect(result.category).toBe('overpay');
      expect(result.draftedBy).toBe('user');
    });

    it('should calculate variance for a steal', () => {
      const stealPlayer: DraftedPlayer = {
        ...mockPlayer,
        purchasePrice: 25,
        variance: -5,
      };
      const result = calculatePlayerVariance(stealPlayer, 30);

      expect(result.variance).toBe(-5);
      expect(result.variancePercent).toBeCloseTo(-0.167, 2);
      expect(result.category).toBe('steal');
    });

    it('should calculate variance for a fair deal', () => {
      const fairPlayer: DraftedPlayer = {
        ...mockPlayer,
        purchasePrice: 31,
        variance: 1,
      };
      const result = calculatePlayerVariance(fairPlayer, 30);

      expect(result.variance).toBe(1);
      expect(result.variancePercent).toBeCloseTo(0.033, 2);
      expect(result.category).toBe('fair');
    });

    it('should use UT as default position when position is empty', () => {
      const noPositionPlayer: DraftedPlayer = {
        ...mockPlayer,
        position: '',
      };
      const result = calculatePlayerVariance(noPositionPlayer, 30);

      expect(result.position).toBe('UT');
    });
  });

  describe('calculateVarianceSummary', () => {
    const mockVariances: PlayerVariance[] = [
      {
        playerId: '1',
        playerName: 'Player 1',
        position: 'OF',
        purchasePrice: 25,
        adjustedValue: 30,
        variance: -5,
        variancePercent: -0.167,
        category: 'steal',
      },
      {
        playerId: '2',
        playerName: 'Player 2',
        position: 'SP',
        purchasePrice: 35,
        adjustedValue: 30,
        variance: 5,
        variancePercent: 0.167,
        category: 'overpay',
      },
      {
        playerId: '3',
        playerName: 'Player 3',
        position: '1B',
        purchasePrice: 31,
        adjustedValue: 30,
        variance: 1,
        variancePercent: 0.033,
        category: 'fair',
      },
    ];

    it('should count steals, overpays, and fair deals', () => {
      const result = calculateVarianceSummary(mockVariances);

      expect(result.steals).toBe(1);
      expect(result.overpays).toBe(1);
      expect(result.fair).toBe(1);
    });

    it('should calculate total variance', () => {
      const result = calculateVarianceSummary(mockVariances);

      expect(result.totalVariance).toBe(1); // -5 + 5 + 1 = 1
    });

    it('should calculate average variance percentage', () => {
      const result = calculateVarianceSummary(mockVariances);

      // (-0.167 + 0.167 + 0.033) / 3 ≈ 0.011
      expect(result.avgVariancePercent).toBeCloseTo(0.011, 2);
    });

    it('should include all players in the result', () => {
      const result = calculateVarianceSummary(mockVariances);

      expect(result.players).toHaveLength(3);
      expect(result.players).toEqual(mockVariances);
    });

    it('should handle empty array', () => {
      const result = calculateVarianceSummary([]);

      expect(result.steals).toBe(0);
      expect(result.overpays).toBe(0);
      expect(result.fair).toBe(0);
      expect(result.totalVariance).toBe(0);
      expect(result.avgVariancePercent).toBe(0);
      expect(result.players).toHaveLength(0);
    });
  });

  describe('formatVariancePercent', () => {
    it('should format positive variance with plus sign', () => {
      expect(formatVariancePercent(0.167)).toBe('+16.7%');
      expect(formatVariancePercent(0.05)).toBe('+5.0%');
    });

    it('should format negative variance with minus sign', () => {
      expect(formatVariancePercent(-0.167)).toBe('-16.7%');
      expect(formatVariancePercent(-0.05)).toBe('-5.0%');
    });

    it('should format zero variance without plus sign', () => {
      expect(formatVariancePercent(0)).toBe('0.0%');
    });

    it('should format to one decimal place', () => {
      expect(formatVariancePercent(0.1234)).toBe('+12.3%');
      expect(formatVariancePercent(0.1236)).toBe('+12.4%');
    });
  });

  describe('getVarianceColor', () => {
    it('should return emerald for steals', () => {
      expect(getVarianceColor('steal')).toBe('text-emerald-500');
    });

    it('should return orange for overpays', () => {
      expect(getVarianceColor('overpay')).toBe('text-orange-500');
    });

    it('should return slate for fair deals', () => {
      expect(getVarianceColor('fair')).toBe('text-slate-400');
    });
  });

  describe('getVarianceBackground', () => {
    it('should return emerald background for steals', () => {
      expect(getVarianceBackground('steal')).toBe('bg-emerald-500/10');
    });

    it('should return orange background for overpays', () => {
      expect(getVarianceBackground('overpay')).toBe('bg-orange-500/10');
    });

    it('should return slate background for fair deals', () => {
      expect(getVarianceBackground('fair')).toBe('bg-slate-500/10');
    });
  });
});
