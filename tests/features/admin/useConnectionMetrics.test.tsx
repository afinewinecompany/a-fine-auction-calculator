/**
 * useConnectionMetrics Hook Tests
 *
 * Tests for the connection metrics monitoring hook with polling.
 *
 * Story: 13.5 - View Connection Success Metrics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ConnectionMetrics, DailyConnectionDetails } from '@/features/admin/types/admin.types';

// Mock connection metrics data
const mockConnectionMetrics: ConnectionMetrics[] = [
  {
    apiName: 'Couch Managers',
    apiKey: 'couch_managers',
    successRate7d: 97.5,
    totalCalls: 200,
    successfulCalls: 195,
    failedCalls: 5,
    dailyRates: [
      { date: '2025-12-22', successRate: 96.0 },
      { date: '2025-12-23', successRate: 99.0 },
    ],
  },
  {
    apiName: 'Fangraphs',
    apiKey: 'fangraphs',
    successRate7d: 100,
    totalCalls: 150,
    successfulCalls: 150,
    failedCalls: 0,
    dailyRates: [
      { date: '2025-12-22', successRate: 100 },
      { date: '2025-12-23', successRate: 100 },
    ],
  },
  {
    apiName: 'Google Sheets',
    apiKey: 'google_sheets',
    successRate7d: 85.0,
    totalCalls: 100,
    successfulCalls: 85,
    failedCalls: 15,
    dailyRates: [
      { date: '2025-12-22', successRate: 80.0 },
      { date: '2025-12-23', successRate: 90.0 },
    ],
  },
];

const mockDailyDetails: DailyConnectionDetails[] = [
  {
    apiName: 'Couch Managers',
    successRate: 99.0,
    totalCalls: 30,
    successfulCalls: 29,
    failedCalls: 1,
    avgResponseTimeMs: 150.5,
  },
  {
    apiName: 'Fangraphs',
    successRate: 100,
    totalCalls: 20,
    successfulCalls: 20,
    failedCalls: 0,
    avgResponseTimeMs: 250.0,
  },
];

// Mock service functions
const mockGetConnectionMetrics = vi.fn();
const mockGetDailyConnectionDetails = vi.fn();

vi.mock('@/features/admin/services/connectionMetricsService', () => ({
  getConnectionMetrics: () => mockGetConnectionMetrics(),
  getDailyConnectionDetails: (date: string) => mockGetDailyConnectionDetails(date),
  countLowSuccessRateApis: (metrics: ConnectionMetrics[]) =>
    metrics.filter(m => m.successRate7d < 95).length,
}));

// Import after mocking
import { useConnectionMetrics } from '@/features/admin/hooks/useConnectionMetrics';

describe('useConnectionMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConnectionMetrics.mockResolvedValue(mockConnectionMetrics);
    mockGetDailyConnectionDetails.mockResolvedValue(mockDailyDetails);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useConnectionMetrics());

    expect(result.current.loading).toBe(true);
    expect(result.current.metrics).toEqual([]);
    expect(result.current.lowSuccessCount).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.selectedDate).toBeNull();
    expect(result.current.dailyDetails).toEqual([]);
    expect(result.current.loadingDetails).toBe(false);
  });

  it('should fetch connection metrics on mount', async () => {
    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual(mockConnectionMetrics);
    expect(mockGetConnectionMetrics).toHaveBeenCalledTimes(1);
  });

  it('should calculate lowSuccessCount correctly', async () => {
    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Only Google Sheets is below 95% threshold in mock data
    expect(result.current.lowSuccessCount).toBe(1);
  });

  it('should set error on fetch failure', async () => {
    mockGetConnectionMetrics.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.metrics).toEqual([]);
  });

  it('should allow manual refetch', async () => {
    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetConnectionMetrics).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetConnectionMetrics).toHaveBeenCalledTimes(2);
  });

  it('should clear error on successful refetch', async () => {
    // First call fails
    mockGetConnectionMetrics.mockRejectedValueOnce(new Error('Network error'));
    mockGetConnectionMetrics.mockResolvedValueOnce(mockConnectionMetrics);

    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Manual refetch with successful response
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.metrics).toEqual(mockConnectionMetrics);
  });

  it('should handle non-Error exceptions', async () => {
    mockGetConnectionMetrics.mockRejectedValue('String error');

    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch connection metrics');
  });

  it('should fetch daily details when a date is selected', async () => {
    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.selectDate('2025-12-23');
    });

    await waitFor(() => {
      expect(result.current.loadingDetails).toBe(false);
    });

    expect(result.current.selectedDate).toBe('2025-12-23');
    expect(result.current.dailyDetails).toEqual(mockDailyDetails);
    expect(mockGetDailyConnectionDetails).toHaveBeenCalledWith('2025-12-23');
  });

  it('should clear daily details when date is deselected', async () => {
    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Select a date
    await act(async () => {
      result.current.selectDate('2025-12-23');
    });

    await waitFor(() => {
      expect(result.current.dailyDetails.length).toBeGreaterThan(0);
    });

    // Deselect
    await act(async () => {
      result.current.selectDate(null);
    });

    expect(result.current.selectedDate).toBeNull();
    expect(result.current.dailyDetails).toEqual([]);
  });

  it('should handle daily details fetch failure gracefully', async () => {
    mockGetDailyConnectionDetails.mockRejectedValue(new Error('Details fetch failed'));

    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.selectDate('2025-12-23');
    });

    await waitFor(() => {
      expect(result.current.loadingDetails).toBe(false);
    });

    // Should not throw, just return empty details
    expect(result.current.dailyDetails).toEqual([]);
  });

  it('should return empty array for lowSuccessCount when no data', async () => {
    mockGetConnectionMetrics.mockResolvedValue([]);

    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lowSuccessCount).toBe(0);
    expect(result.current.metrics).toEqual([]);
  });

  it('should return correct hook result types', async () => {
    const { result } = renderHook(() => useConnectionMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
    expect(typeof result.current.selectDate).toBe('function');
    expect(Array.isArray(result.current.metrics)).toBe(true);
    expect(Array.isArray(result.current.dailyDetails)).toBe(true);
    expect(typeof result.current.lowSuccessCount).toBe('number');
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.loadingDetails).toBe('boolean');
  });
});