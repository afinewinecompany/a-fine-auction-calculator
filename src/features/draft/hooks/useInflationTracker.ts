/**
 * useInflationTracker Hook
 *
 * Custom hook for accessing inflation data needed by InflationTracker component.
 * Provides overall inflation rate, position rates, and tier rates from the store.
 *
 * Story: 8.1 - Create InflationTracker Component
 * Story: 8.2 - Display Current Inflation Rate Percentage
 */

import {
  useInflationStore,
  useOverallInflation,
  usePositionInflation,
  useTierInflation,
} from '@/features/inflation/stores/inflationStore';
import type { Position, Tier } from '@/features/inflation/types/inflation.types';

/**
 * Return type for useInflationTracker hook
 */
export interface InflationTrackerData {
  /** Overall inflation rate as percentage (e.g., 12.5 for 12.5%) */
  inflationRate: number;
  /** Position-specific inflation rates */
  positionRates: Record<Position, number>;
  /** Tier-specific inflation rates */
  tierRates: Record<Tier, number>;
  /** Whether calculations are in progress */
  isCalculating: boolean;
  /** Last time inflation was updated */
  lastUpdated: Date | null;
  /** Any calculation error */
  error: string | null;
}

/**
 * Hook to get inflation data for the InflationTracker component
 *
 * @returns Inflation metrics for display
 *
 * @example
 * ```tsx
 * const { inflationRate, positionRates, tierRates } = useInflationTracker();
 *
 * return (
 *   <InflationTracker
 *     inflationRate={inflationRate}
 *     positionRates={positionRates}
 *     tierRates={tierRates}
 *   />
 * );
 * ```
 */
export function useInflationTracker(): InflationTrackerData {
  const inflationRate = useOverallInflation();
  const positionRates = usePositionInflation();
  const tierRates = useTierInflation();
  const isCalculating = useInflationStore(state => state.isCalculating);
  const lastUpdated = useInflationStore(state => state.lastUpdated);
  const error = useInflationStore(state => state.error);

  return {
    inflationRate,
    positionRates,
    tierRates,
    isCalculating,
    lastUpdated,
    error,
  };
}

export default useInflationTracker;
