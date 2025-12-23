/**
 * Inflation Calculations
 *
 * Core inflation calculation algorithms for the auction draft system.
 * Calculates overall inflation rate based on actual vs. projected spending.
 *
 * Story: 5.2 - Implement Basic Inflation Calculation
 * Story: 5.3 - Implement Position-Specific Inflation Tracking
 * Story: 5.5 - Implement Budget Depletion Modeling
 * Story: 10.5 - Maintain Inflation Calculation Accuracy in Manual Mode
 *
 * ## Manual Entry Accuracy Guarantee (Story 10.5)
 *
 * **IMPORTANT FOR DEVELOPERS:**
 * These calculation functions are designed to be source-agnostic. They treat
 * all drafted player entries identically regardless of whether they came from:
 * - Auto sync (Couch Managers API)
 * - Manual entry (user input during connection failures)
 *
 * **Data Normalization Requirements:**
 * All drafted player inputs MUST include these fields for accurate calculations:
 * - `playerId`: Unique player identifier
 * - `auctionPrice`: Actual bid/purchase price (number)
 * - `position`: Player position (for position-specific inflation)
 * - `tier`: Player tier ELITE/MID/LOWER (for tier-specific inflation)
 *
 * **DO NOT modify calculations to differentiate between entry sources.**
 * The `isManualEntry` flag exists ONLY for tracking/analytics purposes.
 * It MUST NOT be used in any calculation logic.
 *
 * **NFR-R5 Compliance:**
 * Manual Sync Mode must provide equivalent functionality with no degradation
 * in inflation calculation accuracy. Tests in `manualEntryAccuracy.test.ts`
 * validate this guarantee using 0.01% tolerance for floating point comparison.
 *
 * @module inflationCalculations
 */

// Re-export input types from centralized types file
export type { DraftedPlayerInput, ProjectionInput } from '../types/inflation.types';

// Import types for internal use
import type {
  DraftedPlayerInput,
  ProjectionInput,
  Position,
  PositionInflationRate,
  TierInflationRate,
} from '../types/inflation.types';
import {
  POSITIONS,
  isPosition,
  createDefaultPositionRates,
  createDefaultTierRates,
  PlayerTier,
  PLAYER_TIERS,
} from '../types/inflation.types';

// ============================================================================
// Position-Specific Input Types
// ============================================================================

/**
 * Extended input interface for a drafted player that includes position information.
 * Used by calculatePositionInflation for position-specific calculations.
 *
 * @remarks
 * - positions array can contain multiple positions for multi-position players
 * - Value is split equally across all eligible positions
 */
export interface PositionDraftedPlayerInput extends DraftedPlayerInput {
  positions: Position[];
}

/**
 * Extended input interface for a projection that includes position information.
 * Used by calculatePositionInflation for position-specific calculations.
 */
export interface PositionProjectionInput extends ProjectionInput {
  positions: Position[];
}

// ============================================================================
// Core Inflation Calculation
// ============================================================================

/**
 * Calculates the overall inflation rate based on actual spending vs. projected values.
 *
 * The inflation rate formula is:
 * ```
 * inflationRate = (totalActualSpent - totalProjectedSpent) / totalProjectedSpent
 * ```
 *
 * A positive rate indicates inflation (players selling above projected value).
 * A negative rate indicates deflation (players selling below projected value).
 *
 * @param draftedPlayers - Array of drafted players with their auction prices
 * @param projections - Array of player projections with their projected values
 *
 * @returns The inflation rate as a decimal (e.g., 0.15 = 15% inflation).
 *          Returns 0 in the following edge cases:
 *          - Empty draftedPlayers array (no data to calculate)
 *          - Total projected value is zero or negative (cannot divide)
 *          Note: A return value of 0 may indicate either "no inflation" OR
 *          "unable to calculate" - callers should validate input data if
 *          distinction is needed.
 *
 * @remarks
 * - Players with missing projections are treated as having $0 projected value
 * - Null projected values are treated as $0
 * - Negative auction prices will trigger a console warning but are included
 *   in calculations (they represent invalid data that should be fixed upstream)
 * - This function never throws; all edge cases return 0
 *
 * @example
 * ```typescript
 * const draftedPlayers = [
 *   { playerId: 'p1', auctionPrice: 30 },
 *   { playerId: 'p2', auctionPrice: 25 }
 * ];
 * const projections = [
 *   { playerId: 'p1', projectedValue: 25 },
 *   { playerId: 'p2', projectedValue: 20 }
 * ];
 * const rate = calculateOverallInflation(draftedPlayers, projections);
 * // rate = (55 - 45) / 45 ≈ 0.222 (22.2% inflation)
 * ```
 *
 * @performance Optimized for O(n) complexity using Map for projection lookups.
 * Completes in <100ms for 200+ drafted players.
 */
export function calculateOverallInflation(
  draftedPlayers: DraftedPlayerInput[],
  projections: ProjectionInput[]
): number {
  // Edge case: No drafted players means no inflation to calculate
  if (draftedPlayers.length === 0) {
    return 0;
  }

  // Create a Map for O(1) projection lookups instead of O(n) array.find()
  // This significantly improves performance for large player sets
  const projectionMap = new Map<string, number>();
  for (const projection of projections) {
    // Treat null projected values as 0
    const value = projection.projectedValue ?? 0;
    projectionMap.set(projection.playerId, value);
  }

  // Calculate totals in a single pass through drafted players
  let totalActualSpent = 0;
  let totalProjectedSpent = 0;
  let hasInvalidData = false;

  for (const player of draftedPlayers) {
    // Validate auction price - negative values indicate data quality issues
    if (player.auctionPrice < 0) {
      hasInvalidData = true;
    }

    totalActualSpent += player.auctionPrice;

    // Get projected value from map, default to 0 if player has no projection
    const projectedValue = projectionMap.get(player.playerId) ?? 0;
    totalProjectedSpent += projectedValue;
  }

  // Log warning for invalid data (negative prices) - helps identify upstream issues
  if (hasInvalidData) {
    console.warn(
      '[inflationCalculations] Negative auction price detected. ' +
        'This may indicate data quality issues that should be fixed upstream.'
    );
  }

  // Edge case: Division by zero or negative projected value
  // Return 0 to avoid infinity or nonsensical results
  if (totalProjectedSpent <= 0) {
    return 0;
  }

  // Calculate inflation rate: (actual - projected) / projected
  const inflationRate = (totalActualSpent - totalProjectedSpent) / totalProjectedSpent;

  return inflationRate;
}

// ============================================================================
// Position-Specific Inflation Calculation
// ============================================================================

/**
 * Calculates inflation rates independently for each position.
 *
 * This function computes position-specific inflation by:
 * 1. Grouping drafted players by position
 * 2. Calculating inflation for each position independently
 * 3. Handling multi-position players by splitting value across eligible positions
 *
 * The inflation rate formula per position is:
 * ```
 * positionInflation = (totalActualAtPosition - totalProjectedAtPosition) / totalProjectedAtPosition
 * ```
 *
 * @param draftedPlayers - Array of drafted players with positions and auction prices
 * @param projections - Array of player projections with positions and projected values
 *
 * @returns A PositionInflationRate object mapping each position to its inflation rate.
 *          Positions with no drafted players return 0% inflation.
 *
 * @remarks
 * - Multi-position players have their value split equally across all eligible positions
 * - Invalid positions (not in POSITIONS array) are ignored
 * - Players with empty positions array are ignored
 * - Null projected values are treated as $0
 * - Each position's inflation is calculated independently (OF inflation doesn't affect SS)
 *
 * @example
 * ```typescript
 * const draftedPlayers = [
 *   { playerId: 'p1', auctionPrice: 30, positions: ['SS'] },
 *   { playerId: 'p2', auctionPrice: 20, positions: ['2B', 'SS'] }, // Multi-position
 * ];
 * const projections = [
 *   { playerId: 'p1', projectedValue: 25, positions: ['SS'] },
 *   { playerId: 'p2', projectedValue: 16, positions: ['2B', 'SS'] },
 * ];
 * const rates = calculatePositionInflation(draftedPlayers, projections);
 * // SS: (30 + 10) / (25 + 8) - 1 = 21.2%
 * // 2B: (10) / (8) - 1 = 25%
 * ```
 *
 * @performance Optimized for O(n) complexity. Completes in <100ms for 300+ players.
 */
export function calculatePositionInflation(
  draftedPlayers: PositionDraftedPlayerInput[],
  projections: PositionProjectionInput[]
): PositionInflationRate {
  // Initialize result with all positions set to 0
  const result = createDefaultPositionRates();

  // Edge case: No drafted players means no inflation to calculate
  if (draftedPlayers.length === 0) {
    return result;
  }

  // Create a Map for O(1) projection lookups
  const projectionMap = new Map<string, PositionProjectionInput>();
  for (const projection of projections) {
    projectionMap.set(projection.playerId, projection);
  }

  // Track actual and projected totals per position
  const positionActuals: Record<Position, number> = {} as Record<Position, number>;
  const positionProjected: Record<Position, number> = {} as Record<Position, number>;

  // Initialize all positions to 0
  for (const position of POSITIONS) {
    positionActuals[position] = 0;
    positionProjected[position] = 0;
  }

  // Process each drafted player
  for (const player of draftedPlayers) {
    // Filter to only valid positions
    const validPositions = player.positions.filter(isPosition);

    // Skip players with no valid positions
    if (validPositions.length === 0) {
      continue;
    }

    // Get projection for this player
    const projection = projectionMap.get(player.playerId);
    const projectedValue = projection?.projectedValue ?? 0;

    // Split value equally across all eligible positions
    const valuePerPosition = player.auctionPrice / validPositions.length;
    const projectedPerPosition = projectedValue / validPositions.length;

    // Add to each position's totals
    for (const position of validPositions) {
      positionActuals[position] += valuePerPosition;
      positionProjected[position] += projectedPerPosition;
    }
  }

  // Calculate inflation rate for each position
  for (const position of POSITIONS) {
    const actual = positionActuals[position];
    const projected = positionProjected[position];

    // Avoid division by zero - return 0 if no projected value
    if (projected <= 0) {
      // Warn if there's actual spending but no projected value - likely data quality issue
      if (actual > 0) {
        console.warn(
          `[inflationCalculations] Position ${position} has $${actual.toFixed(2)} actual spending ` +
            `but $0 projected value. This may indicate missing projection data.`
        );
      }
      result[position] = 0;
    } else {
      result[position] = (actual - projected) / projected;
    }
  }

  return result;
}

// ============================================================================
// Tier-Specific Inflation Calculation
// ============================================================================

/**
 * Input interface for a drafted player that includes tier information.
 * Used by calculateTierInflation for tier-specific calculations.
 */
export interface TierDraftedPlayerInput extends DraftedPlayerInput {
  /**
   * The player's tier assignment (ELITE, MID, or LOWER).
   * If not provided, use assignPlayerTier() to calculate it.
   */
  tier?: PlayerTier;
}

/**
 * Input interface for a projection that includes projected value.
 * Used by tier assignment and tier inflation calculations.
 */
export interface TierProjectionInput extends ProjectionInput {
  /**
   * Optional pre-calculated tier assignment.
   */
  tier?: PlayerTier;
}

/**
 * Calculates the percentile rank of a value within a sorted array.
 *
 * Uses the "percentage of values below" method:
 * percentile = (number of values below the target) / (total values) * 100
 *
 * @param value - The value to find the percentile for
 * @param sortedValues - Array of values sorted in descending order (highest first)
 * @returns The percentile rank (0-100), where 0 is the highest value
 *
 * @example
 * ```typescript
 * const values = [100, 80, 60, 40, 20]; // Already sorted descending
 * getPercentile(100, values); // Returns 0 (top 0%)
 * getPercentile(60, values);  // Returns 40 (top 40%)
 * getPercentile(20, values);  // Returns 80 (top 80%)
 * ```
 */
export function getPercentile(value: number, sortedValues: number[]): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  // Count how many values are strictly greater than the target value
  // Since array is sorted descending, we count from the start until we find a value <= target
  let countAbove = 0;
  for (const v of sortedValues) {
    if (v > value) {
      countAbove++;
    } else {
      break;
    }
  }

  // Percentile = percentage of values above this one
  return (countAbove / sortedValues.length) * 100;
}

/**
 * Assigns a player to a tier (ELITE, MID, or LOWER) based on their projected value
 * relative to all other players in the projection pool.
 *
 * Tier assignments follow percentile thresholds:
 * - **ELITE**: Top 10% of projected values (percentile 0-10)
 * - **MID**: Next 30% (percentile 10-40)
 * - **LOWER**: Bottom 60% (percentile 40+)
 *
 * This tiering system models the "run on bank" theory from fantasy auction drafts:
 * - Elite players have limited demand (only wealthy teams can compete)
 * - Mid-tier players attract the most competitive bidding
 * - Lower-tier players often deflate as teams preserve budget
 *
 * @param projectedValue - The player's projected dollar value
 * @param allProjections - Array of all player projections in the pool
 * @returns The player's tier assignment (ELITE, MID, or LOWER)
 *
 * @remarks
 * - Null projected values in allProjections are treated as 0
 * - Empty projections array assigns player to LOWER tier
 * - Equal projected values receive the same tier (ties go to the higher tier)
 *
 * @example
 * ```typescript
 * const projections = [
 *   { playerId: 'p1', projectedValue: 50 },
 *   { playerId: 'p2', projectedValue: 40 },
 *   { playerId: 'p3', projectedValue: 30 },
 *   // ... more players
 * ];
 * assignPlayerTier(50, projections); // ELITE (top 10%)
 * assignPlayerTier(35, projections); // MID (10-40%)
 * assignPlayerTier(10, projections); // LOWER (40%+)
 * ```
 *
 * @see {@link https://www.fangraphs.com/fantasy/auction-inflation-and-the-run-on-bank-theory/|Run on Bank Theory}
 */
export function assignPlayerTier(
  projectedValue: number,
  allProjections: TierProjectionInput[]
): PlayerTier {
  // Edge case: No projections means we can't calculate percentile
  if (allProjections.length === 0) {
    return PlayerTier.LOWER;
  }

  // Extract and sort all projected values in descending order (highest first)
  const sortedValues = allProjections.map(p => p.projectedValue ?? 0).sort((a, b) => b - a);

  // Calculate the player's percentile (0 = highest, 100 = lowest)
  const percentile = getPercentile(projectedValue, sortedValues);

  // Assign tier based on percentile thresholds
  // Top 10% = ELITE, 10-40% = MID, 40%+ = LOWER
  if (percentile < 10) {
    return PlayerTier.ELITE;
  }
  if (percentile < 40) {
    return PlayerTier.MID;
  }
  return PlayerTier.LOWER;
}

/**
 * Calculates inflation rates independently for each player tier (ELITE, MID, LOWER).
 *
 * This function models the "run on bank" theory in auction drafts, where different
 * tiers of players experience different inflation pressures:
 *
 * **Run on Bank Theory:**
 * - **Elite players** often have moderate inflation - only a few teams can afford them,
 *   limiting bidding wars. However, their scarcity can drive prices up.
 * - **Mid-tier players** typically experience the HIGHEST inflation - these players
 *   represent the sweet spot where all teams compete aggressively, creating bidding
 *   wars that drive prices well above projected values.
 * - **Lower-tier players** frequently deflate - as budgets deplete and rosters fill,
 *   teams stop competing for these players, often acquiring them at or below value.
 *
 * The inflation rate formula per tier is:
 * ```
 * tierInflation = (totalActualAtTier - totalProjectedAtTier) / totalProjectedAtTier
 * ```
 *
 * @param draftedPlayers - Array of drafted players with auction prices
 * @param projections - Array of all player projections (for tier assignment)
 * @returns A TierInflationRate object mapping each tier to its inflation rate.
 *          Tiers with no drafted players return 0% inflation.
 *
 * @remarks
 * - If drafted players don't have tier assignments, they are calculated automatically
 * - Each tier's inflation is calculated independently (ELITE inflation doesn't affect MID)
 * - Null projected values are treated as $0
 * - Performance: O(n log n) due to sorting for percentile calculation, but still <100ms for 300+ players
 *
 * @example
 * ```typescript
 * const draftedPlayers = [
 *   { playerId: 'p1', auctionPrice: 55 }, // Elite player bought for $55
 *   { playerId: 'p2', auctionPrice: 28 }, // Mid player bought for $28
 *   { playerId: 'p3', auctionPrice: 8 },  // Lower player bought for $8
 * ];
 * const projections = [
 *   { playerId: 'p1', projectedValue: 50 },
 *   { playerId: 'p2', projectedValue: 22 },
 *   { playerId: 'p3', projectedValue: 10 },
 *   // ... more players for tier calculation
 * ];
 * const rates = calculateTierInflation(draftedPlayers, projections);
 * // rates = { ELITE: 0.10, MID: 0.27, LOWER: -0.20 }
 * // Elite: 10% inflation, Mid: 27% inflation, Lower: 20% deflation
 * ```
 *
 * @performance Optimized for O(n log n) complexity. Completes in <100ms for 300+ players.
 *
 * @see {@link assignPlayerTier} for tier assignment logic
 * @see {@link https://www.fangraphs.com/fantasy/auction-inflation-and-the-run-on-bank-theory/|Run on Bank Theory}
 */
export function calculateTierInflation(
  draftedPlayers: TierDraftedPlayerInput[],
  projections: TierProjectionInput[]
): TierInflationRate {
  // Initialize result with all tiers set to 0
  const result = createDefaultTierRates();

  // Edge case: No drafted players means no inflation to calculate
  if (draftedPlayers.length === 0) {
    return result;
  }

  // Create a Map for O(1) projection lookups
  const projectionMap = new Map<string, TierProjectionInput>();
  for (const projection of projections) {
    projectionMap.set(projection.playerId, projection);
  }

  // Pre-calculate sorted values for tier assignment (only once)
  const sortedValues = projections.map(p => p.projectedValue ?? 0).sort((a, b) => b - a);

  // Track actual and projected totals per tier
  const tierActuals: Record<PlayerTier, number> = {
    [PlayerTier.ELITE]: 0,
    [PlayerTier.MID]: 0,
    [PlayerTier.LOWER]: 0,
  };
  const tierProjected: Record<PlayerTier, number> = {
    [PlayerTier.ELITE]: 0,
    [PlayerTier.MID]: 0,
    [PlayerTier.LOWER]: 0,
  };

  // Process each drafted player
  for (const player of draftedPlayers) {
    // Get projection for this player
    const projection = projectionMap.get(player.playerId);
    const projectedValue = projection?.projectedValue ?? 0;

    // Determine tier: use pre-assigned tier or calculate it
    let tier: PlayerTier;
    if (player.tier) {
      tier = player.tier;
    } else if (projection?.tier) {
      tier = projection.tier;
    } else {
      // Calculate tier based on percentile
      const percentile = getPercentile(projectedValue, sortedValues);
      if (percentile < 10) {
        tier = PlayerTier.ELITE;
      } else if (percentile < 40) {
        tier = PlayerTier.MID;
      } else {
        tier = PlayerTier.LOWER;
      }
    }

    // Add to tier totals
    tierActuals[tier] += player.auctionPrice;
    tierProjected[tier] += projectedValue;
  }

  // Calculate inflation rate for each tier
  for (const tier of PLAYER_TIERS) {
    const actual = tierActuals[tier];
    const projected = tierProjected[tier];

    // Avoid division by zero - return 0 if no projected value
    if (projected <= 0) {
      result[tier] = 0;
    } else {
      result[tier] = (actual - projected) / projected;
    }
  }

  return result;
}

// ============================================================================
// Budget Depletion Modeling
// ============================================================================

/**
 * Minimum multiplier bound to prevent extreme deflation.
 * Ensures players always have some value even in depleted-budget scenarios.
 */
export const BUDGET_DEPLETION_MIN_MULTIPLIER = 0.1;

/**
 * Maximum multiplier bound to prevent extreme inflation.
 * Caps the multiplier during early-draft scenarios with excess money.
 */
export const BUDGET_DEPLETION_MAX_MULTIPLIER = 2.0;

/**
 * Result of budget depletion factor calculation.
 * Contains the multiplier and contextual information about budget state.
 */
export interface BudgetDepletionResult {
  /**
   * The depletion multiplier (0.1 to 2.0).
   * Values near 1.0 indicate balanced spending.
   * Values < 1.0 indicate budget depletion (values should decrease).
   * Values > 1.0 indicate excess budget (values should increase).
   */
  multiplier: number;

  /**
   * Amount of budget already spent.
   */
  spent: number;

  /**
   * Remaining budget available.
   */
  remaining: number;

  /**
   * Number of roster slots still to be filled.
   */
  slotsRemaining: number;
}

/**
 * Calculates the budget depletion factor that adjusts player values based on
 * remaining budget and roster slots in the draft.
 *
 * @param totalBudget - The total league budget (sum of all teams' budgets)
 * @param spent - Amount of budget already spent
 * @param slotsRemaining - Number of roster slots still to be filled
 * @param totalRosterSpots - Total roster slots to fill across all teams
 *
 * @returns BudgetDepletionResult with multiplier and contextual data
 *
 * @performance Executes in <1ms with O(1) complexity.
 */
export function calculateBudgetDepletionFactor(
  totalBudget: number,
  spent: number,
  slotsRemaining: number,
  totalRosterSpots: number
): BudgetDepletionResult {
  // Calculate derived values
  const budgetRemaining = totalBudget - spent;

  // Edge case: No total budget or no roster spots
  if (totalBudget <= 0 || totalRosterSpots <= 0) {
    return {
      multiplier: 1.0,
      spent,
      remaining: budgetRemaining,
      slotsRemaining,
    };
  }

  // Edge case: End of draft (no slots remaining)
  if (slotsRemaining <= 0) {
    return {
      multiplier: 1.0,
      spent,
      remaining: budgetRemaining,
      slotsRemaining: 0,
    };
  }

  // Edge case: No budget remaining
  if (budgetRemaining <= 0) {
    return {
      multiplier: BUDGET_DEPLETION_MIN_MULTIPLIER,
      spent,
      remaining: 0,
      slotsRemaining,
    };
  }

  // Calculate average budget per slot (baseline)
  const avgBudgetPerSlot = totalBudget / totalRosterSpots;

  // Calculate current budget per remaining slot
  const currentBudgetPerSlot = budgetRemaining / slotsRemaining;

  // Calculate the depletion multiplier
  let multiplier = currentBudgetPerSlot / avgBudgetPerSlot;

  // Apply bounds to prevent extreme values
  multiplier = Math.max(BUDGET_DEPLETION_MIN_MULTIPLIER, multiplier);
  multiplier = Math.min(BUDGET_DEPLETION_MAX_MULTIPLIER, multiplier);

  return {
    multiplier,
    spent,
    remaining: budgetRemaining,
    slotsRemaining,
  };
}

// ============================================================================
// Dynamic Adjusted Player Values
// ============================================================================

/**
 * Input interface for a player with projection and position/tier info.
 * Used by calculateAdjustedValues for dynamic value calculations.
 */
export interface AdjustedValuePlayerInput {
  /**
   * Unique player identifier.
   */
  playerId: string;

  /**
   * Player's projected dollar value.
   */
  projectedValue: number | null;

  /**
   * Player's primary position for position inflation lookup.
   */
  position?: Position;

  /**
   * Player's positions array (multi-position support).
   */
  positions?: Position[];

  /**
   * Player's tier classification.
   */
  tier?: PlayerTier;
}

/**
 * Extended inflation state with budget depletion multiplier.
 * Used when calculating adjusted values.
 */
export interface AdjustedValueInflationState {
  /**
   * Position-specific inflation rates.
   */
  positionRates: PositionInflationRate;

  /**
   * Tier-specific inflation rates.
   */
  tierRates: TierInflationRate;

  /**
   * Budget depletion multiplier (0.1 to 2.0).
   * Applied to all player values.
   */
  budgetDepletionMultiplier: number;
}

/**
 * Calculates inflation-adjusted values for all players.
 *
 * This function combines position inflation, tier inflation, and budget
 * depletion factors to produce adjusted values that reflect real-time
 * market conditions during a draft.
 *
 * **Formula:**
 * ```
 * adjustedValue = projectedValue
 *   * (1 + positionInflation)  // Position scarcity adjustment
 *   * (1 + tierInflation)      // Tier demand adjustment
 *   * budgetDepletionMultiplier // Budget availability adjustment
 * ```
 *
 * @param players - Array of players with projections and position/tier info
 * @param inflationState - Current inflation state with rates and depletion multiplier
 *
 * @returns Map of playerId to adjusted value (rounded to whole dollars)
 *
 * @remarks
 * - Null projected values are treated as $0
 * - Adjusted values are always non-negative (Math.max(0, ...))
 * - Values are rounded to whole dollars
 * - Multi-position players use their first valid position for inflation lookup
 * - Missing tier defaults to MID tier inflation
 * - Performance: O(n) complexity, processes 2000+ players in <2 seconds
 *
 * @performance Optimized for O(n) complexity. Processes 2000+ players in <2 seconds.
 */
export function calculateAdjustedValues(
  players: AdjustedValuePlayerInput[],
  inflationState: AdjustedValueInflationState
): Map<string, number> {
  const result = new Map<string, number>();

  // Extract inflation rates for fast lookup
  const { positionRates, tierRates, budgetDepletionMultiplier } = inflationState;

  // Default multiplier if not provided
  const depletionMultiplier = budgetDepletionMultiplier ?? 1.0;

  for (const player of players) {
    // Handle null projected value
    const projectedValue = player.projectedValue ?? 0;

    // Get position inflation (use first valid position for multi-position players)
    let positionInflation = 0;
    if (player.position && isPosition(player.position)) {
      positionInflation = positionRates[player.position] ?? 0;
    } else if (player.positions && player.positions.length > 0) {
      const validPosition = player.positions.find(isPosition);
      if (validPosition) {
        positionInflation = positionRates[validPosition] ?? 0;
      }
    }

    // Get tier inflation (default to MID tier if not specified)
    let tierInflation = 0;
    if (player.tier) {
      tierInflation = tierRates[player.tier] ?? 0;
    } else {
      tierInflation = tierRates[PlayerTier.MID] ?? 0;
    }

    // Apply the multiplicative formula
    const rawAdjustedValue =
      projectedValue * (1 + positionInflation) * (1 + tierInflation) * depletionMultiplier;

    // Round to whole dollars and ensure non-negative
    const adjustedValue = Math.max(0, Math.round(rawAdjustedValue));

    result.set(player.playerId, adjustedValue);
  }

  return result;
}

/**
 * Calculates a single player's adjusted value.
 *
 * Convenience function for calculating the adjusted value of a single player
 * without creating a full Map.
 *
 * @param player - Player with projection and position/tier info
 * @param inflationState - Current inflation state
 *
 * @returns Adjusted value rounded to whole dollars (never negative)
 */
export function calculateSingleAdjustedValue(
  player: AdjustedValuePlayerInput,
  inflationState: AdjustedValueInflationState
): number {
  const { positionRates, tierRates, budgetDepletionMultiplier } = inflationState;
  const projectedValue = player.projectedValue ?? 0;
  const depletionMultiplier = budgetDepletionMultiplier ?? 1.0;

  // Get position inflation
  let positionInflation = 0;
  if (player.position && isPosition(player.position)) {
    positionInflation = positionRates[player.position] ?? 0;
  } else if (player.positions && player.positions.length > 0) {
    const validPosition = player.positions.find(isPosition);
    if (validPosition) {
      positionInflation = positionRates[validPosition] ?? 0;
    }
  }

  // Get tier inflation (default to MID tier)
  let tierInflation = 0;
  if (player.tier) {
    tierInflation = tierRates[player.tier] ?? 0;
  } else {
    tierInflation = tierRates[PlayerTier.MID] ?? 0;
  }

  // Apply formula
  const rawAdjustedValue =
    projectedValue * (1 + positionInflation) * (1 + tierInflation) * depletionMultiplier;

  return Math.max(0, Math.round(rawAdjustedValue));
}
