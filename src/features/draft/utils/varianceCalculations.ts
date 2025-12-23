/**
 * Variance Calculations
 *
 * Utilities for calculating and categorizing variance between actual draft prices
 * and adjusted values. Used to identify steals (good deals) and overpays (bad deals).
 *
 * Story: 8.3 - Display Variance Tracking for Drafted Players
 */

import type { DraftedPlayer } from '../types/draft.types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Threshold for determining steals and overpays (5% variance)
 */
export const VARIANCE_THRESHOLD = 0.05;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Variance category for a drafted player
 */
export type VarianceCategory = 'steal' | 'overpay' | 'fair';

/**
 * Variance information for a single player
 */
export interface PlayerVariance {
  /** Player ID */
  playerId: string;
  /** Player name */
  playerName: string;
  /** Player position */
  position: string;
  /** Actual purchase price */
  purchasePrice: number;
  /** Adjusted value at time of draft */
  adjustedValue: number;
  /** Dollar variance (actual - adjusted) */
  variance: number;
  /** Percentage variance */
  variancePercent: number;
  /** Variance category */
  category: VarianceCategory;
  /** Team that drafted the player (optional) */
  draftedBy?: string;
}

/**
 * Summary of variance across all drafted players
 */
export interface VarianceSummary {
  /** Number of steals (players bought below adjusted value) */
  steals: number;
  /** Number of overpays (players bought above adjusted value) */
  overpays: number;
  /** Number of fair deals */
  fair: number;
  /** Total variance in dollars */
  totalVariance: number;
  /** Average variance percentage */
  avgVariancePercent: number;
  /** List of player variances */
  players: PlayerVariance[];
}

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Calculate variance percentage between actual price and adjusted value.
 *
 * @param actualPrice - The actual purchase price
 * @param adjustedValue - The inflation-adjusted value
 * @returns Variance as a percentage (e.g., 0.15 = 15% overpay)
 *
 * @example
 * ```typescript
 * // Player with $30 value bought for $35 = 16.7% overpay
 * calculateVariancePercent(35, 30); // 0.167
 *
 * // Player with $30 value bought for $25 = 16.7% steal
 * calculateVariancePercent(25, 30); // -0.167
 * ```
 */
export function calculateVariancePercent(actualPrice: number, adjustedValue: number): number {
  // Handle edge case of zero adjusted value
  if (adjustedValue === 0) {
    return actualPrice > 0 ? 1 : 0;
  }

  return (actualPrice - adjustedValue) / adjustedValue;
}

/**
 * Categorize variance as steal, overpay, or fair.
 *
 * @param variancePercent - Variance as a decimal (e.g., 0.15 = 15%)
 * @returns Variance category
 *
 * @example
 * ```typescript
 * categorizeVariance(0.10);  // 'overpay' (10% over)
 * categorizeVariance(-0.10); // 'steal' (10% under)
 * categorizeVariance(0.03);  // 'fair' (within threshold)
 * ```
 */
export function categorizeVariance(variancePercent: number): VarianceCategory {
  if (variancePercent <= -VARIANCE_THRESHOLD) {
    return 'steal';
  }
  if (variancePercent >= VARIANCE_THRESHOLD) {
    return 'overpay';
  }
  return 'fair';
}

/**
 * Calculate variance for a single drafted player.
 *
 * @param player - Drafted player data
 * @param adjustedValue - The inflation-adjusted value for this player
 * @returns Player variance information
 */
export function calculatePlayerVariance(
  player: DraftedPlayer,
  adjustedValue: number
): PlayerVariance {
  const purchasePrice = player.purchasePrice;
  const variance = purchasePrice - adjustedValue;
  const variancePercent = calculateVariancePercent(purchasePrice, adjustedValue);
  const category = categorizeVariance(variancePercent);

  return {
    playerId: player.playerId,
    playerName: player.playerName,
    position: player.position && player.position.length > 0 ? player.position : 'UT',
    purchasePrice,
    adjustedValue,
    variance,
    variancePercent,
    category,
    draftedBy: player.draftedBy,
  };
}

/**
 * Calculate variance summary for all drafted players.
 *
 * @param variances - Array of player variance objects
 * @returns Summary statistics
 */
export function calculateVarianceSummary(variances: PlayerVariance[]): VarianceSummary {
  const steals = variances.filter(v => v.category === 'steal').length;
  const overpays = variances.filter(v => v.category === 'overpay').length;
  const fair = variances.filter(v => v.category === 'fair').length;

  const totalVariance = variances.reduce((sum, v) => sum + v.variance, 0);
  const avgVariancePercent =
    variances.length > 0
      ? variances.reduce((sum, v) => sum + v.variancePercent, 0) / variances.length
      : 0;

  return {
    steals,
    overpays,
    fair,
    totalVariance,
    avgVariancePercent,
    players: variances,
  };
}

// ============================================================================
// Display Utilities
// ============================================================================

/**
 * Format variance percentage for display.
 *
 * @param variancePercent - Variance as a decimal
 * @returns Formatted string (e.g., "+15.0%" or "-8.5%")
 */
export function formatVariancePercent(variancePercent: number): string {
  const percent = variancePercent * 100;
  const prefix = percent > 0 ? '+' : '';
  return `${prefix}${percent.toFixed(1)}%`;
}

/**
 * Get CSS color class for variance category.
 *
 * @param category - Variance category
 * @returns Tailwind color class
 */
export function getVarianceColor(category: VarianceCategory): string {
  switch (category) {
    case 'steal':
      return 'text-emerald-500';
    case 'overpay':
      return 'text-orange-500';
    case 'fair':
      return 'text-slate-400';
  }
}

/**
 * Get background CSS class for variance category.
 *
 * @param category - Variance category
 * @returns Tailwind background class
 */
export function getVarianceBackground(category: VarianceCategory): string {
  switch (category) {
    case 'steal':
      return 'bg-emerald-500/10';
    case 'overpay':
      return 'bg-orange-500/10';
    case 'fair':
      return 'bg-slate-500/10';
  }
}
