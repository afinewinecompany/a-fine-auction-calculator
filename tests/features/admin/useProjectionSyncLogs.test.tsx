/**
 * useProjectionSyncLogs Hook Tests
 *
 * Tests for the projection sync logs monitoring hook with polling.
 *
 * Story: 13.6 - View Projection Sync Logs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock Supabase
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    from: mockFrom,
  }),
}));

// Mock database response data
const mockSyncLogsData = [
  {
    id: 'log-1',
    sync_type: 'fangraphs',
    status: 'success',
    players_updated: 500,
    error_message: null,
    started_at: '2025-12-23T10:00:00Z',
    completed_at: '2025-12-23T10:01:00Z',
  },
  {
    id: 'log-2',
    sync_type: 'google_sheets',
    status: 'failure',
    players_updated: null,
    error_message: 'Authentication failed',
    started_at: '2025-12-23T09:00:00Z',
    completed_at: '2025-12-23T09:00:30Z',
  },
  {
    id: 'log-3',
    sync_type: 'fangraphs',
    status: 'success',
    players_updated: 450,
    error_message: null,
    started_at: '2025-12-22T10:00:00Z',
    completed_at: '2025-12-22T10:01:30Z',
  },
];

// Import after mocking
import { useProjectionSyncLogs } from '@/features/admin/hooks/useProjectionSyncLogs';

function setupMockChain(data: unknown, error: unknown = null) {
  mockLimit.mockReturnValue({ data, error });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockSelect.mockReturnValue({ order: mockOrder });
  mockFrom.mockReturnValue({ select: mockSelect });
}

describe('useProjectionSyncLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockChain(mockSyncLogsData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useProjectionSyncLogs());

    expect(result.current.loading).toBe(true);
    expect(result.current.syncLogs).toEqual([]);
    expect(result.current.successCount).toBe(0);
    expect(result.current.failureCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should fetch sync logs on mount', async () => {
    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.syncLogs).toHaveLength(3);
    expect(mockFrom).toHaveBeenCalledWith('projection_sync_logs');
    expect(mockSelect).toHaveBeenCalledWith(
      'id, sync_type, status, players_updated, error_message, started_at, completed_at'
    );
    expect(mockOrder).toHaveBeenCalledWith('started_at', { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(50);
  });

  it('should calculate successCount correctly', async () => {
    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 2 successful syncs in mock data
    expect(result.current.successCount).toBe(2);
  });

  it('should calculate failureCount correctly', async () => {
    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 1 failed sync in mock data
    expect(result.current.failureCount).toBe(1);
  });

  it('should map database fields to camelCase correctly', async () => {
    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstLog = result.current.syncLogs[0];
    expect(firstLog.id).toBe('log-1');
    expect(firstLog.syncType).toBe('fangraphs');
    expect(firstLog.status).toBe('success');
    expect(firstLog.playersUpdated).toBe(500);
    expect(firstLog.errorMessage).toBeNull();
    expect(firstLog.startedAt).toBe('2025-12-23T10:00:00Z');
    expect(firstLog.completedAt).toBe('2025-12-23T10:01:00Z');
  });

  it('should set error on fetch failure', async () => {
    setupMockChain(null, { message: 'Database error' });

    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.syncLogs).toEqual([]);
  });

  it('should allow manual refetch', async () => {
    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFrom).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it('should handle empty data response', async () => {
    setupMockChain([]);

    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.syncLogs).toEqual([]);
    expect(result.current.successCount).toBe(0);
    expect(result.current.failureCount).toBe(0);
  });

  it('should handle null data response', async () => {
    setupMockChain(null);

    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.syncLogs).toEqual([]);
  });

  it('should return correct hook result types', async () => {
    const { result } = renderHook(() => useProjectionSyncLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
    expect(Array.isArray(result.current.syncLogs)).toBe(true);
    expect(typeof result.current.successCount).toBe('number');
    expect(typeof result.current.failureCount).toBe('number');
    expect(typeof result.current.loading).toBe('boolean');
  });
});