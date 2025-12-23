/**
 * useDraftCompletionMetrics Hook Tests
 *
 * Tests for the draft completion metrics monitoring hook with polling.
 *
 * Story: 13.8 - Track Draft Completion Rates
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { DraftCompletionMetrics } from '@/features/admin/types/admin.types';

// Mock metrics data
const mockMetrics: DraftCompletionMetrics = {
  totalDrafts: 100,
  completedDrafts: 85,
  abandonedDrafts: 10,
  errorDrafts: 5,
  completionRate: 85.0,
  dailyRates: [
    { date: '2025-12-22', completionRate: 80.0 },
    { date: '2025-12-23', completionRate: 90.0 },
  ],
};

const mockLowMetrics: DraftCompletionMetrics = {
  totalDrafts: 100,
  completedDrafts: 70,
  abandonedDrafts: 20,
  errorDrafts: 10,
  completionRate: 70.0,
  dailyRates: [
    { date: '2025-12-22', completionRate: 65.0 },
    { date: '2025-12-23', completionRate: 75.0 },
  ],
};

// Mock service functions
const mockGetDraftCompletionMetrics = vi.fn();

vi.mock('@/features/admin/services/draftCompletionService', () => ({
  getDraftCompletionMetrics: () => mockGetDraftCompletionMetrics(),
  isBelowTarget: (rate: number) => rate < 80,
}));

// Import after mocking
import { useDraftCompletionMetrics } from '@/features/admin/hooks/useDraftCompletionMetrics';

describe('useDraftCompletionMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDraftCompletionMetrics.mockResolvedValue(mockMetrics);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useDraftCompletionMetrics());

    expect(result.current.loading).toBe(true);
    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isBelowTarget).toBe(false);
  });

  it('should fetch completion metrics on mount', async () => {
    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual(mockMetrics);
    expect(mockGetDraftCompletionMetrics).toHaveBeenCalledTimes(1);
  });

  it('should calculate isBelowTarget correctly for healthy rate', async () => {
    mockGetDraftCompletionMetrics.mockResolvedValue(mockMetrics);

    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 85% is above 80% target
    expect(result.current.isBelowTarget).toBe(false);
  });

  it('should calculate isBelowTarget correctly for low rate', async () => {
    mockGetDraftCompletionMetrics.mockResolvedValue(mockLowMetrics);

    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 70% is below 80% target
    expect(result.current.isBelowTarget).toBe(true);
  });

  it('should set error on fetch failure', async () => {
    mockGetDraftCompletionMetrics.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.metrics).toBeNull();
  });

  it('should allow manual refetch', async () => {
    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetDraftCompletionMetrics).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetDraftCompletionMetrics).toHaveBeenCalledTimes(2);
  });

  it('should clear error on successful refetch', async () => {
    // First call fails
    mockGetDraftCompletionMetrics.mockRejectedValueOnce(new Error('Network error'));
    mockGetDraftCompletionMetrics.mockResolvedValueOnce(mockMetrics);

    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Manual refetch with successful response
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.metrics).toEqual(mockMetrics);
  });

  it('should handle non-Error exceptions', async () => {
    mockGetDraftCompletionMetrics.mockRejectedValue('String error');

    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch completion metrics');
  });

  it('should return isBelowTarget as false when metrics is null', async () => {
    mockGetDraftCompletionMetrics.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.isBelowTarget).toBe(false);
  });

  it('should keep existing metrics on error during refetch', async () => {
    // First call succeeds
    mockGetDraftCompletionMetrics.mockResolvedValueOnce(mockMetrics);

    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.metrics).toEqual(mockMetrics);
    });

    // Second call fails
    mockGetDraftCompletionMetrics.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await result.current.refetch();
    });

    // Should still have the original metrics
    expect(result.current.metrics).toEqual(mockMetrics);
    expect(result.current.error).toBe('Network error');
  });

  it('should return correct hook result types', async () => {
    const { result } = renderHook(() => useDraftCompletionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.isBelowTarget).toBe('boolean');
    expect(result.current.metrics).not.toBeNull();
  });
});
