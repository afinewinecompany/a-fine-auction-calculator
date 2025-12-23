/**
 * useErrorRates Hook Tests
 *
 * Tests for the error rate monitoring hook with polling.
 *
 * Story: 13.4 - View Error Rates with Automated Alerts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ErrorRate } from '@/features/admin/types/admin.types';

// Mock error rate data
const mockErrorRates: ErrorRate[] = [
  {
    apiName: 'Couch Managers',
    apiKey: 'couch_managers',
    errorRate24h: 2.5,
    errorCount: 5,
    totalChecks: 200,
    trend: 'stable',
    isAboveThreshold: false,
  },
  {
    apiName: 'Fangraphs',
    apiKey: 'fangraphs',
    errorRate24h: 0,
    errorCount: 0,
    totalChecks: 200,
    trend: 'stable',
    isAboveThreshold: false,
  },
  {
    apiName: 'Google Sheets',
    apiKey: 'google_sheets',
    errorRate24h: 7.5,
    errorCount: 15,
    totalChecks: 200,
    trend: 'up',
    isAboveThreshold: true,
  },
];

// Mock service functions
const mockGetErrorRates = vi.fn();

vi.mock('@/features/admin/services/errorRateService', () => ({
  getErrorRates: () => mockGetErrorRates(),
  countAlertsAboveThreshold: (rates: ErrorRate[]) =>
    rates.filter(r => r.isAboveThreshold).length,
}));

// Import after mocking
import { useErrorRates } from '@/features/admin/hooks/useErrorRates';

describe('useErrorRates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetErrorRates.mockResolvedValue(mockErrorRates);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useErrorRates());

    expect(result.current.loading).toBe(true);
    expect(result.current.errorRates).toEqual([]);
    expect(result.current.alertCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should fetch error rates on mount', async () => {
    const { result } = renderHook(() => useErrorRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.errorRates).toEqual(mockErrorRates);
    expect(mockGetErrorRates).toHaveBeenCalledTimes(1);
  });

  it('should calculate alertCount correctly', async () => {
    const { result } = renderHook(() => useErrorRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Only Google Sheets is above threshold in mock data
    expect(result.current.alertCount).toBe(1);
  });

  it('should set error on fetch failure', async () => {
    mockGetErrorRates.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useErrorRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.errorRates).toEqual([]);
  });

  it('should allow manual refetch', async () => {
    const { result } = renderHook(() => useErrorRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetErrorRates).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetErrorRates).toHaveBeenCalledTimes(2);
  });

  it('should clear error on successful refetch', async () => {
    // First call fails
    mockGetErrorRates.mockRejectedValueOnce(new Error('Network error'));
    mockGetErrorRates.mockResolvedValueOnce(mockErrorRates);

    const { result } = renderHook(() => useErrorRates());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Manual refetch with successful response
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.errorRates).toEqual(mockErrorRates);
  });

  it('should handle non-Error exceptions', async () => {
    mockGetErrorRates.mockRejectedValue('String error');

    const { result } = renderHook(() => useErrorRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch error rates');
  });

  it('should return refetch function', async () => {
    const { result } = renderHook(() => useErrorRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should return empty array for alertCount when no data', async () => {
    mockGetErrorRates.mockResolvedValue([]);

    const { result } = renderHook(() => useErrorRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.alertCount).toBe(0);
    expect(result.current.errorRates).toEqual([]);
  });
});
