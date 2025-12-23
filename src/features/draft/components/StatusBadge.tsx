/**
 * StatusBadge Component
 *
 * Displays the draft status of a player using shadcn/ui Badge.
 * Shows "Available", "My Team", or "Team {N}" based on status.
 *
 * Story: 6.7 - Display Player Draft Status
 *
 * Visual Treatment:
 * - Available: Outline badge (default look)
 * - My Team: Emerald filled badge (highlight user's picks)
 * - Drafted: Secondary badge with team number
 *
 * @example
 * ```tsx
 * <StatusBadge status="available" />
 * <StatusBadge status="my-team" />
 * <StatusBadge status="drafted" teamNumber={5} />
 * ```
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import type { DraftStatus } from '../types/player.types';

export interface StatusBadgeProps {
  /** The draft status to display */
  status: DraftStatus;
  /** Team number for drafted status (optional) */
  teamNumber?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get the display text for a draft status
 */
function getStatusText(status: DraftStatus, teamNumber?: number): string {
  switch (status) {
    case 'available':
      return 'Available';
    case 'my-team':
      return 'My Team';
    case 'drafted':
      return teamNumber ? `Team ${teamNumber}` : 'Drafted';
    default:
      return 'Unknown';
  }
}

/**
 * Get the aria-label for accessibility
 */
function getAriaLabel(status: DraftStatus, teamNumber?: number): string {
  switch (status) {
    case 'available':
      return 'Player status: Available';
    case 'my-team':
      return 'Player status: On my team';
    case 'drafted':
      return teamNumber ? `Player status: Drafted by team ${teamNumber}` : 'Player status: Drafted';
    default:
      return 'Player status: Unknown';
  }
}

/**
 * StatusBadge component for displaying player draft status
 */
export function StatusBadge({ status, teamNumber, className }: StatusBadgeProps) {
  const text = getStatusText(status, teamNumber);
  const ariaLabel = getAriaLabel(status, teamNumber);

  // Available status - outline variant
  if (status === 'available') {
    return (
      <Badge variant="outline" className={cn('text-slate-300', className)} aria-label={ariaLabel}>
        {text}
      </Badge>
    );
  }

  // My Team status - emerald filled badge
  if (status === 'my-team') {
    return (
      <Badge
        className={cn('bg-emerald-500 text-white hover:bg-emerald-600', className)}
        aria-label={ariaLabel}
      >
        {text}
      </Badge>
    );
  }

  // Drafted by other team - secondary variant
  return (
    <Badge variant="secondary" className={className} aria-label={ariaLabel}>
      {text}
    </Badge>
  );
}

export default StatusBadge;
