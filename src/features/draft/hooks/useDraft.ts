/**
 * Draft Hooks
 *
 * Custom hooks for accessing draft state from components.
 * Provides clean API for draft state management.
 *
 * Story: 3.7 - Implement Resume Draft Functionality
 * Updated: 10.3 - Implement Manual Bid Entry
 * Updated: 10.4 - Implement My Team Checkbox (roster management)
 * Updated: 10.5 - Maintain Inflation Calculation Accuracy in Manual Mode
 */

import { useCallback } from 'react';
import { useDraftStore } from '../stores/draftStore';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
import type { RosterSlot, DraftedPlayer, InflationData, RosterConfig } from '../types/draft.types';

/**
 * Input for manual bid submission (Story 10.3, 10.5)
 *
 * Updated: Story 10.5 - Added tier field for inflation calculation accuracy
 * All fields required for inflation calculations are included to ensure
 * manual entries produce identical results to auto sync entries.
 */
export interface ManualBidInput {
  playerId: string;
  playerName: string;
  position: string;
  bid: number;
  projectedValue: number;
  isMyTeam: boolean;
  /**
   * Player tier assignment (ELITE, MID, LOWER) for tier-specific inflation
   * Story 10.5 - Ensures manual entries have all required fields for inflation
   */
  tier?: string;
}

/**
 * Hook to check if a league has draft in progress
 *
 * @param leagueId - The league ID to check
 * @returns boolean indicating if draft has players drafted
 *
 * @example
 * ```tsx
 * const hasDraftInProgress = useHasDraftInProgress(league.id);
 *
 * return (
 *   <Button>
 *     {hasDraftInProgress ? 'Resume Draft' : 'Start Draft'}
 *   </Button>
 * );
 * ```
 */
export function useHasDraftInProgress(leagueId: string | undefined): boolean {
  return useDraftStore(state => (leagueId ? state.hasDraftInProgress(leagueId) : false));
}

/**
 * Hook to get draft state for a league
 *
 * @param leagueId - The league ID to get draft state for
 * @returns Draft state and actions for the league
 *
 * @example
 * ```tsx
 * const { draft, hasDraft, initializeDraft } = useDraft(leagueId);
 *
 * if (!hasDraft) {
 *   initializeDraft(260, { hitters: 14, pitchers: 9, bench: 3 });
 * }
 * ```
 */
export function useDraft(leagueId: string | undefined) {
  const draft = useDraftStore(state => (leagueId ? state.getDraft(leagueId) : undefined));
  const initializeDraft = useDraftStore(state => state.initializeDraft);
  const updateRoster = useDraftStore(state => state.updateRoster);
  const updateBudget = useDraftStore(state => state.updateBudget);
  const addDraftedPlayer = useDraftStore(state => state.addDraftedPlayer);
  const addToRoster = useDraftStore(state => state.addToRoster);
  const updateInflationData = useDraftStore(state => state.updateInflationData);
  const clearDraft = useDraftStore(state => state.clearDraft);
  const updateInflation = useInflationStore(state => state.updateInflation);

  /**
   * Submit a manual bid entry (Story 10.3, 10.4, 10.5)
   *
   * This handler:
   * 1. Creates a drafted player record with all required fields for inflation
   * 2. Adds player to draft store with isManualEntry flag (Story 10.5)
   * 3. If isMyTeam:
   *    - Updates budget (deducts bid amount)
   *    - Adds player to roster slot
   *    - Updates position needs
   * 4. Triggers inflation recalculation (all picks affect inflation)
   *
   * Story 10.5: Manual entries include all fields required for inflation:
   * - playerId, playerName, position, purchasePrice, projectedValue, tier
   * - isManualEntry flag for tracking (NOT used in calculations)
   *
   * @param input - Manual bid input data
   * @returns true if successful
   */
  const submitManualBid = useCallback(
    (input: ManualBidInput): boolean => {
      if (!leagueId || !draft) {
        return false;
      }

      // Create drafted player record with all required fields (Story 10.5)
      // Includes tier and isManualEntry for inflation calculation accuracy
      const draftedPlayer: Omit<DraftedPlayer, 'draftedAt'> = {
        playerId: input.playerId,
        playerName: input.playerName,
        position: input.position,
        purchasePrice: input.bid,
        projectedValue: input.projectedValue,
        variance: input.bid - input.projectedValue,
        draftedBy: input.isMyTeam ? 'user' : 'other',
        // Story 10.5: Include tier for tier-specific inflation calculations
        tier: input.tier,
        // Story 10.5: Flag for tracking - NOT used in inflation calculations
        isManualEntry: true,
      };

      // Add to draft store (tracks all drafted players for inflation)
      addDraftedPlayer(leagueId, draftedPlayer);

      // If it's the user's team, update budget and roster (Story 10.4)
      if (input.isMyTeam && draft.remainingBudget !== undefined) {
        // Deduct from budget
        const newBudget = draft.remainingBudget - input.bid;
        updateBudget(leagueId, newBudget);

        // Add to roster slot (updates RosterPanel display)
        addToRoster(leagueId, input.playerId, input.playerName, input.position, input.bid);
      }

      return true;
    },
    [leagueId, draft, addDraftedPlayer, updateBudget, addToRoster]
  );

  /**
   * Trigger inflation recalculation after manual entries (Story 10.3, 10.5)
   *
   * This should be called after manual bid submissions to update
   * inflation rates and adjusted values. It's separated from submitManualBid
   * to allow batching multiple entries before recalculating.
   *
   * Story 10.5: Includes position and tier data for accurate inflation:
   * - Position is used for position-specific inflation calculations
   * - Tier is used for tier-specific inflation calculations
   * - Both manual and auto sync entries are treated identically
   *
   * @param projections - Current player projections for inflation calculation
   */
  const recalculateInflation = useCallback(
    (
      projections: Array<{
        playerId: string;
        projectedValue: number | null;
        position?: string;
        tier?: string;
      }>
    ) => {
      if (!leagueId || !draft) {
        return;
      }

      // Convert drafted players to inflation input format (Story 10.5)
      // Include position and tier for accurate inflation calculations
      const draftedPlayers = draft.draftedPlayers.map(p => ({
        playerId: p.playerId,
        auctionPrice: p.purchasePrice,
        position: p.position,
        tier: p.tier,
      }));

      // Calculate budget context
      const budgetContext = {
        totalBudget: draft.initialBudget,
        spent: draft.initialBudget - draft.remainingBudget,
        totalRosterSpots: draft.roster.length,
        slotsRemaining: draft.roster.filter(s => s.playerId === null).length,
      };

      // Trigger inflation recalculation
      updateInflation(draftedPlayers, projections, budgetContext);
    },
    [leagueId, draft, updateInflation]
  );

  return {
    draft,
    hasDraft: draft !== undefined,
    hasDraftInProgress: draft !== undefined && draft.draftedPlayers.length > 0,
    initializeDraft: leagueId
      ? (budget: number, config: RosterConfig) => initializeDraft(leagueId, budget, config)
      : () => {},
    updateRoster: leagueId ? (roster: RosterSlot[]) => updateRoster(leagueId, roster) : () => {},
    updateBudget: leagueId ? (budget: number) => updateBudget(leagueId, budget) : () => {},
    addDraftedPlayer: leagueId
      ? (player: Omit<DraftedPlayer, 'draftedAt'>) => addDraftedPlayer(leagueId, player)
      : () => {},
    updateInflationData: leagueId
      ? (data: Partial<InflationData>) => updateInflationData(leagueId, data)
      : () => {},
    clearDraft: leagueId ? () => clearDraft(leagueId) : () => {},
    // Story 10.3: Manual bid entry functions
    submitManualBid,
    recalculateInflation,
    // Story 10.4: Roster management
    addToRoster: leagueId
      ? (playerId: string, playerName: string, position: string, purchasePrice: number) =>
          addToRoster(leagueId, playerId, playerName, position, purchasePrice)
      : () => false,
  };
}
