/**
 * DraftStatusBadge Component
 *
 * Displays a color-coded badge indicating draft status.
 * Uses consistent colors across the admin interface.
 *
 * Story: 13.2 - Display Active Drafts List
 *
 * @example
 * ```tsx
 * <DraftStatusBadge status="active" />
 * <DraftStatusBadge status="error" />
 * ```
 */

import type { DraftStatus } from '../types/admin.types';

interface DraftStatusBadgeProps {
  /** The draft status to display */
  status: DraftStatus;
}

/** Status configuration for badge colors and labels */
const statusConfig: Record<
  DraftStatus,
  {
    label: string;
    className: string;
  }
> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500 text-white',
  },
  paused: {
    label: 'Paused',
    className: 'bg-yellow-500 text-black',
  },
  error: {
    label: 'Error',
    className: 'bg-red-500 text-white',
  },
  completed: {
    label: 'Completed',
    className: 'bg-slate-600 text-white',
  },
};

export function DraftStatusBadge({ status }: DraftStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
      role="status"
      aria-label={`Draft status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
