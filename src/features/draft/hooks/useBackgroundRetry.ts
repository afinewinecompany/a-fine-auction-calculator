/**
 * useBackgroundRetry Hook
 *
 * Story: 10.8 - Implement Graceful Degradation Pattern
 *
 * Provides background retry logic with exponential backoff for API connections.
 * Continues retrying even when Manual Mode is active (NFR-R6).
 *
 * Features:
 * - Exponential backoff: 5s, 10s, 20s, 30s (max per NFR-R6)
 * - Continues retrying in Manual Mode
 * - Resets on successful connection
 * - Cleanup on unmount
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Configuration options for background retry
 */
export interface BackgroundRetryOptions {
  /** Function to call for retry attempt. Returns true if successful. */
  retryFn: () => Promise<boolean>;
  /** Whether retry is enabled */
  enabled: boolean;
  /** Whether app is in Manual Mode (retries continue regardless) */
  isManualMode?: boolean;
  /** Initial delay in ms (default: 5000) */
  initialDelay?: number;
  /** Maximum delay in ms per NFR-R6 (default: 30000) */
  maxDelay?: number;
  /** Callback when retry succeeds */
  onSuccess?: () => void;
  /** Callback when retry fails */
  onRetryFailed?: (error: Error) => void;
}

/**
 * Return type for useBackgroundRetry
 */
export interface UseBackgroundRetryReturn {
  /** Current retry count */
  retryCount: number;
  /** Whether a retry is currently in progress */
  isRetrying: boolean;
  /** Current delay before next retry (ms) */
  currentDelay: number;
  /** Signal a failure to trigger retry scheduling */
  onFailure: () => void;
  /** Manually trigger a retry */
  retry: () => Promise<boolean>;
  /** Reset retry state */
  reset: () => void;
}

/**
 * Hook for background retry with exponential backoff
 *
 * Implements NFR-R6: Auto-reconnect within 30 seconds maximum delay.
 * Continues retrying even when Manual Mode is active to allow seamless recovery.
 *
 * @param options Configuration options
 * @returns Retry state and control functions
 *
 * @example
 * ```tsx
 * function DraftSync({ leagueId }: { leagueId: string }) {
 *   const { syncStatus, triggerSync } = useDraftSync(leagueId);
 *
 *   const { retryCount, isRetrying, onFailure, retry } = useBackgroundRetry({
 *     retryFn: async () => {
 *       await triggerSync();
 *       return syncStatus.isConnected;
 *     },
 *     enabled: true,
 *     isManualMode: syncStatus.isManualMode,
 *     onSuccess: () => {
 *       toast.success('Connection restored!');
 *     },
 *   });
 *
 *   // Call onFailure when sync fails
 *   useEffect(() => {
 *     if (syncStatus.error) {
 *       onFailure();
 *     }
 *   }, [syncStatus.error, onFailure]);
 *
 *   return (
 *     <div>
 *       {isRetrying && <span>Reconnecting... (attempt {retryCount})</span>}
 *       <button onClick={retry}>Retry Now</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBackgroundRetry(options: BackgroundRetryOptions): UseBackgroundRetryReturn {
  const {
    retryFn,
    enabled,
    isManualMode = false,
    initialDelay = 5000,
    maxDelay = 30000,
    onSuccess,
    onRetryFailed,
  } = options;

  // State
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentDelay, setCurrentDelay] = useState(initialDelay);

  // Refs for cleanup and tracking
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Clear any pending retry timeout
   */
  const clearRetryTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Reset retry state
   */
  const reset = useCallback(() => {
    clearRetryTimeout();
    setRetryCount(0);
    setIsRetrying(false);
    setCurrentDelay(initialDelay);
  }, [clearRetryTimeout, initialDelay]);

  /**
   * Calculate next delay with exponential backoff
   */
  const getNextDelay = useCallback(
    (currentCount: number): number => {
      // Exponential backoff: initialDelay * 2^count
      const delay = initialDelay * Math.pow(2, currentCount);
      return Math.min(delay, maxDelay);
    },
    [initialDelay, maxDelay]
  );

  /**
   * Perform a retry attempt
   */
  const performRetry = useCallback(async (): Promise<boolean> => {
    if (!isMountedRef.current) {
      return false;
    }

    setIsRetrying(true);

    try {
      const success = await retryFn();

      if (!isMountedRef.current) {
        return false;
      }

      if (success) {
        // Reset on success
        reset();
        onSuccess?.();
        return true;
      } else {
        setIsRetrying(false);
        return false;
      }
    } catch (error) {
      if (!isMountedRef.current) {
        return false;
      }

      setIsRetrying(false);
      onRetryFailed?.(error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }, [retryFn, reset, onSuccess, onRetryFailed]);

  /**
   * Schedule next retry with current delay
   */
  const scheduleRetry = useCallback(() => {
    if (!enabled || !isMountedRef.current) {
      return;
    }

    clearRetryTimeout();

    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) {
        return;
      }

      await performRetry();
    }, currentDelay);
  }, [enabled, currentDelay, clearRetryTimeout, performRetry]);

  /**
   * Signal a failure to trigger retry scheduling
   * Continues retrying even in Manual Mode per story requirements
   */
  const onFailure = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    // Increment retry count
    const newCount = retryCount + 1;
    setRetryCount(newCount);

    // Calculate next delay with exponential backoff
    const nextDelay = getNextDelay(newCount);
    setCurrentDelay(nextDelay);

    // Schedule next retry (even in Manual Mode)
    if (enabled) {
      scheduleRetry();
    }
  }, [retryCount, getNextDelay, enabled, scheduleRetry]);

  /**
   * Manual retry trigger
   */
  const retry = useCallback(async (): Promise<boolean> => {
    clearRetryTimeout();
    return performRetry();
  }, [clearRetryTimeout, performRetry]);

  // Cancel pending retry when disabled
  useEffect(() => {
    if (!enabled) {
      clearRetryTimeout();
    }
  }, [enabled, clearRetryTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearRetryTimeout();
    };
  }, [clearRetryTimeout]);

  return {
    retryCount,
    isRetrying,
    currentDelay,
    onFailure,
    retry,
    reset,
  };
}

export default useBackgroundRetry;
