/**
 * Inflation Performance Widget Component
 *
 * Dashboard widget that displays inflation calculation performance metrics.
 * Features:
 * - Latency percentiles (median, p95, p99)
 * - Total calculations and frequency
 * - Color-coded thresholds: green (<100ms), yellow (100-200ms), red (>200ms)
 * - 24-hour trend chart using recharts
 * - P99 > 500ms alert indicator
 * - Automatic 60-second polling
 * - Dark slate theme with emerald accents
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 * NFR: NFR-M4 (Track median, p95, p99 latency), NFR-M5 (Real-time performance display)
 *
 * @example
 * ```tsx
 * <InflationPerformanceWidget />
 * ```
 */

import { Gauge, RefreshCw, AlertTriangle, Clock, Activity, Zap } from 'lucide-react';
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
import { useInflationPerformanceMetrics } from '../hooks/useInflationPerformanceMetrics';
import {
  getLatencyColorClasses,
  getLatencyThresholdLevel,
  LATENCY_THRESHOLDS,
  type HourlyLatencyPoint,
} from '../types/admin.types';

/**
 * Format hour timestamp for display (e.g., "3 PM")
 */
function formatHourShort(hourStr: string): string {
  const date = new Date(hourStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

/**
 * Format full timestamp for tooltip (e.g., "Dec 23, 3:00 PM")
 */
function formatTimeFull(hourStr: string): string {
  const date = new Date(hourStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format latency value with unit
 */
function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
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
            <div className="h-8 w-16 bg-slate-700 rounded" />
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
      <Gauge className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No performance data available</p>
      <p className="text-xs text-slate-500 mt-1">Inflation calculations will populate this data</p>
    </div>
  );
}

/**
 * Stat card component for individual metrics
 */
interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  colorClass?: string;
  highlight?: boolean;
}

function StatCard({
  label,
  value,
  subValue,
  icon,
  colorClass = 'text-slate-300',
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={`bg-slate-800 rounded-lg p-4 border ${highlight ? 'border-red-500/50' : 'border-slate-700'}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
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

  const latency = payload[0]?.value ?? 0;
  const level = getLatencyThresholdLevel(latency);
  const colors = getLatencyColorClasses(level);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-slate-300 font-medium mb-2">{formatTimeFull(label)}</p>
      <div className="flex items-center gap-2 text-sm">
        <div className={`h-2 w-2 rounded-full ${colors.indicator}`} />
        <span className="text-slate-400">Median Latency:</span>
        <span className={`font-bold ${colors.text}`}>{formatLatency(latency)}</span>
      </div>
    </div>
  );
}

/**
 * Prepare chart data from hourly latencies
 */
function prepareChartData(hourlyLatencies: HourlyLatencyPoint[]): HourlyLatencyPoint[] {
  return hourlyLatencies.map(point => ({
    hour: point.hour,
    medianLatency: point.medianLatency,
  }));
}

export function InflationPerformanceWidget() {
  const { metrics, loading, error, isP99Alert, thresholdLevel, refetch } =
    useInflationPerformanceMetrics();

  const colors = getLatencyColorClasses(thresholdLevel);
  const chartData = metrics ? prepareChartData(metrics.hourlyLatencies) : [];

  // Determine border color based on alert status
  const getBorderClass = () => {
    if (isP99Alert) return 'border-red-500';
    return 'border-slate-800';
  };

  return (
    <div
      className={`bg-slate-900 border rounded-lg p-6 ${getBorderClass()}`}
      data-testid="inflation-performance-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge
            className={`h-5 w-5 ${isP99Alert ? 'text-red-500' : 'text-emerald-500'}`}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-white">Inflation Performance</h2>
          {isP99Alert && metrics && (
            <span
              className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full flex items-center gap-1"
              data-testid="p99-alert-badge"
            >
              <AlertTriangle className="h-3 w-3" />
              P99 &gt; {LATENCY_THRESHOLDS.P99_ALERT}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Refresh metrics"
            aria-label="Refresh performance metrics"
            data-testid="refresh-button"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Current median indicator */}
          {metrics && !loading && metrics.totalCalculations > 0 && (
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${colors.indicator} animate-pulse`}
                aria-hidden="true"
                data-testid="latency-indicator"
              />
              <span className={`text-lg font-bold ${colors.text}`} data-testid="median-display">
                {formatLatency(metrics.medianLatency)}
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
      ) : !metrics || metrics.totalCalculations === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="stats-grid">
            <StatCard
              label="Median Latency"
              value={formatLatency(metrics.medianLatency)}
              subValue="50th percentile"
              icon={<Clock className="h-4 w-4 text-emerald-500" />}
              colorClass={colors.text}
            />
            <StatCard
              label="P95 Latency"
              value={formatLatency(metrics.p95Latency)}
              subValue="95th percentile"
              icon={<Activity className="h-4 w-4 text-yellow-500" />}
              colorClass="text-yellow-400"
            />
            <StatCard
              label="P99 Latency"
              value={formatLatency(metrics.p99Latency)}
              subValue="99th percentile"
              icon={<Zap className="h-4 w-4 text-orange-500" />}
              colorClass={isP99Alert ? 'text-red-400' : 'text-orange-400'}
              highlight={isP99Alert}
            />
            <StatCard
              label="Calculations"
              value={metrics.totalCalculations.toLocaleString()}
              subValue={`${metrics.calculationsPerMinute}/min`}
              icon={<Gauge className="h-4 w-4 text-slate-400" />}
            />
          </div>

          {/* 24-Hour Trend Chart */}
          {chartData.length > 0 && (
            <div
              className="bg-slate-800 rounded-lg p-4 border border-slate-700"
              data-testid="trend-chart"
            >
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                24-Hour Latency Trend (Median)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.chart} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.chart} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={formatHourShort}
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 'auto']}
                      tickFormatter={v => `${v}ms`}
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Target line at 100ms (excellent threshold) */}
                    <ReferenceLine
                      y={LATENCY_THRESHOLDS.EXCELLENT}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      label={{
                        value: `Target (<${LATENCY_THRESHOLDS.EXCELLENT}ms)`,
                        position: 'right',
                        fill: '#10b981',
                        fontSize: 11,
                      }}
                    />
                    {/* Warning line at 200ms */}
                    <ReferenceLine
                      y={LATENCY_THRESHOLDS.WARNING}
                      stroke="#eab308"
                      strokeDasharray="3 3"
                      label={{
                        value: `Warning (${LATENCY_THRESHOLDS.WARNING}ms)`,
                        position: 'right',
                        fill: '#eab308',
                        fontSize: 11,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="medianLatency"
                      stroke={colors.chart}
                      strokeWidth={2}
                      fill="url(#latencyGradient)"
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
          Thresholds: Green (&lt;{LATENCY_THRESHOLDS.EXCELLENT}ms), Yellow (
          {LATENCY_THRESHOLDS.EXCELLENT}-{LATENCY_THRESHOLDS.WARNING}ms), Red (&gt;
          {LATENCY_THRESHOLDS.WARNING}ms) | P99 Alert: &gt;{LATENCY_THRESHOLDS.P99_ALERT}ms
        </span>
        <span>Auto-refreshes every 60 seconds</span>
      </div>
    </div>
  );
}
