/**
 * RosterOverview Component
 *
 * Displays the user's complete drafted roster organized by position groups:
 * Hitters, Pitchers, and Bench. Shows player count and total spending per group.
 *
 * Story: 12.1 - Create Post-Draft Summary Component (placeholder)
 * Story: 12.2 - Display Complete Roster Organized by Position (full implementation)
 */

import type { RosterOverviewProps } from '../types/summary.types';
import type { DraftedPlayer } from '../types/draft.types';
import { groupPlayersByPosition, type GroupedRoster } from '../utils/rosterGrouping';
import { PlayerCard } from './PlayerCard';

/**
 * Calculates total spending for a group of players
 */
function calculateGroupTotal(players: DraftedPlayer[]): number {
  return players.reduce((sum, player) => sum + player.purchasePrice, 0);
}

/**
 * Formats a number as currency with dollar sign
 */
function formatCurrency(value: number): string {
  return `$${value}`;
}

/**
 * Props for the PositionGroup sub-component
 */
interface PositionGroupProps {
  /** Section title (Hitters, Pitchers, Bench) */
  title: string;
  /** Players in this group */
  players: DraftedPlayer[];
}

/**
 * PositionGroup renders a section with players of a specific category
 */
function PositionGroup({ title, players }: PositionGroupProps) {
  const totalSpent = calculateGroupTotal(players);
  const playerCount = players.length;
  const playerLabel = playerCount === 1 ? 'player' : 'players';

  return (
    <section aria-labelledby={`${title.toLowerCase()}-heading`} role="region" aria-label={title}>
      {/* Section header with emerald accent */}
      <div className="flex items-center justify-between mb-3">
        <h3
          id={`${title.toLowerCase()}-heading`}
          className="text-emerald-400 font-semibold text-lg"
        >
          {title}
        </h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400">
            {playerCount} {playerLabel}
          </span>
          <span className="text-white font-medium">{formatCurrency(totalSpent)}</span>
        </div>
      </div>

      {/* Player cards grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {players.map(player => (
          <PlayerCard key={player.playerId} player={player} />
        ))}
      </div>
    </section>
  );
}

/**
 * RosterOverview displays the user's drafted roster organized by position.
 * Groups players into Hitters, Pitchers, and Bench sections.
 *
 * @param roster - Array of drafted players
 * @param rosterSummary - Optional roster summary statistics
 */
export function RosterOverview({ roster, rosterSummary }: RosterOverviewProps) {
  const groupedRoster: GroupedRoster = groupPlayersByPosition(roster);

  const hasHitters = groupedRoster.hitters.length > 0;
  const hasPitchers = groupedRoster.pitchers.length > 0;
  const hasBench = groupedRoster.bench.length > 0;
  const hasAnyPlayers = hasHitters || hasPitchers || hasBench;

  return (
    <section
      className="bg-slate-900 rounded-lg p-6"
      aria-labelledby="roster-overview-heading"
      role="region"
      aria-label="Roster Overview"
    >
      <h2 id="roster-overview-heading" className="text-xl font-bold text-white mb-4">
        Roster Overview
      </h2>

      {!hasAnyPlayers ? (
        <div className="text-slate-400">
          <p className="text-center py-8">No players drafted yet.</p>
          {rosterSummary && (
            <p className="text-sm text-center">0/{rosterSummary.totalSlots} slots filled</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Roster summary */}
          {rosterSummary && (
            <p className="text-sm text-slate-400">
              {roster.length} player{roster.length !== 1 ? 's' : ''} drafted
              {` (${rosterSummary.filledSlots}/${rosterSummary.totalSlots} slots filled)`}
            </p>
          )}

          {/* Hitters section */}
          {hasHitters && <PositionGroup title="Hitters" players={groupedRoster.hitters} />}

          {/* Pitchers section */}
          {hasPitchers && <PositionGroup title="Pitchers" players={groupedRoster.pitchers} />}

          {/* Bench section */}
          {hasBench && <PositionGroup title="Bench" players={groupedRoster.bench} />}
        </div>
      )}
    </section>
  );
}

export default RosterOverview;
