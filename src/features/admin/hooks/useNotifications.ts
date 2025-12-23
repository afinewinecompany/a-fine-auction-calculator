/**
 * useNotifications Hook (User Side)
 *
 * Polls for new notifications and displays them as toast notifications.
 * This hook should be used in the main app layout to ensure users
 * receive notifications regardless of which page they're on.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 *
 * @example
 * ```tsx
 * // In AppLayout or similar root component
 * function AppLayout() {
 *   useNotifications(); // Starts polling and displays toasts
 *   return <Outlet />;
 * }
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { getUserNotifications } from '../services/notificationService';
import type { Notification } from '../types/admin.types';

/** Polling interval: 30 seconds */
const POLLING_INTERVAL = 30000;

/**
 * Show a toast notification with appropriate styling based on type
 */
function showNotificationToast(notification: Notification) {
  const toastOptions = {
    description: notification.message,
    duration: 8000, // 8 seconds for admin notifications
  };

  switch (notification.type) {
    case 'info':
      toast.info(notification.title, toastOptions);
      break;
    case 'warning':
      toast.warning(notification.title, toastOptions);
      break;
    case 'error':
      toast.error(notification.title, toastOptions);
      break;
    default:
      toast(notification.title, toastOptions);
  }
}

/**
 * Return type for useNotifications hook
 */
export interface UseNotificationsResult {
  /** Manually check for new notifications */
  checkForNotifications: () => Promise<void>;
}

/**
 * Hook for polling user notifications and displaying them as toasts
 *
 * @param enabled - Whether to enable polling (default: true)
 * @returns Object with manual check function
 */
export function useNotifications(enabled: boolean = true): UseNotificationsResult {
  // Track the timestamp of the last notification we've seen
  const lastCheckTime = useRef<string | null>(null);
  // Track notification IDs we've already displayed to avoid duplicates
  const displayedIds = useRef<Set<string>>(new Set());

  const checkForNotifications = useCallback(async () => {
    try {
      // Fetch notifications since last check (or recent ones if first check)
      const notifications = await getUserNotifications(lastCheckTime.current ?? undefined, 10);

      // Update last check time to now
      lastCheckTime.current = new Date().toISOString();

      // Display new notifications that we haven't shown yet
      for (const notification of notifications) {
        if (!displayedIds.current.has(notification.id)) {
          displayedIds.current.add(notification.id);
          showNotificationToast(notification);
        }
      }

      // Cleanup: keep only the last 100 notification IDs to prevent memory growth
      if (displayedIds.current.size > 100) {
        const idsArray = Array.from(displayedIds.current);
        displayedIds.current = new Set(idsArray.slice(-50));
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience for notification polling errors
      console.error('Failed to check for notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Set initial last check time to now (don't show old notifications on first load)
    // Wait a moment then do first check, so we don't spam with old notifications
    const initTimeout = setTimeout(() => {
      lastCheckTime.current = new Date().toISOString();
    }, 1000);

    // Set up polling interval
    const intervalId = setInterval(() => {
      checkForNotifications();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      clearTimeout(initTimeout);
      clearInterval(intervalId);
    };
  }, [enabled, checkForNotifications]);

  return {
    checkForNotifications,
  };
}
