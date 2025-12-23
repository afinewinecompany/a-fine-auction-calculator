-- Migration 007: Add Unique Constraint for Player Projections Upsert
-- Epic 4 - Story 4.3 - Date: 2025-12-17

-- Add unique constraint on (league_id, player_name) for upsert operations
-- This allows importing projections and updating existing players automatically

ALTER TABLE player_projections
  ADD CONSTRAINT unique_league_player
  UNIQUE (league_id, player_name);

COMMENT ON CONSTRAINT unique_league_player ON player_projections IS
  'Ensures each player has only one projection per league, enables upsert on import';
