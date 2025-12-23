/**
 * Inflation Trend Calculations
 *
 * Utilities for calculating and displaying inflation trend indicators.
 * Determines if inflation is heating up, cooling down, or stable based on
 * recent draft history.
 *
 * Story: 8.4 - Display Inflation Trend Indicators
 */

import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import type { InflationHistoryEntry } from '../types/inflation.types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Direction of inflation trend
 */
export type TrendDirection = 'heating' | 'cooling' | 'stable';

/**
 * Result of trend calculation
 */
export interface TrendResult {
  /** Direction of the trend */
  direction: TrendDirection;
  /** Percentage point change in inflation rate */
  change: number;
  /** Number of picks analyzed in the trend window */
  pickWindow: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default window size for trend calculation (number of picks to look back)
 */
export const DEFAULT_WINDOW_SIZE = 10;

/**
 * Threshold for determining heating/cooling (percentage points)
 * Change >= +2% = heating
 * Change <= -2% = cooling
 * Between -2% and +2% = stable
 */
export const TREND_THRESHOLD = 2;

// ============================================================================
// Trend Calculation
// ============================================================================

/**
 * Calculate inflation trend based on history
 *
 * Compares current inflation rate to the rate from N picks ago.
 * For early draft (< windowSize picks), returns stable trend.
 *
 * @param history - Array of inflation history entries
 * @param currentPick - Current draft pick number
 * @param windowSize - Number of picks to look back (default: 10)
 * @returns Trend result with direction, change, and window size
 *
 * @example
 * ```typescript
 * const trend = calculateInflationTrend(history, 45, 10);
 * // { direction: 'heating', change: 3.5, pickWindow: 10 }
 * ```
 */
export function calculateInflationTrend(
  history: InflationHistoryEntry[],
  currentPick: number,
  windowSize: number = DEFAULT_WINDOW_SIZE
): TrendResult {
  // Not enough history for trend analysis
  if (history.length < 2 || currentPick < windowSize) {
    return {
      direction: 'stable',
      change: 0,
      pickWindow: currentPick,
    };
  }

  // Get current rate (most recent entry)
  const currentEntry = history[history.length - 1];
  const currentRate = currentEntry?.rate ?? 0;

  // Find entry from windowSize picks ago
  // Look for entry where pickNumber is approximately (currentPick - windowSize)
  const targetPick = currentPick - windowSize;
  let previousEntry = history.find(entry => entry.pickNumber === targetPick);

  // If exact pick not found, find closest earlier pick
  if (!previousEntry) {
    const earlierEntries = history.filter(entry => entry.pickNumber <= targetPick);
    if (earlierEntries.length > 0) {
      previousEntry = earlierEntries[earlierEntries.length - 1];
    }
  }

  // If still no previous entry found, use first entry
  if (!previousEntry) {
    previousEntry = history[0];
  }

  const previousRate = previousEntry?.rate ?? 0;
  const change = currentRate - previousRate;
  const actualWindow = currentPick - (previousEntry?.pickNumber ?? 0);

  // Determine direction based on threshold
  let direction: TrendDirection = 'stable';
  if (change >= TREND_THRESHOLD) {
    direction = 'heating';
  } else if (change <= -TREND_THRESHOLD) {
    direction = 'cooling';
  }

  return {
    direction,
    change,
    pickWindow: actualWindow,
  };
}

// ============================================================================
// Display Utilities
// ============================================================================

/**
 * Get the appropriate icon for a trend direction
 *
 * @param direction - Trend direction
 * @returns Lucide icon component
 */
export function getTrendIcon(direction: TrendDirection): LucideIcon {
  switch (direction) {
    case 'heating':
      return TrendingUp;
    case 'cooling':
      return TrendingDown;
    case 'stable':
      return Minus;
  }
}

/**
 * Get the color class for a trend direction
 *
 * @param direction - Trend direction
 * @returns Tailwind color class string
 */
export function getTrendColor(direction: TrendDirection): string {
  switch (direction) {
    case 'heating':
      return 'text-orange-500';
    case 'cooling':
      return 'text-blue-500';
    case 'stable':
      return 'text-slate-400';
  }
}

/**
 * Get the label text for a trend direction
 *
 * @param direction - Trend direction
 * @returns Human-readable label
 */
export function getTrendLabel(direction: TrendDirection): string {
  switch (direction) {
    case 'heating':
      return 'Heating';
    case 'cooling':
      return 'Cooling';
    case 'stable':
      return 'Stable';
  }
}

/**
 * Format tooltip text explaining the trend
 *
 * @param trend - Trend result
 * @returns Formatted tooltip message
 *
 * @example
 * ```typescript
 * formatTrendTooltip({ direction: 'heating', change: 3.5, pickWindow: 10 })
 * // "Inflation has increased 3.5% in the last 10 picks"
 * ```
 */
export function formatTrendTooltip(trend: TrendResult): string {
  const { direction, change, pickWindow } = trend;

  // Early draft - not enough history
  if (pickWindow < DEFAULT_WINDOW_SIZE) {
    return 'Not enough draft history to calculate trend';
  }

  // Format change value
  const absChange = Math.abs(change);
  const changeText = absChange.toFixed(1);

  // Create message based on direction
  if (direction === 'heating') {
    return `Inflation has increased ${changeText}% in the last ${pickWindow} picks`;
  } else if (direction === 'cooling') {
    return `Inflation has decreased ${changeText}% in the last ${pickWindow} picks`;
  } else {
    return `Inflation has changed by ${changeText}% in the last ${pickWindow} picks (stable)`;
  }
}
