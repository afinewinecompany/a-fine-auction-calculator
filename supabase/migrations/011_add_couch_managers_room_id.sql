-- =============================================================================
-- Migration 011: Add Couch Managers Room ID to Leagues
-- =============================================================================
-- Purpose: Add room ID column for Couch Managers draft room integration
-- Epic: Epic 9 - Couch Managers Integration & Sync
-- Story: 9.2 - Implement Connection to Couch Managers Draft Room
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Add Couch Managers Room ID Column
-- -----------------------------------------------------------------------------

-- Add nullable room ID column (not all leagues use Couch Managers)
ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS couch_managers_room_id TEXT;

-- Add column comment for documentation
COMMENT ON COLUMN leagues.couch_managers_room_id IS 'Couch Managers draft room ID for automatic sync (nullable - not all leagues use Couch Managers)';

-- -----------------------------------------------------------------------------
-- STEP 2: Create Index for Room ID Lookups
-- -----------------------------------------------------------------------------

-- Create partial index on room ID (only indexes non-NULL values)
-- This optimizes queries for syncing (finding leagues with active room connections)
CREATE INDEX IF NOT EXISTS idx_leagues_couch_managers_room_id
ON leagues(couch_managers_room_id)
WHERE couch_managers_room_id IS NOT NULL;

-- =============================================================================
-- Migration Notes:
-- =============================================================================
-- 1. couch_managers_room_id is nullable (not all leagues use Couch Managers)
-- 2. Partial index only indexes non-NULL values (more efficient)
-- 3. No unique constraint - multiple leagues can track same room
-- 4. Existing RLS policies already cover UPDATE operations
-- 5. Used by:
--    - Story 9.2: Save room ID when connecting
--    - Story 9.3: Find leagues to poll for sync
--    - Story 9.6: Manual reconnection
--    - Story 9.7: Catch-up sync after restore
-- =============================================================================
