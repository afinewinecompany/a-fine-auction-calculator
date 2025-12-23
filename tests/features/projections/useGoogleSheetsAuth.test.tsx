/**
 * useGoogleSheetsAuth Hook Tests
 *
 * Story: 4.2 - Implement Google Sheets OAuth Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGoogleSheetsAuth } from '@/features/projections/hooks/useGoogleSheetsAuth';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';

const mockInvoke = supabase.functions.invoke as ReturnType<typeof vi.fn>;

describe('useGoogleSheetsAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('checks connection on mount', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { connected: true }, error: null });

    const { result } = renderHook(() => useGoogleSheetsAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockInvoke).toHaveBeenCalledWith('google-oauth', {
      body: { action: 'check-connection' },
    });
    expect(result.current.isConnected).toBe(true);
  });

  it('handles not connected state', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { connected: false }, error: null });

    const { result } = renderHook(() => useGoogleSheetsAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('handles check connection error', async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error('Network error') });

    const { result } = renderHook(() => useGoogleSheetsAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isConnected).toBe(false);
  });

  it('disconnects successfully', async () => {
    mockInvoke
      .mockResolvedValueOnce({ data: { connected: true }, error: null })
      .mockResolvedValueOnce({ data: { success: true }, error: null });

    const { result } = renderHook(() => useGoogleSheetsAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.disconnect();
    });

    expect(mockInvoke).toHaveBeenCalledWith('google-oauth', {
      body: { action: 'disconnect' },
    });
    expect(result.current.isConnected).toBe(false);
  });
});
