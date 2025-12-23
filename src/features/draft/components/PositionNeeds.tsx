/**
 * PositionNeeds Component
 *
 * Displays unfilled positions with counts using badge/chip components.
 * Hides filled positions and shows completion message when roster is complete.
 *
 * Story: 7.7 - Display Position Needs Summary
 */

import { memo, useMemo } from 'react';
import { cn } from '@/components/ui/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import type { DraftedPlayer, PositionRequirements } from '../types/roster.types';
import { DEFAULT_POSITION_REQUIREMENTS } from '../types/roster.types';

/** Re-export for backward compatibility */
export type PositionPlayer = DraftedPlayer;
export type { PositionRequirements } from '../types/roster.types';
export { DEFAULT_POSITION_REQUIREMENTS } from '../types/roster.types';

/**
 * Props for PositionNeeds component
 */
export interface PositionNeedsProps {
  /** Roster data organized by category */
  roster: {
    hitters: PositionPlayer[];
    pitchers: PositionPlayer[];
    bench: PositionPlayer[];
  };
  /** Position requirements from league settings */
  positionRequirements?: PositionRequirements;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Individual position need
 */
interface PositionNeed {
  position: string;
  needed: number;
}

/**
 * Position display order
 */
const POSITION_ORDER: string[] = ['C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP', 'UTIL', 'BN'];

/**
 * Count players at each position in roster
 */
function countPlayersByPosition(roster: PositionNeedsProps['roster']): Record<string, number> {
  const counts: Record<string, number> = {};

  // Count all players from all categories
  const allPlayers = [...roster.hitters, ...roster.pitchers, ...roster.bench];

  allPlayers.forEach(player => {
    const position = player.position;
    counts[position] = (counts[position] || 0) + 1;
  });

  return counts;
}

/**
 * Calculate position needs based on requirements and roster
 */
function calculatePositionNeeds(
  roster: PositionNeedsProps['roster'],
  requirements: PositionRequirements
): PositionNeed[] {
  const positionCounts = countPlayersByPosition(roster);
  const needs: PositionNeed[] = [];

  // Check each required position
  Object.entries(requirements).forEach(([position, required]) => {
    if (required === undefined || required === 0) return;

    const filled = positionCounts[position] || 0;
    const needed = required - filled;

    if (needed > 0) {
      needs.push({ position, needed });
    }
  });

  // Sort by position order
  needs.sort((a, b) => {
    const orderA = POSITION_ORDER.indexOf(a.position);
    const orderB = POSITION_ORDER.indexOf(b.position);
    const indexA = orderA === -1 ? 999 : orderA;
    const indexB = orderB === -1 ? 999 : orderB;
    return indexA - indexB;
  });

  return needs;
}

/**
 * Position need badge component
 */
function PositionBadge({ position, needed }: PositionNeed) {
  return (
    <Badge
      variant="outline"
      className="bg-slate-800 border-emerald-400/50 text-slate-200 hover:bg-slate-700"
      data-testid={`position-badge-${position}`}
      aria-label={`${position}: ${needed} slot${needed === 1 ? '' : 's'} needed`}
    >
      {position}: {needed}
    </Badge>
  );
}

/**
 * PositionNeeds component - Shows unfilled positions that need to be drafted
 *
 * @example
 * ```tsx
 * <PositionNeeds
 *   roster={{
 *     hitters: [{ playerId: '1', name: 'Mike Trout', position: 'OF', auctionPrice: 42 }],
 *     pitchers: [],
 *     bench: [],
 *   }}
 *   positionRequirements={{ C: 1, OF: 5, SP: 5, RP: 3 }}
 * />
 * ```
 */
export const PositionNeeds = memo(function PositionNeeds({
  roster,
  positionRequirements = DEFAULT_POSITION_REQUIREMENTS,
  className,
}: PositionNeedsProps) {
  const needs = useMemo(
    () => calculatePositionNeeds(roster, positionRequirements),
    [roster, positionRequirements]
  );

  const hasRequirements = Object.values(positionRequirements).some(v => v !== undefined && v > 0);

  // No requirements defined
  if (!hasRequirements) {
    return (
      <div
        className={cn('text-sm text-slate-500 italic', className)}
        data-testid="position-needs-no-requirements"
        role="status"
      >
        No position requirements set
      </div>
    );
  }

  // All positions filled
  if (needs.length === 0) {
    return (
      <div
        className={cn('flex items-center gap-2 text-emerald-400', className)}
        data-testid="position-needs-complete"
        role="status"
      >
        <CheckCircle className="w-5 h-5" aria-hidden="true" />
        <span className="font-medium">All positions filled!</span>
      </div>
    );
  }

  return (
    <div
      className={cn('space-y-2', className)}
      data-testid="position-needs"
      role="region"
      aria-label="Position needs"
    >
      <div className="text-xs text-slate-500 uppercase tracking-wider">Still Needed</div>
      <div className="flex flex-wrap gap-2" data-testid="position-badges">
        {needs.map(need => (
          <PositionBadge key={need.position} position={need.position} needed={need.needed} />
        ))}
      </div>
    </div>
  );
});

export default PositionNeeds;
