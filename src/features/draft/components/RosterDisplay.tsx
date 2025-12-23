/**
 * RosterDisplay Component
 *
 * Displays roster composition organized by position category (Hitters, Pitchers, Bench).
 * Shows player name, position, and auction price for each drafted player.
 * Provides scrollable content with empty state handling.
 *
 * Story: 7.5 - Display Roster Composition by Position
 */

import { memo, useMemo } from 'react';
import { cn } from '@/components/ui/utils';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Drafted player for roster display
 */
export interface RosterPlayer {
  /** Unique player identifier */
  playerId: string;
  /** Player display name */
  name: string;
  /** Player's primary position */
  position: string;
  /** Price paid at auction */
  auctionPrice: number;
}

/**
 * Props for RosterDisplay component
 */
export interface RosterDisplayProps {
  /** Roster data organized by category */
  roster: {
    hitters: RosterPlayer[];
    pitchers: RosterPlayer[];
    bench: RosterPlayer[];
  };
  /** Optional CSS class name */
  className?: string;
}

/**
 * Position sort order for displaying players within categories
 */
const POSITION_ORDER: Record<string, number> = {
  C: 1,
  '1B': 2,
  '2B': 3,
  SS: 4,
  '3B': 5,
  OF: 6,
  UTIL: 7,
  SP: 1,
  RP: 2,
  BN: 1,
};

/**
 * Sort players by position order
 */
function sortByPosition(players: RosterPlayer[]): RosterPlayer[] {
  return [...players].sort((a, b) => {
    const orderA = POSITION_ORDER[a.position] ?? 99;
    const orderB = POSITION_ORDER[b.position] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    // Secondary sort by name if same position
    return a.name.localeCompare(b.name);
  });
}

/**
 * Category header component
 */
function CategoryHeader({ title }: { title: string }) {
  return (
    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
      {title}
    </h4>
  );
}

/**
 * Individual player entry row
 */
function PlayerEntry({ player }: { player: RosterPlayer }) {
  return (
    <div
      className="flex justify-between items-center py-1 text-sm"
      data-testid={`player-entry-${player.playerId}`}
    >
      <span className="text-slate-200 truncate flex-1 mr-2">{player.name}</span>
      <span className="text-slate-400 text-xs w-8 text-center">{player.position}</span>
      <span className="text-slate-300 font-medium w-12 text-right">
        {formatCurrency(player.auctionPrice)}
      </span>
    </div>
  );
}

/**
 * Empty state message for a category
 */
function EmptyState({ category }: { category: string }) {
  return (
    <p
      className="text-sm text-slate-500 italic py-1"
      data-testid={`empty-${category.toLowerCase()}`}
    >
      No {category.toLowerCase()} drafted yet
    </p>
  );
}

/**
 * Player category section
 */
function CategorySection({
  title,
  players,
  testId,
}: {
  title: string;
  players: RosterPlayer[];
  testId: string;
}) {
  const sortedPlayers = useMemo(() => sortByPosition(players), [players]);

  return (
    <div data-testid={testId}>
      <CategoryHeader title={title} />
      {sortedPlayers.length > 0 ? (
        <div className="space-y-0.5">
          {sortedPlayers.map(player => (
            <PlayerEntry key={player.playerId} player={player} />
          ))}
        </div>
      ) : (
        <EmptyState category={title} />
      )}
    </div>
  );
}

/**
 * RosterDisplay component - Shows drafted players organized by position category
 *
 * @example
 * ```tsx
 * <RosterDisplay
 *   roster={{
 *     hitters: [{ playerId: '1', name: 'Mike Trout', position: 'OF', auctionPrice: 42 }],
 *     pitchers: [{ playerId: '2', name: 'Gerrit Cole', position: 'SP', auctionPrice: 28 }],
 *     bench: [],
 *   }}
 * />
 * ```
 */
export const RosterDisplay = memo(function RosterDisplay({
  roster,
  className,
}: RosterDisplayProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        'max-h-64 overflow-y-auto',
        'scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600',
        'roster-scroll',
        className
      )}
      data-testid="roster-display"
      role="region"
      aria-label="Roster composition by position"
    >
      <CategorySection title="Hitters" players={roster.hitters} testId="hitters-section" />
      <CategorySection title="Pitchers" players={roster.pitchers} testId="pitchers-section" />
      <CategorySection title="Bench" players={roster.bench} testId="bench-section" />

      {/* Custom scrollbar styles for dark theme */}
      <style>{`
        .roster-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .roster-scroll::-webkit-scrollbar-track {
          background: #1e293b; /* slate-800 */
        }
        .roster-scroll::-webkit-scrollbar-thumb {
          background: #475569; /* slate-600 */
          border-radius: 3px;
        }
        .roster-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b; /* slate-500 */
        }
      `}</style>
    </div>
  );
});

export default RosterDisplay;
