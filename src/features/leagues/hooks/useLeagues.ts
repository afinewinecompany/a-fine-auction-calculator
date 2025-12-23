/**
 * League Hooks
 *
 * Custom React hooks for league operations.
 * Provides convenient abstractions over the league store.
 *
 * Story: 3.2 - Implement Create League Form
 */

import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagueStore } from '../stores/leagueStore';
import type { CreateLeagueRequest, League } from '../types/league.types';
import type { LeagueFormData } from '../utils/leagueValidation';

/**
 * Hook for managing leagues list
 *
 * @example
 * ```tsx
 * const { leagues, isLoading, error, refresh } = useLeaguesList();
 *
 * useEffect(() => {
 *   refresh();
 * }, [refresh]);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return <LeagueList leagues={leagues} />;
 * ```
 */
export function useLeaguesList() {
  const leagues = useLeagueStore(state => state.leagues);
  const isLoading = useLeagueStore(state => state.isLoading);
  const error = useLeagueStore(state => state.error);
  const fetchLeagues = useLeagueStore(state => state.fetchLeagues);
  const clearError = useLeagueStore(state => state.clearError);

  const refresh = useCallback(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  return {
    leagues,
    isLoading,
    error,
    refresh,
    clearError,
  };
}

/**
 * Hook for creating a new league
 *
 * @example
 * ```tsx
 * const { createLeague, isCreating, error } = useCreateLeague();
 *
 * const handleSubmit = async (data: LeagueFormData) => {
 *   const newLeague = await createLeague(data);
 *   // Navigation is handled automatically
 * };
 * ```
 */
export function useCreateLeague() {
  const navigate = useNavigate();
  const createLeagueAction = useLeagueStore(state => state.createLeague);
  const isCreating = useLeagueStore(state => state.isCreating);
  const error = useLeagueStore(state => state.error);
  const clearError = useLeagueStore(state => state.clearError);

  /**
   * Create a new league from form data
   *
   * @param formData - Form data with camelCase field names
   * @param options - Optional configuration
   * @returns Created league or null if failed
   */
  const createLeague = useCallback(
    async (
      formData: LeagueFormData,
      options?: {
        redirectToLeague?: boolean;
        redirectToList?: boolean;
      }
    ): Promise<League | null> => {
      // Transform camelCase form data to snake_case for database
      const leagueData: CreateLeagueRequest = {
        name: formData.name.trim(),
        team_count: formData.teamCount,
        budget: formData.budget,
        roster_spots_hitters: formData.rosterSpotsHitters,
        roster_spots_pitchers: formData.rosterSpotsPitchers,
        roster_spots_bench: formData.rosterSpotsBench,
        scoring_type: formData.scoringType,
      };

      const newLeague = await createLeagueAction(leagueData);

      if (newLeague) {
        // Default behavior: redirect to league detail page
        if (options?.redirectToList) {
          navigate('/leagues');
        } else if (options?.redirectToLeague !== false) {
          // Redirect to the league detail page per AC requirement
          navigate(`/leagues/${newLeague.id}`);
        }
      }

      return newLeague;
    },
    [createLeagueAction, navigate]
  );

  return {
    createLeague,
    isCreating,
    error,
    clearError,
  };
}

/**
 * Hook for loading a single league
 *
 * @param leagueId - League ID to load
 *
 * @example
 * ```tsx
 * const { league, isLoading, error } = useLeague(leagueId);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * if (!league) return <NotFound />;
 *
 * return <LeagueDetail league={league} />;
 * ```
 */
export function useLeague(leagueId: string | undefined) {
  const currentLeague = useLeagueStore(state => state.currentLeague);
  const isLoading = useLeagueStore(state => state.isLoading);
  const error = useLeagueStore(state => state.error);
  const fetchLeague = useLeagueStore(state => state.fetchLeague);
  const clearError = useLeagueStore(state => state.clearError);

  useEffect(() => {
    if (leagueId) {
      fetchLeague(leagueId);
    }
  }, [leagueId, fetchLeague]);

  return {
    league: currentLeague,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Hook for updating a league
 *
 * @example
 * ```tsx
 * const { updateLeague, isUpdating, error } = useUpdateLeague();
 *
 * const handleSave = async (leagueId: string, data: UpdateLeagueRequest) => {
 *   const success = await updateLeague(leagueId, data);
 *   if (success) {
 *     toast.success('League updated!');
 *   }
 * };
 * ```
 */
export function useUpdateLeague() {
  const updateLeagueAction = useLeagueStore(state => state.updateLeague);
  const isUpdating = useLeagueStore(state => state.isUpdating);
  const error = useLeagueStore(state => state.error);
  const clearError = useLeagueStore(state => state.clearError);

  return {
    updateLeague: updateLeagueAction,
    isUpdating,
    error,
    clearError,
  };
}

/**
 * Hook for deleting a league
 *
 * @example
 * ```tsx
 * const { deleteLeague, isDeleting, error } = useDeleteLeague();
 *
 * const handleDelete = async (leagueId: string) => {
 *   const success = await deleteLeague(leagueId);
 *   if (success) {
 *     navigate('/leagues');
 *   }
 * };
 * ```
 */
export function useDeleteLeague() {
  const navigate = useNavigate();
  const deleteLeagueAction = useLeagueStore(state => state.deleteLeague);
  const isDeleting = useLeagueStore(state => state.isDeleting);
  const error = useLeagueStore(state => state.error);
  const clearError = useLeagueStore(state => state.clearError);

  const deleteLeague = useCallback(
    async (leagueId: string, redirectAfterDelete = true): Promise<boolean> => {
      const success = await deleteLeagueAction(leagueId);
      if (success && redirectAfterDelete) {
        navigate('/leagues');
      }
      return success;
    },
    [deleteLeagueAction, navigate]
  );

  return {
    deleteLeague,
    isDeleting,
    error,
    clearError,
  };
}
