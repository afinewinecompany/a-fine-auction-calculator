/**
 * useNotificationHistory Hook
 *
 * Provides notification history data for the admin dashboard.
 * Fetches sent notifications with sender and target user information.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 *
 * @example
 * ```tsx
 * const { notifications, loading, error, refetch } = useNotificationHistory();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { getNotificationHistory } from '../services/notificationService';
import type { NotificationHistoryItem } from '../types/admin.types';

/** Polling interval: 60 seconds */
const POLLING_INTERVAL = 60000;

/**
 * Return type for useNotificationHistory hook
 */
export interface UseNotificationHistoryResult {
  /** Array of notification history items */
  notifications: NotificationHistoryItem[];
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching notification history with automatic polling
 */
export function useNotificationHistory(): UseNotificationHistoryResult {
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await getNotificationHistory(50);
      setNotifications(history);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchHistory();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchHistory();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchHistory]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchHistory,
  };
}
