/**
 * useErrorRates Hook
 *
 * Provides real-time error rate monitoring with polling.
 * Fetches 24-hour error rates for all API integrations and updates every 60 seconds.
 *
 * Story: 13.4 - View Error Rates with Automated Alerts
 *
 * @example
 * ```tsx
 * const { errorRates, loading, error, alertCount, refetch } = useErrorRates();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { getErrorRates, countAlertsAboveThreshold } from '../services/errorRateService';
import type { ErrorRate } from '../types/admin.types';

/** Polling interval: 60 seconds */
const POLLING_INTERVAL = 60000;

/**
 * Return type for useErrorRates hook
 */
export interface UseErrorRatesResult {
  /** Array of error rates for each API */
  errorRates: ErrorRate[];
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Count of APIs with error rates above threshold (5%) */
  alertCount: number;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Hook for monitoring API error rates with automatic polling
 */
export function useErrorRates(): UseErrorRatesResult {
  const [errorRates, setErrorRates] = useState<ErrorRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchErrorRates = useCallback(async () => {
    try {
      const rates = await getErrorRates();
      setErrorRates(rates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch error rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchErrorRates();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchErrorRates();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchErrorRates]);

  // Derived state: count of APIs above threshold
  const alertCount = countAlertsAboveThreshold(errorRates);

  return {
    errorRates,
    loading,
    error,
    alertCount,
    refetch: fetchErrorRates,
  };
}
