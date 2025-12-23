/**
 * useErrorLogs Hook
 *
 * Custom hook for fetching and managing error logs for a specific API.
 * Features:
 * - Query api_health_logs filtered by API name
 * - Support for date range filtering (24h, 7d, 30d, custom)
 * - Search functionality (by error message or status code)
 * - Real-time polling every 60 seconds
 * - Error frequency aggregation for charts
 *
 * Story: 13.10 - Drill Down into Error Logs
 *
 * @example
 * ```tsx
 * const { logs, loading, error, filter, setFilter, frequency, refetch } = useErrorLogs('couch_managers');
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  APIName,
  ErrorLog,
  ErrorLogsFilter,
  ErrorFrequencyPoint,
  DateRangeOption,
} from '../types/admin.types';

/** Polling interval in milliseconds (60 seconds) */
const POLLING_INTERVAL = 60000;

/** Maximum number of logs to fetch */
const MAX_LOGS = 100;

/**
 * Calculate start date based on date range option
 */
function getStartDate(dateRange: DateRangeOption, customStartDate?: string): Date {
  const now = new Date();

  switch (dateRange) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'custom':
      return customStartDate
        ? new Date(customStartDate)
        : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

/**
 * Calculate end date based on date range option
 */
function getEndDate(dateRange: DateRangeOption, customEndDate?: string): Date {
  if (dateRange === 'custom' && customEndDate) {
    return new Date(customEndDate);
  }
  return new Date();
}

/**
 * Calculate error frequency from logs
 * Groups errors by hour for 24h range, by day for longer ranges
 */
function calculateFrequency(logs: ErrorLog[], dateRange: DateRangeOption): ErrorFrequencyPoint[] {
  if (logs.length === 0) return [];

  const frequencyMap = new Map<string, number>();
  const useHourly = dateRange === '24h';

  logs.forEach(log => {
    const date = new Date(log.checkedAt);
    let key: string;

    if (useHourly) {
      // Group by hour
      date.setMinutes(0, 0, 0);
      key = date.toISOString();
    } else {
      // Group by day
      date.setHours(0, 0, 0, 0);
      key = date.toISOString();
    }

    frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
  });

  // Sort by time
  return Array.from(frequencyMap.entries())
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

/**
 * Default filter state
 */
const DEFAULT_FILTER: ErrorLogsFilter = {
  dateRange: '24h',
  searchQuery: '',
};

/**
 * Return type for useErrorLogs hook
 */
export interface UseErrorLogsResult {
  /** Error log entries */
  logs: ErrorLog[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Current filter state */
  filter: ErrorLogsFilter;
  /** Update filter state */
  setFilter: (filter: Partial<ErrorLogsFilter>) => void;
  /** Error frequency data for chart */
  frequency: ErrorFrequencyPoint[];
  /** Total count of logs (before pagination) */
  totalCount: number;
  /** Manually refetch data */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing error logs
 */
export function useErrorLogs(apiName: APIName): UseErrorLogsResult {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<ErrorLogsFilter>(DEFAULT_FILTER);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Update filter with partial values
   */
  const setFilter = useCallback((updates: Partial<ErrorLogsFilter>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Fetch error logs from database
   */
  const fetchLogs = useCallback(async () => {
    if (!supabase) {
      setError('Database connection not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startDate = getStartDate(filter.dateRange, filter.customStartDate);
      const endDate = getEndDate(filter.dateRange, filter.customEndDate);

      // Build query for error logs (only degraded or down status)
      let query = supabase
        .from('api_health_logs')
        .select('*', { count: 'exact' })
        .eq('api_name', apiName)
        .in('status', ['degraded', 'down'])
        .gte('checked_at', startDate.toISOString())
        .lte('checked_at', endDate.toISOString())
        .order('checked_at', { ascending: false })
        .limit(MAX_LOGS);

      // Apply search filter if provided
      if (filter.searchQuery.trim()) {
        const searchTerm = filter.searchQuery.trim();
        // Check if search term is a number (for status code search)
        const isNumeric = /^\d+$/.test(searchTerm);

        if (isNumeric) {
          query = query.eq('status_code', parseInt(searchTerm, 10));
        } else {
          query = query.ilike('error_message', `%${searchTerm}%`);
        }
      }

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      // Transform database records to ErrorLog type
      const transformedLogs: ErrorLog[] = (data || []).map(record => ({
        id: record.id,
        apiName: record.api_name as APIName,
        status: record.status as 'degraded' | 'down',
        statusCode: record.status_code,
        errorMessage: record.error_message || 'Unknown error',
        requestUrl: record.request_url,
        responseTimeMs: record.response_time_ms,
        checkedAt: record.checked_at,
      }));

      setLogs(transformedLogs);
      setTotalCount(count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch error logs';
      setError(message);
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [apiName, filter]);

  /**
   * Calculate frequency data from logs
   */
  const frequency = useMemo(() => {
    return calculateFrequency(logs, filter.dateRange);
  }, [logs, filter.dateRange]);

  /**
   * Initial fetch and polling setup
   */
  useEffect(() => {
    fetchLogs();

    // Set up polling interval
    const intervalId = setInterval(fetchLogs, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    filter,
    setFilter,
    frequency,
    totalCount,
    refetch: fetchLogs,
  };
}

export default useErrorLogs;
