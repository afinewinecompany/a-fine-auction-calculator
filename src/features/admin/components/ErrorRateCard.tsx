/**
 * Error Rate Card Component
 *
 * Displays error rate data for a single API integration with:
 * - Error rate percentage (color-coded based on 5% threshold)
 * - Trend indicator (up/down/stable arrow)
 * - Error count and total checks
 * - Click handler for drill-down navigation
 *
 * Story: 13.4 - View Error Rates with Automated Alerts
 *
 * @example
 * ```tsx
 * <ErrorRateCard
 *   errorRate={errorRate}
 *   onClick={() => navigateToErrorLogs(errorRate.apiKey)}
 * />
 * ```
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ErrorRate, ErrorRateTrend } from '../types/admin.types';

interface ErrorRateCardProps {
  /** Error rate data for the API */
  errorRate: ErrorRate;
  /** Click handler for drill-down navigation */
  onClick?: () => void;
}

/** Trend icon mapping */
const trendIcons: Record<ErrorRateTrend, React.ReactNode> = {
  up: <TrendingUp className="h-4 w-4 text-red-400" aria-label="Trending up" />,
  down: <TrendingDown className="h-4 w-4 text-emerald-400" aria-label="Trending down" />,
  stable: <Minus className="h-4 w-4 text-slate-400" aria-label="Stable" />,
};

/** Trend label mapping for accessibility */
const trendLabels: Record<ErrorRateTrend, string> = {
  up: 'Error rate increasing',
  down: 'Error rate decreasing',
  stable: 'Error rate stable',
};

/**
 * Format error rate percentage for display
 */
function formatErrorRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function ErrorRateCard({ errorRate, onClick }: ErrorRateCardProps) {
  const isAboveThreshold = errorRate.isAboveThreshold;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-lg p-4 transition-all
        ${
          isAboveThreshold
            ? 'bg-red-900/50 border border-red-700 hover:bg-red-900/70'
            : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
        }
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      aria-label={`${errorRate.apiName}: ${formatErrorRate(errorRate.errorRate24h)} error rate. ${trendLabels[errorRate.trend]}`}
      data-testid={`error-rate-card-${errorRate.apiKey}`}
      type="button"
    >
      {/* Header: API name and threshold indicator */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">{errorRate.apiName}</h3>
        {isAboveThreshold && (
          <span
            className="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded"
            data-testid="alert-badge"
          >
            ALERT
          </span>
        )}
      </div>

      {/* Main error rate display */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-3xl font-bold ${isAboveThreshold ? 'text-red-400' : 'text-emerald-400'}`}
          data-testid="error-rate-value"
        >
          {formatErrorRate(errorRate.errorRate24h)}
        </span>
        <div
          className="flex items-center gap-1"
          title={trendLabels[errorRate.trend]}
          data-testid="trend-indicator"
        >
          {trendIcons[errorRate.trend]}
          <span className="text-xs text-slate-400">24h</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex justify-between text-sm text-slate-400">
        <span data-testid="error-count">
          {errorRate.errorCount} error{errorRate.errorCount !== 1 ? 's' : ''}
        </span>
        <span data-testid="total-checks">{errorRate.totalChecks} checks</span>
      </div>

      {/* Click hint */}
      {onClick && (
        <div className="mt-3 text-xs text-slate-500 text-center">Click to view error logs</div>
      )}
    </button>
  );
}
