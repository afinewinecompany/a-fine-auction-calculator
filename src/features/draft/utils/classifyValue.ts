/**
 * Value Classification Utility
 *
 * Classifies the value of a draft pick based on the difference between
 * actual price paid and adjusted value.
 *
 * Story: 6.6 - Implement Color-Coded Value Indicators
 *
 * Classification Rules:
 * - Steal: Actual price < adjusted value by >10%
 * - Fair: Within ±10% of adjusted value
 * - Overpay: Actual price > adjusted value by >10%
 * - None: Undrafted players (no actual price)
 */

/**
 * Value classification categories for drafted players
 */
export type ValueClassification = 'steal' | 'fair' | 'overpay' | 'none';

/**
 * Background color classes for each classification
 * Uses subtle opacity (20%) for non-intrusive visual cues
 */
export const VALUE_BACKGROUND_COLORS: Record<ValueClassification, string> = {
  steal: 'bg-emerald-900/20',
  fair: 'bg-yellow-900/20',
  overpay: 'bg-red-900/20',
  none: '',
};

/**
 * Text labels for each classification (accessibility requirement)
 */
export const VALUE_LABELS: Record<ValueClassification, string> = {
  steal: 'Steal',
  fair: 'Fair Value',
  overpay: 'Overpay',
  none: '',
};

/**
 * Threshold percentage for classification boundaries
 * Values beyond ±10% are classified as steal or overpay
 */
export const CLASSIFICATION_THRESHOLD = 10;

/**
 * Classifies a draft pick value based on price vs adjusted value
 *
 * @param actualPrice - The price paid for the player (undefined if not drafted)
 * @param adjustedValue - The inflation-adjusted player value
 * @returns Classification category: 'steal' | 'fair' | 'overpay' | 'none'
 *
 * @example
 * ```typescript
 * // Steal: paid $35 for $45 value (22% under)
 * classifyValue(35, 45) // returns 'steal'
 *
 * // Fair: paid $42 for $45 value (7% under)
 * classifyValue(42, 45) // returns 'fair'
 *
 * // Overpay: paid $55 for $45 value (22% over)
 * classifyValue(55, 45) // returns 'overpay'
 *
 * // Undrafted: no price
 * classifyValue(undefined, 45) // returns 'none'
 * ```
 */
export function classifyValue(
  actualPrice: number | undefined,
  adjustedValue: number
): ValueClassification {
  // Undrafted players have no classification
  if (actualPrice === undefined) {
    return 'none';
  }

  // Handle edge case: zero or negative adjusted value
  // Cannot calculate meaningful percentage difference
  if (adjustedValue <= 0) {
    // If they paid anything for a $0 player, it's an overpay
    if (actualPrice > 0) {
      return 'overpay';
    }
    // If both are $0, it's fair
    return 'fair';
  }

  // Calculate percentage difference
  // Positive = overpay, Negative = steal
  const difference = actualPrice - adjustedValue;
  const percentDiff = (difference / adjustedValue) * 100;

  // Classify based on threshold
  if (percentDiff < -CLASSIFICATION_THRESHOLD) {
    return 'steal';
  }
  if (percentDiff > CLASSIFICATION_THRESHOLD) {
    return 'overpay';
  }
  return 'fair';
}

/**
 * Get the background color class for a value classification
 *
 * @param classification - The value classification
 * @returns Tailwind CSS class for background color
 */
export function getValueBackgroundColor(classification: ValueClassification): string {
  return VALUE_BACKGROUND_COLORS[classification];
}

/**
 * Get the text label for a value classification
 *
 * @param classification - The value classification
 * @returns Human-readable label for accessibility
 */
export function getValueLabel(classification: ValueClassification): string {
  return VALUE_LABELS[classification];
}

/**
 * Calculate the percentage difference between actual price and adjusted value
 *
 * @param actualPrice - The price paid for the player
 * @param adjustedValue - The inflation-adjusted player value
 * @returns Percentage difference (positive = overpay, negative = steal)
 */
export function calculatePercentDiff(actualPrice: number, adjustedValue: number): number {
  if (adjustedValue <= 0) {
    return actualPrice > 0 ? 100 : 0;
  }
  return ((actualPrice - adjustedValue) / adjustedValue) * 100;
}

/**
 * Get the row background class for a player based on their draft value
 *
 * Convenience function that combines classifyValue and getValueBackgroundColor
 * for use in table row styling.
 *
 * @param actualPrice - The price paid for the player (undefined if not drafted)
 * @param adjustedValue - The inflation-adjusted player value
 * @returns Tailwind CSS class for row background
 *
 * @example
 * ```typescript
 * const bgClass = getValueRowBackground(35, 45); // 'bg-emerald-900/20' (steal)
 * const bgClass = getValueRowBackground(undefined, 45); // '' (undrafted)
 * ```
 */
export function getValueRowBackground(
  actualPrice: number | undefined,
  adjustedValue: number
): string {
  const classification = classifyValue(actualPrice, adjustedValue);
  return getValueBackgroundColor(classification);
}
