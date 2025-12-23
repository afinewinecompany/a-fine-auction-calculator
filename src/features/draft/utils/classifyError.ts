/**
 * Error Classification Utility
 *
 * Classifies sync errors as transient or persistent to determine
 * appropriate retry behavior and degradation strategy.
 *
 * Story: 10.1 - Detect API Connection Failures
 *
 * Transient errors (retryable):
 * - Network timeout
 * - 5xx server errors
 * - Rate limiting
 * - Scrape/parse errors (temporary site issues)
 *
 * Persistent errors (immediate degradation):
 * - 401/403 authentication errors
 * - 404 not found (invalid room ID)
 * - Validation errors (configuration issues)
 */

import type { SyncErrorCode, SyncErrorResponse, ErrorClassification } from '../types/sync.types';

/**
 * HTTP status codes for classification
 */
const TRANSIENT_HTTP_STATUS = [408, 429, 500, 502, 503, 504];
const PERSISTENT_HTTP_STATUS = [400, 401, 403, 404, 405, 422];

/**
 * Error codes that indicate persistent failures
 * These errors require user intervention and won't resolve on retry
 */
const PERSISTENT_ERROR_CODES: SyncErrorCode[] = [
  'UNAUTHORIZED',
  'LEAGUE_NOT_FOUND',
  'VALIDATION_ERROR',
];

/**
 * User-friendly error messages for each error type
 */
const ERROR_MESSAGES: Record<SyncErrorCode, string> = {
  TIMEOUT: 'Connection timed out. Will retry automatically.',
  NETWORK_ERROR: 'Network connection failed. Check your internet connection.',
  SCRAPE_ERROR: 'Unable to fetch draft data. Couch Managers may be temporarily unavailable.',
  PARSE_ERROR: 'Unable to read draft data. Will retry automatically.',
  RATE_LIMITED: 'Too many requests. Will retry after a short delay.',
  UNAUTHORIZED: 'Authentication failed. Please check your room ID.',
  LEAGUE_NOT_FOUND: 'Draft room not found. Please verify the room ID is correct.',
  VALIDATION_ERROR: 'Invalid configuration. Please check your settings.',
};

/**
 * Base retry delay in milliseconds (5 seconds)
 * Story 10.1: Exponential backoff starts at 5s
 */
const BASE_RETRY_DELAY_MS = 5000;

/**
 * Maximum retry delay in milliseconds (20 seconds)
 * Story 10.1: Max delay is 20s
 */
const MAX_RETRY_DELAY_MS = 20000;

/**
 * Calculate exponential backoff delay
 * Formula: Math.min(5000 * Math.pow(2, failureCount), 20000)
 *
 * @param failureCount - Current number of consecutive failures
 * @returns Delay in milliseconds before next retry
 */
export function calculateRetryDelay(failureCount: number): number {
  return Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, failureCount), MAX_RETRY_DELAY_MS);
}

/**
 * Classify an error from the sync Edge Function response
 *
 * @param errorResponse - Error response from Edge Function
 * @param failureCount - Current consecutive failure count (for retry delay calculation)
 * @returns Classification with type, retry behavior, and display message
 *
 * @example
 * ```typescript
 * const classification = classifyEdgeFunctionError(
 *   { success: false, error: 'Network timeout', code: 'TIMEOUT' },
 *   0
 * );
 * // { type: 'transient', shouldRetry: true, retryDelayMs: 5000, ... }
 * ```
 */
export function classifyEdgeFunctionError(
  errorResponse: SyncErrorResponse,
  failureCount: number = 0
): ErrorClassification {
  const { code, error } = errorResponse;

  // Check if it's a persistent error
  if (PERSISTENT_ERROR_CODES.includes(code)) {
    return {
      type: 'persistent',
      shouldRetry: false,
      retryDelayMs: 0,
      displayMessage: ERROR_MESSAGES[code] || error,
      errorCode: code,
    };
  }

  // It's a transient error - calculate retry delay
  const retryDelayMs = calculateRetryDelay(failureCount);

  return {
    type: 'transient',
    shouldRetry: true,
    retryDelayMs,
    displayMessage: ERROR_MESSAGES[code] || error,
    errorCode: code,
  };
}

/**
 * Classify a JavaScript Error (network errors, timeouts, etc.)
 *
 * @param error - JavaScript Error object
 * @param failureCount - Current consecutive failure count
 * @returns Classification with type, retry behavior, and display message
 *
 * @example
 * ```typescript
 * try {
 *   await supabase.functions.invoke('sync-couch-managers', body);
 * } catch (error) {
 *   const classification = classifyNetworkError(error, 1);
 *   if (classification.shouldRetry) {
 *     setTimeout(retry, classification.retryDelayMs);
 *   }
 * }
 * ```
 */
export function classifyNetworkError(error: Error, failureCount: number = 0): ErrorClassification {
  const errorMessage = error.message.toLowerCase();

  // Check for timeout indicators
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('aborted')
  ) {
    return {
      type: 'transient',
      shouldRetry: true,
      retryDelayMs: calculateRetryDelay(failureCount),
      displayMessage: ERROR_MESSAGES.TIMEOUT,
      errorCode: 'TIMEOUT',
    };
  }

  // Check for network error indicators
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('offline')
  ) {
    return {
      type: 'transient',
      shouldRetry: true,
      retryDelayMs: calculateRetryDelay(failureCount),
      displayMessage: ERROR_MESSAGES.NETWORK_ERROR,
      errorCode: 'NETWORK_ERROR',
    };
  }

  // Check for auth-related errors (persistent)
  if (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('401') ||
    errorMessage.includes('403')
  ) {
    return {
      type: 'persistent',
      shouldRetry: false,
      retryDelayMs: 0,
      displayMessage: ERROR_MESSAGES.UNAUTHORIZED,
      errorCode: 'UNAUTHORIZED',
    };
  }

  // Check for not found errors (persistent)
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return {
      type: 'persistent',
      shouldRetry: false,
      retryDelayMs: 0,
      displayMessage: ERROR_MESSAGES.LEAGUE_NOT_FOUND,
      errorCode: 'LEAGUE_NOT_FOUND',
    };
  }

  // Default to transient for unknown errors (safer to retry)
  return {
    type: 'transient',
    shouldRetry: true,
    retryDelayMs: calculateRetryDelay(failureCount),
    displayMessage: error.message || 'An unexpected error occurred. Will retry automatically.',
  };
}

/**
 * Classify an HTTP status code
 *
 * @param statusCode - HTTP status code
 * @param failureCount - Current consecutive failure count
 * @returns Classification with type and retry behavior
 */
export function classifyHttpStatus(
  statusCode: number,
  failureCount: number = 0
): ErrorClassification {
  // 2xx - Success (shouldn't be called with success codes)
  if (statusCode >= 200 && statusCode < 300) {
    return {
      type: 'transient',
      shouldRetry: false,
      retryDelayMs: 0,
      displayMessage: 'Success',
    };
  }

  // Persistent HTTP errors
  if (PERSISTENT_HTTP_STATUS.includes(statusCode)) {
    let message = 'Request failed';
    let errorCode: SyncErrorCode | undefined;

    switch (statusCode) {
      case 400:
        message = ERROR_MESSAGES.VALIDATION_ERROR;
        errorCode = 'VALIDATION_ERROR';
        break;
      case 401:
      case 403:
        message = ERROR_MESSAGES.UNAUTHORIZED;
        errorCode = 'UNAUTHORIZED';
        break;
      case 404:
        message = ERROR_MESSAGES.LEAGUE_NOT_FOUND;
        errorCode = 'LEAGUE_NOT_FOUND';
        break;
      default:
        message = `Request failed with status ${statusCode}`;
    }

    return {
      type: 'persistent',
      shouldRetry: false,
      retryDelayMs: 0,
      displayMessage: message,
      errorCode,
    };
  }

  // Transient HTTP errors (5xx, timeout, rate limit)
  if (TRANSIENT_HTTP_STATUS.includes(statusCode)) {
    let message = ERROR_MESSAGES.NETWORK_ERROR;
    let errorCode: SyncErrorCode | undefined = 'NETWORK_ERROR';

    switch (statusCode) {
      case 408:
        message = ERROR_MESSAGES.TIMEOUT;
        errorCode = 'TIMEOUT';
        break;
      case 429:
        message = ERROR_MESSAGES.RATE_LIMITED;
        errorCode = 'RATE_LIMITED';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = ERROR_MESSAGES.SCRAPE_ERROR;
        errorCode = 'SCRAPE_ERROR';
        break;
    }

    return {
      type: 'transient',
      shouldRetry: true,
      retryDelayMs: calculateRetryDelay(failureCount),
      displayMessage: message,
      errorCode,
    };
  }

  // Default to transient for unknown status codes
  return {
    type: 'transient',
    shouldRetry: true,
    retryDelayMs: calculateRetryDelay(failureCount),
    displayMessage: `Unexpected error (${statusCode}). Will retry automatically.`,
  };
}

/**
 * Main error classification function
 *
 * Handles all error types:
 * - SyncErrorResponse from Edge Function
 * - JavaScript Error objects
 * - Raw error messages
 *
 * @param error - Error to classify (SyncErrorResponse, Error, or string)
 * @param failureCount - Current consecutive failure count
 * @returns Classification with type, retry behavior, and display message
 *
 * @example
 * ```typescript
 * // In useDraftSync hook:
 * const classification = classifyError(error, syncStatus.failureCount);
 *
 * if (classification.type === 'persistent') {
 *   enableManualMode(leagueId);
 * } else if (classification.shouldRetry) {
 *   setTimeout(triggerSync, classification.retryDelayMs);
 * }
 * ```
 */
export function classifyError(
  error: SyncErrorResponse | Error | string,
  failureCount: number = 0
): ErrorClassification {
  // Handle SyncErrorResponse from Edge Function
  if (typeof error === 'object' && 'code' in error && 'success' in error) {
    return classifyEdgeFunctionError(error as SyncErrorResponse, failureCount);
  }

  // Handle JavaScript Error objects
  if (error instanceof Error) {
    return classifyNetworkError(error, failureCount);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return classifyNetworkError(new Error(error), failureCount);
  }

  // Unknown error type - default to transient
  return {
    type: 'transient',
    shouldRetry: true,
    retryDelayMs: calculateRetryDelay(failureCount),
    displayMessage: 'An unexpected error occurred. Will retry automatically.',
  };
}

/**
 * Check if an error classification indicates manual mode should be enabled
 *
 * Manual mode is triggered when:
 * - Error is persistent (won't resolve with retry)
 * - 3 or more consecutive transient failures
 *
 * @param classification - Error classification result
 * @param failureCount - Current consecutive failure count (including this failure)
 * @returns Whether manual mode should be enabled
 */
export function shouldEnableManualMode(
  classification: ErrorClassification,
  failureCount: number
): boolean {
  // Persistent errors always trigger manual mode
  if (classification.type === 'persistent') {
    return true;
  }

  // 3+ transient failures trigger manual mode (NFR-I3)
  // Note: failureCount should include the current failure
  return failureCount >= 3;
}
