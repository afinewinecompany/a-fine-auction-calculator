/**
 * Draft Completion Service Tests
 *
 * Tests for the draft completion metrics service functions.
 *
 * Story: 13.8 - Track Draft Completion Rates
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
import {
  getDraftCompletionMetrics,
  isBelowTarget,
} from '@/features/admin/services/draftCompletionService';

describe('draftCompletionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseConfigured = true;
    mockRpcResponse = { data: null, error: null };
  });

  describe('getDraftCompletionMetrics', () => {
    it('should fetch and transform metrics correctly', async () => {
      const mockData = [
        {
          total_drafts: 100,
          completed_drafts: 85,
          abandoned_drafts: 10,
          error_drafts: 5,
          completion_rate: 85.0,
          daily_rates: [
            { date: '2025-12-22', completionRate: 80.0 },
            { date: '2025-12-23', completionRate: 90.0 },
          ],
        },
      ];
      mockRpcResponse = { data: mockData, error: null };

      const result = await getDraftCompletionMetrics();

      expect(result).toEqual({
        totalDrafts: 100,
        completedDrafts: 85,
        abandonedDrafts: 10,
        errorDrafts: 5,
        completionRate: 85.0,
        dailyRates: [
          { date: '2025-12-22', completionRate: 80.0 },
          { date: '2025-12-23', completionRate: 90.0 },
        ],
      });
    });

    it('should return empty metrics when no data', async () => {
      mockRpcResponse = { data: [], error: null };

      const result = await getDraftCompletionMetrics();

      expect(result).toEqual({
        totalDrafts: 0,
        completedDrafts: 0,
        abandonedDrafts: 0,
        errorDrafts: 0,
        completionRate: 0,
        dailyRates: [],
      });
    });

    it('should return empty metrics when data is null', async () => {
      mockRpcResponse = { data: null, error: null };

      const result = await getDraftCompletionMetrics();

      expect(result).toEqual({
        totalDrafts: 0,
        completedDrafts: 0,
        abandonedDrafts: 0,
        errorDrafts: 0,
        completionRate: 0,
        dailyRates: [],
      });
    });

    it('should handle null daily_rates', async () => {
      const mockData = [
        {
          total_drafts: 10,
          completed_drafts: 8,
          abandoned_drafts: 1,
          error_drafts: 1,
          completion_rate: 80.0,
          daily_rates: null,
        },
      ];
      mockRpcResponse = { data: mockData, error: null };

      const result = await getDraftCompletionMetrics();

      expect(result.dailyRates).toEqual([]);
    });

    it('should throw error when database not configured', async () => {
      mockSupabaseConfigured = false;

      await expect(getDraftCompletionMetrics()).rejects.toThrow('Database not configured');
    });

    it('should throw error on database failure', async () => {
      mockRpcResponse = {
        data: null,
        error: new Error('Connection failed'),
      };

      await expect(getDraftCompletionMetrics()).rejects.toThrow(
        'Failed to fetch draft completion metrics: Connection failed'
      );
    });

    it('should convert numeric strings to numbers', async () => {
      const mockData = [
        {
          total_drafts: '50',
          completed_drafts: '40',
          abandoned_drafts: '5',
          error_drafts: '5',
          completion_rate: '80.00',
          daily_rates: [{ date: '2025-12-23', completionRate: '85.50' }],
        },
      ];
      mockRpcResponse = { data: mockData, error: null };

      const result = await getDraftCompletionMetrics();

      expect(result.totalDrafts).toBe(50);
      expect(result.completedDrafts).toBe(40);
      expect(result.abandonedDrafts).toBe(5);
      expect(result.errorDrafts).toBe(5);
      expect(result.completionRate).toBe(80);
      expect(result.dailyRates[0].completionRate).toBe(85.5);
    });
  });

  describe('isBelowTarget', () => {
    it('should return true when rate is below 80%', () => {
      expect(isBelowTarget(79.9)).toBe(true);
      expect(isBelowTarget(50)).toBe(true);
      expect(isBelowTarget(0)).toBe(true);
    });

    it('should return false when rate is at or above 80%', () => {
      expect(isBelowTarget(80)).toBe(false);
      expect(isBelowTarget(80.1)).toBe(false);
      expect(isBelowTarget(100)).toBe(false);
    });

    it('should return true for exactly 79.99', () => {
      expect(isBelowTarget(79.99)).toBe(true);
    });

    it('should return false for exactly 80', () => {
      expect(isBelowTarget(80)).toBe(false);
    });
  });
});
