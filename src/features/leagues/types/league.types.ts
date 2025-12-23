/**
 * League Type Definitions
 *
 * TypeScript types for league management operations.
 * Used across league store, components, and service functions.
 *
 * Story: 3.2 - Implement Create League Form
 */

/**
 * Scoring type options for leagues
 */
export type ScoringType = '5x5' | '6x6' | 'points';

/**
 * League data from leagues table (matches Supabase response with camelCase)
 */
export interface League {
  /** UUID primary key */
  id: string;
  /** UUID of the user who owns this league */
  userId: string;
  /** User-defined league name */
  name: string;
  /** Number of teams in the league (8-20) */
  teamCount: number;
  /** Per-team auction budget ($100-$500) */
  budget: number;
  /** Number of hitter roster spots */
  rosterSpotsHitters: number | null;
  /** Number of pitcher roster spots */
  rosterSpotsPitchers: number | null;
  /** Number of bench roster spots */
  rosterSpotsBench: number | null;
  /** Scoring format: 5x5, 6x6, or points */
  scoringType: ScoringType | null;
  /** Couch Managers room ID for automatic sync (nullable - not all leagues use Couch Managers) */
  couchManagersRoomId?: string | null;
  /** Sync interval in minutes (5-60, default: 20) for automatic polling */
  syncInterval?: number | null;
  /** Record creation timestamp */
  createdAt: string;
  /** Record last update timestamp */
  updatedAt: string;
}

/**
 * Data for creating a new league (snake_case for database insert)
 * user_id is automatically set by RLS policy
 */
export interface CreateLeagueRequest {
  /** User-defined league name */
  name: string;
  /** Number of teams in the league (8-20) */
  team_count: number;
  /** Per-team auction budget ($100-$500) */
  budget: number;
  /** Number of hitter roster spots */
  roster_spots_hitters?: number | null;
  /** Number of pitcher roster spots */
  roster_spots_pitchers?: number | null;
  /** Number of bench roster spots */
  roster_spots_bench?: number | null;
  /** Scoring format: 5x5, 6x6, or points */
  scoring_type?: ScoringType | null;
}

/**
 * Data for updating an existing league
 */
export interface UpdateLeagueRequest {
  /** Updated league name */
  name?: string;
  /** Updated team count */
  team_count?: number;
  /** Updated budget */
  budget?: number;
  /** Updated hitter roster spots */
  roster_spots_hitters?: number | null;
  /** Updated pitcher roster spots */
  roster_spots_pitchers?: number | null;
  /** Updated bench roster spots */
  roster_spots_bench?: number | null;
  /** Updated scoring type */
  scoring_type?: ScoringType | null;
  /** Couch Managers room ID for automatic sync */
  couch_managers_room_id?: string | null;
  /** Sync interval in minutes (5-60, default: 20) */
  sync_interval?: number | null;
}

/**
 * League store state shape
 */
export interface LeagueState {
  /** List of user's leagues */
  leagues: League[];
  /** Currently selected league */
  currentLeague: League | null;
  /** Whether leagues are being loaded */
  isLoading: boolean;
  /** Whether a league is being created */
  isCreating: boolean;
  /** Whether a league is being updated */
  isUpdating: boolean;
  /** Whether a league is being deleted */
  isDeleting: boolean;
  /** Whether connecting to Couch Managers */
  isConnecting: boolean;
  /** Current error message */
  error: string | null;
  /** Couch Managers connection error message */
  connectionError: string | null;
}

/**
 * League store actions
 */
export interface LeagueActions {
  /** Fetch all leagues for current user */
  fetchLeagues: () => Promise<void>;
  /** Fetch a single league by ID */
  fetchLeague: (leagueId: string) => Promise<League | null>;
  /** Create a new league */
  createLeague: (data: CreateLeagueRequest) => Promise<League | null>;
  /** Update an existing league */
  updateLeague: (leagueId: string, data: UpdateLeagueRequest) => Promise<boolean>;
  /** Delete a league */
  deleteLeague: (leagueId: string) => Promise<boolean>;
  /** Set current league */
  setCurrentLeague: (league: League | null) => void;
  /** Connect league to Couch Managers draft room */
  connectToCouchManagers: (leagueId: string, roomId: string) => Promise<boolean>;
  /** Disconnect league from Couch Managers */
  disconnectFromCouchManagers: (leagueId: string) => Promise<boolean>;
  /** Clear current error */
  clearError: () => void;
  /** Clear connection error */
  clearConnectionError: () => void;
  /** Reset store to initial state */
  reset: () => void;
}

/**
 * Complete league store type
 */
export type LeagueStore = LeagueState & LeagueActions;

/**
 * Validation constants for league fields
 */
export const LEAGUE_VALIDATION = {
  name: {
    minLength: 1,
    maxLength: 100,
  },
  teamCount: {
    min: 8,
    max: 20,
    default: 12,
  },
  budget: {
    min: 100,
    max: 500,
    default: 260,
  },
  rosterSpots: {
    min: 0,
    maxHitters: 30,
    maxPitchers: 30,
    maxBench: 20,
  },
  scoringTypes: ['5x5', '6x6', 'points'] as const,
  syncInterval: {
    min: 5,
    max: 60,
    default: 20,
  },
} as const;
