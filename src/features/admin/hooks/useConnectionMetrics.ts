/**
 * useConnectionMetrics Hook
 *
 * Provides real-time connection success metrics with polling.
 * Fetches 7-day success rates for all API integrations and updates every 2 minutes.
 *
 * Story: 13.5 - View Connection Success Metrics
 *
 * @example
 * ```tsx
 * const { metrics, loading, error, lowSuccessCount, refetch, selectedDate, selectDate, dailyDetails } = useConnectionMetrics();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getConnectionMetrics,
  getDailyConnectionDetails,
  countLowSuccessRateApis,
} from '../services/connectionMetricsService';
import type { ConnectionMetrics, DailyConnectionDetails } from '../types/admin.types';

/** Polling interval: 2 minutes (120 seconds) */
const POLLING_INTERVAL = 120000;

/**
 * Return type for useConnectionMetrics hook
 */
export interface UseConnectionMetricsResult {
  /** Array of connection metrics for each API */
  metrics: ConnectionMetrics[];
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Count of APIs with success rate below 95% */
  lowSuccessCount: number;
  /** Manual refetch function */
  refetch: () => Promise<void>;
  /** Currently selected date for drill-down (null if none selected) */
  selectedDate: string | null;
  /** Select a date for drill-down details */
  selectDate: (date: string | null) => void;
  /** Daily connection details for selected date */
  dailyDetails: DailyConnectionDetails[];
  /** Whether daily details are loading */
  loadingDetails: boolean;
}

/**
 * Hook for monitoring API connection success metrics with automatic polling
 */
export function useConnectionMetrics(): UseConnectionMetricsResult {
  const [metrics, setMetrics] = useState<ConnectionMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailyDetails, setDailyDetails] = useState<DailyConnectionDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await getConnectionMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connection metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDailyDetails = useCallback(async (date: string) => {
    setLoadingDetails(true);
    try {
      const details = await getDailyConnectionDetails(date);
      setDailyDetails(details);
    } catch (err) {
      console.error('Failed to fetch daily details:', err);
      setDailyDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const selectDate = useCallback(
    (date: string | null) => {
      setSelectedDate(date);
      if (date) {
        fetchDailyDetails(date);
      } else {
        setDailyDetails([]);
      }
    },
    [fetchDailyDetails]
  );

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Set up polling interval (2 minutes)
    const intervalId = setInterval(() => {
      fetchMetrics();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchMetrics]);

  // Derived state: count of APIs below 95% success rate
  const lowSuccessCount = countLowSuccessRateApis(metrics);

  return {
    metrics,
    loading,
    error,
    lowSuccessCount,
    refetch: fetchMetrics,
    selectedDate,
    selectDate,
    dailyDetails,
    loadingDetails,
  };
}
