/**
 * Connection Metrics Widget Component
 *
 * Dashboard widget that displays 7-day connection success metrics for all API integrations.
 * Features:
 * - Success rate percentages for each API
 * - 7-day trend chart using recharts
 * - Color-coded rates: green (>=95%), yellow (90-95%), red (<90%)
 * - Interactive chart with click-to-drill-down
 * - Automatic 2-minute polling
 * - Dark slate theme with emerald accents
 *
 * Story: 13.5 - View Connection Success Metrics
 *
 * @example
 * ```tsx
 * <ConnectionMetricsWidget />
 * ```
 */

import { Wifi, RefreshCw, X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useConnectionMetrics } from '../hooks/useConnectionMetrics';
import { getSuccessRateColor, SUCCESS_THRESHOLDS } from '../services/connectionMetricsService';
import type { ConnectionMetrics } from '../types/admin.types';

/** Color palette for chart lines and success indicators */
const COLORS = {
  couch_managers: '#10b981', // emerald-500
  fangraphs: '#3b82f6', // blue-500
  google_sheets: '#8b5cf6', // violet-500
} as const;

const SUCCESS_RATE_COLORS = {
  green: 'text-emerald-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
} as const;

const SUCCESS_RATE_BG_COLORS = {
  green: 'bg-emerald-500/20 border-emerald-500/40',
  yellow: 'bg-yellow-500/20 border-yellow-500/40',
  red: 'bg-red-500/20 border-red-500/40',
} as const;

/**
 * Format date for display (e.g., "Dec 23")
 */
function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format date for full display (e.g., "December 23, 2025")
 */
function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Loading skeleton for metrics cards
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="h-5 w-24 bg-slate-700 rounded mb-2" />
            <div className="h-8 w-16 bg-slate-700 rounded mb-2" />
            <div className="h-4 w-32 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="bg-slate-800 rounded-lg p-4 h-64 border border-slate-700">
        <div className="h-full w-full bg-slate-700/50 rounded" />
      </div>
    </div>
  );
}

/**
 * Empty state when no metrics data is available
 */
function EmptyState() {
  return (
    <div className="text-center py-8 text-slate-400">
      <Wifi className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No connection metrics available</p>
      <p className="text-xs text-slate-500 mt-1">Health checks will populate this data</p>
    </div>
  );
}

/**
 * API Metrics Card component
 */
interface MetricsCardProps {
  metrics: ConnectionMetrics;
}

function MetricsCard({ metrics }: MetricsCardProps) {
  const colorKey = getSuccessRateColor(metrics.successRate7d);

  return (
    <div
      className={`bg-slate-800 rounded-lg p-4 border ${SUCCESS_RATE_BG_COLORS[colorKey]}`}
      data-testid={`metrics-card-${metrics.apiKey}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-300">{metrics.apiName}</h3>
        <div
          className={`h-2 w-2 rounded-full ${
            colorKey === 'green'
              ? 'bg-emerald-500'
              : colorKey === 'yellow'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
          aria-hidden="true"
        />
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-2xl font-bold ${SUCCESS_RATE_COLORS[colorKey]}`}>
          {metrics.successRate7d.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-500">success rate</span>
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>
          {metrics.successfulCalls.toLocaleString()} / {metrics.totalCalls.toLocaleString()} calls
        </span>
        <span>{metrics.failedCalls.toLocaleString()} failed</span>
      </div>
    </div>
  );
}

/**
 * Custom tooltip for the chart
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !label) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-slate-300 font-medium mb-2">{formatDateFull(label)}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.dataKey}:</span>
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.value.toFixed(1)}%
          </span>
        </div>
      ))}
      <p className="text-xs text-slate-500 mt-2">Click for details</p>
    </div>
  );
}

/**
 * Daily details modal
 */
interface DailyDetailsModalProps {
  date: string;
  details: Array<{
    apiName: string;
    successRate: number;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    avgResponseTimeMs: number | null;
  }>;
  loading: boolean;
  onClose: () => void;
}

function DailyDetailsModal({ date, details, loading, onClose }: DailyDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      data-testid="daily-details-modal"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Details for {formatDateFull(date)}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-800 rounded" />
            ))}
          </div>
        ) : details.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No data for this date</p>
        ) : (
          <div className="space-y-3">
            {details.map(detail => {
              const colorKey = getSuccessRateColor(detail.successRate);
              return (
                <div
                  key={detail.apiName}
                  className="bg-slate-800 rounded-lg p-3 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-300">{detail.apiName}</span>
                    <span className={`font-bold ${SUCCESS_RATE_COLORS[colorKey]}`}>
                      {detail.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <span>Total: {detail.totalCalls.toLocaleString()}</span>
                    <span>Success: {detail.successfulCalls.toLocaleString()}</span>
                    <span>Failed: {detail.failedCalls.toLocaleString()}</span>
                    <span>
                      Avg:{' '}
                      {detail.avgResponseTimeMs
                        ? `${detail.avgResponseTimeMs.toFixed(0)}ms`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Prepare chart data from metrics
 */
function prepareChartData(metrics: ConnectionMetrics[]): Array<Record<string, string | number>> {
  // Collect all unique dates
  const dateSet = new Set<string>();
  metrics.forEach(m => m.dailyRates.forEach(r => dateSet.add(r.date)));
  const dates = Array.from(dateSet).sort();

  // Create data points for each date
  return dates.map(date => {
    const dataPoint: Record<string, string | number> = { date };
    metrics.forEach(m => {
      const rate = m.dailyRates.find(r => r.date === date);
      dataPoint[m.apiName] = rate?.successRate ?? 0;
    });
    return dataPoint;
  });
}

export function ConnectionMetricsWidget() {
  const {
    metrics,
    loading,
    error,
    lowSuccessCount,
    refetch,
    selectedDate,
    selectDate,
    dailyDetails,
    loadingDetails,
  } = useConnectionMetrics();

  const chartData = prepareChartData(metrics);

  // Handle chart click for drill-down
  const handleChartClick = (data: { activeLabel?: string } | null) => {
    if (data?.activeLabel) {
      selectDate(data.activeLabel);
    }
  };

  // Determine border color based on low success count
  const getBorderClass = () => {
    if (lowSuccessCount > 0) return 'border-yellow-500';
    return 'border-slate-800';
  };

  return (
    <div
      className={`bg-slate-900 border rounded-lg p-6 ${getBorderClass()}`}
      data-testid="connection-metrics-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wifi
            className={`h-5 w-5 ${lowSuccessCount > 0 ? 'text-yellow-500' : 'text-emerald-500'}`}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-white">Connection Success Metrics</h2>
          {lowSuccessCount > 0 && (
            <span
              className="px-2 py-0.5 text-xs font-bold bg-yellow-600 text-white rounded-full"
              data-testid="low-success-badge"
            >
              {lowSuccessCount} below {SUCCESS_THRESHOLDS.GREEN}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Refresh metrics"
            aria-label="Refresh connection metrics"
            data-testid="refresh-button"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                lowSuccessCount > 0 ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'
              }`}
              aria-hidden="true"
              data-testid="overall-status-indicator"
            />
            <span
              className={`text-sm ${lowSuccessCount > 0 ? 'text-yellow-400' : 'text-slate-400'}`}
              data-testid="overall-status-text"
            >
              {lowSuccessCount > 0 ? `${lowSuccessCount} APIs need attention` : 'All healthy'}
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
          <Wifi className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : metrics.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Metrics Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            data-testid="metrics-cards-grid"
          >
            {metrics.map(m => (
              <MetricsCard key={m.apiKey} metrics={m} />
            ))}
          </div>

          {/* 7-Day Trend Chart */}
          <div
            className="bg-slate-800 rounded-lg p-4 border border-slate-700"
            data-testid="trend-chart"
          >
            <h3 className="text-sm font-medium text-slate-300 mb-3">7-Day Success Rate Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  onClick={handleChartClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateShort}
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={value => <span className="text-slate-300 text-sm">{value}</span>}
                  />
                  {/* Reference lines for thresholds */}
                  {metrics.map(m => (
                    <Line
                      key={m.apiKey}
                      type="monotone"
                      dataKey={m.apiName}
                      stroke={COLORS[m.apiKey] || '#10b981'}
                      strokeWidth={2}
                      dot={{ r: 4, fill: COLORS[m.apiKey] || '#10b981' }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Footer with threshold info and polling info */}
      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>
          Thresholds: Green (≥{SUCCESS_THRESHOLDS.GREEN}%), Yellow ({SUCCESS_THRESHOLDS.YELLOW}-
          {SUCCESS_THRESHOLDS.GREEN}%), Red (&lt;{SUCCESS_THRESHOLDS.YELLOW}%)
        </span>
        <span>Auto-refreshes every 2 minutes</span>
      </div>

      {/* Daily Details Modal */}
      {selectedDate && (
        <DailyDetailsModal
          date={selectedDate}
          details={dailyDetails}
          loading={loadingDetails}
          onClose={() => selectDate(null)}
        />
      )}
    </div>
  );
}
