/**
 * Summary Metrics Utility Tests
 *
 * Tests for calculating competitive advantage summary metrics from steals and overpays.
 *
 * Story: 12.5 - Show Competitive Advantage Summary
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSummaryMetrics,
  type SummaryMetrics,
  type Steal,
  type Overpay,
} from '@/features/draft/utils/summaryMetrics';

// Helper to create mock steal data
const createMockSteal = (valueGained: number, playerName: string = 'Player'): Steal => ({
  player: {
    playerId: `p-${Math.random().toString(36).substring(7)}`,
    playerName,
    position: 'OF',
    purchasePrice: 20,
    projectedValue: 20 + valueGained,
    variance: -valueGained,
    draftedBy: 'user',
    draftedAt: new Date().toISOString(),
  },
  auctionPrice: 20,
  adjustedValue: 20 + valueGained,
  valueGained,
});

// Helper to create mock overpay data
const createMockOverpay = (valueLost: number, playerName: string = 'Player'): Overpay => ({
  player: {
    playerId: `p-${Math.random().toString(36).substring(7)}`,
    playerName,
    position: '1B',
    purchasePrice: 30 + valueLost,
    projectedValue: 30,
    variance: valueLost,
    draftedBy: 'user',
    draftedAt: new Date().toISOString(),
  },
  auctionPrice: 30 + valueLost,
  adjustedValue: 30,
  valueLost,
});

describe('calculateSummaryMetrics', () => {
  it('should calculate steals count correctly', () => {
    const steals = [createMockSteal(10), createMockSteal(5), createMockSteal(8)];
    const overpays: Overpay[] = [];

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.stealsCount).toBe(3);
  });

  it('should calculate overpays count correctly', () => {
    const steals: Steal[] = [];
    const overpays = [createMockOverpay(5), createMockOverpay(3)];

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.overpaysCount).toBe(2);
  });

  it('should calculate net value (positive when steals > overpays)', () => {
    const steals = [createMockSteal(20), createMockSteal(15)]; // Total: $35 gained
    const overpays = [createMockOverpay(10)]; // Total: $10 lost

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.netValue).toBe(25); // 35 - 10
  });

  it('should calculate net value (negative when overpays > steals)', () => {
    const steals = [createMockSteal(5)]; // Total: $5 gained
    const overpays = [createMockOverpay(20), createMockOverpay(10)]; // Total: $30 lost

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.netValue).toBe(-25); // 5 - 30
  });

  it('should return zero net value when steals equal overpays', () => {
    const steals = [createMockSteal(15)];
    const overpays = [createMockOverpay(15)];

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.netValue).toBe(0);
  });

  it('should calculate total value gained from steals', () => {
    const steals = [createMockSteal(10), createMockSteal(8), createMockSteal(12)];
    const overpays: Overpay[] = [];

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.totalValueGained).toBe(30);
  });

  it('should calculate total value lost from overpays', () => {
    const steals: Steal[] = [];
    const overpays = [createMockOverpay(7), createMockOverpay(3)];

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.totalValueLost).toBe(10);
  });

  it('should handle empty steals and overpays', () => {
    const result = calculateSummaryMetrics([], []);

    expect(result.stealsCount).toBe(0);
    expect(result.overpaysCount).toBe(0);
    expect(result.netValue).toBe(0);
    expect(result.totalValueGained).toBe(0);
    expect(result.totalValueLost).toBe(0);
  });

  it('should set hasNetGain to true when net value is positive', () => {
    const steals = [createMockSteal(20)];
    const overpays = [createMockOverpay(5)];

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.hasNetGain).toBe(true);
  });

  it('should set hasNetGain to false when net value is zero or negative', () => {
    const steals = [createMockSteal(5)];
    const overpays = [createMockOverpay(10)];

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.hasNetGain).toBe(false);
  });
});

describe('calculateSummaryMetrics edge cases', () => {
  it('should handle single steal with no overpays', () => {
    const steals = [createMockSteal(42)];
    const result = calculateSummaryMetrics(steals, []);

    expect(result.stealsCount).toBe(1);
    expect(result.overpaysCount).toBe(0);
    expect(result.netValue).toBe(42);
    expect(result.hasNetGain).toBe(true);
  });

  it('should handle single overpay with no steals', () => {
    const overpays = [createMockOverpay(15)];
    const result = calculateSummaryMetrics([], overpays);

    expect(result.stealsCount).toBe(0);
    expect(result.overpaysCount).toBe(1);
    expect(result.netValue).toBe(-15);
    expect(result.hasNetGain).toBe(false);
  });

  it('should handle large number of steals and overpays', () => {
    const steals = Array.from({ length: 15 }, (_, i) => createMockSteal(5 + i));
    const overpays = Array.from({ length: 5 }, (_, i) => createMockOverpay(3 + i));

    const result = calculateSummaryMetrics(steals, overpays);

    expect(result.stealsCount).toBe(15);
    expect(result.overpaysCount).toBe(5);
    // Total gained: 5+6+7+...+19 = 180
    // Total lost: 3+4+5+6+7 = 25
    expect(result.totalValueGained).toBe(180);
    expect(result.totalValueLost).toBe(25);
    expect(result.netValue).toBe(155);
  });
});
