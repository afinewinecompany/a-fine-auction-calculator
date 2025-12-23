/**
 * Inflation Integration Hook
 *
 * Connects the draft store to the inflation store, triggering automatic
 * inflation recalculations whenever draft state changes.
 *
 * Story: 5.8 - Integrate Inflation Engine with Draft State
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import {
  useInflationStore,
  type InflationDraftedPlayer,
  type InflationProjection,
  type BudgetContext,
} from '../stores/inflationStore';
import type { DraftedPlayer } from '@/features/draft/types/draft.types';
import type { PlayerProjection } from '@/features/projections/types/projection.types';
import { PlayerTier, type Position } from '../types/inflation.types';

// ============================================================================
// Type Converters
// ============================================================================

/**
 * Convert DraftedPlayer from draft store to InflationDraftedPlayer
 */
function toInflationDraftedPlayer(player: DraftedPlayer): InflationDraftedPlayer {
  // Convert position string to Position type
  const position = player.position as Position;

  // Infer tier from projected value (simplified - actual tier assignment
  // would use the full projection pool)
  let tier: PlayerTier | undefined;
  if (player.projectedValue >= 30) {
    tier = PlayerTier.ELITE;
  } else if (player.projectedValue >= 15) {
    tier = PlayerTier.MID;
  } else {
    tier = PlayerTier.LOWER;
  }

  return {
    playerId: player.playerId,
    auctionPrice: player.purchasePrice,
    position,
    tier,
  };
}

/**
 * Convert PlayerProjection from projections store to InflationProjection
 */
function toInflationProjection(projection: PlayerProjection): InflationProjection {
  return {
    playerId: projection.id,
    projectedValue: projection.projectedValue,
    positions: projection.positions as string[],
    tier: projection.tier,
  };
}

// ============================================================================
// Debounce Utility
// ============================================================================

/**
 * Simple debounce function for non-blocking updates
 */
function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };
}

// ============================================================================
// Integration Hook
// ============================================================================

/**
 * Hook options for inflation integration
 */
export interface UseInflationIntegrationOptions {
  /**
   * League ID to track draft for
   */
  leagueId: string;

  /**
   * Projections for the league
   */
  projections: PlayerProjection[];

  /**
   * Total budget across all teams
   */
  totalBudget?: number;

  /**
   * Total roster spots across all teams
   */
  totalRosterSpots?: number;

  /**
   * Debounce delay for rapid updates (default: 100ms)
   */
  debounceMs?: number;

  /**
   * Whether integration is enabled (default: true)
   */
  enabled?: boolean;
}

/**
 * Hook return value
 */
export interface UseInflationIntegrationResult {
  /**
   * Whether inflation is currently being calculated
   */
  isCalculating: boolean;

  /**
   * Last update timestamp
   */
  lastUpdated: Date | null;

  /**
   * Error from last calculation
   */
  error: string | null;

  /**
   * Manually trigger inflation recalculation
   */
  recalculate: () => void;

  /**
   * Reset inflation state
   */
  reset: () => void;
}

/**
 * Integrates draft store with inflation store for automatic recalculation.
 *
 * This hook subscribes to draft state changes and triggers inflation
 * recalculations whenever players are drafted. It uses debouncing to
 * prevent excessive recalculations during rapid draft activity.
 *
 * @param options - Configuration options
 * @returns Integration state and manual control functions
 *
 * @example
 * ```typescript
 * function DraftPage({ leagueId }: { leagueId: string }) {
 *   const projections = useProjections(leagueId);
 *
 *   const { isCalculating, lastUpdated, recalculate } = useInflationIntegration({
 *     leagueId,
 *     projections,
 *     totalBudget: 2600,
 *     totalRosterSpots: 120,
 *   });
 *
 *   return (
 *     <div>
 *       {isCalculating && <Spinner />}
 *       <PlayerList />
 *     </div>
 *   );
 * }
 * ```
 */
export function useInflationIntegration(
  options: UseInflationIntegrationOptions
): UseInflationIntegrationResult {
  const {
    leagueId,
    projections,
    totalBudget = 2600,
    totalRosterSpots = 120,
    debounceMs = 100,
    enabled = true,
  } = options;

  // Store state and actions
  const getDraft = useDraftStore(state => state.getDraft);
  const updateInflation = useInflationStore(state => state.updateInflation);
  const resetInflation = useInflationStore(state => state.resetInflation);
  const isCalculating = useInflationStore(state => state.isCalculating);
  const lastUpdated = useInflationStore(state => state.lastUpdated);
  const error = useInflationStore(state => state.error);

  // Track previous drafted players count to detect changes
  const prevDraftedCountRef = useRef<number>(-1);

  // Convert projections to inflation format (memoized)
  const inflationProjections = useMemo(() => projections.map(toInflationProjection), [projections]);

  // Create the recalculation function
  const performRecalculation = useCallback(() => {
    const draft = getDraft(leagueId);
    if (!draft || inflationProjections.length === 0) {
      return;
    }

    const draftedPlayers = draft.draftedPlayers.map(toInflationDraftedPlayer);

    // Calculate budget context
    const spent = draft.initialBudget - draft.remainingBudget;
    const slotsRemaining = totalRosterSpots - draftedPlayers.length;

    const budgetContext: BudgetContext = {
      totalBudget,
      spent,
      totalRosterSpots,
      slotsRemaining,
    };

    // Use requestIdleCallback for non-blocking updates if available
    const scheduleUpdate = () => {
      updateInflation(draftedPlayers, inflationProjections, budgetContext);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(scheduleUpdate, { timeout: 2000 });
    } else {
      // Fallback to setTimeout
      setTimeout(scheduleUpdate, 0);
    }
  }, [getDraft, leagueId, inflationProjections, totalBudget, totalRosterSpots, updateInflation]);

  // Create debounced recalculation
  const debouncedRecalculate = useMemo(
    () => debounce(performRecalculation, debounceMs),
    [performRecalculation, debounceMs]
  );

  // Subscribe to draft state changes
  useEffect(() => {
    if (!enabled || !leagueId) {
      return;
    }

    // Set up Zustand subscription
    const unsubscribe = useDraftStore.subscribe(
      state => {
        const draft = state.drafts[leagueId];
        return draft?.draftedPlayers.length ?? 0;
      },
      (draftedCount, prevCount) => {
        // Only recalculate if count actually changed
        if (draftedCount !== prevCount && prevCount !== undefined) {
          debouncedRecalculate();
        }
      },
      {
        fireImmediately: false,
      }
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, leagueId, debouncedRecalculate]);

  // Initial calculation on mount if projections available
  useEffect(() => {
    if (!enabled || inflationProjections.length === 0) {
      return;
    }

    const draft = getDraft(leagueId);
    const currentCount = draft?.draftedPlayers.length ?? 0;

    // Only run on mount or when projections change significantly
    if (prevDraftedCountRef.current === -1) {
      prevDraftedCountRef.current = currentCount;
      performRecalculation();
    }
  }, [enabled, leagueId, inflationProjections.length, getDraft, performRecalculation]);

  return {
    isCalculating,
    lastUpdated,
    error,
    recalculate: performRecalculation,
    reset: resetInflation,
  };
}

// ============================================================================
// Standalone Subscription Setup
// ============================================================================

/**
 * Sets up a standalone subscription to draft store that updates inflation.
 *
 * This is useful for setting up global inflation tracking outside of React
 * components (e.g., in a store middleware or initialization code).
 *
 * @param leagueId - League ID to track
 * @param projections - Player projections
 * @param budgetConfig - Budget configuration
 * @returns Unsubscribe function
 *
 * @example
 * ```typescript
 * // In app initialization
 * const unsubscribe = setupInflationSubscription('league-1', projections, {
 *   totalBudget: 2600,
 *   totalRosterSpots: 120,
 * });
 *
 * // On cleanup
 * unsubscribe();
 * ```
 */
export function setupInflationSubscription(
  leagueId: string,
  projections: PlayerProjection[],
  budgetConfig: { totalBudget: number; totalRosterSpots: number }
): () => void {
  const inflationProjections = projections.map(toInflationProjection);

  const unsubscribe = useDraftStore.subscribe(
    state => {
      const draft = state.drafts[leagueId];
      return {
        draftedPlayers: draft?.draftedPlayers ?? [],
        remainingBudget: draft?.remainingBudget ?? budgetConfig.totalBudget,
        initialBudget: draft?.initialBudget ?? budgetConfig.totalBudget,
      };
    },
    ({ draftedPlayers, remainingBudget, initialBudget }, prevState) => {
      // Only recalculate if players changed
      if (prevState && draftedPlayers.length === prevState.draftedPlayers.length) {
        return;
      }

      const inflationDraftedPlayers = draftedPlayers.map(toInflationDraftedPlayer);
      const spent = initialBudget - remainingBudget;
      const slotsRemaining = budgetConfig.totalRosterSpots - draftedPlayers.length;

      const budgetContext: BudgetContext = {
        totalBudget: budgetConfig.totalBudget,
        spent,
        totalRosterSpots: budgetConfig.totalRosterSpots,
        slotsRemaining,
      };

      useInflationStore
        .getState()
        .updateInflation(inflationDraftedPlayers, inflationProjections, budgetContext);
    },
    {
      fireImmediately: true,
    }
  );

  return unsubscribe;
}

export default useInflationIntegration;
