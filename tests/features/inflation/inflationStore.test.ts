/**
 * Tests for Inflation Store (Zustand)
 *
 * Story: 5.7 - Create Inflation Store with Zustand
 *
 * Tests the useInflationStore Zustand store that manages all inflation state
 * globally and provides actions to trigger recalculations.
 */

import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useInflationStore,
  useOverallInflation,
  usePositionInflation,
  usePositionInflationRate,
  useTierInflation,
  useTierInflationRate,
  useAdjustedValue,
  useAdjustedValues,
  useInflationCalculating,
  useInflationLastUpdated,
  useInflationError,
  useBudgetDepleted,
  useBudgetDepletion,
  usePlayersRemaining,
  type InflationDraftedPlayer,
  type InflationProjection,
  type BudgetContext,
} from '@/features/inflation/stores/inflationStore';
import {
  PlayerTier,
  createDefaultPositionRates,
  createDefaultTierRates,
} from '@/features/inflation/types/inflation.types';

describe('useInflationStore', () => {
  // Reset store state before each test
  beforeEach(() => {
    const { result } = renderHook(() => useInflationStore());
    act(() => {
      result.current.resetInflation();
    });
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================
  describe('initial state', () => {
    it('should have overallRate initialized to 0', () => {
      const { result } = renderHook(() => useInflationStore());
      expect(result.current.overallRate).toBe(0);
    });

    it('should have positionRates initialized with all positions at 0', () => {
      const { result } = renderHook(() => useInflationStore());
      const expectedRates = createDefaultPositionRates();
      expect(result.current.positionRates).toEqual(expectedRates);
    });

    it('should have tierRates initialized with all tiers at 0', () => {
      const { result } = renderHook(() => useInflationStore());
      const expectedRates = createDefaultTierRates();
      expect(result.current.tierRates).toEqual(expectedRates);
    });

    it('should have budgetDepleted initialized to 0', () => {
      const { result } = renderHook(() => useInflationStore());
      expect(result.current.budgetDepleted).toBe(0);
    });

    it('should have budgetDepletion initialized to null', () => {
      const { result } = renderHook(() => useInflationStore());
      expect(result.current.budgetDepletion).toBeNull();
    });

    it('should have playersRemaining initialized to 0', () => {
      const { result } = renderHook(() => useInflationStore());
      expect(result.current.playersRemaining).toBe(0);
    });

    it('should have adjustedValues initialized as empty Map', () => {
      const { result } = renderHook(() => useInflationStore());
      expect(result.current.adjustedValues).toBeInstanceOf(Map);
      expect(result.current.adjustedValues.size).toBe(0);
    });

    it('should have isCalculating initialized to false', () => {
      const { result } = renderHook(() => useInflationStore());
      expect(result.current.isCalculating).toBe(false);
    });

    it('should have lastUpdated initialized to null', () => {
      const { result } = renderHook(() => useInflationStore());
      expect(result.current.lastUpdated).toBeNull();
    });

    it('should have error initialized to null', () => {
      const { result } = renderHook(() => useInflationStore());
      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================================
  // updateInflation Action Tests
  // ============================================================================
  describe('updateInflation action', () => {
    it('should calculate overall inflation rate correctly', () => {
      const { result } = renderHook(() => useInflationStore());

      const draftedPlayers: InflationDraftedPlayer[] = [
        { playerId: 'p1', auctionPrice: 30 },
        { playerId: 'p2', auctionPrice: 25 },
      ];

      const projections: InflationProjection[] = [
        { playerId: 'p1', projectedValue: 25 },
        { playerId: 'p2', projectedValue: 20 },
        { playerId: 'p3', projectedValue: 15 },
      ];

      act(() => {
        result.current.updateInflation(draftedPlayers, projections);
      });

      // Total actual: 30 + 25 = 55
      // Total projected (drafted only): 25 + 20 = 45
      // Inflation: (55 - 45) / 45 = 10/45 ≈ 0.222
      expect(result.current.overallRate).toBeCloseTo(10 / 45, 4);
    });

    it('should update lastUpdated timestamp after calculation', () => {
      const { result } = renderHook(() => useInflationStore());

      const beforeUpdate = new Date();

      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }]
        );
      });

      const afterUpdate = new Date();

      expect(result.current.lastUpdated).not.toBeNull();
      expect(result.current.lastUpdated!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(result.current.lastUpdated!.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    it('should update playersRemaining count (undrafted players)', () => {
      const { result } = renderHook(() => useInflationStore());

      const draftedPlayers: InflationDraftedPlayer[] = [{ playerId: 'p1', auctionPrice: 30 }];

      const projections: InflationProjection[] = [
        { playerId: 'p1', projectedValue: 25 },
        { playerId: 'p2', projectedValue: 20 },
        { playerId: 'p3', projectedValue: 15 },
      ];

      act(() => {
        result.current.updateInflation(draftedPlayers, projections);
      });

      // 3 total projections - 1 drafted = 2 remaining
      expect(result.current.playersRemaining).toBe(2);
    });

    it('should populate adjustedValues Map for undrafted players', () => {
      const { result } = renderHook(() => useInflationStore());

      const draftedPlayers: InflationDraftedPlayer[] = [
        { playerId: 'p1', auctionPrice: 30, position: 'OF' },
      ];

      const projections: InflationProjection[] = [
        { playerId: 'p1', projectedValue: 25, position: 'OF' },
        { playerId: 'p2', projectedValue: 20, position: 'SS' },
        { playerId: 'p3', projectedValue: 15, position: 'SP' },
      ];

      act(() => {
        result.current.updateInflation(draftedPlayers, projections);
      });

      // Should have adjusted values for undrafted players (p2 and p3)
      expect(result.current.adjustedValues.size).toBe(2);
      expect(result.current.adjustedValues.has('p1')).toBe(false); // drafted
      expect(result.current.adjustedValues.has('p2')).toBe(true);
      expect(result.current.adjustedValues.has('p3')).toBe(true);
    });

    it('should calculate position-specific inflation rates', () => {
      const { result } = renderHook(() => useInflationStore());

      const draftedPlayers: InflationDraftedPlayer[] = [
        { playerId: 'p1', auctionPrice: 30, positions: ['SS'] },
        { playerId: 'p2', auctionPrice: 20, positions: ['OF'] },
      ];

      const projections: InflationProjection[] = [
        { playerId: 'p1', projectedValue: 25, positions: ['SS'] },
        { playerId: 'p2', projectedValue: 15, positions: ['OF'] },
      ];

      act(() => {
        result.current.updateInflation(draftedPlayers, projections);
      });

      // SS inflation: (30 - 25) / 25 = 0.2
      expect(result.current.positionRates.SS).toBeCloseTo(0.2, 4);
      // OF inflation: (20 - 15) / 15 = 0.333
      expect(result.current.positionRates.OF).toBeCloseTo(1 / 3, 4);
    });

    it('should calculate tier-specific inflation rates', () => {
      const { result } = renderHook(() => useInflationStore());

      // Create a pool of projections to establish tiers
      const projections: InflationProjection[] = [];
      for (let i = 0; i < 100; i++) {
        projections.push({
          playerId: `p${i}`,
          projectedValue: 50 - i * 0.5, // Values from 50 down to 0.5
          tier: i < 10 ? 'ELITE' : i < 40 ? 'MID' : 'LOWER',
        });
      }

      const draftedPlayers: InflationDraftedPlayer[] = [
        { playerId: 'p0', auctionPrice: 55, tier: PlayerTier.ELITE }, // Elite at $55 vs $50 projected
        { playerId: 'p15', auctionPrice: 40, tier: PlayerTier.MID }, // Mid at $40 vs $42.5 projected
      ];

      act(() => {
        result.current.updateInflation(draftedPlayers, projections);
      });

      // Tier rates should be calculated
      expect(result.current.tierRates).toBeDefined();
      expect(typeof result.current.tierRates.ELITE).toBe('number');
      expect(typeof result.current.tierRates.MID).toBe('number');
      expect(typeof result.current.tierRates.LOWER).toBe('number');
    });

    it('should calculate budget depletion when budgetContext is provided', () => {
      const { result } = renderHook(() => useInflationStore());

      const budgetContext: BudgetContext = {
        totalBudget: 2600, // 10 teams * $260
        spent: 500,
        totalRosterSpots: 230, // 10 teams * 23 players
        slotsRemaining: 200,
      };

      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }],
          budgetContext
        );
      });

      expect(result.current.budgetDepletion).not.toBeNull();
      expect(result.current.budgetDepletion?.multiplier).toBeGreaterThan(0);
      expect(result.current.budgetDepletion?.spent).toBe(500);
      expect(result.current.budgetDepletion?.remaining).toBe(2100);
    });

    it('should set isCalculating to false after successful calculation', () => {
      const { result } = renderHook(() => useInflationStore());

      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }]
        );
      });

      expect(result.current.isCalculating).toBe(false);
    });

    it('should clear error after successful calculation', () => {
      const { result } = renderHook(() => useInflationStore());

      // First, artificially set an error (by accessing store state directly)
      act(() => {
        useInflationStore.setState({ error: 'Previous error' });
      });

      expect(result.current.error).toBe('Previous error');

      // Now run a successful calculation
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }]
        );
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle empty draftedPlayers array', () => {
      const { result } = renderHook(() => useInflationStore());

      const projections: InflationProjection[] = [
        { playerId: 'p1', projectedValue: 25 },
        { playerId: 'p2', projectedValue: 20 },
      ];

      act(() => {
        result.current.updateInflation([], projections);
      });

      expect(result.current.overallRate).toBe(0);
      expect(result.current.playersRemaining).toBe(2);
      expect(result.current.adjustedValues.size).toBe(2);
    });

    it('should handle empty projections array', () => {
      const { result } = renderHook(() => useInflationStore());

      act(() => {
        result.current.updateInflation([{ playerId: 'p1', auctionPrice: 30 }], []);
      });

      expect(result.current.overallRate).toBe(0);
      expect(result.current.playersRemaining).toBe(0);
      expect(result.current.adjustedValues.size).toBe(0);
    });
  });

  // ============================================================================
  // resetInflation Action Tests
  // ============================================================================
  describe('resetInflation action', () => {
    it('should reset overallRate to 0', () => {
      const { result } = renderHook(() => useInflationStore());

      // First update with some data
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }]
        );
      });

      expect(result.current.overallRate).not.toBe(0);

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      expect(result.current.overallRate).toBe(0);
    });

    it('should reset positionRates to default values', () => {
      const { result } = renderHook(() => useInflationStore());

      // First update with position data
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30, positions: ['SS'] }],
          [{ playerId: 'p1', projectedValue: 25, positions: ['SS'] }]
        );
      });

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      const expectedRates = createDefaultPositionRates();
      expect(result.current.positionRates).toEqual(expectedRates);
    });

    it('should reset tierRates to default values', () => {
      const { result } = renderHook(() => useInflationStore());

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      const expectedRates = createDefaultTierRates();
      expect(result.current.tierRates).toEqual(expectedRates);
    });

    it('should clear adjustedValues Map', () => {
      const { result } = renderHook(() => useInflationStore());

      // First update with data
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [
            { playerId: 'p1', projectedValue: 25 },
            { playerId: 'p2', projectedValue: 20 },
          ]
        );
      });

      expect(result.current.adjustedValues.size).toBeGreaterThan(0);

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      expect(result.current.adjustedValues.size).toBe(0);
    });

    it('should reset lastUpdated to null', () => {
      const { result } = renderHook(() => useInflationStore());

      // First update
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }]
        );
      });

      expect(result.current.lastUpdated).not.toBeNull();

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      expect(result.current.lastUpdated).toBeNull();
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useInflationStore());

      // Set an error
      act(() => {
        useInflationStore.setState({ error: 'Some error' });
      });

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      expect(result.current.error).toBeNull();
    });

    it('should reset budgetDepleted to 0', () => {
      const { result } = renderHook(() => useInflationStore());

      // First update with budget context
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }],
          { totalBudget: 2600, spent: 500, totalRosterSpots: 230, slotsRemaining: 200 }
        );
      });

      expect(result.current.budgetDepleted).toBeGreaterThan(0);

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      expect(result.current.budgetDepleted).toBe(0);
    });

    it('should reset budgetDepletion to null', () => {
      const { result } = renderHook(() => useInflationStore());

      // First update with budget context
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }],
          { totalBudget: 2600, spent: 500, totalRosterSpots: 230, slotsRemaining: 200 }
        );
      });

      expect(result.current.budgetDepletion).not.toBeNull();

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      expect(result.current.budgetDepletion).toBeNull();
    });

    it('should reset playersRemaining to 0', () => {
      const { result } = renderHook(() => useInflationStore());

      // First update
      act(() => {
        result.current.updateInflation(
          [],
          [
            { playerId: 'p1', projectedValue: 25 },
            { playerId: 'p2', projectedValue: 20 },
          ]
        );
      });

      expect(result.current.playersRemaining).toBe(2);

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      expect(result.current.playersRemaining).toBe(0);
    });
  });

  // ============================================================================
  // clearError Action Tests
  // ============================================================================
  describe('clearError action', () => {
    it('should clear the error message', () => {
      const { result } = renderHook(() => useInflationStore());

      // Set an error
      act(() => {
        useInflationStore.setState({ error: 'Test error message' });
      });

      expect(result.current.error).toBe('Test error message');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should be safe to call when no error exists', () => {
      const { result } = renderHook(() => useInflationStore());

      expect(result.current.error).toBeNull();

      // Clear error when none exists
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================================
  // updateBudgetDepletion Action Tests
  // ============================================================================
  describe('updateBudgetDepletion action', () => {
    it('should update budget depletion independently', () => {
      const { result } = renderHook(() => useInflationStore());

      const budgetContext: BudgetContext = {
        totalBudget: 2600,
        spent: 1000,
        totalRosterSpots: 230,
        slotsRemaining: 150,
      };

      act(() => {
        result.current.updateBudgetDepletion(budgetContext);
      });

      // Check budgetDepleted percentage
      expect(result.current.budgetDepleted).toBeCloseTo(1000 / 2600, 4);

      // Check budgetDepletion object
      expect(result.current.budgetDepletion).not.toBeNull();
      expect(result.current.budgetDepletion?.spent).toBe(1000);
      expect(result.current.budgetDepletion?.remaining).toBe(1600);
      expect(result.current.budgetDepletion?.slotsRemaining).toBe(150);
    });

    it('should update lastUpdated after budget update', () => {
      const { result } = renderHook(() => useInflationStore());

      const beforeUpdate = new Date();

      act(() => {
        result.current.updateBudgetDepletion({
          totalBudget: 2600,
          spent: 500,
          totalRosterSpots: 230,
          slotsRemaining: 200,
        });
      });

      expect(result.current.lastUpdated).not.toBeNull();
      expect(result.current.lastUpdated!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================
  describe('error handling', () => {
    it('should handle calculation errors gracefully', () => {
      const { result } = renderHook(() => useInflationStore());

      // Mock a calculation error by passing invalid data that might cause issues
      // The store should catch errors and set the error state
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // This should complete without throwing
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: -999999 }], // Edge case data
          [{ playerId: 'p1', projectedValue: null }]
        );
      });

      // Store should still function (either with error or with handled edge case)
      expect(result.current.isCalculating).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // State Immutability Tests
  // ============================================================================
  describe('state immutability', () => {
    it('should create new positionRates object on update', () => {
      const { result } = renderHook(() => useInflationStore());

      const initialRates = result.current.positionRates;

      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30, positions: ['SS'] }],
          [{ playerId: 'p1', projectedValue: 25, positions: ['SS'] }]
        );
      });

      // Should be a new object reference (immutable update)
      expect(result.current.positionRates).not.toBe(initialRates);
    });

    it('should create new tierRates object on update', () => {
      const { result } = renderHook(() => useInflationStore());

      const initialRates = result.current.tierRates;

      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30, tier: PlayerTier.ELITE }],
          [{ playerId: 'p1', projectedValue: 25, tier: 'ELITE' }]
        );
      });

      // Should be a new object reference
      expect(result.current.tierRates).not.toBe(initialRates);
    });

    it('should create new adjustedValues Map on update', () => {
      const { result } = renderHook(() => useInflationStore());

      const initialMap = result.current.adjustedValues;

      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [
            { playerId: 'p1', projectedValue: 25 },
            { playerId: 'p2', projectedValue: 20 },
          ]
        );
      });

      // Should be a new Map reference
      expect(result.current.adjustedValues).not.toBe(initialMap);
    });

    it('should create new objects on reset', () => {
      const { result } = renderHook(() => useInflationStore());

      // First populate the store
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }]
        );
      });

      const propsBeforeReset = {
        positionRates: result.current.positionRates,
        tierRates: result.current.tierRates,
        adjustedValues: result.current.adjustedValues,
      };

      // Reset
      act(() => {
        result.current.resetInflation();
      });

      // All should be new references
      expect(result.current.positionRates).not.toBe(propsBeforeReset.positionRates);
      expect(result.current.tierRates).not.toBe(propsBeforeReset.tierRates);
      expect(result.current.adjustedValues).not.toBe(propsBeforeReset.adjustedValues);
    });
  });

  // ============================================================================
  // Selector Hook Tests
  // ============================================================================
  describe('selector hooks', () => {
    it('useOverallInflation should return overallRate', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      act(() => {
        storeResult.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }]
        );
      });

      // Re-render to get updated value
      const { result: selectorResult } = renderHook(() => useOverallInflation());
      expect(selectorResult.current).toBe(storeResult.current.overallRate);
    });

    it('usePositionInflation should return positionRates', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());
      const { result: selectorResult } = renderHook(() => usePositionInflation());

      expect(selectorResult.current).toEqual(storeResult.current.positionRates);
    });

    it('useTierInflation should return tierRates', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());
      const { result: selectorResult } = renderHook(() => useTierInflation());

      expect(selectorResult.current).toEqual(storeResult.current.tierRates);
    });

    it('useAdjustedValue should return value for specific player', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      act(() => {
        storeResult.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [
            { playerId: 'p1', projectedValue: 25 },
            { playerId: 'p2', projectedValue: 20 },
          ]
        );
      });

      const { result: selectorResult } = renderHook(() => useAdjustedValue('p2'));

      // Should return the adjusted value for p2
      expect(typeof selectorResult.current).toBe('number');
      expect(selectorResult.current).toBeGreaterThanOrEqual(0);
    });

    it('useAdjustedValue should return 0 for unknown player', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      act(() => {
        storeResult.current.updateInflation([], []);
      });

      const { result: selectorResult } = renderHook(() => useAdjustedValue('unknown-player'));

      expect(selectorResult.current).toBe(0);
    });

    it('useAdjustedValues should return the full Map', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());
      const { result: selectorResult } = renderHook(() => useAdjustedValues());

      expect(selectorResult.current).toBe(storeResult.current.adjustedValues);
    });

    it('useInflationCalculating should return isCalculating state', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());
      const { result: selectorResult } = renderHook(() => useInflationCalculating());

      expect(selectorResult.current).toBe(storeResult.current.isCalculating);
    });

    it('useInflationLastUpdated should return lastUpdated timestamp', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());
      const { result: selectorResult } = renderHook(() => useInflationLastUpdated());

      expect(selectorResult.current).toBe(storeResult.current.lastUpdated);
    });

    it('useInflationError should return error state', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());
      const { result: selectorResult } = renderHook(() => useInflationError());

      expect(selectorResult.current).toBe(storeResult.current.error);
    });

    it('useBudgetDepletion should return budgetDepletion state', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());
      const { result: selectorResult } = renderHook(() => useBudgetDepletion());

      expect(selectorResult.current).toBe(storeResult.current.budgetDepletion);
    });

    it('usePlayersRemaining should return playersRemaining count', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());
      const { result: selectorResult } = renderHook(() => usePlayersRemaining());

      expect(selectorResult.current).toBe(storeResult.current.playersRemaining);
    });

    it('usePositionInflationRate should return rate for specific position', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      // Update with position-specific data
      act(() => {
        storeResult.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30, positions: ['SS'] }],
          [{ playerId: 'p1', projectedValue: 25, positions: ['SS'] }]
        );
      });

      const { result: selectorResult } = renderHook(() => usePositionInflationRate('SS'));

      // SS inflation: (30 - 25) / 25 = 0.2
      expect(selectorResult.current).toBeCloseTo(0.2, 4);
    });

    it('usePositionInflationRate should return 0 for position with no data', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      act(() => {
        storeResult.current.resetInflation();
      });

      const { result: selectorResult } = renderHook(() => usePositionInflationRate('C'));

      expect(selectorResult.current).toBe(0);
    });

    it('useTierInflationRate should return rate for specific tier', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      // Update with tier-specific data
      act(() => {
        storeResult.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 55, tier: PlayerTier.ELITE }],
          [{ playerId: 'p1', projectedValue: 50, tier: 'ELITE' }]
        );
      });

      const { result: selectorResult } = renderHook(() => useTierInflationRate(PlayerTier.ELITE));

      // ELITE inflation: (55 - 50) / 50 = 0.1
      expect(selectorResult.current).toBeCloseTo(0.1, 4);
    });

    it('useTierInflationRate should return 0 for tier with no data', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      act(() => {
        storeResult.current.resetInflation();
      });

      const { result: selectorResult } = renderHook(() => useTierInflationRate(PlayerTier.LOWER));

      expect(selectorResult.current).toBe(0);
    });

    it('useBudgetDepleted should return budgetDepleted percentage', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      act(() => {
        storeResult.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }],
          { totalBudget: 2600, spent: 520, totalRosterSpots: 230, slotsRemaining: 200 }
        );
      });

      const { result: selectorResult } = renderHook(() => useBudgetDepleted());

      // budgetDepleted = 520 / 2600 = 0.2
      expect(selectorResult.current).toBeCloseTo(0.2, 4);
    });

    it('useBudgetDepleted should return 0 when no budget context provided', () => {
      const { result: storeResult } = renderHook(() => useInflationStore());

      act(() => {
        storeResult.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 30 }],
          [{ playerId: 'p1', projectedValue: 25 }]
          // No budgetContext
        );
      });

      const { result: selectorResult } = renderHook(() => useBudgetDepleted());

      expect(selectorResult.current).toBe(0);
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================
  describe('integration', () => {
    it('should handle complete draft workflow', () => {
      const { result } = renderHook(() => useInflationStore());

      // Start of draft - no players drafted
      expect(result.current.overallRate).toBe(0);

      // First pick
      act(() => {
        result.current.updateInflation(
          [{ playerId: 'p1', auctionPrice: 45, positions: ['OF'], tier: PlayerTier.ELITE }],
          [
            { playerId: 'p1', projectedValue: 40, positions: ['OF'], tier: 'ELITE' },
            { playerId: 'p2', projectedValue: 35, positions: ['SS'], tier: 'ELITE' },
            { playerId: 'p3', projectedValue: 25, positions: ['1B'], tier: 'MID' },
          ],
          { totalBudget: 2600, spent: 45, totalRosterSpots: 230, slotsRemaining: 229 }
        );
      });

      expect(result.current.overallRate).toBeGreaterThan(0); // Some inflation
      expect(result.current.playersRemaining).toBe(2);
      expect(result.current.adjustedValues.size).toBe(2);
      expect(result.current.budgetDepletion).not.toBeNull();

      // Second pick
      act(() => {
        result.current.updateInflation(
          [
            { playerId: 'p1', auctionPrice: 45, positions: ['OF'], tier: PlayerTier.ELITE },
            { playerId: 'p2', auctionPrice: 38, positions: ['SS'], tier: PlayerTier.ELITE },
          ],
          [
            { playerId: 'p1', projectedValue: 40, positions: ['OF'], tier: 'ELITE' },
            { playerId: 'p2', projectedValue: 35, positions: ['SS'], tier: 'ELITE' },
            { playerId: 'p3', projectedValue: 25, positions: ['1B'], tier: 'MID' },
          ],
          { totalBudget: 2600, spent: 83, totalRosterSpots: 230, slotsRemaining: 228 }
        );
      });

      expect(result.current.playersRemaining).toBe(1);
      expect(result.current.adjustedValues.size).toBe(1);

      // Reset for new draft
      act(() => {
        result.current.resetInflation();
      });

      expect(result.current.overallRate).toBe(0);
      expect(result.current.playersRemaining).toBe(0);
      expect(result.current.adjustedValues.size).toBe(0);
      expect(result.current.budgetDepletion).toBeNull();
    });
  });
});
