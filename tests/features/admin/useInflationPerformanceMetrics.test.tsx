/**
 * useInflationPerformanceMetrics Hook Tests
 *
 * Tests for the inflation performance metrics monitoring hook with polling.
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { InflationPerformanceMetrics } from '@/features/admin/types/admin.types';

// Mock metrics data - excellent performance
const mockExcellentMetrics: InflationPerformanceMetrics = {
  medianLatency: 45,
  p95Latency: 120,
  p99Latency: 250,
  totalCalculations: 5000,
  calculationsPerMinute: 3.47,
  hourlyLatencies: [
    { hour: '2025-12-23T10:00:00Z', medianLatency: 42 },
    { hour: '2025-12-23T11:00:00Z', medianLatency: 48 },
  ],
};

// Mock metrics data - warning level (100-200ms median)
const mockWarningMetrics: InflationPerformanceMetrics = {
  medianLatency: 150,
  p95Latency: 350,
  p99Latency: 450,
  totalCalculations: 5000,
  calculationsPerMinute: 3.47,
  hourlyLatencies: [
    { hour: '2025-12-23T10:00:00Z', medianLatency: 145 },
    { hour: '2025-12-23T11:00:00Z', medianLatency: 155 },
  ],
};

// Mock metrics data - critical with p99 alert
const mockCriticalMetrics: InflationPerformanceMetrics = {
  medianLatency: 250,
  p95Latency: 600,
  p99Latency: 800,
  totalCalculations: 5000,
  calculationsPerMinute: 3.47,
  hourlyLatencies: [
    { hour: '2025-12-23T10:00:00Z', medianLatency: 240 },
    { hour: '2025-12-23T11:00:00Z', medianLatency: 260 },
  ],
};

// Mock service functions
const mockGetInflationPerformanceMetrics = vi.fn();

vi.mock('@/features/admin/services/inflationPerformanceService', () => ({
  getInflationPerformanceMetrics: () => mockGetInflationPerformanceMetrics(),
}));

// Import after mocking
import { useInflationPerformanceMetrics } from '@/features/admin/hooks/useInflationPerformanceMetrics';

describe('useInflationPerformanceMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInflationPerformanceMetrics.mockResolvedValue(mockExcellentMetrics);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useInflationPerformanceMetrics());

    expect(result.current.loading).toBe(true);
    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isP99Alert).toBe(false);
    expect(result.current.thresholdLevel).toBe('excellent');
  });

  it('should fetch performance metrics on mount', async () => {
    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual(mockExcellentMetrics);
    expect(mockGetInflationPerformanceMetrics).toHaveBeenCalledTimes(1);
  });

  it('should calculate thresholdLevel as "excellent" for median below 100ms', async () => {
    mockGetInflationPerformanceMetrics.mockResolvedValue(mockExcellentMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.thresholdLevel).toBe('excellent');
  });

  it('should calculate thresholdLevel as "warning" for median between 100-200ms', async () => {
    mockGetInflationPerformanceMetrics.mockResolvedValue(mockWarningMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.thresholdLevel).toBe('warning');
  });

  it('should calculate thresholdLevel as "critical" for median above 200ms', async () => {
    mockGetInflationPerformanceMetrics.mockResolvedValue(mockCriticalMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.thresholdLevel).toBe('critical');
  });

  it('should set isP99Alert to false when p99 is at or below 500ms', async () => {
    mockGetInflationPerformanceMetrics.mockResolvedValue(mockExcellentMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isP99Alert).toBe(false);
  });

  it('should set isP99Alert to true when p99 exceeds 500ms', async () => {
    mockGetInflationPerformanceMetrics.mockResolvedValue(mockCriticalMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isP99Alert).toBe(true);
  });

  it('should set error on fetch failure', async () => {
    mockGetInflationPerformanceMetrics.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.metrics).toBeNull();
  });

  it('should allow manual refetch', async () => {
    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetInflationPerformanceMetrics).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetInflationPerformanceMetrics).toHaveBeenCalledTimes(2);
  });

  it('should clear error on successful refetch', async () => {
    // First call fails
    mockGetInflationPerformanceMetrics.mockRejectedValueOnce(new Error('Network error'));
    mockGetInflationPerformanceMetrics.mockResolvedValueOnce(mockExcellentMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Manual refetch with successful response
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.metrics).toEqual(mockExcellentMetrics);
  });

  it('should handle non-Error exceptions', async () => {
    mockGetInflationPerformanceMetrics.mockRejectedValue('String error');

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch performance metrics');
  });

  it('should return isP99Alert as false when metrics is null', async () => {
    mockGetInflationPerformanceMetrics.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.isP99Alert).toBe(false);
  });

  it('should return thresholdLevel as "excellent" when metrics is null', async () => {
    mockGetInflationPerformanceMetrics.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.thresholdLevel).toBe('excellent');
  });

  it('should keep existing metrics on error during refetch', async () => {
    // First call succeeds
    mockGetInflationPerformanceMetrics.mockResolvedValueOnce(mockExcellentMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.metrics).toEqual(mockExcellentMetrics);
    });

    // Second call fails
    mockGetInflationPerformanceMetrics.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await result.current.refetch();
    });

    // Should still have the original metrics
    expect(result.current.metrics).toEqual(mockExcellentMetrics);
    expect(result.current.error).toBe('Network error');
  });

  it('should return correct hook result types', async () => {
    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.isP99Alert).toBe('boolean');
    expect(typeof result.current.thresholdLevel).toBe('string');
    expect(result.current.metrics).not.toBeNull();
  });

  it('should handle boundary case: p99 exactly at 500ms', async () => {
    const boundaryMetrics: InflationPerformanceMetrics = {
      ...mockExcellentMetrics,
      p99Latency: 500,
    };
    mockGetInflationPerformanceMetrics.mockResolvedValue(boundaryMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 500ms is not above threshold
    expect(result.current.isP99Alert).toBe(false);
  });

  it('should handle boundary case: median exactly at 100ms', async () => {
    const boundaryMetrics: InflationPerformanceMetrics = {
      ...mockExcellentMetrics,
      medianLatency: 100,
    };
    mockGetInflationPerformanceMetrics.mockResolvedValue(boundaryMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 100ms transitions to warning
    expect(result.current.thresholdLevel).toBe('warning');
  });

  it('should handle boundary case: median exactly at 200ms', async () => {
    const boundaryMetrics: InflationPerformanceMetrics = {
      ...mockExcellentMetrics,
      medianLatency: 200,
    };
    mockGetInflationPerformanceMetrics.mockResolvedValue(boundaryMetrics);

    const { result } = renderHook(() => useInflationPerformanceMetrics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 200ms transitions to critical
    expect(result.current.thresholdLevel).toBe('critical');
  });
});
