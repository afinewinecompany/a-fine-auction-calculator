/**
 * BroadcastNotificationDialog Component Tests
 *
 * Tests for the admin notification broadcast dialog.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BroadcastNotificationDialog } from '@/features/admin/components/BroadcastNotificationDialog';

// Mock the notification service
vi.mock('@/features/admin/services/notificationService', () => ({
  broadcastNotification: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { broadcastNotification } from '@/features/admin/services/notificationService';
import { toast } from 'sonner';

const mockBroadcastNotification = vi.mocked(broadcastNotification);
const mockToast = vi.mocked(toast);

describe('BroadcastNotificationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the broadcast button', () => {
    render(<BroadcastNotificationDialog />);

    expect(screen.getByRole('button', { name: /broadcast notification/i })).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(<BroadcastNotificationDialog />);

    await user.click(screen.getByRole('button', { name: /broadcast notification/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('should show validation error when title is empty', async () => {
    const user = userEvent.setup();
    render(<BroadcastNotificationDialog />);

    await user.click(screen.getByRole('button', { name: /broadcast notification/i }));

    // Fill only message, leave title empty
    await user.type(screen.getByLabelText(/message/i), 'Test message');

    // The send button should be disabled when title is empty
    const sendButton = screen.getByRole('button', { name: /send notification/i });
    expect(sendButton).toBeDisabled();
  });

  it('should show validation error when message is empty', async () => {
    const user = userEvent.setup();
    render(<BroadcastNotificationDialog />);

    await user.click(screen.getByRole('button', { name: /broadcast notification/i }));

    // Fill only title, leave message empty
    await user.type(screen.getByLabelText(/title/i), 'Test title');

    // The send button should be disabled when message is empty
    const sendButton = screen.getByRole('button', { name: /send notification/i });
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when title and message are filled', async () => {
    const user = userEvent.setup();
    render(<BroadcastNotificationDialog />);

    await user.click(screen.getByRole('button', { name: /broadcast notification/i }));

    await user.type(screen.getByLabelText(/title/i), 'Test title');
    await user.type(screen.getByLabelText(/message/i), 'Test message');

    const sendButton = screen.getByRole('button', { name: /send notification/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('should send notification successfully', async () => {
    const user = userEvent.setup();
    const onNotificationSent = vi.fn();

    mockBroadcastNotification.mockResolvedValueOnce({
      id: 'notif-1',
      title: 'Test title',
      message: 'Test message',
      type: 'info',
      targetUserId: null,
      sentBy: 'admin-1',
      sentAt: '2024-01-15T10:00:00Z',
    });

    render(<BroadcastNotificationDialog onNotificationSent={onNotificationSent} />);

    await user.click(screen.getByRole('button', { name: /broadcast notification/i }));

    await user.type(screen.getByLabelText(/title/i), 'Test title');
    await user.type(screen.getByLabelText(/message/i), 'Test message');
    await user.click(screen.getByRole('button', { name: /send notification/i }));

    await waitFor(() => {
      expect(mockBroadcastNotification).toHaveBeenCalledWith({
        title: 'Test title',
        message: 'Test message',
        type: 'info',
        targetEmail: null,
      });
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Notification sent to all users');
    });

    expect(onNotificationSent).toHaveBeenCalled();
  });

  it('should handle send error', async () => {
    const user = userEvent.setup();

    mockBroadcastNotification.mockRejectedValueOnce(new Error('Failed to send'));

    render(<BroadcastNotificationDialog />);

    await user.click(screen.getByRole('button', { name: /broadcast notification/i }));

    await user.type(screen.getByLabelText(/title/i), 'Test title');
    await user.type(screen.getByLabelText(/message/i), 'Test message');
    await user.click(screen.getByRole('button', { name: /send notification/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to send');
    });
  });

  it('should close dialog on cancel', async () => {
    const user = userEvent.setup();
    render(<BroadcastNotificationDialog />);

    await user.click(screen.getByRole('button', { name: /broadcast notification/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should display character count for message', async () => {
    const user = userEvent.setup();
    render(<BroadcastNotificationDialog />);

    await user.click(screen.getByRole('button', { name: /broadcast notification/i }));

    const message = 'Test message';
    await user.type(screen.getByLabelText(/message/i), message);

    expect(screen.getByText(`${message.length}/500 characters`)).toBeInTheDocument();
  });
});
