/**
 * useAPIHealth Hook
 *
 * Provides real-time API health monitoring with polling.
 * Fetches health status for all API integrations and updates every 60 seconds.
 *
 * Story: 13.3 - Monitor API Health for Integrations
 *
 * @example
 * ```tsx
 * const { apiStatuses, loading, error, hasDownAPI, refetch } = useAPIHealth();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { checkAllAPIs } from '../services/apiHealthService';
import type { APIHealthStatus } from '../types/admin.types';

/** Polling interval: 60 seconds */
const POLLING_INTERVAL = 60000;

/**
 * Return type for useAPIHealth hook
 */
export interface UseAPIHealthResult {
  /** Array of API health statuses */
  apiStatuses: APIHealthStatus[];
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if health check failed */
  error: string | null;
  /** Whether any API is currently down */
  hasDownAPI: boolean;
  /** Whether any API is currently degraded */
  hasDegradedAPI: boolean;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Hook for monitoring API health with automatic polling
 */
export function useAPIHealth(): UseAPIHealthResult {
  const [apiStatuses, setApiStatuses] = useState<APIHealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAPIHealth = useCallback(async () => {
    try {
      const statuses = await checkAllAPIs();
      setApiStatuses(statuses);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAPIHealth();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchAPIHealth();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchAPIHealth]);

  // Derived state: check if any API is down
  const hasDownAPI = apiStatuses.some(api => api.status === 'down');

  // Derived state: check if any API is degraded
  const hasDegradedAPI = apiStatuses.some(api => api.status === 'degraded');

  return {
    apiStatuses,
    loading,
    error,
    hasDownAPI,
    hasDegradedAPI,
    refetch: fetchAPIHealth,
  };
}
