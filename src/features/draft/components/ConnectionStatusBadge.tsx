/**
 * ConnectionStatusBadge Component
 *
 * Displays the connection status for Couch Managers integration with
 * four states: Connected (green), Reconnecting (yellow), Disconnected (red),
 * and Manual Mode (yellow).
 * Includes a tooltip showing last sync time on hover.
 *
 * Story: 9.4 - Display Connection Status Indicators
 * Updated: 10.2 - Enable Manual Sync Mode
 *
 * Features:
 * - Color-coded badges (green, yellow, red) for visual status
 * - Icons for each state (CheckCircle, RefreshCw, XCircle, Edit3)
 * - Manual Mode badge with yellow styling (Story 10.2)
 * - Tooltip with last sync time on hover
 * - Real-time updates based on sync results
 */

import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, RefreshCw, XCircle, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ConnectionState } from '../types/sync.types';

/**
 * Props for ConnectionStatusBadge component
 */
export interface ConnectionStatusBadgeProps {
  /** Current connection state */
  status: ConnectionState;
  /** Last successful sync timestamp */
  lastSync: Date | null;
  /** Whether a sync is currently in progress */
  isSyncing?: boolean;
}

/**
 * Configuration for each connection state
 */
const STATUS_CONFIG = {
  connected: {
    label: 'Connected',
    icon: CheckCircle,
    badgeClass: 'bg-emerald-900/20 text-emerald-400 border-emerald-600',
    iconClass: 'text-emerald-400',
    tooltipSuffix: '',
  },
  reconnecting: {
    label: 'Reconnecting',
    icon: RefreshCw,
    badgeClass: 'bg-yellow-900/20 text-yellow-400 border-yellow-600',
    iconClass: 'text-yellow-400',
    tooltipSuffix: '',
  },
  disconnected: {
    label: 'Disconnected',
    icon: XCircle,
    badgeClass: 'bg-red-900/20 text-red-400 border-red-600',
    iconClass: 'text-red-400',
    tooltipSuffix: '',
  },
  // Story 10.2: Manual Mode state
  manual: {
    label: 'Manual Mode',
    icon: Edit3,
    badgeClass: 'bg-yellow-900/20 text-yellow-400 border-yellow-600',
    iconClass: 'text-yellow-400',
    tooltipSuffix: 'Automatic sync failed. Enter bids manually.',
  },
} as const;

/**
 * ConnectionStatusBadge Component
 *
 * Renders a color-coded badge indicating connection status with Couch Managers.
 * Hovering shows a tooltip with the last successful sync time.
 *
 * @example
 * ```tsx
 * <ConnectionStatusBadge
 *   status="connected"
 *   lastSync={new Date()}
 *   isSyncing={false}
 * />
 * ```
 */
export function ConnectionStatusBadge({
  status,
  lastSync,
  isSyncing = false,
}: ConnectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  // Format the tooltip content
  const lastSyncText = lastSync
    ? `Last sync: ${formatDistanceToNow(lastSync, { addSuffix: true })}`
    : 'No sync yet';

  // Story 10.2: Include tooltipSuffix for manual mode
  const tooltipContent = config.tooltipSuffix
    ? `${config.tooltipSuffix}\n${lastSyncText}`
    : lastSyncText;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`${config.badgeClass} gap-1.5 cursor-default`}
          role="status"
          aria-label={`Connection status: ${config.label}`}
          data-testid="connection-status-badge"
        >
          <Icon
            className={`h-3 w-3 ${config.iconClass} ${
              status === 'reconnecting' || isSyncing ? 'animate-spin' : ''
            }`}
            aria-hidden="true"
          />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="whitespace-pre-line">{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default ConnectionStatusBadge;
