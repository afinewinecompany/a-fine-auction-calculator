/**
 * Error Rate Service Tests
 *
 * Tests for the error rate calculation service that monitors
 * API error rates and trend analysis.
 *
 * Story: 13.4 - View Error Rates with Automated Alerts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock response types
interface MockRpcResult {
  data: unknown;
  error: Error | null;
}

// Mock Supabase responses
let mockSupabaseConfigured = true;
let mockRpc24hResponse: MockRpcResult = { data: [], error: null };
let mockRpc1hResponse: MockRpcResult = { data: [], error: null };

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => mockSupabaseConfigured,
  getSupabase: () => ({
    rpc: vi.fn((funcName: string) => {
      if (funcName === 'get_error_rates_24h') {
        return Promise.resolve(mockRpc24hResponse);
      }
      if (funcName === 'get_error_rates_1h') {
        return Promise.resolve(mockRpc1hResponse);
      }
      return Promise.resolve({ data: null, error: null });
    }),
  }),
}));

// Import after mocking
import {
  getErrorRates,
  countAlertsAboveThreshold,
  ERROR_THRESHOLD,
} from '@/features/admin/services/errorRateService';
import type { ErrorRate } from '@/features/admin/types/admin.types';

describe('errorRateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseConfigured = true;
    mockRpc24hResponse = { data: [], error: null };
    mockRpc1hResponse = { data: [], error: null };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('ERROR_THRESHOLD', () => {
    it('should be 5 percent', () => {
      expect(ERROR_THRESHOLD).toBe(5);
    });
  });

  describe('getErrorRates', () => {
    it('should return empty array when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const result = await getErrorRates();

      expect(result).toEqual([]);
    });

    it('should return error rates for all APIs', async () => {
      mockRpc24hResponse = {
        data: [
          { api_name: 'couch_managers', error_rate_24h: 2.5, error_count: 5, total_checks: 200 },
          { api_name: 'fangraphs', error_rate_24h: 0, error_count: 0, total_checks: 200 },
          { api_name: 'google_sheets', error_rate_24h: 7.5, error_count: 15, total_checks: 200 },
        ],
        error: null,
      };
      mockRpc1hResponse = {
        data: [
          { api_name: 'couch_managers', error_rate_1h: 3.0 },
          { api_name: 'fangraphs', error_rate_1h: 0 },
          { api_name: 'google_sheets', error_rate_1h: 10.0 },
        ],
        error: null,
      };

      const result = await getErrorRates();

      expect(result).toHaveLength(3);
      expect(result.map(r => r.apiKey)).toEqual([
        'couch_managers',
        'fangraphs',
        'google_sheets',
      ]);
    });

    it('should map API names to display names correctly', async () => {
      mockRpc24hResponse = {
        data: [
          { api_name: 'couch_managers', error_rate_24h: 2.5, error_count: 5, total_checks: 200 },
          { api_name: 'fangraphs', error_rate_24h: 0, error_count: 0, total_checks: 200 },
          { api_name: 'google_sheets', error_rate_24h: 7.5, error_count: 15, total_checks: 200 },
        ],
        error: null,
      };

      const result = await getErrorRates();

      expect(result.map(r => r.apiName)).toEqual([
        'Couch Managers',
        'Fangraphs',
        'Google Sheets',
      ]);
    });

    it('should calculate isAboveThreshold correctly at 5% boundary', async () => {
      mockRpc24hResponse = {
        data: [
          { api_name: 'couch_managers', error_rate_24h: 4.9, error_count: 5, total_checks: 100 },
          { api_name: 'fangraphs', error_rate_24h: 5.0, error_count: 5, total_checks: 100 },
          { api_name: 'google_sheets', error_rate_24h: 5.1, error_count: 5, total_checks: 100 },
        ],
        error: null,
      };

      const result = await getErrorRates();

      expect(result[0].isAboveThreshold).toBe(false); // 4.9% < 5%
      expect(result[1].isAboveThreshold).toBe(true); // 5.0% >= 5%
      expect(result[2].isAboveThreshold).toBe(true); // 5.1% >= 5%
    });

    it('should handle null error rate as 0', async () => {
      mockRpc24hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_24h: null, error_count: 0, total_checks: 0 }],
        error: null,
      };

      const result = await getErrorRates();

      expect(result[0].errorRate24h).toBe(0);
      expect(result[0].isAboveThreshold).toBe(false);
    });

    it('should throw error on 24h RPC failure', async () => {
      mockRpc24hResponse = { data: null, error: new Error('RPC failed') };

      await expect(getErrorRates()).rejects.toThrow('Failed to fetch error rates');
    });

    it('should continue with stable trend on 1h RPC failure', async () => {
      mockRpc24hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_24h: 2.5, error_count: 5, total_checks: 200 }],
        error: null,
      };
      mockRpc1hResponse = { data: null, error: new Error('RPC failed') };

      const result = await getErrorRates();

      // Should still return data with stable trend
      expect(result).toHaveLength(1);
      expect(result[0].trend).toBe('stable');
    });
  });

  describe('Trend Calculation', () => {
    it('should return "up" when 1h rate is significantly higher than 24h rate', async () => {
      mockRpc24hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_24h: 2.0, error_count: 4, total_checks: 200 }],
        error: null,
      };
      mockRpc1hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_1h: 5.0 }], // 3% higher
        error: null,
      };

      const result = await getErrorRates();

      expect(result[0].trend).toBe('up');
    });

    it('should return "down" when 1h rate is significantly lower than 24h rate', async () => {
      mockRpc24hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_24h: 5.0, error_count: 10, total_checks: 200 }],
        error: null,
      };
      mockRpc1hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_1h: 2.0 }], // 3% lower
        error: null,
      };

      const result = await getErrorRates();

      expect(result[0].trend).toBe('down');
    });

    it('should return "stable" when difference is less than 1%', async () => {
      mockRpc24hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_24h: 2.0, error_count: 4, total_checks: 200 }],
        error: null,
      };
      mockRpc1hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_1h: 2.5 }], // 0.5% higher
        error: null,
      };

      const result = await getErrorRates();

      expect(result[0].trend).toBe('stable');
    });

    it('should return "stable" when no 1h data available', async () => {
      mockRpc24hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_24h: 2.0, error_count: 4, total_checks: 200 }],
        error: null,
      };
      mockRpc1hResponse = {
        data: [], // No 1h data
        error: null,
      };

      const result = await getErrorRates();

      expect(result[0].trend).toBe('stable');
    });

    it('should return "stable" when 1h rate is null', async () => {
      mockRpc24hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_24h: 2.0, error_count: 4, total_checks: 200 }],
        error: null,
      };
      mockRpc1hResponse = {
        data: [{ api_name: 'couch_managers', error_rate_1h: null }],
        error: null,
      };

      const result = await getErrorRates();

      expect(result[0].trend).toBe('stable');
    });
  });

  describe('countAlertsAboveThreshold', () => {
    it('should return 0 when no APIs are above threshold', () => {
      const errorRates: ErrorRate[] = [
        {
          apiName: 'Couch Managers',
          apiKey: 'couch_managers',
          errorRate24h: 2.0,
          errorCount: 4,
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
      ];

      expect(countAlertsAboveThreshold(errorRates)).toBe(0);
    });

    it('should count APIs above threshold correctly', () => {
      const errorRates: ErrorRate[] = [
        {
          apiName: 'Couch Managers',
          apiKey: 'couch_managers',
          errorRate24h: 10.0,
          errorCount: 20,
          totalChecks: 200,
          trend: 'up',
          isAboveThreshold: true,
        },
        {
          apiName: 'Fangraphs',
          apiKey: 'fangraphs',
          errorRate24h: 2.0,
          errorCount: 4,
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
          trend: 'down',
          isAboveThreshold: true,
        },
      ];

      expect(countAlertsAboveThreshold(errorRates)).toBe(2);
    });

    it('should return 0 for empty array', () => {
      expect(countAlertsAboveThreshold([])).toBe(0);
    });
  });
});
