/**
 * StealCard Component
 *
 * Displays individual steal information with player details,
 * auction price vs adjusted value, and value gained.
 * Uses emerald/green background to highlight successful value captures.
 *
 * Story: 12.4 - Highlight Steals with Visual Comparison
 */

import type { Steal } from '../utils/valueAnalysis';

interface StealCardProps {
  steal: Steal;
}

/**
 * StealCard displays a single steal with celebration styling.
 * Shows player name, position, auction price, adjusted value, and value gained.
 *
 * @param steal - Steal data including player, prices, and value gained
 */
export function StealCard({ steal }: StealCardProps) {
  const { player, auctionPrice, adjustedValue, valueGained } = steal;

  return (
    <article className="rounded-lg p-4 bg-emerald-950/50 border border-emerald-800/50 hover:bg-emerald-950/70 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate">{player.playerName}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              {player.position}
            </span>
          </div>

          {/* Price comparison */}
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-slate-400">
              Paid: <span className="text-emerald-400 font-medium">${auctionPrice}</span>
            </span>
            <span className="text-slate-500">vs</span>
            <span className="text-slate-400">
              Value: <span className="text-slate-300">${adjustedValue}</span>
            </span>
          </div>
        </div>

        {/* Value gained badge */}
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-emerald-400">${valueGained} below value</div>
        </div>
      </div>
    </article>
  );
}

export default StealCard;
