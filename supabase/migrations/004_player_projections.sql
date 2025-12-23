-- Migration 004: Player Projections Table
-- Epic 4 - Story 4.1 - Date: 2025-12-16

CREATE TABLE IF NOT EXISTS player_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  team TEXT,
  positions TEXT[],
  projected_value DECIMAL(10,2),
  projection_source TEXT NOT NULL,
  stats_hitters JSONB,
  stats_pitchers JSONB,
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projections_league_id ON player_projections(league_id);
CREATE INDEX IF NOT EXISTS idx_projections_player_name ON player_projections(player_name);
CREATE INDEX IF NOT EXISTS idx_projections_league_player ON player_projections(league_id, player_name);
CREATE INDEX IF NOT EXISTS idx_projections_source ON player_projections(projection_source);

ALTER TABLE player_projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projections for own leagues"
  ON player_projections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert projections for own leagues"
  ON player_projections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projections for own leagues"
  ON player_projections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete projections for own leagues"
  ON player_projections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_player_projections_updated_at
  BEFORE UPDATE ON player_projections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON player_projections TO authenticated;
