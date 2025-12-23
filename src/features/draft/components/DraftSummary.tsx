/**
 * DraftSummary Component
 *
 * Main container component for post-draft analytics display.
 * Composes RosterOverview, BudgetUtilization, ValueAnalysis, and CompetitiveAdvantageSummary sections.
 *
 * Story: 12.1 - Create Post-Draft Summary Component
 * Story: 12.5 - Show Competitive Advantage Summary
 */

import { useMemo } from 'react';
import { RosterOverview } from './RosterOverview';
import { BudgetUtilization } from './BudgetUtilization';
import { ValueAnalysis } from './ValueAnalysis';
import { CompetitiveAdvantageSummary } from './CompetitiveAdvantageSummary';
import { calculateSpendingBreakdown } from '../utils/budgetCalculations';
import { identifySteals, identifyOverpays } from '../utils/valueAnalysis';
import type { DraftSummaryProps } from '../types/summary.types';
import type { DraftedPlayer as RosterDraftedPlayer } from '../types/roster.types';

/**
 * DraftSummary displays comprehensive post-draft analytics.
 * Uses dark slate theme with emerald highlights for value wins.
 *
 * @param roster - Array of drafted players on user's roster
 * @param budget - Budget state (initial, spent, remaining)
 * @param projections - Player projections for value calculations
 * @param inflationData - Inflation state at draft completion
 */
export function DraftSummary({ roster, budget, projections, inflationData }: DraftSummaryProps) {
  // Convert roster to format expected by budget calculations
  const rosterForBudget: RosterDraftedPlayer[] = roster.map(player => ({
    playerId: player.playerId,
    name: player.playerName,
    position: player.position,
    auctionPrice: player.purchasePrice,
  }));

  // Calculate spending breakdown
  const spendingBreakdown = calculateSpendingBreakdown(rosterForBudget, budget.initial);

  // Calculate steals and overpays for competitive advantage summary
  const { steals } = useMemo(() => identifySteals(roster, inflationData), [roster, inflationData]);
  const { overpays } = useMemo(
    () => identifyOverpays(roster, inflationData),
    [roster, inflationData]
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8">
      {/* Main heading */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Draft Summary</h1>
        <p className="text-slate-400 mt-2">Review your draft performance and value analysis</p>
      </header>

      {/* Sections container with consistent spacing */}
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Roster Overview Section - Story 12.2 */}
        <RosterOverview roster={roster} />

        {/* Budget Utilization Section - Story 12.3 */}
        <BudgetUtilization budget={budget} spendingByPosition={spendingBreakdown.byPosition} />

        {/* Value Analysis Section - Story 12.4 */}
        <ValueAnalysis roster={roster} projections={projections} inflationData={inflationData} />

        {/* Competitive Advantage Summary - Story 12.5 */}
        <CompetitiveAdvantageSummary steals={steals} overpays={overpays} />
      </div>

      {/* Footer with summary stats */}
      <footer className="mt-8 pt-6 border-t border-slate-800">
        <p className="text-sm text-slate-500 text-center">
          Draft completed with {roster.length} players rostered
        </p>
      </footer>
    </div>
  );
}

export default DraftSummary;
