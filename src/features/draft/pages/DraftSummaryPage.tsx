/**
 * DraftSummaryPage
 *
 * Page component that wraps DraftSummary with data loading.
 * Fetches roster, budget, projections, and inflation data for the league.
 *
 * Story: 12.1 - Create Post-Draft Summary Component
 */

import { useParams } from 'react-router-dom';
import { DraftSummary } from '../components/DraftSummary';
import { useDraftStore } from '../stores/draftStore';
import { useInflationStore } from '@/features/inflation';
import { createDefaultBudgetState } from '../types/summary.types';
import type { DraftedPlayer } from '../types/draft.types';

/**
 * DraftSummaryPage loads data for the summary view.
 * Currently uses placeholder data - will be connected to real stores in future stories.
 */
export function DraftSummaryPage() {
  const { leagueId } = useParams<{ leagueId: string }>();

  // Get draft state for this league
  const getDraft = useDraftStore(state => state.getDraft);
  const draftState = leagueId ? getDraft(leagueId) : undefined;

  // Get inflation state
  const inflationState = useInflationStore(state => ({
    overallRate: state.overallRate,
    positionRates: state.positionRates,
    tierRates: state.tierRates,
    budgetDepleted: state.budgetDepleted,
    playersRemaining: state.playersRemaining,
  }));

  // Build props from store data or use defaults
  const roster: DraftedPlayer[] =
    draftState?.draftedPlayers.filter(p => p.draftedBy === 'user') ?? [];

  const budget = draftState
    ? {
        initial: draftState.initialBudget,
        remaining: draftState.remainingBudget,
        spent: draftState.initialBudget - draftState.remainingBudget,
      }
    : createDefaultBudgetState();

  // Projections would come from projection store - placeholder for now
  const projections: never[] = [];

  if (!leagueId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">League Not Found</h1>
          <p className="text-slate-400">Please select a valid league to view the draft summary.</p>
        </div>
      </div>
    );
  }

  return (
    <DraftSummary
      roster={roster}
      budget={budget}
      projections={projections}
      inflationData={inflationState}
    />
  );
}

export default DraftSummaryPage;
