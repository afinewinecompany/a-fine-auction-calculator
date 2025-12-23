/**
 * useDraftCompletionMetrics Hook
 *
 * Provides real-time draft completion metrics with 5-minute polling.
 * Fetches 30-day completion statistics for admin dashboard monitoring.
 *
 * Story: 13.8 - Track Draft Completion Rates
 *
 * @example
 * ```tsx
 * const { metrics, loading, error, isBelowTarget, refetch } = useDraftCompletionMetrics();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 * return <CompletionWidget metrics={metrics} isBelowTarget={isBelowTarget} />;
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getDraftCompletionMetrics,
  isBelowTarget as checkBelowTarget,
} from '../services/draftCompletionService';
import type { DraftCompletionMetrics } from '../types/admin.types';

/** Polling interval: 5 minutes (300000 ms) */
const POLLING_INTERVAL = 300000;

/**
 * Return type for useDraftCompletionMetrics hook
 */
export interface UseDraftCompletionMetricsResult {
  /** Draft completion metrics (null if not yet loaded) */
  metrics: DraftCompletionMetrics | null;
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether completion rate is below 80% target (NFR-R3) */
  isBelowTarget: boolean;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Hook for monitoring draft completion metrics with automatic polling
 */
export function useDraftCompletionMetrics(): UseDraftCompletionMetricsResult {
  const [metrics, setMetrics] = useState<DraftCompletionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await getDraftCompletionMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch completion metrics');
      // Keep existing metrics on error (polling failure resilience)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Set up polling interval (5 minutes)
    const intervalId = setInterval(() => {
      fetchMetrics();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchMetrics]);

  // Derived state: whether completion rate is below 80% target
  const isBelowTarget = metrics ? checkBelowTarget(metrics.completionRate) : false;

  return {
    metrics,
    loading,
    error,
    isBelowTarget,
    refetch: fetchMetrics,
  };
}
