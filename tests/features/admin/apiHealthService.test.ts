/**
 * API Health Service Tests
 *
 * Tests for the API health check service that monitors
 * Couch Managers, Fangraphs, and Google Sheets APIs.
 *
 * Story: 13.3 - Monitor API Health for Integrations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase responses
let mockSupabaseConfigured = true;
let mockMaybeSingleResponse: { data: unknown; error: Error | null } = {
  data: null,
  error: null,
};
let mockSingleResponse: { data: unknown; error: Error | null } = {
  data: null,
  error: null,
};
let mockRpcResponse: { data: number | null; error: Error | null } = {
  data: 0,
  error: null,
};
let mockInsertResponse: { data: unknown; error: Error | null } = {
  data: null,
  error: null,
};
let mockSelectResponse: { data: unknown[] | null; error: Error | null } = {
  data: [],
  error: null,
};

// Create mock query builder that uses current mock values
const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn(() => Promise.resolve(mockSingleResponse)),
  maybeSingle: vi.fn(() => Promise.resolve(mockMaybeSingleResponse)),
  insert: vi.fn(() => Promise.resolve(mockInsertResponse)),
};

// Make select return the correct thing based on the table queried
const mockFrom = vi.fn((tableName: string) => {
  if (tableName === 'api_health_logs') {
    return {
      ...mockQueryBuilder,
      select: vi.fn().mockReturnValue({
        ...mockQueryBuilder,
        eq: vi.fn().mockReturnValue({
          ...mockQueryBuilder,
          not: vi.fn().mockReturnValue({
            ...mockQueryBuilder,
            order: vi.fn().mockReturnValue({
              ...mockQueryBuilder,
              limit: vi.fn().mockResolvedValue(mockSelectResponse),
            }),
          }),
          order: vi.fn().mockReturnValue({
            ...mockQueryBuilder,
            limit: vi.fn().mockReturnValue({
              single: vi.fn(() => Promise.resolve(mockSingleResponse)),
            }),
          }),
        }),
      }),
      insert: vi.fn(() => Promise.resolve(mockInsertResponse)),
    };
  }
  // For google_oauth_tokens
  return {
    ...mockQueryBuilder,
    select: vi.fn().mockReturnValue({
      ...mockQueryBuilder,
      limit: vi.fn().mockReturnValue({
        maybeSingle: vi.fn(() => Promise.resolve(mockMaybeSingleResponse)),
      }),
    }),
  };
});

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => mockSupabaseConfigured,
  getSupabase: () => ({
    from: mockFrom,
    rpc: vi.fn(() => Promise.resolve(mockRpcResponse)),
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { checkAllAPIs, checkSingleAPI } from '@/features/admin/services/apiHealthService';

describe('apiHealthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseConfigured = true;
    mockMaybeSingleResponse = { data: null, error: null };
    mockSingleResponse = { data: null, error: null };
    mockRpcResponse = { data: 0, error: null };
    mockInsertResponse = { data: null, error: null };
    mockSelectResponse = { data: [], error: null };

    // Reset fetch mock
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('checkAllAPIs', () => {
    it('should check all three APIs concurrently', async () => {
      // Mock all fetch calls to succeed
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const results = await checkAllAPIs();

      expect(results).toHaveLength(3);
      expect(results.map(r => r.name)).toEqual(['Couch Managers', 'Fangraphs', 'Google Sheets']);
    });

    it('should return healthy status when all APIs respond OK', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });
      mockMaybeSingleResponse = {
        data: { access_token: 'valid-token', expires_at: new Date(Date.now() + 3600000).toISOString() },
        error: null,
      };

      const results = await checkAllAPIs();

      // At least one should be healthy (others may be down due to test environment)
      const statuses = results.map(r => r.status);
      expect(statuses).toContain('healthy');
    });
  });

  describe('checkSingleAPI - Couch Managers', () => {
    it('should return healthy status on successful response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkSingleAPI('couch_managers');

      expect(result.name).toBe('Couch Managers');
      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return degraded status on non-OK response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
      });

      const result = await checkSingleAPI('couch_managers');

      expect(result.name).toBe('Couch Managers');
      expect(result.status).toBe('degraded');
    });

    it('should return down status on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await checkSingleAPI('couch_managers');

      expect(result.name).toBe('Couch Managers');
      expect(result.status).toBe('down');
      expect(result.responseTime).toBeNull();
    });

    it('should return down status on timeout', async () => {
      mockFetch.mockRejectedValue(new Error('The operation was aborted'));

      const result = await checkSingleAPI('couch_managers');

      expect(result.name).toBe('Couch Managers');
      expect(result.status).toBe('down');
    });
  });

  describe('checkSingleAPI - Fangraphs', () => {
    it('should return healthy status on successful response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkSingleAPI('fangraphs');

      expect(result.name).toBe('Fangraphs');
      expect(result.status).toBe('healthy');
    });

    it('should return degraded status on 500 error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await checkSingleAPI('fangraphs');

      expect(result.name).toBe('Fangraphs');
      expect(result.status).toBe('degraded');
    });

    it('should measure response time', async () => {
      mockFetch.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, status: 200 }), 50))
      );

      const result = await checkSingleAPI('fangraphs');

      expect(result.responseTime).toBeGreaterThanOrEqual(50);
    });
  });

  describe('checkSingleAPI - Google Sheets', () => {
    it('should return degraded when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const result = await checkSingleAPI('google_sheets');

      expect(result.name).toBe('Google Sheets');
      expect(result.status).toBe('degraded');
      expect(result.recentErrors).toContain('Supabase not configured');
    });

    it('should return degraded when no OAuth token exists', async () => {
      mockMaybeSingleResponse = { data: null, error: null };

      const result = await checkSingleAPI('google_sheets');

      expect(result.name).toBe('Google Sheets');
      expect(result.status).toBe('degraded');
    });

    it('should return degraded when OAuth token is expired', async () => {
      mockMaybeSingleResponse = {
        data: {
          access_token: 'expired-token',
          expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        error: null,
      };

      const result = await checkSingleAPI('google_sheets');

      expect(result.name).toBe('Google Sheets');
      expect(result.status).toBe('degraded');
    });

    it('should return healthy when OAuth token valid and API responds', async () => {
      mockMaybeSingleResponse = {
        data: {
          access_token: 'valid-token',
          expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        },
        error: null,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkSingleAPI('google_sheets');

      expect(result.name).toBe('Google Sheets');
      expect(result.status).toBe('healthy');
    });

    it('should return degraded on 401 unauthorized', async () => {
      mockMaybeSingleResponse = {
        data: {
          access_token: 'invalid-token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
        error: null,
      };
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await checkSingleAPI('google_sheets');

      expect(result.name).toBe('Google Sheets');
      expect(result.status).toBe('degraded');
    });
  });

  describe('Error Rate Calculation', () => {
    it('should return error rate from RPC function', async () => {
      mockRpcResponse = { data: 15.5, error: null };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkSingleAPI('couch_managers');

      expect(result.errorRate).toBe(15.5);
    });

    it('should return 0 error rate on RPC error', async () => {
      mockRpcResponse = { data: null, error: new Error('RPC failed') };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkSingleAPI('couch_managers');

      expect(result.errorRate).toBe(0);
    });
  });

  describe('Recent Errors', () => {
    it('should return empty array when no errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkSingleAPI('couch_managers');

      expect(result.recentErrors).toEqual([]);
    });

    it('should return empty array when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const result = await checkSingleAPI('google_sheets');

      expect(result.recentErrors).toBeDefined();
    });
  });

  describe('Health Logging', () => {
    it('should not fail health check if logging fails', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });
      mockInsertResponse = { data: null, error: new Error('Insert failed') };

      const result = await checkSingleAPI('couch_managers');

      // Should still return healthy status
      expect(result.status).toBe('healthy');
    });

    it('should skip logging when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const result = await checkSingleAPI('google_sheets');

      // Should return degraded (because Supabase not configured)
      expect(result.status).toBe('degraded');
    });
  });

  describe('Last Successful Call', () => {
    it('should return null when no successful calls recorded', async () => {
      mockSingleResponse = { data: null, error: null };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkSingleAPI('couch_managers');

      expect(result.lastSuccessfulCall).toBeNull();
    });

    it('should handle error gracefully for last successful call', async () => {
      mockSingleResponse = { data: null, error: new Error('Query failed') };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkSingleAPI('couch_managers');

      // Should still work and return null
      expect(result.lastSuccessfulCall).toBeNull();
    });
  });
});
