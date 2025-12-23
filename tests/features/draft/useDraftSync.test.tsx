/**
 * useDraftSync Hook Tests
 *
 * Tests for the automatic draft sync polling hook.
 * Verifies polling behavior, sync status updates, and cleanup.
 *
 * Story: 9.3 - Implement Automatic API Polling
 * Updated: 9.7 - Implement Catch-Up Sync After Connection Restore
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDraftSync } from '@/features/draft/hooks/useDraftSync';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
import type { SyncSuccessResponse } from '@/features/draft/types/sync.types';
import { toast as sonnerToast } from 'sonner';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(() => ({
    functions: {
      invoke: vi.fn(),
    },
  })),
  isSupabaseConfigured: vi.fn(() => true),
}));

// Mock sonner toast (Story 9.7)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Get mocked supabase
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useDraftSync', () => {
  const mockLeagueId = 'league-123';
  const mockRoomId = '12345';

  // Mock successful sync response
  const mockSyncResponse: SyncSuccessResponse = {
    success: true,
    picks: [
      {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
      {
        playerId: 'player-2',
        playerName: 'Shohei Ohtani',
        team: 'Team B',
        auctionPrice: 55,
        position: 'DH',
      },
    ],
    currentAuctions: [],
    players: [],
    syncTimestamp: new Date().toISOString(),
    auctionInfo: {
      auctionId: mockRoomId,
      totalTeams: 12,
      rosterSize: 26,
      budget: 260,
    },
  };

  // Helper to set up league with room ID
  const setupLeagueWithRoomId = () => {
    useLeagueStore.setState({
      leagues: [
        {
          id: mockLeagueId,
          userId: 'user-1',
          name: 'Test League',
          teamCount: 12,
          budget: 260,
          rosterSpotsHitters: 14,
          rosterSpotsPitchers: 9,
          rosterSpotsBench: 3,
          scoringType: '5x5',
          couchManagersRoomId: mockRoomId,
          syncInterval: 20,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    useDraftStore.getState().initializeDraft(mockLeagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });
  };

  beforeEach(() => {
    localStorageMock.clear();
    useDraftStore.setState({ drafts: {} });
    useLeagueStore.setState({ leagues: [], currentLeague: null });

    // Reset mocks
    vi.clearAllMocks();
    (isSupabaseConfigured as Mock).mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns default sync status when no league ID is provided', () => {
    const { result } = renderHook(() => useDraftSync(''));

    expect(result.current.syncStatus.isConnected).toBe(false);
    expect(result.current.syncStatus.isSyncing).toBe(false);
    expect(result.current.syncStatus.lastSync).toBeNull();
    expect(result.current.syncStatus.error).toBeNull();
    expect(result.current.lastSync).toBeNull();
  });

  it('returns disconnected status when league has no room ID', () => {
    // Set up league without room ID
    useLeagueStore.setState({
      leagues: [
        {
          id: mockLeagueId,
          userId: 'user-1',
          name: 'Test League',
          teamCount: 12,
          budget: 260,
          rosterSpotsHitters: 14,
          rosterSpotsPitchers: 9,
          rosterSpotsBench: 3,
          scoringType: '5x5',
          couchManagersRoomId: null,
          syncInterval: 20,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    const { result } = renderHook(() => useDraftSync(mockLeagueId));

    expect(result.current.syncStatus.isConnected).toBe(false);
  });

  it('calls sync Edge Function when league has room ID', async () => {
    setupLeagueWithRoomId();

    // Mock successful sync response
    const mockInvoke = vi.fn().mockResolvedValue({
      data: mockSyncResponse,
      error: null,
    });
    (getSupabase as Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    renderHook(() => useDraftSync(mockLeagueId));

    // Wait for sync to complete
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('sync-couch-managers', {
        body: {
          auctionId: mockRoomId,
          leagueId: mockLeagueId,
          lastSyncTimestamp: undefined,
        },
      });
    });
  });

  it('adds drafted players to store on successful sync', async () => {
    setupLeagueWithRoomId();

    // Mock successful sync response
    const mockInvoke = vi.fn().mockResolvedValue({
      data: mockSyncResponse,
      error: null,
    });
    (getSupabase as Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    renderHook(() => useDraftSync(mockLeagueId));

    // Wait for sync to complete
    await waitFor(() => {
      const draft = useDraftStore.getState().drafts[mockLeagueId];
      expect(draft.draftedPlayers).toHaveLength(2);
    });

    // Verify players were added correctly
    const draft = useDraftStore.getState().drafts[mockLeagueId];
    expect(draft.draftedPlayers[0].playerName).toBe('Mike Trout');
    expect(draft.draftedPlayers[1].playerName).toBe('Shohei Ohtani');
  });

  it('updates sync status on error', async () => {
    setupLeagueWithRoomId();

    // Mock error response
    const mockInvoke = vi.fn().mockResolvedValue({
      data: { success: false, error: 'Network error', code: 'NETWORK_ERROR' },
      error: null,
    });
    (getSupabase as Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const { result } = renderHook(() => useDraftSync(mockLeagueId));

    // Wait for error to be set
    // Story 10.6: Error messages are now user-friendly
    await waitFor(() => {
      expect(result.current.syncStatus.error).toBe(
        'Network connection failed. Check your internet connection.'
      );
    });

    expect(result.current.syncStatus.failureCount).toBe(1);
  });

  it('provides triggerSync function for manual sync', async () => {
    setupLeagueWithRoomId();

    // Mock successful sync response
    const mockInvoke = vi.fn().mockResolvedValue({
      data: mockSyncResponse,
      error: null,
    });
    (getSupabase as Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const { result } = renderHook(() => useDraftSync(mockLeagueId));

    // Initial sync happens on mount
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalled();
    });

    const initialCallCount = mockInvoke.mock.calls.length;

    // Manually trigger sync
    await act(async () => {
      await result.current.triggerSync();
    });

    // Verify additional sync was called
    expect(mockInvoke.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('clears polling on unmount', async () => {
    vi.useFakeTimers();
    setupLeagueWithRoomId();

    // Mock successful sync response
    const mockInvoke = vi.fn().mockResolvedValue({
      data: mockSyncResponse,
      error: null,
    });
    (getSupabase as Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const { unmount } = renderHook(() => useDraftSync(mockLeagueId));

    // Flush initial sync
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    const callCountBeforeUnmount = mockInvoke.mock.calls.length;

    // Unmount the hook
    unmount();

    // Advance time past polling interval
    await act(async () => {
      vi.advanceTimersByTime(25 * 60 * 1000); // 25 minutes
    });

    // Verify no additional syncs were made after unmount
    expect(mockInvoke.mock.calls.length).toBe(callCountBeforeUnmount);
  });

  it('does not sync when Supabase is not configured', async () => {
    (isSupabaseConfigured as Mock).mockReturnValue(false);

    setupLeagueWithRoomId();

    const mockInvoke = vi.fn();
    (getSupabase as Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    renderHook(() => useDraftSync(mockLeagueId));

    // Wait a bit for any potential async calls
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify no sync was attempted
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('updates isConnected status on successful sync', async () => {
    setupLeagueWithRoomId();

    // Mock successful sync response
    const mockInvoke = vi.fn().mockResolvedValue({
      data: mockSyncResponse,
      error: null,
    });
    (getSupabase as Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const { result } = renderHook(() => useDraftSync(mockLeagueId));

    // Wait for sync to complete
    await waitFor(() => {
      expect(result.current.syncStatus.isConnected).toBe(true);
    });

    expect(result.current.syncStatus.error).toBeNull();
  });

  // Story 9.7: Catch-Up Sync Tests
  describe('catch-up sync (Story 9.7)', () => {
    it('shows notification when 3+ picks are synced (catch-up threshold)', async () => {
      setupLeagueWithRoomId();

      // Mock catch-up sync response with 5 missed picks
      const catchUpResponse: SyncSuccessResponse = {
        success: true,
        picks: [
          { playerId: 'p1', playerName: 'Player 1', team: 'A', auctionPrice: 10, position: 'OF' },
          { playerId: 'p2', playerName: 'Player 2', team: 'B', auctionPrice: 20, position: '1B' },
          { playerId: 'p3', playerName: 'Player 3', team: 'C', auctionPrice: 30, position: 'SP' },
          { playerId: 'p4', playerName: 'Player 4', team: 'D', auctionPrice: 40, position: 'C' },
          { playerId: 'p5', playerName: 'Player 5', team: 'E', auctionPrice: 50, position: 'SS' },
        ],
        currentAuctions: [],
        players: [],
        syncTimestamp: new Date().toISOString(),
        auctionInfo: {
          auctionId: mockRoomId,
          totalTeams: 12,
          rosterSize: 26,
          budget: 260,
        },
      };

      const mockInvoke = vi.fn().mockResolvedValue({
        data: catchUpResponse,
        error: null,
      });
      (getSupabase as Mock).mockReturnValue({
        functions: { invoke: mockInvoke },
      });

      renderHook(() => useDraftSync(mockLeagueId));

      // Wait for sync to complete
      await waitFor(() => {
        const draft = useDraftStore.getState().drafts[mockLeagueId];
        expect(draft.draftedPlayers).toHaveLength(5);
      });

      // Verify toast was shown for catch-up sync
      expect(sonnerToast.success).toHaveBeenCalledWith(
        'Synced 5 missed picks',
        expect.objectContaining({
          description: 'Draft state updated with all missed picks',
        })
      );
    });

    it('does not show notification when fewer than 3 picks synced', async () => {
      setupLeagueWithRoomId();

      // Only 2 picks - below threshold
      const mockInvoke = vi.fn().mockResolvedValue({
        data: mockSyncResponse, // Has 2 picks
        error: null,
      });
      (getSupabase as Mock).mockReturnValue({
        functions: { invoke: mockInvoke },
      });

      // Clear any previous calls
      vi.mocked(sonnerToast.success).mockClear();

      renderHook(() => useDraftSync(mockLeagueId));

      // Wait for sync to complete
      await waitFor(() => {
        const draft = useDraftStore.getState().drafts[mockLeagueId];
        expect(draft.draftedPlayers).toHaveLength(2);
      });

      // Verify toast was NOT shown (below threshold)
      expect(sonnerToast.success).not.toHaveBeenCalled();
    });

    it('triggers inflation recalculation after sync', async () => {
      setupLeagueWithRoomId();

      // Spy on inflation store updateInflation
      const updateInflationSpy = vi.spyOn(useInflationStore.getState(), 'updateInflation');

      const mockInvoke = vi.fn().mockResolvedValue({
        data: mockSyncResponse,
        error: null,
      });
      (getSupabase as Mock).mockReturnValue({
        functions: { invoke: mockInvoke },
      });

      renderHook(() => useDraftSync(mockLeagueId));

      // Wait for sync to complete
      await waitFor(() => {
        const draft = useDraftStore.getState().drafts[mockLeagueId];
        expect(draft.draftedPlayers).toHaveLength(2);
      });

      // Verify inflation was recalculated
      expect(updateInflationSpy).toHaveBeenCalled();

      updateInflationSpy.mockRestore();
    });

    it('adds all missed picks to draft state (no data loss per NFR-R4)', async () => {
      setupLeagueWithRoomId();

      // Mock catch-up sync with 8 missed picks
      const eightPicksResponse: SyncSuccessResponse = {
        success: true,
        picks: [
          { playerId: 'p1', playerName: 'Player 1', team: 'A', auctionPrice: 10, position: 'OF' },
          { playerId: 'p2', playerName: 'Player 2', team: 'B', auctionPrice: 20, position: '1B' },
          { playerId: 'p3', playerName: 'Player 3', team: 'C', auctionPrice: 30, position: 'SP' },
          { playerId: 'p4', playerName: 'Player 4', team: 'D', auctionPrice: 40, position: 'C' },
          { playerId: 'p5', playerName: 'Player 5', team: 'E', auctionPrice: 50, position: 'SS' },
          { playerId: 'p6', playerName: 'Player 6', team: 'F', auctionPrice: 15, position: '2B' },
          { playerId: 'p7', playerName: 'Player 7', team: 'G', auctionPrice: 25, position: '3B' },
          { playerId: 'p8', playerName: 'Player 8', team: 'H', auctionPrice: 35, position: 'RP' },
        ],
        currentAuctions: [],
        players: [],
        syncTimestamp: new Date().toISOString(),
        auctionInfo: {
          auctionId: mockRoomId,
          totalTeams: 12,
          rosterSize: 26,
          budget: 260,
        },
      };

      const mockInvoke = vi.fn().mockResolvedValue({
        data: eightPicksResponse,
        error: null,
      });
      (getSupabase as Mock).mockReturnValue({
        functions: { invoke: mockInvoke },
      });

      renderHook(() => useDraftSync(mockLeagueId));

      // Wait for sync to complete
      await waitFor(() => {
        const draft = useDraftStore.getState().drafts[mockLeagueId];
        expect(draft.draftedPlayers).toHaveLength(8);
      });

      // Verify all 8 picks were added
      const draft = useDraftStore.getState().drafts[mockLeagueId];
      expect(draft.draftedPlayers.map(p => p.playerId)).toEqual([
        'p1',
        'p2',
        'p3',
        'p4',
        'p5',
        'p6',
        'p7',
        'p8',
      ]);

      // Verify notification shows correct count
      expect(sonnerToast.success).toHaveBeenCalledWith('Synced 8 missed picks', expect.any(Object));
    });

    it('logs warning when sync exceeds 15 second timeout (NFR-I6)', async () => {
      vi.useFakeTimers();
      setupLeagueWithRoomId();

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create a delayed response that takes longer than 15 seconds
      const mockInvoke = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          // Simulate 20 second delay
          setTimeout(() => {
            resolve({
              data: mockSyncResponse,
              error: null,
            });
          }, 20000);
        });
      });
      (getSupabase as Mock).mockReturnValue({
        functions: { invoke: mockInvoke },
      });

      renderHook(() => useDraftSync(mockLeagueId));

      // Advance past the 15 second timeout threshold
      await act(async () => {
        vi.advanceTimersByTime(16000);
      });

      // Verify timeout warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('15 seconds'));

      consoleWarnSpy.mockRestore();
      vi.useRealTimers();
    });
  });
});
