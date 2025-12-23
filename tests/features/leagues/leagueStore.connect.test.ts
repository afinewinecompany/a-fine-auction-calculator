/**
 * League Store Connection Tests
 *
 * Tests for Couch Managers connection functionality including:
 * - connectToCouchManagers action
 * - disconnectFromCouchManagers action
 * - Edge Function invocation
 * - Database updates
 * - State management
 * - Error handling
 *
 * Story: 9.2 - Implement Connection to Couch Managers Draft Room
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

// Store the original store state for restoration
const originalState = useLeagueStore.getState();

// Mock Supabase client
const mockSupabase = {
  functions: {
    invoke: vi.fn(),
  },
  from: vi.fn(() => ({
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
};

describe('League Store - Couch Managers Connection', () => {
  beforeEach(() => {
    // Reset store to initial state
    useLeagueStore.setState({
      ...originalState,
      leagues: [
        {
          id: 'league-123',
          userId: 'user-456',
          name: 'Test League',
          teamCount: 12,
          budget: 260,
          rosterSpotsHitters: null,
          rosterSpotsPitchers: null,
          rosterSpotsBench: null,
          scoringType: null,
          couchManagersRoomId: null,
          createdAt: '2025-12-14T10:00:00Z',
          updatedAt: '2025-12-14T10:00:00Z',
        },
      ],
      currentLeague: {
        id: 'league-123',
        userId: 'user-456',
        name: 'Test League',
        teamCount: 12,
        budget: 260,
        rosterSpotsHitters: null,
        rosterSpotsPitchers: null,
        rosterSpotsBench: null,
        scoringType: null,
        couchManagersRoomId: null,
        createdAt: '2025-12-14T10:00:00Z',
        updatedAt: '2025-12-14T10:00:00Z',
      },
      isConnecting: false,
      connectionError: null,
    });

    // Reset mocks
    vi.clearAllMocks();
    (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  afterEach(() => {
    useLeagueStore.setState(originalState);
  });

  describe('connectToCouchManagers', () => {
    it('should call Edge Function with roomId and leagueId', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, picks: [], syncTimestamp: new Date().toISOString() },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      await connectToCouchManagers('league-123', 'room-xyz');

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('sync-couch-managers', {
        body: { roomId: 'room-xyz', leagueId: 'league-123' },
      });
    });

    it('should save room ID to database after successful test', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, picks: [], syncTimestamp: new Date().toISOString() },
        error: null,
      });
      mockSupabase.from.mockReturnValue({ update: mockUpdate });

      const { connectToCouchManagers } = useLeagueStore.getState();
      await connectToCouchManagers('league-123', 'room-xyz');

      expect(mockSupabase.from).toHaveBeenCalledWith('leagues');
      expect(mockUpdate).toHaveBeenCalledWith({ couch_managers_room_id: 'room-xyz' });
    });

    it('should update local state on successful connection', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, picks: [], syncTimestamp: new Date().toISOString() },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      await connectToCouchManagers('league-123', 'room-xyz');

      const state = useLeagueStore.getState();
      expect(state.leagues[0].couchManagersRoomId).toBe('room-xyz');
      expect(state.currentLeague?.couchManagersRoomId).toBe('room-xyz');
    });

    it('should return true on successful connection', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, picks: [], syncTimestamp: new Date().toISOString() },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      const result = await connectToCouchManagers('league-123', 'room-xyz');

      expect(result).toBe(true);
    });

    it('should return false when Edge Function fails', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Function error' },
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      const result = await connectToCouchManagers('league-123', 'invalid-room');

      expect(result).toBe(false);
    });

    it('should return false when Edge Function returns success: false', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: false },
        error: null,
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      const result = await connectToCouchManagers('league-123', 'invalid-room');

      expect(result).toBe(false);
    });

    it('should set connectionError on failure', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      await connectToCouchManagers('league-123', 'invalid-room');

      const state = useLeagueStore.getState();
      expect(state.connectionError).toBe('Connection failed');
    });

    it('should set isConnecting to true during connection', async () => {
      let isConnectingDuringCall = false;

      mockSupabase.functions.invoke.mockImplementation(async () => {
        isConnectingDuringCall = useLeagueStore.getState().isConnecting;
        return {
          data: { success: true, picks: [], syncTimestamp: new Date().toISOString() },
          error: null,
        };
      });
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      await connectToCouchManagers('league-123', 'room-xyz');

      expect(isConnectingDuringCall).toBe(true);
    });

    it('should set isConnecting to false after connection completes', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, picks: [], syncTimestamp: new Date().toISOString() },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      await connectToCouchManagers('league-123', 'room-xyz');

      const state = useLeagueStore.getState();
      expect(state.isConnecting).toBe(false);
    });

    it('should return false when Supabase is not configured', async () => {
      (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { connectToCouchManagers } = useLeagueStore.getState();
      const result = await connectToCouchManagers('league-123', 'room-xyz');

      expect(result).toBe(false);
      expect(useLeagueStore.getState().connectionError).toBe('Connection service is not configured');
    });

    it('should return false when database update fails', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, picks: [], syncTimestamp: new Date().toISOString() },
        error: null,
      });
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
        }),
      });

      const { connectToCouchManagers } = useLeagueStore.getState();
      const result = await connectToCouchManagers('league-123', 'room-xyz');

      expect(result).toBe(false);
      expect(useLeagueStore.getState().connectionError).toBe('Failed to save room ID');
    });
  });

  describe('disconnectFromCouchManagers', () => {
    beforeEach(() => {
      // Set up league with existing room ID
      useLeagueStore.setState(state => ({
        leagues: state.leagues.map(l => ({ ...l, couchManagersRoomId: 'room-xyz' })),
        currentLeague: state.currentLeague
          ? { ...state.currentLeague, couchManagersRoomId: 'room-xyz' }
          : null,
      }));
    });

    it('should set room ID to null in database', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      mockSupabase.from.mockReturnValue({ update: mockUpdate });

      const { disconnectFromCouchManagers } = useLeagueStore.getState();
      await disconnectFromCouchManagers('league-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('leagues');
      expect(mockUpdate).toHaveBeenCalledWith({ couch_managers_room_id: null });
    });

    it('should update local state on successful disconnect', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { disconnectFromCouchManagers } = useLeagueStore.getState();
      await disconnectFromCouchManagers('league-123');

      const state = useLeagueStore.getState();
      expect(state.leagues[0].couchManagersRoomId).toBeNull();
      expect(state.currentLeague?.couchManagersRoomId).toBeNull();
    });

    it('should return true on successful disconnect', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { disconnectFromCouchManagers } = useLeagueStore.getState();
      const result = await disconnectFromCouchManagers('league-123');

      expect(result).toBe(true);
    });

    it('should return false when database update fails', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
        }),
      });

      const { disconnectFromCouchManagers } = useLeagueStore.getState();
      const result = await disconnectFromCouchManagers('league-123');

      expect(result).toBe(false);
      expect(useLeagueStore.getState().connectionError).toBe('Failed to disconnect');
    });

    it('should return false when Supabase is not configured', async () => {
      (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { disconnectFromCouchManagers } = useLeagueStore.getState();
      const result = await disconnectFromCouchManagers('league-123');

      expect(result).toBe(false);
      expect(useLeagueStore.getState().connectionError).toBe('Connection service is not configured');
    });
  });

  describe('clearConnectionError', () => {
    it('should clear connectionError state', () => {
      useLeagueStore.setState({ connectionError: 'Some error' });

      const { clearConnectionError } = useLeagueStore.getState();
      clearConnectionError();

      expect(useLeagueStore.getState().connectionError).toBeNull();
    });
  });
});
