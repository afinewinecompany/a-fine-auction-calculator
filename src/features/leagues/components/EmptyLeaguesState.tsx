/**
 * EmptyLeaguesState Component
 *
 * Displays a friendly empty state when user has no leagues.
 * Encourages user to create their first league with a CTA button.
 *
 * Story: 3.3 - Display Saved Leagues List
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * EmptyLeaguesState Component
 *
 * Renders an encouraging empty state with:
 * - Primary message: "No leagues yet"
 * - Descriptive subtext explaining how to get started
 * - "Create New League" CTA button linking to /leagues/new
 *
 * @example
 * ```tsx
 * if (leagues.length === 0) {
 *   return <EmptyLeaguesState />;
 * }
 * ```
 */
export function EmptyLeaguesState() {
  return (
    <div className="text-center py-12" data-testid="empty-leagues-state">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-4">No leagues yet</h2>
        <p className="text-slate-400 mb-6">
          Create your first league to get started with draft tracking. Set up your league settings
          and start managing your auction draft.
        </p>
        <Button asChild size="lg">
          <Link to="/leagues/new">Create New League</Link>
        </Button>
      </div>
    </div>
  );
}

export default EmptyLeaguesState;
