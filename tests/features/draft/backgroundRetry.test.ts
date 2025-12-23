/**
 * Background Retry Logic Tests
 *
 * Story: 10.8 - Implement Graceful Degradation Pattern
 *
 * Tests background retry behavior for automatic reconnection.
 * Ensures retry continues even in Manual Mode (NFR-R6).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBackgroundRetry } from '@/features/draft/hooks/useBackgroundRetry';
import { renderHook, act } from '@testing-library/react';

describe('useBackgroundRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('retry scheduling', () => {
    it('schedules retry after initial failure', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
        })
      );

      // Trigger failure
      act(() => {
        result.current.onFailure();
      });

      // Advance time to first retry (5 seconds)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(retryFn).toHaveBeenCalledTimes(1);
    });

    it('uses exponential backoff: 5s, 10s, 20s, 30s (max)', async () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
          initialDelay: 5000,
          maxDelay: 30000,
        })
      );

      // First failure
      act(() => {
        result.current.onFailure();
      });

      // First retry at 5s
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(retryFn).toHaveBeenCalledTimes(1);

      // Second retry at 10s
      act(() => {
        result.current.onFailure();
        vi.advanceTimersByTime(10000);
      });
      expect(retryFn).toHaveBeenCalledTimes(2);

      // Third retry at 20s
      act(() => {
        result.current.onFailure();
        vi.advanceTimersByTime(20000);
      });
      expect(retryFn).toHaveBeenCalledTimes(3);

      // Fourth retry at 30s (max)
      act(() => {
        result.current.onFailure();
        vi.advanceTimersByTime(30000);
      });
      expect(retryFn).toHaveBeenCalledTimes(4);

      // Fifth retry still at 30s (max)
      act(() => {
        result.current.onFailure();
        vi.advanceTimersByTime(30000);
      });
      expect(retryFn).toHaveBeenCalledTimes(5);
    });

    it('respects maxDelay cap per NFR-R6 (30 seconds)', async () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
          maxDelay: 30000,
        })
      );

      // Simulate many failures to exceed max delay
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.onFailure();
        });
      }

      // Get current delay - should be capped at 30s
      expect(result.current.currentDelay).toBeLessThanOrEqual(30000);
    });
  });

  describe('manual mode continuation', () => {
    it('continues retrying in background when Manual Mode is active', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
          isManualMode: true,
        })
      );

      // Trigger failure (entering manual mode)
      act(() => {
        result.current.onFailure();
      });

      // Advance to retry time
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Should still retry even in manual mode
      expect(retryFn).toHaveBeenCalled();
    });

    it('retries do not stop when manual mode is triggered', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result, rerender } = renderHook(
        ({ isManualMode }) =>
          useBackgroundRetry({
            retryFn,
            enabled: true,
            isManualMode,
          }),
        { initialProps: { isManualMode: false } }
      );

      // Trigger failure
      act(() => {
        result.current.onFailure();
      });

      // Switch to manual mode
      rerender({ isManualMode: true });

      // Retry should still happen
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(retryFn).toHaveBeenCalled();
    });
  });

  describe('success handling', () => {
    it('stops retrying on successful connection', async () => {
      const retryFn = vi.fn().mockResolvedValue(true);
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          onSuccess,
          enabled: true,
        })
      );

      // Trigger failure
      act(() => {
        result.current.onFailure();
      });

      // Advance to retry time
      await act(async () => {
        vi.advanceTimersByTime(5000);
        await vi.runAllTimersAsync();
      });

      // Should call onSuccess
      expect(onSuccess).toHaveBeenCalled();
    });

    it('resets retry count on success', async () => {
      const retryFn = vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
        })
      );

      // First failure
      act(() => {
        result.current.onFailure();
      });

      // Two more retries, then success
      await act(async () => {
        vi.advanceTimersByTime(5000);
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        result.current.onFailure();
        vi.advanceTimersByTime(10000);
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        result.current.onFailure();
        vi.advanceTimersByTime(20000);
        await vi.runAllTimersAsync();
      });

      // Retry count should be reset
      expect(result.current.retryCount).toBe(0);
    });

    it('resets delay to initial value on success', async () => {
      const retryFn = vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
          initialDelay: 5000,
        })
      );

      // Multiple failures to increase delay
      act(() => {
        result.current.onFailure();
      });
      await act(async () => {
        vi.advanceTimersByTime(5000);
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.onFailure();
      });
      await act(async () => {
        vi.advanceTimersByTime(10000);
        await vi.runAllTimersAsync();
      });

      // Success on third retry
      act(() => {
        result.current.onFailure();
      });
      await act(async () => {
        vi.advanceTimersByTime(20000);
        await vi.runAllTimersAsync();
      });

      // Delay should reset to initial
      expect(result.current.currentDelay).toBe(5000);
    });
  });

  describe('cleanup', () => {
    it('cancels pending retry on unmount', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result, unmount } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
        })
      );

      // Trigger failure to schedule retry
      act(() => {
        result.current.onFailure();
      });

      // Unmount before retry
      unmount();

      // Advance past retry time
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Retry should NOT have been called
      expect(retryFn).not.toHaveBeenCalled();
    });

    it('does not schedule new retries after unmount', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result, unmount } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
        })
      );

      unmount();

      // Try to trigger failure after unmount (should be no-op)
      // This shouldn't cause any errors
      expect(() => {
        act(() => {
          result.current.onFailure();
        });
      }).not.toThrow();
    });
  });

  describe('enabled toggle', () => {
    it('does not retry when disabled', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: false,
        })
      );

      // Trigger failure
      act(() => {
        result.current.onFailure();
      });

      // Advance past retry time
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Should not retry when disabled
      expect(retryFn).not.toHaveBeenCalled();
    });

    it('cancels pending retry when disabled', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useBackgroundRetry({
            retryFn,
            enabled,
          }),
        { initialProps: { enabled: true } }
      );

      // Trigger failure
      act(() => {
        result.current.onFailure();
      });

      // Disable before retry
      rerender({ enabled: false });

      // Advance past retry time
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Should not have retried
      expect(retryFn).not.toHaveBeenCalled();
    });

    it('resumes retrying when re-enabled after failure', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useBackgroundRetry({
            retryFn,
            enabled,
            initialDelay: 5000,
          }),
        { initialProps: { enabled: true } }
      );

      // Trigger failure
      act(() => {
        result.current.onFailure();
      });

      // Disable
      rerender({ enabled: false });

      // Re-enable
      rerender({ enabled: true });

      // Trigger new failure (this increases delay to 20s due to previous failure)
      act(() => {
        result.current.onFailure();
      });

      // Need to advance past the current delay (which is now 20000ms due to 2 failures)
      act(() => {
        vi.advanceTimersByTime(20000);
      });

      // Should retry now
      expect(retryFn).toHaveBeenCalled();
    });
  });

  describe('state tracking', () => {
    it('tracks retry count', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
        })
      );

      expect(result.current.retryCount).toBe(0);

      // First failure
      act(() => {
        result.current.onFailure();
      });
      expect(result.current.retryCount).toBe(1);

      // Second failure
      act(() => {
        result.current.onFailure();
      });
      expect(result.current.retryCount).toBe(2);
    });

    it('tracks isRetrying state', async () => {
      const retryFn = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(false), 100)));
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
        })
      );

      // Trigger failure
      act(() => {
        result.current.onFailure();
      });

      // Advance to retry time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should be retrying
      expect(result.current.isRetrying).toBe(true);

      // Complete the retry
      await act(async () => {
        vi.advanceTimersByTime(100);
        await vi.runAllTimersAsync();
      });

      // Should no longer be retrying
      expect(result.current.isRetrying).toBe(false);
    });

    it('tracks current delay', () => {
      const retryFn = vi.fn().mockResolvedValue(false);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
          initialDelay: 5000,
        })
      );

      expect(result.current.currentDelay).toBe(5000);

      // After failure, delay doubles
      act(() => {
        result.current.onFailure();
      });
      expect(result.current.currentDelay).toBe(10000);

      act(() => {
        result.current.onFailure();
      });
      expect(result.current.currentDelay).toBe(20000);
    });
  });

  describe('manual retry', () => {
    it('allows manual retry trigger', async () => {
      const retryFn = vi.fn().mockResolvedValue(true);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
        })
      );

      // Manual retry
      await act(async () => {
        await result.current.retry();
      });

      expect(retryFn).toHaveBeenCalled();
    });

    it('resets delay on manual retry success', async () => {
      const retryFn = vi.fn().mockResolvedValue(true);
      const { result } = renderHook(() =>
        useBackgroundRetry({
          retryFn,
          enabled: true,
          initialDelay: 5000,
        })
      );

      // Increase delay with failures (separate acts to ensure state updates)
      act(() => {
        result.current.onFailure();
      });
      expect(result.current.currentDelay).toBe(10000); // 5000 * 2^1

      act(() => {
        result.current.onFailure();
      });
      expect(result.current.currentDelay).toBe(20000); // 5000 * 2^2

      // Manual retry success
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.currentDelay).toBe(5000);
    });
  });
});
