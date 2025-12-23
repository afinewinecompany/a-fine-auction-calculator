/**
 * Inflation Engine Type Definitions
 *
 * This module defines the core TypeScript types for the inflation calculation engine.
 * The inflation engine calculates real-time, tier-specific, position-aware inflation
 * adjustments for all players during live auction drafts.
 *
 * @module inflation.types
 */

// ============================================================================
// Calculation Input Types
// ============================================================================

/**
 * Minimal input interface for a drafted player in inflation calculations.
 * Accepts objects with at least playerId and auctionPrice properties.
 * This allows compatibility with the full DraftedPlayer type from draft.types.ts.
 *
 * @remarks
 * - auctionPrice should be non-negative; negative values will trigger a warning
 * - Used by calculateOverallInflation and related calculation functions
 */
export interface DraftedPlayerInput {
  playerId: string;
  auctionPrice: number;
}

/**
 * Minimal input interface for a player projection in inflation calculations.
 * Accepts objects with at least playerId and projectedValue properties.
 * This allows compatibility with the full PlayerProjection type.
 *
 * @remarks
 * - null projectedValue is treated as 0 in calculations
 * - Used by calculateOverallInflation and related calculation functions
 */
export interface ProjectionInput {
  playerId: string;
  projectedValue: number | null;
}

// ============================================================================
// Base Position and Tier Types
// ============================================================================

/**
 * Baseball positions supported by the auction draft system.
 * Covers all standard fantasy baseball roster positions.
 * UT (Utility) covers DH and flex positions.
 */
export type Position = 'C' | '1B' | '2B' | 'SS' | '3B' | 'OF' | 'SP' | 'RP' | 'UT';

/**
 * All valid positions as a readonly array for iteration and validation.
 */
export const POSITIONS: readonly Position[] = [
  'C',
  '1B',
  '2B',
  'SS',
  '3B',
  'OF',
  'SP',
  'RP',
  'UT',
] as const;

/**
 * Player tiers based on projected value percentiles.
 * Used to calculate tier-specific inflation rates.
 *
 * - ELITE: Top tier players (typically top 10-15% by projected value)
 * - MID: Middle tier players (typically 15-50% by projected value)
 * - LOWER: Lower tier players (typically bottom 50% by projected value)
 */
export enum PlayerTier {
  ELITE = 'ELITE',
  MID = 'MID',
  LOWER = 'LOWER',
}

/**
 * All player tiers as a readonly array for iteration and validation.
 */
export const PLAYER_TIERS: readonly PlayerTier[] = [
  PlayerTier.ELITE,
  PlayerTier.MID,
  PlayerTier.LOWER,
] as const;

/**
 * Type alias for PlayerTier to match AC specification.
 * The AC references `Record<Tier, number>` - this alias provides that interface.
 */
export type Tier = PlayerTier;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid Position.
 *
 * @param value - The value to check
 * @returns True if the value is a valid Position
 *
 * @example
 * ```typescript
 * if (isPosition(playerPosition)) {
 *   // playerPosition is typed as Position
 * }
 * ```
 */
export function isPosition(value: unknown): value is Position {
  return typeof value === 'string' && POSITIONS.includes(value as Position);
}

/**
 * Type guard to check if a value is a valid PlayerTier.
 *
 * @param value - The value to check
 * @returns True if the value is a valid PlayerTier
 *
 * @example
 * ```typescript
 * if (isPlayerTier(tier)) {
 *   // tier is typed as PlayerTier
 * }
 * ```
 */
export function isPlayerTier(value: unknown): value is PlayerTier {
  return typeof value === 'string' && Object.values(PlayerTier).includes(value as PlayerTier);
}

// ============================================================================
// Inflation Rate Types
// ============================================================================

/**
 * Position-specific inflation rates.
 * Maps each position to its current inflation rate as a decimal.
 *
 * A rate of 0.15 means 15% inflation (players at that position are selling
 * for 15% more than their projected value on average).
 *
 * A rate of -0.10 means 10% deflation (players at that position are selling
 * for 10% less than their projected value on average).
 */
export type PositionInflationRate = Record<Position, number>;

/**
 * Tier-specific inflation rates.
 * Maps each player tier to its current inflation rate as a decimal.
 *
 * This allows tracking whether elite players are inflating faster than
 * mid-tier players, enabling more accurate value adjustments.
 */
export type TierInflationRate = Record<PlayerTier, number>;

// ============================================================================
// Core Inflation State
// ============================================================================

/**
 * The complete inflation state during a live draft.
 * This is the primary state object managed by the inflation store.
 */
export interface InflationState {
  /**
   * Overall inflation rate across all positions and tiers.
   * Expressed as a decimal (e.g., 0.12 = 12% inflation).
   */
  overallRate: number;

  /**
   * Inflation rates broken down by position.
   * Allows position-specific value adjustments.
   */
  positionRates: PositionInflationRate;

  /**
   * Inflation rates broken down by player tier.
   * Allows tier-specific value adjustments.
   */
  tierRates: TierInflationRate;

  /**
   * Total budget spent across all teams as a decimal percentage.
   * Range: 0.0 (no budget spent) to 1.0 (all budgets depleted).
   */
  budgetDepleted: number;

  /**
   * Number of players remaining in the player pool.
   * Decrements as players are drafted.
   */
  playersRemaining: number;
}

// ============================================================================
// Extended Inflation Types
// ============================================================================

/**
 * Comprehensive inflation metrics for display and analysis.
 * Extends InflationState with calculated fields and trends.
 */
export interface InflationMetrics {
  /**
   * Current inflation state snapshot.
   */
  state: InflationState;

  /**
   * Historical inflation rates for trend analysis.
   * Each entry is a timestamped inflation rate.
   */
  history: InflationSnapshot[];

  /**
   * Projected inflation rate at draft completion based on current trends.
   */
  projectedFinalRate: number;

  /**
   * Rate of change in inflation (positive = increasing, negative = decreasing).
   * Calculated as the slope of recent inflation history.
   */
  inflationTrend: number;

  /**
   * Number of players drafted so far.
   */
  playersDrafted: number;

  /**
   * Total value overspent (positive) or underspent (negative) in the draft.
   */
  totalVariance: number;
}

/**
 * A point-in-time snapshot of inflation state.
 * Used for tracking inflation history and trends throughout a draft.
 *
 * Snapshots are typically captured:
 * - After each player is drafted (to track inflation progression)
 * - At regular intervals during the draft (e.g., every 5 picks)
 * - When significant inflation rate changes occur (>5% delta)
 *
 * The history of snapshots enables:
 * - Trend analysis (is inflation accelerating or decelerating?)
 * - Post-draft analysis (when did inflation peak?)
 * - Predictive modeling (extrapolating final inflation rates)
 *
 * @example
 * ```typescript
 * const snapshot: InflationSnapshot = {
 *   timestamp: new Date(),
 *   overallRate: 0.15, // 15% inflation
 *   playersDrafted: 45,
 *   budgetDepleted: 0.35 // 35% of total budget spent
 * };
 * ```
 */
export interface InflationSnapshot {
  /**
   * Timestamp when this snapshot was taken.
   * Used for time-series analysis and display formatting.
   */
  timestamp: Date;

  /**
   * Overall inflation rate at this point in time.
   * Expressed as a decimal (e.g., 0.15 = 15% inflation).
   */
  overallRate: number;

  /**
   * Number of players drafted at this point.
   * Useful for correlating inflation with draft progression.
   */
  playersDrafted: number;

  /**
   * Budget depletion percentage at this point.
   * Range: 0.0 (no budget spent) to 1.0 (all budgets depleted).
   */
  budgetDepleted: number;
}

/**
 * Represents a player's value calculations.
 * Used for determining adjusted values based on inflation.
 */
export interface PlayerValue {
  /**
   * Unique player identifier.
   */
  playerId: string;

  /**
   * Player's position for position-specific inflation.
   */
  position: Position;

  /**
   * Player's tier classification.
   */
  tier: PlayerTier;

  /**
   * Original projected dollar value before inflation adjustment.
   */
  baseValue: number;

  /**
   * Value adjusted for overall inflation only.
   */
  inflationAdjustedValue: number;

  /**
   * Value adjusted for position-specific inflation.
   */
  positionAdjustedValue: number;

  /**
   * Value adjusted for tier-specific inflation.
   */
  tierAdjustedValue: number;

  /**
   * Final recommended bid value considering all factors.
   * This is typically the most relevant value for users.
   */
  recommendedBid: number;
}

/**
 * Budget depletion modeling factors.
 * Used to calculate how budget depletion affects inflation.
 */
export interface BudgetDepletionFactor {
  /**
   * Current percentage of total league budget spent (0.0 to 1.0).
   */
  percentSpent: number;

  /**
   * Number of roster slots filled across all teams.
   */
  slotsFilled: number;

  /**
   * Total roster slots available in the league.
   */
  totalSlots: number;

  /**
   * Remaining dollars in the league (sum of all teams' remaining budgets).
   */
  remainingDollars: number;

  /**
   * Remaining projected value of undrafted players.
   */
  remainingValue: number;

  /**
   * Calculated depletion rate modifier for inflation adjustment.
   * Values > 1.0 indicate money is being spent faster than value is being acquired.
   * Values < 1.0 indicate money is being spent slower than value is being acquired.
   */
  depletionModifier: number;
}

// ============================================================================
// Factory Functions for Default State
// ============================================================================

/**
 * Creates a default PositionInflationRate with all positions set to 0.
 *
 * @returns A PositionInflationRate with all values initialized to 0
 */
export function createDefaultPositionRates(): PositionInflationRate {
  return {
    C: 0,
    '1B': 0,
    '2B': 0,
    SS: 0,
    '3B': 0,
    OF: 0,
    SP: 0,
    RP: 0,
    UT: 0,
  };
}

/**
 * Creates a default TierInflationRate with all tiers set to 0.
 *
 * @returns A TierInflationRate with all values initialized to 0
 */
export function createDefaultTierRates(): TierInflationRate {
  return {
    [PlayerTier.ELITE]: 0,
    [PlayerTier.MID]: 0,
    [PlayerTier.LOWER]: 0,
  };
}

/**
 * Creates a default InflationState for a new draft.
 *
 * @param totalPlayers - Total number of players in the draft pool
 * @returns An initialized InflationState
 */
export function createDefaultInflationState(totalPlayers: number): InflationState {
  return {
    overallRate: 0,
    positionRates: createDefaultPositionRates(),
    tierRates: createDefaultTierRates(),
    budgetDepleted: 0,
    playersRemaining: totalPlayers,
  };
}

/**
 * Inflation history entry for trend calculation.
 * Used to track inflation rates over time for trend indicators.
 *
 * Story: 8.4 - Display Inflation Trend Indicators
 *
 * @example
 * ```typescript
 * const entry: InflationHistoryEntry = {
 *   pickNumber: 45,
 *   rate: 12.5, // 12.5% inflation
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface InflationHistoryEntry {
  /**
   * Draft pick number when this entry was recorded.
   * Used to calculate trend windows (e.g., last 10 picks).
   */
  pickNumber: number;

  /**
   * Inflation rate at this point as a percentage.
   * Expressed as a number (e.g., 12.5 for 12.5% inflation).
   */
  rate: number;

  /**
   * Unix timestamp (milliseconds) when this entry was recorded.
   */
  timestamp: number;
}
