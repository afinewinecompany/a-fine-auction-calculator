/**
 * Tests for Budget Depletion Modeling
 *
 * Story: 5.5 - Implement Budget Depletion Modeling
 */

import {
  calculateBudgetDepletionFactor,
  BUDGET_DEPLETION_MIN_MULTIPLIER,
  BUDGET_DEPLETION_MAX_MULTIPLIER,
} from '@/features/inflation/utils/inflationCalculations';

describe('calculateBudgetDepletionFactor', () => {
  describe('basic depletion calculation', () => {
    it('should return multiplier near 1.0 when spending is proportional to slots filled', () => {
      const result = calculateBudgetDepletionFactor(2600, 260, 108, 120);
      expect(result.multiplier).toBeCloseTo(1.0, 2);
      expect(result.spent).toBe(260);
      expect(result.remaining).toBe(2340);
      expect(result.slotsRemaining).toBe(108);
    });

    it('should return multiplier near 1.0 at 90% spent with proportional slots filled', () => {
      const result = calculateBudgetDepletionFactor(2600, 2340, 12, 120);
      expect(result.multiplier).toBeCloseTo(1.0, 2);
      expect(result.remaining).toBe(260);
    });

    it('should return multiplier < 1.0 when budget is depleting faster than slots', () => {
      const result = calculateBudgetDepletionFactor(2600, 2340, 60, 120);
      expect(result.multiplier).toBeCloseTo(0.2, 1);
    });
  });

  describe('early draft scenarios', () => {
    it('should return multiplier near 1.0 when 10% budget spent and 10% slots filled', () => {
      const result = calculateBudgetDepletionFactor(1000, 100, 108, 120);
      expect(result.multiplier).toBeCloseTo(1.0, 2);
    });

    it('should return multiplier > 1.0 when 10% spent but 20% slots filled', () => {
      const result = calculateBudgetDepletionFactor(1000, 100, 80, 100);
      expect(result.multiplier).toBeGreaterThan(1.0);
      expect(result.multiplier).toBeCloseTo(1.125, 2);
    });
  });

  describe('late draft scenarios', () => {
    it('should return multiplier < 1.0 when budget depleted faster than slots', () => {
      const result = calculateBudgetDepletionFactor(1000, 900, 50, 100);
      expect(result.multiplier).toBeLessThan(1.0);
      expect(result.multiplier).toBeCloseTo(0.2, 2);
    });

    it('should cap multiplier at minimum bound for extreme depletion', () => {
      const result = calculateBudgetDepletionFactor(1000, 990, 80, 100);
      expect(result.multiplier).toBe(BUDGET_DEPLETION_MIN_MULTIPLIER);
    });
  });

  describe('mid-draft scenarios', () => {
    it('should handle 50% spent with 50% slots filled', () => {
      const result = calculateBudgetDepletionFactor(1000, 500, 50, 100);
      expect(result.multiplier).toBeCloseTo(1.0, 2);
    });

    it('should handle over-budget pace (30% spent, 20% slots filled)', () => {
      const result = calculateBudgetDepletionFactor(1000, 300, 80, 100);
      expect(result.multiplier).toBeCloseTo(0.875, 2);
    });
  });

  describe('edge cases', () => {
    it('should return multiplier 1.0 when no slots remaining', () => {
      const result = calculateBudgetDepletionFactor(1000, 1000, 0, 100);
      expect(result.multiplier).toBe(1.0);
      expect(result.slotsRemaining).toBe(0);
    });

    it('should return minimum multiplier when no budget remaining', () => {
      const result = calculateBudgetDepletionFactor(1000, 1000, 20, 100);
      expect(result.multiplier).toBe(BUDGET_DEPLETION_MIN_MULTIPLIER);
      expect(result.remaining).toBe(0);
    });

    it('should return multiplier 1.0 for zero total budget', () => {
      const result = calculateBudgetDepletionFactor(0, 0, 50, 100);
      expect(result.multiplier).toBe(1.0);
    });

    it('should return multiplier 1.0 for zero total roster spots', () => {
      const result = calculateBudgetDepletionFactor(1000, 100, 50, 0);
      expect(result.multiplier).toBe(1.0);
    });

    it('should return multiplier 1.0 for negative total budget', () => {
      const result = calculateBudgetDepletionFactor(-1000, 0, 50, 100);
      expect(result.multiplier).toBe(1.0);
    });

    it('should return minimum multiplier for negative budget remaining', () => {
      const result = calculateBudgetDepletionFactor(1000, 1100, 50, 100);
      expect(result.multiplier).toBe(BUDGET_DEPLETION_MIN_MULTIPLIER);
      expect(result.remaining).toBe(0);
    });

    it('should handle negative slots remaining by returning 1.0', () => {
      const result = calculateBudgetDepletionFactor(1000, 500, -10, 100);
      expect(result.multiplier).toBe(1.0);
      expect(result.slotsRemaining).toBe(0);
    });
  });

  describe('multiplier bounds', () => {
    it('should cap at maximum 2.0 for very high excess', () => {
      const result = calculateBudgetDepletionFactor(1000, 0, 10, 100);
      expect(result.multiplier).toBe(BUDGET_DEPLETION_MAX_MULTIPLIER);
    });

    it('should not exceed multiplier of 2.0', () => {
      const result = calculateBudgetDepletionFactor(10000, 100, 10, 100);
      expect(result.multiplier).toBeLessThanOrEqual(2.0);
    });

    it('should not go below multiplier of 0.1', () => {
      const result = calculateBudgetDepletionFactor(1000, 999, 90, 100);
      expect(result.multiplier).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('return value structure', () => {
    it('should return all required fields', () => {
      const result = calculateBudgetDepletionFactor(1000, 500, 50, 100);
      expect(result).toHaveProperty('multiplier');
      expect(result).toHaveProperty('spent');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('slotsRemaining');
    });

    it('should correctly calculate remaining budget', () => {
      const result = calculateBudgetDepletionFactor(1000, 350, 60, 100);
      expect(result.spent).toBe(350);
      expect(result.remaining).toBe(650);
    });
  });

  describe('performance', () => {
    it('should complete calculation in <10ms', () => {
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        calculateBudgetDepletionFactor(2600, i * 2, 120 - i, 120);
      }
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 1000;
      expect(avgTime).toBeLessThan(10);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical 12-team league', () => {
      const totalBudget = 12 * 260;
      const totalSlots = 12 * 23;
      const midDraft = calculateBudgetDepletionFactor(totalBudget, 1560, 138, totalSlots);
      expect(midDraft.multiplier).toBeCloseTo(1.0, 1);
    });

    it('should handle 10-team league', () => {
      const totalBudget = 10 * 260;
      const totalSlots = 10 * 25;
      const earlySpending = calculateBudgetDepletionFactor(totalBudget, 780, 225, totalSlots);
      expect(earlySpending.multiplier).toBeLessThan(1.0);
      const conservative = calculateBudgetDepletionFactor(totalBudget, 260, 200, totalSlots);
      expect(conservative.multiplier).toBeGreaterThan(1.0);
    });
  });
});
