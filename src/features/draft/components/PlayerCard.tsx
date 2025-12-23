/**
 * PlayerCard Component
 *
 * Displays individual player information in the roster overview.
 * Shows player name, position(s), auction price, projected value, and variance.
 *
 * Story: 12.2 - Display Complete Roster Organized by Position
 */

import type { DraftedPlayer } from '../types/draft.types';

/**
 * Props for the PlayerCard component
 */
export interface PlayerCardProps {
  /** Drafted player data to display */
  player: DraftedPlayer;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Formats a number as currency with dollar sign
 */
function formatCurrency(value: number): string {
  return `$${Math.abs(value)}`;
}

/**
 * Formats variance with appropriate sign
 * Negative variance (paid less than value) = good, show with +
 * Positive variance (paid more than value) = bad, show with -
 */
function formatVariance(variance: number): string {
  if (variance === 0) return '$0';
  if (variance < 0) return `+$${Math.abs(variance)}`; // Paid less = savings
  return `-$${variance}`; // Paid more = overpay
}

/**
 * Gets the CSS class for variance text color
 */
function getVarianceColor(variance: number): string {
  if (variance < 0) return 'text-emerald-400'; // Good value (steal)
  if (variance > 0) return 'text-red-400'; // Overpay
  return 'text-slate-400'; // Fair value
}

/**
 * Gets the tier badge styling
 */
function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'ELITE':
      return 'bg-amber-600 text-amber-100';
    case 'MID':
      return 'bg-blue-600 text-blue-100';
    case 'LOWER':
      return 'bg-slate-600 text-slate-200';
    default:
      return 'bg-slate-600 text-slate-300';
  }
}

/**
 * PlayerCard displays a single player's information in a card format.
 * Uses dark slate theme with emerald accents for value wins.
 *
 * @param player - Drafted player data
 * @param className - Optional additional CSS classes
 */
export function PlayerCard({ player, className = '' }: PlayerCardProps) {
  const { playerName, position, purchasePrice, projectedValue, variance, tier } = player;

  const varianceText = formatVariance(variance);
  const varianceColor = getVarianceColor(variance);

  return (
    <article className={`bg-slate-800 rounded-lg p-3 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        {/* Player info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{playerName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-slate-400 text-xs">{position}</span>
            {tier && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${getTierBadgeClass(tier)}`}
              >
                {tier}
              </span>
            )}
          </div>
        </div>

        {/* Price and value info */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-white font-bold text-sm">{formatCurrency(purchasePrice)}</span>
          </div>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <span className="text-slate-500 text-xs">Value:</span>
            <span className="text-slate-300 text-xs">{formatCurrency(projectedValue)}</span>
          </div>
          <div className="mt-0.5">
            <span className={`text-xs font-medium ${varianceColor}`}>{varianceText}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default PlayerCard;
