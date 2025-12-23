/**
 * Inflation Store (Zustand with Persist)
 *
 * Global state management for inflation calculation data.
 * Orchestrates all inflation calculations and provides reactive state
 * for the live draft experience.
 *
 * Story: 5.7 - Create Inflation Store with Zustand
 * Updated: 10.7 - Preserve Draft State During Connection Failures
 *   - Added persist middleware for localStorage persistence
 *   - Custom serialization for Map (adjustedValues)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Position, PositionInflationRate, TierInflationRate } from '../types/inflation.types';
import {
  PlayerTier,
  createDefaultPositionRates,
  createDefaultTierRates,
} from '../types/inflation.types';
import {
  calculateOverallInflation,
  calculatePositionInflation,
  calculateTierInflation,
  calculateBudgetDepletionFactor,
  calculateAdjustedValues,
  type PositionDraftedPlayerInput,
  type PositionProjectionInput,
  type TierDraftedPlayerInput,
  type TierProjectionInput,
  type AdjustedValuePlayerInput,
  type BudgetDepletionResult,
} from '../utils/inflationCalculations';

// ============================================================================
// Store Input Types
// ============================================================================

/**
 * Input interface for a drafted player used in store calculations.
 * Compatible with DraftedPlayer from draft.types.ts
 *
 * Updated: Story 10.5 - tier accepts string for compatibility with manual entries
 */
export interface InflationDraftedPlayer {
  playerId: string;
  auctionPrice: number;
  position?: string;
  positions?: Position[];
  /**
   * Player tier - accepts string or PlayerTier enum
   * Story 10.5: Converted internally to PlayerTier for calculations
   */
  tier?: PlayerTier | string;
}

/**
 * Input interface for a projection used in store calculations.
 * Compatible with PlayerProjection from projection.types.ts
 */
export interface InflationProjection {
  playerId: string;
  projectedValue: number | null;
  position?: string;
  positions?: string[];
  tier?: string | null;
}

/**
 * Budget context for depletion factor calculation
 */
export interface BudgetContext {
  totalBudget: number;
  spent: number;
  totalRosterSpots: number;
  slotsRemaining: number;
}

// ============================================================================
// Store State Interface
// ============================================================================

/**
 * Inflation store state
 */
export interface InflationStoreState {
  // Inflation data
  overallRate: number;
  positionRates: PositionInflationRate;
  tierRates: TierInflationRate;
  budgetDepleted: number; // AC-specified: percentage of budget spent (0.0-1.0)
  budgetDepletion: BudgetDepletionResult | null; // Extended info for calculations
  playersRemaining: number;
  adjustedValues: Map<string, number>;

  // Loading/error state
  isCalculating: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

/**
 * Inflation store actions
 */
export interface InflationStoreActions {
  /**
   * Update all inflation calculations with new draft data
   */
  updateInflation: (
    draftedPlayers: InflationDraftedPlayer[],
    projections: InflationProjection[],
    budgetContext?: BudgetContext
  ) => void;

  /**
   * Reset store to initial state
   */
  resetInflation: () => void;

  /**
   * Clear error message
   */
  clearError: () => void;

  /**
   * Update only budget depletion (for real-time budget tracking)
   */
  updateBudgetDepletion: (budgetContext: BudgetContext) => void;
}

/**
 * Combined store type
 */
export type InflationStore = InflationStoreState & InflationStoreActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: InflationStoreState = {
  overallRate: 0,
  positionRates: createDefaultPositionRates(),
  tierRates: createDefaultTierRates(),
  budgetDepleted: 0,
  budgetDepletion: null,
  playersRemaining: 0,
  adjustedValues: new Map(),
  isCalculating: false,
  lastUpdated: null,
  error: null,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert store drafted player to position-specific input
 */
function toPositionDraftedPlayer(player: InflationDraftedPlayer): PositionDraftedPlayerInput {
  let positions: Position[] = [];

  if (player.positions && player.positions.length > 0) {
    positions = player.positions;
  } else if (player.position) {
    positions = [player.position as Position];
  }

  return {
    playerId: player.playerId,
    auctionPrice: player.auctionPrice,
    positions,
  };
}

/**
 * Convert store projection to position-specific input
 */
function toPositionProjection(projection: InflationProjection): PositionProjectionInput {
  let positions: Position[] = [];

  if (projection.positions && projection.positions.length > 0) {
    positions = projection.positions as Position[];
  } else if (projection.position) {
    positions = [projection.position as Position];
  }

  return {
    playerId: projection.playerId,
    projectedValue: projection.projectedValue,
    positions,
  };
}

/**
 * Convert store drafted player to tier-specific input
 *
 * Story 10.5: Handles string tier conversion to PlayerTier enum
 * for consistent tier-specific inflation calculations
 */
function toTierDraftedPlayer(player: InflationDraftedPlayer): TierDraftedPlayerInput {
  let tier: PlayerTier | undefined;

  if (player.tier) {
    // Convert string tier to PlayerTier enum
    const tierUpper = typeof player.tier === 'string' ? player.tier.toUpperCase() : player.tier;
    if (tierUpper === 'ELITE' || tierUpper === 'MID' || tierUpper === 'LOWER') {
      tier = tierUpper as PlayerTier;
    } else if (typeof player.tier !== 'string') {
      // Already a PlayerTier enum
      tier = player.tier;
    }
  }

  return {
    playerId: player.playerId,
    auctionPrice: player.auctionPrice,
    tier,
  };
}

/**
 * Convert store projection to tier-specific input
 */
function toTierProjection(projection: InflationProjection): TierProjectionInput {
  let tier: PlayerTier | undefined;

  if (projection.tier) {
    const tierUpper = projection.tier.toUpperCase();
    if (tierUpper === 'ELITE' || tierUpper === 'MID' || tierUpper === 'LOWER') {
      tier = tierUpper as PlayerTier;
    }
  }

  return {
    playerId: projection.playerId,
    projectedValue: projection.projectedValue,
    tier,
  };
}

/**
 * Convert store projection to adjusted value input
 */
function toAdjustedValuePlayer(projection: InflationProjection): AdjustedValuePlayerInput {
  let tier: PlayerTier | undefined;

  if (projection.tier) {
    const tierUpper = projection.tier.toUpperCase();
    if (tierUpper === 'ELITE' || tierUpper === 'MID' || tierUpper === 'LOWER') {
      tier = tierUpper as PlayerTier;
    }
  }

  let position: Position | undefined;
  let positions: Position[] | undefined;

  if (projection.positions && projection.positions.length > 0) {
    positions = projection.positions as Position[];
    position = positions[0];
  } else if (projection.position) {
    position = projection.position as Position;
  }

  return {
    playerId: projection.playerId,
    projectedValue: projection.projectedValue,
    position,
    positions,
    tier,
  };
}

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Serialized state type for persistence
 * Story: 10.7 - Custom serialization for Map type
 */
interface PersistedInflationState {
  overallRate: number;
  positionRates: PositionInflationRate;
  tierRates: TierInflationRate;
  budgetDepleted: number;
  playersRemaining: number;
  adjustedValues: [string, number][]; // Map serialized as array of entries
  lastUpdated: string | null; // Date serialized as ISO string
}

/**
 * Inflation store with Zustand + Persist
 *
 * Story: 10.7 - Added persist middleware for localStorage persistence
 *
 * @example
 * ```typescript
 * const {
 *   overallRate,
 *   positionRates,
 *   adjustedValues,
 *   updateInflation,
 *   resetInflation
 * } = useInflationStore();
 *
 * // Update after each draft pick
 * useEffect(() => {
 *   updateInflation(draftedPlayers, projections, budgetContext);
 * }, [draftedPlayers]);
 *
 * // Get adjusted value for a player
 * const adjustedValue = adjustedValues.get(playerId) ?? 0;
 * ```
 */
export const useInflationStore = create<InflationStore>()(
  persist(
    set => ({
      // Initial state
      ...initialState,

      // Actions
      updateInflation: (draftedPlayers, projections, budgetContext) => {
        set({ isCalculating: true, error: null });

        try {
          // Convert inputs to calculation-specific formats
          const basicDrafted = draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.auctionPrice,
          }));
          const basicProjections = projections.map(p => ({
            playerId: p.playerId,
            projectedValue: p.projectedValue,
          }));

          // Calculate overall inflation
          const overallRate = calculateOverallInflation(basicDrafted, basicProjections);

          // Calculate position-specific inflation
          const positionDrafted = draftedPlayers.map(toPositionDraftedPlayer);
          const positionProjections = projections.map(toPositionProjection);
          const positionRates = calculatePositionInflation(positionDrafted, positionProjections);

          // Calculate tier-specific inflation
          const tierDrafted = draftedPlayers.map(toTierDraftedPlayer);
          const tierProjections = projections.map(toTierProjection);
          const tierRates = calculateTierInflation(tierDrafted, tierProjections);

          // Calculate budget depletion if context provided
          let budgetDepletion: BudgetDepletionResult | null = null;
          let budgetDepleted = 0;
          if (budgetContext) {
            budgetDepletion = calculateBudgetDepletionFactor(
              budgetContext.totalBudget,
              budgetContext.spent,
              budgetContext.slotsRemaining,
              budgetContext.totalRosterSpots
            );
            // Calculate budgetDepleted as percentage (0.0-1.0)
            budgetDepleted =
              budgetContext.totalBudget > 0 ? budgetContext.spent / budgetContext.totalBudget : 0;
          }

          // Calculate adjusted values for undrafted players
          const draftedPlayerIds = new Set(draftedPlayers.map(p => p.playerId));
          const undraftedProjections = projections
            .filter(p => !draftedPlayerIds.has(p.playerId))
            .map(toAdjustedValuePlayer);

          const adjustedValues = calculateAdjustedValues(undraftedProjections, {
            positionRates,
            tierRates,
            budgetDepletionMultiplier: budgetDepletion?.multiplier ?? 1.0,
          });

          // Update state
          set({
            overallRate,
            positionRates,
            tierRates,
            budgetDepleted,
            budgetDepletion,
            playersRemaining: undraftedProjections.length,
            adjustedValues,
            isCalculating: false,
            lastUpdated: new Date(),
            error: null,
          });
        } catch (error) {
          set({
            isCalculating: false,
            error: error instanceof Error ? error.message : 'Inflation calculation failed',
          });
        }
      },

      updateBudgetDepletion: budgetContext => {
        try {
          const budgetDepletion = calculateBudgetDepletionFactor(
            budgetContext.totalBudget,
            budgetContext.spent,
            budgetContext.slotsRemaining,
            budgetContext.totalRosterSpots
          );

          // Calculate budgetDepleted as percentage (0.0-1.0)
          const budgetDepleted =
            budgetContext.totalBudget > 0 ? budgetContext.spent / budgetContext.totalBudget : 0;

          set({
            budgetDepleted,
            budgetDepletion,
            lastUpdated: new Date(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Budget depletion calculation failed',
          });
        }
      },

      resetInflation: () => {
        set({
          ...initialState,
          positionRates: createDefaultPositionRates(),
          tierRates: createDefaultTierRates(),
          adjustedValues: new Map(),
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'inflation-storage',
      storage: createJSONStorage(() => localStorage),
      // Story 10.7: Custom serialization for Map and Date types
      partialize: state => ({
        overallRate: state.overallRate,
        positionRates: state.positionRates,
        tierRates: state.tierRates,
        budgetDepleted: state.budgetDepleted,
        playersRemaining: state.playersRemaining,
        adjustedValues: Array.from(state.adjustedValues.entries()),
        lastUpdated: state.lastUpdated?.toISOString() ?? null,
      }),
      // Custom merge to restore Map and Date on hydration
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedInflationState | undefined;
        if (!persisted) {
          return currentState;
        }

        return {
          ...currentState,
          overallRate: persisted.overallRate ?? currentState.overallRate,
          positionRates: persisted.positionRates ?? currentState.positionRates,
          tierRates: persisted.tierRates ?? currentState.tierRates,
          budgetDepleted: persisted.budgetDepleted ?? currentState.budgetDepleted,
          playersRemaining: persisted.playersRemaining ?? currentState.playersRemaining,
          adjustedValues: persisted.adjustedValues
            ? new Map(persisted.adjustedValues)
            : currentState.adjustedValues,
          lastUpdated: persisted.lastUpdated ? new Date(persisted.lastUpdated) : null,
        };
      },
    }
  )
);

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Get overall inflation rate
 */
export const useOverallInflation = () => useInflationStore(state => state.overallRate);

/**
 * Get position-specific inflation rates
 */
export const usePositionInflation = () => useInflationStore(state => state.positionRates);

/**
 * Get inflation rate for a specific position
 */
export const usePositionInflationRate = (position: Position) =>
  useInflationStore(state => state.positionRates[position] ?? 0);

/**
 * Get tier-specific inflation rates
 */
export const useTierInflation = () => useInflationStore(state => state.tierRates);

/**
 * Get inflation rate for a specific tier
 */
export const useTierInflationRate = (tier: PlayerTier) =>
  useInflationStore(state => state.tierRates[tier] ?? 0);

/**
 * Get budget depleted percentage (0.0-1.0) - AC-specified field
 */
export const useBudgetDepleted = () => useInflationStore(state => state.budgetDepleted);

/**
 * Get budget depletion data (extended calculation result)
 */
export const useBudgetDepletion = () => useInflationStore(state => state.budgetDepletion);

/**
 * Get adjusted value for a specific player
 */
export const useAdjustedValue = (playerId: string) =>
  useInflationStore(state => state.adjustedValues.get(playerId) ?? 0);

/**
 * Get all adjusted values map
 */
export const useAdjustedValues = () => useInflationStore(state => state.adjustedValues);

/**
 * Get calculation loading state
 */
export const useInflationCalculating = () => useInflationStore(state => state.isCalculating);

/**
 * Get last update timestamp
 */
export const useInflationLastUpdated = () => useInflationStore(state => state.lastUpdated);

/**
 * Get error state
 */
export const useInflationError = () => useInflationStore(state => state.error);

/**
 * Get players remaining count
 */
export const usePlayersRemaining = () => useInflationStore(state => state.playersRemaining);
