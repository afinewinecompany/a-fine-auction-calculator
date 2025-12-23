/**
 * Inflation Store Persistence Tests
 *
 * Story: 10.7 - Preserve Draft State During Connection Failures
 * Tests that inflation state is correctly persisted and restored.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
import { PlayerTier, createDefaultPositionRates, createDefaultTierRates } from '@/features/inflation/types/inflation.types';

describe('Inflation Store Persistence - Story 10.7', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useInflationStore.getState().resetInflation();
  });

  describe('AC2: Inflation state includes all critical data', () => {
    it('should store overall inflation rate', () => {
      const { updateInflation } = useInflationStore.getState();

      // Update with test data
      updateInflation(
        [
          { playerId: 'player-1', auctionPrice: 55, position: 'OF' },
          { playerId: 'player-2', auctionPrice: 48, position: 'SP' },
        ],
        [
          { playerId: 'player-1', projectedValue: 45, position: 'OF' },
          { playerId: 'player-2', projectedValue: 42, position: 'SP' },
          { playerId: 'player-3', projectedValue: 30, position: 'OF' },
        ]
      );

      const state = useInflationStore.getState();
      expect(state.overallRate).toBeGreaterThan(0);
      expect(state.lastUpdated).toBeDefined();
    });

    it('should store position-specific inflation rates', () => {
      const { updateInflation } = useInflationStore.getState();

      updateInflation(
        [
          { playerId: 'player-1', auctionPrice: 55, position: 'OF' },
          { playerId: 'player-2', auctionPrice: 48, position: 'SP' },
        ],
        [
          { playerId: 'player-1', projectedValue: 45, position: 'OF' },
          { playerId: 'player-2', projectedValue: 42, position: 'SP' },
        ]
      );

      const state = useInflationStore.getState();
      expect(state.positionRates).toBeDefined();
      expect(typeof state.positionRates.OF).toBe('number');
      expect(typeof state.positionRates.SP).toBe('number');
    });

    it('should store tier-specific inflation rates', () => {
      const { updateInflation } = useInflationStore.getState();

      updateInflation(
        [
          { playerId: 'player-1', auctionPrice: 55, position: 'OF', tier: PlayerTier.ELITE },
          { playerId: 'player-2', auctionPrice: 25, position: 'OF', tier: PlayerTier.MID },
        ],
        [
          { playerId: 'player-1', projectedValue: 45, tier: 'ELITE' },
          { playerId: 'player-2', projectedValue: 20, tier: 'MID' },
        ]
      );

      const state = useInflationStore.getState();
      expect(state.tierRates).toBeDefined();
      expect(typeof state.tierRates[PlayerTier.ELITE]).toBe('number');
      expect(typeof state.tierRates[PlayerTier.MID]).toBe('number');
    });

    it('should store adjusted values as Map', () => {
      const { updateInflation } = useInflationStore.getState();

      updateInflation(
        [{ playerId: 'player-1', auctionPrice: 55, position: 'OF' }],
        [
          { playerId: 'player-1', projectedValue: 45, position: 'OF' },
          { playerId: 'player-2', projectedValue: 30, position: 'OF' },
          { playerId: 'player-3', projectedValue: 25, position: 'SP' },
        ]
      );

      const state = useInflationStore.getState();
      expect(state.adjustedValues).toBeInstanceOf(Map);
      expect(state.adjustedValues.size).toBeGreaterThan(0);
      // Undrafted players should have adjusted values
      expect(state.adjustedValues.has('player-2')).toBe(true);
      expect(state.adjustedValues.has('player-3')).toBe(true);
    });

    it('should store budget depletion data', () => {
      const { updateInflation } = useInflationStore.getState();

      updateInflation(
        [{ playerId: 'player-1', auctionPrice: 55, position: 'OF' }],
        [
          { playerId: 'player-1', projectedValue: 45, position: 'OF' },
          { playerId: 'player-2', projectedValue: 30, position: 'OF' },
        ],
        {
          totalBudget: 260,
          spent: 55,
          totalRosterSpots: 26,
          slotsRemaining: 25,
        }
      );

      const state = useInflationStore.getState();
      expect(state.budgetDepleted).toBeGreaterThan(0);
      expect(state.budgetDepleted).toBeLessThanOrEqual(1);
    });
  });

  describe('State restoration simulation', () => {
    it('should restore inflation state from persisted data', () => {
      // Set up inflation state
      useInflationStore.getState().updateInflation(
        [
          { playerId: 'player-1', auctionPrice: 55, position: 'OF' },
          { playerId: 'player-2', auctionPrice: 48, position: 'SP' },
        ],
        [
          { playerId: 'player-1', projectedValue: 45, position: 'OF' },
          { playerId: 'player-2', projectedValue: 42, position: 'SP' },
          { playerId: 'player-3', projectedValue: 30, position: 'OF' },
        ],
        {
          totalBudget: 260,
          spent: 103,
          totalRosterSpots: 26,
          slotsRemaining: 24,
        }
      );

      // Capture current state (this simulates what persist middleware serializes)
      const currentState = useInflationStore.getState();
      const capturedState = {
        overallRate: currentState.overallRate,
        positionRates: currentState.positionRates,
        tierRates: currentState.tierRates,
        budgetDepleted: currentState.budgetDepleted,
        playersRemaining: currentState.playersRemaining,
        adjustedValues: Array.from(currentState.adjustedValues.entries()),
        lastUpdated: currentState.lastUpdated?.toISOString() ?? null,
      };

      // Reset the store (simulate page refresh)
      useInflationStore.getState().resetInflation();

      // Verify reset worked
      expect(useInflationStore.getState().overallRate).toBe(0);
      expect(useInflationStore.getState().adjustedValues.size).toBe(0);

      // Restore from captured state (simulating persist middleware hydration)
      useInflationStore.setState({
        overallRate: capturedState.overallRate,
        positionRates: capturedState.positionRates,
        tierRates: capturedState.tierRates,
        budgetDepleted: capturedState.budgetDepleted,
        playersRemaining: capturedState.playersRemaining,
        adjustedValues: new Map(capturedState.adjustedValues),
        lastUpdated: capturedState.lastUpdated ? new Date(capturedState.lastUpdated) : null,
      });

      // Verify state is restored
      const restoredState = useInflationStore.getState();
      expect(restoredState.overallRate).toBe(currentState.overallRate);
      expect(restoredState.positionRates).toEqual(currentState.positionRates);
      expect(restoredState.tierRates).toEqual(currentState.tierRates);
      expect(restoredState.budgetDepleted).toBe(currentState.budgetDepleted);
      expect(restoredState.playersRemaining).toBe(currentState.playersRemaining);
      expect(restoredState.adjustedValues.size).toBe(currentState.adjustedValues.size);
    });

    it('should restore Map correctly from array format', () => {
      // Simulate the format that would be stored in localStorage
      const serializedAdjustedValues: [string, number][] = [
        ['player-1', 45.5],
        ['player-2', 32.0],
        ['player-3', 28.75],
      ];

      // Restore using the same logic as persist middleware
      const restoredMap = new Map(serializedAdjustedValues);

      // Set state with restored map
      useInflationStore.setState({
        adjustedValues: restoredMap,
      });

      const state = useInflationStore.getState();
      expect(state.adjustedValues.size).toBe(3);
      expect(state.adjustedValues.get('player-1')).toBe(45.5);
      expect(state.adjustedValues.get('player-2')).toBe(32.0);
      expect(state.adjustedValues.get('player-3')).toBe(28.75);
    });

    it('should restore Date correctly from ISO string', () => {
      const isoString = '2025-12-22T02:00:00.000Z';

      useInflationStore.setState({
        lastUpdated: new Date(isoString),
      });

      const state = useInflationStore.getState();
      expect(state.lastUpdated).toBeInstanceOf(Date);
      expect(state.lastUpdated?.toISOString()).toBe(isoString);
    });
  });

  describe('Persist configuration verification', () => {
    it('should have persist middleware configured', () => {
      const store = useInflationStore;
      expect(store.persist).toBeDefined();
    });

    it('should maintain state after multiple updates', () => {
      const { updateInflation } = useInflationStore.getState();

      // First update - 1 drafted, 2 projections (1 undrafted)
      updateInflation(
        [{ playerId: 'player-1', auctionPrice: 55, position: 'OF' }],
        [
          { playerId: 'player-1', projectedValue: 45, position: 'OF' },
          { playerId: 'player-2', projectedValue: 30, position: 'OF' },
        ]
      );

      const state1OverallRate = useInflationStore.getState().overallRate;
      const state1PlayersRemaining = useInflationStore.getState().playersRemaining;

      // Second update - 2 drafted, 3 projections (1 undrafted) - different inflation
      updateInflation(
        [
          { playerId: 'player-1', auctionPrice: 55, position: 'OF' },
          { playerId: 'player-2', auctionPrice: 35, position: 'OF' },
        ],
        [
          { playerId: 'player-1', projectedValue: 45, position: 'OF' },
          { playerId: 'player-2', projectedValue: 30, position: 'OF' },
          { playerId: 'player-3', projectedValue: 25, position: 'SP' },
        ]
      );

      const state2 = useInflationStore.getState();

      // Inflation rate should change with more drafted players
      expect(state2.overallRate).not.toBe(state1OverallRate);
      // Players remaining should stay the same (1 in both cases) - test the value is correct
      expect(state2.playersRemaining).toBe(1);
      expect(state1PlayersRemaining).toBe(1);
      // Last updated should be recent
      expect(state2.lastUpdated).toBeDefined();
    });
  });

  describe('Zero data loss (NFR-R4)', () => {
    it('should not lose adjusted values during rapid updates', () => {
      const { updateInflation } = useInflationStore.getState();

      // Build up projections
      const projections = Array.from({ length: 50 }, (_, i) => ({
        playerId: `player-${i}`,
        projectedValue: 20 + (i % 30),
        position: ['OF', 'SP', 'SS', 'C', '1B'][i % 5],
      }));

      // Simulate rapid draft picks
      for (let i = 0; i < 10; i++) {
        const draftedPlayers = projections.slice(0, i + 1).map((p, idx) => ({
          playerId: p.playerId,
          auctionPrice: p.projectedValue + (idx % 5) - 2,
          position: p.position,
        }));

        updateInflation(draftedPlayers, projections);
      }

      const state = useInflationStore.getState();

      // Should have adjusted values for all undrafted players (50 - 10 = 40)
      expect(state.adjustedValues.size).toBe(40);
      expect(state.playersRemaining).toBe(40);
    });
  });
});
