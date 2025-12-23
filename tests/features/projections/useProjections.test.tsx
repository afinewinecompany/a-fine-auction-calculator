/**
 * useProjections Hook Tests
 *
 * Tests for the hook that fetches all projections for a league.
 *
 * Story: 4.8 - Export Projections for Offline Analysis
 */

// Tests use vitest globals (describe, it, expect, vi, beforeEach)
import { renderHook, waitFor } from '@testing-library/react';
import { useProjections } from '@/features/projections/hooks/useProjections';

// Mock response variables
let mockResponse: { data: unknown[] | null; error: unknown } = { data: [], error: null };
let mockIsSupabaseConfigured = true;

// Create chainable mock
const createQueryMock = () => ({
  eq: vi.fn(() => ({
    order: vi.fn().mockResolvedValue(mockResponse),
  })),
});

const mockFrom = vi.fn(() => ({
  select: vi.fn(() => createQueryMock()),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    from: mockFrom,
  }),
  isSupabaseConfigured: () => mockIsSupabaseConfigured,
}));

describe('useProjections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResponse = { data: [], error: null };
    mockIsSupabaseConfigured = true;
  });

  it('returns loading state initially', async () => {
    mockResponse = { data: [], error: null };

    const { result } = renderHook(() => useProjections('league-123'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns projections on successful fetch', async () => {
    mockResponse = {
      data: [
        {
          id: '1',
          league_id: 'league-123',
          player_name: 'Mike Trout',
          team: 'LAA',
          positions: ['CF'],
          projected_value: 45,
          projection_source: 'fangraphs',
          stats_hitters: { hr: 35, rbi: 90 },
          stats_pitchers: null,
          tier: 'Elite',
          created_at: '2025-12-12T00:00:00Z',
          updated_at: '2025-12-12T02:30:00Z',
        },
      ],
      error: null,
    };

    const { result } = renderHook(() => useProjections('league-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.projections).toHaveLength(1);
    expect(result.current.projections[0].playerName).toBe('Mike Trout');
    expect(result.current.projections[0].leagueId).toBe('league-123');
    expect(result.current.error).toBeNull();
  });

  it('transforms snake_case to camelCase', async () => {
    mockResponse = {
      data: [
        {
          id: '1',
          league_id: 'league-123',
          player_name: 'Test Player',
          team: 'NYY',
          positions: ['1B'],
          projected_value: 30,
          projection_source: 'manual',
          stats_hitters: null,
          stats_pitchers: null,
          tier: 'Tier 2',
          created_at: '2025-12-12T00:00:00Z',
          updated_at: '2025-12-12T00:00:00Z',
        },
      ],
      error: null,
    };

    const { result } = renderHook(() => useProjections('league-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check camelCase transformation
    expect(result.current.projections[0]).toHaveProperty('leagueId');
    expect(result.current.projections[0]).toHaveProperty('playerName');
    expect(result.current.projections[0]).toHaveProperty('projectedValue');
    expect(result.current.projections[0]).toHaveProperty('projectionSource');
    expect(result.current.projections[0]).toHaveProperty('statsHitters');
    expect(result.current.projections[0]).toHaveProperty('statsPitchers');
    expect(result.current.projections[0]).toHaveProperty('createdAt');
    expect(result.current.projections[0]).toHaveProperty('updatedAt');
  });

  it('handles errors gracefully', async () => {
    mockResponse = {
      data: null,
      error: { message: 'Database error' },
    };

    const { result } = renderHook(() => useProjections('league-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.projections).toHaveLength(0);
    expect(result.current.error).toBe('Database error');
  });

  it('returns empty array for empty leagueId', async () => {
    const { result } = renderHook(() => useProjections(''));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.projections).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('returns error when Supabase is not configured', async () => {
    mockIsSupabaseConfigured = false;

    const { result } = renderHook(() => useProjections('league-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.projections).toHaveLength(0);
    expect(result.current.error).toBe('Database not configured');
  });

  it('queries player_projections table with correct parameters', async () => {
    mockResponse = { data: [], error: null };

    const { result } = renderHook(() => useProjections('my-league-id'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFrom).toHaveBeenCalledWith('player_projections');
  });

  it('provides refetch function', async () => {
    mockResponse = { data: [], error: null };

    const { result } = renderHook(() => useProjections('league-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });
});
