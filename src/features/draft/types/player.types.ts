/**
 * Player Types for PlayerQueue Component
 *
 * Type definitions for player display in the draft queue.
 *
 * Story: 6.2 - Implement PlayerQueue Component Foundation
 * Updated: 6.4 - Implement Sortable Table Columns
 * Updated: 6.6 - Implement Color-Coded Value Indicators
 * Updated: 10.3 - Implement Manual Bid Entry
 */

import type { SortState, SortColumn } from './sort.types';

/**
 * Player tier assignment for value classification
 */
export type PlayerTier = 'ELITE' | 'MID' | 'LOWER';

/**
 * Draft status for a player
 */
export type DraftStatus = 'available' | 'drafted' | 'my-team';

/**
 * Player data for display in PlayerQueue
 */
export interface Player {
  /** Unique player identifier */
  id: string;
  /** Player full name */
  name: string;
  /** Array of eligible positions */
  positions: string[];
  /** MLB team abbreviation */
  team: string;
  /** Original projected value */
  projectedValue: number;
  /** Inflation-adjusted value */
  adjustedValue: number;
  /** Player tier classification */
  tier: PlayerTier;
  /** Current draft status */
  status: DraftStatus;
  /** Team number that drafted player (if drafted) */
  draftedByTeam?: number;
  /** Auction price paid for the player (if drafted) */
  auctionPrice?: number;
}

/**
 * Props for the PlayerQueue component
 */
export interface PlayerQueueProps {
  /** Array of players to display */
  players: Player[];
  /** Callback when a player row is selected */
  onPlayerSelect: (player: Player) => void;
  /** Optional CSS class name */
  className?: string;
  /** Whether the table is loading */
  isLoading?: boolean;
  /** Current sort state (optional - enables sorting when provided) */
  sortState?: SortState;
  /** Callback when sort changes (required if sortState is provided) */
  onSortChange?: (column: SortColumn) => void;
  /** Whether manual sync mode is active (Story 10.2) */
  isManualMode?: boolean;
  /** Callback when a bid is submitted for a player (Story 10.2/10.3) - includes isMyTeam flag */
  onBidSubmit?: (playerId: string, bid: number, isMyTeam: boolean) => void;
  /** Callback when "My Team" is toggled for a player (Story 10.2) */
  onMyTeamToggle?: (playerId: string, isMyTeam: boolean) => void;
  /** Remaining budget for the user's team (Story 10.4 - budget validation) */
  remainingBudget?: number;
}

/**
 * Column configuration for the PlayerQueue table
 */
export interface PlayerQueueColumn {
  /** Column identifier */
  id: keyof Player | 'actions';
  /** Display label for column header */
  label: string;
  /** Column width CSS value */
  width?: string;
  /** Whether column is sticky */
  sticky?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}
