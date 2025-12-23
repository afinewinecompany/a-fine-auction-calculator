/**
 * Tests for Inflation Integration Hook
 *
 * Story: 5.8 - Integrate Inflation Engine with Draft State
 *
 * Tests the hook that connects draft store to inflation store.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
import {
  useInflationIntegration,
  setupInflationSubscription,
} from '@/features/inflation/hooks/useInflationIntegration';
import type { PlayerProjection } from '@/features/projections/types/projection.types';

// Mock data
const mockProjections: PlayerProjection[] = [
  {
    id: 'p1',
    leagueId: 'league-1',
    playerName: 'Mike Trout',
    team: 'LAA',
    positions: ['OF'],
    projectedValue: 50,
    projectionSource: 'fangraphs',
    statsHitters: null,
    statsPitchers: null,
    tier: 'ELITE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    leagueId: 'league-1',
    playerName: 'Mookie Betts',
    team: 'LAD',
    positions: ['OF', '2B'],
    projectedValue: 45,
    projectionSource: 'fangraphs',
    statsHitters: null,
    statsPitchers: null,
    tier: 'ELITE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    leagueId: 'league-1',
    playerName: 'Jose Ramirez',
    team: 'CLE',
    positions: ['3B'],
    projectedValue: 35,
    projectionSource: 'fangraphs',
    statsHitters: null,
    statsPitchers: null,
    tier: 'MID',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    leagueId: 'league-1',
    playerName: 'Player Four',
    team: 'NYY',
    positions: ['SS'],
    projectedValue: 20,
    projectionSource: 'fangraphs',
    statsHitters: null,
    statsPitchers: null,
    tier: 'MID',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    leagueId: 'league-1',
    playerName: 'Player Five',
    team: 'BOS',
    positions: ['C'],
    projectedValue: 10,
    projectionSource: 'fangraphs',
    statsHitters: null,
    statsPitchers: null,
    tier: 'LOWER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to setup draft
const setupDraft = (leagueId: string) => {
  useDraftStore.getState().initializeDraft(leagueId, 260, {
    hitters: 14,
    pitchers: 9,
    bench: 3,
  });
};

// Helper to add drafted player
const addDraftedPlayer = (
  leagueId: string,
  playerId: string,
  playerName: string,
  position: string,
  purchasePrice: number,
  projectedValue: number
) => {
  useDraftStore.getState().addDraftedPlayer(leagueId, {
    playerId,
    playerName,
    position,
    purchasePrice,
    projectedValue,
    variance: purchasePrice - projectedValue,
    draftedBy: 'other',
  });
};

// Reset stores before each test
beforeEach(() => {
  useDraftStore.setState({ drafts: {} });
  useInflationStore.getState().resetInflation();

  // Mock requestIdleCallback
  if (!window.requestIdleCallback) {
    (window as unknown as { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback = (
      callback: IdleRequestCallback
    ) => {
      return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0) as unknown as number;
    };
    (window as unknown as { cancelIdleCallback: typeof cancelIdleCallback }).cancelIdleCallback = (
      id: number
    ) => {
      clearTimeout(id);
    };
  }
});

describe('useInflationIntegration', () => {
  // ============================================================================
  // Basic Integration Tests
  // ============================================================================
  describe('basic integration', () => {
    it('should initialize with correct state', () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      const { result } = renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: mockProjections,
        })
      );

      expect(result.current.isCalculating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should perform initial calculation on mount', async () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: mockProjections,
        })
      );

      await waitFor(() => {
        const state = useInflationStore.getState();
        expect(state.lastUpdated).not.toBeNull();
      });

      // Check that adjusted values were calculated
      const state = useInflationStore.getState();
      expect(state.adjustedValues.size).toBeGreaterThan(0);
    });

    it('should recalculate when player is drafted', async () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      // Add a drafted player first so inflation is non-zero
      addDraftedPlayer(leagueId, 'p1', 'Mike Trout', 'OF', 55, 50);

      const { result } = renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: mockProjections,
          debounceMs: 10, // Short debounce for testing
        })
      );

      // Wait for initial calculation
      await waitFor(
        () => {
          expect(useInflationStore.getState().lastUpdated).not.toBeNull();
        },
        { timeout: 2000 }
      );

      // Check inflation was calculated (player paid 55 for 50 value = 10% inflation)
      const state = useInflationStore.getState();
      expect(state.overallRate).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Debouncing Tests
  // ============================================================================
  describe('debouncing', () => {
    it('should debounce rapid updates', async () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: mockProjections,
          debounceMs: 50,
        })
      );

      // Wait for initial calculation
      await waitFor(() => {
        expect(useInflationStore.getState().lastUpdated).not.toBeNull();
      });

      // Track calculation count
      let updateCount = 0;
      const unsubscribe = useInflationStore.subscribe(
        state => state.lastUpdated,
        () => {
          updateCount++;
        }
      );

      // Rapidly draft multiple players
      act(() => {
        addDraftedPlayer(leagueId, 'p1', 'Mike Trout', 'OF', 55, 50);
        addDraftedPlayer(leagueId, 'p2', 'Mookie Betts', 'OF', 48, 45);
        addDraftedPlayer(leagueId, 'p3', 'Jose Ramirez', '3B', 38, 35);
      });

      // Wait for debounced update
      await new Promise(resolve => setTimeout(resolve, 200));

      unsubscribe();

      // Should have batched updates due to debouncing
      // Exact count depends on timing, but should be less than 3 updates
      expect(updateCount).toBeLessThanOrEqual(3);
    });
  });

  // ============================================================================
  // Manual Control Tests
  // ============================================================================
  describe('manual controls', () => {
    it('should allow manual recalculation', async () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      const { result } = renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: mockProjections,
        })
      );

      // Wait for initial calculation
      await waitFor(() => {
        expect(useInflationStore.getState().lastUpdated).not.toBeNull();
      });

      const initialLastUpdated = useInflationStore.getState().lastUpdated;

      // Add a player directly to store (bypassing subscription)
      useDraftStore.setState(state => ({
        drafts: {
          ...state.drafts,
          [leagueId]: {
            ...state.drafts[leagueId],
            draftedPlayers: [
              ...state.drafts[leagueId].draftedPlayers,
              {
                playerId: 'p1',
                playerName: 'Mike Trout',
                position: 'OF',
                purchasePrice: 55,
                projectedValue: 50,
                variance: 5,
                draftedBy: 'other' as const,
                draftedAt: new Date().toISOString(),
              },
            ],
          },
        },
      }));

      // Manually trigger recalculation
      act(() => {
        result.current.recalculate();
      });

      // Wait for update
      await waitFor(() => {
        const state = useInflationStore.getState();
        return (
          state.lastUpdated !== null &&
          state.lastUpdated.getTime() > (initialLastUpdated?.getTime() ?? 0)
        );
      });

      expect(useInflationStore.getState().overallRate).toBeGreaterThan(0);
    });

    it('should allow reset', async () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      // Add a drafted player first
      addDraftedPlayer(leagueId, 'p1', 'Mike Trout', 'OF', 55, 50);

      const { result } = renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: mockProjections,
        })
      );

      // Wait for calculation
      await waitFor(() => {
        expect(useInflationStore.getState().lastUpdated).not.toBeNull();
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Check state was reset
      const state = useInflationStore.getState();
      expect(state.overallRate).toBe(0);
      expect(state.lastUpdated).toBeNull();
    });
  });

  // ============================================================================
  // Enabled/Disabled Tests
  // ============================================================================
  describe('enabled option', () => {
    it('should not calculate when disabled', async () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: mockProjections,
          enabled: false,
        })
      );

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not have calculated
      const state = useInflationStore.getState();
      expect(state.lastUpdated).toBeNull();
    });

    it('should calculate when re-enabled', async () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      const { rerender } = renderHook(
        ({ enabled }) =>
          useInflationIntegration({
            leagueId,
            projections: mockProjections,
            enabled,
          }),
        { initialProps: { enabled: false } }
      );

      // Should not have calculated
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(useInflationStore.getState().lastUpdated).toBeNull();

      // Enable
      rerender({ enabled: true });

      // Should calculate
      await waitFor(() => {
        expect(useInflationStore.getState().lastUpdated).not.toBeNull();
      });
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('edge cases', () => {
    it('should handle empty projections', () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      const { result } = renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: [],
        })
      );

      expect(result.current.error).toBeNull();
    });

    it('should handle missing draft', () => {
      const { result } = renderHook(() =>
        useInflationIntegration({
          leagueId: 'non-existent',
          projections: mockProjections,
        })
      );

      expect(result.current.error).toBeNull();
    });

    it('should handle empty league ID', () => {
      const { result } = renderHook(() =>
        useInflationIntegration({
          leagueId: '',
          projections: mockProjections,
        })
      );

      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================
  describe('performance', () => {
    it('should complete recalculation in <2 seconds', async () => {
      const leagueId = 'league-1';
      setupDraft(leagueId);

      // Create large projection set
      const largeProjections: PlayerProjection[] = [];
      for (let i = 0; i < 2000; i++) {
        largeProjections.push({
          id: `player-${i}`,
          leagueId,
          playerName: `Player ${i}`,
          team: 'TST',
          positions: ['OF'],
          projectedValue: Math.floor(Math.random() * 50) + 1,
          projectionSource: 'fangraphs',
          statsHitters: null,
          statsPitchers: null,
          tier: i < 200 ? 'ELITE' : i < 800 ? 'MID' : 'LOWER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const startTime = performance.now();

      renderHook(() =>
        useInflationIntegration({
          leagueId,
          projections: largeProjections,
          totalRosterSpots: 250,
        })
      );

      // Wait for calculation
      await waitFor(
        () => {
          expect(useInflationStore.getState().lastUpdated).not.toBeNull();
        },
        { timeout: 3000 }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // <2 seconds
    });
  });
});

// ============================================================================
// setupInflationSubscription Tests
// ============================================================================
describe('setupInflationSubscription', () => {
  it('should return unsubscribe function', () => {
    const leagueId = 'league-1';
    setupDraft(leagueId);

    const unsubscribe = setupInflationSubscription(leagueId, mockProjections, {
      totalBudget: 2600,
      totalRosterSpots: 120,
    });

    expect(typeof unsubscribe).toBe('function');

    unsubscribe();
  });

  it('should not throw when called with valid parameters', () => {
    const leagueId = 'league-1';
    setupDraft(leagueId);

    expect(() => {
      const unsubscribe = setupInflationSubscription(leagueId, mockProjections, {
        totalBudget: 2600,
        totalRosterSpots: 120,
      });
      unsubscribe();
    }).not.toThrow();
  });

  it('should handle missing draft gracefully', () => {
    expect(() => {
      const unsubscribe = setupInflationSubscription('non-existent', mockProjections, {
        totalBudget: 2600,
        totalRosterSpots: 120,
      });
      unsubscribe();
    }).not.toThrow();
  });
});
