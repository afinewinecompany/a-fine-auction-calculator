/**
 * RosterPanel Component
 *
 * Displays budget and roster tracking during drafts.
 * Provides three sections: Budget Summary, Roster Composition, Position Needs.
 * Uses dark slate theme with emerald accents.
 *
 * Story: 7.1 - Create RosterPanel Component Foundation
 * Story: 7.3 - Display Money Spent Breakdown by Position
 * Story: 7.4 - Display Spending Pace Indicator
 * Story: 7.5 - Display Roster Composition by Position
 * Story: 7.6 - Display Filled vs Remaining Roster Slots
 * Story: 7.7 - Display Position Needs Summary
 * Story: 7.8 - Track Overall Draft Progress
 */

import { useState, useMemo, memo } from 'react';
import { cn } from '@/components/ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetDisplay } from './BudgetDisplay';
import { SpendingBreakdown } from './SpendingBreakdown';
import { PaceIndicator } from './PaceIndicator';
import { RosterDisplay } from './RosterDisplay';
import { SlotTracker } from './SlotTracker';
import { PositionNeeds } from './PositionNeeds';
import { DraftProgress } from './DraftProgress';
import { formatCurrency } from '../utils/formatCurrency';
import type { RosterPanelProps, DraftedPlayer } from '../types/roster.types';
import { DEFAULT_POSITION_REQUIREMENTS } from '../types/roster.types';
import type { Player } from '../types/player.types';

/** Re-export DraftedPlayer as RosterPlayer for compatibility */
type RosterPlayer = DraftedPlayer;

/**
 * Convert Player array to DraftedPlayer array for SpendingBreakdown
 */
function toDraftedPlayers(players: Player[]): DraftedPlayer[] {
  return players.map(p => ({
    playerId: p.id,
    name: p.name,
    position: p.positions[0] || 'UTIL',
    auctionPrice: p.auctionPrice || 0,
  }));
}

/**
 * Convert Player array to RosterPlayer array for RosterDisplay and PositionNeeds
 */
function toRosterPlayers(players: Player[]): RosterPlayer[] {
  return players.map(p => ({
    playerId: p.id,
    name: p.name,
    position: p.positions[0] || 'UTIL',
    auctionPrice: p.auctionPrice || 0,
  }));
}

function SectionHeader({ title, id }: { title: string; id?: string }) {
  return (
    <h3 id={id} className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2">
      {title}
    </h3>
  );
}

export const RosterPanel = memo(function RosterPanel({
  budget,
  roster,
  leagueSettings,
  className,
}: RosterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalHitters = roster.hitters.length;
  const totalPitchers = roster.pitchers.length;
  const totalBench = roster.bench.length;
  const spotsFilled = totalHitters + totalPitchers + totalBench;
  const totalRosterSpots =
    leagueSettings.rosterSpotsHitters +
    leagueSettings.rosterSpotsPitchers +
    leagueSettings.rosterSpotsBench;

  // Convert Player[] to DraftedPlayer[] for SpendingBreakdown
  const spendingRoster = useMemo(
    () => ({
      hitters: toDraftedPlayers(roster.hitters),
      pitchers: toDraftedPlayers(roster.pitchers),
      bench: toDraftedPlayers(roster.bench),
    }),
    [roster]
  );

  // Convert Player[] to RosterPlayer[] for RosterDisplay, SlotTracker, and PositionNeeds
  const rosterDisplayData = useMemo(
    () => ({
      hitters: toRosterPlayers(roster.hitters),
      pitchers: toRosterPlayers(roster.pitchers),
      bench: toRosterPlayers(roster.bench),
    }),
    [roster]
  );

  return (
    <>
      <Card
        className={cn(
          'hidden md:block',
          'bg-slate-900 border-slate-800',
          'sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto',
          className
        )}
        data-testid="roster-panel-desktop"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-slate-100">Draft Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section aria-labelledby="budget-summary-heading">
            <SectionHeader title="Budget Summary" id="budget-summary-heading" />
            <BudgetDisplay total={budget.total} spent={budget.spent} remaining={budget.remaining} />
            <div className="mt-2">
              <PaceIndicator
                totalBudget={budget.total}
                moneySpent={budget.spent}
                spotsFilled={spotsFilled}
                totalRosterSpots={totalRosterSpots}
              />
            </div>
            <SpendingBreakdown roster={spendingRoster} />
          </section>
          <section aria-labelledby="roster-composition-heading">
            <SectionHeader title="Roster Composition" id="roster-composition-heading" />
            <SlotTracker roster={rosterDisplayData} leagueSettings={leagueSettings} />
            <div className="mt-4">
              <RosterDisplay roster={rosterDisplayData} />
            </div>
          </section>
          <section aria-labelledby="position-needs-heading">
            <SectionHeader title="Position Needs" id="position-needs-heading" />
            <PositionNeeds
              roster={rosterDisplayData}
              positionRequirements={DEFAULT_POSITION_REQUIREMENTS}
            />
          </section>
          <section aria-labelledby="draft-progress-heading">
            <SectionHeader title="Draft Progress" id="draft-progress-heading" />
            <DraftProgress
              playersDrafted={spotsFilled * leagueSettings.teamCount}
              totalPlayers={totalRosterSpots * leagueSettings.teamCount}
            />
          </section>
        </CardContent>
      </Card>
      <div
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-50',
          'bg-slate-900 border-t border-slate-800',
          'transition-transform duration-300 ease-in-out',
          isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'
        )}
        data-testid="roster-panel-mobile"
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full py-4 px-4 flex items-center justify-between',
            'text-slate-100 font-semibold',
            'min-h-[60px]',
            'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-inset'
          )}
          aria-expanded={isExpanded}
          aria-controls="mobile-roster-content"
        >
          <span className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">{formatCurrency(budget.remaining)}</span>
            <span className="text-sm text-slate-400">Remaining</span>
          </span>
          <svg
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform',
              isExpanded ? 'rotate-180' : 'rotate-0'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <div
          id="mobile-roster-content"
          className={cn('px-4 pb-4 space-y-6', 'max-h-[60vh] overflow-y-auto')}
          hidden={!isExpanded}
        >
          <section aria-labelledby="mobile-budget-heading">
            <SectionHeader title="Budget Summary" id="mobile-budget-heading" />
            <BudgetDisplay total={budget.total} spent={budget.spent} remaining={budget.remaining} />
            <div className="mt-2">
              <PaceIndicator
                totalBudget={budget.total}
                moneySpent={budget.spent}
                spotsFilled={spotsFilled}
                totalRosterSpots={totalRosterSpots}
              />
            </div>
            <SpendingBreakdown roster={spendingRoster} />
          </section>
          <section aria-labelledby="mobile-roster-heading">
            <SectionHeader title="Roster Composition" id="mobile-roster-heading" />
            <SlotTracker roster={rosterDisplayData} leagueSettings={leagueSettings} />
            <div className="mt-4">
              <RosterDisplay roster={rosterDisplayData} />
            </div>
          </section>
          <section aria-labelledby="mobile-position-heading">
            <SectionHeader title="Position Needs" id="mobile-position-heading" />
            <PositionNeeds
              roster={rosterDisplayData}
              positionRequirements={DEFAULT_POSITION_REQUIREMENTS}
            />
          </section>
          <section aria-labelledby="mobile-draft-progress-heading">
            <SectionHeader title="Draft Progress" id="mobile-draft-progress-heading" />
            <DraftProgress
              playersDrafted={spotsFilled * leagueSettings.teamCount}
              totalPlayers={totalRosterSpots * leagueSettings.teamCount}
            />
          </section>
        </div>
      </div>
    </>
  );
});

export default RosterPanel;
