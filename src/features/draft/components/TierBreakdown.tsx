/**
 * TierBreakdown Component
 *
 * Displays tier-specific inflation breakdown with progressive disclosure.
 * Shows inflation for each tier (Elite, Mid, Lower) with tooltips explaining impact.
 * Highlights the tier with highest inflation.
 *
 * Story: 8.5 - Display Tier-Specific Inflation Breakdown
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { PlayerTier, type Tier } from '@/features/inflation/types/inflation.types';

/**
 * Props for the TierBreakdown component
 */
export interface TierBreakdownProps {
  /** Tier-specific inflation rates as decimals (e.g., 0.15 = 15%) */
  tierRates: Record<Tier, number>;
}

/**
 * Tier display labels
 */
const TIER_LABELS: Record<PlayerTier, string> = {
  [PlayerTier.ELITE]: 'Elite (T1)',
  [PlayerTier.MID]: 'Mid (T2)',
  [PlayerTier.LOWER]: 'Lower (T3)',
};

/**
 * Find the tier with the highest inflation rate
 */
function findHighestInflationTier(tierRates: Record<Tier, number>): PlayerTier {
  let highestTier = PlayerTier.ELITE;
  let highestRate = tierRates[PlayerTier.ELITE];

  if (tierRates[PlayerTier.MID] > highestRate) {
    highestTier = PlayerTier.MID;
    highestRate = tierRates[PlayerTier.MID];
  }

  if (tierRates[PlayerTier.LOWER] > highestRate) {
    highestTier = PlayerTier.LOWER;
  }

  return highestTier;
}

/**
 * Format inflation rate for display
 */
function formatInflationRate(rate: number): string {
  const percentage = rate * 100;
  const prefix = percentage > 0 ? '+' : '';
  return `${prefix}${percentage.toFixed(1)}%`;
}

/**
 * Get tooltip message for a tier
 */
function getTierTooltip(tier: PlayerTier, rate: number): string {
  const absRate = Math.abs(rate * 100).toFixed(0);
  const tierLabel = TIER_LABELS[tier].split(' ')[0]; // Get "Elite", "Mid", or "Lower"

  if (rate > 0) {
    return `${tierLabel}-tier players are selling ${absRate}% above their projections`;
  } else if (rate < 0) {
    return `${tierLabel}-tier players are selling ${absRate}% below their projections`;
  } else {
    return `${tierLabel}-tier players are selling at their projected values`;
  }
}

/**
 * TierBreakdown displays tier-specific inflation with progressive disclosure
 */
export function TierBreakdown({ tierRates }: TierBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const highestTier = findHighestInflationTier(tierRates);

  // Order tiers for display
  const tiers: PlayerTier[] = [PlayerTier.ELITE, PlayerTier.MID, PlayerTier.LOWER];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="p-3 bg-slate-800 rounded-lg">
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between text-left hover:bg-slate-750 rounded px-1 -mx-1 transition-colors"
            aria-label={isOpen ? 'Hide tier breakdown' : 'Show tier breakdown'}
          >
            <div className="flex-1">
              <div className="text-xs text-slate-400 mb-1">Tiers</div>
              {!isOpen && <div className="text-sm text-slate-300">Click for breakdown</div>}
            </div>
            <div className="text-slate-400 ml-2">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-2">
          <TooltipProvider>
            {tiers.map(tier => {
              const rate = tierRates[tier];
              const isHighest = tier === highestTier && rate !== 0;
              const isPositive = rate > 0;
              const isNegative = rate < 0;

              return (
                <Tooltip key={tier}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex items-center justify-between p-2 rounded text-sm ${
                        isHighest ? 'bg-yellow-500/10 ring-1 ring-yellow-500/30' : 'bg-slate-700/50'
                      }`}
                    >
                      <span className="text-slate-200 font-medium">{TIER_LABELS[tier]}</span>
                      <span
                        className={`font-semibold ${
                          isPositive
                            ? 'text-emerald-500'
                            : isNegative
                              ? 'text-red-500'
                              : 'text-slate-400'
                        }`}
                      >
                        {formatInflationRate(rate)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 border-slate-700">
                    <p className="text-sm text-white">{getTierTooltip(tier, rate)}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default TierBreakdown;
