/**
 * Global Type Definitions
 *
 * Shared types used across multiple features.
 * Feature-specific types should be in their respective feature/types/ directories.
 */

// =============================================================================
// User Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultBudget: number;
  favoriteTeams: string[];
  notifications: {
    email: boolean;
    inApp: boolean;
  };
}

// =============================================================================
// League Types
// =============================================================================

export interface League {
  id: string;
  userId: string;
  name: string;
  platform: 'couch-managers' | 'fantrax' | 'espn' | 'yahoo' | 'custom';
  externalId?: string;
  budget: number;
  rosterSize: number;
  settings: LeagueSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeagueSettings {
  scoringType: 'roto' | 'h2h' | 'points';
  categories?: string[];
  positions: PositionRequirements;
  auctionBudget: number;
}

export interface PositionRequirements {
  C?: number;
  '1B'?: number;
  '2B'?: number;
  '3B'?: number;
  SS?: number;
  OF?: number;
  UTIL?: number;
  SP?: number;
  RP?: number;
  P?: number;
  BN?: number;
}

// =============================================================================
// Player Types
// =============================================================================

export type PlayerPosition = 'C' | '1B' | '2B' | '3B' | 'SS' | 'OF' | 'DH' | 'SP' | 'RP';

export interface Player {
  id: string;
  name: string;
  team: string;
  positions: PlayerPosition[];
  projectedValue: number;
  adjustedValue?: number;
  tier: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  projections?: PlayerProjections;
}

export interface PlayerProjections {
  // Batting
  avg?: number;
  hr?: number;
  rbi?: number;
  runs?: number;
  sb?: number;
  obp?: number;
  slg?: number;
  // Pitching
  era?: number;
  whip?: number;
  wins?: number;
  saves?: number;
  strikeouts?: number;
  // Meta
  source: string;
  updatedAt: Date;
}

// =============================================================================
// Draft Types
// =============================================================================

export type DraftStatus = 'available' | 'drafted' | 'my-team' | 'nominated';

export interface DraftedPlayer extends Player {
  draftedBy: string;
  draftPrice: number;
  draftPosition: number;
  variance: number;
  isMyTeam: boolean;
}

export interface DraftState {
  leagueId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  currentPick: number;
  totalPicks: number;
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  roster: DraftedPlayer[];
  inflation: InflationState;
}

// =============================================================================
// Inflation Types
// =============================================================================

export interface InflationState {
  overall: number;
  byTier: Record<string, number>;
  byPosition: Record<PlayerPosition, number>;
  history: InflationSnapshot[];
}

export interface InflationSnapshot {
  timestamp: Date;
  overall: number;
  playersDrafted: number;
  budgetSpent: number;
}

// =============================================================================
// Utility Types
// =============================================================================

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
