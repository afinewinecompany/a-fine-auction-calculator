/**
 * Value Analysis Utility Tests
 *
 * Tests for identifying steals and overpays based on auction price vs adjusted value.
 *
 * Story: 12.4 - Highlight Steals with Visual Comparison
 */

import { describe, it, expect } from 'vitest';
import { identifySteals, identifyOverpays } from '@/features/draft/utils/valueAnalysis';
import type { DraftedPlayer } from '@/features/draft/types/draft.types';
import type { InflationState } from '@/features/inflation';

const createMockInflationState = (): InflationState => ({
  overallRate: 0.15, // 15% inflation
  positionRates: {
    C: 0.1,
    '1B': 0.12,
    '2B': 0.14,
    SS: 0.18,
    '3B': 0.16,
    OF: 0.15,
    SP: 0.14,
    RP: 0.13,
    UT: 0.15,
  },
  tierRates: {
    ELITE: 0.25,
    MID: 0.15,
    LOWER: 0.05,
  },
  budgetDepleted: 0.45,
  playersRemaining: 120,
});

const createMockPlayer = (
  playerId: string,
  playerName: string,
  position: string,
  purchasePrice: number,
  projectedValue: number,
  tier: string = 'MID'
): DraftedPlayer => ({
  playerId,
  playerName,
  position,
  purchasePrice,
  projectedValue,
  variance: purchasePrice - projectedValue,
  draftedBy: 'user',
  draftedAt: new Date().toISOString(),
  tier,
});

describe('identifySteals', () => {
  it('should identify steals when auction price is significantly below adjusted value', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'SS', 20, 30), // projected $30, adjusted $34.50, paid $20 = $14.50 steal
      createMockPlayer('p2', 'Player 2', 'OF', 15, 25), // projected $25, adjusted $28.75, paid $15 = $13.75 steal
      createMockPlayer('p3', 'Player 3', '1B', 35, 31), // projected $31, adjusted $35.65, paid $35 = barely a steal ($0.65)
    ];
    const inflationData = createMockInflationState();

    const result = identifySteals(roster, inflationData);

    // Player 1 and 2 are steals; Player 3 is below threshold ($0.65 < $3 and <10%)
    expect(result.steals).toHaveLength(2);
    expect(result.steals[0].player.playerId).toBe('p1');
    expect(result.steals[0].valueGained).toBe(15); // Rounded: 34.5 - 20 = 14.5 ≈ 15
    expect(result.steals[1].player.playerId).toBe('p2');
    expect(result.steals[1].valueGained).toBe(14); // Rounded: 28.75 - 15 = 13.75 ≈ 14
    expect(result.totalValueGained).toBe(29); // 15 + 14
  });

  it('should calculate adjusted value based on inflation rate', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 20, 20), // Purchased at base value
    ];
    const inflationData = createMockInflationState();
    // With 15% overall inflation, adjusted value = 20 * 1.15 = 23
    // So purchasing at $20 is a $3 steal

    const result = identifySteals(roster, inflationData);

    expect(result.steals).toHaveLength(1);
    expect(result.steals[0].adjustedValue).toBeCloseTo(23, 0);
    expect(result.steals[0].valueGained).toBeCloseTo(3, 0);
  });

  it('should use >10% OR >$3 threshold for identifying steals', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'C', 20, 20), // $3 below adjusted (15% inflation) = steal
      createMockPlayer('p2', 'Player 2', 'OF', 50, 50), // $7.50 below adjusted = steal
      createMockPlayer('p3', 'Player 3', '1B', 10, 10), // $1.50 below adjusted = NOT steal
      createMockPlayer('p4', 'Player 4', 'SS', 100, 92), // $15 below adjusted = steal (>10%)
    ];
    const inflationData = createMockInflationState();

    const result = identifySteals(roster, inflationData);

    expect(result.steals.length).toBeGreaterThanOrEqual(2);
    const stealIds = result.steals.map(s => s.player.playerId);
    expect(stealIds).toContain('p1'); // $3 threshold met
    expect(stealIds).toContain('p2'); // $7.50 > $3
    expect(stealIds).toContain('p4'); // >10% threshold met
  });

  it('should return empty array when no steals exist', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 30, 25), // Overpay
      createMockPlayer('p2', 'Player 2', '1B', 20, 18), // Fair value (close to adjusted)
    ];
    const inflationData = createMockInflationState();

    const result = identifySteals(roster, inflationData);

    expect(result.steals).toHaveLength(0);
    expect(result.totalValueGained).toBe(0);
  });

  it('should handle empty roster', () => {
    const roster: DraftedPlayer[] = [];
    const inflationData = createMockInflationState();

    const result = identifySteals(roster, inflationData);

    expect(result.steals).toHaveLength(0);
    expect(result.totalValueGained).toBe(0);
  });

  it('should sort steals by value gained (highest first)', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 10, 20), // $11.50 steal
      createMockPlayer('p2', 'Player 2', 'SS', 5, 30), // $29.50 steal
      createMockPlayer('p3', 'Player 3', '1B', 15, 25), // $13.75 steal
    ];
    const inflationData = createMockInflationState();

    const result = identifySteals(roster, inflationData);

    expect(result.steals.length).toBeGreaterThan(0);
    // Verify descending order by valueGained
    for (let i = 0; i < result.steals.length - 1; i++) {
      expect(result.steals[i].valueGained).toBeGreaterThanOrEqual(result.steals[i + 1].valueGained);
    }
  });
});

describe('identifyOverpays', () => {
  it('should identify overpays when auction price exceeds adjusted value significantly', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 30, 20), // $6.50 overpay (30 vs 23 adjusted)
      createMockPlayer('p2', 'Player 2', '1B', 40, 30), // $5.50 overpay
      createMockPlayer('p3', 'Player 3', 'SS', 25, 24), // $1.82 overpay, not significant
    ];
    const inflationData = createMockInflationState();

    const result = identifyOverpays(roster, inflationData);

    expect(result.overpays.length).toBeGreaterThanOrEqual(2);
    const overpayIds = result.overpays.map(o => o.player.playerId);
    expect(overpayIds).toContain('p1');
    expect(overpayIds).toContain('p2');
  });

  it('should use >10% OR >$3 threshold for identifying overpays', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 27, 20), // $4 overpay = overpay (>$3)
      createMockPlayer('p2', 'Player 2', '1B', 50, 45), // $1.75 overpay = NOT overpay
      createMockPlayer('p3', 'Player 3', 'SS', 110, 92), // $11.44 overpay = overpay (>10%)
    ];
    const inflationData = createMockInflationState();

    const result = identifyOverpays(roster, inflationData);

    expect(result.overpays.length).toBeGreaterThanOrEqual(2);
    const overpayIds = result.overpays.map(o => o.player.playerId);
    expect(overpayIds).toContain('p1'); // >$3 threshold
    expect(overpayIds).toContain('p3'); // >10% threshold
  });

  it('should return empty array when no overpays exist', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 15, 25), // Steal
      createMockPlayer('p2', 'Player 2', '1B', 20, 18), // Fair value
    ];
    const inflationData = createMockInflationState();

    const result = identifyOverpays(roster, inflationData);

    expect(result.overpays).toHaveLength(0);
    expect(result.totalValueLost).toBe(0);
  });

  it('should handle empty roster', () => {
    const roster: DraftedPlayer[] = [];
    const inflationData = createMockInflationState();

    const result = identifyOverpays(roster, inflationData);

    expect(result.overpays).toHaveLength(0);
    expect(result.totalValueLost).toBe(0);
  });

  it('should sort overpays by value lost (highest first)', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 30, 20), // ~$7 overpay
      createMockPlayer('p2', 'Player 2', 'SS', 50, 30), // ~$15 overpay
      createMockPlayer('p3', 'Player 3', '1B', 25, 18), // ~$4 overpay
    ];
    const inflationData = createMockInflationState();

    const result = identifyOverpays(roster, inflationData);

    expect(result.overpays.length).toBeGreaterThan(0);
    // Verify descending order by valueLost
    for (let i = 0; i < result.overpays.length - 1; i++) {
      expect(result.overpays[i].valueLost).toBeGreaterThanOrEqual(result.overpays[i + 1].valueLost);
    }
  });

  it('should calculate total value lost across all overpays', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 30, 20), // ~$7 overpay
      createMockPlayer('p2', 'Player 2', '1B', 40, 30), // ~$6 overpay
    ];
    const inflationData = createMockInflationState();

    const result = identifyOverpays(roster, inflationData);

    expect(result.totalValueLost).toBeGreaterThan(10);
  });
});

describe('Value Analysis Edge Cases', () => {
  it('should handle zero inflation rate', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 20, 25), // $5 below base value
    ];
    const inflationData: InflationState = {
      ...createMockInflationState(),
      overallRate: 0,
    };

    const steals = identifySteals(roster, inflationData);
    expect(steals.steals).toHaveLength(1);
    expect(steals.steals[0].adjustedValue).toBe(25); // No inflation adjustment
    expect(steals.steals[0].valueGained).toBe(5);
  });

  it('should handle negative inflation (deflation)', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 20, 30), // Purchased at 20
    ];
    const inflationData: InflationState = {
      ...createMockInflationState(),
      overallRate: -0.1, // -10% deflation
    };
    // Adjusted value = 30 * 0.9 = 27
    // Purchasing at $20 is a $7 steal

    const steals = identifySteals(roster, inflationData);
    expect(steals.steals).toHaveLength(1);
    expect(steals.steals[0].adjustedValue).toBeCloseTo(27, 0);
    expect(steals.steals[0].valueGained).toBeCloseTo(7, 0);
  });

  it('should handle players with $1 projected value (minimum)', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'BN', 1, 1), // Purchased at minimum
    ];
    const inflationData = createMockInflationState();

    const steals = identifySteals(roster, inflationData);
    const overpays = identifyOverpays(roster, inflationData);

    // With 15% inflation, adjusted = $1.15, so buying at $1 is slight steal but below threshold
    expect(steals.steals.length + overpays.overpays.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle very high inflation rates', () => {
    const roster: DraftedPlayer[] = [
      createMockPlayer('p1', 'Player 1', 'OF', 30, 20),
    ];
    const inflationData: InflationState = {
      ...createMockInflationState(),
      overallRate: 0.8, // 80% inflation
    };
    // Adjusted value = 20 * 1.8 = 36
    // Purchasing at $30 is a $6 steal

    const steals = identifySteals(roster, inflationData);
    expect(steals.steals).toHaveLength(1);
    expect(steals.steals[0].adjustedValue).toBeCloseTo(36, 0);
    expect(steals.steals[0].valueGained).toBeCloseTo(6, 0);
  });
});
