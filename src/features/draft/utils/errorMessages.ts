/**
 * Error Message Mapping Utility
 *
 * Maps error types to user-friendly messages with clear explanations
 * and actionable recovery options. Uses plain language (no technical jargon).
 *
 * Story: 10.6 - Display Clear Error Messages
 *
 * Message Components:
 * - headline: Brief error description
 * - explanation: What happened in user terms
 * - recoveryOptions: Numbered list of actions user can take
 *
 * Error Types Supported:
 * - Network timeout
 * - Invalid room ID
 * - Rate limiting
 * - Server error (5xx)
 * - Authentication error
 * - General network errors
 */

import type { SyncErrorCode, SyncFailureType } from '../types/sync.types';

/**
 * Structured error message for display
 */
export interface ErrorMessage {
  /** Brief error description (1 line) */
  headline: string;
  /** What happened in user terms (1-2 sentences) */
  explanation: string;
  /** Actionable recovery options */
  recoveryOptions: string[];
  /** Severity level for styling */
  severity: 'warning' | 'error' | 'critical';
  /** Whether this error type is dismissible */
  isDismissible: boolean;
  /** Whether to show retry button */
  showRetry: boolean;
  /** Whether to show manual mode link */
  showManualMode: boolean;
}

/**
 * Error message configuration for each error code
 * Uses plain language - avoids technical jargon per AC
 */
const ERROR_MESSAGE_MAP: Record<SyncErrorCode, ErrorMessage> = {
  TIMEOUT: {
    headline: 'Connection timed out',
    explanation: 'The draft room is taking too long to respond. This is usually temporary.',
    recoveryOptions: [
      'Wait a moment - we will retry automatically',
      'Check your internet connection',
      'Try the Retry button if it persists',
    ],
    severity: 'warning',
    isDismissible: true,
    showRetry: true,
    showManualMode: false,
  },

  NETWORK_ERROR: {
    headline: 'Unable to connect',
    explanation: 'We could not reach the draft room. Please check your internet connection.',
    recoveryOptions: [
      'Check your internet connection',
      'Retry the connection',
      'Switch to Manual Sync Mode if the problem persists',
    ],
    severity: 'warning',
    isDismissible: true,
    showRetry: true,
    showManualMode: true,
  },

  SCRAPE_ERROR: {
    headline: 'Draft room temporarily unavailable',
    explanation: 'Couch Managers is having temporary issues. We will keep trying automatically.',
    recoveryOptions: [
      'Wait a moment - this usually resolves quickly',
      'Try the Retry button',
      'Switch to Manual Mode if you need to continue',
    ],
    severity: 'warning',
    isDismissible: true,
    showRetry: true,
    showManualMode: true,
  },

  PARSE_ERROR: {
    headline: 'Unable to read draft data',
    explanation:
      'We received data from Couch Managers but could not process it. Retrying automatically.',
    recoveryOptions: ['Wait - we will retry automatically', 'Try the Retry button if it persists'],
    severity: 'warning',
    isDismissible: true,
    showRetry: true,
    showManualMode: false,
  },

  RATE_LIMITED: {
    headline: 'Too many requests',
    explanation: 'We are sending requests too quickly. Slowing down and will retry shortly.',
    recoveryOptions: ['Wait - we will retry in a few seconds', 'Avoid clicking Retry repeatedly'],
    severity: 'warning',
    isDismissible: true,
    showRetry: false, // Don't encourage manual retry when rate limited
    showManualMode: false,
  },

  UNAUTHORIZED: {
    headline: 'Authentication failed',
    explanation: 'We could not access the draft room. The room ID may have changed or expired.',
    recoveryOptions: [
      'Go to League Settings and verify your room ID',
      'Check that you have access to this draft room',
      'Switch to Manual Mode to continue the draft',
    ],
    severity: 'error',
    isDismissible: true,
    showRetry: false,
    showManualMode: true,
  },

  LEAGUE_NOT_FOUND: {
    headline: 'Draft room not found',
    explanation: 'The room ID does not match any active draft room. Please verify your settings.',
    recoveryOptions: [
      'Go to League Settings and check your room ID',
      'Make sure the draft has started on Couch Managers',
      'Switch to Manual Mode to continue',
    ],
    severity: 'error',
    isDismissible: true,
    showRetry: false,
    showManualMode: true,
  },

  VALIDATION_ERROR: {
    headline: 'Invalid configuration',
    explanation: 'There is a problem with your league settings. Please review them.',
    recoveryOptions: [
      'Go to League Settings and verify all fields',
      'Ensure the room ID is correct',
      'Switch to Manual Mode while troubleshooting',
    ],
    severity: 'error',
    isDismissible: true,
    showRetry: false,
    showManualMode: true,
  },
};

/**
 * Default error message for unknown error types
 */
const DEFAULT_ERROR_MESSAGE: ErrorMessage = {
  headline: 'Connection problem',
  explanation: 'Something went wrong while syncing with the draft room.',
  recoveryOptions: [
    'Wait a moment - we will retry automatically',
    'Try the Retry button',
    'Switch to Manual Mode if the problem persists',
  ],
  severity: 'warning',
  isDismissible: true,
  showRetry: true,
  showManualMode: true,
};

/**
 * Get user-friendly error message for an error code
 *
 * @param errorCode - The error code from classifyError
 * @returns Structured error message with headline, explanation, and recovery options
 *
 * @example
 * ```typescript
 * const message = getErrorMessage('TIMEOUT');
 * // {
 * //   headline: 'Connection timed out',
 * //   explanation: 'The draft room is taking too long to respond...',
 * //   recoveryOptions: ['Wait a moment...', 'Check your internet...'],
 * //   severity: 'warning',
 * //   ...
 * // }
 * ```
 */
export function getErrorMessage(errorCode: SyncErrorCode | undefined): ErrorMessage {
  if (!errorCode) {
    return DEFAULT_ERROR_MESSAGE;
  }
  return ERROR_MESSAGE_MAP[errorCode] ?? DEFAULT_ERROR_MESSAGE;
}

/**
 * Get error message based on failure type (for cases where code isn't available)
 *
 * @param failureType - 'transient' or 'persistent'
 * @returns Appropriate generic error message
 */
export function getErrorMessageByType(failureType: SyncFailureType): ErrorMessage {
  if (failureType === 'persistent') {
    return {
      headline: 'Connection failed',
      explanation: 'We cannot connect to the draft room. This may require checking your settings.',
      recoveryOptions: [
        'Verify your room ID in League Settings',
        'Check that the draft is active',
        'Switch to Manual Mode to continue',
      ],
      severity: 'error',
      isDismissible: true,
      showRetry: false,
      showManualMode: true,
    };
  }

  // Transient error
  return {
    headline: 'Temporary connection issue',
    explanation: 'We are having trouble reaching the draft room. Retrying automatically.',
    recoveryOptions: [
      'Wait a moment - retrying automatically',
      'Try the Retry button',
      'Switch to Manual Mode if needed',
    ],
    severity: 'warning',
    isDismissible: true,
    showRetry: true,
    showManualMode: true,
  };
}

/**
 * Create a custom error message (for edge cases or custom errors)
 *
 * @param headline - Brief error description
 * @param explanation - What happened
 * @param options - Optional overrides
 * @returns ErrorMessage object
 */
export function createErrorMessage(
  headline: string,
  explanation: string,
  options: Partial<ErrorMessage> = {}
): ErrorMessage {
  return {
    headline,
    explanation,
    recoveryOptions: options.recoveryOptions ?? ['Try again or switch to Manual Mode'],
    severity: options.severity ?? 'warning',
    isDismissible: options.isDismissible ?? true,
    showRetry: options.showRetry ?? true,
    showManualMode: options.showManualMode ?? true,
  };
}

/**
 * Format retry delay for user display
 *
 * @param delayMs - Delay in milliseconds
 * @returns Human-readable string (e.g., "5 seconds", "20 seconds")
 */
export function formatRetryDelay(delayMs: number): string {
  const seconds = Math.round(delayMs / 1000);
  return seconds === 1 ? '1 second' : `${seconds} seconds`;
}

/**
 * Get severity icon name for the error
 * Used by components to render appropriate icon
 *
 * @param severity - Error severity level
 * @returns Icon name string
 */
export function getSeverityIcon(severity: ErrorMessage['severity']): string {
  switch (severity) {
    case 'critical':
      return 'AlertOctagon';
    case 'error':
      return 'XCircle';
    case 'warning':
      return 'AlertTriangle';
    default:
      return 'AlertCircle';
  }
}

/**
 * Check if error should persist (reappear if not resolved)
 * Per AC: "message is dismissible but reappears if the issue persists"
 *
 * @param errorCode - The error code
 * @param failureCount - Number of consecutive failures
 * @returns Whether the error should persist after dismissal
 */
export function shouldErrorPersist(
  errorCode: SyncErrorCode | undefined,
  failureCount: number
): boolean {
  // Persistent errors always reappear until resolved
  const message = getErrorMessage(errorCode);
  if (message.severity === 'error' || message.severity === 'critical') {
    return true;
  }

  // Transient errors reappear after multiple failures
  return failureCount >= 2;
}
