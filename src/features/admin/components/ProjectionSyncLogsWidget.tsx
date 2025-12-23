/**
 * Projection Sync Logs Widget Component
 *
 * Dashboard widget that displays recent projection sync operations.
 * Features:
 * - List of last 50 sync operations
 * - Color-coded status (green for success, red for failure)
 * - Player count for successful syncs
 * - Error messages for failed syncs
 * - Automatic 2-minute polling for real-time updates
 * - Summary stats showing success/failure counts
 *
 * Story: 13.6 - View Projection Sync Logs
 *
 * @example
 * ```tsx
 * <ProjectionSyncLogsWidget />
 * ```
 */

import { FileText, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useProjectionSyncLogs } from '../hooks/useProjectionSyncLogs';
import { ProjectionSyncLogCard } from './ProjectionSyncLogCard';

/**
 * Loading skeleton for sync logs
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" data-testid="loading-skeleton">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-slate-700 rounded-full" />
              <div className="h-4 w-16 bg-slate-700 rounded" />
            </div>
            <div className="h-3 w-24 bg-slate-700 rounded" />
          </div>
          <div className="h-4 w-32 bg-slate-700 rounded mb-2" />
          <div className="h-4 w-24 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no sync logs are available
 */
function EmptyState() {
  return (
    <div className="text-center py-8 text-slate-400" data-testid="empty-state">
      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No sync logs available</p>
      <p className="text-xs text-slate-500 mt-1">
        Projection syncs will appear here after they occur
      </p>
    </div>
  );
}

export function ProjectionSyncLogsWidget() {
  const { syncLogs, loading, error, successCount, failureCount, refetch } = useProjectionSyncLogs();

  // Determine if there are any failures for highlighting
  const hasFailures = failureCount > 0;

  // Border color based on failure count
  const getBorderClass = () => {
    if (hasFailures) return 'border-red-500/50';
    return 'border-slate-800';
  };

  return (
    <div
      className={`bg-slate-900 border rounded-lg p-6 ${getBorderClass()}`}
      data-testid="projection-sync-logs-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText
            className={`h-5 w-5 ${hasFailures ? 'text-yellow-500' : 'text-emerald-500'}`}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-white">Projection Sync Logs</h2>
          {hasFailures && (
            <span
              className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full"
              data-testid="failure-badge"
            >
              {failureCount} failed
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Refresh sync logs"
            aria-label="Refresh projection sync logs"
            data-testid="refresh-button"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                hasFailures ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'
              }`}
              aria-hidden="true"
              data-testid="status-indicator"
            />
            <span
              className={`text-sm ${hasFailures ? 'text-yellow-400' : 'text-slate-400'}`}
              data-testid="widget-status-text"
            >
              {hasFailures ? `${failureCount} sync failures` : 'All syncs healthy'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4" data-testid="summary-stats">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Successful</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1" data-testid="success-count">
            {successCount}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Failed</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1" data-testid="failure-count">
            {failureCount}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 mb-4 bg-red-950 border border-red-800 rounded-lg"
          data-testid="widget-error-message"
        >
          <FileText className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : syncLogs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2" data-testid="sync-logs-list">
          {syncLogs.map(log => (
            <ProjectionSyncLogCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>Showing last {syncLogs.length} sync operations</span>
        <span>Auto-refreshes every 2 minutes</span>
      </div>
    </div>
  );
}
