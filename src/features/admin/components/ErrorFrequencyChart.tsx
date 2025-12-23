/**
 * Error Frequency Chart Component
 *
 * Displays a bar chart showing error frequency over time.
 * Uses recharts for visualization.
 *
 * Story: 13.10 - Drill Down into Error Logs
 *
 * @example
 * ```tsx
 * <ErrorFrequencyChart data={frequencyData} dateRange="24h" />
 * ```
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import type { ErrorFrequencyPoint, DateRangeOption } from '../types/admin.types';

interface ErrorFrequencyChartProps {
  /** Error frequency data points */
  data: ErrorFrequencyPoint[];
  /** Current date range for proper formatting */
  dateRange: DateRangeOption;
  /** Optional height in pixels */
  height?: number;
}

/**
 * Format time label based on date range
 */
function formatTimeLabel(time: string, dateRange: DateRangeOption): string {
  const date = new Date(time);

  if (dateRange === '24h') {
    return format(date, 'HH:mm');
  }

  return format(date, 'MMM d');
}

/**
 * Custom tooltip for the chart
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  dateRange: DateRangeOption;
}

function CustomTooltip({ active, payload, label, dateRange }: CustomTooltipProps) {
  if (!active || !payload || !payload.length || !label) {
    return null;
  }

  const date = new Date(label);
  const formattedDate =
    dateRange === '24h' ? format(date, 'MMM d, yyyy HH:mm') : format(date, 'MMM d, yyyy');

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-xs text-slate-400 mb-1">{formattedDate}</p>
      <p className="text-sm text-white font-medium">
        <span className="text-red-400">{payload[0].value}</span>{' '}
        {payload[0].value === 1 ? 'error' : 'errors'}
      </p>
    </div>
  );
}

export function ErrorFrequencyChart({ data, dateRange, height = 200 }: ErrorFrequencyChartProps) {
  /**
   * Transform data for recharts with formatted labels
   */
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      label: formatTimeLabel(point.time, dateRange),
    }));
  }, [data, dateRange]);

  /**
   * Calculate max Y-axis value with padding
   */
  const maxCount = useMemo(() => {
    if (data.length === 0) return 10;
    const max = Math.max(...data.map(d => d.count));
    return Math.ceil(max * 1.2) || 10;
  }, [data]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-800 rounded-lg border border-slate-700"
        style={{ height }}
      >
        <p className="text-slate-400 text-sm">No error data to display</p>
      </div>
    );
  }

  return (
    <div
      className="bg-slate-800 rounded-lg border border-slate-700 p-4"
      data-testid="error-frequency-chart"
    >
      <h3 className="text-sm font-medium text-white mb-4">Error Frequency</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: '#475569' }}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: '#475569' }}
            axisLine={{ stroke: '#475569' }}
            domain={[0, maxCount]}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip dateRange={dateRange} />} cursor={{ fill: '#1e293b' }} />
          <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} name="Errors" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ErrorFrequencyChart;
