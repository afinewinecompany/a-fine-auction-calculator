/**
 * ProjectionSyncLogCard Component
 *
 * Displays a single projection sync log entry with status indicator.
 * Features:
 * - Color-coded status badge (green for success, red for failure)
 * - Timestamp display
 * - Projection system label (Fangraphs or Google Sheets)
 * - Player count for successful syncs
 * - Error message for failed syncs
 *
 * Story: 13.6 - View Projection Sync Logs
 *
 * @example
 * ```tsx
 * <ProjectionSyncLogCard log={syncLog} />
 * ```
 */

import { CheckCircle, XCircle, Users, FileSpreadsheet, Cloud } from 'lucide-react';
import type { ProjectionSyncLog } from '../types/admin.types';

interface ProjectionSyncLogCardProps {
  /** The sync log entry to display */
  log: ProjectionSyncLog;
}

/**
 * Formats a timestamp to a human-readable format
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Gets the display name for a sync type
 */
function getSyncTypeLabel(syncType: ProjectionSyncLog['syncType']): string {
  switch (syncType) {
    case 'fangraphs':
      return 'Fangraphs';
    case 'google_sheets':
      return 'Google Sheets';
    default:
      return syncType;
  }
}

/**
 * Gets the icon component for a sync type
 */
function getSyncTypeIcon(syncType: ProjectionSyncLog['syncType']) {
  switch (syncType) {
    case 'fangraphs':
      return <Cloud className="h-4 w-4" />;
    case 'google_sheets':
      return <FileSpreadsheet className="h-4 w-4" />;
    default:
      return <Cloud className="h-4 w-4" />;
  }
}

export function ProjectionSyncLogCard({ log }: ProjectionSyncLogCardProps) {
  const isSuccess = log.status === 'success';

  return (
    <div
      className={`bg-slate-800 rounded-lg p-3 border ${isSuccess ? 'border-slate-700' : 'border-red-800/50'}`}
      data-testid="sync-log-card"
    >
      {/* Header with status and timestamp */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle
              className="h-5 w-5 text-emerald-500"
              aria-hidden="true"
              data-testid="status-icon-success"
            />
          ) : (
            <XCircle
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
              data-testid="status-icon-failure"
            />
          )}
          <span
            className={`text-sm font-medium ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}
            data-testid="status-text"
          >
            {isSuccess ? 'Success' : 'Failed'}
          </span>
        </div>
        <span className="text-xs text-slate-400" data-testid="timestamp">
          {formatTimestamp(log.startedAt)}
        </span>
      </div>

      {/* Sync type */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-400">{getSyncTypeIcon(log.syncType)}</span>
        <span className="text-sm text-white" data-testid="sync-type">
          {getSyncTypeLabel(log.syncType)}
        </span>
      </div>

      {/* Player count or error message */}
      {isSuccess && log.playersUpdated !== null && (
        <div className="flex items-center gap-2 text-slate-300">
          <Users className="h-3 w-3" aria-hidden="true" />
          <span className="text-sm" data-testid="player-count">
            {log.playersUpdated.toLocaleString()} players updated
          </span>
        </div>
      )}

      {!isSuccess && log.errorMessage && (
        <div
          className="text-sm text-red-400 bg-red-950/50 rounded p-2 mt-2"
          data-testid="error-message"
        >
          {log.errorMessage}
        </div>
      )}
    </div>
  );
}
