/**
 * LeagueDetail Component
 *
 * Displays full league settings and provides actions for:
 * - Copying league URL to clipboard
 * - Editing league settings
 * - Starting a draft
 * - Navigating back to leagues list
 *
 * Story: 3.6 - Generate Direct League Access Links
 * Story: 4.7 - Display Projection Source and Timestamp
 */

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Edit, Play, ArrowLeft, FileInput, Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeagueStore } from '../stores/leagueStore';
import { ConnectCouchManagersDialog } from './ConnectCouchManagersDialog';
import { ProjectionInfo, useProjectionInfo, ExportProjections } from '@/features/projections';
import { ConnectionStatusBadge, formatBudget } from '@/features/draft';

/**
 * Format date as relative time
 */
const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

/**
 * Setting item display component
 */
interface SettingItemProps {
  label: string;
  value: string | number | null | undefined;
  testId?: string;
}

function SettingItem({ label, value, testId }: SettingItemProps) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-medium" data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-secure contexts or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch {
    return false;
  }
}

/**
 * LeagueDetail Component
 *
 * Displays league information at /leagues/:leagueId route.
 * Fetches league data on mount using leagueId from URL params.
 *
 * @example
 * ```tsx
 * // Used in router configuration
 * {
 *   path: '/leagues/:leagueId',
 *   element: <LeagueDetail />,
 * }
 * ```
 */
export function LeagueDetail() {
  const { leagueId } = useParams<{ leagueId: string }>();

  // Store selectors
  const fetchLeague = useLeagueStore(state => state.fetchLeague);
  const disconnectFromCouchManagers = useLeagueStore(state => state.disconnectFromCouchManagers);
  const isConnecting = useLeagueStore(state => state.isConnecting);

  // Projection info
  const projectionInfo = useProjectionInfo(leagueId ?? '');
  const currentLeague = useLeagueStore(state => state.currentLeague);
  const isLoading = useLeagueStore(state => state.isLoading);
  const error = useLeagueStore(state => state.error);

  // Fetch league data on mount or when leagueId changes
  useEffect(() => {
    if (leagueId) {
      fetchLeague(leagueId);
    }
  }, [leagueId, fetchLeague]);

  /**
   * Handle copying league URL to clipboard
   */
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/leagues/${leagueId}`;
    const success = await copyToClipboard(url);

    if (success) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  /**
   * Handle disconnecting from Couch Managers
   */
  const handleDisconnect = async () => {
    if (!leagueId) return;

    const success = await disconnectFromCouchManagers(leagueId);

    if (success) {
      toast.success('Disconnected from Couch Managers');
    } else {
      toast.error('Failed to disconnect');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="status"
        aria-label="Loading league details"
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

  const league = currentLeague;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/leagues">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Leagues
          </Link>
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
          <CardTitle className="text-2xl text-white" data-testid="league-name">
            {league.name}
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-1" />
              Copy Link
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/leagues/${leagueId}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* League Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* Basic Settings */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                Basic Settings
              </h3>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <SettingItem
                  label="Team Count"
                  value={`${league.teamCount} teams`}
                  testId="team-count"
                />
                <SettingItem label="Budget" value={formatBudget(league.budget)} testId="budget" />
                {league.scoringType && (
                  <SettingItem
                    label="Scoring Type"
                    value={league.scoringType}
                    testId="scoring-type"
                  />
                )}
              </div>
            </div>

            {/* Roster Settings */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                Roster Settings
              </h3>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <SettingItem
                  label="Hitters"
                  value={
                    league.rosterSpotsHitters !== null ? `${league.rosterSpotsHitters} spots` : null
                  }
                  testId="roster-hitters"
                />
                <SettingItem
                  label="Pitchers"
                  value={
                    league.rosterSpotsPitchers !== null
                      ? `${league.rosterSpotsPitchers} spots`
                      : null
                  }
                  testId="roster-pitchers"
                />
                <SettingItem
                  label="Bench"
                  value={
                    league.rosterSpotsBench !== null ? `${league.rosterSpotsBench} spots` : null
                  }
                  testId="roster-bench"
                />
                {league.rosterSpotsHitters === null &&
                  league.rosterSpotsPitchers === null &&
                  league.rosterSpotsBench === null && (
                    <p className="text-slate-500 text-sm py-2">No roster settings configured</p>
                  )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                Timeline
              </h3>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <SettingItem
                  label="Created"
                  value={formatRelativeDate(league.createdAt)}
                  testId="created-date"
                />
                <SettingItem
                  label="Last Updated"
                  value={formatRelativeDate(league.updatedAt)}
                  testId="updated-date"
                />
              </div>
            </div>
          </div>

          {/* Projection Info */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
              Projections
            </h3>
            {projectionInfo.loading ? (
              <div
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 animate-pulse"
                role="status"
                aria-label="Loading projection information"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-slate-700 rounded" />
                    <div className="h-6 w-40 bg-slate-700 rounded" />
                  </div>
                  <div className="h-4 w-32 bg-slate-700 rounded" />
                </div>
              </div>
            ) : (
              <>
                <ProjectionInfo
                  source={projectionInfo.source}
                  updatedAt={projectionInfo.updatedAt}
                  playerCount={projectionInfo.playerCount}
                />
                <div className="mt-3 flex gap-2 flex-wrap">
                  {!projectionInfo.source ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/leagues/${leagueId}/projections`}>
                        <FileInput className="h-4 w-4 mr-1" />
                        Import Projections
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/leagues/${leagueId}/projections`}>
                          <FileInput className="h-4 w-4 mr-1" />
                          Import Projections
                        </Link>
                      </Button>
                      <ExportProjections leagueId={leagueId!} leagueName={league.name} />
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Couch Managers Integration */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
              Couch Managers Integration
            </h3>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-4">
                <ConnectCouchManagersDialog
                  leagueId={leagueId!}
                  currentRoomId={league.couchManagersRoomId}
                />
                {league.couchManagersRoomId && (
                  <>
                    <ConnectionStatusBadge status="connected" lastSync={null} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={isConnecting}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </>
                )}
              </div>
              {!league.couchManagersRoomId && (
                <p className="text-slate-500 text-sm mt-2">
                  Connect to a Couch Managers draft room to enable automatic sync during your draft.
                </p>
              )}
            </div>
          </div>

          {/* Start Draft Button */}
          <div className="pt-4 border-t border-slate-800">
            <Button asChild className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700">
              <Link to={`/draft/${leagueId}`}>
                <Play className="h-4 w-4 mr-1" />
                Start Draft
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LeagueDetail;
