/**
 * SpendingChart Component
 *
 * Visual chart displaying spending distribution by position category.
 * Uses bar chart to show Hitters, Pitchers, and Bench spending.
 *
 * Story: 12.3 - Display Total Spending and Budget Utilization
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Position spending data for chart
 */
export interface SpendingChartData {
  hitters: {
    amount: number;
    percentage: number;
  };
  pitchers: {
    amount: number;
    percentage: number;
  };
  bench: {
    amount: number;
    percentage: number;
  };
}

/**
 * Props for SpendingChart component
 */
export interface SpendingChartProps {
  /** Spending data by position category */
  data: SpendingChartData;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Color scheme for chart bars matching dark slate theme
 */
const COLORS = {
  hitters: '#10b981', // emerald-500
  pitchers: '#3b82f6', // blue-500
  bench: '#6b7280', // gray-500
};

/**
 * Custom tooltip for chart displaying detailed spending info
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-white font-semibold mb-1">{data.name}</p>
      <p className="text-emerald-400 text-sm">
        {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
      </p>
    </div>
  );
}

/**
 * SpendingChart displays spending distribution as a bar chart.
 * Shows Hitters, Pitchers, and Bench spending with dollar amounts and percentages.
 *
 * @param data - Spending breakdown by position category
 * @param className - Optional CSS class name
 */
export function SpendingChart({ data, className = '' }: SpendingChartProps) {
  // Transform data for recharts format
  const chartData = [
    {
      name: 'Hitters',
      value: data.hitters.amount,
      percentage: data.hitters.percentage,
      fill: COLORS.hitters,
    },
    {
      name: 'Pitchers',
      value: data.pitchers.amount,
      percentage: data.pitchers.percentage,
      fill: COLORS.pitchers,
    },
    {
      name: 'Bench',
      value: data.bench.amount,
      percentage: data.bench.percentage,
      fill: COLORS.bench,
    },
  ];

  return (
    <div className={`w-full ${className}`} role="region" aria-label="Spending distribution chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            tickLine={{ stroke: '#4b5563' }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            tickLine={{ stroke: '#4b5563' }}
            tickFormatter={value => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937' }} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
            formatter={value => {
              const item = chartData.find(d => d.name === value);
              return (
                <span className="text-slate-300">
                  {value}: {formatCurrency(item?.value || 0)} ({item?.percentage.toFixed(1)}%)
                </span>
              );
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;
