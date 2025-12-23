/**
 * ValueDisplay Component
 *
 * Displays adjusted and projected player values with prominent styling
 * for quick 3-second value scans during active bidding.
 *
 * Story: 6.5 - Display Adjusted Values with Prominent Styling
 *
 * Visual hierarchy:
 * - Adjusted value: Large, bold, emerald-400 (visual anchor)
 * - Projected value: Small, slate-400 (secondary comparison)
 *
 * @example
 * ```tsx
 * <ValueDisplay adjustedValue={45} projectedValue={38} />
 * ```
 */

import { formatCurrency } from '../utils/formatCurrency';

// Re-export formatCurrency for backward compatibility
export { formatCurrency } from '../utils/formatCurrency';

export interface ValueDisplayProps {
  /** Inflation-adjusted player value */
  adjustedValue: number;
  /** Original projected player value */
  projectedValue: number;
}

/**
 * ValueDisplay component for showing adjusted and projected values
 * with UX-compliant styling for quick visual scanning.
 */
export function ValueDisplay({ adjustedValue, projectedValue }: ValueDisplayProps) {
  const formattedAdjusted = formatCurrency(adjustedValue);
  const formattedProjected = formatCurrency(projectedValue);

  return (
    <div className="flex flex-col items-end">
      <span
        className="text-xl font-bold text-emerald-400"
        data-testid="adjusted-value"
        aria-label={`Adjusted value: ${formattedAdjusted}`}
      >
        {formattedAdjusted}
      </span>
      <span
        className="text-sm text-slate-400"
        data-testid="projected-value"
        aria-label={`Projected value: ${formattedProjected}`}
      >
        {formattedProjected}
      </span>
    </div>
  );
}

export default ValueDisplay;
