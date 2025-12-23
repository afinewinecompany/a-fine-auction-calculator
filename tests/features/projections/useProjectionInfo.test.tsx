/**
 * useProjectionInfo Hook Tests
 *
 * Tests for the hook that fetches projection source and timestamp.
 *
 * Story: 4.7 - Display Projection Source and Timestamp
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProjectionInfo } from '@/features/projections/hooks/useProjectionInfo';

// Mock response variables
let mockInfoResponse: { data: unknown; error: unknown } = { data: null, error: null };
let mockCountResponse: { count: number | null; error: unknown } = { count: 0, error: null };
let mockIsSupabaseConfigured = true;

// Create chainable mock for info query (returns single)
const createInfoQueryMock = () => ({
  eq: vi.fn(() => ({
    order: vi.fn(() => ({
      limit: vi.fn(() => ({
        single: vi.fn().mockResolvedValue(mockInfoResponse),
      })),
    })),
  })),
});

// Create chainable mock for count query (returns count)
const createCountQueryMock = () => ({
  eq: vi.fn().mockResolvedValue(mockCountResponse),
});

const mockFrom = vi.fn(() => ({
  select: vi.fn((_columns: string, options?: { count?: string; head?: boolean }) => {
    if (options?.head) {
      return createCountQueryMock();
    }
    return createInfoQueryMock();
  }),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    from: mockFrom,
  }),
  isSupabaseConfigured: () => mockIsSupabaseConfigured,
}));

describe('useProjectionInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInfoResponse = { data: null, error: null };
    mockCountResponse = { count: 0, error: null };
    mockIsSupabaseConfigured = true;
  });

  it('returns loading state initially', async () => {
    mockInfoResponse = { data: null, error: null };
    mockCountResponse = { count: 0, error: null };

    const { result } = renderHook(() => useProjectionInfo('league-123'));

    expect(result.current.loading).toBe(true);

    // Wait for the async effect to complete to avoid act() warnings
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('returns projection info on successful fetch', async () => {
    mockInfoResponse = {
      data: {
        projection_source: 'Fangraphs - Steamer',
        updated_at: '2025-12-17T10:00:00Z',
      },
      error: null,
    };
    mockCountResponse = { count: 500, error: null };

    const { result } = renderHook(() => useProjectionInfo('league-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.source).toBe('Fangraphs - Steamer');
    expect(result.current.updatedAt).toBe('2025-12-17T10:00:00Z');
    expect(result.current.playerCount).toBe(500);
    expect(result.current.error).toBeNull();
  });

  it('returns null values when no projections exist (PGRST116)', async () => {
    mockInfoResponse = {
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    };
    mockCountResponse = { count: 0, error: null };

    const { result } = renderHook(() => useProjectionInfo('league-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.source).toBeNull();
    expect(result.current.updatedAt).toBeNull();
    expect(result.current.playerCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('handles database errors gracefully and exposes error state', async () => {
    mockInfoResponse = {
      data: null,
      error: { code: 'OTHER_ERROR', message: 'Database error' },
    };

    const { result } = renderHook(() => useProjectionInfo('league-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return null values and expose error message
    expect(result.current.source).toBeNull();
    expect(result.current.error).toBe('Database error');
  });

  it('queries player_projections table', async () => {
    mockInfoResponse = {
      data: { projection_source: 'Test', updated_at: '2025-12-17T10:00:00Z' },
      error: null,
    };
    mockCountResponse = { count: 100, error: null };

    const { result } = renderHook(() => useProjectionInfo('my-league-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFrom).toHaveBeenCalledWith('player_projections');
  });

  it('returns empty info for empty leagueId', async () => {
    const { result } = renderHook(() => useProjectionInfo(''));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.source).toBeNull();
    expect(result.current.updatedAt).toBeNull();
    expect(result.current.playerCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('returns error when Supabase is not configured', async () => {
    mockIsSupabaseConfigured = false;

    const { result } = renderHook(() => useProjectionInfo('league-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.source).toBeNull();
    expect(result.current.error).toBe('Database not configured');
  });

  it('provides refetch function to manually refresh data', async () => {
    mockInfoResponse = {
      data: {
        projection_source: 'Fangraphs - Steamer',
        updated_at: '2025-12-17T10:00:00Z',
      },
      error: null,
    };
    mockCountResponse = { count: 500, error: null };

    const { result } = renderHook(() => useProjectionInfo('league-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');

    // Update mock response and call refetch
    mockInfoResponse = {
      data: {
        projection_source: 'Google Sheets',
        updated_at: '2025-12-17T12:00:00Z',
      },
      error: null,
    };
    mockCountResponse = { count: 600, error: null };

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.source).toBe('Google Sheets');
    });

    expect(result.current.playerCount).toBe(600);
  });
});
