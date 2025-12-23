/**
 * Projection Type Definitions
 *
 * TypeScript types for projection management operations.
 *
 * Story: 4.1 - Create Player Projections Database Table
 */

import type { Json } from '@/types/database.types';

export type ProjectionSource = 'google_sheets' | 'fangraphs' | 'manual';

export interface HitterStats {
  hr?: number;
  rbi?: number;
  sb?: number;
  avg?: number;
  obp?: number;
  slg?: number;
  runs?: number;
  hits?: number;
  ab?: number;
  bb?: number;
  so?: number;
  ops?: number;
}

export interface PitcherStats {
  w?: number;
  k?: number;
  era?: number;
  whip?: number;
  sv?: number;
  ip?: number;
  qs?: number;
  l?: number;
  hld?: number;
  bb?: number;
  h?: number;
  er?: number;
}

export interface PlayerProjection {
  id: string;
  leagueId: string;
  playerName: string;
  team: string | null;
  positions: string[];
  projectedValue: number | null;
  projectionSource: ProjectionSource;
  statsHitters: HitterStats | null;
  statsPitchers: PitcherStats | null;
  tier: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectionRequest {
  league_id: string;
  player_name: string;
  team?: string | null;
  positions?: string[] | null;
  projected_value?: number | null;
  projection_source: string;
  stats_hitters?: Json | null;
  stats_pitchers?: Json | null;
  tier?: string | null;
}

export interface UpdateProjectionRequest {
  player_name?: string;
  team?: string | null;
  positions?: string[] | null;
  projected_value?: number | null;
  projection_source?: string;
  stats_hitters?: Json | null;
  stats_pitchers?: Json | null;
  tier?: string | null;
}

export interface ProjectionState {
  projections: PlayerProjection[];
  currentProjection: PlayerProjection | null;
  isLoading: boolean;
  isImporting: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}

export interface ProjectionActions {
  fetchProjections: (leagueId: string) => Promise<void>;
  fetchProjection: (projectionId: string) => Promise<PlayerProjection | null>;
  createProjection: (data: CreateProjectionRequest) => Promise<PlayerProjection | null>;
  createProjections: (data: CreateProjectionRequest[]) => Promise<number>;
  updateProjection: (projectionId: string, data: UpdateProjectionRequest) => Promise<boolean>;
  deleteProjection: (projectionId: string) => Promise<boolean>;
  deleteProjectionsBySource: (leagueId: string, source: ProjectionSource) => Promise<boolean>;
  setCurrentProjection: (projection: PlayerProjection | null) => void;
  clearError: () => void;
  reset: () => void;
}

export type ProjectionStore = ProjectionState & ProjectionActions;

export function toPlayerProjection(row: {
  id: string;
  league_id: string;
  player_name: string;
  team: string | null;
  positions: string[] | null;
  projected_value: number | null;
  projection_source: string;
  stats_hitters: Json | null;
  stats_pitchers: Json | null;
  tier: string | null;
  created_at: string;
  updated_at: string;
}): PlayerProjection {
  return {
    id: row.id,
    leagueId: row.league_id,
    playerName: row.player_name,
    team: row.team,
    positions: row.positions || [],
    projectedValue: row.projected_value,
    projectionSource: row.projection_source as ProjectionSource,
    statsHitters: row.stats_hitters as HitterStats | null,
    statsPitchers: row.stats_pitchers as PitcherStats | null,
    tier: row.tier,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
