/**
 * useProjectionInfo Hook
 *
 * Fetches projection source and last updated timestamp for a league.
 *
 * Story: 4.7 - Display Projection Source and Timestamp
 */

import { useEffect, useState, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface ProjectionInfo {
  source: string | null;
  updatedAt: string | null;
  playerCount: number;
  loading: boolean;
  error: string | null;
}

interface UseProjectionInfoResult extends ProjectionInfo {
  refetch: () => void;
}

/**
 * Hook to fetch projection metadata for a league
 *
 * Returns the projection source, last updated timestamp, and player count.
 * Queries the most recent projection to get source and timestamp.
 *
 * @param leagueId - The league ID to fetch projection info for
 * @returns ProjectionInfo object with source, updatedAt, playerCount, loading, error state, and refetch function
 */
export function useProjectionInfo(leagueId: string): UseProjectionInfoResult {
  const [info, setInfo] = useState<ProjectionInfo>({
    source: null,
    updatedAt: null,
    playerCount: 0,
    loading: true,
    error: null,
  });

  const fetchInfo = useCallback(async () => {
    // Guard: Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setInfo({
        source: null,
        updatedAt: null,
        playerCount: 0,
        loading: false,
        error: 'Database not configured',
      });
      return;
    }

    // Guard: Check for valid leagueId
    if (!leagueId) {
      setInfo({
        source: null,
        updatedAt: null,
        playerCount: 0,
        loading: false,
        error: null,
      });
      return;
    }

    setInfo(prev => ({ ...prev, loading: true, error: null }));

    try {
      const supabase = getSupabase();

      // Get most recent projection for source and timestamp
      const { data, error } = await supabase
        .from('player_projections')
        .select('projection_source, updated_at')
        .eq('league_id', leagueId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (expected when no projections)
        console.error('Error fetching projection info:', error);
        setInfo({
          source: null,
          updatedAt: null,
          playerCount: 0,
          loading: false,
          error: error.message || 'Failed to fetch projection info',
        });
        return;
      }

      // Get player count
      const { count } = await supabase
        .from('player_projections')
        .select('id', { count: 'exact', head: true })
        .eq('league_id', leagueId);

      setInfo({
        source: data?.projection_source ?? null,
        updatedAt: data?.updated_at ?? null,
        playerCount: count ?? 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error in useProjectionInfo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projection info';
      setInfo({
        source: null,
        updatedAt: null,
        playerCount: 0,
        loading: false,
        error: errorMessage,
      });
    }
  }, [leagueId]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return {
    ...info,
    refetch: fetchInfo,
  };
}
