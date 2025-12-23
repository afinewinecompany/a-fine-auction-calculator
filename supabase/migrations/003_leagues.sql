-- =============================================================================
-- Migration 003: Leagues Table
-- =============================================================================
-- Purpose: Create leagues table for Fantasy Baseball league configuration
-- Epic: Epic 3 - League Configuration & Management
-- Story: 3.1 - Create Leagues Database Table
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Create Leagues Table
-- -----------------------------------------------------------------------------

-- Create leagues table with all required columns for league configuration
-- Each league is owned by a user (user_id foreign key)
CREATE TABLE IF NOT EXISTS leagues (
  -- Primary key - unique identifier for each league
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to users table (league owner)
  -- ON DELETE CASCADE: If user is deleted, their leagues are also deleted
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- League configuration (required fields)
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),  -- Human-readable league name (1-100 chars)
  team_count INTEGER NOT NULL CHECK (team_count > 0),              -- Number of teams in the league (must be positive)
  budget INTEGER NOT NULL CHECK (budget > 0),                      -- Total auction budget per team in dollars (must be positive)

  -- Optional roster configuration (must be non-negative if provided)
  roster_spots_hitters INTEGER CHECK (roster_spots_hitters IS NULL OR roster_spots_hitters >= 0),
  roster_spots_pitchers INTEGER CHECK (roster_spots_pitchers IS NULL OR roster_spots_pitchers >= 0),
  roster_spots_bench INTEGER CHECK (roster_spots_bench IS NULL OR roster_spots_bench >= 0),

  -- Optional scoring type (validated values)
  scoring_type TEXT CHECK (scoring_type IS NULL OR scoring_type IN ('5x5', '6x6', 'points')),

  -- Timestamps for audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),   -- When the league was created
  updated_at TIMESTAMPTZ DEFAULT NOW()    -- When the league was last modified
);

-- Add table comment for documentation
COMMENT ON TABLE leagues IS 'Fantasy baseball league configurations owned by users';

-- Add column comments for clarity
COMMENT ON COLUMN leagues.id IS 'Unique identifier for the league (UUID)';
COMMENT ON COLUMN leagues.user_id IS 'Owner of the league - references users(id)';
COMMENT ON COLUMN leagues.name IS 'Human-readable league name (1-100 chars)';
COMMENT ON COLUMN leagues.team_count IS 'Number of teams in the league (must be > 0)';
COMMENT ON COLUMN leagues.budget IS 'Total auction budget per team in dollars (must be > 0)';
COMMENT ON COLUMN leagues.roster_spots_hitters IS 'Number of roster spots for hitters (optional, must be >= 0)';
COMMENT ON COLUMN leagues.roster_spots_pitchers IS 'Number of roster spots for pitchers (optional, must be >= 0)';
COMMENT ON COLUMN leagues.roster_spots_bench IS 'Number of bench spots (optional, must be >= 0)';
COMMENT ON COLUMN leagues.scoring_type IS 'Scoring system type: must be 5x5, 6x6, or points (optional)';
COMMENT ON COLUMN leagues.created_at IS 'Timestamp when league was created';
COMMENT ON COLUMN leagues.updated_at IS 'Timestamp when league was last modified';

-- -----------------------------------------------------------------------------
-- STEP 2: Create Indexes
-- -----------------------------------------------------------------------------

-- Index for efficient user-specific league queries
-- Critical for query performance: SELECT * FROM leagues WHERE user_id = ?
-- Will be used heavily in Story 3.3 (display saved leagues list)
CREATE INDEX IF NOT EXISTS idx_leagues_user_id ON leagues(user_id);

-- -----------------------------------------------------------------------------
-- STEP 3: Enable Row Level Security
-- -----------------------------------------------------------------------------

-- Enable RLS to enforce data isolation (NFR-S7: user data accessible only to owner)
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- STEP 4: Create RLS Policies
-- -----------------------------------------------------------------------------

-- Policy: Users can view their own leagues only
-- Prevents users from seeing other users' leagues
CREATE POLICY "Users can view own leagues"
  ON leagues FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own leagues only
-- WITH CHECK constraint prevents creating leagues for other users
CREATE POLICY "Users can insert own leagues"
  ON leagues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own leagues only
-- Both USING and WITH CHECK to prevent changing ownership
CREATE POLICY "Users can update own leagues"
  ON leagues FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own leagues only
-- Required for Story 3.5 (delete league functionality)
CREATE POLICY "Users can delete own leagues"
  ON leagues FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- STEP 5: Create Trigger for Automatic Timestamp Updates
-- -----------------------------------------------------------------------------

-- Use existing update_updated_at_column() function from 002_users_auth.sql
-- This trigger automatically sets updated_at to NOW() on every update
CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- STEP 6: Grant Permissions
-- -----------------------------------------------------------------------------

-- Ensure authenticated users can access the leagues table through RLS policies
-- Note: GRANT USAGE ON SCHEMA public already granted in 002_users_auth.sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON leagues TO authenticated;

-- =============================================================================
-- Migration Notes:
-- =============================================================================
-- 1. Leagues table stores fantasy baseball league configurations
-- 2. Each league is owned by a user (user_id foreign key)
-- 3. ON DELETE CASCADE: Deleting a user deletes their leagues
-- 4. RLS policies ensure users can only access their own leagues (NFR-S7):
--    - SELECT: auth.uid() = user_id (view own leagues)
--    - INSERT: auth.uid() = user_id (create own leagues)
--    - UPDATE: auth.uid() = user_id (modify own leagues)
--    - DELETE: auth.uid() = user_id (delete own leagues)
-- 5. Index on user_id optimizes user-specific league queries
-- 6. Trigger automatically updates updated_at on every league update
-- 7. Optional fields: roster_spots_*, scoring_type (configured in Story 3.2)
-- 8. Supports Epic 3 stories:
--    - 3.2: Create league form (INSERT)
--    - 3.3: List leagues (SELECT with user_id index)
--    - 3.4: Edit league settings (UPDATE)
--    - 3.5: Delete league (DELETE)
--    - 3.6: Direct access links (uses id column)
--    - 3.7: Resume draft functionality (queries by league_id)
-- =============================================================================
