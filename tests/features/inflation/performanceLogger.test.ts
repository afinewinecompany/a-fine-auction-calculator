/**
 * Performance Logger Tests
 *
 * Tests for the inflation performance logging service.
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase
let mockSupabaseConfigured = true;
const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => mockSupabaseConfigured,
  getSupabase: () => ({
    from: vi.fn().mockReturnValue({
      insert: mockInsert,
    }),
  }),
}));

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      DEV: true,
    },
  },
});

// Import after mocking
import {
  logInflationPerformance,
  withPerformanceLogging,
  startPerformanceMeasurement,
} from '@/features/inflation/services/performanceLogger';

describe('performanceLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseConfigured = true;
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('logInflationPerformance', () => {
    it('should log performance entry correctly', async () => {
      logInflationPerformance({
        calculationType: 'basic',
        latencyMs: 45,
        playerCount: 200,
        draftId: 'test-draft-id',
      });

      // Allow async operation to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockInsert).toHaveBeenCalledWith({
        calculation_type: 'basic',
        latency_ms: 45,
        player_count: 200,
        draft_id: 'test-draft-id',
      });
    });

    it('should not throw when Supabase is not configured', () => {
      mockSupabaseConfigured = false;

      expect(() => {
        logInflationPerformance({
          calculationType: 'basic',
          latencyMs: 45,
        });
      }).not.toThrow();
    });

    it('should handle null optional fields', async () => {
      logInflationPerformance({
        calculationType: 'position',
        latencyMs: 30,
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockInsert).toHaveBeenCalledWith({
        calculation_type: 'position',
        latency_ms: 30,
        player_count: null,
        draft_id: null,
      });
    });

    it('should handle all calculation types', async () => {
      const types = ['basic', 'position', 'tier', 'budget_depletion'] as const;

      for (const type of types) {
        mockInsert.mockClear();
        logInflationPerformance({
          calculationType: type,
          latencyMs: 50,
        });

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            calculation_type: type,
          })
        );
      }
    });

    it('should not throw when database insert fails', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockInsert.mockRejectedValue(new Error('Database error'));

      expect(() => {
        logInflationPerformance({
          calculationType: 'basic',
          latencyMs: 45,
        });
      }).not.toThrow();

      await new Promise(resolve => setTimeout(resolve, 10));

      consoleWarnSpy.mockRestore();
    });
  });

  describe('withPerformanceLogging', () => {
    it('should wrap function and return same result', () => {
      const originalFn = (a: number, b: number) => a + b;
      const wrappedFn = withPerformanceLogging(originalFn, 'basic');

      const result = wrappedFn(5, 3);

      expect(result).toBe(8);
    });

    it('should log performance after function execution', async () => {
      const originalFn = () => 'result';
      const wrappedFn = withPerformanceLogging(originalFn, 'tier');

      wrappedFn();

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          calculation_type: 'tier',
        })
      );
    });

    it('should use custom getPlayerCount extractor', async () => {
      const originalFn = (players: string[]) => players.length;
      const wrappedFn = withPerformanceLogging(originalFn, 'basic', {
        getPlayerCount: (players: string[]) => players.length,
      });

      wrappedFn(['a', 'b', 'c']);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          player_count: 3,
        })
      );
    });

    it('should use custom getDraftId extractor', async () => {
      const originalFn = (draftId: string) => draftId;
      const wrappedFn = withPerformanceLogging(originalFn, 'basic', {
        getDraftId: (draftId: string) => draftId,
      });

      wrappedFn('draft-123');

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          draft_id: 'draft-123',
        })
      );
    });

    it('should preserve function behavior for complex return types', () => {
      const originalFn = () => ({ rate: 0.15, positions: ['SS', '2B'] });
      const wrappedFn = withPerformanceLogging(originalFn, 'position');

      const result = wrappedFn();

      expect(result).toEqual({ rate: 0.15, positions: ['SS', '2B'] });
    });
  });

  describe('startPerformanceMeasurement', () => {
    it('should return stop function that logs performance', async () => {
      const measurement = startPerformanceMeasurement('basic');

      expect(typeof measurement.stop).toBe('function');

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 5));

      const latency = measurement.stop();

      expect(typeof latency).toBe('number');
      expect(latency).toBeGreaterThanOrEqual(0);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          calculation_type: 'basic',
        })
      );
    });

    it('should accept options in stop function', async () => {
      const measurement = startPerformanceMeasurement('tier');

      measurement.stop({ playerCount: 150, draftId: 'draft-456' });

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          calculation_type: 'tier',
          player_count: 150,
          draft_id: 'draft-456',
        })
      );
    });

    it('should measure elapsed time correctly', async () => {
      const measurement = startPerformanceMeasurement('basic');

      // Wait ~50ms
      await new Promise(resolve => setTimeout(resolve, 50));

      const latency = measurement.stop();

      // Should be at least 40ms (allowing for some timing variance)
      expect(latency).toBeGreaterThanOrEqual(40);
      // Should be less than 200ms (reasonable upper bound)
      expect(latency).toBeLessThan(200);
    });

    it('should round latency to whole milliseconds', async () => {
      const measurement = startPerformanceMeasurement('basic');

      const latency = measurement.stop();

      expect(Number.isInteger(latency)).toBe(true);
    });
  });
});
