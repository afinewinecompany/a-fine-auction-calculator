/**
 * BudgetDisplay Component
 *
 * Displays real-time budget tracking during drafts.
 * Shows remaining, total, and spent amounts with visual emphasis on remaining budget.
 * Includes low budget warning when remaining falls below threshold.
 *
 * Story: 7.2 - Display Real-Time Budget Tracking
 *
 * @example
 * ```tsx
 * <BudgetDisplay total={260} spent={75} remaining={185} />
 * ```
 */

import { memo } from 'react';
import { cn } from '@/components/ui/utils';
import { formatCurrency } from '../utils/formatCurrency';
import { LOW_BUDGET_THRESHOLD } from '../types/roster.types';
import type { BudgetDisplayProps } from '../types/roster.types';

/**
 * BudgetDisplay component showing budget status during draft
 *
 * Features:
 * - Prominent remaining budget display (large, bold, emerald-400)
 * - Total budget context ("of $260 total")
 * - Spent amount display
 * - Low budget warning (red-500 when remaining < $20)
 * - Responsive font sizes
 *
 * @param props - Budget display properties
 * @returns Budget display element
 */
export const BudgetDisplay = memo(function BudgetDisplay({
  total,
  spent,
  remaining,
  className,
}: BudgetDisplayProps) {
  // Determine if budget is low (below threshold)
  const isLowBudget = remaining < LOW_BUDGET_THRESHOLD;

  // Dynamic color based on budget status
  const remainingColor = isLowBudget ? 'text-red-500' : 'text-emerald-400';

  return (
    <div
      className={cn('flex flex-col gap-1', className)}
      data-testid="budget-display"
      role="region"
      aria-label="Budget tracking"
    >
      {/* Remaining budget - prominent display */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn('text-2xl md:text-3xl font-bold', remainingColor)}
          data-testid="remaining-budget"
          aria-label={`${formatCurrency(remaining)} remaining`}
        >
          {formatCurrency(remaining)}
        </span>
        <span className="text-sm text-slate-400">Remaining</span>
      </div>

      {/* Total budget context */}
      <div
        className="text-sm text-slate-400"
        data-testid="total-budget"
        aria-label={`of ${formatCurrency(total)} total`}
      >
        of {formatCurrency(total)} total
      </div>

      {/* Spent amount */}
      <div
        className="text-base text-slate-300"
        data-testid="spent-budget"
        aria-label={`${formatCurrency(spent)} spent`}
      >
        {formatCurrency(spent)} Spent
      </div>

      {/* Low budget warning indicator */}
      {isLowBudget && (
        <div
          className="flex items-center gap-1 text-sm text-red-400 mt-1"
          data-testid="low-budget-warning"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Low budget warning</span>
        </div>
      )}
    </div>
  );
});

export default BudgetDisplay;
