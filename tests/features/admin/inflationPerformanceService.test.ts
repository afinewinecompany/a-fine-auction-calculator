/**
 * Inflation Performance Service Tests
 *
 * Tests for the inflation performance metrics service functions.
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
let mockSupabaseConfigured = true;
let mockRpcResponse: { data: unknown; error: Error | null } = {
  data: null,
  error: null,
};

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => mockSupabaseConfigured,
  getSupabase: () => ({
    rpc: vi.fn().mockImplementation(() => Promise.resolve(mockRpcResponse)),
  }),
}));

// Import after mocking
import { getInflationPerformanceMetrics } from '@/features/admin/services/inflationPerformanceService';

describe('inflationPerformanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseConfigured = true;
    mockRpcResponse = { data: null, error: null };
  });

  describe('getInflationPerformanceMetrics', () => {
    it('should fetch and transform metrics correctly', async () => {
      const mockData = [
        {
          median_latency: 45,
          p95_latency: 120,
          p99_latency: 250,
          total_calculations: 5000,
          calculations_per_minute: 3.47,
          hourly_latencies: [
            { hour: '2025-12-23T10:00:00Z', medianLatency: 42 },
            { hour: '2025-12-23T11:00:00Z', medianLatency: 48 },
          ],
        },
      ];
      mockRpcResponse = { data: mockData, error: null };

      const result = await getInflationPerformanceMetrics();

      expect(result).toEqual({
        medianLatency: 45,
        p95Latency: 120,
        p99Latency: 250,
        totalCalculations: 5000,
        calculationsPerMinute: 3.47,
        hourlyLatencies: [
          { hour: '2025-12-23T10:00:00Z', medianLatency: 42 },
          { hour: '2025-12-23T11:00:00Z', medianLatency: 48 },
        ],
      });
    });

    it('should return empty metrics when no data', async () => {
      mockRpcResponse = { data: [], error: null };

      const result = await getInflationPerformanceMetrics();

      expect(result).toEqual({
        medianLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        totalCalculations: 0,
        calculationsPerMinute: 0,
        hourlyLatencies: [],
      });
    });

    it('should return empty metrics when data is null', async () => {
      mockRpcResponse = { data: null, error: null };

      const result = await getInflationPerformanceMetrics();

      expect(result).toEqual({
        medianLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        totalCalculations: 0,
        calculationsPerMinute: 0,
        hourlyLatencies: [],
      });
    });

    it('should handle null hourly_latencies', async () => {
      const mockData = [
        {
          median_latency: 45,
          p95_latency: 120,
          p99_latency: 250,
          total_calculations: 100,
          calculations_per_minute: 0.07,
          hourly_latencies: null,
        },
      ];
      mockRpcResponse = { data: mockData, error: null };

      const result = await getInflationPerformanceMetrics();

      expect(result.hourlyLatencies).toEqual([]);
    });

    it('should throw error when database not configured', async () => {
      mockSupabaseConfigured = false;

      await expect(getInflationPerformanceMetrics()).rejects.toThrow('Database not configured');
    });

    it('should throw error on database failure', async () => {
      mockRpcResponse = {
        data: null,
        error: new Error('Connection failed'),
      };

      await expect(getInflationPerformanceMetrics()).rejects.toThrow(
        'Failed to fetch inflation performance metrics: Connection failed'
      );
    });

    it('should convert numeric strings to numbers', async () => {
      const mockData = [
        {
          median_latency: '45.5',
          p95_latency: '120.75',
          p99_latency: '250.25',
          total_calculations: '5000',
          calculations_per_minute: '3.47',
          hourly_latencies: [{ hour: '2025-12-23T10:00:00Z', medianLatency: '42.5' }],
        },
      ];
      mockRpcResponse = { data: mockData, error: null };

      const result = await getInflationPerformanceMetrics();

      expect(result.medianLatency).toBe(45.5);
      expect(result.p95Latency).toBe(120.75);
      expect(result.p99Latency).toBe(250.25);
      expect(result.totalCalculations).toBe(5000);
      expect(result.calculationsPerMinute).toBe(3.47);
      expect(result.hourlyLatencies[0].medianLatency).toBe(42.5);
    });

    it('should handle zero values correctly', async () => {
      const mockData = [
        {
          median_latency: 0,
          p95_latency: 0,
          p99_latency: 0,
          total_calculations: 0,
          calculations_per_minute: 0,
          hourly_latencies: [],
        },
      ];
      mockRpcResponse = { data: mockData, error: null };

      const result = await getInflationPerformanceMetrics();

      expect(result.medianLatency).toBe(0);
      expect(result.p95Latency).toBe(0);
      expect(result.p99Latency).toBe(0);
      expect(result.totalCalculations).toBe(0);
      expect(result.calculationsPerMinute).toBe(0);
    });

    it('should handle high latency values', async () => {
      const mockData = [
        {
          median_latency: 500,
          p95_latency: 1000,
          p99_latency: 2000,
          total_calculations: 10,
          calculations_per_minute: 0.01,
          hourly_latencies: [{ hour: '2025-12-23T10:00:00Z', medianLatency: 550 }],
        },
      ];
      mockRpcResponse = { data: mockData, error: null };

      const result = await getInflationPerformanceMetrics();

      expect(result.medianLatency).toBe(500);
      expect(result.p95Latency).toBe(1000);
      expect(result.p99Latency).toBe(2000);
    });
  });
});
