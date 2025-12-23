/**
 * useActiveDrafts Hook Tests
 *
 * Tests for the active drafts fetching hook with 30-second polling.
 *
 * Story: 13.2 - Display Active Drafts List
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ActiveDraft } from '@/features/admin/types/admin.types';

// Mock Supabase responses
let mockSupabaseConfigured = true;
let mockSupabaseResponse: { data: ActiveDraft[] | null; error: Error | null } = {
  data: [],
  error: null,
};

// Create mock query builder
const createMockQueryBuilder = () => ({
  select: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockImplementation(() => Promise.resolve(mockSupabaseResponse)),
});

const mockQueryBuilder = createMockQueryBuilder();

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => mockSupabaseConfigured,
  getSupabase: () => ({
    from: vi.fn().mockReturnValue(mockQueryBuilder),
  }),
}));

// Import after mocking
import { useActiveDrafts } from '@/features/admin/hooks/useActiveDrafts';

// Helper to create mock draft
const createMockDraft = (overrides: Partial<ActiveDraft> = {}): ActiveDraft => ({
  id: 'draft-123',
  status: 'active',
  started_at: '2025-12-22T10:00:00Z',
  last_activity: '2025-12-22T10:15:00Z',
  error_message: null,
  league: {
    name: 'Test League',
    team_count: 12,
    budget: 260,
  },
  user: {
    email: 'test@example.com',
    full_name: 'Test User',
  },
  ...overrides,
});

describe('useActiveDrafts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseConfigured = true;
    mockSupabaseResponse = { data: [], error: null };

    // Reset mock query builder
    mockQueryBuilder.select.mockReturnThis();
    mockQueryBuilder.in.mockReturnThis();
    mockQueryBuilder.order.mockImplementation(() => Promise.resolve(mockSupabaseResponse));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('Initial Fetch', () => {
    it('should fetch active drafts on mount', async () => {
      const mockDrafts = [createMockDraft()];
      mockSupabaseResponse = { data: mockDrafts, error: null };

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drafts).toEqual(mockDrafts);
      expect(result.current.error).toBeNull();
    });

    it('should start with loading=true', () => {
      const { result } = renderHook(() => useActiveDrafts());

      expect(result.current.loading).toBe(true);
    });

    it('should query with correct status filter', async () => {
      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockQueryBuilder.in).toHaveBeenCalledWith('status', ['active', 'paused', 'error']);
    });

    it('should order by last_activity descending', async () => {
      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockQueryBuilder.order).toHaveBeenCalledWith('last_activity', { ascending: false });
    });
  });

  describe('Polling Setup', () => {
    it('should set up interval for polling', async () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify setInterval was called with 30000ms
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);

      setIntervalSpy.mockRestore();
    });

    it('should clear interval on unmount', async () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

      const { result, unmount } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      mockSupabaseResponse = {
        data: null,
        error: new Error('Database connection failed'),
      };

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drafts).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch active drafts');
    });

    it('should handle Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drafts).toEqual([]);
      expect(result.current.error).toBe('Database not configured');
    });

    it('should handle query exceptions', async () => {
      mockQueryBuilder.order.mockImplementation(() => Promise.reject(new Error('Network error')));

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drafts).toEqual([]);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Refetch', () => {
    it('should provide refetch function', async () => {
      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch data when refetch is called', async () => {
      mockSupabaseResponse = { data: [], error: null };

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockQueryBuilder.order).toHaveBeenCalledTimes(1);

      // Update mock data
      const newDrafts = [createMockDraft({ id: 'new-draft' })];
      mockSupabaseResponse = { data: newDrafts, error: null };

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockQueryBuilder.order).toHaveBeenCalledTimes(2);
      expect(result.current.drafts).toEqual(newDrafts);
    });
  });

  describe('Multiple Drafts', () => {
    it('should handle multiple drafts with different statuses', async () => {
      const mockDrafts: ActiveDraft[] = [
        createMockDraft({ id: 'draft-1', status: 'active' }),
        createMockDraft({ id: 'draft-2', status: 'paused' }),
        createMockDraft({ id: 'draft-3', status: 'error', error_message: 'Connection failed' }),
      ];
      mockSupabaseResponse = { data: mockDrafts, error: null };

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drafts).toHaveLength(3);
      expect(result.current.drafts[0].status).toBe('active');
      expect(result.current.drafts[1].status).toBe('paused');
      expect(result.current.drafts[2].status).toBe('error');
      expect(result.current.drafts[2].error_message).toBe('Connection failed');
    });
  });

  describe('Empty State', () => {
    it('should handle empty drafts list', async () => {
      mockSupabaseResponse = { data: [], error: null };

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drafts).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Data Resilience', () => {
    it('should keep existing data when new fetch fails', async () => {
      // First successful fetch
      const mockDrafts = [createMockDraft()];
      mockSupabaseResponse = { data: mockDrafts, error: null };

      const { result } = renderHook(() => useActiveDrafts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drafts).toEqual(mockDrafts);

      // Simulate failure on refetch
      mockSupabaseResponse = { data: null, error: new Error('Network error') };

      await act(async () => {
        await result.current.refetch();
      });

      // Should still have existing drafts
      expect(result.current.drafts).toEqual(mockDrafts);
      expect(result.current.error).toBe('Failed to fetch active drafts');
    });
  });
});
