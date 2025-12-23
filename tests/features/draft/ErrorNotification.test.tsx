/**
 * Tests for ErrorNotification Component
 *
 * Story: 10.6 - Display Clear Error Messages
 *
 * Tests:
 * - Correct message displayed for each error type
 * - Recovery options rendered
 * - Action buttons (retry, manual mode)
 * - Dismissal functionality
 * - Severity-based styling
 * - Accessibility attributes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorNotification } from '@/features/draft/components/ErrorNotification';

describe('ErrorNotification', () => {
  describe('rendering error messages', () => {
    it('renders correct message for TIMEOUT error', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      expect(screen.getByText('Connection timed out')).toBeInTheDocument();
      expect(
        screen.getByText(/taking too long to respond/i)
      ).toBeInTheDocument();
    });

    it('renders correct message for NETWORK_ERROR', () => {
      render(<ErrorNotification errorCode="NETWORK_ERROR" />);

      expect(screen.getByText('Unable to connect')).toBeInTheDocument();
      // The explanation is in a paragraph element
      expect(
        screen.getByText(/We could not reach the draft room/i)
      ).toBeInTheDocument();
    });

    it('renders correct message for UNAUTHORIZED error', () => {
      render(<ErrorNotification errorCode="UNAUTHORIZED" />);

      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });

    it('renders correct message for LEAGUE_NOT_FOUND', () => {
      render(<ErrorNotification errorCode="LEAGUE_NOT_FOUND" />);

      expect(screen.getByText('Draft room not found')).toBeInTheDocument();
    });

    it('renders correct message for RATE_LIMITED', () => {
      render(<ErrorNotification errorCode="RATE_LIMITED" />);

      expect(screen.getByText('Too many requests')).toBeInTheDocument();
    });

    it('renders default message when no error code provided', () => {
      render(<ErrorNotification />);

      expect(screen.getByText('Connection problem')).toBeInTheDocument();
    });

    it('renders message based on failureType when no errorCode', () => {
      render(<ErrorNotification failureType="persistent" />);

      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });

  describe('recovery options', () => {
    it('displays recovery options as numbered list', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const recoverySection = screen.getByTestId('recovery-options');
      expect(recoverySection).toBeInTheDocument();
      expect(screen.getByText('What you can do:')).toBeInTheDocument();

      // Check that options are in an ordered list
      const list = recoverySection.querySelector('ol');
      expect(list).toBeInTheDocument();
      expect(list?.querySelectorAll('li').length).toBeGreaterThan(0);
    });

    it('includes relevant recovery options for network errors', () => {
      render(<ErrorNotification errorCode="NETWORK_ERROR" />);

      // Recovery options list should contain internet connection advice
      const recoveryOptions = screen.getByTestId('recovery-options');
      expect(recoveryOptions).toHaveTextContent(/Check your internet connection/i);
    });

    it('includes settings suggestion for persistent errors', () => {
      render(<ErrorNotification errorCode="LEAGUE_NOT_FOUND" />);

      expect(screen.getByText(/League Settings/i)).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('shows retry button for transient errors', () => {
      const onRetry = vi.fn();
      render(<ErrorNotification errorCode="TIMEOUT" onRetry={onRetry} />);

      const retryButton = screen.getByTestId('error-retry-button');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveTextContent('Retry Connection');
    });

    it('calls onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(<ErrorNotification errorCode="TIMEOUT" onRetry={onRetry} />);

      fireEvent.click(screen.getByTestId('error-retry-button'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('disables retry button when isRetrying is true', () => {
      render(
        <ErrorNotification errorCode="TIMEOUT" onRetry={vi.fn()} isRetrying />
      );

      const retryButton = screen.getByTestId('error-retry-button');
      expect(retryButton).toBeDisabled();
      expect(retryButton).toHaveTextContent('Retrying...');
    });

    it('does not show retry button for RATE_LIMITED errors', () => {
      render(<ErrorNotification errorCode="RATE_LIMITED" onRetry={vi.fn()} />);

      expect(
        screen.queryByTestId('error-retry-button')
      ).not.toBeInTheDocument();
    });

    it('does not show retry button for persistent errors', () => {
      render(<ErrorNotification errorCode="UNAUTHORIZED" onRetry={vi.fn()} />);

      expect(
        screen.queryByTestId('error-retry-button')
      ).not.toBeInTheDocument();
    });

    it('shows manual mode button for appropriate errors', () => {
      const onManualModeHelp = vi.fn();
      render(
        <ErrorNotification
          errorCode="NETWORK_ERROR"
          onManualModeHelp={onManualModeHelp}
        />
      );

      const manualButton = screen.getByTestId('error-manual-mode-button');
      expect(manualButton).toBeInTheDocument();
      expect(manualButton).toHaveTextContent('Switch to Manual Mode');
    });

    it('calls onManualModeHelp when manual mode button clicked', () => {
      const onManualModeHelp = vi.fn();
      render(
        <ErrorNotification
          errorCode="NETWORK_ERROR"
          onManualModeHelp={onManualModeHelp}
        />
      );

      fireEvent.click(screen.getByTestId('error-manual-mode-button'));
      expect(onManualModeHelp).toHaveBeenCalledTimes(1);
    });

    it('does not show manual mode button for PARSE_ERROR', () => {
      render(
        <ErrorNotification errorCode="PARSE_ERROR" onManualModeHelp={vi.fn()} />
      );

      expect(
        screen.queryByTestId('error-manual-mode-button')
      ).not.toBeInTheDocument();
    });
  });

  describe('dismissal', () => {
    it('shows dismiss button when onDismiss provided', () => {
      render(<ErrorNotification errorCode="TIMEOUT" onDismiss={vi.fn()} />);

      expect(screen.getByTestId('error-dismiss-button')).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button clicked', () => {
      const onDismiss = vi.fn();
      render(<ErrorNotification errorCode="TIMEOUT" onDismiss={onDismiss} />);

      fireEvent.click(screen.getByTestId('error-dismiss-button'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not show dismiss button when onDismiss not provided', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      expect(
        screen.queryByTestId('error-dismiss-button')
      ).not.toBeInTheDocument();
    });
  });

  describe('severity styling', () => {
    it('applies warning severity for transient errors', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('data-severity', 'warning');
    });

    it('applies error severity for persistent errors', () => {
      render(<ErrorNotification errorCode="UNAUTHORIZED" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('data-severity', 'error');
    });

    it('applies error severity for LEAGUE_NOT_FOUND', () => {
      render(<ErrorNotification errorCode="LEAGUE_NOT_FOUND" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('data-severity', 'error');
    });
  });

  describe('additional information', () => {
    it('displays custom error details when provided', () => {
      render(
        <ErrorNotification
          errorCode="TIMEOUT"
          errorDetails="Room ID: 12345"
        />
      );

      expect(screen.getByTestId('error-details')).toHaveTextContent(
        'Room ID: 12345'
      );
    });

    it('displays retry delay info when provided', () => {
      render(
        <ErrorNotification errorCode="TIMEOUT" retryDelayMs={5000} />
      );

      expect(screen.getByTestId('retry-delay-info')).toHaveTextContent(
        'Retrying in 5 seconds...'
      );
    });

    it('does not show retry delay when isRetrying', () => {
      render(
        <ErrorNotification
          errorCode="TIMEOUT"
          retryDelayMs={5000}
          isRetrying
        />
      );

      expect(
        screen.queryByTestId('retry-delay-info')
      ).not.toBeInTheDocument();
    });

    it('displays failure count when greater than 1', () => {
      render(<ErrorNotification errorCode="TIMEOUT" failureCount={3} />);

      expect(screen.getByTestId('failure-count')).toHaveTextContent(
        'Failed 3 times'
      );
    });

    it('does not show failure count for single failure', () => {
      render(<ErrorNotification errorCode="TIMEOUT" failureCount={1} />);

      expect(screen.queryByTestId('failure-count')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role="alert" for screen readers', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('role', 'alert');
    });

    it('has aria-live="assertive" for immediate announcement', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('aria-live', 'assertive');
    });

    it('has aria-atomic="true" for complete reading', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveAttribute('aria-atomic', 'true');
    });

    it('dismiss button has accessible label', () => {
      render(<ErrorNotification errorCode="TIMEOUT" onDismiss={vi.fn()} />);

      const dismissButton = screen.getByTestId('error-dismiss-button');
      expect(dismissButton).toHaveAttribute(
        'aria-label',
        'Dismiss error notification'
      );
    });

    it('recovery options are in a list with role="list"', () => {
      render(<ErrorNotification errorCode="TIMEOUT" />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      render(
        <ErrorNotification errorCode="TIMEOUT" className="custom-class" />
      );

      const notification = screen.getByTestId('error-notification');
      expect(notification).toHaveClass('custom-class');
    });
  });
});
