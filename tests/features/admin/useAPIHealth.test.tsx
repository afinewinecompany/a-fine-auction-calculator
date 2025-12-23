/**
 * useAPIHealth Hook Tests
 *
 * Tests for the API health monitoring hook with polling.
 *
 * Story: 13.3 - Monitor API Health for Integrations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { APIHealthStatus } from '@/features/admin/types/admin.types';

// Mock API health status
const createMockAPIStatus = (overrides: Partial<APIHealthStatus> = {}): APIHealthStatus => ({
  name: 'Test API',
  status: 'healthy',
  lastSuccessfulCall: '2025-12-22T10:00:00Z',
  responseTime: 150,
  errorRate: 0,
  recentErrors: [],
  ...overrides,
});

// Mock checkAllAPIs response
let mockCheckAllAPIsResponse: APIHealthStatus[] = [];
let mockCheckAllAPIsError: Error | null = null;

const mockCheckAllAPIs = vi.fn(async () => {
  if (mockCheckAllAPIsError) {
    throw mockCheckAllAPIsError;
  }
  return mockCheckAllAPIsResponse;
});

vi.mock('@/features/admin/services/apiHealthService', () => ({
  checkAllAPIs: () => mockCheckAllAPIs(),
}));

// Import after mocking
import { useAPIHealth } from '@/features/admin/hooks/useAPIHealth';

describe('useAPIHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAllAPIsResponse = [
      createMockAPIStatus({ name: 'Couch Managers' }),
      createMockAPIStatus({ name: 'Fangraphs' }),
      createMockAPIStatus({ name: 'Google Sheets' }),
    ];
    mockCheckAllAPIsError = null;
    mockCheckAllAPIs.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading=true', () => {
      const { result } = renderHook(() => useAPIHealth());

      expect(result.current.loading).toBe(true);
      expect(result.current.apiStatuses).toEqual([]);
    });

    it('should have hasDownAPI=false initially', () => {
      const { result } = renderHook(() => useAPIHealth());

      expect(result.current.hasDownAPI).toBe(false);
    });

    it('should have hasDegradedAPI=false initially', () => {
      const { result } = renderHook(() => useAPIHealth());

      expect(result.current.hasDegradedAPI).toBe(false);
    });

    it('should have error=null initially', () => {
      const { result } = renderHook(() => useAPIHealth());

      expect(result.current.error).toBeNull();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch API health on mount', async () => {
      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.apiStatuses).toHaveLength(3);
    });

    it('should set loading=false after fetch completes', async () => {
      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should return all 3 API statuses', async () => {
      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.apiStatuses).toHaveLength(3);
      });

      expect(result.current.apiStatuses.map(s => s.name)).toEqual([
        'Couch Managers',
        'Fangraphs',
        'Google Sheets',
      ]);
    });
  });

  describe('hasDownAPI Flag', () => {
    it('should be false when all APIs are healthy', async () => {
      mockCheckAllAPIsResponse = [
        createMockAPIStatus({ name: 'API 1', status: 'healthy' }),
        createMockAPIStatus({ name: 'API 2', status: 'healthy' }),
        createMockAPIStatus({ name: 'API 3', status: 'healthy' }),
      ];

      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasDownAPI).toBe(false);
    });

    it('should be true when any API is down', async () => {
      mockCheckAllAPIsResponse = [
        createMockAPIStatus({ name: 'API 1', status: 'healthy' }),
        createMockAPIStatus({ name: 'API 2', status: 'down' }),
        createMockAPIStatus({ name: 'API 3', status: 'healthy' }),
      ];

      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasDownAPI).toBe(true);
    });

    it('should be false when APIs are degraded but not down', async () => {
      mockCheckAllAPIsResponse = [
        createMockAPIStatus({ name: 'API 1', status: 'degraded' }),
        createMockAPIStatus({ name: 'API 2', status: 'healthy' }),
        createMockAPIStatus({ name: 'API 3', status: 'degraded' }),
      ];

      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasDownAPI).toBe(false);
    });
  });

  describe('hasDegradedAPI Flag', () => {
    it('should be false when all APIs are healthy', async () => {
      mockCheckAllAPIsResponse = [
        createMockAPIStatus({ name: 'API 1', status: 'healthy' }),
        createMockAPIStatus({ name: 'API 2', status: 'healthy' }),
        createMockAPIStatus({ name: 'API 3', status: 'healthy' }),
      ];

      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasDegradedAPI).toBe(false);
    });

    it('should be true when any API is degraded', async () => {
      mockCheckAllAPIsResponse = [
        createMockAPIStatus({ name: 'API 1', status: 'healthy' }),
        createMockAPIStatus({ name: 'API 2', status: 'degraded' }),
        createMockAPIStatus({ name: 'API 3', status: 'healthy' }),
      ];

      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasDegradedAPI).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should set error message on fetch failure', async () => {
      mockCheckAllAPIsError = new Error('Network failure');

      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network failure');
    });

    it('should clear error on successful refetch', async () => {
      mockCheckAllAPIsError = new Error('First failure');

      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.error).toBe('First failure');
      });

      // Fix the error
      mockCheckAllAPIsError = null;

      // Manual refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Refetch Function', () => {
    it('should provide a refetch function', async () => {
      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should update data when refetch is called', async () => {
      mockCheckAllAPIsResponse = [createMockAPIStatus({ name: 'Initial API', status: 'healthy' })];

      const { result } = renderHook(() => useAPIHealth());

      await waitFor(() => {
        expect(result.current.apiStatuses[0]?.name).toBe('Initial API');
      });

      // Update mock response
      mockCheckAllAPIsResponse = [createMockAPIStatus({ name: 'Updated API', status: 'down' })];

      // Trigger refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.apiStatuses[0]?.name).toBe('Updated API');
        expect(result.current.apiStatuses[0]?.status).toBe('down');
      });
    });
  });
});
