/**
 * LastSyncTimestamp Component
 *
 * Displays the last successful sync timestamp with relative time formatting,
 * absolute time tooltip, auto-update every minute, and stale data warning.
 *
 * Story: 9.5 - Display Last Successful Sync Timestamp
 *
 * Features:
 * - Relative time display: "Last synced: 2 minutes ago"
 * - Tooltip with absolute timestamp: "Dec 12, 2025 3:42 PM"
 * - Auto-updates every minute
 * - Warning badge when sync lag exceeds 30 minutes (NFR-I5)
 */

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Props for LastSyncTimestamp component
 */
export interface LastSyncTimestampProps {
  /** Last successful sync timestamp */
  lastSync: Date | null;
}

/**
 * Threshold in minutes for stale data warning (NFR-I5)
 */
const STALE_THRESHOLD_MINUTES = 30;

/**
 * Check if sync is stale (exceeds 30 minutes threshold)
 */
function isStale(lastSync: Date): boolean {
  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes >= STALE_THRESHOLD_MINUTES;
}

/**
 * LastSyncTimestamp Component
 *
 * Displays when the last successful sync occurred with:
 * - Relative time formatting (e.g., "2 minutes ago")
 * - Absolute timestamp on hover (e.g., "Dec 12, 2025 3:42 PM")
 * - Auto-update every minute
 * - Stale data warning when lag exceeds 30 minutes
 *
 * @example
 * ```tsx
 * <LastSyncTimestamp lastSync={new Date()} />
 * ```
 */
export function LastSyncTimestamp({ lastSync }: LastSyncTimestampProps) {
  // State to trigger re-renders for auto-update
  const [, setTick] = useState(0);

  // Set up auto-update interval
  useEffect(() => {
    if (!lastSync) {
      return;
    }

    // Update every minute (60000ms)
    const intervalId = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lastSync]);

  // Don't render if no sync has occurred
  if (!lastSync) {
    return null;
  }

  const stale = isStale(lastSync);
  const relativeTime = formatDistanceToNow(lastSync, { addSuffix: true });
  const absoluteTime = format(lastSync, 'MMM d, yyyy h:mm a');

  const ariaLabel = stale
    ? `Last synced ${relativeTime} - data may be stale`
    : `Last synced ${relativeTime}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="status"
          aria-label={ariaLabel}
          className={`
            inline-flex items-center gap-1.5 text-sm cursor-default
            ${stale ? 'text-amber-400' : 'text-slate-400'}
          `}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Last synced: <span className="font-medium">{relativeTime}</span>
          </span>
          {stale && (
            <span className="inline-flex items-center gap-1 bg-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded text-xs font-medium">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              Stale
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{absoluteTime}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default LastSyncTimestamp;
