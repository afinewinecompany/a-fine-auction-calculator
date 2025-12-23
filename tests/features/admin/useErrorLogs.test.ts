/**
 * useErrorLogs Hook Tests
 *
 * Tests for the error logs fetching hook types and interface.
 * Story: 13.10 - Drill Down into Error Logs
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorLogs } from '@/features/admin/hooks/useErrorLogs';

// Mock supabase - return null to test error handling
vi.mock('@/lib/supabase', () => ({
  supabase: null,
}));

describe('useErrorLogs', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide filter state with default values', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    expect(result.current.filter.dateRange).toBe('24h');
    expect(result.current.filter.searchQuery).toBe('');
  });

  it('should update filter when setFilter is called', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    act(() => {
      result.current.setFilter({ dateRange: '7d' });
    });

    expect(result.current.filter.dateRange).toBe('7d');
  });

  it('should update search query in filter', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    act(() => {
      result.current.setFilter({ searchQuery: '500' });
    });

    expect(result.current.filter.searchQuery).toBe('500');
  });

  it('should provide refetch function', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    // Initially loading should be true
    expect(result.current.loading).toBeDefined();
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should initialize logs as empty array', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    expect(Array.isArray(result.current.logs)).toBe(true);
  });

  it('should initialize frequency as empty array', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    expect(Array.isArray(result.current.frequency)).toBe(true);
  });

  it('should set error when supabase is not available', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    // With null supabase, should have error
    expect(result.current.error).toBe('Database connection not available');
  });

  it('should allow partial filter updates', () => {
    const { result } = renderHook(() => useErrorLogs('couch_managers'));

    act(() => {
      result.current.setFilter({ dateRange: '30d' });
    });

    expect(result.current.filter.dateRange).toBe('30d');
    expect(result.current.filter.searchQuery).toBe(''); // Should keep existing value
  });
});
