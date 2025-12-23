/**
 * Connection Metrics Service Tests
 *
 * Tests for the connection metrics service that provides
 * 7-day success rates and daily trend data.
 *
 * Story: 13.5 - View Connection Success Metrics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock response types
interface MockRpcResult {
  data: unknown;
  error: Error | null;
}

// Mock Supabase responses
let mockSupabaseConfigured = true;
let mockMetrics7dResponse: MockRpcResult = { data: [], error: null };
let mockDailyRatesResponse: MockRpcResult = { data: [], error: null };
let mockDailyDetailsResponse: MockRpcResult = { data: [], error: null };

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => mockSupabaseConfigured,
  getSupabase: () => ({
    rpc: vi.fn((funcName: string, _params?: Record<string, unknown>) => {
      if (funcName === 'get_connection_metrics_7d') {
        return Promise.resolve(mockMetrics7dResponse);
      }
      if (funcName === 'get_daily_success_rates') {
        return Promise.resolve(mockDailyRatesResponse);
      }
      if (funcName === 'get_daily_connection_details') {
        return Promise.resolve(mockDailyDetailsResponse);
      }
      return Promise.resolve({ data: null, error: null });
    }),
  }),
}));

// Import after mocking
import {
  getConnectionMetrics,
  getDailyConnectionDetails,
  countLowSuccessRateApis,
  getSuccessRateColor,
  SUCCESS_THRESHOLDS,
} from '@/features/admin/services/connectionMetricsService';
import type { ConnectionMetrics } from '@/features/admin/types/admin.types';

describe('connectionMetricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseConfigured = true;
    mockMetrics7dResponse = { data: [], error: null };
    mockDailyRatesResponse = { data: [], error: null };
    mockDailyDetailsResponse = { data: [], error: null };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('SUCCESS_THRESHOLDS', () => {
    it('should have GREEN threshold at 95%', () => {
      expect(SUCCESS_THRESHOLDS.GREEN).toBe(95);
    });

    it('should have YELLOW threshold at 90%', () => {
      expect(SUCCESS_THRESHOLDS.YELLOW).toBe(90);
    });
  });

  describe('getSuccessRateColor', () => {
    it('should return green for rates >= 95%', () => {
      expect(getSuccessRateColor(95)).toBe('green');
      expect(getSuccessRateColor(99)).toBe('green');
      expect(getSuccessRateColor(100)).toBe('green');
    });

    it('should return yellow for rates >= 90% and < 95%', () => {
      expect(getSuccessRateColor(90)).toBe('yellow');
      expect(getSuccessRateColor(92)).toBe('yellow');
      expect(getSuccessRateColor(94.9)).toBe('yellow');
    });

    it('should return red for rates < 90%', () => {
      expect(getSuccessRateColor(89)).toBe('red');
      expect(getSuccessRateColor(50)).toBe('red');
      expect(getSuccessRateColor(0)).toBe('red');
    });
  });

  describe('getConnectionMetrics', () => {
    it('should return empty array when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const result = await getConnectionMetrics();

      expect(result).toEqual([]);
    });

    it('should return connection metrics for all APIs', async () => {
      mockMetrics7dResponse = {
        data: [
          {
            api_name: 'couch_managers',
            success_rate: 97.5,
            total_calls: 200,
            successful_calls: 195,
            failed_calls: 5,
          },
          {
            api_name: 'fangraphs',
            success_rate: 100,
            total_calls: 150,
            successful_calls: 150,
            failed_calls: 0,
          },
          {
            api_name: 'google_sheets',
            success_rate: 85.0,
            total_calls: 100,
            successful_calls: 85,
            failed_calls: 15,
          },
        ],
        error: null,
      };

      const result = await getConnectionMetrics();

      expect(result).toHaveLength(3);
      expect(result.map(r => r.apiKey)).toEqual([
        'couch_managers',
        'fangraphs',
        'google_sheets',
      ]);
    });

    it('should map API names to display names correctly', async () => {
      mockMetrics7dResponse = {
        data: [
          {
            api_name: 'couch_managers',
            success_rate: 97.5,
            total_calls: 200,
            successful_calls: 195,
            failed_calls: 5,
          },
          {
            api_name: 'fangraphs',
            success_rate: 100,
            total_calls: 150,
            successful_calls: 150,
            failed_calls: 0,
          },
          {
            api_name: 'google_sheets',
            success_rate: 85.0,
            total_calls: 100,
            successful_calls: 85,
            failed_calls: 15,
          },
        ],
        error: null,
      };

      const result = await getConnectionMetrics();

      expect(result.map(r => r.apiName)).toEqual([
        'Couch Managers',
        'Fangraphs',
        'Google Sheets',
      ]);
    });

    it('should include daily rates for trend chart', async () => {
      mockMetrics7dResponse = {
        data: [
          {
            api_name: 'couch_managers',
            success_rate: 97.5,
            total_calls: 200,
            successful_calls: 195,
            failed_calls: 5,
          },
        ],
        error: null,
      };
      mockDailyRatesResponse = {
        data: [
          { api_name: 'couch_managers', date: '2025-12-22', success_rate: 96.0, total_calls: 30, successful_calls: 29 },
          { api_name: 'couch_managers', date: '2025-12-23', success_rate: 98.0, total_calls: 30, successful_calls: 29 },
        ],
        error: null,
      };

      const result = await getConnectionMetrics();

      expect(result[0].dailyRates).toHaveLength(2);
      expect(result[0].dailyRates[0].date).toBe('2025-12-22');
      expect(result[0].dailyRates[0].successRate).toBe(96.0);
      expect(result[0].dailyRates[1].date).toBe('2025-12-23');
      expect(result[0].dailyRates[1].successRate).toBe(98.0);
    });

    it('should sort daily rates by date ascending', async () => {
      mockMetrics7dResponse = {
        data: [
          {
            api_name: 'fangraphs',
            success_rate: 99.0,
            total_calls: 100,
            successful_calls: 99,
            failed_calls: 1,
          },
        ],
        error: null,
      };
      mockDailyRatesResponse = {
        data: [
          { api_name: 'fangraphs', date: '2025-12-23', success_rate: 99.0, total_calls: 30, successful_calls: 30 },
          { api_name: 'fangraphs', date: '2025-12-21', success_rate: 97.0, total_calls: 30, successful_calls: 29 },
          { api_name: 'fangraphs', date: '2025-12-22', success_rate: 98.0, total_calls: 30, successful_calls: 29 },
        ],
        error: null,
      };

      const result = await getConnectionMetrics();

      expect(result[0].dailyRates.map(r => r.date)).toEqual([
        '2025-12-21',
        '2025-12-22',
        '2025-12-23',
      ]);
    });

    it('should handle null success rate as 0', async () => {
      mockMetrics7dResponse = {
        data: [
          {
            api_name: 'couch_managers',
            success_rate: null,
            total_calls: 0,
            successful_calls: 0,
            failed_calls: 0,
          },
        ],
        error: null,
      };

      const result = await getConnectionMetrics();

      expect(result[0].successRate7d).toBe(0);
    });

    it('should throw error on 7d metrics RPC failure', async () => {
      mockMetrics7dResponse = { data: null, error: new Error('RPC failed') };

      await expect(getConnectionMetrics()).rejects.toThrow('Failed to fetch connection metrics');
    });

    it('should continue with empty daily rates on daily rates RPC failure', async () => {
      mockMetrics7dResponse = {
        data: [
          {
            api_name: 'couch_managers',
            success_rate: 97.5,
            total_calls: 200,
            successful_calls: 195,
            failed_calls: 5,
          },
        ],
        error: null,
      };
      mockDailyRatesResponse = { data: null, error: new Error('RPC failed') };

      const result = await getConnectionMetrics();

      expect(result).toHaveLength(1);
      expect(result[0].dailyRates).toEqual([]);
    });
  });

  describe('getDailyConnectionDetails', () => {
    it('should return empty array when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const result = await getDailyConnectionDetails('2025-12-23');

      expect(result).toEqual([]);
    });

    it('should return daily details for a specific date', async () => {
      mockDailyDetailsResponse = {
        data: [
          {
            api_name: 'couch_managers',
            success_rate: 97.5,
            total_calls: 30,
            successful_calls: 29,
            failed_calls: 1,
            avg_response_time_ms: 150.5,
          },
          {
            api_name: 'fangraphs',
            success_rate: 100,
            total_calls: 20,
            successful_calls: 20,
            failed_calls: 0,
            avg_response_time_ms: 250.0,
          },
        ],
        error: null,
      };

      const result = await getDailyConnectionDetails('2025-12-23');

      expect(result).toHaveLength(2);
      expect(result[0].apiName).toBe('Couch Managers');
      expect(result[0].successRate).toBe(97.5);
      expect(result[0].avgResponseTimeMs).toBe(150.5);
      expect(result[1].apiName).toBe('Fangraphs');
      expect(result[1].successRate).toBe(100);
    });

    it('should throw error on RPC failure', async () => {
      mockDailyDetailsResponse = { data: null, error: new Error('RPC failed') };

      await expect(getDailyConnectionDetails('2025-12-23')).rejects.toThrow(
        'Failed to fetch daily connection details'
      );
    });

    it('should handle null avg_response_time_ms', async () => {
      mockDailyDetailsResponse = {
        data: [
          {
            api_name: 'couch_managers',
            success_rate: 97.5,
            total_calls: 30,
            successful_calls: 29,
            failed_calls: 1,
            avg_response_time_ms: null,
          },
        ],
        error: null,
      };

      const result = await getDailyConnectionDetails('2025-12-23');

      expect(result[0].avgResponseTimeMs).toBeNull();
    });
  });

  describe('countLowSuccessRateApis', () => {
    it('should return 0 when all APIs have >= 95% success rate', () => {
      const metrics: ConnectionMetrics[] = [
        {
          apiName: 'Couch Managers',
          apiKey: 'couch_managers',
          successRate7d: 97.5,
          totalCalls: 200,
          successfulCalls: 195,
          failedCalls: 5,
          dailyRates: [],
        },
        {
          apiName: 'Fangraphs',
          apiKey: 'fangraphs',
          successRate7d: 100,
          totalCalls: 150,
          successfulCalls: 150,
          failedCalls: 0,
          dailyRates: [],
        },
      ];

      expect(countLowSuccessRateApis(metrics)).toBe(0);
    });

    it('should count APIs below 95% threshold correctly', () => {
      const metrics: ConnectionMetrics[] = [
        {
          apiName: 'Couch Managers',
          apiKey: 'couch_managers',
          successRate7d: 92.0, // Below 95%
          totalCalls: 200,
          successfulCalls: 184,
          failedCalls: 16,
          dailyRates: [],
        },
        {
          apiName: 'Fangraphs',
          apiKey: 'fangraphs',
          successRate7d: 100, // Above 95%
          totalCalls: 150,
          successfulCalls: 150,
          failedCalls: 0,
          dailyRates: [],
        },
        {
          apiName: 'Google Sheets',
          apiKey: 'google_sheets',
          successRate7d: 85.0, // Below 95%
          totalCalls: 100,
          successfulCalls: 85,
          failedCalls: 15,
          dailyRates: [],
        },
      ];

      expect(countLowSuccessRateApis(metrics)).toBe(2);
    });

    it('should return 0 for empty array', () => {
      expect(countLowSuccessRateApis([])).toBe(0);
    });

    it('should count 95% as meeting threshold (not low)', () => {
      const metrics: ConnectionMetrics[] = [
        {
          apiName: 'Couch Managers',
          apiKey: 'couch_managers',
          successRate7d: 95.0, // Exactly at threshold
          totalCalls: 200,
          successfulCalls: 190,
          failedCalls: 10,
          dailyRates: [],
        },
      ];

      expect(countLowSuccessRateApis(metrics)).toBe(0);
    });

    it('should count 94.9% as low', () => {
      const metrics: ConnectionMetrics[] = [
        {
          apiName: 'Couch Managers',
          apiKey: 'couch_managers',
          successRate7d: 94.9, // Just below threshold
          totalCalls: 200,
          successfulCalls: 189,
          failedCalls: 11,
          dailyRates: [],
        },
      ];

      expect(countLowSuccessRateApis(metrics)).toBe(1);
    });
  });
});