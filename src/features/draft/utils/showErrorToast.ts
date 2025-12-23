/**
 * Error Toast Utility
 *
 * Shows user-friendly error notifications as toast messages.
 * Uses structured error messages from errorMessages utility.
 *
 * Story: 10.6 - Display Clear Error Messages
 *
 * Features:
 * - Shows appropriate toast based on error type
 * - Transient errors: Auto-dismiss after retry
 * - Persistent errors: Require user action
 * - Includes recovery options and action buttons
 */

import { toast } from 'sonner';
import {
  getErrorMessage,
  getErrorMessageByType,
  formatRetryDelay,
  type ErrorMessage,
} from './errorMessages';
import type { SyncErrorCode, SyncFailureType, ErrorClassification } from '../types/sync.types';

/**
 * Options for showing error toast
 */
export interface ShowErrorToastOptions {
  /** Error code from classifyError */
  errorCode?: SyncErrorCode;
  /** Fallback if error code is not available */
  failureType?: SyncFailureType;
  /** The full error classification */
  classification?: ErrorClassification;
  /** Number of consecutive failures */
  failureCount?: number;
  /** Retry delay in milliseconds */
  retryDelayMs?: number;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** Callback to open manual mode help */
  onManualModeHelp?: () => void;
}

/**
 * Show an error toast with user-friendly message
 *
 * @param options - Error toast options
 * @returns Toast ID for programmatic control
 *
 * @example
 * ```typescript
 * // Simple usage with error code
 * showErrorToast({ errorCode: 'TIMEOUT' });
 *
 * // With classification from classifyError
 * const classification = classifyError(error, failureCount);
 * showErrorToast({
 *   classification,
 *   errorCode: classification.errorCode,
 *   onRetry: () => triggerSync(),
 *   onManualModeHelp: () => openManualModeHelp(),
 * });
 * ```
 */
export function showErrorToast(options: ShowErrorToastOptions): string | number {
  const {
    errorCode,
    failureType,
    // classification is available for future use (e.g., analytics)
    failureCount = 0,
    retryDelayMs,
    onRetry,
    onManualModeHelp,
  } = options;

  // Get the appropriate error message
  const message: ErrorMessage = errorCode
    ? getErrorMessage(errorCode)
    : failureType
      ? getErrorMessageByType(failureType)
      : getErrorMessage(undefined);

  // Build description with recovery options
  let description = message.explanation;

  // Add failure count if multiple failures
  if (failureCount > 1) {
    description += ` (Failed ${failureCount} times)`;
  }

  // Add retry delay info for transient errors
  if (retryDelayMs && message.showRetry) {
    description += ` Retrying in ${formatRetryDelay(retryDelayMs)}.`;
  }

  // Determine toast type based on severity
  const toastFn =
    message.severity === 'error' || message.severity === 'critical' ? toast.error : toast.warning;

  // Determine duration - persistent errors stay until dismissed
  const duration =
    message.severity === 'error' || message.severity === 'critical' ? Infinity : 10000; // 10 seconds for warnings

  // Build action button if applicable
  let action: { label: string; onClick: () => void } | undefined;

  if (message.showManualMode && onManualModeHelp) {
    action = {
      label: 'Manual Mode',
      onClick: onManualModeHelp,
    };
  } else if (message.showRetry && onRetry) {
    action = {
      label: 'Retry',
      onClick: onRetry,
    };
  }

  // Show the toast
  return toastFn(message.headline, {
    description,
    duration,
    action,
    // Include close button for persistent errors
    closeButton: message.severity === 'error' || message.severity === 'critical',
  });
}

/**
 * Show a manual mode activation toast
 * Used when switching to manual sync mode after failures
 *
 * @param onManualModeHelp - Callback to open manual mode help
 * @returns Toast ID
 */
export function showManualModeToast(onManualModeHelp: () => void): string | number {
  return toast.warning('Switched to Manual Sync Mode', {
    description:
      'Automatic sync is unavailable. You can now enter bids manually to keep tracking the draft.',
    duration: Infinity,
    closeButton: true,
    action: {
      label: 'How to use',
      onClick: onManualModeHelp,
    },
  });
}

/**
 * Show a connection restored toast
 * Used when sync resumes after failures
 *
 * Story: 10.8 - Implement Graceful Degradation Pattern
 * Shows notification when connection restores during Manual Mode
 *
 * @returns Toast ID
 */
export function showConnectionRestoredToast(): string | number {
  return toast.success('Connection restored', {
    description: 'Switching to automatic sync. Draft continues without interruption.',
    duration: 5000,
  });
}

/**
 * Dismiss all error toasts
 * Used when error is resolved (e.g., successful sync)
 */
export function dismissErrorToasts(): void {
  toast.dismiss();
}
