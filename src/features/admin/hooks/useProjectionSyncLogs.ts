/**
 * useProjectionSyncLogs Hook
 *
 * Provides real-time projection sync log monitoring with polling.
 * Fetches last 50 sync operations and updates every 2 minutes.
 *
 * Story: 13.6 - View Projection Sync Logs
 *
 * @example
 * ```tsx
 * const { syncLogs, loading, error, successCount, failureCount, refetch } = useProjectionSyncLogs();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { ProjectionSyncLog } from '../types/admin.types';

/** Polling interval: 2 minutes (120000ms) */
const POLLING_INTERVAL = 120000;

/** Maximum number of logs to fetch */
const MAX_LOGS = 50;

/**
 * Return type for useProjectionSyncLogs hook
 */
export interface UseProjectionSyncLogsResult {
  /** Array of projection sync logs */
  syncLogs: ProjectionSyncLog[];
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Count of successful syncs */
  successCount: number;
  /** Count of failed syncs */
  failureCount: number;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Maps database row to ProjectionSyncLog type
 */
function mapRowToSyncLog(row: {
  id: string;
  sync_type: string;
  status: string;
  players_updated: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}): ProjectionSyncLog {
  return {
    id: row.id,
    syncType: row.sync_type as ProjectionSyncLog['syncType'],
    status: row.status as ProjectionSyncLog['status'],
    playersUpdated: row.players_updated,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

/**
 * Hook for monitoring projection sync logs with automatic polling
 */
export function useProjectionSyncLogs(): UseProjectionSyncLogsResult {
  const [syncLogs, setSyncLogs] = useState<ProjectionSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSyncLogs = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const { data, error: dbError } = await supabase
        .from('projection_sync_logs')
        .select('id, sync_type, status, players_updated, error_message, started_at, completed_at')
        .order('started_at', { ascending: false })
        .limit(MAX_LOGS);

      if (dbError) {
        throw new Error(dbError.message);
      }

      const logs = (data || []).map(mapRowToSyncLog);
      setSyncLogs(logs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchSyncLogs();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchSyncLogs();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchSyncLogs]);

  // Derived state: count of successful syncs
  const successCount = syncLogs.filter(log => log.status === 'success').length;

  // Derived state: count of failed syncs
  const failureCount = syncLogs.filter(log => log.status === 'failure').length;

  return {
    syncLogs,
    loading,
    error,
    successCount,
    failureCount,
    refetch: fetchSyncLogs,
  };
}
