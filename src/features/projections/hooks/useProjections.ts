/**
 * useProjections Hook
 *
 * Fetches all projections for a league.
 *
 * Story: 4.8 - Export Projections for Offline Analysis
 */

import { useEffect, useState, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { PlayerProjection } from '../types/projection.types';
import { toPlayerProjection } from '../types/projection.types';

interface UseProjectionsResult {
  projections: PlayerProjection[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch all projections for a league
 *
 * Returns the full list of projections for export or display.
 *
 * @param leagueId - The league ID to fetch projections for
 * @returns UseProjectionsResult with projections array, loading state, error, and refetch function
 */
export function useProjections(leagueId: string): UseProjectionsResult {
  const [projections, setProjections] = useState<PlayerProjection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjections = useCallback(async () => {
    // Guard: Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setProjections([]);
      setIsLoading(false);
      setError('Database not configured');
      return;
    }

    // Guard: Check for valid leagueId
    if (!leagueId) {
      setProjections([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();

      const { data, error: queryError } = await supabase
        .from('player_projections')
        .select('*')
        .eq('league_id', leagueId)
        .order('player_name');

      if (queryError) {
        console.error('Error fetching projections:', queryError);
        setError(queryError.message || 'Failed to fetch projections');
        setProjections([]);
      } else {
        // Transform snake_case to camelCase using helper
        setProjections(data?.map(toPlayerProjection) ?? []);
      }
    } catch (err) {
      console.error('Error in useProjections:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projections';
      setError(errorMessage);
      setProjections([]);
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchProjections();
  }, [fetchProjections]);

  return {
    projections,
    isLoading,
    error,
    refetch: fetchProjections,
  };
}
