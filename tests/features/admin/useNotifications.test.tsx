/**
 * useNotifications Hook Tests
 *
 * Tests for the user-side notification polling hook.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Notification } from '@/features/admin/types/admin.types';

// Mock the service
const mockGetUserNotifications = vi.fn();

vi.mock('@/features/admin/services/notificationService', () => ({
  getUserNotifications: (...args: unknown[]) => mockGetUserNotifications(...args),
}));

// Mock sonner toast - must be defined inline to work with hoisting
vi.mock('sonner', () => {
  const mockInfo = vi.fn();
  const mockWarning = vi.fn();
  const mockError = vi.fn();
  const mockDefault = vi.fn();

  return {
    toast: Object.assign(mockDefault, {
      info: mockInfo,
      warning: mockWarning,
      error: mockError,
    }),
  };
});

// Import toast mock after setting up mock
import { toast } from 'sonner';

// Import hook after mocks are set up
import { useNotifications } from '@/features/admin/hooks/useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserNotifications.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return checkForNotifications function', () => {
    const { result } = renderHook(() => useNotifications(false));

    expect(typeof result.current.checkForNotifications).toBe('function');
  });

  it('should show toast for info notification', async () => {
    const mockNotification: Notification = {
      id: 'notif-1',
      title: 'Info Alert',
      message: 'This is an info message',
      type: 'info',
      targetUserId: null,
      sentBy: 'admin-1',
      sentAt: new Date().toISOString(),
    };

    mockGetUserNotifications.mockResolvedValueOnce([mockNotification]);

    const { result } = renderHook(() => useNotifications(false));

    // Manually check for notifications
    await act(async () => {
      await result.current.checkForNotifications();
    });

    expect(toast.info).toHaveBeenCalledWith('Info Alert', {
      description: 'This is an info message',
      duration: 8000,
    });
  });

  it('should show toast for warning notification', async () => {
    const mockNotification: Notification = {
      id: 'notif-2',
      title: 'Warning Alert',
      message: 'This is a warning message',
      type: 'warning',
      targetUserId: null,
      sentBy: 'admin-1',
      sentAt: new Date().toISOString(),
    };

    mockGetUserNotifications.mockResolvedValueOnce([mockNotification]);

    const { result } = renderHook(() => useNotifications(false));

    await act(async () => {
      await result.current.checkForNotifications();
    });

    expect(toast.warning).toHaveBeenCalledWith('Warning Alert', {
      description: 'This is a warning message',
      duration: 8000,
    });
  });

  it('should show toast for error notification', async () => {
    const mockNotification: Notification = {
      id: 'notif-3',
      title: 'Error Alert',
      message: 'This is an error message',
      type: 'error',
      targetUserId: null,
      sentBy: 'admin-1',
      sentAt: new Date().toISOString(),
    };

    mockGetUserNotifications.mockResolvedValueOnce([mockNotification]);

    const { result } = renderHook(() => useNotifications(false));

    await act(async () => {
      await result.current.checkForNotifications();
    });

    expect(toast.error).toHaveBeenCalledWith('Error Alert', {
      description: 'This is an error message',
      duration: 8000,
    });
  });

  it('should not show duplicate toasts for same notification', async () => {
    const mockNotification: Notification = {
      id: 'notif-unique',
      title: 'Unique Alert',
      message: 'This should only appear once',
      type: 'info',
      targetUserId: null,
      sentBy: 'admin-1',
      sentAt: new Date().toISOString(),
    };

    // Return same notification twice
    mockGetUserNotifications
      .mockResolvedValueOnce([mockNotification])
      .mockResolvedValueOnce([mockNotification]);

    const { result } = renderHook(() => useNotifications(false));

    // First check
    await act(async () => {
      await result.current.checkForNotifications();
    });

    expect(toast.info).toHaveBeenCalledTimes(1);

    // Second check - same notification ID
    await act(async () => {
      await result.current.checkForNotifications();
    });

    // Should still only have 1 toast call
    expect(toast.info).toHaveBeenCalledTimes(1);
  });

  it('should show toasts for multiple different notifications', async () => {
    const mockNotifications: Notification[] = [
      {
        id: 'notif-a',
        title: 'Alert A',
        message: 'Message A',
        type: 'info',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: new Date().toISOString(),
      },
      {
        id: 'notif-b',
        title: 'Alert B',
        message: 'Message B',
        type: 'warning',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: new Date().toISOString(),
      },
    ];

    mockGetUserNotifications.mockResolvedValueOnce(mockNotifications);

    const { result } = renderHook(() => useNotifications(false));

    await act(async () => {
      await result.current.checkForNotifications();
    });

    expect(toast.info).toHaveBeenCalledWith('Alert A', expect.any(Object));
    expect(toast.warning).toHaveBeenCalledWith('Alert B', expect.any(Object));
  });

  it('should handle fetch errors silently', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockGetUserNotifications.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useNotifications(false));

    // Should not throw
    await act(async () => {
      await result.current.checkForNotifications();
    });

    // Should log error but not crash
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to check for notifications:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should pass since parameter to getUserNotifications', async () => {
    mockGetUserNotifications.mockResolvedValue([]);

    const { result } = renderHook(() => useNotifications(false));

    // First call - no since parameter (undefined)
    await act(async () => {
      await result.current.checkForNotifications();
    });

    // After first call, lastCheckTime should be set, so subsequent calls use since
    expect(mockGetUserNotifications).toHaveBeenCalledWith(undefined, 10);

    // Second call should have a since parameter
    await act(async () => {
      await result.current.checkForNotifications();
    });

    // The second call should have a timestamp string
    expect(mockGetUserNotifications).toHaveBeenCalledTimes(2);
    const secondCallArgs = mockGetUserNotifications.mock.calls[1];
    expect(typeof secondCallArgs[0]).toBe('string'); // ISO timestamp
    expect(secondCallArgs[1]).toBe(10);
  });
});
