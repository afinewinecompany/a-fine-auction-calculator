/**
 * InflationTracker Component
 *
 * Displays inflation metrics in a compact 2x2 grid layout.
 * Shows overall market temperature, variance, trend, and tier breakdown.
 * Uses dark slate theme with emerald accents for positive inflation.
 *
 * Story: 8.1 - Create InflationTracker Component
 * Story: 8.2 - Display Current Inflation Rate Percentage
 * Story: 8.3 - Display Variance Tracking for Drafted Players
 * Story: 8.4 - Display Inflation Trend Indicators
 * Story: 8.5 - Display Tier-Specific Inflation Breakdown
 * Story: 8.6 - Display Position-Specific Inflation Breakdown
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import {
  type Position,
  type Tier,
  POSITIONS,
  type InflationHistoryEntry,
} from '@/features/inflation/types/inflation.types';
import { VarianceDisplay } from './VarianceDisplay';
import { TierBreakdown } from './TierBreakdown';
import {
  calculateInflationTrend,
  getTrendIcon,
  getTrendColor,
  getTrendLabel,
  formatTrendTooltip,
} from '@/features/inflation/utils/trendCalculations';
import type { DraftedPlayer } from '../types/draft.types';

/**
 * Props for the InflationTracker component
 */
export interface InflationTrackerProps {
  /** Overall inflation rate as a percentage (e.g., 12.5 for 12.5%) */
  inflationRate: number;
  /** Position-specific inflation rates */
  positionRates: Record<Position, number>;
  /** Tier-specific inflation rates */
  tierRates: Record<Tier, number>;
  /** Variance data for steals and overpays (legacy prop, still supported) */
  variance?: {
    steals: number;
    overpays: number;
  };
  /** Drafted players for variance calculation (Story 8.3) */
  draftedPlayers?: DraftedPlayer[];
  /** Function to get adjusted value for a player (Story 8.3) */
  getAdjustedValue?: (playerId: string) => number;
  /** Inflation history for trend calculation (Story 8.4) */
  inflationHistory?: InflationHistoryEntry[];
  /** Current pick number for trend calculation (Story 8.4) */
  currentPick?: number;
}

/**
 * Get tooltip message based on inflation rate
 */
const getTooltipMessage = (rate: number): string => {
  const absRate = Math.abs(rate);
  if (rate > 0) {
    return `Players are selling for ${rate.toFixed(1)}% above projections on average`;
  } else if (rate < 0) {
    return `Players are selling for ${absRate.toFixed(1)}% below projections on average`;
  } else {
    return 'Players are selling at their projected values on average';
  }
};

/**
 * Get badge text based on inflation rate
 */
const getBadgeText = (rate: number): string => {
  if (rate > 0) return 'Hot';
  if (rate < 0) return 'Cool';
  return 'Stable';
};

/**
 * Format inflation rate for display
 */
const formatInflationRate = (rate: number): string => {
  const prefix = rate > 0 ? '+' : '';
  return `${prefix}${rate.toFixed(1)}%`;
};

/**
 * Get color class based on inflation rate for position breakdown
 * High inflation (scarce positions) = red/orange, low/negative = slate
 */
const getPositionRateColor = (rate: number): string => {
  if (rate >= 15) return 'text-red-500';
  if (rate >= 10) return 'text-orange-500';
  if (rate >= 5) return 'text-amber-500';
  if (rate > 0) return 'text-emerald-500';
  if (rate < 0) return 'text-blue-400';
  return 'text-slate-400';
};

/**
 * Sort positions by inflation rate (highest first)
 */
const sortPositionsByRate = (
  positionRates: Record<Position, number>
): Array<{ position: Position; rate: number }> => {
  return POSITIONS.filter(pos => pos !== 'UT') // Exclude utility position
    .map(position => ({
      position,
      rate: positionRates[position] ?? 0,
    }))
    .sort((a, b) => b.rate - a.rate);
};

/**
 * InflationTracker displays inflation metrics in a 2x2 grid
 * with expandable position breakdown section
 */
export function InflationTracker({
  inflationRate,
  positionRates,
  tierRates,
  variance,
  draftedPlayers = [],
  getAdjustedValue,
  inflationHistory = [],
  currentPick = 0,
}: InflationTrackerProps) {
  const [isPositionBreakdownExpanded, setIsPositionBreakdownExpanded] = useState(false);

  const isPositive = inflationRate > 0;
  const isNegative = inflationRate < 0;

  // Sort positions by inflation rate for display
  const sortedPositions = useMemo(() => sortPositionsByRate(positionRates), [positionRates]);

  // Calculate trend based on history (Story 8.4)
  const trend = useMemo(() => {
    return calculateInflationTrend(inflationHistory, currentPick);
  }, [inflationHistory, currentPick]);

  const TrendIcon = getTrendIcon(trend.direction);
  const trendColor = getTrendColor(trend.direction);
  const trendLabel = getTrendLabel(trend.direction);
  const trendTooltip = formatTrendTooltip(trend);

  // Determine if we should use variance display component or legacy variance prop
  const hasVarianceData = draftedPlayers.length > 0 && getAdjustedValue;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">Inflation Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-2 gap-4">
            {/* Overall Inflation / Market Temperature Metric */}
            <div className="p-3 bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Market Temperature</div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className={`text-3xl font-bold ${
                        isPositive
                          ? 'text-emerald-500'
                          : isNegative
                            ? 'text-red-500'
                            : 'text-slate-400'
                      }`}
                      aria-label={`Market temperature: ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'} ${Math.abs(inflationRate).toFixed(1)} percent`}
                    >
                      {formatInflationRate(inflationRate)}
                    </div>
                    <Badge
                      variant={isPositive ? 'default' : isNegative ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {getBadgeText(inflationRate)}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700">
                  <p className="text-sm text-white">{getTooltipMessage(inflationRate)}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Variance Metric (Story 8.3) */}
            {hasVarianceData ? (
              <VarianceDisplay
                draftedPlayers={draftedPlayers}
                getAdjustedValue={getAdjustedValue}
              />
            ) : (
              <div className="p-3 bg-slate-800 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Variance</div>
                <div className="text-lg font-semibold text-white">
                  {variance ? `${variance.steals}/${variance.overpays}` : '--'}
                </div>
              </div>
            )}

            {/* Trend Metric (Story 8.4) */}
            <div className="p-3 bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Trend</div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    role="button"
                    tabIndex={0}
                  >
                    <TrendIcon className={`h-5 w-5 ${trendColor}`} aria-hidden="true" />
                    <div className={`text-lg font-semibold ${trendColor}`}>{trendLabel}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700">
                  <p className="text-sm text-white">{trendTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Tier Breakdown (Story 8.5) */}
            <TierBreakdown tierRates={tierRates} />
          </div>
        </TooltipProvider>

        {/* Position-Specific Inflation Breakdown - Expandable Section */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsPositionBreakdownExpanded(!isPositionBreakdownExpanded)}
            className={cn(
              'w-full flex items-center justify-between p-3 bg-slate-800 rounded-lg',
              'hover:bg-slate-750 transition-colors cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-slate-600'
            )}
            aria-expanded={isPositionBreakdownExpanded}
            aria-controls="position-breakdown-content"
          >
            <span className="text-sm font-medium text-slate-300">Position Breakdown</span>
            {isPositionBreakdownExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {isPositionBreakdownExpanded && (
            <div
              id="position-breakdown-content"
              className="mt-2 p-3 bg-slate-800/50 rounded-lg"
              role="region"
              aria-label="Position-specific inflation rates"
            >
              <div className="grid grid-cols-2 gap-2">
                {sortedPositions.map(({ position, rate }) => (
                  <div
                    key={position}
                    className="flex items-center justify-between px-2 py-1.5 bg-slate-800 rounded"
                  >
                    <span className="text-sm font-medium text-slate-300">{position}:</span>
                    <span
                      className={cn('text-sm font-semibold', getPositionRateColor(rate))}
                      aria-label={`${position} inflation rate: ${formatInflationRate(rate)}`}
                    >
                      {formatInflationRate(rate)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Sorted by inflation rate (highest first). Red/orange indicates position scarcity.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default InflationTracker;
