/**
 * Error Rates Widget Component
 *
 * Dashboard widget that displays real-time error rates for all API integrations.
 * Features:
 * - Grid layout with error rate cards for each API
 * - Alert count badge when any API exceeds 5% error threshold
 * - Automatic 60-second polling
 * - Trend indicators (up/down/stable)
 * - Click to navigate to detailed error logs (Story 13.10)
 * - Color-coded: green (<5%), red (>=5%)
 *
 * Story: 13.4 - View Error Rates with Automated Alerts
 *
 * @example
 * ```tsx
 * <ErrorRatesWidget />
 * ```
 */

import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useErrorRates } from '../hooks/useErrorRates';
import { ErrorRateCard } from './ErrorRateCard';
import { ERROR_THRESHOLD } from '../services/errorRateService';
import { generatePath } from '@/routes';

/**
 * Loading skeleton for error rate cards
 */
function LoadingSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg p-4 animate-pulse border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-24 bg-slate-700 rounded" />
        <div className="h-4 w-12 bg-slate-700 rounded" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-16 bg-slate-700 rounded" />
        <div className="h-4 w-8 bg-slate-700 rounded" />
      </div>
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-slate-700 rounded" />
        <div className="h-3 w-16 bg-slate-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Empty state when no error rate data is available
 */
function EmptyState() {
  return (
    <div className="text-center py-8 text-slate-400">
      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No error rate data available</p>
      <p className="text-xs text-slate-500 mt-1">Health checks will populate this data</p>
    </div>
  );
}

export function ErrorRatesWidget() {
  const navigate = useNavigate();
  const { errorRates, loading, error, alertCount, refetch } = useErrorRates();

  // Determine border color based on alert status
  const getBorderClass = () => {
    if (alertCount > 0) return 'border-red-500';
    return 'border-slate-800';
  };

  // Handle click to navigate to error logs (Story 13.10)
  const handleCardClick = (apiKey: string) => {
    navigate(generatePath.errorLogs(apiKey));
  };

  return (
    <div
      className={`bg-slate-900 border rounded-lg p-6 ${getBorderClass()}`}
      data-testid="error-rates-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={`h-5 w-5 ${alertCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-white">Error Rates</h2>
          {alertCount > 0 && (
            <span
              className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full"
              data-testid="alert-count-badge"
            >
              {alertCount} {alertCount === 1 ? 'alert' : 'alerts'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Refresh error rates"
            aria-label="Refresh error rates"
            data-testid="refresh-button"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                alertCount > 0 ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
              }`}
              aria-hidden="true"
              data-testid="overall-status-indicator"
            />
            <span
              className={`text-sm ${alertCount > 0 ? 'text-red-400' : 'text-slate-400'}`}
              data-testid="overall-status-text"
            >
              {alertCount > 0 ? `${alertCount} Above ${ERROR_THRESHOLD}%` : 'All Normal'}
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

      {/* Error Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="error-rate-cards-grid">
        {loading ? (
          // Loading skeletons
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : errorRates.length === 0 ? (
          // Empty state
          <div className="col-span-full">
            <EmptyState />
          </div>
        ) : (
          // Actual error rate cards
          errorRates.map(rate => (
            <ErrorRateCard
              key={rate.apiKey}
              errorRate={rate}
              onClick={() => handleCardClick(rate.apiKey)}
            />
          ))
        )}
      </div>

      {/* Footer with threshold info and polling info */}
      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>Threshold: {ERROR_THRESHOLD}% triggers alert</span>
        <span>Auto-refreshes every 60 seconds</span>
      </div>
    </div>
  );
}
