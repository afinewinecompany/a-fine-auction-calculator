/**
 * API Status Card Component
 *
 * Displays health status for a single API integration with:
 * - Status indicator (color-coded dot)
 * - Response time
 * - Error rate percentage
 * - Last successful call timestamp
 * - Expandable recent errors section
 * - Click to view error logs when API has errors (Story 13.10)
 *
 * Story: 13.3 - Monitor API Health for Integrations
 * Story: 13.10 - Drill Down into Error Logs
 *
 * @example
 * ```tsx
 * <APIStatusCard api={apiHealthStatus} />
 * ```
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { APIHealthStatus, APIHealthStatusType, APIName } from '../types/admin.types';
import { generatePath } from '@/routes';

interface APIStatusCardProps {
  /** API health status data */
  api: APIHealthStatus;
}

/** Color mapping for status indicator dot */
const statusDotColors: Record<APIHealthStatusType, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
};

/** Color mapping for status text */
const statusTextColors: Record<APIHealthStatusType, string> = {
  healthy: 'text-emerald-400',
  degraded: 'text-yellow-400',
  down: 'text-red-400',
};

/** Human-readable status labels */
const statusLabels: Record<APIHealthStatusType, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
};

/**
 * Format response time for display
 */
function formatResponseTime(ms: number | null): string {
  if (ms === null) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Format last successful call timestamp
 */
function formatLastSuccess(timestamp: string | null): string {
  if (!timestamp) return 'Never';
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/** Map API display name to API key for navigation */
const apiNameToKey: Record<string, APIName> = {
  'Couch Managers': 'couch_managers',
  Fangraphs: 'fangraphs',
  'Google Sheets': 'google_sheets',
};

export function APIStatusCard({ api }: APIStatusCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const hasErrors = api.recentErrors.length > 0;
  const isUnhealthy = api.status === 'degraded' || api.status === 'down';
  const apiKey = apiNameToKey[api.name];

  /**
   * Navigate to error logs page for this API
   */
  const handleViewErrorLogs = () => {
    if (apiKey) {
      navigate(generatePath.errorLogs(apiKey));
    }
  };

  return (
    <div
      className="bg-slate-800 rounded-lg p-4"
      data-testid={`api-status-card-${api.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Header: API name and status dot */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">{api.name}</h3>
        <div
          className={`h-3 w-3 rounded-full ${statusDotColors[api.status]} ${
            api.status === 'healthy' ? 'animate-pulse' : ''
          }`}
          aria-label={`Status: ${statusLabels[api.status]}`}
          data-testid="status-indicator"
        />
      </div>

      {/* Metrics grid */}
      <div className="space-y-2 text-sm">
        {/* Status */}
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className={`font-medium ${statusTextColors[api.status]}`} data-testid="status-text">
            {statusLabels[api.status]}
          </span>
        </div>

        {/* Response Time */}
        <div className="flex justify-between">
          <span className="text-slate-400">Response:</span>
          <span className="text-white" data-testid="response-time">
            {formatResponseTime(api.responseTime)}
          </span>
        </div>

        {/* Error Rate */}
        <div className="flex justify-between">
          <span className="text-slate-400">Error Rate:</span>
          <span
            className={`text-white ${api.errorRate > 10 ? 'text-red-400' : ''}`}
            data-testid="error-rate"
          >
            {api.errorRate.toFixed(1)}%
          </span>
        </div>

        {/* Last Success */}
        <div className="flex justify-between">
          <span className="text-slate-400">Last Success:</span>
          <span className="text-white text-xs" data-testid="last-success">
            {formatLastSuccess(api.lastSuccessfulCall)}
          </span>
        </div>
      </div>

      {/* Expandable Recent Errors */}
      {hasErrors && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
            aria-expanded={expanded}
            data-testid="toggle-errors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Recent Errors ({api.recentErrors.length})
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Recent Errors ({api.recentErrors.length})
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-2 space-y-1" data-testid="error-list">
              {api.recentErrors.map((error, index) => (
                <div
                  key={index}
                  className="text-xs text-red-400 bg-red-950 p-2 rounded break-words"
                >
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Error Logs button - shown when API is unhealthy */}
      {isUnhealthy && apiKey && (
        <button
          onClick={handleViewErrorLogs}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-900/50 border border-red-700 text-red-300 rounded hover:bg-red-900/70 transition-colors"
          type="button"
          data-testid="view-error-logs-button"
        >
          <ExternalLink className="h-4 w-4" />
          View Error Logs
        </button>
      )}
    </div>
  );
}
