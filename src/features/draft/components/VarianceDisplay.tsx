/**
 * VarianceDisplay Component
 *
 * Displays variance tracking for drafted players with progressive disclosure.
 * Shows steals vs overpays count with expandable player list.
 *
 * Story: 8.3 - Display Variance Tracking for Drafted Players
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { DraftedPlayer } from '../types/draft.types';
import {
  calculatePlayerVariance,
  calculateVarianceSummary,
  formatVariancePercent,
  getVarianceColor,
  getVarianceBackground,
  type PlayerVariance,
  type VarianceSummary,
} from '../utils/varianceCalculations';

/**
 * Props for the VarianceDisplay component
 */
export interface VarianceDisplayProps {
  /** Array of drafted players */
  draftedPlayers: DraftedPlayer[];
  /** Function to get adjusted value for a player */
  getAdjustedValue: (playerId: string) => number;
}

/**
 * VarianceDisplay shows steals/overpays with expandable details
 */
export function VarianceDisplay({ draftedPlayers, getAdjustedValue }: VarianceDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate variance for all drafted players
  const summary: VarianceSummary = useMemo(() => {
    const variances: PlayerVariance[] = draftedPlayers.map(player => {
      const adjustedValue = getAdjustedValue(player.playerId);
      return calculatePlayerVariance(player, adjustedValue);
    });

    return calculateVarianceSummary(variances);
  }, [draftedPlayers, getAdjustedValue]);

  // Sort players by absolute variance (most significant first)
  const sortedPlayers = useMemo(() => {
    return [...summary.players].sort(
      (a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent)
    );
  }, [summary.players]);

  // Get top steals and overpays for display
  const topSteals = useMemo(
    () => sortedPlayers.filter(p => p.category === 'steal').slice(0, 3),
    [sortedPlayers]
  );

  const topOverpays = useMemo(
    () => sortedPlayers.filter(p => p.category === 'overpay').slice(0, 3),
    [sortedPlayers]
  );

  const hasData = draftedPlayers.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="p-3 bg-slate-800 rounded-lg">
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between text-left hover:bg-slate-750 rounded px-1 -mx-1 transition-colors"
            aria-label={isOpen ? 'Hide variance details' : 'Show variance details'}
          >
            <div className="flex-1">
              <div className="text-xs text-slate-400 mb-1">Variance</div>
              <div className="flex items-center gap-2">
                {hasData ? (
                  <>
                    <span className="text-lg font-semibold text-emerald-500">{summary.steals}</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-lg font-semibold text-orange-500">
                      {summary.overpays}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">steals/overpays</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-slate-400">--</span>
                )}
              </div>
            </div>
            <div className="text-slate-400 ml-2">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-3">
          <TooltipProvider>
            {/* Steals Section */}
            {topSteals.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">Top Steals</div>
                {topSteals.map(player => (
                  <PlayerVarianceRow key={player.playerId} player={player} />
                ))}
              </div>
            )}

            {/* Overpays Section */}
            {topOverpays.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">Top Overpays</div>
                {topOverpays.map(player => (
                  <PlayerVarianceRow key={player.playerId} player={player} />
                ))}
              </div>
            )}

            {/* No data message */}
            {!hasData && (
              <div className="text-sm text-slate-400 text-center py-2">No players drafted yet</div>
            )}
          </TooltipProvider>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/**
 * Row component for displaying individual player variance
 */
function PlayerVarianceRow({ player }: { player: PlayerVariance }) {
  const colorClass = getVarianceColor(player.category);
  const bgClass = getVarianceBackground(player.category);
  const tooltipText =
    player.category === 'steal'
      ? `${player.playerName} was a steal at $${player.purchasePrice} (value: $${player.adjustedValue.toFixed(0)})`
      : player.category === 'overpay'
        ? `${player.playerName} was overpaid at $${player.purchasePrice} (value: $${player.adjustedValue.toFixed(0)})`
        : `${player.playerName} was fairly priced at $${player.purchasePrice} (value: $${player.adjustedValue.toFixed(0)})`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`flex items-center justify-between p-2 rounded text-sm ${bgClass} cursor-pointer`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-200 truncate font-medium">{player.playerName}</span>
            <span className="text-slate-400 text-xs">({player.position})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-xs">${player.purchasePrice}</span>
            <span className={`font-semibold ${colorClass}`}>
              {formatVariancePercent(player.variancePercent)}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-slate-800 border-slate-700">
        <p className="text-sm text-white">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default VarianceDisplay;
