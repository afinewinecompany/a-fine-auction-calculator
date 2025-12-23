/**
 * Draft Types
 *
 * Type definitions for draft state persistence.
 * Enables users to resume drafts after navigating away.
 *
 * Story: 3.7 - Implement Resume Draft Functionality
 * Updated: 6.4 - Implement Sortable Table Columns
 * Updated: 6.8 - Implement Filter by Draft Status
 */

import type { SortState, SortColumn } from './sort.types';
import type { DraftPick, SyncStatus } from './sync.types';

/**
 * Status filter values for draft filtering
 * Story: 6.8 - Implement Filter by Draft Status
 */
export type StatusFilter = 'all' | 'available' | 'my-team';

/**
 * Filter state for PlayerQueue filtering
 * Story: 6.8 - Implement Filter by Draft Status
 */
export interface FilterState {
  /** Status filter: all, available, or my-team */
  status: StatusFilter;
  /** Position filter (future feature) */
  position?: string;
  /** Search term for name filtering */
  searchTerm: string;
}

/**
 * Default filter values
 * Story: 6.8 - Implement Filter by Draft Status
 */
export const DEFAULT_FILTER: FilterState = {
  status: 'available', // Default to showing available players
  position: undefined,
  searchTerm: '',
};

/**
 * Filter counts for status badge display
 * Story: 6.8 - Implement Filter by Draft Status
 */
export interface FilterCounts {
  all: number;
  available: number;
  myTeam: number;
}

/**
 * Individual player roster slot
 */
export interface RosterSlot {
  position: 'C' | '1B' | '2B' | '3B' | 'SS' | 'OF' | 'UTIL' | 'SP' | 'RP' | 'BN';
  playerId: string | null;
  playerName: string | null;
  purchasePrice: number | null;
}

/**
 * Drafted player record
 *
 * Updated: Story 10.5 - Added tier and isManualEntry fields
 * for inflation calculation accuracy in manual mode
 */
export interface DraftedPlayer {
  playerId: string;
  playerName: string;
  position: string;
  purchasePrice: number;
  projectedValue: number;
  variance: number; // purchasePrice - projectedValue
  draftedBy: 'user' | 'other';
  draftedAt: string;
  /**
   * Player tier assignment (ELITE, MID, LOWER) for tier-specific inflation
   * Story 10.5 - Required for tier inflation calculations
   */
  tier?: string;
  /**
   * Flag to track if this entry was manually entered vs auto-synced
   * Story 10.5 - Used for tracking/analytics, NOT used in calculations
   * (manual entries must produce identical results to auto sync)
   */
  isManualEntry?: boolean;
}

/**
 * Inflation tracking data
 */
export interface InflationData {
  currentInflationRate: number;
  moneySpent: number;
  moneyRemaining: number;
  playersRemaining: number;
  projectedValueRemaining: number;
  positionInflation: Record<string, number>;
  tierInflation: Record<string, number>;
}

/**
 * Complete draft state for a single league
 */
export interface LeagueDraftState {
  leagueId: string;
  roster: RosterSlot[];
  remainingBudget: number;
  initialBudget: number;
  draftedPlayers: DraftedPlayer[];
  inflationData: InflationData;
  startedAt: string;
  lastUpdatedAt: string;
}

/**
 * Draft store state
 * Updated: Story 10.1 - Detect API Connection Failures
 */
export interface DraftStoreState {
  drafts: Record<string, LeagueDraftState>;
  /** Current sort state for PlayerQueue */
  sortState: SortState;
  /** Current filter state for PlayerQueue (Story 6.8) */
  filterState: FilterState;
  /** Sync status per league (Story 10.1) */
  syncStatus: Record<string, SyncStatus>;
}

/**
 * Roster configuration from league settings
 */
export interface RosterConfig {
  hitters: number;
  pitchers: number;
  bench: number;
}

/**
 * Draft store actions
 * Updated: Story 10.1 - Detect API Connection Failures
 * Updated: Story 10.4 - Implement My Team Checkbox
 */
export interface DraftStoreActions {
  initializeDraft: (leagueId: string, initialBudget: number, rosterConfig: RosterConfig) => void;
  updateRoster: (leagueId: string, roster: RosterSlot[]) => void;
  updateBudget: (leagueId: string, remainingBudget: number) => void;
  addDraftedPlayer: (leagueId: string, player: Omit<DraftedPlayer, 'draftedAt'>) => void;
  /** Add multiple drafted players from Couch Managers sync (Story 9.3) */
  addDraftedPlayers: (leagueId: string, picks: DraftPick[]) => void;
  updateInflationData: (leagueId: string, data: Partial<InflationData>) => void;
  clearDraft: (leagueId: string) => void;
  getDraft: (leagueId: string) => LeagueDraftState | undefined;
  hasDraftInProgress: (leagueId: string) => boolean;
  /** Set sort state directly */
  setSort: (sort: SortState) => void;
  /** Toggle sort for a column (asc/desc or switch column) */
  toggleSort: (column: SortColumn) => void;
  /** Reset sort to default (adjustedValue descending) */
  resetSort: () => void;
  /** Set status filter (Story 6.8) */
  setStatusFilter: (status: StatusFilter) => void;
  /** Set search term filter (Story 6.8) */
  setSearchFilter: (searchTerm: string) => void;
  /** Clear all filters to defaults (Story 6.8) */
  clearFilters: () => void;
  /** Add player to roster slot (Story 10.4) */
  addToRoster: (
    leagueId: string,
    playerId: string,
    playerName: string,
    position: string,
    purchasePrice: number
  ) => boolean;

  // Sync failure tracking actions (Story 10.1)
  /** Update sync status for a league */
  updateSyncStatus: (leagueId: string, status: Partial<SyncStatus>) => void;
  /** Increment failure count and set failure type */
  incrementFailureCount: (
    leagueId: string,
    failureType: SyncStatus['failureType'],
    error: string
  ) => void;
  /** Reset failure count on successful sync */
  resetFailureCount: (leagueId: string) => void;
  /** Enable manual sync mode for a league */
  enableManualMode: (leagueId: string) => void;
  /** Disable manual sync mode for a league */
  disableManualMode: (leagueId: string) => void;
  /** Get sync status for a league */
  getSyncStatus: (leagueId: string) => SyncStatus;
}
