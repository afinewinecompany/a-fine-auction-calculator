/**
 * PersistentErrorBanner Component
 *
 * Displays a persistent alert banner at the top of the draft page
 * for unresolved connection errors. Dismissible but reappears on next failure.
 *
 * Story: 10.6 - Display Clear Error Messages
 *
 * Features:
 * - Shows at top of draft page for persistent errors
 * - Color-coded based on error severity
 * - Dismissible with X button
 * - Reappears if error persists on next sync attempt
 * - Includes "Retry" and "Manual Mode" action buttons
 * - Accessible with ARIA live regions
 */

import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, XCircle, RefreshCw, BookOpen } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getErrorMessage, shouldErrorPersist, type ErrorMessage } from '../utils/errorMessages';
import type { SyncErrorCode, SyncStatus } from '../types/sync.types';

/**
 * Props for PersistentErrorBanner component
 */
export interface PersistentErrorBannerProps {
  /** Current sync status from useDraftSync */
  syncStatus: SyncStatus;
  /** Callback to trigger a retry */
  onRetry: () => void;
  /** Callback to open manual mode help */
  onManualModeHelp: () => void;
  /** Custom className for the banner */
  className?: string;
}

/**
 * Get styling classes based on severity
 */
function getBannerClasses(severity: ErrorMessage['severity']) {
  switch (severity) {
    case 'critical':
    case 'error':
      return {
        container: 'bg-red-950/80 border-red-500 border-2',
        icon: 'text-red-400',
        title: 'text-red-200',
        description: 'text-red-300/90',
        button: 'border-red-400 text-red-300 hover:bg-red-900/50',
      };
    case 'warning':
    default:
      return {
        container: 'bg-yellow-950/80 border-yellow-500 border-2',
        icon: 'text-yellow-400',
        title: 'text-yellow-200',
        description: 'text-yellow-300/90',
        button: 'border-yellow-400 text-yellow-300 hover:bg-yellow-900/50',
      };
  }
}

/**
 * PersistentErrorBanner Component
 *
 * Renders a persistent alert banner at the top of the page when there
 * are unresolved connection errors. The banner:
 * - Is dismissible but reappears on next failure
 * - Shows appropriate messaging based on error type
 * - Provides action buttons for retry and manual mode
 *
 * @example
 * ```tsx
 * <PersistentErrorBanner
 *   syncStatus={syncStatus}
 *   onRetry={triggerSync}
 *   onManualModeHelp={() => setShowHelp(true)}
 * />
 * ```
 */
export function PersistentErrorBanner({
  syncStatus,
  onRetry,
  onManualModeHelp,
  className = '',
}: PersistentErrorBannerProps) {
  // Track dismissed state - resets when error code changes
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastDismissedError, setLastDismissedError] = useState<string | null>(null);

  // Extract error code from sync status error message
  // The error code is stored in failureType combined with the error message
  const errorCode =
    syncStatus.failureType === 'persistent'
      ? determineErrorCodeFromMessage(syncStatus.error)
      : undefined;

  // Get message for display
  const message = getErrorMessage(errorCode);

  // Determine if banner should show
  const shouldShow =
    syncStatus.error !== null &&
    syncStatus.failureCount > 0 &&
    shouldErrorPersist(errorCode, syncStatus.failureCount) &&
    !isDismissed;

  // Reset dismissed state when error changes
  useEffect(() => {
    if (syncStatus.error !== lastDismissedError) {
      setIsDismissed(false);
    }
  }, [syncStatus.error, lastDismissedError]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    setLastDismissedError(syncStatus.error);
  }, [syncStatus.error]);

  // Don't render if nothing to show
  if (!shouldShow) {
    return null;
  }

  const classes = getBannerClasses(message.severity);
  const Icon =
    message.severity === 'error' || message.severity === 'critical' ? XCircle : AlertTriangle;

  return (
    <Alert
      className={`${classes.container} ${className} mb-4`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      data-testid="persistent-error-banner"
    >
      {/* Icon */}
      <Icon className={`h-5 w-5 ${classes.icon}`} aria-hidden="true" />

      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute right-2 top-2 h-6 w-6 ${classes.icon} hover:bg-transparent`}
        onClick={handleDismiss}
        aria-label="Dismiss error banner"
        data-testid="banner-dismiss-button"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Title */}
      <AlertTitle className={`${classes.title} text-base pr-8`}>{message.headline}</AlertTitle>

      {/* Description */}
      <AlertDescription className={classes.description}>
        <p className="mb-2">{message.explanation}</p>

        {/* Failure count */}
        {syncStatus.failureCount > 1 && (
          <p className="text-sm opacity-70 mb-2" data-testid="banner-failure-count">
            Failed {syncStatus.failureCount} times
          </p>
        )}

        {/* Manual mode indicator */}
        {syncStatus.isManualMode && (
          <p className="text-sm font-medium mb-2" data-testid="banner-manual-mode">
            Manual Sync Mode is active
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-3 flex flex-wrap gap-2" data-testid="banner-actions">
          {/* Retry Button - only for transient errors */}
          {message.showRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={syncStatus.isSyncing}
              className={classes.button}
              data-testid="banner-retry-button"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
              />
              {syncStatus.isSyncing ? 'Retrying...' : 'Retry Connection'}
            </Button>
          )}

          {/* Manual Mode Help Button */}
          {message.showManualMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualModeHelp}
              className={classes.button}
              data-testid="banner-manual-mode-button"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              {syncStatus.isManualMode ? 'Manual Mode Help' : 'Switch to Manual Mode'}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Helper to determine error code from error message
 * Since we store the displayMessage in syncStatus.error, we need to
 * match it back to an error code for styling
 */
function determineErrorCodeFromMessage(errorMessage: string | null): SyncErrorCode | undefined {
  if (!errorMessage) return undefined;

  const lowercaseMessage = errorMessage.toLowerCase();

  if (lowercaseMessage.includes('authentication') || lowercaseMessage.includes('room id')) {
    return 'UNAUTHORIZED';
  }
  if (lowercaseMessage.includes('not found') || lowercaseMessage.includes('draft room not found')) {
    return 'LEAGUE_NOT_FOUND';
  }
  if (lowercaseMessage.includes('invalid') || lowercaseMessage.includes('configuration')) {
    return 'VALIDATION_ERROR';
  }
  if (lowercaseMessage.includes('timeout') || lowercaseMessage.includes('timed out')) {
    return 'TIMEOUT';
  }
  if (lowercaseMessage.includes('too many') || lowercaseMessage.includes('rate')) {
    return 'RATE_LIMITED';
  }
  if (lowercaseMessage.includes('network') || lowercaseMessage.includes('connection')) {
    return 'NETWORK_ERROR';
  }
  if (lowercaseMessage.includes('unavailable') || lowercaseMessage.includes('couch managers')) {
    return 'SCRAPE_ERROR';
  }
  if (lowercaseMessage.includes('read') || lowercaseMessage.includes('parse')) {
    return 'PARSE_ERROR';
  }

  return undefined;
}

export default PersistentErrorBanner;
