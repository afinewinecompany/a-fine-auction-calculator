-- Migration 010: Draft State Tables
-- Epic 6 - Story 6.1 - Date: 2025-12-17
-- Creates tables for tracking draft state (drafted players and rosters)

-- ============================================================================
-- DRAFTED_PLAYERS TABLE
-- Tracks which players have been drafted, by which team, and at what price
-- ============================================================================

CREATE TABLE IF NOT EXISTS drafted_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES player_projections(id) ON DELETE RESTRICT,
  drafted_by_team INTEGER NOT NULL,
  auction_price DECIMAL(10,2) NOT NULL,
  drafted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for drafted_players
CREATE INDEX IF NOT EXISTS idx_drafted_players_league_id ON drafted_players(league_id);
CREATE INDEX IF NOT EXISTS idx_drafted_players_player_id ON drafted_players(player_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_drafted_players_league_player ON drafted_players(league_id, player_id);

-- ============================================================================
-- ROSTERS TABLE
-- Stores team roster state including budget remaining and player lists
-- ============================================================================

CREATE TABLE IF NOT EXISTS rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL,
  budget_remaining DECIMAL(10,2) NOT NULL,
  players JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, team_number)
);

-- Indexes for rosters
CREATE INDEX IF NOT EXISTS idx_rosters_league_id ON rosters(league_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE drafted_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;

-- Policies for drafted_players
CREATE POLICY "Users can view drafted players in their leagues"
  ON drafted_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = drafted_players.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert drafted players in their leagues"
  ON drafted_players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = drafted_players.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update drafted players in their leagues"
  ON drafted_players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = drafted_players.league_id
      AND leagues.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = drafted_players.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete drafted players in their leagues"
  ON drafted_players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = drafted_players.league_id
      AND leagues.user_id = auth.uid()
    )
  );

-- Policies for rosters
CREATE POLICY "Users can view rosters in their leagues"
  ON rosters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = rosters.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rosters in their leagues"
  ON rosters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = rosters.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rosters in their leagues"
  ON rosters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = rosters.league_id
      AND leagues.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = rosters.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rosters in their leagues"
  ON rosters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = rosters.league_id
      AND leagues.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on rosters table
CREATE TRIGGER update_rosters_updated_at
  BEFORE UPDATE ON rosters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON drafted_players TO authenticated;
GRANT ALL ON rosters TO authenticated;
