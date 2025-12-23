/**
 * League Store Tests
 *
 * Tests for the Zustand league store including CRUD operations.
 *
 * Story: 3.2 - Implement Create League Form
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';

// Mock Supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({
    from: () => ({
      insert: mockInsert,
      select: mockSelect,
      delete: mockDelete,
      update: mockUpdate,
      order: mockOrder,
    }),
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

describe('useLeagueStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useLeagueStore.getState().reset();
    vi.clearAllMocks();

    // Setup default mock chain
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle, order: mockOrder, eq: mockEq });
    mockOrder.mockReturnValue({ data: [], error: null });
    mockEq.mockReturnValue({ single: mockSingle, data: null, error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty leagues array', () => {
      const state = useLeagueStore.getState();
      expect(state.leagues).toEqual([]);
    });

    it('should have null currentLeague', () => {
      const state = useLeagueStore.getState();
      expect(state.currentLeague).toBeNull();
    });

    it('should have loading states as false', () => {
      const state = useLeagueStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isCreating).toBe(false);
      expect(state.isUpdating).toBe(false);
      expect(state.isDeleting).toBe(false);
    });

    it('should have null error', () => {
      const state = useLeagueStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('createLeague', () => {
    it('should create league successfully', async () => {
      const mockLeague = {
        id: 'league-123',
        user_id: 'user-123',
        name: 'Test League',
        team_count: 12,
        budget: 260,
        roster_spots_hitters: null,
        roster_spots_pitchers: null,
        roster_spots_bench: null,
        scoring_type: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSingle.mockResolvedValue({ data: mockLeague, error: null });

      const result = await useLeagueStore.getState().createLeague({
        name: 'Test League',
        team_count: 12,
        budget: 260,
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test League');
      expect(result?.teamCount).toBe(12);
      expect(result?.budget).toBe(260);

      const state = useLeagueStore.getState();
      expect(state.leagues).toHaveLength(1);
      expect(state.isCreating).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await useLeagueStore.getState().createLeague({
        name: 'Test League',
        team_count: 12,
        budget: 260,
      });

      expect(result).toBeNull();
      expect(useLeagueStore.getState().error).toBe(
        'You must be logged in to create a league'
      );
    });

    it('should set error when insert fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      const result = await useLeagueStore.getState().createLeague({
        name: 'Test League',
        team_count: 12,
        budget: 260,
      });

      expect(result).toBeNull();
      expect(useLeagueStore.getState().error).toBeTruthy();
      expect(useLeagueStore.getState().isCreating).toBe(false);
    });

    it('should set isCreating while creating', async () => {
      // Create a promise that we control
      let resolveInsert: (value: unknown) => void;
      const insertPromise = new Promise(resolve => {
        resolveInsert = resolve;
      });

      mockSingle.mockReturnValue(insertPromise);

      // Start creating
      const createPromise = useLeagueStore.getState().createLeague({
        name: 'Test League',
        team_count: 12,
        budget: 260,
      });

      // Check that isCreating is true
      expect(useLeagueStore.getState().isCreating).toBe(true);

      // Resolve the insert
      resolveInsert!({ data: null, error: { message: 'Test error' } });
      await createPromise;

      // Check that isCreating is false
      expect(useLeagueStore.getState().isCreating).toBe(false);
    });
  });

  describe('fetchLeagues', () => {
    it('should fetch leagues successfully', async () => {
      const mockLeagues = [
        {
          id: 'league-1',
          user_id: 'user-123',
          name: 'League 1',
          team_count: 12,
          budget: 260,
          roster_spots_hitters: 14,
          roster_spots_pitchers: 9,
          roster_spots_bench: 3,
          scoring_type: '5x5',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'league-2',
          user_id: 'user-123',
          name: 'League 2',
          team_count: 10,
          budget: 300,
          roster_spots_hitters: null,
          roster_spots_pitchers: null,
          roster_spots_bench: null,
          scoring_type: null,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockOrder.mockReturnValue({ data: mockLeagues, error: null });

      await useLeagueStore.getState().fetchLeagues();

      const state = useLeagueStore.getState();
      expect(state.leagues).toHaveLength(2);
      expect(state.leagues[0].name).toBe('League 1');
      expect(state.leagues[1].name).toBe('League 2');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Fetch failed' },
      });

      await useLeagueStore.getState().fetchLeagues();

      const state = useLeagueStore.getState();
      expect(state.leagues).toEqual([]);
      expect(state.error).toBeTruthy();
    });
  });

  describe('clearError', () => {
    it('should clear error', async () => {
      // Set an error first
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Test error' },
      });
      await useLeagueStore.getState().fetchLeagues();

      expect(useLeagueStore.getState().error).toBeTruthy();

      useLeagueStore.getState().clearError();

      expect(useLeagueStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      // Set some state first
      const mockLeagues = [
        {
          id: 'league-1',
          user_id: 'user-123',
          name: 'League 1',
          team_count: 12,
          budget: 260,
          roster_spots_hitters: null,
          roster_spots_pitchers: null,
          roster_spots_bench: null,
          scoring_type: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      mockOrder.mockReturnValue({ data: mockLeagues, error: null });
      await useLeagueStore.getState().fetchLeagues();

      expect(useLeagueStore.getState().leagues).toHaveLength(1);

      useLeagueStore.getState().reset();

      const state = useLeagueStore.getState();
      expect(state.leagues).toEqual([]);
      expect(state.currentLeague).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setCurrentLeague', () => {
    it('should set current league', () => {
      const league = {
        id: 'league-123',
        userId: 'user-123',
        name: 'Test League',
        teamCount: 12,
        budget: 260,
        rosterSpotsHitters: null,
        rosterSpotsPitchers: null,
        rosterSpotsBench: null,
        scoringType: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      useLeagueStore.getState().setCurrentLeague(league);

      expect(useLeagueStore.getState().currentLeague).toEqual(league);
    });

    it('should allow setting current league to null', () => {
      const league = {
        id: 'league-123',
        userId: 'user-123',
        name: 'Test League',
        teamCount: 12,
        budget: 260,
        rosterSpotsHitters: null,
        rosterSpotsPitchers: null,
        rosterSpotsBench: null,
        scoringType: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      useLeagueStore.getState().setCurrentLeague(league);
      useLeagueStore.getState().setCurrentLeague(null);

      expect(useLeagueStore.getState().currentLeague).toBeNull();
    });
  });

  describe('fetchLeague', () => {
    it('should fetch single league successfully', async () => {
      const mockLeague = {
        id: 'league-123',
        user_id: 'user-123',
        name: 'Test League',
        team_count: 12,
        budget: 260,
        roster_spots_hitters: null,
        roster_spots_pitchers: null,
        roster_spots_bench: null,
        scoring_type: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSingle.mockResolvedValue({ data: mockLeague, error: null });

      const result = await useLeagueStore.getState().fetchLeague('league-123');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test League');
      expect(useLeagueStore.getState().currentLeague?.id).toBe('league-123');
      expect(useLeagueStore.getState().isLoading).toBe(false);
      expect(useLeagueStore.getState().error).toBeNull();
    });

    it('should handle fetch league error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'League not found' },
      });

      const result = await useLeagueStore.getState().fetchLeague('invalid-id');

      expect(result).toBeNull();
      expect(useLeagueStore.getState().currentLeague).toBeNull();
      expect(useLeagueStore.getState().error).toBeTruthy();
    });

    it('should handle fetch league exception', async () => {
      mockSingle.mockRejectedValue(new Error('Network error'));

      const result = await useLeagueStore.getState().fetchLeague('league-123');

      expect(result).toBeNull();
      expect(useLeagueStore.getState().error).toBeTruthy();
    });
  });

  describe('updateLeague', () => {
    beforeEach(() => {
      // Set up initial state with a league
      const league = {
        id: 'league-123',
        userId: 'user-123',
        name: 'Original League',
        teamCount: 12,
        budget: 260,
        rosterSpotsHitters: null,
        rosterSpotsPitchers: null,
        rosterSpotsBench: null,
        scoringType: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      useLeagueStore.setState({ leagues: [league], currentLeague: league });
    });

    it('should update league successfully', async () => {
      mockEq.mockResolvedValue({ data: null, error: null });

      const result = await useLeagueStore.getState().updateLeague('league-123', {
        name: 'Updated League',
      });

      expect(result).toBe(true);
      expect(useLeagueStore.getState().isUpdating).toBe(false);
      expect(useLeagueStore.getState().error).toBeNull();
      // Optimistic update should have changed the name
      expect(useLeagueStore.getState().leagues[0].name).toBe('Updated League');
    });

    it('should handle update error and rollback', async () => {
      mockEq.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      const result = await useLeagueStore.getState().updateLeague('league-123', {
        name: 'Updated League',
      });

      expect(result).toBe(false);
      expect(useLeagueStore.getState().error).toBeTruthy();
      // Should rollback to original name
      expect(useLeagueStore.getState().leagues[0].name).toBe('Original League');
    });

    it('should handle update exception and rollback', async () => {
      mockEq.mockRejectedValue(new Error('Network error'));

      const result = await useLeagueStore.getState().updateLeague('league-123', {
        name: 'Updated League',
      });

      expect(result).toBe(false);
      expect(useLeagueStore.getState().error).toBeTruthy();
      // Should rollback to original name
      expect(useLeagueStore.getState().leagues[0].name).toBe('Original League');
    });
  });

  describe('deleteLeague', () => {
    beforeEach(() => {
      // Set up initial state with leagues
      const leagues = [
        {
          id: 'league-1',
          userId: 'user-123',
          name: 'League 1',
          teamCount: 12,
          budget: 260,
          rosterSpotsHitters: null,
          rosterSpotsPitchers: null,
          rosterSpotsBench: null,
          scoringType: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'league-2',
          userId: 'user-123',
          name: 'League 2',
          teamCount: 10,
          budget: 300,
          rosterSpotsHitters: null,
          rosterSpotsPitchers: null,
          rosterSpotsBench: null,
          scoringType: null,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];
      useLeagueStore.setState({ leagues, currentLeague: leagues[0] });
    });

    it('should delete league successfully', async () => {
      mockEq.mockResolvedValue({ data: null, error: null });

      const result = await useLeagueStore.getState().deleteLeague('league-1');

      expect(result).toBe(true);
      expect(useLeagueStore.getState().isDeleting).toBe(false);
      expect(useLeagueStore.getState().error).toBeNull();
      expect(useLeagueStore.getState().leagues).toHaveLength(1);
      expect(useLeagueStore.getState().leagues[0].id).toBe('league-2');
      expect(useLeagueStore.getState().currentLeague).toBeNull();
    });

    it('should handle delete error and rollback', async () => {
      mockEq.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      const result = await useLeagueStore.getState().deleteLeague('league-1');

      expect(result).toBe(false);
      expect(useLeagueStore.getState().error).toBeTruthy();
      // Should rollback - leagues should still have both
      expect(useLeagueStore.getState().leagues).toHaveLength(2);
    });

    it('should handle delete exception and rollback', async () => {
      mockEq.mockRejectedValue(new Error('Network error'));

      const result = await useLeagueStore.getState().deleteLeague('league-1');

      expect(result).toBe(false);
      expect(useLeagueStore.getState().error).toBeTruthy();
      // Should rollback
      expect(useLeagueStore.getState().leagues).toHaveLength(2);
    });
  });
});
