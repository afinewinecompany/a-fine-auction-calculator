/**
 * LeaguesList Component
 *
 * Main container component for displaying user's leagues.
 * Handles data fetching, loading, error, and empty states.
 * Renders leagues in a responsive grid layout.
 *
 * Story: 3.3 - Display Saved Leagues List
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeagueStore } from '../stores/leagueStore';
import { LeagueCard } from './LeagueCard';
import { EmptyLeaguesState } from './EmptyLeaguesState';

/**
 * Loading skeleton component
 * Shows 3 placeholder cards while leagues are loading
 */
function LoadingSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      data-testid="loading-skeleton"
    >
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl backdrop-blur-sm animate-pulse"
        >
          <CardHeader>
            <div className="h-6 bg-slate-700 rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-slate-700 rounded w-1/2" />
              <div className="h-4 bg-slate-700 rounded w-2/3" />
              <div className="h-4 bg-slate-700 rounded w-1/3" />
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-8 bg-slate-700 rounded w-16" />
              <div className="h-8 bg-slate-700 rounded w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Error state component
 * Shows error message with retry button
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12" data-testid="error-state">
      <p className="text-red-500 mb-4">Error loading leagues: {error}</p>
      <Button onClick={onRetry} variant="outline">
        Retry
      </Button>
    </div>
  );
}

/**
 * LeaguesList Component
 *
 * Main container that:
 * - Fetches leagues on mount using Zustand store
 * - Shows loading skeleton during fetch
 * - Shows error state with retry on failure
 * - Shows empty state when no leagues exist
 * - Renders responsive grid of LeagueCard components
 *
 * Responsive layout:
 * - Mobile (< md): 1 column
 * - Tablet (md - lg): 2 columns
 * - Desktop (lg+): 3 columns
 *
 * @example
 * ```tsx
 * // In router.tsx
 * <Route path="/leagues" element={<LeaguesList />} />
 * ```
 */
export function LeaguesList() {
  const leagues = useLeagueStore(state => state.leagues);
  const isLoading = useLeagueStore(state => state.isLoading);
  const error = useLeagueStore(state => state.error);
  const fetchLeagues = useLeagueStore(state => state.fetchLeagues);

  // Fetch leagues on component mount
  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Leagues</h1>
            <Button asChild>
              <Link to="/leagues/new">Create League</Link>
            </Button>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Leagues</h1>
            <Button asChild>
              <Link to="/leagues/new">Create League</Link>
            </Button>
          </div>
          <ErrorState error={error} onRetry={fetchLeagues} />
        </div>
      </div>
    );
  }

  // Empty state
  if (leagues.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Leagues</h1>
          </div>
          <EmptyLeaguesState />
        </div>
      </div>
    );
  }

  // Success state - render leagues grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Leagues</h1>
          <Button asChild>
            <Link to="/leagues/new">Create League</Link>
          </Button>
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="leagues-grid"
        >
          {leagues.map(league => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeaguesList;
