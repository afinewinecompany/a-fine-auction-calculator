/**
 * NotificationHistoryWidget Component Tests
 *
 * Tests for the admin notification history widget.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationHistoryWidget } from '@/features/admin/components/NotificationHistoryWidget';
import type { NotificationHistoryItem } from '@/features/admin/types/admin.types';

// Mock the hook
const mockRefetch = vi.fn();
let mockNotifications: NotificationHistoryItem[] = [];
let mockLoading = false;
let mockError: string | null = null;

vi.mock('@/features/admin/hooks/useNotificationHistory', () => ({
  useNotificationHistory: () => ({
    notifications: mockNotifications,
    loading: mockLoading,
    error: mockError,
    refetch: mockRefetch,
  }),
}));

// Mock the BroadcastNotificationDialog
vi.mock('@/features/admin/components/BroadcastNotificationDialog', () => ({
  BroadcastNotificationDialog: ({ onNotificationSent }: { onNotificationSent?: () => void }) => (
    <button onClick={onNotificationSent} data-testid="mock-broadcast-dialog">
      Broadcast Notification
    </button>
  ),
}));

describe('NotificationHistoryWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotifications = [];
    mockLoading = false;
    mockError = null;
  });

  it('should render widget with title', () => {
    render(<NotificationHistoryWidget />);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    mockLoading = true;

    render(<NotificationHistoryWidget />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should show empty state when no notifications', () => {
    mockNotifications = [];
    mockLoading = false;

    render(<NotificationHistoryWidget />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No notifications sent yet')).toBeInTheDocument();
  });

  it('should show error message when error occurs', () => {
    mockError = 'Failed to fetch notifications';

    render(<NotificationHistoryWidget />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch notifications')).toBeInTheDocument();
  });

  it('should render notification cards', () => {
    mockNotifications = [
      {
        id: 'notif-1',
        title: 'System Alert',
        message: 'Important system message',
        type: 'warning',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: new Date().toISOString(),
        senderEmail: 'admin@example.com',
        targetEmail: null,
      },
      {
        id: 'notif-2',
        title: 'User Notice',
        message: 'A notice for a specific user',
        type: 'info',
        targetUserId: 'user-1',
        sentBy: 'admin-1',
        sentAt: new Date().toISOString(),
        senderEmail: 'admin@example.com',
        targetEmail: 'user@example.com',
      },
    ];

    render(<NotificationHistoryWidget />);

    expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
    expect(screen.getByText('System Alert')).toBeInTheDocument();
    expect(screen.getByText('User Notice')).toBeInTheDocument();
    expect(screen.getByText('Important system message')).toBeInTheDocument();
    expect(screen.getByText('All users')).toBeInTheDocument();
    expect(screen.getByText(/To: user@example.com/)).toBeInTheDocument();
  });

  it('should show notification count badge', () => {
    mockNotifications = [
      {
        id: 'notif-1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: new Date().toISOString(),
        senderEmail: 'admin@example.com',
        targetEmail: null,
      },
    ];

    render(<NotificationHistoryWidget />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should call refetch when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationHistoryWidget />);

    const refreshButton = screen.getByTestId('refresh-button');
    await user.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should render broadcast notification dialog', () => {
    render(<NotificationHistoryWidget />);

    expect(screen.getByTestId('mock-broadcast-dialog')).toBeInTheDocument();
  });

  it('should show footer with notification count', () => {
    mockNotifications = [
      {
        id: 'notif-1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        title: 'Test 2',
        message: 'Test message 2',
        type: 'warning',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: new Date().toISOString(),
      },
    ];

    render(<NotificationHistoryWidget />);

    expect(screen.getByText('Showing 2 notifications')).toBeInTheDocument();
    expect(screen.getByText('Auto-refreshes every minute')).toBeInTheDocument();
  });

  it('should format timestamp correctly for recent notifications', () => {
    const now = new Date();
    mockNotifications = [
      {
        id: 'notif-1',
        title: 'Recent Alert',
        message: 'Very recent message',
        type: 'info',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: now.toISOString(),
      },
    ];

    render(<NotificationHistoryWidget />);

    // Should show "Just now" or similar recent time - title matches this regex too
    // so we use getAllByText and check that at least one element exists
    const timestampElements = screen.getAllByText(/just now/i);
    expect(timestampElements.length).toBeGreaterThan(0);
  });
});
