/**
 * useInflationTracker Hook
 *
 * Custom hook for accessing inflation data needed by InflationTracker component.
 * Provides overall inflation rate, position rates, and tier rates from the store.
 *
 * Story: 8.1 - Create InflationTracker Component
 * Story: 8.2 - Display Current Inflation Rate Percentage
 *
 * Code Review Fix: Uses single combined selector with useShallow to avoid
 * multiple store subscriptions and prevent infinite re-renders.
 * @see https://docs.pmnd.rs/zustand/guides/prevent-rerenders-with-use-shallow
 */

import { useShallow } from 'zustand/react/shallow';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
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
 * Uses a single combined selector for better performance - avoids multiple
 * store subscriptions that would cause unnecessary re-renders.
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
  // useShallow prevents infinite re-renders by doing shallow comparison
  // Without it, a new object is created on every render, causing React error #185
  return useInflationStore(
    useShallow(state => ({
      inflationRate: state.overallRate,
      positionRates: state.positionRates,
      tierRates: state.tierRates,
      isCalculating: state.isCalculating,
      lastUpdated: state.lastUpdated,
      error: state.error,
    }))
  );
}

export default useInflationTracker;
