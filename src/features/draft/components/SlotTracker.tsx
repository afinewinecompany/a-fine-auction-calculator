/**
 * SlotTracker Component
 *
 * Displays filled vs remaining roster slots with a visual progress bar.
 * Shows overall roster completion and breakdown by position category.
 *
 * Story: 7.6 - Display Filled vs Remaining Roster Slots
 */

import { memo, useMemo } from 'react';
import { cn } from '@/components/ui/utils';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';

/**
 * Drafted player for slot counting
 */
export interface SlotPlayer {
  /** Unique player identifier */
  playerId: string;
  /** Player display name */
  name: string;
  /** Player's primary position */
  position: string;
  /** Price paid at auction */
  auctionPrice: number;
}

/**
 * League settings for roster configuration
 */
export interface SlotLeagueSettings {
  /** Number of hitter roster spots */
  rosterSpotsHitters: number;
  /** Number of pitcher roster spots */
  rosterSpotsPitchers: number;
  /** Number of bench roster spots */
  rosterSpotsBench: number;
}

/**
 * Props for SlotTracker component
 */
export interface SlotTrackerProps {
  /** Roster data organized by category */
  roster: {
    hitters: SlotPlayer[];
    pitchers: SlotPlayer[];
    bench: SlotPlayer[];
  };
  /** League roster settings (optional, uses defaults if not provided) */
  leagueSettings?: SlotLeagueSettings;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Slot counts for each category
 */
interface SlotCounts {
  hitters: { filled: number; total: number };
  pitchers: { filled: number; total: number };
  bench: { filled: number; total: number };
  overall: { filled: number; total: number };
}

/**
 * Default roster settings if none provided
 */
const DEFAULT_ROSTER_SETTINGS: SlotLeagueSettings = {
  rosterSpotsHitters: 14,
  rosterSpotsPitchers: 9,
  rosterSpotsBench: 0,
};

/**
 * Calculate slot counts from roster data
 */
function calculateSlotCounts(
  roster: SlotTrackerProps['roster'],
  settings: SlotLeagueSettings
): SlotCounts {
  const hittersFilled = roster.hitters.length;
  const pitchersFilled = roster.pitchers.length;
  const benchFilled = roster.bench.length;

  const hittersTotal = settings.rosterSpotsHitters;
  const pitchersTotal = settings.rosterSpotsPitchers;
  const benchTotal = settings.rosterSpotsBench;

  return {
    hitters: { filled: hittersFilled, total: hittersTotal },
    pitchers: { filled: pitchersFilled, total: pitchersTotal },
    bench: { filled: benchFilled, total: benchTotal },
    overall: {
      filled: hittersFilled + pitchersFilled + benchFilled,
      total: hittersTotal + pitchersTotal + benchTotal,
    },
  };
}

/**
 * Category slot display with completion indicator
 */
function CategorySlot({ label, filled, total }: { label: string; filled: number; total: number }) {
  const isComplete = filled >= total && total > 0;

  return (
    <div className="flex items-center gap-1 text-sm" data-testid={`slot-${label.toLowerCase()}`}>
      <span className="text-slate-400">{label}:</span>
      <span className={cn('font-medium', isComplete ? 'text-emerald-400' : 'text-slate-200')}>
        {filled}/{total}
      </span>
      {isComplete && (
        <Check
          className="w-3.5 h-3.5 text-emerald-400"
          aria-label={`${label} complete`}
          data-testid={`check-${label.toLowerCase()}`}
        />
      )}
    </div>
  );
}

/**
 * SlotTracker component - Shows roster slot completion progress
 *
 * @example
 * ```tsx
 * <SlotTracker
 *   roster={{
 *     hitters: mockHitters,
 *     pitchers: mockPitchers,
 *     bench: [],
 *   }}
 *   leagueSettings={{
 *     rosterSpotsHitters: 14,
 *     rosterSpotsPitchers: 9,
 *     rosterSpotsBench: 0,
 *   }}
 * />
 * ```
 */
export const SlotTracker = memo(function SlotTracker({
  roster,
  leagueSettings = DEFAULT_ROSTER_SETTINGS,
  className,
}: SlotTrackerProps) {
  const counts = useMemo(
    () => calculateSlotCounts(roster, leagueSettings),
    [roster, leagueSettings]
  );

  const completionPercentage = useMemo(() => {
    if (counts.overall.total === 0) return 0;
    // Cap at 100% to handle overfilled rosters
    return Math.min(Math.round((counts.overall.filled / counts.overall.total) * 100), 100);
  }, [counts.overall]);

  const isRosterComplete =
    counts.overall.filled >= counts.overall.total && counts.overall.total > 0;

  return (
    <div
      className={cn('space-y-3', className)}
      data-testid="slot-tracker"
      role="region"
      aria-label="Roster slot tracking"
    >
      {/* Overall count display */}
      <div className="flex items-baseline gap-2" data-testid="overall-count">
        <span
          className={cn(
            'text-2xl font-bold',
            isRosterComplete ? 'text-emerald-400' : 'text-slate-200'
          )}
        >
          {counts.overall.filled}
        </span>
        <span className="text-slate-400">of</span>
        <span className="text-xl font-semibold text-slate-200">{counts.overall.total}</span>
        <span className="text-sm text-slate-400">roster spots filled</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1" data-testid="progress-section">
        <Progress
          value={completionPercentage}
          className="h-2 bg-slate-700 [&>[data-slot=progress-indicator]]:bg-emerald-400"
          aria-label={`Roster ${completionPercentage}% complete`}
        />
        <div className="text-xs text-slate-500 text-right">{completionPercentage}% complete</div>
      </div>

      {/* Category breakdown */}
      <div className="flex flex-wrap gap-x-4 gap-y-1" data-testid="category-breakdown">
        <CategorySlot label="Hitters" filled={counts.hitters.filled} total={counts.hitters.total} />
        <CategorySlot
          label="Pitchers"
          filled={counts.pitchers.filled}
          total={counts.pitchers.total}
        />
        {counts.bench.total > 0 && (
          <CategorySlot label="Bench" filled={counts.bench.filled} total={counts.bench.total} />
        )}
      </div>
    </div>
  );
});

export default SlotTracker;
