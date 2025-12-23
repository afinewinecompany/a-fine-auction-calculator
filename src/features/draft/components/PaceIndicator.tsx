/**
 * PaceIndicator Component
 *
 * Displays spending pace compared to target budget allocation during drafts.
 * Shows color-coded status: On Pace (green), Spending Fast (yellow), Spending Slow (blue).
 * Includes tooltip with calculation details.
 *
 * Story: 7.4 - Display Spending Pace Indicator
 *
 * @example
 * ```tsx
 * <PaceIndicator
 *   totalBudget={260}
 *   moneySpent={60}
 *   spotsFilled={5}
 *   totalRosterSpots={23}
 * />
 * ```
 */

import { memo, useMemo } from 'react';
import { cn } from '@/components/ui/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '../utils/formatCurrency';
import type { PaceIndicatorProps, PaceStatus } from '../types/roster.types';
import { PACE_TOLERANCE } from '../types/roster.types';

/**
 * Calculate pace ratio comparing actual vs target spending per slot
 *
 * @param totalBudget - Total auction budget
 * @param moneySpent - Amount already spent
 * @param spotsFilled - Number of roster spots filled
 * @param totalRosterSpots - Total roster spots available
 * @returns Pace ratio (1.0 = exactly on pace)
 */
function calculatePaceRatio(
  totalBudget: number,
  moneySpent: number,
  spotsFilled: number,
  totalRosterSpots: number
): number {
  // Validate inputs - return 0 for invalid states
  if (spotsFilled <= 0 || totalRosterSpots <= 0 || totalBudget <= 0 || moneySpent < 0) {
    return 0;
  }

  const targetPacePerSlot = totalBudget / totalRosterSpots;
  // Guard against division by zero (should not happen given above checks)
  if (targetPacePerSlot === 0) {
    return 0;
  }

  const actualPacePerSlot = moneySpent / spotsFilled;

  return actualPacePerSlot / targetPacePerSlot;
}

/**
 * Determine pace status based on ratio
 *
 * @param paceRatio - Ratio of actual vs target pace
 * @param spotsFilled - Number of spots filled (0 means not started)
 * @returns Pace status enum value
 */
function getPaceStatus(paceRatio: number, spotsFilled: number): PaceStatus {
  if (spotsFilled === 0) {
    return 'NOT_STARTED';
  }

  if (paceRatio >= 1 - PACE_TOLERANCE && paceRatio <= 1 + PACE_TOLERANCE) {
    return 'ON_PACE';
  }

  if (paceRatio > 1 + PACE_TOLERANCE) {
    return 'SPENDING_FAST';
  }

  return 'SPENDING_SLOW';
}

/**
 * Get display configuration for pace status
 */
function getStatusConfig(status: PaceStatus): {
  label: string;
  textColor: string;
  bgColor: string;
  icon: React.ReactNode;
} {
  switch (status) {
    case 'ON_PACE':
      return {
        label: 'On Pace',
        textColor: 'text-green-400',
        bgColor: 'bg-green-400/20',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    case 'SPENDING_FAST':
      return {
        label: 'Spending Fast',
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-400/20',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    case 'SPENDING_SLOW':
      return {
        label: 'Spending Slow',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-400/20',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    case 'NOT_STARTED':
    default:
      return {
        label: 'Draft Not Started',
        textColor: 'text-slate-400',
        bgColor: 'bg-slate-400/20',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
  }
}

/**
 * PaceIndicator component showing spending pace status during draft
 *
 * Features:
 * - Color-coded status badge (green/yellow/blue)
 * - Status icon for visual clarity
 * - Tooltip with calculation details
 * - Real-time updates after each draft pick
 * - Edge case handling (no spots filled, zero budget)
 *
 * @param props - Pace indicator properties
 * @returns Pace indicator element with tooltip
 */
export const PaceIndicator = memo(function PaceIndicator({
  totalBudget,
  moneySpent,
  spotsFilled,
  totalRosterSpots,
  className,
}: PaceIndicatorProps) {
  // Calculate pace metrics
  const { paceRatio, targetPace, actualPace, status } = useMemo(() => {
    const ratio = calculatePaceRatio(totalBudget, moneySpent, spotsFilled, totalRosterSpots);
    const target = totalRosterSpots > 0 ? totalBudget / totalRosterSpots : 0;
    const actual = spotsFilled > 0 ? moneySpent / spotsFilled : 0;
    const paceStatus = getPaceStatus(ratio, spotsFilled);

    return {
      paceRatio: ratio,
      targetPace: target,
      actualPace: actual,
      status: paceStatus,
    };
  }, [totalBudget, moneySpent, spotsFilled, totalRosterSpots]);

  const config = getStatusConfig(status);

  // Format percentage for tooltip
  const pacePercentage = paceRatio > 0 ? Math.round(paceRatio * 100) : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
              'text-sm font-medium cursor-help transition-colors',
              config.textColor,
              config.bgColor,
              className
            )}
            data-testid="pace-indicator"
            role="status"
            aria-label={`Spending pace: ${config.label}`}
          >
            {config.icon}
            <span data-testid="pace-status-label">{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="bg-slate-800 border-slate-700 text-slate-100"
          data-testid="pace-tooltip"
        >
          <div className="text-sm space-y-1">
            {status === 'NOT_STARTED' ? (
              <p>No players drafted yet</p>
            ) : (
              <>
                <p>
                  <span className="text-slate-400">Actual:</span> {formatCurrency(actualPace)}/slot
                </p>
                <p>
                  <span className="text-slate-400">Target:</span> {formatCurrency(targetPace)}/slot
                </p>
                <p>
                  <span className="text-slate-400">Pace:</span> {pacePercentage}% of target
                </p>
                <p className="text-xs text-slate-500 pt-1">
                  {spotsFilled} of {totalRosterSpots} spots filled
                </p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export default PaceIndicator;

// Export utility functions for testing
export { calculatePaceRatio, getPaceStatus, getStatusConfig };
