/**
 * API Request/Response Type Definitions
 *
 * Types for external API integrations and internal API responses.
 */

// =============================================================================
// Generic API Response Types
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiError {
  status: 'error';
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// Authentication API Types
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface RegisterResponse extends LoginResponse {}

// =============================================================================
// Couch Managers API Types
// =============================================================================

export interface CouchManagersDraftResponse {
  draftId: string;
  leagueId: string;
  status: 'pending' | 'active' | 'completed';
  picks: CouchManagersPick[];
  lastUpdated: string;
}

export interface CouchManagersPick {
  pickNumber: number;
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  price: number;
  manager: string;
  timestamp: string;
}

export interface CouchManagersLeagueResponse {
  id: string;
  name: string;
  teams: CouchManagersTeam[];
  settings: {
    budget: number;
    rosterSize: number;
    positions: Record<string, number>;
  };
}

export interface CouchManagersTeam {
  id: string;
  name: string;
  manager: string;
  budget: number;
  roster: Array<{
    playerId: string;
    playerName: string;
    price: number;
  }>;
}

// =============================================================================
// Projection Source API Types
// =============================================================================

export interface FangraphsProjectionResponse {
  playerId: string;
  name: string;
  team: string;
  positions: string[];
  projections: {
    pa?: number;
    ab?: number;
    h?: number;
    hr?: number;
    rbi?: number;
    r?: number;
    sb?: number;
    avg?: number;
    obp?: number;
    slg?: number;
    era?: number;
    whip?: number;
    w?: number;
    sv?: number;
    so?: number;
    ip?: number;
  };
  dollarValue: number;
  system: 'steamer' | 'zips' | 'atc' | 'thebat';
}

export interface GoogleSheetsImportRequest {
  spreadsheetId: string;
  range: string;
  mappings: {
    name: string;
    team: string;
    positions: string;
    value: string;
  };
}

export interface GoogleSheetsImportResponse {
  imported: number;
  failed: number;
  errors?: Array<{
    row: number;
    reason: string;
  }>;
}

// =============================================================================
// Supabase Function Types
// =============================================================================

export interface SyncDraftRequest {
  leagueId: string;
  externalId: string;
  platform: string;
}

export interface SyncDraftResponse {
  synced: boolean;
  newPicks: number;
  totalPicks: number;
  lastSyncTime: string;
}

export interface CalculateInflationRequest {
  leagueId: string;
  draftedPlayers: Array<{
    playerId: string;
    price: number;
    projectedValue: number;
    tier: string;
    position: string;
  }>;
}

export interface CalculateInflationResponse {
  overall: number;
  byTier: Record<string, number>;
  byPosition: Record<string, number>;
  adjustedValues: Array<{
    playerId: string;
    originalValue: number;
    adjustedValue: number;
  }>;
}
