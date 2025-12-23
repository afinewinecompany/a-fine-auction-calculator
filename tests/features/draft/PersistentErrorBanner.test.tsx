/**
 * Tests for PersistentErrorBanner Component
 *
 * Story: 10.6 - Display Clear Error Messages
 *
 * Tests:
 * - Shows for persistent errors
 * - Dismissible but reappears on next failure
 * - Action buttons work correctly
 * - Styling based on severity
 * - Accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersistentErrorBanner } from '@/features/draft/components/PersistentErrorBanner';
import type { SyncStatus } from '@/features/draft/types/sync.types';

// Default sync status with error
const createSyncStatus = (overrides: Partial<SyncStatus> = {}): SyncStatus => ({
  isConnected: false,
  isSyncing: false,
  lastSync: null,
  error: 'Network connection failed. Check your internet connection.',
  failureCount: 2,
  failureType: 'transient',
  isManualMode: false,
  lastFailureTimestamp: new Date(),
  ...overrides,
});

describe('PersistentErrorBanner', () => {
  const defaultProps = {
    onRetry: vi.fn(),
    onManualModeHelp: vi.fn(),
  };

  describe('visibility', () => {
    it('shows banner when there is a persistent error', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({ failureCount: 2 })}
        />
      );

      expect(screen.getByTestId('persistent-error-banner')).toBeInTheDocument();
    });

    it('does not show when there is no error', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({ error: null, failureCount: 0 })}
        />
      );

      expect(
        screen.queryByTestId('persistent-error-banner')
      ).not.toBeInTheDocument();
    });

    it('does not show for single transient failure', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({
            error: 'Connection timed out.',
            failureCount: 1,
            failureType: 'transient',
          })}
        />
      );

      // Single transient failure should not persist
      expect(
        screen.queryByTestId('persistent-error-banner')
      ).not.toBeInTheDocument();
    });

    it('shows for multiple transient failures', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({
            error: 'Connection timed out.',
            failureCount: 3,
            failureType: 'transient',
          })}
        />
      );

      expect(screen.getByTestId('persistent-error-banner')).toBeInTheDocument();
    });

    it('shows for persistent error types regardless of count', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({
            error: 'Draft room not found.',
            failureCount: 1,
            failureType: 'persistent',
          })}
        />
      );

      expect(screen.getByTestId('persistent-error-banner')).toBeInTheDocument();
    });
  });

  describe('dismissal behavior', () => {
    it('can be dismissed with X button', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus()}
        />
      );

      expect(screen.getByTestId('persistent-error-banner')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('banner-dismiss-button'));

      expect(
        screen.queryByTestId('persistent-error-banner')
      ).not.toBeInTheDocument();
    });

    it('reappears when error changes after dismissal', () => {
      const { rerender } = render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({
            error: 'First error',
            failureCount: 2,
          })}
        />
      );

      // Dismiss
      fireEvent.click(screen.getByTestId('banner-dismiss-button'));
      expect(
        screen.queryByTestId('persistent-error-banner')
      ).not.toBeInTheDocument();

      // New error arrives
      rerender(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({
            error: 'Different error',
            failureCount: 3,
          })}
        />
      );

      expect(screen.getByTestId('persistent-error-banner')).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('shows retry button for transient errors', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({
            failureType: 'transient',
            failureCount: 2,
          })}
        />
      );

      expect(screen.getByTestId('banner-retry-button')).toBeInTheDocument();
    });

    it('calls onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(
        <PersistentErrorBanner
          {...defaultProps}
          onRetry={onRetry}
          syncStatus={createSyncStatus()}
        />
      );

      fireEvent.click(screen.getByTestId('banner-retry-button'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('disables retry button when syncing', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({ isSyncing: true })}
        />
      );

      expect(screen.getByTestId('banner-retry-button')).toBeDisabled();
      expect(screen.getByTestId('banner-retry-button')).toHaveTextContent(
        'Retrying...'
      );
    });

    it('shows manual mode button', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus()}
        />
      );

      expect(
        screen.getByTestId('banner-manual-mode-button')
      ).toBeInTheDocument();
    });

    it('calls onManualModeHelp when manual mode button clicked', () => {
      const onManualModeHelp = vi.fn();
      render(
        <PersistentErrorBanner
          {...defaultProps}
          onManualModeHelp={onManualModeHelp}
          syncStatus={createSyncStatus()}
        />
      );

      fireEvent.click(screen.getByTestId('banner-manual-mode-button'));
      expect(onManualModeHelp).toHaveBeenCalledTimes(1);
    });

    it('shows "Manual Mode Help" when already in manual mode', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({ isManualMode: true, failureCount: 3 })}
        />
      );

      expect(screen.getByTestId('banner-manual-mode-button')).toHaveTextContent(
        'Manual Mode Help'
      );
    });
  });

  describe('content display', () => {
    it('shows failure count when greater than 1', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({ failureCount: 5 })}
        />
      );

      expect(screen.getByTestId('banner-failure-count')).toHaveTextContent(
        'Failed 5 times'
      );
    });

    it('shows manual mode indicator when active', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus({ isManualMode: true, failureCount: 3 })}
        />
      );

      expect(screen.getByTestId('banner-manual-mode')).toHaveTextContent(
        'Manual Sync Mode is active'
      );
    });
  });

  describe('accessibility', () => {
    it('has role="alert"', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus()}
        />
      );

      expect(screen.getByTestId('persistent-error-banner')).toHaveAttribute(
        'role',
        'alert'
      );
    });

    it('has aria-live="polite"', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus()}
        />
      );

      expect(screen.getByTestId('persistent-error-banner')).toHaveAttribute(
        'aria-live',
        'polite'
      );
    });

    it('dismiss button has accessible label', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus()}
        />
      );

      expect(screen.getByTestId('banner-dismiss-button')).toHaveAttribute(
        'aria-label',
        'Dismiss error banner'
      );
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      render(
        <PersistentErrorBanner
          {...defaultProps}
          syncStatus={createSyncStatus()}
          className="custom-banner-class"
        />
      );

      expect(screen.getByTestId('persistent-error-banner')).toHaveClass(
        'custom-banner-class'
      );
    });
  });
});
