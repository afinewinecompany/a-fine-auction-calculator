/**
 * PlayerDetailModal Component
 *
 * Displays detailed player information in a modal overlay.
 * Shows player name, team, positions, values, tier, and inflation breakdown.
 *
 * Story: 6.11 - Implement Player Detail Modal
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';
import { TierBadge } from './TierBadge';
import { formatCurrency } from '../utils/formatCurrency';
import type { Player } from '../types/player.types';

export interface PlayerDetailModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatPercent(value: number): string {
  if (!isFinite(value)) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return sign + (value * 100).toFixed(1) + '%';
}

export function PlayerDetailModal({ player, isOpen, onClose }: PlayerDetailModalProps) {
  if (!player) {
    return null;
  }

  // Calculate overall inflation with division-by-zero protection
  const overallInflation =
    player.projectedValue === 0
      ? 0
      : (player.adjustedValue - player.projectedValue) / player.projectedValue;
  // TODO: Replace placeholder calculations with actual inflation store data
  // These are approximations until inflation store integration is complete
  const positionInflation = overallInflation * 0.4;
  const tierInflation = overallInflation * 0.3;
  const budgetFactor = 1 + overallInflation * 0.3;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className={cn(
          'bg-slate-950 border-slate-800 text-slate-100',
          'w-full max-w-lg',
          'sm:max-w-md md:max-w-lg',
          'max-h-[90vh] overflow-y-auto'
        )}
      >
        <DialogHeader className="border-b border-slate-800 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-100">{player.name}</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {player.team} | {player.positions.join(', ')}
          </DialogDescription>
        </DialogHeader>

        <section className="py-4 border-b border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Value
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Projected</div>
              <div className="text-lg font-medium text-slate-300">
                {formatCurrency(player.projectedValue)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Adjusted</div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(player.adjustedValue)}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm text-slate-400 mb-1">Tier</div>
              <TierBadge tier={player.tier} />
            </div>
          </div>
        </section>

        <section className="py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Inflation Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Overall</span>
              <span
                className={cn(
                  'font-medium',
                  overallInflation >= 0 ? 'text-red-400' : 'text-emerald-400'
                )}
              >
                {formatPercent(overallInflation)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Position ({player.positions[0]})</span>
              <span
                className={cn(
                  'font-medium',
                  positionInflation >= 0 ? 'text-red-400' : 'text-emerald-400'
                )}
              >
                {formatPercent(positionInflation)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                Tier ({player.tier === 'ELITE' ? 'Elite' : player.tier === 'MID' ? 'Mid' : 'Lower'})
              </span>
              <span
                className={cn(
                  'font-medium',
                  tierInflation >= 0 ? 'text-red-400' : 'text-emerald-400'
                )}
              >
                {formatPercent(tierInflation)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
              <span className="text-slate-400">Budget Factor</span>
              <span className="font-medium text-slate-200">{budgetFactor.toFixed(2)}x</span>
            </div>
          </div>
        </section>

        {player.status !== 'available' && (
          <section className="py-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Draft Status
            </h3>
            <div className="text-sm">
              {player.status === 'my-team' ? (
                <span className="text-emerald-400 font-medium">
                  On Your Team
                  {player.auctionPrice !== undefined &&
                    ` - Paid ${formatCurrency(player.auctionPrice)}`}
                </span>
              ) : (
                <span className="text-slate-400">
                  Drafted by Team {player.draftedByTeam}
                  {player.auctionPrice !== undefined &&
                    ` for ${formatCurrency(player.auctionPrice)}`}
                </span>
              )}
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PlayerDetailModal;
