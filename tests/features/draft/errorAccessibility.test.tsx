/**
 * Accessibility Tests for Error Messages
 *
 * Story: 10.6 - Display Clear Error Messages
 *
 * Tests:
 * - Screen reader announcements (ARIA live regions)
 * - Keyboard navigation for action buttons
 * - Focus management
 * - Color is not the only indicator (icons + text)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorNotification } from '@/features/draft/components/ErrorNotification';
import { PersistentErrorBanner } from '@/features/draft/components/PersistentErrorBanner';
import type { SyncStatus } from '@/features/draft/types/sync.types';

// Default sync status with error
const createSyncStatus = (overrides: Partial<SyncStatus> = {}): SyncStatus => ({
  isConnected: false,
  isSyncing: false,
  lastSync: null,
  error: 'Network connection failed.',
  failureCount: 2,
  failureType: 'transient',
  isManualMode: false,
  lastFailureTimestamp: new Date(),
  ...overrides,
});

describe('Error Message Accessibility', () => {
  describe('Screen Reader Announcements', () => {
    it('ErrorNotification has role="alert" for immediate announcement', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('role', 'alert');
    });

    it('ErrorNotification has aria-live="assertive" for high priority', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('aria-live', 'assertive');
    });

    it('ErrorNotification has aria-atomic="true" for complete reading', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('aria-atomic', 'true');
    });

    it('PersistentErrorBanner has role="alert"', () => {
      render(
        <PersistentErrorBanner
          syncStatus={createSyncStatus()}
          onRetry={vi.fn()}
          onManualModeHelp={vi.fn()}
        />
      );

      const banner = screen.getByTestId('persistent-error-banner');
      expect(banner).toHaveAttribute('role', 'alert');
    });

    it('PersistentErrorBanner has aria-live="polite" for non-intrusive update', () => {
      render(
        <PersistentErrorBanner
          syncStatus={createSyncStatus()}
          onRetry={vi.fn()}
          onManualModeHelp={vi.fn()}
        />
      );

      const banner = screen.getByTestId('persistent-error-banner');
      expect(banner).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Keyboard Navigation', () => {
    it('action buttons are focusable with keyboard', async () => {
      const user = userEvent.setup();
      render(
        <ErrorNotification
          errorCode="NETWORK_ERROR"
          onRetry={vi.fn()}
          onDismiss={vi.fn()}
          onManualModeHelp={vi.fn()}
        />
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByTestId('error-dismiss-button')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('error-retry-button')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('error-manual-mode-button')).toHaveFocus();
    });

    it('retry button can be activated with Enter key', async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      render(
        <ErrorNotification errorCode="TIMEOUT" onRetry={onRetry} />
      );

      const retryButton = screen.getByTestId('error-retry-button');
      retryButton.focus();

      await user.keyboard('{Enter}');
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('retry button can be activated with Space key', async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      render(
        <ErrorNotification errorCode="TIMEOUT" onRetry={onRetry} />
      );

      const retryButton = screen.getByTestId('error-retry-button');
      retryButton.focus();

      await user.keyboard(' ');
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('dismiss button can be activated with keyboard', async () => {
      const onDismiss = vi.fn();
      const user = userEvent.setup();
      render(
        <ErrorNotification errorCode="TIMEOUT" onDismiss={onDismiss} />
      );

      const dismissButton = screen.getByTestId('error-dismiss-button');
      dismissButton.focus();

      await user.keyboard('{Enter}');
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('banner buttons are accessible via keyboard', async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      render(
        <PersistentErrorBanner
          syncStatus={createSyncStatus()}
          onRetry={onRetry}
          onManualModeHelp={vi.fn()}
        />
      );

      // Tab to retry button
      await user.tab(); // dismiss button
      await user.tab(); // retry button

      await user.keyboard('{Enter}');
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual Indicators Beyond Color', () => {
    it('ErrorNotification uses icons alongside text', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      // Check that icon is present (with aria-hidden for screen readers)
      const notification = screen.getByTestId('error-notification');
      const icon = notification.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();

      // Check that text headline is present
      expect(screen.getByText('Connection timed out')).toBeInTheDocument();
    });

    it('PersistentErrorBanner uses icons alongside text', () => {
      render(
        <PersistentErrorBanner
          syncStatus={createSyncStatus()}
          onRetry={vi.fn()}
          onManualModeHelp={vi.fn()}
        />
      );

      // Check that icon is present
      const banner = screen.getByTestId('persistent-error-banner');
      const icon = banner.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('action buttons have text labels not just icons', () => {
      render(
        <ErrorNotification
          errorCode="NETWORK_ERROR"
          onRetry={vi.fn()}
          onManualModeHelp={vi.fn()}
        />
      );

      // Buttons should have visible text, not just icons
      expect(screen.getByTestId('error-retry-button')).toHaveTextContent(
        'Retry Connection'
      );
      expect(screen.getByTestId('error-manual-mode-button')).toHaveTextContent(
        'Switch to Manual Mode'
      );
    });
  });

  describe('Accessible Labels', () => {
    it('dismiss button has aria-label', () => {
      render(
        <ErrorNotification errorCode="TIMEOUT" onDismiss={vi.fn()} />
      );

      expect(screen.getByTestId('error-dismiss-button')).toHaveAttribute(
        'aria-label',
        'Dismiss error notification'
      );
    });

    it('banner dismiss button has aria-label', () => {
      render(
        <PersistentErrorBanner
          syncStatus={createSyncStatus()}
          onRetry={vi.fn()}
          onManualModeHelp={vi.fn()}
        />
      );

      expect(screen.getByTestId('banner-dismiss-button')).toHaveAttribute(
        'aria-label',
        'Dismiss error banner'
      );
    });

    it('icons are hidden from screen readers', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const notification = screen.getByTestId('error-notification');
      const icons = notification.querySelectorAll('svg');

      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('recovery options are in a semantic list', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      // Check for ordered list with role="list"
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.tagName).toBe('OL');
    });
  });

  describe('Error Severity Communication', () => {
    it('different error types have different severity indicators', () => {
      const { rerender } = render(
        <ErrorNotification errorCode="TIMEOUT" />
      );

      // Transient error should be warning severity
      expect(screen.getByTestId('error-notification')).toHaveAttribute(
        'data-severity',
        'warning'
      );

      // Persistent error should be error severity
      rerender(<ErrorNotification errorCode="UNAUTHORIZED" />);
      expect(screen.getByTestId('error-notification')).toHaveAttribute(
        'data-severity',
        'error'
      );
    });

    it('error severity is communicated through text not just color', () => {
      // TIMEOUT (transient) - warning message
      const { rerender } = render(
        <ErrorNotification errorCode="TIMEOUT" />
      );
      expect(screen.getByText('Connection timed out')).toBeInTheDocument();
      expect(screen.getByText(/usually temporary/i)).toBeInTheDocument();

      // UNAUTHORIZED (persistent) - error message with action required
      rerender(<ErrorNotification errorCode="UNAUTHORIZED" />);
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      expect(screen.getByText(/verify/i)).toBeInTheDocument();
    });
  });

  describe('Button State Communication', () => {
    it('disabled retry button has disabled attribute', () => {
      render(
        <ErrorNotification
          errorCode="TIMEOUT"
          onRetry={vi.fn()}
          isRetrying
        />
      );

      expect(screen.getByTestId('error-retry-button')).toBeDisabled();
    });

    it('disabled state is communicated via text change', () => {
      render(
        <ErrorNotification
          errorCode="TIMEOUT"
          onRetry={vi.fn()}
          isRetrying
        />
      );

      // Button text changes to indicate loading state
      expect(screen.getByTestId('error-retry-button')).toHaveTextContent(
        'Retrying...'
      );
    });
  });
});
