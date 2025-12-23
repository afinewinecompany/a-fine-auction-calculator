/**
 * Budget Calculations Tests
 *
 * Tests for budget breakdown and spending analysis utilities.
 *
 * Story: 12.3 - Display Total Spending and Budget Utilization
 */

import { describe, it, expect } from 'vitest';
import { calculateSpendingBreakdown } from '@/features/draft/utils/budgetCalculations';
import type { DraftedPlayer } from '@/features/draft/types/roster.types';

describe('calculateSpendingBreakdown', () => {
  const mockHitter: DraftedPlayer = {
    playerId: '1',
    name: 'Mike Trout',
    position: 'OF',
    auctionPrice: 45,
  };

  const mockPitcher: DraftedPlayer = {
    playerId: '2',
    name: 'Gerrit Cole',
    position: 'SP',
    auctionPrice: 38,
  };

  const mockBench: DraftedPlayer = {
    playerId: '3',
    name: 'Bench Player',
    position: 'BN',
    auctionPrice: 3,
  };

  it('should calculate total spending correctly', () => {
    const roster = [mockHitter, mockPitcher, mockBench];
    const result = calculateSpendingBreakdown(roster, 260);

    expect(result.totalSpent).toBe(86); // 45 + 38 + 3
    expect(result.remaining).toBe(174); // 260 - 86
  });

  it('should calculate spending percentages', () => {
    const roster = [mockHitter, mockPitcher, mockBench];
    const result = calculateSpendingBreakdown(roster, 260);

    // 86 / 260 = ~33.1%
    expect(result.utilizationPercentage).toBeCloseTo(33.1, 1);
  });

  it('should group hitters correctly', () => {
    const hitters = [
      { ...mockHitter, position: 'C', auctionPrice: 20 },
      { ...mockHitter, position: '1B', auctionPrice: 25 },
      { ...mockHitter, position: '2B', auctionPrice: 15 },
      { ...mockHitter, position: 'SS', auctionPrice: 30 },
      { ...mockHitter, position: '3B', auctionPrice: 18 },
      { ...mockHitter, position: 'OF', auctionPrice: 22 },
      { ...mockHitter, position: 'UTIL', auctionPrice: 12 },
    ];
    const result = calculateSpendingBreakdown(hitters, 260);

    expect(result.byPosition.hitters.amount).toBe(142); // Sum of all hitter prices
    expect(result.byPosition.hitters.percentage).toBeCloseTo(54.6, 1);
  });

  it('should group pitchers correctly', () => {
    const pitchers = [
      { ...mockPitcher, position: 'SP', auctionPrice: 30 },
      { ...mockPitcher, position: 'SP', auctionPrice: 25 },
      { ...mockPitcher, position: 'RP', auctionPrice: 15 },
    ];
    const result = calculateSpendingBreakdown(pitchers, 260);

    expect(result.byPosition.pitchers.amount).toBe(70);
    expect(result.byPosition.pitchers.percentage).toBeCloseTo(26.9, 1);
  });

  it('should group bench players correctly', () => {
    const bench = [
      { ...mockBench, auctionPrice: 5 },
      { ...mockBench, auctionPrice: 3 },
      { ...mockBench, auctionPrice: 2 },
    ];
    const result = calculateSpendingBreakdown(bench, 260);

    expect(result.byPosition.bench.amount).toBe(10);
    expect(result.byPosition.bench.percentage).toBeCloseTo(3.8, 1);
  });

  it('should handle mixed roster', () => {
    const roster = [
      { ...mockHitter, position: 'C', auctionPrice: 20 },
      { ...mockHitter, position: 'OF', auctionPrice: 30 },
      { ...mockPitcher, position: 'SP', auctionPrice: 25 },
      { ...mockPitcher, position: 'RP', auctionPrice: 15 },
      { ...mockBench, auctionPrice: 5 },
    ];
    const result = calculateSpendingBreakdown(roster, 260);

    expect(result.totalSpent).toBe(95);
    expect(result.byPosition.hitters.amount).toBe(50);
    expect(result.byPosition.pitchers.amount).toBe(40);
    expect(result.byPosition.bench.amount).toBe(5);
  });

  it('should handle empty roster', () => {
    const result = calculateSpendingBreakdown([], 260);

    expect(result.totalSpent).toBe(0);
    expect(result.remaining).toBe(260);
    expect(result.utilizationPercentage).toBe(0);
    expect(result.byPosition.hitters.amount).toBe(0);
    expect(result.byPosition.pitchers.amount).toBe(0);
    expect(result.byPosition.bench.amount).toBe(0);
  });

  it('should calculate percentages that sum to 100%', () => {
    const roster = [
      { ...mockHitter, position: 'OF', auctionPrice: 50 },
      { ...mockPitcher, position: 'SP', auctionPrice: 30 },
      { ...mockBench, auctionPrice: 20 },
    ];
    const result = calculateSpendingBreakdown(roster, 100);

    const total =
      result.byPosition.hitters.percentage +
      result.byPosition.pitchers.percentage +
      result.byPosition.bench.percentage;

    // Should sum to 100% (within rounding tolerance)
    expect(total).toBeCloseTo(100, 0);
  });

  it('should handle full budget utilization', () => {
    const roster = [{ ...mockHitter, auctionPrice: 260 }];
    const result = calculateSpendingBreakdown(roster, 260);

    expect(result.totalSpent).toBe(260);
    expect(result.remaining).toBe(0);
    expect(result.utilizationPercentage).toBe(100);
  });

  it('should detect underspending', () => {
    const roster = [{ ...mockHitter, auctionPrice: 200 }];
    const result = calculateSpendingBreakdown(roster, 260);

    expect(result.remaining).toBe(60);
    expect(result.isUnderspent).toBe(true);
  });

  it('should not flag small remainders as underspent', () => {
    const roster = [{ ...mockHitter, auctionPrice: 257 }];
    const result = calculateSpendingBreakdown(roster, 260);

    expect(result.remaining).toBe(3);
    expect(result.isUnderspent).toBe(false); // Less than $5 threshold
  });
});
