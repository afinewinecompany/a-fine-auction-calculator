/**
 * RetryConnectionButton Component Tests
 *
 * Tests for the manual reconnection trigger button.
 * Verifies button visibility, click behavior, loading state, and toast feedback.
 *
 * Story: 9.6 - Implement Manual Reconnection Trigger
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RetryConnectionButton } from '@/features/draft/components/RetryConnectionButton';
import type { ConnectionState } from '@/features/draft/types/sync.types';

// Mock useToast hook
const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
    toast: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

describe('RetryConnectionButton', () => {
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRetry.mockResolvedValue(undefined);
  });

  describe('Visibility', () => {
    it('does not render when status is connected', () => {
      render(
        <RetryConnectionButton
          status="connected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders when status is disconnected', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();
    });

    it('renders when status is reconnecting', () => {
      render(
        <RetryConnectionButton
          status="reconnecting"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();
    });
  });

  describe('Click Behavior', () => {
    it('calls onRetry when clicked', async () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('shows success toast on successful retry', async () => {
      mockOnRetry.mockResolvedValue(undefined);

      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith(
          'Connection Restored',
          'Successfully reconnected to Couch Managers'
        );
      });
    });

    it('shows error toast on failed retry', async () => {
      mockOnRetry.mockRejectedValue(new Error('Network timeout'));

      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
          lastError="Previous sync failed"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith(
          'Reconnection Failed',
          'Previous sync failed'
        );
      });
    });

    it('shows error message from exception when no lastError', async () => {
      mockOnRetry.mockRejectedValue(new Error('Network timeout'));

      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith(
          'Reconnection Failed',
          'Network timeout'
        );
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading text when syncing', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={true}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    });

    it('disables button when syncing', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={true}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('has correct aria-label when syncing', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={true}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByLabelText('Reconnecting...')).toBeInTheDocument();
    });

    it('has correct aria-label when not syncing', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByLabelText('Retry connection')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('includes icon with aria-hidden', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Styling', () => {
    it('has spinning icon when syncing', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={true}
          onRetry={mockOnRetry}
        />
      );

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('animate-spin');
    });

    it('does not have spinning icon when not syncing', () => {
      render(
        <RetryConnectionButton
          status="disconnected"
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).not.toHaveClass('animate-spin');
    });
  });

  describe('All Connection States', () => {
    const connectionStates: ConnectionState[] = ['connected', 'reconnecting', 'disconnected'];

    it.each(connectionStates)('handles %s state correctly', (status) => {
      render(
        <RetryConnectionButton
          status={status}
          isSyncing={false}
          onRetry={mockOnRetry}
        />
      );

      if (status === 'connected') {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      } else {
        expect(screen.getByRole('button')).toBeInTheDocument();
      }
    });
  });
});
