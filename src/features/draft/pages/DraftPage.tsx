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
 */

import { useEffect } from 'react';
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

  // League store
  const fetchLeague = useLeagueStore(state => state.fetchLeague);
  const currentLeague = useLeagueStore(state => state.currentLeague);
  const isLoading = useLeagueStore(state => state.isLoading);
  const error = useLeagueStore(state => state.error);

  // Draft store - get draft state and drafted players
  const draft = useDraftStore(state => (leagueId ? state.drafts[leagueId] : undefined));
  const draftedPlayers = draft?.draftedPlayers ?? [];

  // Sync hook - starts polling on mount, stops on unmount
  // This is the core implementation for Story 9.3 and 9.4
  const { syncStatus, connectionState, triggerSync, lastSync } = useDraftSync(leagueId ?? '');

  // Fetch league data on mount
  useEffect(() => {
    if (leagueId) {
      fetchLeague(leagueId);
    }
  }, [leagueId, fetchLeague]);

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

            {/* Placeholder for future PlayerQueue and RosterPanel components */}
            <div className="text-center py-12 text-slate-500">
              <p>Full draft interface will be implemented in Epic 6 stories.</p>
              <p className="text-sm mt-2">
                Automatic sync is active when Couch Managers is connected.
              </p>
            </div>
          </CardContent>
        </Card>
      </DraftErrorBoundary>
    </div>
  );
}

export default DraftPage;
