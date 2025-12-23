/**
 * useNotificationHistory Hook Tests
 *
 * Tests for the notification history hook used in the admin dashboard.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotificationHistory } from '@/features/admin/hooks/useNotificationHistory';
import type { NotificationHistoryItem } from '@/features/admin/types/admin.types';

// Mock the service
const mockGetNotificationHistory = vi.fn();

vi.mock('@/features/admin/services/notificationService', () => ({
  getNotificationHistory: (...args: unknown[]) => mockGetNotificationHistory(...args),
}));

describe('useNotificationHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNotificationHistory.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useNotificationHistory());

    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should fetch notifications on mount', async () => {
    const mockNotifications: NotificationHistoryItem[] = [
      {
        id: 'notif-1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: '2024-01-15T10:00:00Z',
        senderEmail: 'admin@example.com',
        targetEmail: null,
      },
    ];

    mockGetNotificationHistory.mockResolvedValueOnce(mockNotifications);

    const { result } = renderHook(() => useNotificationHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.error).toBeNull();
    expect(mockGetNotificationHistory).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    mockGetNotificationHistory.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useNotificationHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.notifications).toEqual([]);
  });

  it('should provide manual refetch function', async () => {
    mockGetNotificationHistory.mockResolvedValue([]);

    const { result } = renderHook(() => useNotificationHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetNotificationHistory).toHaveBeenCalledTimes(1);

    // Manually refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetNotificationHistory).toHaveBeenCalledTimes(2);
  });

  it('should update notifications after refetch', async () => {
    const initialNotifications: NotificationHistoryItem[] = [];
    const updatedNotifications: NotificationHistoryItem[] = [
      {
        id: 'notif-new',
        title: 'New Notification',
        message: 'A new message',
        type: 'warning',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: '2024-01-15T11:00:00Z',
      },
    ];

    mockGetNotificationHistory
      .mockResolvedValueOnce(initialNotifications)
      .mockResolvedValueOnce(updatedNotifications);

    const { result } = renderHook(() => useNotificationHistory());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual([]);

    // Refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.notifications).toEqual(updatedNotifications);
  });

  it('should clear error after successful fetch', async () => {
    // First call fails
    mockGetNotificationHistory.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useNotificationHistory());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Second call succeeds
    mockGetNotificationHistory.mockResolvedValueOnce([]);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
  });
});
