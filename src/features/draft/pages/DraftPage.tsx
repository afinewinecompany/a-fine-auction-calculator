/**
 * DraftPage Component
 *
 * Main draft room page that integrates automatic sync with Couch Managers.
 * This is the primary location where useDraftSync polling runs.
 *
 * Story: 9.3 - Implement Automatic API Polling
 * Story: 9.4 - Display Connection Status Indicators
 * Story: 9.5 - Display Last Successful Sync Timestamp
 * Story: 9.6 - Implement Manual Reconnection Trigger
 * Story: 10.8 - Implement Graceful Degradation Pattern
 *
 * Features:
 * - Automatic sync polling when league has Couch Managers connection
 * - Manual sync trigger button
 * - Connection status badge (Connected, Reconnecting, Disconnected)
 * - Last sync timestamp with relative time, tooltip, auto-update, and stale warning
 * - Retry connection button when disconnected/reconnecting with toast feedback
 * - Error boundary to catch component errors without crashing (NFR-I2)
 * - Full draft interface with PlayerQueue, RosterPanel, and InflationTracker
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';
import { useDraftSync } from '../hooks/useDraftSync';
import { useDraftStore } from '../stores/draftStore';
import { ConnectionStatusBadge } from '../components/ConnectionStatusBadge';
import { LastSyncTimestamp } from '../components/LastSyncTimestamp';
import { RetryConnectionButton } from '../components/RetryConnectionButton';
import { PersistentErrorBanner } from '../components/PersistentErrorBanner';
import { DraftErrorBoundary } from '@/components/DraftErrorBoundary';
import { PlayerQueueWithSearch } from '../components/PlayerQueueWithSearch';
import { RosterPanel } from '../components/RosterPanel';
import { InflationTracker } from '../components/InflationTracker';
import { PlayerDetailModal } from '../components/PlayerDetailModal';
import { useInflationTracker } from '../hooks/useInflationTracker';
import { useProjections } from '@/features/projections/hooks/useProjections';
import { useInflationIntegration } from '@/features/inflation/hooks/useInflationIntegration';
import type { Player } from '../types/player.types';
import type { RosterPanelProps } from '../types/roster.types';

/**
 * DraftPage Component
 *
 * Entry point for the draft experience. Manages:
 * - League data loading
 * - Draft state initialization
 * - Couch Managers sync (via useDraftSync hook)
 *
 * The useDraftSync hook starts polling on mount and stops on unmount,
 * fulfilling Story 9.3 acceptance criteria AC1-AC5.
 */
export function DraftPage() {
  const { leagueId } = useParams<{ leagueId: string }>();

  // State for player detail modal
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // League store
  const fetchLeague = useLeagueStore(state => state.fetchLeague);
  const currentLeague = useLeagueStore(state => state.currentLeague);
  const isLoading = useLeagueStore(state => state.isLoading);
  const error = useLeagueStore(state => state.error);

  // Draft store - get draft state and drafted players
  const draft = useDraftStore(state => (leagueId ? state.drafts[leagueId] : undefined));
  const draftedPlayers = draft?.draftedPlayers ?? [];
  const initializeDraft = useDraftStore(state => state.initializeDraft);

  // Projections for the league
  const { projections, isLoading: projectionsLoading } = useProjections(leagueId ?? '');

  // Inflation tracker data
  const inflationData = useInflationTracker();

  // Inflation integration hook - connects draft to inflation calculations
  useInflationIntegration({
    leagueId: leagueId ?? '',
    projections,
    totalBudget: (currentLeague?.budget ?? 260) * (currentLeague?.teamCount ?? 10),
    totalRosterSpots:
      ((currentLeague?.rosterSpotsHitters ?? 14) +
        (currentLeague?.rosterSpotsPitchers ?? 9) +
        (currentLeague?.rosterSpotsBench ?? 3)) *
      (currentLeague?.teamCount ?? 10),
    enabled: !!leagueId && projections.length > 0,
  });

  // Sync hook - starts polling on mount, stops on unmount
  // This is the core implementation for Story 9.3 and 9.4
  const { syncStatus, connectionState, triggerSync, lastSync } = useDraftSync(leagueId ?? '');

  // Fetch league data on mount
  useEffect(() => {
    if (leagueId) {
      fetchLeague(leagueId);
    }
  }, [leagueId, fetchLeague]);

  // Initialize draft state if not already initialized
  useEffect(() => {
    if (leagueId && currentLeague && !draft) {
      initializeDraft(leagueId, currentLeague.budget ?? 260, {
        hitters: currentLeague.rosterSpotsHitters ?? 14,
        pitchers: currentLeague.rosterSpotsPitchers ?? 9,
        bench: currentLeague.rosterSpotsBench ?? 3,
      });
    }
  }, [leagueId, currentLeague, draft, initializeDraft]);

  // Convert projections to Player[] format for PlayerQueueWithSearch
  const players: Player[] = useMemo(() => {
    if (!projections.length) return [];

    // Create a set of drafted player IDs for quick lookup
    const draftedPlayerIds = new Set(draftedPlayers.map(p => p.playerId));
    const myTeamPlayerIds = new Set(
      draftedPlayers.filter(p => p.draftedBy === 'user').map(p => p.playerId)
    );

    return projections.map(proj => {
      const draftedInfo = draftedPlayers.find(p => p.playerId === proj.id);

      // Determine draft status
      let status: Player['status'] = 'available';
      if (myTeamPlayerIds.has(proj.id)) {
        status = 'my-team';
      } else if (draftedPlayerIds.has(proj.id)) {
        status = 'drafted';
      }

      // Calculate adjusted value based on inflation
      const projValue = proj.projectedValue ?? 0;
      const inflationMultiplier = 1 + inflationData.inflationRate / 100;
      const adjustedValue = projValue * inflationMultiplier;

      return {
        id: proj.id,
        name: proj.playerName,
        positions: proj.positions,
        team: proj.team ?? '',
        projectedValue: projValue,
        adjustedValue: adjustedValue,
        tier: (proj.tier as Player['tier']) ?? 'LOWER',
        status,
        draftedByTeam: draftedInfo ? (draftedInfo.draftedBy === 'user' ? 1 : 2) : undefined,
        auctionPrice: draftedInfo?.purchasePrice,
      };
    });
  }, [projections, draftedPlayers, inflationData.inflationRate]);

  // Convert draft data to RosterPanel props format
  const rosterPanelData = useMemo((): RosterPanelProps => {
    const hitters: Player[] = [];
    const pitchers: Player[] = [];
    const bench: Player[] = [];

    // Categorize my team's drafted players
    const myTeamPlayers = players.filter(p => p.status === 'my-team');

    myTeamPlayers.forEach(player => {
      const pos = player.positions[0] || '';
      const isPitcher = pos === 'SP' || pos === 'RP' || pos === 'P';

      if (isPitcher) {
        pitchers.push(player);
      } else {
        hitters.push(player);
      }
    });

    const totalHitterSpots = currentLeague?.rosterSpotsHitters ?? 14;
    const totalPitcherSpots = currentLeague?.rosterSpotsPitchers ?? 9;

    // Move overflow to bench
    while (hitters.length > totalHitterSpots && hitters.length > 0) {
      bench.push(hitters.pop()!);
    }
    while (pitchers.length > totalPitcherSpots && pitchers.length > 0) {
      bench.push(pitchers.pop()!);
    }

    const spent =
      (currentLeague?.budget ?? 260) - (draft?.remainingBudget ?? currentLeague?.budget ?? 260);

    return {
      budget: {
        total: currentLeague?.budget ?? 260,
        spent,
        remaining: draft?.remainingBudget ?? currentLeague?.budget ?? 260,
      },
      roster: {
        hitters,
        pitchers,
        bench,
      },
      leagueSettings: {
        teamCount: currentLeague?.teamCount ?? 10,
        rosterSpotsHitters: currentLeague?.rosterSpotsHitters ?? 14,
        rosterSpotsPitchers: currentLeague?.rosterSpotsPitchers ?? 9,
        rosterSpotsBench: currentLeague?.rosterSpotsBench ?? 3,
      },
    };
  }, [players, draft, currentLeague]);

  // Handle player selection
  const handlePlayerSelect = useCallback((player: Player) => {
    setSelectedPlayer(player);
  }, []);

  // Close player detail modal
  const handleCloseModal = useCallback(() => {
    setSelectedPlayer(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="status"
        aria-label="Loading draft room"
      >
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !currentLeague) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-xl text-white mb-2">League Not Found</h2>
          <p className="text-slate-400 mb-4">
            {error || 'This league does not exist or you do not have access.'}
          </p>
          <Button asChild variant="outline">
            <Link to="/leagues">Back to Leagues</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/leagues/${leagueId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to League
          </Link>
        </Button>

        {/* Sync Status Indicator - Story 9.4, 9.5 */}
        {currentLeague.couchManagersRoomId && (
          <div className="flex items-center gap-3">
            {/* Last Sync Timestamp - Story 9.5 */}
            <LastSyncTimestamp lastSync={lastSync} />

            {/* Connection Status Badge with Tooltip */}
            <ConnectionStatusBadge
              status={connectionState}
              lastSync={lastSync}
              isSyncing={syncStatus.isSyncing}
            />

            {/* Retry Connection Button - Story 9.6 */}
            {/* Only shows when disconnected or reconnecting */}
            <RetryConnectionButton
              status={connectionState}
              isSyncing={syncStatus.isSyncing}
              onRetry={triggerSync}
              lastError={syncStatus.error}
            />

            {/* Manual Sync Button - only show when connected */}
            {connectionState === 'connected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={triggerSync}
                disabled={syncStatus.isSyncing}
                aria-label={syncStatus.isSyncing ? 'Syncing...' : 'Sync now'}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
                />
                {syncStatus.isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Draft Content - Wrapped in Error Boundary (Story 10.8, NFR-I2) */}
      <DraftErrorBoundary>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{currentLeague.name} - Draft Room</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Story 10.6: Persistent Error Banner */}
            {currentLeague.couchManagersRoomId && (
              <PersistentErrorBanner
                syncStatus={syncStatus}
                onRetry={triggerSync}
                onManualModeHelp={() => {
                  // Dispatch event to open manual mode help modal
                  window.dispatchEvent(new CustomEvent('open-manual-mode-help'));
                }}
              />
            )}

            {/* Couch Managers Status */}
            {!currentLeague.couchManagersRoomId ? (
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 mb-2">No Couch Managers connection configured.</p>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/leagues/${leagueId}`}>Configure Connection</Link>
                </Button>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Couch Managers Room</h3>
                    <p className="text-white font-mono">{currentLeague.couchManagersRoomId}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium text-slate-400">Sync Interval</h3>
                    <p className="text-white">{currentLeague.syncInterval ?? 20} minutes</p>
                  </div>
                </div>
              </div>
            )}

            {/* Drafted Players Count */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Draft Progress</h3>
              <p className="text-2xl font-bold text-white">
                {draftedPlayers.length}
                <span className="text-slate-400 text-base font-normal ml-2">players drafted</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Draft Interface - PlayerQueue + RosterPanel + InflationTracker */}
        {projectionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-slate-400">Loading projections...</span>
          </div>
        ) : projections.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900 mt-6">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400 mb-4">
                No projections imported yet. Import projections to start your draft.
              </p>
              <Button asChild variant="outline">
                <Link to={`/leagues/${leagueId}/projections/import`}>Import Projections</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Player Queue (2 cols on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-800 bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Available Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayerQueueWithSearch
                    players={players}
                    onPlayerSelect={handlePlayerSelect}
                    isLoading={projectionsLoading}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column: RosterPanel + InflationTracker */}
            <div className="space-y-6">
              {/* Inflation Tracker */}
              <InflationTracker
                inflationRate={inflationData.inflationRate}
                positionRates={inflationData.positionRates}
                tierRates={inflationData.tierRates}
              />

              {/* Roster Panel */}
              <RosterPanel
                budget={rosterPanelData.budget}
                roster={rosterPanelData.roster}
                leagueSettings={rosterPanelData.leagueSettings}
              />
            </div>
          </div>
        )}

        {/* Player Detail Modal */}
        <PlayerDetailModal
          player={selectedPlayer}
          isOpen={selectedPlayer !== null}
          onClose={handleCloseModal}
        />
      </DraftErrorBoundary>
    </div>
  );
}

export default DraftPage;
