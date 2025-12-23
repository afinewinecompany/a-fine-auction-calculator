/**
 * useDraftSync Hook
 *
 * Automatic polling hook for fetching draft updates from Couch Managers.
 * Runs when draft page is active and properly cleans up on unmount.
 *
 * Story: 9.3 - Implement Automatic API Polling
 * Updated: 9.7 - Implement Catch-Up Sync After Connection Restore
 * Updated: 10.1 - Detect API Connection Failures
 * Updated: 10.8 - Implement Graceful Degradation Pattern
 *
 * Features:
 * - Polling starts when draft page mounts
 * - Polling stops when draft page unmounts
 * - Calls sync Edge Function at configurable interval (default: 20 min)
 * - Incremental sync using lastSyncTimestamp
 * - Continues polling despite individual sync errors
 * - Proper cleanup with clearInterval
 * - Catch-up sync notification for multiple missed picks (Story 9.7)
 * - Inflation recalculation after sync (Story 9.7)
 * - 15 second timeout for catch-up sync (NFR-I6)
 * - Error classification and exponential backoff (Story 10.1)
 * - Manual sync mode after 3 consecutive failures (Story 10.1)
 * - Background retry continues even in Manual Mode (Story 10.8, NFR-R6)
 * - Seamless recovery when connection restores (Story 10.8)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast as sonnerToast } from 'sonner';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';
import { useDraftStore } from '../stores/draftStore';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { LEAGUE_VALIDATION } from '@/features/leagues/types/league.types';
import type {
  SyncStatus,
  SyncSuccessResponse,
  SyncErrorResponse,
  ConnectionState,
} from '../types/sync.types';
import { getConnectionState, DEFAULT_SYNC_STATUS } from '../types/sync.types';
import {
  classifyError,
  classifyEdgeFunctionError,
  shouldEnableManualMode,
} from '../utils/classifyError';
import {
  showErrorToast,
  showManualModeToast,
  showConnectionRestoredToast,
} from '../utils/showErrorToast';

/**
 * Threshold for showing catch-up notification (Story 9.7)
 * Only show if 3+ picks were synced at once
 */
const CATCH_UP_NOTIFICATION_THRESHOLD = 3;

/**
 * Timeout for catch-up sync in milliseconds (NFR-I6)
 * Catch-up sync must complete within 15 seconds
 */
const CATCH_UP_SYNC_TIMEOUT_MS = 15000;

/**
 * Failure detection timeout in milliseconds (NFR-R7)
 * Story 10.1: Failure detection must complete within 5 seconds
 */
const FAILURE_DETECTION_TIMEOUT_MS = 5000;

/**
 * Background retry delays in milliseconds (Story 10.8, NFR-R6)
 * Exponential backoff: 5s, 10s, 20s, 30s (max)
 * Max delay per NFR-R6: Auto-reconnect within 30 seconds
 */
const BACKGROUND_RETRY_INITIAL_DELAY_MS = 5000;
const BACKGROUND_RETRY_MAX_DELAY_MS = 30000;

/**
 * Hook return type
 */
export interface UseDraftSyncReturn {
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Derived connection state for UI display */
  connectionState: ConnectionState;
  /** Manually trigger a sync */
  triggerSync: () => Promise<void>;
  /** Last successful sync timestamp */
  lastSync: Date | null;
}

/**
 * Custom hook for automatic draft sync polling
 *
 * @param leagueId - The league ID to sync
 * @returns Sync status and manual trigger function
 *
 * @example
 * ```tsx
 * function DraftPage({ leagueId }: { leagueId: string }) {
 *   const { syncStatus, lastSync, triggerSync } = useDraftSync(leagueId);
 *
 *   return (
 *     <div>
 *       {syncStatus.isConnected && (
 *         <span className="text-emerald-400">Connected</span>
 *       )}
 *       {lastSync && (
 *         <span>Last synced: {formatDistanceToNow(lastSync)}</span>
 *       )}
 *       <button onClick={triggerSync}>Sync Now</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDraftSync(leagueId: string): UseDraftSyncReturn {
  // Get league data from store
  const league = useLeagueStore(state => state.leagues.find(l => l.id === leagueId));

  // Get draft store action for adding synced players
  const addDraftedPlayers = useDraftStore(state => state.addDraftedPlayers);

  // Get inflation store action for recalculation (Story 9.7)
  const updateInflation = useInflationStore(state => state.updateInflation);

  // Refs for mutable state that shouldn't trigger re-renders
  const lastSyncRef = useRef<Date | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // State for sync status (displayed in UI)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(DEFAULT_SYNC_STATUS);

  /**
   * Perform a sync operation
   * Fetches picks from Couch Managers via Edge Function
   *
   * Story 9.7 additions:
   * - 15 second timeout for catch-up sync (NFR-I6)
   * - Notification when multiple missed picks are synced
   * - Inflation recalculation after sync
   */
  const syncDraft = useCallback(async () => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('[useDraftSync] Supabase not configured');
      return;
    }

    // Check if we have a room ID to sync with
    // Note: The Edge Function expects auctionId but league stores it as couchManagersRoomId
    const auctionId = league?.couchManagersRoomId;
    if (!auctionId) {
      return;
    }

    // Update status to syncing
    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      isConnected: true,
    }));

    // Track sync start time for performance validation (NFR-I6)
    const syncStartTime = Date.now();

    try {
      const supabase = getSupabase();

      // Set up timeout warning for performance monitoring (Story 9.7 - NFR-I6)
      const timeoutId = setTimeout(() => {
        console.warn('[useDraftSync] Catch-up sync timeout exceeded 15 seconds (NFR-I6)');
      }, CATCH_UP_SYNC_TIMEOUT_MS);

      // Call the sync Edge Function
      const { data, error } = await supabase.functions.invoke<
        SyncSuccessResponse | SyncErrorResponse
      >('sync-couch-managers', {
        body: {
          auctionId,
          leagueId,
          lastSyncTimestamp: lastSyncRef.current?.toISOString(),
        },
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      // Log sync duration for performance monitoring (NFR-I6)
      const syncDuration = Date.now() - syncStartTime;
      if (syncDuration > CATCH_UP_SYNC_TIMEOUT_MS) {
        console.warn(
          `[useDraftSync] Sync completed in ${syncDuration}ms, exceeded 15 second threshold (NFR-I6)`
        );
      }

      // Check if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      // Handle Supabase function invoke error
      // Story 10.1: Classify error and handle appropriately
      if (error) {
        const failureDetectionStart = Date.now();
        const classification = classifyError(error, syncStatus.failureCount);
        const failureDetectionTime = Date.now() - failureDetectionStart;

        // Log performance for NFR-R7 (failure detection within 5 seconds)
        if (failureDetectionTime > FAILURE_DETECTION_TIMEOUT_MS) {
          console.warn(
            `[useDraftSync] Failure detection took ${failureDetectionTime}ms, exceeded 5 second threshold (NFR-R7)`
          );
        }

        console.error('[useDraftSync] Function invoke error:', error.message, {
          classification: classification.type,
          shouldRetry: classification.shouldRetry,
        });

        const newFailureCount = syncStatus.failureCount + 1;
        const shouldTriggerManualMode = shouldEnableManualMode(classification, newFailureCount);

        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          error: classification.displayMessage,
          failureCount: newFailureCount,
          failureType: classification.type,
          lastFailureTimestamp: new Date(),
          isManualMode: shouldTriggerManualMode,
          isConnected: false,
        }));

        // Story 10.6: Show error toast with user-friendly message
        showErrorToast({
          errorCode: classification.errorCode,
          failureType: classification.type,
          classification,
          failureCount: newFailureCount,
          retryDelayMs: classification.retryDelayMs,
          onRetry: () => syncDraft(),
          onManualModeHelp: () => {
            window.dispatchEvent(new CustomEvent('open-manual-mode-help'));
          },
        });

        // Story 10.8: Schedule background retry with exponential backoff
        // Continues retrying even in Manual Mode (NFR-R6)
        if (classification.shouldRetry && isMountedRef.current) {
          // Calculate delay with exponential backoff, capped at max
          const delay = Math.min(
            BACKGROUND_RETRY_INITIAL_DELAY_MS * Math.pow(2, newFailureCount - 1),
            BACKGROUND_RETRY_MAX_DELAY_MS
          );
          console.log(
            `[useDraftSync] Scheduling background retry in ${delay}ms (attempt ${newFailureCount})${shouldTriggerManualMode ? ' [Manual Mode active]' : ''}`
          );
          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              syncDraft();
            }
          }, delay);
        }

        // Story 10.6: Show manual mode notification (but don't stop retries)
        if (shouldTriggerManualMode) {
          console.warn('[useDraftSync] Manual sync mode triggered, background retries continue');
          showManualModeToast(() => {
            window.dispatchEvent(new CustomEvent('open-manual-mode-help'));
          });
        }

        return;
      }

      // Handle Edge Function error response
      // Story 10.1: Use error classification for structured error response
      if (!data || !data.success) {
        const failureDetectionStart = Date.now();
        const errorData = data as SyncErrorResponse | undefined;

        // Use classifyEdgeFunctionError for structured error responses
        const classification = errorData
          ? classifyEdgeFunctionError(errorData, syncStatus.failureCount)
          : classifyError('Unknown sync error', syncStatus.failureCount);

        const failureDetectionTime = Date.now() - failureDetectionStart;

        // Log performance for NFR-R7
        if (failureDetectionTime > FAILURE_DETECTION_TIMEOUT_MS) {
          console.warn(
            `[useDraftSync] Failure detection took ${failureDetectionTime}ms, exceeded 5 second threshold (NFR-R7)`
          );
        }

        console.error('[useDraftSync] Sync failed:', classification.displayMessage, {
          classification: classification.type,
          errorCode: classification.errorCode,
        });

        const newFailureCount = syncStatus.failureCount + 1;
        const shouldTriggerManualMode = shouldEnableManualMode(classification, newFailureCount);

        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          error: classification.displayMessage,
          failureCount: newFailureCount,
          failureType: classification.type,
          lastFailureTimestamp: new Date(),
          isManualMode: shouldTriggerManualMode,
          isConnected: false,
        }));

        // Story 10.6: Show error toast with user-friendly message
        showErrorToast({
          errorCode: classification.errorCode,
          failureType: classification.type,
          classification,
          failureCount: newFailureCount,
          retryDelayMs: classification.retryDelayMs,
          onRetry: () => syncDraft(),
          onManualModeHelp: () => {
            window.dispatchEvent(new CustomEvent('open-manual-mode-help'));
          },
        });

        // Story 10.8: Schedule background retry with exponential backoff
        // Continues retrying even in Manual Mode (NFR-R6)
        if (classification.shouldRetry && isMountedRef.current) {
          // Calculate delay with exponential backoff, capped at max
          const delay = Math.min(
            BACKGROUND_RETRY_INITIAL_DELAY_MS * Math.pow(2, newFailureCount - 1),
            BACKGROUND_RETRY_MAX_DELAY_MS
          );
          console.log(
            `[useDraftSync] Scheduling background retry in ${delay}ms (attempt ${newFailureCount})${shouldTriggerManualMode ? ' [Manual Mode active]' : ''}`
          );
          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              syncDraft();
            }
          }, delay);
        }

        // Story 10.6: Show manual mode notification (but don't stop retries)
        if (shouldTriggerManualMode) {
          console.warn('[useDraftSync] Manual sync mode triggered, background retries continue');
          showManualModeToast(() => {
            window.dispatchEvent(new CustomEvent('open-manual-mode-help'));
          });
        }

        return;
      }

      // Success - process the picks
      const successData = data as SyncSuccessResponse;
      const picksCount = successData.picks?.length ?? 0;

      // Update draft store with new picks
      if (successData.picks && picksCount > 0) {
        addDraftedPlayers(leagueId, successData.picks);

        // Story 9.7: Show catch-up notification if multiple picks synced
        if (picksCount >= CATCH_UP_NOTIFICATION_THRESHOLD) {
          sonnerToast.success(`Synced ${picksCount} missed picks`, {
            description: 'Draft state updated with all missed picks',
          });
        }

        // Story 9.7: Trigger inflation recalculation after adding new picks
        // Get current draft state to recalculate inflation
        const draftState = useDraftStore.getState().drafts[leagueId];
        if (draftState) {
          // Convert drafted players to inflation input format
          const inflationDraftedPlayers = draftState.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
          }));

          // Calculate budget context for depletion factor
          const totalRosterSpots = draftState.roster.length;
          const filledSlots = draftState.roster.filter(s => s.playerId !== null).length;
          const budgetContext = {
            totalBudget: draftState.initialBudget,
            spent: draftState.initialBudget - draftState.remainingBudget,
            totalRosterSpots,
            slotsRemaining: totalRosterSpots - filledSlots,
          };

          // Recalculate inflation with new picks
          // Note: projections would come from projections store in a full implementation
          // For now, pass empty array - inflation calculations handle missing data gracefully
          updateInflation(inflationDraftedPlayers, [], budgetContext);
        }
      }

      // Update last sync timestamp
      const syncTime = new Date(successData.syncTimestamp);
      lastSyncRef.current = syncTime;

      // Story 10.6: Show connection restored toast if recovering from failures
      const wasInFailureState = syncStatus.failureCount > 0 || syncStatus.isManualMode;
      if (wasInFailureState) {
        showConnectionRestoredToast();
      }

      // Update status to success
      // Story 10.1: Reset all failure tracking on successful sync
      setSyncStatus({
        isConnected: true,
        isSyncing: false,
        lastSync: syncTime,
        error: null,
        failureCount: 0,
        failureType: null,
        isManualMode: false,
        lastFailureTimestamp: null,
      });
    } catch (err) {
      // Network or unexpected error
      // Story 10.1: Classify caught errors
      const failureDetectionStart = Date.now();
      const classification = classifyError(
        err instanceof Error ? err : String(err),
        syncStatus.failureCount
      );
      const failureDetectionTime = Date.now() - failureDetectionStart;

      // Log performance for NFR-R7
      if (failureDetectionTime > FAILURE_DETECTION_TIMEOUT_MS) {
        console.warn(
          `[useDraftSync] Failure detection took ${failureDetectionTime}ms, exceeded 5 second threshold (NFR-R7)`
        );
      }

      console.error('[useDraftSync] Unexpected error:', classification.displayMessage, {
        classification: classification.type,
      });

      if (isMountedRef.current) {
        const newFailureCount = syncStatus.failureCount + 1;
        const shouldTriggerManualMode = shouldEnableManualMode(classification, newFailureCount);

        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          error: classification.displayMessage,
          failureCount: newFailureCount,
          failureType: classification.type,
          lastFailureTimestamp: new Date(),
          isManualMode: shouldTriggerManualMode,
          isConnected: false,
        }));

        // Story 10.6: Show error toast with user-friendly message
        showErrorToast({
          errorCode: classification.errorCode,
          failureType: classification.type,
          classification,
          failureCount: newFailureCount,
          retryDelayMs: classification.retryDelayMs,
          onRetry: () => syncDraft(),
          onManualModeHelp: () => {
            window.dispatchEvent(new CustomEvent('open-manual-mode-help'));
          },
        });

        // Story 10.8: Schedule background retry with exponential backoff
        // Continues retrying even in Manual Mode (NFR-R6)
        if (classification.shouldRetry) {
          // Calculate delay with exponential backoff, capped at max
          const delay = Math.min(
            BACKGROUND_RETRY_INITIAL_DELAY_MS * Math.pow(2, newFailureCount - 1),
            BACKGROUND_RETRY_MAX_DELAY_MS
          );
          console.log(
            `[useDraftSync] Scheduling background retry in ${delay}ms (attempt ${newFailureCount})${shouldTriggerManualMode ? ' [Manual Mode active]' : ''}`
          );
          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              syncDraft();
            }
          }, delay);
        }

        // Story 10.6: Show manual mode notification (but don't stop retries)
        if (shouldTriggerManualMode) {
          console.warn('[useDraftSync] Manual sync mode triggered, background retries continue');
          showManualModeToast(() => {
            window.dispatchEvent(new CustomEvent('open-manual-mode-help'));
          });
        }
      }
    }
  }, [league?.couchManagersRoomId, leagueId, addDraftedPlayers, updateInflation]);

  /**
   * Effect for managing the polling interval
   *
   * - Starts polling when component mounts (if room ID exists)
   * - Stops polling when component unmounts
   * - Restarts polling if room ID or sync interval changes
   */
  useEffect(() => {
    isMountedRef.current = true;

    // Only poll if league has Couch Managers room ID
    if (!league?.couchManagersRoomId) {
      // No connection - reset status
      setSyncStatus(DEFAULT_SYNC_STATUS);
      return;
    }

    // Calculate interval in milliseconds
    // Default to 20 minutes if not set (NFR-I4)
    const intervalMinutes = league.syncInterval ?? LEAGUE_VALIDATION.syncInterval.default;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Initial sync on mount
    syncDraft();

    // Set up polling interval
    intervalIdRef.current = setInterval(syncDraft, intervalMs);

    // Cleanup on unmount or when dependencies change
    // Story 10.1: Also clear retry timeout
    return () => {
      isMountedRef.current = false;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [league?.couchManagersRoomId, league?.syncInterval, leagueId, syncDraft]);

  /**
   * Manual trigger for sync (e.g., "Sync Now" button)
   * Useful for Story 9.6 - Manual Reconnection Trigger
   */
  const triggerSync = useCallback(async () => {
    await syncDraft();
  }, [syncDraft]);

  return {
    syncStatus,
    connectionState: getConnectionState(syncStatus),
    triggerSync,
    lastSync: lastSyncRef.current,
  };
}
