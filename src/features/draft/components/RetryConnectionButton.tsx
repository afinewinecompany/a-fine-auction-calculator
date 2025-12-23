/**
 * RetryConnectionButton Component
 *
 * A button that allows users to manually trigger a reconnection attempt
 * when the Couch Managers sync fails. Only shows when status is
 * 'disconnected' or 'reconnecting'.
 *
 * Story: 9.6 - Implement Manual Reconnection Trigger
 *
 * Features:
 * - Only visible when disconnected or reconnecting
 * - Shows loading spinner during reconnection attempt
 * - Displays toast notification on success or error
 * - Bypasses polling interval for immediate sync
 */

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import type { ConnectionState } from '../types/sync.types';

/**
 * Props for RetryConnectionButton component
 */
export interface RetryConnectionButtonProps {
  /** Current connection state */
  status: ConnectionState;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Function to trigger manual sync */
  onRetry: () => Promise<void>;
  /** Last error message (optional, for toast display) */
  lastError?: string | null;
}

/**
 * RetryConnectionButton Component
 *
 * Renders a retry button that is only visible when the connection is
 * disconnected or reconnecting. Triggers an immediate sync attempt
 * and shows appropriate feedback.
 *
 * @example
 * ```tsx
 * <RetryConnectionButton
 *   status="disconnected"
 *   isSyncing={false}
 *   onRetry={async () => await triggerSync()}
 *   lastError="Network timeout"
 * />
 * ```
 */
export function RetryConnectionButton({
  status,
  isSyncing,
  onRetry,
  lastError,
}: RetryConnectionButtonProps) {
  const { success, error } = useToast();

  // Only show button when not connected
  if (status === 'connected') {
    return null;
  }

  const handleRetry = async () => {
    try {
      await onRetry();
      // On success, show success toast
      success('Connection Restored', 'Successfully reconnected to Couch Managers');
    } catch (err) {
      // On error, show error toast with guidance
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      error(
        'Reconnection Failed',
        lastError || errorMessage || 'Please check your network connection and try again'
      );
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRetry}
      disabled={isSyncing}
      className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 hover:text-yellow-300"
      aria-label={isSyncing ? 'Reconnecting...' : 'Retry connection'}
    >
      <RefreshCw
        className={`h-4 w-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      {isSyncing ? 'Reconnecting...' : 'Retry Connection'}
    </Button>
  );
}

export default RetryConnectionButton;
