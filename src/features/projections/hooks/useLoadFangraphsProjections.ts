/**
 * useLoadFangraphsProjections Hook
 *
 * Fetches player projections from Fangraphs via Supabase Edge Function
 * and stores them in the player_projections table.
 *
 * Story: 4.5 - Select and Load Fangraphs Projections
 */

import { useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Json } from '@/types/database.types';

interface LoadResult {
  system: string;
  count: number;
}

interface FangraphsPlayer {
  playerName: string;
  team: string;
  positions: string[];
  projectedValue: number | null;
  statsHitters: Record<string, unknown> | null;
  statsPitchers: Record<string, unknown> | null;
}

interface FangraphsResponse {
  players: FangraphsPlayer[];
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Hook for loading Fangraphs projections into a league
 *
 * Provides loading state, progress tracking, and result/error handling
 * for importing projections from Fangraphs via the Edge Function.
 */
export function useLoadFangraphsProjections() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProjections = useCallback(async (leagueId: string, system: string) => {
    const supabase = getSupabase();

    setIsLoading(true);
    setProgress(0);
    setResult(null);
    setError(null);

    const startTime = Date.now();

    try {
      // Fetch hitters (progress: 10%)
      setProgress(10);
      const hittersResponse = await supabase.functions.invoke<FangraphsResponse>(
        'fetch-fangraphs-projections',
        {
          body: { system, playerType: 'hitters' },
        }
      );

      if (hittersResponse.error) {
        throw new Error(hittersResponse.error.message);
      }

      // Progress: 40% - hitters complete
      setProgress(40);

      // Fetch pitchers (progress: 40-70%)
      const pitchersResponse = await supabase.functions.invoke<FangraphsResponse>(
        'fetch-fangraphs-projections',
        {
          body: { system, playerType: 'pitchers' },
        }
      );

      if (pitchersResponse.error) {
        throw new Error(pitchersResponse.error.message);
      }

      // Progress: 70% - pitchers complete
      setProgress(70);

      // Combine hitters and pitchers
      const hitters = hittersResponse.data?.players ?? [];
      const pitchers = pitchersResponse.data?.players ?? [];
      const allPlayers = [...hitters, ...pitchers];

      // Format system name for source (e.g., "steamer" -> "Fangraphs - Steamer")
      const formattedSystem = capitalize(system);

      // Prepare projections for database insert
      const projections = allPlayers.map(player => ({
        league_id: leagueId,
        player_name: player.playerName,
        team: player.team,
        positions: player.positions,
        projected_value: player.projectedValue,
        projection_source: `Fangraphs - ${formattedSystem}`,
        stats_hitters: player.statsHitters as Json | null,
        stats_pitchers: player.statsPitchers as Json | null,
      }));

      // Progress: 85% - preparing insert
      setProgress(85);

      // Upsert to database (handles existing players)
      const { error: insertError } = await supabase
        .from('player_projections')
        .upsert(projections, { onConflict: 'league_id,player_name' });

      if (insertError) {
        throw insertError;
      }

      // Progress: 100% - complete
      setProgress(100);

      const duration = Date.now() - startTime;
      console.log(`Fangraphs import completed in ${duration}ms`);

      setResult({
        system: formattedSystem,
        count: allPlayers.length,
      });
    } catch (err) {
      // Handle different error shapes (Error objects, Supabase errors, etc.)
      let errorMessage = 'Failed to load projections';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      }
      setError(errorMessage);
      console.error('Fangraphs import failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loadProjections,
    isLoading,
    progress,
    result,
    error,
  };
}
