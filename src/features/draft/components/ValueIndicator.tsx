/**
 * ValueIndicator Component
 *
 * Displays a color-coded indicator for draft pick value classification.
 * Shows steal (green), fair value (yellow), or overpay (red) based on
 * the difference between actual price and adjusted value.
 *
 * Story: 6.6 - Implement Color-Coded Value Indicators
 *
 * Accessibility:
 * - Colors are paired with text labels (not color-only)
 * - ARIA labels provide full context for screen readers
 * - Sufficient color contrast on dark backgrounds
 *
 * @example
 * ```tsx
 * // Drafted player - shows classification
 * <ValueIndicator actualPrice={35} adjustedValue={45} />
 *
 * // Undrafted player - shows nothing
 * <ValueIndicator actualPrice={undefined} adjustedValue={45} />
 * ```
 */

import { cn } from '@/components/ui/utils';
import {
  classifyValue,
  getValueLabel,
  calculatePercentDiff,
  type ValueClassification,
} from '../utils/classifyValue';
import { formatCurrency } from '../utils/formatCurrency';

// Re-export for backwards compatibility (function moved to classifyValue.ts)
export { getValueRowBackground } from '../utils/classifyValue';

export interface ValueIndicatorProps {
  /** The price paid for the player (undefined if not drafted) */
  actualPrice: number | undefined;
  /** The inflation-adjusted player value */
  adjustedValue: number;
  /** Whether to show the price comparison (e.g., "$35 (adj: $45)") */
  showPriceComparison?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Text color classes for each classification
 * Provides good contrast on dark backgrounds
 */
const VALUE_TEXT_COLORS: Record<ValueClassification, string> = {
  steal: 'text-emerald-400',
  fair: 'text-yellow-400',
  overpay: 'text-red-400',
  none: '',
};

/**
 * ValueIndicator component for showing draft pick value assessment
 */
export function ValueIndicator({
  actualPrice,
  adjustedValue,
  showPriceComparison = false,
  className,
}: ValueIndicatorProps) {
  const classification = classifyValue(actualPrice, adjustedValue);

  // Don't render anything for undrafted players (no price)
  // Early return with type guard: actualPrice is undefined when classification is 'none'
  if (classification === 'none' || actualPrice === undefined) {
    return null;
  }

  // At this point TypeScript knows actualPrice is a number (not undefined)
  const label = getValueLabel(classification);
  const textColor = VALUE_TEXT_COLORS[classification];
  const percentDiff = calculatePercentDiff(actualPrice, adjustedValue);
  const percentLabel = Math.abs(Math.round(percentDiff));

  // Format the aria-label for screen readers
  const ariaLabel = `${label}: paid ${formatCurrency(actualPrice)} for ${formatCurrency(adjustedValue)} value (${percentLabel}% ${percentDiff < 0 ? 'under' : 'over'})`;

  return (
    <div className={cn('flex items-center gap-2', className)} role="status" aria-label={ariaLabel}>
      {/* Classification badge */}
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
          textColor
        )}
        data-testid="value-indicator-label"
      >
        {label}
      </span>

      {/* Price comparison (optional) */}
      {showPriceComparison && (
        <span className="text-xs text-slate-400" data-testid="value-indicator-comparison">
          {formatCurrency(actualPrice)} (adj: {formatCurrency(adjustedValue)})
        </span>
      )}
    </div>
  );
}

export default ValueIndicator;
