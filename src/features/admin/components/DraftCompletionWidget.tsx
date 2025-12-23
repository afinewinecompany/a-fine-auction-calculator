/**
 * Draft Completion Widget Component
 *
 * Dashboard widget that displays 30-day draft completion metrics.
 * Features:
 * - Completion statistics (total, completed, abandoned, error)
 * - Completion rate percentage with color-coded indicator
 * - 30-day trend chart using recharts
 * - Color-coded rates: green (>=80%), yellow (70-80%), red (<70%)
 * - Automatic 5-minute polling
 * - Dark slate theme with emerald accents
 *
 * Story: 13.8 - Track Draft Completion Rates
 *
 * @example
 * ```tsx
 * <DraftCompletionWidget />
 * ```
 */

import { CheckCircle, RefreshCw, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useDraftCompletionMetrics } from '../hooks/useDraftCompletionMetrics';
import {
  getCompletionRateColor,
  COMPLETION_RATE_THRESHOLDS,
  type DailyCompletionRate,
} from '../types/admin.types';

/** Color classes for completion rate indicators */
const RATE_COLORS = {
  green: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/40',
    indicator: 'bg-emerald-500',
    chart: '#10b981',
  },
  yellow: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/40',
    indicator: 'bg-yellow-500',
    chart: '#eab308',
  },
  red: {
    text: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    indicator: 'bg-red-500',
    chart: '#ef4444',
  },
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
 * Loading skeleton for the widget
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="h-4 w-20 bg-slate-700 rounded mb-2" />
            <div className="h-8 w-12 bg-slate-700 rounded" />
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
      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No draft completion data available</p>
      <p className="text-xs text-slate-500 mt-1">Drafts will populate this data</p>
    </div>
  );
}

/**
 * Stat card component for individual metrics
 */
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass?: string;
}

function StatCard({ label, value, icon, colorClass = 'text-slate-300' }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClass}`}>{value.toLocaleString()}</p>
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
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !label) return null;

  const rate = payload[0]?.value ?? 0;
  const colorKey = getCompletionRateColor(rate);
  const colors = RATE_COLORS[colorKey];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-slate-300 font-medium mb-2">{formatDateFull(label)}</p>
      <div className="flex items-center gap-2 text-sm">
        <div className={`h-2 w-2 rounded-full ${colors.indicator}`} />
        <span className="text-slate-400">Completion Rate:</span>
        <span className={`font-bold ${colors.text}`}>{rate.toFixed(1)}%</span>
      </div>
    </div>
  );
}

/**
 * Prepare chart data from daily rates
 */
function prepareChartData(dailyRates: DailyCompletionRate[]): DailyCompletionRate[] {
  return dailyRates.map(rate => ({
    date: rate.date,
    completionRate: rate.completionRate,
  }));
}

export function DraftCompletionWidget() {
  const { metrics, loading, error, isBelowTarget, refetch } = useDraftCompletionMetrics();

  const colorKey = metrics ? getCompletionRateColor(metrics.completionRate) : 'green';
  const colors = RATE_COLORS[colorKey];
  const chartData = metrics ? prepareChartData(metrics.dailyRates) : [];

  // Determine border color based on target status
  const getBorderClass = () => {
    if (isBelowTarget) return 'border-yellow-500';
    return 'border-slate-800';
  };

  return (
    <div
      className={`bg-slate-900 border rounded-lg p-6 ${getBorderClass()}`}
      data-testid="draft-completion-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle
            className={`h-5 w-5 ${isBelowTarget ? 'text-yellow-500' : 'text-emerald-500'}`}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-white">Draft Completion Rates</h2>
          {isBelowTarget && metrics && (
            <span
              className="px-2 py-0.5 text-xs font-bold bg-yellow-600 text-white rounded-full"
              data-testid="below-target-badge"
            >
              Below {COMPLETION_RATE_THRESHOLDS.GREEN}% target
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Refresh metrics"
            aria-label="Refresh completion metrics"
            data-testid="refresh-button"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Current rate indicator */}
          {metrics && !loading && (
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${colors.indicator} ${!isBelowTarget ? 'animate-pulse' : ''}`}
                aria-hidden="true"
                data-testid="rate-indicator"
              />
              <span
                className={`text-lg font-bold ${colors.text}`}
                data-testid="completion-rate-display"
              >
                {metrics.completionRate.toFixed(1)}%
              </span>
            </div>
          )}
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

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : !metrics || metrics.totalDrafts === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="stats-grid">
            <StatCard
              label="Total Drafts"
              value={metrics.totalDrafts}
              icon={<TrendingUp className="h-4 w-4 text-slate-400" />}
            />
            <StatCard
              label="Completed"
              value={metrics.completedDrafts}
              icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
              colorClass="text-emerald-400"
            />
            <StatCard
              label="Abandoned"
              value={metrics.abandonedDrafts}
              icon={<XCircle className="h-4 w-4 text-yellow-500" />}
              colorClass="text-yellow-400"
            />
            <StatCard
              label="Errors"
              value={metrics.errorDrafts}
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
              colorClass="text-red-400"
            />
          </div>

          {/* 30-Day Trend Chart */}
          {chartData.length > 0 && (
            <div
              className="bg-slate-800 rounded-lg p-4 border border-slate-700"
              data-testid="trend-chart"
            >
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                30-Day Completion Rate Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.chart} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.chart} stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    {/* Target line at 80% */}
                    <ReferenceLine
                      y={COMPLETION_RATE_THRESHOLDS.GREEN}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      label={{
                        value: `Target (${COMPLETION_RATE_THRESHOLDS.GREEN}%)`,
                        position: 'right',
                        fill: '#10b981',
                        fontSize: 11,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completionRate"
                      stroke={colors.chart}
                      strokeWidth={2}
                      fill="url(#completionGradient)"
                      dot={{ r: 3, fill: colors.chart }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer with threshold info and polling info */}
      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>
          Thresholds: Green (≥{COMPLETION_RATE_THRESHOLDS.GREEN}%), Yellow (
          {COMPLETION_RATE_THRESHOLDS.YELLOW}-{COMPLETION_RATE_THRESHOLDS.GREEN}%), Red (&lt;
          {COMPLETION_RATE_THRESHOLDS.YELLOW}%)
        </span>
        <span>Auto-refreshes every 5 minutes</span>
      </div>
    </div>
  );
}
