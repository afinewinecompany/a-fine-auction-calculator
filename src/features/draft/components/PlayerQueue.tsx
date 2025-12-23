/**
 * PlayerQueue Component
 *
 * Displays the player list during drafts with a responsive table.
 * Uses dark slate theme and sticky first column for mobile.
 * Supports sortable columns when sort props are provided.
 *
 * Story: 6.2 - Implement PlayerQueue Component Foundation
 * Updated: 6.4 - Implement Sortable Table Columns
 * Updated: 6.5 - Display Adjusted Values with Prominent Styling
 * Updated: 6.6 - Implement Color-Coded Value Indicators
 * Updated: 6.7 - Display Player Draft Status
 * Updated: 6.9 - Display Player Tier Assignments
 * Updated: 6.10 - Implement Mobile-Responsive Design
 * Updated: 10.2 - Enable Manual Sync Mode
 * Updated: 10.3 - Implement Manual Bid Entry
 * Updated: 10.4 - Implement My Team Checkbox (Budget Validation)
 */

import { useMemo, useState } from 'react';
import { cn } from '@/components/ui/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SortableHeader } from './SortableHeader';
import { StatusBadge } from './StatusBadge';
import { TierBadge } from './TierBadge';
import { ValueIndicator } from './ValueIndicator';
import { BidInput } from './BidInput';
import { MyTeamCheckbox } from './MyTeamCheckbox';
import { getValueRowBackground } from '../utils/classifyValue';
import { formatCurrency } from '../utils/formatCurrency';
import { DEFAULT_SORT } from '../types/sort.types';
import type { Player, PlayerQueueProps, DraftStatus } from '../types/player.types';
import type { SortColumn } from '../types/sort.types';

/**
 * Format positions for display
 */
function formatPositions(positions: string[]): string {
  return positions.join(', ');
}

/**
 * Get row styling based on player draft status (Story 6.7)
 *
 * - Available: Normal styling, full opacity
 * - My Team: Emerald border highlight, full opacity
 * - Drafted by others: Reduced opacity (grayed out)
 */
function getRowStatusStyles(status: DraftStatus): string {
  switch (status) {
    case 'available':
      return 'hover:bg-slate-800/50';
    case 'my-team':
      return 'border-l-4 border-l-emerald-500 hover:bg-slate-800/50';
    case 'drafted':
      return 'opacity-60 hover:bg-slate-900/50';
    default:
      return 'hover:bg-slate-800/50';
  }
}

/**
 * PlayerQueue component for displaying players in a draft
 */
export function PlayerQueue({
  players,
  onPlayerSelect,
  className,
  isLoading = false,
  sortState,
  onSortChange,
  isManualMode = false,
  onBidSubmit,
  onMyTeamToggle,
  remainingBudget,
}: PlayerQueueProps) {
  // Determine if sorting is enabled
  const isSortable = sortState !== undefined && onSortChange !== undefined;
  // Use provided sort state or default for display
  const currentSort = sortState ?? DEFAULT_SORT;

  // Calculate player counts for status display (Story 6.7)
  const { availableCount, totalCount } = useMemo(() => {
    const available = players.filter(p => p.status === 'available').length;
    return { availableCount: available, totalCount: players.length };
  }, [players]);

  // Handle sort column click
  const handleSort = (column: SortColumn) => {
    if (onSortChange) {
      onSortChange(column);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('bg-slate-950 rounded-lg p-8 text-center', className)}>
        <div className="text-slate-400">Loading players...</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className={cn('bg-slate-950 rounded-lg p-8 text-center', className)}>
        <div className="text-slate-400">No players available</div>
      </div>
    );
  }

  return (
    <div className={cn('bg-slate-950 rounded-lg overflow-hidden', className)}>
      {/* Player count display (Story 6.7) */}
      <div
        className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-sm text-slate-400"
        data-testid="player-count"
        aria-live="polite"
      >
        Showing {availableCount} available of {totalCount} total players
      </div>

      <div className="overflow-x-auto scroll-smooth touch-pan-x transform-gpu">
        <Table className="min-w-[800px] w-full">
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800 hover:bg-slate-900">
              {/* Render sortable or static headers based on props */}
              {isSortable ? (
                <>
                  <SortableHeader
                    column="name"
                    label="Player"
                    currentSort={currentSort}
                    onSort={handleSort}
                    sticky
                    minWidth="160px"
                  />
                  <SortableHeader
                    column="positions"
                    label="Positions"
                    currentSort={currentSort}
                    onSort={handleSort}
                    minWidth="100px"
                  />
                  <SortableHeader
                    column="team"
                    label="Team"
                    currentSort={currentSort}
                    onSort={handleSort}
                    minWidth="60px"
                  />
                  <SortableHeader
                    column="projectedValue"
                    label="Proj. Value"
                    currentSort={currentSort}
                    onSort={handleSort}
                    align="right"
                    minWidth="80px"
                  />
                  <SortableHeader
                    column="adjustedValue"
                    label="Adj. Value"
                    currentSort={currentSort}
                    onSort={handleSort}
                    align="right"
                    minWidth="100px"
                    className="font-semibold"
                  />
                  <SortableHeader
                    column="tier"
                    label="Tier"
                    currentSort={currentSort}
                    onSort={handleSort}
                    align="center"
                    minWidth="60px"
                  />
                  <SortableHeader
                    column="status"
                    label="Status"
                    currentSort={currentSort}
                    onSort={handleSort}
                    minWidth="80px"
                  />
                  {/* Value indicator header (Story 6.6) - not sortable */}
                  <TableHead className="text-slate-100 min-w-[80px]">Value</TableHead>
                  {/* Manual mode columns (Story 10.2) */}
                  {isManualMode && (
                    <>
                      <TableHead className="text-slate-100 text-right min-w-[70px]">Bid</TableHead>
                      <TableHead className="text-slate-100 text-center min-w-[70px]">
                        My Team
                      </TableHead>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Static headers for backward compatibility */}
                  <TableHead
                    className="sticky left-0 z-10 bg-slate-900 text-slate-100 min-w-[160px]"
                    aria-label="Player Name"
                  >
                    Player
                  </TableHead>
                  <TableHead className="text-slate-100 min-w-[100px]">Positions</TableHead>
                  <TableHead className="text-slate-100 min-w-[60px]">Team</TableHead>
                  <TableHead className="text-slate-100 text-right min-w-[80px]">
                    Proj. Value
                  </TableHead>
                  <TableHead className="text-slate-100 text-right min-w-[100px] font-semibold">
                    Adj. Value
                  </TableHead>
                  <TableHead className="text-slate-100 text-center min-w-[60px]">Tier</TableHead>
                  <TableHead className="text-slate-100 min-w-[80px]">Status</TableHead>
                  {/* Value indicator header (Story 6.6) */}
                  <TableHead className="text-slate-100 min-w-[80px]">Value</TableHead>
                  {/* Manual mode columns (Story 10.2) */}
                  {isManualMode && (
                    <>
                      <TableHead className="text-slate-100 text-right min-w-[70px]">Bid</TableHead>
                      <TableHead className="text-slate-100 text-center min-w-[70px]">
                        My Team
                      </TableHead>
                    </>
                  )}
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map(player => (
              <PlayerRow
                key={player.id}
                player={player}
                onSelect={onPlayerSelect}
                isManualMode={isManualMode}
                onBidSubmit={onBidSubmit}
                onMyTeamToggle={onMyTeamToggle}
                remainingBudget={remainingBudget}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/**
 * Individual player row component
 */
interface PlayerRowProps {
  player: Player;
  onSelect: (player: Player) => void;
  /** Whether manual sync mode is active (Story 10.2) */
  isManualMode?: boolean;
  /** Callback when a bid is submitted (Story 10.2/10.3) - includes isMyTeam flag */
  onBidSubmit?: (playerId: string, bid: number, isMyTeam: boolean) => void;
  /** Callback when "My Team" is toggled (Story 10.2) */
  onMyTeamToggle?: (playerId: string, isMyTeam: boolean) => void;
  /** Remaining budget for budget validation (Story 10.4) */
  remainingBudget?: number;
}

function PlayerRow({
  player,
  onSelect,
  isManualMode = false,
  onBidSubmit,
  onMyTeamToggle,
  remainingBudget,
}: PlayerRowProps) {
  const isDrafted = player.status === 'drafted' || player.status === 'my-team';
  // Track local isMyTeam state for manual mode checkbox (Story 10.3)
  // Initialize from player.status but allow local toggle before bid submission
  const [localIsMyTeam, setLocalIsMyTeam] = useState(player.status === 'my-team');

  // Get value-based background color for drafted players (Story 6.6)
  const valueBackground = isDrafted
    ? getValueRowBackground(player.auctionPrice, player.adjustedValue)
    : '';

  // Get status-based row styling (Story 6.7)
  const statusStyles = getRowStatusStyles(player.status);

  const handleClick = () => {
    onSelect(player);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(player);
    }
  };

  /**
   * Handle My Team checkbox toggle (Story 10.3)
   * Updates local state and notifies parent
   */
  const handleMyTeamToggle = (playerId: string, isChecked: boolean) => {
    setLocalIsMyTeam(isChecked);
    if (onMyTeamToggle) {
      onMyTeamToggle(playerId, isChecked);
    }
  };

  /**
   * Handle bid submission from BidInput (Story 10.3)
   * Uses localIsMyTeam state instead of the parameter from BidInput
   */
  const handleBidSubmit = (playerId: string, bid: number, _bidIsMyTeam: boolean) => {
    if (onBidSubmit) {
      // Use localIsMyTeam which reflects the current checkbox state
      onBidSubmit(playerId, bid, localIsMyTeam);
    }
  };

  return (
    <TableRow
      className={cn(
        'border-slate-800 cursor-pointer transition-colors',
        'min-h-[44px]', // Minimum touch target height
        valueBackground, // Color-coded background for drafted players (Story 6.6)
        statusStyles // Status-based styling (Story 6.7)
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${player.name}`}
      data-status={player.status}
      data-value-classification={isDrafted ? 'classified' : 'none'}
    >
      {/* Sticky first column */}
      <TableCell
        className={cn(
          'sticky left-0 z-10 bg-slate-950 font-medium text-slate-100 border-r border-slate-800',
          'transform-gpu', // GPU acceleration for smooth scrolling
          'min-h-[44px] py-3' // Touch target padding
        )}
      >
        {player.name}
      </TableCell>
      <TableCell className="text-slate-400 py-3">{formatPositions(player.positions)}</TableCell>
      <TableCell className="text-slate-400 py-3">{player.team}</TableCell>
      {/* Projected Value - secondary styling per Story 6.5 */}
      <TableCell className="text-sm text-slate-400 text-right py-3">
        <span
          data-testid="projected-value"
          aria-label={`Projected value: ${formatCurrency(player.projectedValue)}`}
        >
          {formatCurrency(player.projectedValue)}
        </span>
      </TableCell>
      {/* Adjusted Value - prominent styling per Story 6.5 UX spec */}
      <TableCell className="text-right py-3">
        <span
          className="text-xl font-bold text-emerald-400"
          data-testid="adjusted-value"
          aria-label={`Adjusted value: ${formatCurrency(player.adjustedValue)}`}
        >
          {formatCurrency(player.adjustedValue)}
        </span>
      </TableCell>
      <TableCell className="text-center py-3">
        <TierBadge tier={player.tier} />
      </TableCell>
      {/* Status badge (Story 6.7) */}
      <TableCell className="py-3">
        <StatusBadge status={player.status} teamNumber={player.draftedByTeam} />
      </TableCell>
      {/* Value indicator for drafted players (Story 6.6) */}
      <TableCell className="py-3">
        <ValueIndicator actualPrice={player.auctionPrice} adjustedValue={player.adjustedValue} />
      </TableCell>
      {/* Manual mode columns (Story 10.2/10.3) */}
      {isManualMode && (
        <>
          <TableCell className="py-3 text-right">
            <BidInput
              playerId={player.id}
              playerName={player.name}
              currentBid={player.auctionPrice}
              onSubmit={handleBidSubmit}
              isMyTeam={localIsMyTeam}
              remainingBudget={remainingBudget}
              disabled={isDrafted}
            />
          </TableCell>
          <TableCell className="py-3">
            <MyTeamCheckbox
              playerId={player.id}
              playerName={player.name}
              isChecked={localIsMyTeam}
              onToggle={handleMyTeamToggle}
              disabled={player.status === 'drafted'}
            />
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

export default PlayerQueue;
