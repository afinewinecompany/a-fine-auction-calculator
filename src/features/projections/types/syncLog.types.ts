/**
 * Sync Log Type Definitions
 *
 * TypeScript types for projection sync log operations.
 *
 * Story: 4.6 - Implement Daily Fangraphs Sync
 */

/**
 * Sync log status
 */
export type SyncStatus = 'success' | 'failure';

/**
 * A single sync log entry
 */
export interface SyncLog {
  id: string;
  leagueId: string | null;
  projectionSource: string;
  status: SyncStatus;
  playersUpdated: number;
  errorMessage: string | null;
  durationMs: number | null;
  startedAt: string;
  completedAt: string;
  createdAt: string;
}

/**
 * Summary of sync operations over a time period
 */
export interface SyncSummary {
  totalSyncs: number;
  successCount: number;
  failureCount: number;
  errorRate: number;
  averageDuration: number | null;
  maxDuration: number | null;
}

/**
 * Sync logs query parameters
 */
export interface SyncLogsQueryParams {
  leagueId?: string;
  status?: SyncStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Convert database row to SyncLog object
 */
export function toSyncLog(row: {
  id: string;
  league_id: string | null;
  projection_source: string;
  status: string;
  players_updated: number;
  error_message: string | null;
  duration_ms: number | null;
  started_at: string;
  completed_at: string;
  created_at: string;
}): SyncLog {
  return {
    id: row.id,
    leagueId: row.league_id,
    projectionSource: row.projection_source,
    status: row.status as SyncStatus,
    playersUpdated: row.players_updated,
    errorMessage: row.error_message,
    durationMs: row.duration_ms,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

/**
 * Admin monitoring queries (SQL for direct use)
 *
 * These queries are documented here for reference and will be used
 * by the admin dashboard in Epic 13.
 */
export const ADMIN_QUERIES = {
  /**
   * Recent sync status - Get last 50 sync operations
   */
  RECENT_SYNCS: `
    SELECT * FROM projection_sync_logs
    ORDER BY created_at DESC
    LIMIT 50;
  `,

  /**
   * Error rate last 24 hours
   */
  ERROR_RATE_24H: `
    SELECT
      COUNT(*) FILTER (WHERE status = 'success') as successes,
      COUNT(*) FILTER (WHERE status = 'failure') as failures,
      ROUND(COUNT(*) FILTER (WHERE status = 'failure')::decimal / NULLIF(COUNT(*), 0) * 100, 2) as error_rate
    FROM projection_sync_logs
    WHERE created_at > NOW() - INTERVAL '24 hours';
  `,

  /**
   * Average sync duration by source
   */
  AVG_DURATION_BY_SOURCE: `
    SELECT
      projection_source,
      AVG(duration_ms) as avg_duration,
      MAX(duration_ms) as max_duration,
      MIN(duration_ms) as min_duration,
      COUNT(*) as sync_count
    FROM projection_sync_logs
    WHERE status = 'success'
    GROUP BY projection_source;
  `,

  /**
   * Failed syncs in last 7 days
   */
  FAILED_SYNCS_7D: `
    SELECT * FROM projection_sync_logs
    WHERE status = 'failure'
    AND created_at > NOW() - INTERVAL '7 days'
    ORDER BY created_at DESC;
  `,

  /**
   * Sync count by day (last 30 days)
   */
  DAILY_SYNC_COUNTS: `
    SELECT
      DATE(created_at) as sync_date,
      COUNT(*) FILTER (WHERE status = 'success') as success_count,
      COUNT(*) FILTER (WHERE status = 'failure') as failure_count,
      AVG(duration_ms) FILTER (WHERE status = 'success') as avg_duration
    FROM projection_sync_logs
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY sync_date DESC;
  `,

  /**
   * Performance outliers (syncs exceeding 10 second NFR-P5 target)
   */
  PERFORMANCE_OUTLIERS: `
    SELECT * FROM projection_sync_logs
    WHERE duration_ms > 10000
    AND status = 'success'
    ORDER BY created_at DESC
    LIMIT 20;
  `,

  /**
   * League-specific sync history
   */
  LEAGUE_SYNC_HISTORY: `
    -- Replace $1 with league_id UUID
    SELECT * FROM projection_sync_logs
    WHERE league_id = $1
    ORDER BY created_at DESC
    LIMIT 30;
  `,
};
