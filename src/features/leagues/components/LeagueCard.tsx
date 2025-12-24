/**
 * LeagueCard Component
 *
 * Displays individual league information in a card format.
 * Shows league name, team count, budget, and creation date.
 * Provides action buttons for viewing, editing, starting draft, and deleting.
 *
 * Story: 3.3 - Display Saved Leagues List
 * Story: 3.4 - Implement Edit League Settings
 * Story: 3.5 - Implement Delete League
 * Story: 3.7 - Implement Resume Draft Functionality
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLeagueStore } from '../stores/leagueStore';
import { useHasDraftInProgress, formatCurrency } from '@/features/draft';
import type { League } from '../types/league.types';

/**
 * Props for LeagueCard component
 */
export interface LeagueCardProps {
  /** League data to display */
  league: League;
}

/**
 * Format team count with proper pluralization
 */
const formatTeamCount = (count: number): string => {
  return `${count} ${count === 1 ? 'team' : 'teams'}`;
};

/**
 * Format creation date as relative time
 */
const formatCreatedDate = (createdAt: string): string => {
  try {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return 'Unknown date';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown date';
  }
};

/**
 * LeagueCard Component
 *
 * Renders a single league card with:
 * - League name as title
 * - Team count, budget, and creation date
 * - View, Edit, Start Draft, and Delete action buttons
 *
 * @example
 * ```tsx
 * <LeagueCard league={leagueData} />
 * ```
 */
export function LeagueCard({ league }: LeagueCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deleteLeague = useLeagueStore(state => state.deleteLeague);
  // Note: isDeleting is a global state shared across all LeagueCards.
  // This means deleting one league will disable delete buttons on all cards.
  // This is acceptable as deletions are fast and prevents accidental double-deletes.
  const isDeleting = useLeagueStore(state => state.isDeleting);
  const hasDraftInProgress = useHasDraftInProgress(league.id);

  /**
   * Handle confirmed delete action
   * Calls deleteLeague from store and closes dialog
   * Shows toast notification on success or error
   */
  const handleConfirmDelete = async () => {
    const success = await deleteLeague(league.id);
    setIsDialogOpen(false);

    if (success) {
      toast.success(`"${league.name}" has been deleted`);
    } else {
      toast.error('Failed to delete league. Please try again.');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-emerald-500/50 focus-within:border-emerald-500/50 transition-all shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-lg font-semibold">{league.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-slate-400">
          <p data-testid="team-count">{formatTeamCount(league.teamCount)}</p>
          <p data-testid="budget">{formatCurrency(league.budget)} budget</p>
          <p className="text-sm" data-testid="created-date">
            Created {formatCreatedDate(league.createdAt)}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="default" size="sm">
            <Link to={`/leagues/${league.id}`}>View</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/leagues/${league.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button asChild variant={hasDraftInProgress ? 'default' : 'outline'} size="sm">
            <Link to={`/draft/${league.id}`}>
              {hasDraftInProgress ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume Draft
                </>
              ) : (
                'Start Draft'
              )}
            </Link>
          </Button>

          {/* Delete Button with Confirmation Dialog */}
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                aria-label={`Delete ${league.name}`}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete League</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Are you sure you want to delete &quot;{league.name}&quot;? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete League'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default LeagueCard;
