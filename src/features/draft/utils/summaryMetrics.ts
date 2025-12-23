/**
 * Summary Metrics Utility
 *
 * Calculates competitive advantage summary metrics from steals and overpays.
 * Provides data for the CompetitiveAdvantageSummary component.
 *
 * Story: 12.5 - Show Competitive Advantage Summary
 */

import type { Steal, Overpay } from './valueAnalysis';

// Re-export types for convenience
export type { Steal, Overpay };

/**
 * Summary metrics for competitive advantage display.
 */
export interface SummaryMetrics {
  /** Number of steals (players acquired below adjusted value) */
  stealsCount: number;
  /** Number of overpays (players acquired above adjusted value) */
  overpaysCount: number;
  /** Net value gained (positive) or lost (negative) */
  netValue: number;
  /** Total value gained from steals */
  totalValueGained: number;
  /** Total value lost from overpays */
  totalValueLost: number;
  /** Whether user has a net gain (positive net value) */
  hasNetGain: boolean;
}

/**
 * Calculate summary metrics from steals and overpays.
 *
 * @param steals - Array of identified steals
 * @param overpays - Array of identified overpays
 * @returns Summary metrics for display
 */
export function calculateSummaryMetrics(steals: Steal[], overpays: Overpay[]): SummaryMetrics {
  const stealsCount = steals.length;
  const overpaysCount = overpays.length;

  const totalValueGained = steals.reduce((sum, steal) => sum + steal.valueGained, 0);
  const totalValueLost = overpays.reduce((sum, overpay) => sum + overpay.valueLost, 0);

  const netValue = totalValueGained - totalValueLost;
  const hasNetGain = netValue > 0;

  return {
    stealsCount,
    overpaysCount,
    netValue,
    totalValueGained,
    totalValueLost,
    hasNetGain,
  };
}
