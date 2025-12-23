/**
 * API Health Widget Component
 *
 * Dashboard widget that displays real-time health status for all API integrations.
 * Features:
 * - Grid layout with 3 API cards (Couch Managers, Fangraphs, Google Sheets)
 * - Automatic 60-second polling
 * - Red border alert when any API is down
 * - Loading and error states
 * - Monitoring indicator with pulse animation
 *
 * Story: 13.3 - Monitor API Health for Integrations
 *
 * @example
 * ```tsx
 * <APIHealthWidget />
 * ```
 */

import { Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAPIHealth } from '../hooks/useAPIHealth';
import { APIStatusCard } from './APIStatusCard';

/**
 * Loading skeleton for API status cards
 */
function LoadingSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-24 bg-slate-700 rounded" />
        <div className="h-3 w-3 bg-slate-700 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-700 rounded" />
        <div className="h-4 w-3/4 bg-slate-700 rounded" />
        <div className="h-4 w-2/3 bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export function APIHealthWidget() {
  const { apiStatuses, loading, error, hasDownAPI, hasDegradedAPI, refetch } = useAPIHealth();

  // Determine border color based on API status
  const getBorderClass = () => {
    if (hasDownAPI) return 'border-red-500';
    if (hasDegradedAPI) return 'border-yellow-500';
    return 'border-slate-800';
  };

  // Determine status indicator color
  const getStatusIndicatorClass = () => {
    if (hasDownAPI) return 'bg-red-500';
    if (hasDegradedAPI) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  // Determine status text
  const getStatusText = () => {
    if (hasDownAPI) return 'Issues Detected';
    if (hasDegradedAPI) return 'Degraded';
    return 'Monitoring';
  };

  return (
    <div
      className={`bg-slate-900 border rounded-lg p-6 ${getBorderClass()}`}
      data-testid="api-health-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity
            className={`h-5 w-5 ${hasDownAPI ? 'text-red-500' : 'text-emerald-500'}`}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-white">API Health</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Refresh health status"
            aria-label="Refresh API health status"
            data-testid="refresh-button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${getStatusIndicatorClass()} ${
                !hasDownAPI && !hasDegradedAPI ? 'animate-pulse' : ''
              }`}
              aria-hidden="true"
              data-testid="overall-status-indicator"
            />
            <span
              className={`text-sm ${
                hasDownAPI ? 'text-red-400' : hasDegradedAPI ? 'text-yellow-400' : 'text-slate-400'
              }`}
              data-testid="overall-status-text"
            >
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 mb-4 bg-red-950 border border-red-800 rounded-lg"
          data-testid="error-message"
        >
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* API Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="api-cards-grid">
        {loading ? (
          // Loading skeletons
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : (
          // Actual API status cards
          apiStatuses.map(api => <APIStatusCard key={api.name} api={api} />)
        )}
      </div>

      {/* Footer with polling info */}
      <div className="mt-4 text-xs text-slate-500 text-center">Auto-refreshes every 60 seconds</div>
    </div>
  );
}
