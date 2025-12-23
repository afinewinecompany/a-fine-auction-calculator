/**
 * Budget Calculations Utility
 *
 * Provides utilities for calculating spending breakdown and budget analysis.
 * Used in post-draft summary to display budget utilization metrics.
 *
 * Story: 12.3 - Display Total Spending and Budget Utilization
 */

import type { DraftedPlayer } from '../types/roster.types';

/**
 * Position categories for spending breakdown
 */
const HITTER_POSITIONS = ['C', '1B', '2B', 'SS', '3B', 'OF', 'UTIL'];
const PITCHER_POSITIONS = ['SP', 'RP'];
const BENCH_POSITIONS = ['BN'];

/**
 * Spending breakdown by position category
 */
export interface SpendingByPosition {
  hitters: {
    amount: number;
    percentage: number;
  };
  pitchers: {
    amount: number;
    percentage: number;
  };
  bench: {
    amount: number;
    percentage: number;
  };
}

/**
 * Complete spending breakdown result
 */
export interface SpendingBreakdown {
  /** Total amount spent on all players */
  totalSpent: number;
  /** Remaining budget after all picks */
  remaining: number;
  /** Percentage of budget utilized */
  utilizationPercentage: number;
  /** Spending grouped by position category */
  byPosition: SpendingByPosition;
  /** Whether budget is significantly underspent (>$5 remaining) */
  isUnderspent: boolean;
}

/**
 * Calculate spending breakdown from a roster of drafted players.
 * Groups spending by Hitters, Pitchers, and Bench.
 *
 * @param roster - Array of drafted players
 * @param totalBudget - Total auction budget (typically $260)
 * @returns Spending breakdown with totals and percentages
 *
 * @example
 * ```typescript
 * const breakdown = calculateSpendingBreakdown(roster, 260);
 * // {
 * //   totalSpent: 255,
 * //   remaining: 5,
 * //   utilizationPercentage: 98.1,
 * //   byPosition: {
 * //     hitters: { amount: 145, percentage: 56.9 },
 * //     pitchers: { amount: 95, percentage: 37.3 },
 * //     bench: { amount: 15, percentage: 5.9 }
 * //   },
 * //   isUnderspent: false
 * // }
 * ```
 */
export function calculateSpendingBreakdown(
  roster: DraftedPlayer[],
  totalBudget: number
): SpendingBreakdown {
  // Initialize spending totals
  let totalSpent = 0;
  let hittersSpent = 0;
  let pitchersSpent = 0;
  let benchSpent = 0;

  // Calculate spending by position category
  for (const player of roster) {
    const price = player.auctionPrice ?? 0;
    totalSpent += price;

    // Check position category
    if (HITTER_POSITIONS.includes(player.position)) {
      hittersSpent += price;
    } else if (PITCHER_POSITIONS.includes(player.position)) {
      pitchersSpent += price;
    } else if (BENCH_POSITIONS.includes(player.position)) {
      benchSpent += price;
    }
  }

  // Calculate remaining budget
  const remaining = totalBudget - totalSpent;

  // Calculate utilization percentage
  const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Calculate position percentages (based on total budget, not just spent amount)
  const hittersPercentage = totalBudget > 0 ? (hittersSpent / totalBudget) * 100 : 0;
  const pitchersPercentage = totalBudget > 0 ? (pitchersSpent / totalBudget) * 100 : 0;
  const benchPercentage = totalBudget > 0 ? (benchSpent / totalBudget) * 100 : 0;

  // Determine if significantly underspent (more than $5 remaining)
  const isUnderspent = remaining > 5;

  return {
    totalSpent,
    remaining,
    utilizationPercentage,
    byPosition: {
      hitters: {
        amount: hittersSpent,
        percentage: hittersPercentage,
      },
      pitchers: {
        amount: pitchersSpent,
        percentage: pitchersPercentage,
      },
      bench: {
        amount: benchSpent,
        percentage: benchPercentage,
      },
    },
    isUnderspent,
  };
}
