/**
 * ValueComparison Component
 *
 * Displays a visual bar comparison of auction price vs adjusted value.
 * Uses proportional bars to show the difference between paid and value.
 * Colors indicate steal (green) or overpay (red).
 *
 * Story: 12.4 - Highlight Steals with Visual Comparison
 */

interface ValueComparisonProps {
  auctionPrice: number;
  adjustedValue: number;
}

/**
 * ValueComparison displays auction price and adjusted value side-by-side
 * with visual bar comparison and delta highlighting.
 *
 * @param auctionPrice - Amount paid in auction
 * @param adjustedValue - Inflation-adjusted value
 */
export function ValueComparison({ auctionPrice, adjustedValue }: ValueComparisonProps) {
  const delta = adjustedValue - auctionPrice;
  const isSteal = delta > 0;
  const isFair = delta === 0;

  // Calculate bar widths as percentages of the max value
  const maxValue = Math.max(auctionPrice, adjustedValue, 1); // Avoid division by zero
  const auctionWidth = (auctionPrice / maxValue) * 100;
  const valueWidth = (adjustedValue / maxValue) * 100;

  // Colors based on steal/overpay
  const auctionColor = isSteal ? 'bg-emerald-500' : isFair ? 'bg-slate-500' : 'bg-red-500';
  const deltaColor = isSteal ? 'text-emerald-400' : isFair ? 'text-slate-400' : 'text-red-400';

  return (
    <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg">
      {/* Paid row */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Paid</span>
          <span className={isSteal ? 'text-emerald-400 font-medium' : 'text-slate-300'}>
            ${auctionPrice}
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${auctionColor} rounded-full transition-all`}
            style={{ width: `${auctionWidth}%` }}
          />
        </div>
      </div>

      {/* Value row */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Value</span>
          <span className="text-slate-300">${adjustedValue}</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-500 rounded-full transition-all"
            style={{ width: `${valueWidth}%` }}
          />
        </div>
      </div>

      {/* Delta display */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-700">
        <span className="text-sm text-slate-400">
          {isSteal ? 'Savings' : isFair ? 'Fair Value' : 'Overpaid'}
        </span>
        <span className={`font-semibold ${deltaColor}`}>
          {isFair ? '$0' : `$${Math.abs(delta)}`}
        </span>
      </div>
    </div>
  );
}

export default ValueComparison;
