/**
 * ErrorNotification Component
 *
 * Displays user-friendly error messages with recovery options.
 * Uses plain language and provides actionable next steps.
 *
 * Story: 10.6 - Display Clear Error Messages
 *
 * Features:
 * - Renders appropriate message based on error type
 * - Displays numbered recovery options
 * - Severity-based styling (warning, error, critical)
 * - Retry and Manual Mode action buttons
 * - Accessible with ARIA attributes
 * - Dismissible with callback
 */

import { X, AlertTriangle, XCircle, AlertOctagon, RefreshCw, BookOpen } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  getErrorMessage,
  getErrorMessageByType,
  formatRetryDelay,
  type ErrorMessage,
} from '../utils/errorMessages';
import type { SyncErrorCode, SyncFailureType } from '../types/sync.types';

/**
 * Props for ErrorNotification component
 */
export interface ErrorNotificationProps {
  /** Error code from classifyError (optional if failureType provided) */
  errorCode?: SyncErrorCode;
  /** Fallback if error code is not available */
  failureType?: SyncFailureType;
  /** Custom error details to append (optional) */
  errorDetails?: string;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Callback to open manual mode help */
  onManualModeHelp?: () => void;
  /** Retry delay in milliseconds (for display) */
  retryDelayMs?: number;
  /** Whether a retry is currently in progress */
  isRetrying?: boolean;
  /** Number of consecutive failures */
  failureCount?: number;
  /** Custom className */
  className?: string;
}

/**
 * Render icon based on severity
 */
function SeverityIcon({
  severity,
  className,
}: {
  severity: ErrorMessage['severity'];
  className: string;
}) {
  switch (severity) {
    case 'critical':
      return <AlertOctagon className={className} aria-hidden="true" />;
    case 'error':
      return <XCircle className={className} aria-hidden="true" />;
    case 'warning':
    default:
      return <AlertTriangle className={className} aria-hidden="true" />;
  }
}

/**
 * Get styling classes based on severity
 */
function getSeverityClasses(severity: ErrorMessage['severity']) {
  switch (severity) {
    case 'critical':
      return {
        container: 'bg-red-950/50 border-red-500/70',
        icon: 'text-red-400',
        title: 'text-red-300',
        description: 'text-red-200/80',
      };
    case 'error':
      return {
        container: 'bg-red-900/30 border-red-500/50',
        icon: 'text-red-400',
        title: 'text-red-300',
        description: 'text-red-200/70',
      };
    case 'warning':
    default:
      return {
        container: 'bg-yellow-900/20 border-yellow-500/50',
        icon: 'text-yellow-400',
        title: 'text-yellow-300',
        description: 'text-yellow-200/70',
      };
  }
}

/**
 * ErrorNotification Component
 *
 * Renders a user-friendly error notification with:
 * - Clear headline explaining the issue
 * - Plain language explanation
 * - Numbered recovery options
 * - Action buttons (Retry, Manual Mode)
 *
 * @example
 * ```tsx
 * <ErrorNotification
 *   errorCode="TIMEOUT"
 *   onRetry={handleRetry}
 *   onDismiss={handleDismiss}
 *   retryDelayMs={5000}
 * />
 * ```
 */
export function ErrorNotification({
  errorCode,
  failureType,
  errorDetails,
  onRetry,
  onDismiss,
  onManualModeHelp,
  retryDelayMs,
  isRetrying = false,
  failureCount = 0,
  className = '',
}: ErrorNotificationProps) {
  // Get appropriate error message based on code or type
  const message: ErrorMessage = errorCode
    ? getErrorMessage(errorCode)
    : failureType
      ? getErrorMessageByType(failureType)
      : getErrorMessage(undefined);

  const classes = getSeverityClasses(message.severity);

  // Format retry delay for display if provided
  const retryDelayText = retryDelayMs ? formatRetryDelay(retryDelayMs) : null;

  return (
    <Alert
      className={`${classes.container} ${className}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      data-testid="error-notification"
      data-severity={message.severity}
    >
      {/* Icon */}
      <SeverityIcon severity={message.severity} className={`h-4 w-4 ${classes.icon}`} />

      {/* Dismiss Button */}
      {message.isDismissible && onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 text-slate-400 hover:text-white hover:bg-transparent"
          onClick={onDismiss}
          aria-label="Dismiss error notification"
          data-testid="error-dismiss-button"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Title */}
      <AlertTitle className={`${classes.title} pr-8`}>{message.headline}</AlertTitle>

      {/* Description */}
      <AlertDescription className={classes.description}>
        {/* Explanation */}
        <p className="mb-2">{message.explanation}</p>

        {/* Additional error details if provided */}
        {errorDetails && (
          <p className="mb-2 text-sm opacity-80" data-testid="error-details">
            {errorDetails}
          </p>
        )}

        {/* Retry delay info */}
        {retryDelayText && !isRetrying && (
          <p className="mb-2 text-sm" data-testid="retry-delay-info">
            Retrying in {retryDelayText}...
          </p>
        )}

        {/* Failure count indicator */}
        {failureCount > 1 && (
          <p className="mb-2 text-sm opacity-70" data-testid="failure-count">
            Failed {failureCount} times
          </p>
        )}

        {/* Recovery Options */}
        <div className="mt-3" data-testid="recovery-options">
          <p className="text-sm font-medium mb-1">What you can do:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm" role="list">
            {message.recoveryOptions.map((option, index) => (
              <li key={index} className="opacity-90">
                {option}
              </li>
            ))}
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2" data-testid="error-actions">
          {/* Retry Button */}
          {message.showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-transparent border-current/30 hover:bg-white/10"
              data-testid="error-retry-button"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry Connection'}
            </Button>
          )}

          {/* Manual Mode Help Button */}
          {message.showManualMode && onManualModeHelp && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualModeHelp}
              className="bg-transparent border-current/30 hover:bg-white/10"
              data-testid="error-manual-mode-button"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Switch to Manual Mode
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default ErrorNotification;
