/**
 * League Store (Zustand)
 *
 * Global state management for league data.
 * Handles league CRUD operations with Supabase.
 *
 * Story: 3.2 - Implement Create League Form
 */

import { create } from 'zustand';
import DOMPurify from 'dompurify';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { useDraftStore } from '@/features/draft';
import type {
  LeagueStore,
  League,
  CreateLeagueRequest,
  UpdateLeagueRequest,
} from '../types/league.types';

/**
 * Initial league state
 */
const initialState = {
  leagues: [] as League[],
  currentLeague: null as League | null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isConnecting: false,
  error: null as string | null,
  connectionError: null as string | null,
};

/**
 * Map Supabase errors to user-friendly messages
 * @param errorMessage - The error message from Supabase
 * @param statusCode - Optional HTTP status code for better error mapping
 */
const mapLeagueError = (errorMessage: string, statusCode?: number): string => {
  const lowerMessage = errorMessage.toLowerCase();

  // Handle 409 Conflict (duplicate key/unique constraint violation)
  if (
    statusCode === 409 ||
    lowerMessage.includes('duplicate') ||
    lowerMessage.includes('unique') ||
    lowerMessage.includes('conflict')
  ) {
    return 'A league with this configuration already exists. Please try a different name.';
  }

  if (lowerMessage.includes('not found') || lowerMessage.includes('no rows')) {
    return 'League not found';
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('policy')) {
    return 'You do not have permission to perform this action';
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }

  if (lowerMessage.includes('foreign key') || lowerMessage.includes('reference')) {
    return 'Invalid user reference. Please try logging in again.';
  }

  return 'An error occurred. Please try again.';
};

/**
 * Transform snake_case database response to camelCase League interface
 */
const transformLeague = (data: Record<string, unknown>): League => ({
  id: data.id as string,
  userId: data.user_id as string,
  name: data.name as string,
  teamCount: data.team_count as number,
  budget: data.budget as number,
  rosterSpotsHitters: data.roster_spots_hitters as number | null,
  rosterSpotsPitchers: data.roster_spots_pitchers as number | null,
  rosterSpotsBench: data.roster_spots_bench as number | null,
  scoringType: data.scoring_type as League['scoringType'],
  couchManagersRoomId: data.couch_managers_room_id as string | null | undefined,
  syncInterval: data.sync_interval as number | null | undefined,
  createdAt: data.created_at as string,
  updatedAt: data.updated_at as string,
});

/**
 * League store with Zustand
 *
 * @example
 * ```typescript
 * const { leagues, fetchLeagues, createLeague } = useLeagueStore();
 *
 * // Fetch leagues on mount
 * useEffect(() => {
 *   fetchLeagues();
 * }, []);
 *
 * // Create new league
 * const handleCreate = async (data) => {
 *   const newLeague = await createLeague(data);
 *   if (newLeague) {
 *     navigate(`/leagues/${newLeague.id}`);
 *   }
 * };
 * ```
 */
export const useLeagueStore = create<LeagueStore>((set, get) => ({
  // State
  ...initialState,

  // Actions

  /**
   * Fetch all leagues for current user
   */
  fetchLeagues: async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      set({ error: 'League service is not configured', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        set({
          leagues: [],
          isLoading: false,
          error: mapLeagueError(error.message),
        });
        return;
      }

      set({
        leagues: (data || []).map(transformLeague),
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leagues';
      set({
        leagues: [],
        isLoading: false,
        error: mapLeagueError(errorMessage),
      });
    }
  },

  /**
   * Fetch a single league by ID
   */
  fetchLeague: async (leagueId: string): Promise<League | null> => {
    if (!isSupabaseConfigured()) {
      set({ error: 'League service is not configured' });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

      if (error) {
        set({
          currentLeague: null,
          isLoading: false,
          error: mapLeagueError(error.message),
        });
        return null;
      }

      const league = transformLeague(data);
      set({
        currentLeague: league,
        isLoading: false,
        error: null,
      });
      return league;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch league';
      set({
        currentLeague: null,
        isLoading: false,
        error: mapLeagueError(errorMessage),
      });
      return null;
    }
  },

  /**
   * Create a new league
   *
   * Note: user_id is automatically set by RLS INSERT policy using auth.uid()
   */
  createLeague: async (data: CreateLeagueRequest): Promise<League | null> => {
    if (!isSupabaseConfigured()) {
      set({ error: 'League service is not configured', isCreating: false });
      return null;
    }

    set({ isCreating: true, error: null });

    try {
      const supabase = getSupabase();

      // Get current user ID for the insert
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({
          isCreating: false,
          error: 'You must be logged in to create a league',
        });
        return null;
      }

      // Sanitize name to prevent XSS attacks
      const sanitizedName = DOMPurify.sanitize(data.name, { ALLOWED_TAGS: [] });

      const { data: newLeague, error } = await supabase
        .from('leagues')
        .insert({
          user_id: user.id,
          name: sanitizedName,
          team_count: data.team_count,
          budget: data.budget,
          roster_spots_hitters: data.roster_spots_hitters ?? null,
          roster_spots_pitchers: data.roster_spots_pitchers ?? null,
          roster_spots_bench: data.roster_spots_bench ?? null,
          scoring_type: data.scoring_type ?? null,
        })
        .select()
        .single();

      if (error) {
        // Extract status code from error if available (Supabase PostgrestError has 'code' property)
        // For HTTP errors like 409, the code may be in error.code or we detect from message
        const statusCode = error.code === '23505' ? 409 : undefined; // 23505 is PostgreSQL unique_violation
        set({
          isCreating: false,
          error: mapLeagueError(error.message, statusCode),
        });
        return null;
      }

      const league = transformLeague(newLeague);

      // Add to leagues list
      set(state => ({
        leagues: [league, ...state.leagues],
        currentLeague: league,
        isCreating: false,
        error: null,
      }));

      return league;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create league';
      set({
        isCreating: false,
        error: mapLeagueError(errorMessage),
      });
      return null;
    }
  },

  /**
   * Update an existing league
   */
  updateLeague: async (leagueId: string, data: UpdateLeagueRequest): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      set({ error: 'League service is not configured', isUpdating: false });
      return false;
    }

    set({ isUpdating: true, error: null });

    // Store previous state for rollback
    const previousLeagues = get().leagues;
    const previousCurrentLeague = get().currentLeague;

    // Optimistic update
    set(state => ({
      leagues: state.leagues.map(league =>
        league.id === leagueId
          ? { ...league, ...transformUpdateRequest(data), updatedAt: new Date().toISOString() }
          : league
      ),
      currentLeague:
        state.currentLeague?.id === leagueId
          ? {
              ...state.currentLeague,
              ...transformUpdateRequest(data),
              updatedAt: new Date().toISOString(),
            }
          : state.currentLeague,
    }));

    try {
      const supabase = getSupabase();

      // Sanitize name to prevent XSS attacks (same as createLeague)
      const sanitizedData = {
        ...data,
        ...(data.name !== undefined && {
          name: DOMPurify.sanitize(data.name, { ALLOWED_TAGS: [] }),
        }),
      };

      const { error } = await supabase.from('leagues').update(sanitizedData).eq('id', leagueId);

      if (error) {
        // Rollback on error
        set({
          leagues: previousLeagues,
          currentLeague: previousCurrentLeague,
          isUpdating: false,
          error: mapLeagueError(error.message),
        });
        return false;
      }

      set({ isUpdating: false, error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update league';
      set({
        leagues: previousLeagues,
        currentLeague: previousCurrentLeague,
        isUpdating: false,
        error: mapLeagueError(errorMessage),
      });
      return false;
    }
  },

  /**
   * Delete a league
   */
  deleteLeague: async (leagueId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      set({ error: 'League service is not configured', isDeleting: false });
      return false;
    }

    set({ isDeleting: true, error: null });

    // Store previous state for rollback
    const previousLeagues = get().leagues;
    const previousCurrentLeague = get().currentLeague;

    // Optimistic removal
    set(state => ({
      leagues: state.leagues.filter(league => league.id !== leagueId),
      currentLeague: state.currentLeague?.id === leagueId ? null : state.currentLeague,
    }));

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('leagues').delete().eq('id', leagueId);

      if (error) {
        // Rollback on error
        set({
          leagues: previousLeagues,
          currentLeague: previousCurrentLeague,
          isDeleting: false,
          error: mapLeagueError(error.message),
        });
        return false;
      }

      // Clear associated draft state to prevent orphaned data
      useDraftStore.getState().clearDraft(leagueId);

      set({ isDeleting: false, error: null });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete league';
      set({
        leagues: previousLeagues,
        currentLeague: previousCurrentLeague,
        isDeleting: false,
        error: mapLeagueError(errorMessage),
      });
      return false;
    }
  },

  /**
   * Set current league
   */
  setCurrentLeague: (league: League | null) => {
    set({ currentLeague: league });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Clear connection error message
   */
  clearConnectionError: () => {
    set({ connectionError: null });
  },

  /**
   * Connect league to Couch Managers draft room
   * Tests connection via Edge Function before saving room ID
   */
  connectToCouchManagers: async (leagueId: string, roomId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      set({ connectionError: 'Connection service is not configured', isConnecting: false });
      return false;
    }

    set({ isConnecting: true, connectionError: null });

    try {
      const supabase = getSupabase();

      // Test connection via Edge Function
      const { data, error: functionError } = await supabase.functions.invoke(
        'sync-couch-managers',
        {
          body: { roomId, leagueId },
        }
      );

      if (functionError || !data?.success) {
        const errorMessage = functionError?.message || 'Invalid room ID or connection failed';
        set({ isConnecting: false, connectionError: errorMessage });
        return false;
      }

      // Save room ID to league
      const { error: updateError } = await supabase
        .from('leagues')
        .update({ couch_managers_room_id: roomId })
        .eq('id', leagueId);

      if (updateError) {
        set({ isConnecting: false, connectionError: 'Failed to save room ID' });
        return false;
      }

      // Update local state
      set(state => ({
        leagues: state.leagues.map(league =>
          league.id === leagueId ? { ...league, couchManagersRoomId: roomId } : league
        ),
        currentLeague:
          state.currentLeague?.id === leagueId
            ? { ...state.currentLeague, couchManagersRoomId: roomId }
            : state.currentLeague,
        isConnecting: false,
        connectionError: null,
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      set({ isConnecting: false, connectionError: errorMessage });
      return false;
    }
  },

  /**
   * Disconnect league from Couch Managers
   */
  disconnectFromCouchManagers: async (leagueId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      set({ connectionError: 'Connection service is not configured', isConnecting: false });
      return false;
    }

    set({ isConnecting: true, connectionError: null });

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('leagues')
        .update({ couch_managers_room_id: null })
        .eq('id', leagueId);

      if (error) {
        set({ isConnecting: false, connectionError: 'Failed to disconnect' });
        return false;
      }

      // Update local state
      set(state => ({
        leagues: state.leagues.map(league =>
          league.id === leagueId ? { ...league, couchManagersRoomId: null } : league
        ),
        currentLeague:
          state.currentLeague?.id === leagueId
            ? { ...state.currentLeague, couchManagersRoomId: null }
            : state.currentLeague,
        isConnecting: false,
        connectionError: null,
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Disconnect failed';
      set({ isConnecting: false, connectionError: errorMessage });
      return false;
    }
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));

/**
 * Helper to transform snake_case update request to camelCase for optimistic updates
 */
function transformUpdateRequest(data: UpdateLeagueRequest): Partial<League> {
  const result: Partial<League> = {};
  if (data.name !== undefined) result.name = data.name;
  if (data.team_count !== undefined) result.teamCount = data.team_count;
  if (data.budget !== undefined) result.budget = data.budget;
  if (data.roster_spots_hitters !== undefined)
    result.rosterSpotsHitters = data.roster_spots_hitters;
  if (data.roster_spots_pitchers !== undefined)
    result.rosterSpotsPitchers = data.roster_spots_pitchers;
  if (data.roster_spots_bench !== undefined) result.rosterSpotsBench = data.roster_spots_bench;
  if (data.scoring_type !== undefined) result.scoringType = data.scoring_type;
  return result;
}

// Selector hooks for common patterns
export const useLeagues = () => useLeagueStore(state => state.leagues);
export const useCurrentLeague = () => useLeagueStore(state => state.currentLeague);
export const useLeagueLoading = () => useLeagueStore(state => state.isLoading);
export const useLeagueCreating = () => useLeagueStore(state => state.isCreating);
export const useLeagueUpdating = () => useLeagueStore(state => state.isUpdating);
export const useLeagueDeleting = () => useLeagueStore(state => state.isDeleting);
export const useLeagueConnecting = () => useLeagueStore(state => state.isConnecting);
export const useLeagueError = () => useLeagueStore(state => state.error);
export const useConnectionError = () => useLeagueStore(state => state.connectionError);
