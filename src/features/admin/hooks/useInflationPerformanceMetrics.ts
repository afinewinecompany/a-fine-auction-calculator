/**
 * useInflationPerformanceMetrics Hook
 *
 * Provides real-time inflation calculation performance metrics with 60-second polling.
 * Fetches 24-hour performance statistics for admin dashboard monitoring.
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 * NFR: NFR-M4 (Track median, p95, p99 latency), NFR-M5 (Real-time performance display)
 *
 * @example
 * ```tsx
 * const { metrics, loading, error, isP99Alert, thresholdLevel, refetch } = useInflationPerformanceMetrics();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 * return <PerformanceWidget metrics={metrics} isAlert={isP99Alert} />;
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { getInflationPerformanceMetrics } from '../services/inflationPerformanceService';
import {
  getLatencyThresholdLevel,
  isP99AlertTriggered,
  type InflationPerformanceMetrics,
  type LatencyThresholdLevel,
} from '../types/admin.types';

/** Polling interval: 60 seconds (as specified in AC) */
const POLLING_INTERVAL = 60000;

/**
 * Return type for useInflationPerformanceMetrics hook
 */
export interface UseInflationPerformanceMetricsResult {
  /** Inflation performance metrics (null if not yet loaded) */
  metrics: InflationPerformanceMetrics | null;
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether p99 latency exceeds 500ms threshold (NFR-M4) */
  isP99Alert: boolean;
  /** Current threshold level based on median latency (excellent/warning/critical) */
  thresholdLevel: LatencyThresholdLevel;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Hook for monitoring inflation calculation performance metrics with automatic polling
 *
 * @returns Object containing metrics state, loading/error status, and derived values
 */
export function useInflationPerformanceMetrics(): UseInflationPerformanceMetricsResult {
  const [metrics, setMetrics] = useState<InflationPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await getInflationPerformanceMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance metrics');
      // Keep existing metrics on error (polling failure resilience)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Set up polling interval (60 seconds per AC)
    const intervalId = setInterval(() => {
      fetchMetrics();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchMetrics]);

  // Derived state: whether p99 latency exceeds 500ms threshold
  const isP99Alert = metrics ? isP99AlertTriggered(metrics.p99Latency) : false;

  // Derived state: threshold level based on median latency
  const thresholdLevel: LatencyThresholdLevel = metrics
    ? getLatencyThresholdLevel(metrics.medianLatency)
    : 'excellent';

  return {
    metrics,
    loading,
    error,
    isP99Alert,
    thresholdLevel,
    refetch: fetchMetrics,
  };
}
