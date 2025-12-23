/**
 * BudgetUtilization Component
 *
 * Displays comprehensive budget spending breakdown and utilization metrics.
 * Shows total spending, budget remaining, position-based breakdown, and visual chart.
 *
 * Story: 12.3 - Display Total Spending and Budget Utilization
 */

import { SpendingChart } from './SpendingChart';
import { formatCurrency } from '../utils/formatCurrency';
import type { BudgetUtilizationProps } from '../types/summary.types';

/**
 * BudgetUtilization displays budget spending breakdown and utilization metrics.
 * Shows total spent, remaining budget, spending by position category, and visual chart.
 *
 * @param budget - Budget state (initial, spent, remaining)
 * @param spendingByPosition - Spending breakdown by position category
 */
export function BudgetUtilization({ budget, spendingByPosition }: BudgetUtilizationProps) {
  const utilizationPercent = ((budget.spent / budget.initial) * 100).toFixed(1);
  const isUnderspent = budget.remaining > 5;

  return (
    <section className="bg-slate-900 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Budget Utilization</h2>

      {/* Total Spending and Budget Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total Spent */}
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(budget.spent)} <span className="text-slate-500">of</span>{' '}
            {formatCurrency(budget.initial)}
          </p>
          <p className="text-emerald-400 text-sm mt-1">{utilizationPercent}% utilized</p>
        </div>

        {/* Budget Remaining */}
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Budget Remaining</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(budget.remaining)}</p>
          {isUnderspent && (
            <p className="text-yellow-500 text-sm mt-1">
              ⚠️ You left {formatCurrency(budget.remaining)} on the table
            </p>
          )}
        </div>
      </div>

      {/* Spending Breakdown by Position */}
      {spendingByPosition && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Spending by Position</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Hitters */}
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-emerald-400 text-sm font-medium mb-1">Hitters</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(spendingByPosition.hitters.amount)}
                </p>
                <p className="text-slate-400 text-sm">
                  {spendingByPosition.hitters.percentage.toFixed(1)}%
                </p>
              </div>

              {/* Pitchers */}
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-blue-400 text-sm font-medium mb-1">Pitchers</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(spendingByPosition.pitchers.amount)}
                </p>
                <p className="text-slate-400 text-sm">
                  {spendingByPosition.pitchers.percentage.toFixed(1)}%
                </p>
              </div>

              {/* Bench */}
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm font-medium mb-1">Bench</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(spendingByPosition.bench.amount)}
                </p>
                <p className="text-slate-400 text-sm">
                  {spendingByPosition.bench.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Visual Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Spending Distribution</h3>
            <SpendingChart
              data={{
                hitters: spendingByPosition.hitters,
                pitchers: spendingByPosition.pitchers,
                bench: spendingByPosition.bench,
              }}
            />
          </div>
        </>
      )}
    </section>
  );
}

export default BudgetUtilization;
