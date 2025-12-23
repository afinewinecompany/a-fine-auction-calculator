/**
 * useIncidentLogs Hook
 *
 * Provides real-time incident log monitoring with polling.
 * Fetches incidents from the last 30 days and updates every 2 minutes.
 * Supports filtering by incident type and severity.
 *
 * Story: 13.9 - View Detailed Incident Logs
 *
 * @example
 * ```tsx
 * const { incidents, loading, error, summary, refetch } = useIncidentLogs();
 * // With filters
 * const filtered = useIncidentLogs({ typeFilter: 'api_failure', severityFilter: 'critical' });
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabase } from '@/lib/supabase';
import type {
  IncidentLog,
  IncidentLogsSummary,
  IncidentType,
  IncidentSeverity,
} from '../types/admin.types';

/** Polling interval: 2 minutes (120000ms) */
const POLLING_INTERVAL = 120000;

/** Number of days to look back for incidents */
const DAYS_LOOKBACK = 30;

/**
 * Options for useIncidentLogs hook
 */
export interface UseIncidentLogsOptions {
  /** Filter by incident type */
  typeFilter?: IncidentType | null;
  /** Filter by severity level */
  severityFilter?: IncidentSeverity | null;
}

/**
 * Return type for useIncidentLogs hook
 */
export interface UseIncidentLogsResult {
  /** Array of incident logs (filtered if filters applied) */
  incidents: IncidentLog[];
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Summary statistics for all incidents (unfiltered) */
  summary: IncidentLogsSummary;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Maps database row to IncidentLog type
 */
function mapRowToIncidentLog(row: {
  id: string;
  incident_type: string;
  severity: string;
  title: string;
  description: string;
  affected_users_count: number;
  recovery_actions: string[] | null;
  occurred_at: string;
  resolved_at: string | null;
  resolution_time_minutes: number | null;
}): IncidentLog {
  return {
    id: row.id,
    incidentType: row.incident_type as IncidentType,
    severity: row.severity as IncidentSeverity,
    title: row.title,
    description: row.description,
    affectedUsersCount: row.affected_users_count,
    recoveryActions: row.recovery_actions || [],
    occurredAt: row.occurred_at,
    resolvedAt: row.resolved_at,
    resolutionTimeMinutes: row.resolution_time_minutes,
  };
}

/**
 * Creates an empty summary object
 */
function createEmptySummary(): IncidentLogsSummary {
  return {
    totalIncidents: 0,
    avgResolutionTimeMinutes: 0,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    byType: {
      api_failure: 0,
      draft_error: 0,
      sync_failure: 0,
      system_error: 0,
    },
  };
}

/**
 * Calculates summary statistics from incidents
 */
function calculateSummary(incidents: IncidentLog[]): IncidentLogsSummary {
  if (incidents.length === 0) {
    return createEmptySummary();
  }

  const resolvedIncidents = incidents.filter(
    i => i.resolvedAt !== null && i.resolutionTimeMinutes !== null
  );

  const avgResolutionTime =
    resolvedIncidents.length > 0
      ? Math.round(
          resolvedIncidents.reduce((sum, i) => sum + (i.resolutionTimeMinutes || 0), 0) /
            resolvedIncidents.length
        )
      : 0;

  return {
    totalIncidents: incidents.length,
    avgResolutionTimeMinutes: avgResolutionTime,
    bySeverity: {
      critical: incidents.filter(i => i.severity === 'critical').length,
      high: incidents.filter(i => i.severity === 'high').length,
      medium: incidents.filter(i => i.severity === 'medium').length,
      low: incidents.filter(i => i.severity === 'low').length,
    },
    byType: {
      api_failure: incidents.filter(i => i.incidentType === 'api_failure').length,
      draft_error: incidents.filter(i => i.incidentType === 'draft_error').length,
      sync_failure: incidents.filter(i => i.incidentType === 'sync_failure').length,
      system_error: incidents.filter(i => i.incidentType === 'system_error').length,
    },
  };
}

/**
 * Hook for monitoring incident logs with automatic polling
 */
export function useIncidentLogs(options: UseIncidentLogsOptions = {}): UseIncidentLogsResult {
  const { typeFilter = null, severityFilter = null } = options;
  const [allIncidents, setAllIncidents] = useState<IncidentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - DAYS_LOOKBACK);

      const { data, error: dbError } = await supabase
        .from('incident_logs')
        .select(
          'id, incident_type, severity, title, description, affected_users_count, recovery_actions, occurred_at, resolved_at, resolution_time_minutes'
        )
        .gte('occurred_at', cutoffDate.toISOString())
        .order('occurred_at', { ascending: false });

      if (dbError) {
        throw new Error(dbError.message);
      }

      const incidents = (data || []).map(mapRowToIncidentLog);
      setAllIncidents(incidents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incident logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchIncidents();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchIncidents();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchIncidents]);

  // Apply filters to incidents
  const filteredIncidents = useMemo(() => {
    let result = allIncidents;

    if (typeFilter) {
      result = result.filter(i => i.incidentType === typeFilter);
    }

    if (severityFilter) {
      result = result.filter(i => i.severity === severityFilter);
    }

    return result;
  }, [allIncidents, typeFilter, severityFilter]);

  // Calculate summary from all incidents (unfiltered)
  const summary = useMemo(() => calculateSummary(allIncidents), [allIncidents]);

  return {
    incidents: filteredIncidents,
    loading,
    error,
    summary,
    refetch: fetchIncidents,
  };
}
