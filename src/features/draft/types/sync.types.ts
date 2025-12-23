/**
 * Sync Types
 *
 * Type definitions for Couch Managers draft sync operations.
 * Used by useDraftSync hook and draft store sync actions.
 *
 * Story: 9.3 - Implement Automatic API Polling
 */

/**
 * Draft pick data from Couch Managers sync
 * Matches the Edge Function response schema
 */
export interface DraftPick {
  /** Couch Managers player ID */
  playerId: string;
  /** Player name */
  playerName: string;
  /** Fantasy team that drafted the player */
  team: string;
  /** Winning bid amount */
  auctionPrice: number;
  /** Player position (optional) */
  position?: string;
}

/**
 * Current/active auction data (bid in progress)
 * Represents a player currently being auctioned
 */
export interface CurrentAuction {
  /** Couch Managers player ID */
  playerId: string;
  /** Player name */
  playerName: string;
  /** Player position */
  position: string;
  /** MLB team */
  mlbTeam: string;
  /** Current bid amount */
  currentBid: number;
  /** Team currently winning the bid */
  highBidder: string;
  /** Time remaining in auction (e.g., "30:39", "1:07:29") */
  timeRemaining: string;
  /** Player stats if available */
  stats?: PlayerStats;
}

/**
 * Player stats from Couch Managers
 */
export interface PlayerStats {
  // Hitter stats
  avg?: string;
  hr?: number;
  rbi?: number;
  sb?: number;
  r?: number;
  // Pitcher stats
  era?: string;
  w?: number;
  l?: number;
  s?: number;
  k?: number;
  whip?: string;
}

/**
 * Player info from Couch Managers player array
 */
export interface PlayerInfo {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  mlbTeam: string;
  isDrafted: boolean;
  draftedBy?: string;
  draftPrice?: number;
}

/**
 * Auction metadata from Couch Managers
 */
export interface AuctionInfo {
  auctionId: string;
  totalTeams: number;
  rosterSize: number;
  budget: number;
}

/**
 * Successful sync response from Edge Function
 */
export interface SyncSuccessResponse {
  success: true;
  /** Completed draft picks */
  picks: DraftPick[];
  /** Active auctions in progress */
  currentAuctions: CurrentAuction[];
  /** All players in the auction */
  players: PlayerInfo[];
  /** ISO 8601 timestamp of this sync */
  syncTimestamp: string;
  /** Auction metadata */
  auctionInfo: AuctionInfo;
}

/**
 * Error response from Edge Function
 */
export interface SyncErrorResponse {
  success: false;
  error: string;
  code: SyncErrorCode;
  syncTimestamp: string;
  retryAfter?: number;
}

/**
 * Error codes from the sync Edge Function
 */
export type SyncErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'LEAGUE_NOT_FOUND'
  | 'SCRAPE_ERROR'
  | 'PARSE_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR';

/**
 * Classification of sync errors for retry behavior
 * Story: 10.1 - Detect API Connection Failures
 *
 * - transient: Temporary failures that may resolve with retry (network timeout, 5xx, rate limiting)
 * - persistent: Configuration or auth errors that won't resolve with retry (401, 403, 404, invalid room ID)
 */
export type SyncFailureType = 'transient' | 'persistent';

/**
 * Result of error classification
 * Story: 10.1 - Detect API Connection Failures
 */
export interface ErrorClassification {
  /** Whether error is transient (retryable) or persistent (immediate degradation) */
  type: SyncFailureType;
  /** Whether the error can be retried */
  shouldRetry: boolean;
  /** Recommended retry delay in milliseconds (0 for persistent errors) */
  retryDelayMs: number;
  /** Human-readable error message for display */
  displayMessage: string;
  /** Original error code if from Edge Function */
  errorCode?: SyncErrorCode;
}

/**
 * Combined sync response type
 */
export type SyncResponse = SyncSuccessResponse | SyncErrorResponse;

/**
 * Sync status for UI display
 * Updated: Story 10.1 - Detect API Connection Failures
 */
export interface SyncStatus {
  /** Whether connected to Couch Managers */
  isConnected: boolean;
  /** Whether currently syncing */
  isSyncing: boolean;
  /** Last successful sync timestamp */
  lastSync: Date | null;
  /** Last sync error message */
  error: string | null;
  /** Number of consecutive sync failures */
  failureCount: number;
  /** Type of the last failure (transient or persistent) - Story 10.1 */
  failureType: SyncFailureType | null;
  /** Whether manual sync mode is active - Story 10.1 */
  isManualMode: boolean;
  /** Timestamp of last failure for retry timing - Story 10.1 */
  lastFailureTimestamp: Date | null;
}

/**
 * Sync request body for Edge Function
 */
export interface SyncRequest {
  /** Couch Managers auction ID (numeric string) */
  auctionId: string;
  /** Our internal league ID (UUID) */
  leagueId: string;
  /** ISO timestamp for incremental sync (optional) */
  lastSyncTimestamp?: string;
}

/**
 * Connection state for UI display
 * Derived from sync status and failure count
 *
 * - connected: Successful sync within last polling interval
 * - reconnecting: Failed sync with automatic retry in progress (1-2 failures)
 * - disconnected: Multiple failed attempts (3+ failures), triggers manual sync mode
 * - manual: Manual sync mode active (Story 10.2)
 */
export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected' | 'manual';

/**
 * Threshold for consecutive failures before considering disconnected
 * Per AC: "multiple failed attempts" triggers Manual Sync Mode
 */
export const DISCONNECTED_FAILURE_THRESHOLD = 3;

/**
 * Default sync status
 * Updated: Story 10.1 - Detect API Connection Failures
 */
export const DEFAULT_SYNC_STATUS: SyncStatus = {
  isConnected: false,
  isSyncing: false,
  lastSync: null,
  error: null,
  failureCount: 0,
  failureType: null,
  isManualMode: false,
  lastFailureTimestamp: null,
};

/**
 * Derive connection state from sync status
 * Used by ConnectionStatusBadge component
 *
 * @param syncStatus - Current sync status from useDraftSync hook
 * @returns ConnectionState - 'connected', 'reconnecting', 'disconnected', or 'manual'
 *
 * Updated: Story 10.2 - Enable Manual Sync Mode
 */
export function getConnectionState(syncStatus: SyncStatus): ConnectionState {
  // Story 10.2: Manual mode takes precedence over other states
  if (syncStatus.isManualMode) {
    return 'manual';
  }

  // If never connected or no room configured
  if (!syncStatus.isConnected && syncStatus.failureCount === 0 && !syncStatus.lastSync) {
    return 'disconnected';
  }

  // Multiple failures - disconnected
  if (syncStatus.failureCount >= DISCONNECTED_FAILURE_THRESHOLD) {
    return 'disconnected';
  }

  // Some failures but still retrying - reconnecting
  if (syncStatus.failureCount > 0) {
    return 'reconnecting';
  }

  // No failures and connected
  if (syncStatus.isConnected) {
    return 'connected';
  }

  // Default fallback
  return 'disconnected';
}
