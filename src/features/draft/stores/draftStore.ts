/**
 * Draft Store (Zustand with Persist)
 *
 * Global state management for draft data with localStorage persistence.
 * Enables users to resume drafts after navigating away.
 *
 * Story: 3.7 - Implement Resume Draft Functionality
 * Updated: 6.4 - Implement Sortable Table Columns
 * Updated: 6.8 - Implement Filter by Draft Status
 * Updated: 10.4 - Implement My Team Checkbox (addToRoster action)
 * Architecture: NFR-R4 - Zero Data Loss via Zustand persist
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  DraftStoreState,
  DraftStoreActions,
  LeagueDraftState,
  RosterSlot,
  DraftedPlayer,
  InflationData,
  RosterConfig,
  StatusFilter,
} from '../types/draft.types';
import type { DraftPick, SyncStatus } from '../types/sync.types';
import { DEFAULT_SYNC_STATUS, DISCONNECTED_FAILURE_THRESHOLD } from '../types/sync.types';
import { DEFAULT_SORT } from '../types/sort.types';
import { DEFAULT_FILTER } from '../types/draft.types';
import type { SortColumn, SortState } from '../types/sort.types';

/**
 * Generate initial roster slots based on configuration
 */
const generateInitialRoster = (config: RosterConfig): RosterSlot[] => {
  const slots: RosterSlot[] = [];

  // Standard positions - simplified for now, will expand in Epic 6
  const positions: RosterSlot['position'][] = [
    'C',
    '1B',
    '2B',
    '3B',
    'SS',
    'OF',
    'OF',
    'OF',
    'UTIL',
  ];
  const pitcherPositions: RosterSlot['position'][] = [
    'SP',
    'SP',
    'SP',
    'SP',
    'SP',
    'RP',
    'RP',
    'RP',
    'RP',
  ];

  // Add hitter slots
  for (let i = 0; i < Math.min(config.hitters, positions.length); i++) {
    slots.push({
      position: positions[i],
      playerId: null,
      playerName: null,
      purchasePrice: null,
    });
  }

  // Add pitcher slots
  for (let i = 0; i < Math.min(config.pitchers, pitcherPositions.length); i++) {
    slots.push({
      position: pitcherPositions[i],
      playerId: null,
      playerName: null,
      purchasePrice: null,
    });
  }

  // Add bench slots
  for (let i = 0; i < config.bench; i++) {
    slots.push({
      position: 'BN',
      playerId: null,
      playerName: null,
      purchasePrice: null,
    });
  }

  return slots;
};

/**
 * Initial inflation data
 */
const initialInflationData: InflationData = {
  currentInflationRate: 0,
  moneySpent: 0,
  moneyRemaining: 0,
  playersRemaining: 0,
  projectedValueRemaining: 0,
  positionInflation: {},
  tierInflation: {},
};

/**
 * Draft store with localStorage persistence
 *
 * @example
 * ```typescript
 * const { initializeDraft, hasDraftInProgress } = useDraftStore();
 *
 * // Check if draft exists
 * if (hasDraftInProgress(leagueId)) {
 *   // Show "Resume Draft" button
 * }
 *
 * // Initialize new draft
 * initializeDraft(leagueId, 260, { hitters: 14, pitchers: 9, bench: 3 });
 * ```
 */
export const useDraftStore = create<DraftStoreState & DraftStoreActions>()(
  persist(
    (set, get) => ({
      drafts: {},
      sortState: DEFAULT_SORT,
      filterState: DEFAULT_FILTER,
      syncStatus: {},

      /**
       * Initialize a new draft for a league
       */
      initializeDraft: (leagueId: string, initialBudget: number, rosterConfig: RosterConfig) => {
        const existingDraft = get().drafts[leagueId];

        // Don't overwrite existing draft
        if (existingDraft) {
          return;
        }

        const newDraft: LeagueDraftState = {
          leagueId,
          roster: generateInitialRoster(rosterConfig),
          remainingBudget: initialBudget,
          initialBudget,
          draftedPlayers: [],
          inflationData: {
            ...initialInflationData,
            moneyRemaining: initialBudget,
          },
          startedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        };

        set(state => ({
          drafts: {
            ...state.drafts,
            [leagueId]: newDraft,
          },
        }));
      },

      /**
       * Update roster for a league
       */
      updateRoster: (leagueId: string, roster: RosterSlot[]) => {
        set(state => {
          const draft = state.drafts[leagueId];
          if (!draft) return state;

          return {
            drafts: {
              ...state.drafts,
              [leagueId]: {
                ...draft,
                roster,
                lastUpdatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      /**
       * Update remaining budget for a league
       */
      updateBudget: (leagueId: string, remainingBudget: number) => {
        set(state => {
          const draft = state.drafts[leagueId];
          if (!draft) return state;

          return {
            drafts: {
              ...state.drafts,
              [leagueId]: {
                ...draft,
                remainingBudget,
                lastUpdatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      /**
       * Add a drafted player
       */
      addDraftedPlayer: (leagueId: string, player: Omit<DraftedPlayer, 'draftedAt'>) => {
        set(state => {
          const draft = state.drafts[leagueId];
          if (!draft) return state;

          const draftedPlayer: DraftedPlayer = {
            ...player,
            draftedAt: new Date().toISOString(),
          };

          return {
            drafts: {
              ...state.drafts,
              [leagueId]: {
                ...draft,
                draftedPlayers: [...draft.draftedPlayers, draftedPlayer],
                lastUpdatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      /**
       * Add multiple drafted players from Couch Managers sync
       * Story: 9.3 - Implement Automatic API Polling
       *
       * Handles batch picks from sync:
       * - Converts DraftPick[] to DraftedPlayer[] format
       * - Filters out duplicates (by playerId)
       * - Merges with existing drafted players
       * - Sorts by draftedAt timestamp (chronological)
       */
      addDraftedPlayers: (leagueId: string, picks: DraftPick[]) => {
        set(state => {
          const draft = state.drafts[leagueId];
          if (!draft) return state;

          // Skip if no picks to add
          if (!picks || picks.length === 0) {
            return state;
          }

          // Get existing player IDs for deduplication
          const existingPlayerIds = new Set(draft.draftedPlayers.map(p => p.playerId));

          // Convert picks to DraftedPlayer format, filtering duplicates
          const newPlayers: DraftedPlayer[] = picks
            .filter(pick => !existingPlayerIds.has(pick.playerId))
            .map(pick => ({
              playerId: pick.playerId,
              playerName: pick.playerName,
              position: pick.position || 'UTIL',
              purchasePrice: pick.auctionPrice,
              // TODO: Get projected value from projections store (Story 9.3+)
              // For now, set to purchase price (0 variance)
              projectedValue: pick.auctionPrice,
              variance: 0,
              // Synced picks are from "other" teams (not user's manual input)
              draftedBy: 'other' as const,
              draftedAt: new Date().toISOString(),
            }));

          // Skip if all picks were duplicates
          if (newPlayers.length === 0) {
            return state;
          }

          // Merge and sort by draftedAt (chronological order)
          const mergedPlayers = [...draft.draftedPlayers, ...newPlayers].sort(
            (a, b) => new Date(a.draftedAt).getTime() - new Date(b.draftedAt).getTime()
          );

          return {
            drafts: {
              ...state.drafts,
              [leagueId]: {
                ...draft,
                draftedPlayers: mergedPlayers,
                lastUpdatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      /**
       * Update inflation data
       */
      updateInflationData: (leagueId: string, data: Partial<InflationData>) => {
        set(state => {
          const draft = state.drafts[leagueId];
          if (!draft) return state;

          return {
            drafts: {
              ...state.drafts,
              [leagueId]: {
                ...draft,
                inflationData: {
                  ...draft.inflationData,
                  ...data,
                },
                lastUpdatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      /**
       * Clear draft for a league (on delete or complete)
       */
      clearDraft: (leagueId: string) => {
        set(state => {
          const { [leagueId]: _, ...remainingDrafts } = state.drafts;
          return { drafts: remainingDrafts };
        });
      },

      /**
       * Get draft state for a league
       */
      getDraft: (leagueId: string) => {
        return get().drafts[leagueId];
      },

      /**
       * Check if draft in progress for a league
       */
      hasDraftInProgress: (leagueId: string) => {
        const draft = get().drafts[leagueId];
        return draft !== undefined && draft.draftedPlayers.length > 0;
      },

      /**
       * Set sort state directly
       */
      setSort: (sort: SortState) => {
        set({ sortState: sort });
      },

      /**
       * Toggle sort for a column
       * - If clicking same column: toggle direction (asc <-> desc)
       * - If clicking different column: set to ascending
       */
      toggleSort: (column: SortColumn) => {
        set(state => {
          const currentSort = state.sortState;

          if (currentSort.column === column) {
            // Toggle direction for same column
            return {
              sortState: {
                column,
                direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
              },
            };
          }

          // New column - start with ascending
          return {
            sortState: {
              column,
              direction: 'asc',
            },
          };
        });
      },

      /**
       * Reset sort to default (adjustedValue descending)
       */
      resetSort: () => {
        set({ sortState: DEFAULT_SORT });
      },

      /**
       * Set status filter (Story 6.8)
       */
      setStatusFilter: (status: StatusFilter) => {
        set(state => ({
          filterState: {
            ...state.filterState,
            status,
          },
        }));
      },

      /**
       * Set search term filter (Story 6.8)
       */
      setSearchFilter: (searchTerm: string) => {
        set(state => ({
          filterState: {
            ...state.filterState,
            searchTerm,
          },
        }));
      },

      /**
       * Clear all filters to defaults (Story 6.8)
       */
      clearFilters: () => {
        set({ filterState: DEFAULT_FILTER });
      },

      /**
       * Add player to roster slot (Story 10.4)
       *
       * Finds an empty slot matching the player's position and adds them.
       * Returns true if successful, false if no slot available.
       *
       * Position matching logic:
       * - Exact match: C, 1B, 2B, 3B, SS, SP, RP
       * - OF matches OF slots
       * - Any position can fill UTIL or BN slots as fallback
       */
      addToRoster: (
        leagueId: string,
        playerId: string,
        playerName: string,
        position: string,
        purchasePrice: number
      ): boolean => {
        const draft = get().drafts[leagueId];
        if (!draft) return false;

        // Find an empty slot for this position
        const roster = [...draft.roster];
        let slotIndex = -1;

        // First, try to find an exact position match
        slotIndex = roster.findIndex(slot => slot.playerId === null && slot.position === position);

        // If no exact match and position is OF, try OF slots
        if (slotIndex === -1 && position === 'OF') {
          slotIndex = roster.findIndex(slot => slot.playerId === null && slot.position === 'OF');
        }

        // If still no match, try UTIL slot (for hitters)
        if (slotIndex === -1 && !['SP', 'RP'].includes(position)) {
          slotIndex = roster.findIndex(slot => slot.playerId === null && slot.position === 'UTIL');
        }

        // If still no match, try bench slot
        if (slotIndex === -1) {
          slotIndex = roster.findIndex(slot => slot.playerId === null && slot.position === 'BN');
        }

        // If no slot found, return false
        if (slotIndex === -1) return false;

        // Update the roster slot
        roster[slotIndex] = {
          ...roster[slotIndex],
          playerId,
          playerName,
          purchasePrice,
        };

        // Update state
        set(state => ({
          drafts: {
            ...state.drafts,
            [leagueId]: {
              ...draft,
              roster,
              lastUpdatedAt: new Date().toISOString(),
            },
          },
        }));

        return true;
      },

      // ============================================
      // Sync Failure Tracking Actions (Story 10.1)
      // ============================================

      /**
       * Update sync status for a league
       * Story 10.1 - Detect API Connection Failures
       */
      updateSyncStatus: (leagueId: string, status: Partial<SyncStatus>) => {
        set(state => {
          const currentStatus = state.syncStatus[leagueId] || DEFAULT_SYNC_STATUS;
          return {
            syncStatus: {
              ...state.syncStatus,
              [leagueId]: {
                ...currentStatus,
                ...status,
              },
            },
          };
        });
      },

      /**
       * Increment failure count and set failure type
       * Story 10.1 - Detect API Connection Failures
       *
       * After 3 consecutive failures (NFR-I3), enables manual mode
       */
      incrementFailureCount: (
        leagueId: string,
        failureType: SyncStatus['failureType'],
        error: string
      ) => {
        set(state => {
          const currentStatus = state.syncStatus[leagueId] || DEFAULT_SYNC_STATUS;
          const newFailureCount = currentStatus.failureCount + 1;
          const shouldEnableManualMode =
            failureType === 'persistent' || newFailureCount >= DISCONNECTED_FAILURE_THRESHOLD;

          return {
            syncStatus: {
              ...state.syncStatus,
              [leagueId]: {
                ...currentStatus,
                failureCount: newFailureCount,
                failureType,
                error,
                lastFailureTimestamp: new Date(),
                isManualMode: shouldEnableManualMode,
                isConnected: false,
              },
            },
          };
        });
      },

      /**
       * Reset failure count on successful sync
       * Story 10.1 - Detect API Connection Failures
       */
      resetFailureCount: (leagueId: string) => {
        set(state => {
          const currentStatus = state.syncStatus[leagueId] || DEFAULT_SYNC_STATUS;
          return {
            syncStatus: {
              ...state.syncStatus,
              [leagueId]: {
                ...currentStatus,
                failureCount: 0,
                failureType: null,
                error: null,
                lastFailureTimestamp: null,
                isConnected: true,
                lastSync: new Date(),
              },
            },
          };
        });
      },

      /**
       * Enable manual sync mode for a league
       * Story 10.1 - Detect API Connection Failures
       */
      enableManualMode: (leagueId: string) => {
        set(state => {
          const currentStatus = state.syncStatus[leagueId] || DEFAULT_SYNC_STATUS;
          return {
            syncStatus: {
              ...state.syncStatus,
              [leagueId]: {
                ...currentStatus,
                isManualMode: true,
              },
            },
          };
        });
      },

      /**
       * Disable manual sync mode for a league
       * Story 10.1 - Detect API Connection Failures
       */
      disableManualMode: (leagueId: string) => {
        set(state => {
          const currentStatus = state.syncStatus[leagueId] || DEFAULT_SYNC_STATUS;
          return {
            syncStatus: {
              ...state.syncStatus,
              [leagueId]: {
                ...currentStatus,
                isManualMode: false,
              },
            },
          };
        });
      },

      /**
       * Get sync status for a league
       * Story 10.1 - Detect API Connection Failures
       */
      getSyncStatus: (leagueId: string): SyncStatus => {
        return get().syncStatus[leagueId] || DEFAULT_SYNC_STATUS;
      },
    }),
    {
      name: 'draft-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        drafts: state.drafts,
        sortState: state.sortState,
        filterState: state.filterState,
        syncStatus: state.syncStatus,
      }),
    }
  )
);
