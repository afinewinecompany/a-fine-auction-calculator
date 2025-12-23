/**
 * useLoadFangraphsProjections Hook Tests
 *
 * Story: 4.5 - Select and Load Fangraphs Projections
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLoadFangraphsProjections } from '@/features/projections/hooks/useLoadFangraphsProjections';

// Mock Supabase client
const mockInvoke = vi.fn();
const mockUpsert = vi.fn();
const mockFrom = vi.fn(() => ({
  upsert: mockUpsert,
}));

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    functions: {
      invoke: mockInvoke,
    },
    from: mockFrom,
  }),
}));

describe('useLoadFangraphsProjections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLoadFangraphsProjections());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should set loading state when loadProjections is called', async () => {
    mockInvoke.mockResolvedValue({
      data: { players: [] },
      error: null,
    });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    act(() => {
      result.current.loadProjections('league-123', 'steamer');
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should update progress through fetch stages', async () => {
    const hitters = [
      { playerName: 'Mike Trout', team: 'LAA', positions: ['OF'] },
    ];
    const pitchers = [
      { playerName: 'Shohei Ohtani', team: 'LAD', positions: ['SP'] },
    ];

    mockInvoke
      .mockResolvedValueOnce({ data: { players: hitters }, error: null })
      .mockResolvedValueOnce({ data: { players: pitchers }, error: null });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    await act(async () => {
      await result.current.loadProjections('league-123', 'steamer');
    });

    expect(result.current.progress).toBe(100);
    expect(result.current.isLoading).toBe(false);
  });

  it('should call edge function with correct parameters', async () => {
    mockInvoke.mockResolvedValue({
      data: { players: [] },
      error: null,
    });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    await act(async () => {
      await result.current.loadProjections('league-123', 'steamer');
    });

    expect(mockInvoke).toHaveBeenCalledWith('fetch-fangraphs-projections', {
      body: { system: 'steamer', playerType: 'hitters' },
    });
    expect(mockInvoke).toHaveBeenCalledWith('fetch-fangraphs-projections', {
      body: { system: 'steamer', playerType: 'pitchers' },
    });
  });

  it('should upsert projections to database', async () => {
    const hitters = [
      {
        playerName: 'Mike Trout',
        team: 'LAA',
        positions: ['OF'],
        projectedValue: null,
        statsHitters: { hr: 30 },
        statsPitchers: null,
      },
    ];
    const pitchers = [
      {
        playerName: 'Gerrit Cole',
        team: 'NYY',
        positions: ['SP'],
        projectedValue: null,
        statsHitters: null,
        statsPitchers: { w: 15 },
      },
    ];

    mockInvoke
      .mockResolvedValueOnce({ data: { players: hitters }, error: null })
      .mockResolvedValueOnce({ data: { players: pitchers }, error: null });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    await act(async () => {
      await result.current.loadProjections('league-123', 'steamer');
    });

    expect(mockFrom).toHaveBeenCalledWith('player_projections');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          league_id: 'league-123',
          player_name: 'Mike Trout',
          projection_source: 'Fangraphs - Steamer',
        }),
        expect.objectContaining({
          league_id: 'league-123',
          player_name: 'Gerrit Cole',
          projection_source: 'Fangraphs - Steamer',
        }),
      ]),
      { onConflict: 'league_id,player_name' }
    );
  });

  it('should return success result with count and system', async () => {
    const hitters = [
      { playerName: 'Player 1', team: 'NYY', positions: ['1B'] },
      { playerName: 'Player 2', team: 'BOS', positions: ['OF'] },
    ];
    const pitchers = [
      { playerName: 'Player 3', team: 'LAD', positions: ['SP'] },
    ];

    mockInvoke
      .mockResolvedValueOnce({ data: { players: hitters }, error: null })
      .mockResolvedValueOnce({ data: { players: pitchers }, error: null });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    await act(async () => {
      await result.current.loadProjections('league-123', 'batx');
    });

    expect(result.current.result).toEqual({
      system: 'Batx',
      count: 3,
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle edge function error', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Network error' },
    });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    await act(async () => {
      await result.current.loadProjections('league-123', 'steamer');
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle database insert error', async () => {
    mockInvoke.mockResolvedValue({
      data: { players: [{ playerName: 'Test', team: 'NYY', positions: [] }] },
      error: null,
    });
    mockUpsert.mockResolvedValue({ error: { message: 'Database error' } });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    await act(async () => {
      await result.current.loadProjections('league-123', 'steamer');
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear previous state on new load', async () => {
    // First load with error
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'First error' },
    });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    await act(async () => {
      await result.current.loadProjections('league-123', 'steamer');
    });

    expect(result.current.error).toBe('First error');

    // Second load - should clear error
    mockInvoke.mockResolvedValue({
      data: { players: [] },
      error: null,
    });

    await act(async () => {
      await result.current.loadProjections('league-123', 'steamer');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.result).toEqual({ system: 'Steamer', count: 0 });
  });

  it('should capitalize system name in result', async () => {
    mockInvoke.mockResolvedValue({
      data: { players: [] },
      error: null,
    });

    const { result } = renderHook(() => useLoadFangraphsProjections());

    await act(async () => {
      await result.current.loadProjections('league-123', 'ja');
    });

    expect(result.current.result?.system).toBe('Ja');
  });
});
