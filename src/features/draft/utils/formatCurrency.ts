/**
 * Currency Formatting Utilities
 *
 * Provides consistent currency formatting across the application.
 * Two functions are available:
 * - formatCurrency: Simple format for player values (no commas)
 * - formatBudget: Locale-aware format for large numbers (with commas)
 *
 * Story: 6.5 - Display Adjusted Values with Prominent Styling
 *
 * @module formatCurrency
 */

/**
 * Format a number as currency with dollar sign prefix.
 * Rounds to whole dollars and converts negative/invalid values to $0.
 * Does NOT include locale formatting (no commas) - optimized for player values.
 *
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "$45")
 *
 * @example
 * ```typescript
 * formatCurrency(45.7)   // "$46"
 * formatCurrency(-5)     // "$0"
 * formatCurrency(NaN)    // "$0"
 * formatCurrency(1050)   // "$1050"
 * ```
 */
export function formatCurrency(value: number): string {
  // Handle NaN and negative values
  if (Number.isNaN(value) || value < 0) {
    return '$0';
  }
  return `$${Math.round(value)}`;
}

/**
 * Format a number as currency with locale formatting (commas for thousands).
 * Suitable for displaying large budget amounts.
 *
 * @param value - The numeric value to format
 * @returns Formatted currency string with locale separators (e.g., "$1,000")
 *
 * @example
 * ```typescript
 * formatBudget(1000)    // "$1,000"
 * formatBudget(260)     // "$260"
 * formatBudget(1500.5)  // "$1,501"
 * ```
 */
export function formatBudget(value: number): string {
  // Handle NaN and negative values
  if (Number.isNaN(value) || value < 0) {
    return '$0';
  }
  return `$${Math.round(value).toLocaleString()}`;
}
