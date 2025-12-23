/**
 * Value Analysis Utility
 *
 * Identifies steals and overpays based on auction price vs adjusted value.
 * A steal is when a player is acquired below their inflation-adjusted value.
 * An overpay is when a player is acquired above their inflation-adjusted value.
 *
 * Story: 12.4 - Highlight Steals with Visual Comparison
 */

import type { DraftedPlayer } from '../types/draft.types';
import type { InflationState } from '@/features/inflation';

/**
 * Threshold configuration for identifying steals and overpays.
 * A player is a steal/overpay if the difference is >10% OR >$3 (whichever is less restrictive).
 */
const VALUE_THRESHOLD_PERCENTAGE = 0.1; // 10%
const VALUE_THRESHOLD_DOLLARS = 3; // $3

/**
 * Steal identified in value analysis.
 */
export interface Steal {
  player: DraftedPlayer;
  auctionPrice: number;
  adjustedValue: number;
  valueGained: number; // Positive value
}

/**
 * Overpay identified in value analysis.
 */
export interface Overpay {
  player: DraftedPlayer;
  auctionPrice: number;
  adjustedValue: number;
  valueLost: number; // Positive value
}

/**
 * Result of steal identification.
 */
export interface StealsResult {
  steals: Steal[];
  totalValueGained: number;
}

/**
 * Result of overpay identification.
 */
export interface OverpaysResult {
  overpays: Overpay[];
  totalValueLost: number;
}

/**
 * Calculate inflation-adjusted value for a player.
 *
 * @param projectedValue - Base projected value before inflation
 * @param inflationRate - Overall inflation rate as decimal (e.g., 0.15 for 15%)
 * @returns Adjusted value after applying inflation
 */
function calculateAdjustedValue(projectedValue: number, inflationRate: number): number {
  return projectedValue * (1 + inflationRate);
}

/**
 * Determine if a value difference is significant enough to classify as steal/overpay.
 *
 * @param difference - Absolute difference between auction price and adjusted value
 * @param adjustedValue - The inflation-adjusted value
 * @returns True if difference meets threshold (>10% OR >$3)
 */
function isSignificantDifference(difference: number, adjustedValue: number): boolean {
  const percentageDifference = difference / Math.max(adjustedValue, 1); // Avoid division by zero
  return percentageDifference > VALUE_THRESHOLD_PERCENTAGE || difference > VALUE_THRESHOLD_DOLLARS;
}

/**
 * Identify steals (players acquired below their adjusted value).
 *
 * @param roster - Array of drafted players
 * @param inflationData - Current inflation state
 * @returns Steals array sorted by value gained (highest first) and total value gained
 */
export function identifySteals(
  roster: DraftedPlayer[],
  inflationData: InflationState
): StealsResult {
  const steals: Steal[] = [];

  for (const player of roster) {
    const adjustedValue = calculateAdjustedValue(player.projectedValue, inflationData.overallRate);
    const difference = adjustedValue - player.purchasePrice; // Positive if steal

    if (difference > 0 && isSignificantDifference(difference, adjustedValue)) {
      steals.push({
        player,
        auctionPrice: player.purchasePrice,
        adjustedValue: Math.round(adjustedValue), // Round to nearest dollar
        valueGained: Math.round(difference),
      });
    }
  }

  // Sort by value gained descending (biggest steals first)
  steals.sort((a, b) => b.valueGained - a.valueGained);

  const totalValueGained = steals.reduce((sum, steal) => sum + steal.valueGained, 0);

  return {
    steals,
    totalValueGained,
  };
}

/**
 * Identify overpays (players acquired above their adjusted value).
 *
 * @param roster - Array of drafted players
 * @param inflationData - Current inflation state
 * @returns Overpays array sorted by value lost (highest first) and total value lost
 */
export function identifyOverpays(
  roster: DraftedPlayer[],
  inflationData: InflationState
): OverpaysResult {
  const overpays: Overpay[] = [];

  for (const player of roster) {
    const adjustedValue = calculateAdjustedValue(player.projectedValue, inflationData.overallRate);
    const difference = player.purchasePrice - adjustedValue; // Positive if overpay

    if (difference > 0 && isSignificantDifference(difference, adjustedValue)) {
      overpays.push({
        player,
        auctionPrice: player.purchasePrice,
        adjustedValue: Math.round(adjustedValue), // Round to nearest dollar
        valueLost: Math.round(difference),
      });
    }
  }

  // Sort by value lost descending (biggest overpays first)
  overpays.sort((a, b) => b.valueLost - a.valueLost);

  const totalValueLost = overpays.reduce((sum, overpay) => sum + overpay.valueLost, 0);

  return {
    overpays,
    totalValueLost,
  };
}
