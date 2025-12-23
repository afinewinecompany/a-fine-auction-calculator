-- =============================================================================
-- Migration 012: Add Sync Interval to Leagues
-- =============================================================================
-- Purpose: Add configurable polling interval for Couch Managers sync
-- Epic: Epic 9 - Couch Managers Integration & Sync
-- Story: 9.3 - Implement Automatic API Polling
-- NFR: NFR-I4 - Configurable sync interval (5-60 minutes)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Add Sync Interval Column
-- -----------------------------------------------------------------------------

-- Add sync interval column with default of 20 minutes
-- Nullable to allow leagues without Couch Managers integration
ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS sync_interval INTEGER DEFAULT 20;

-- Add constraint: sync interval must be between 5 and 60 minutes (NFR-I4)
-- Only applies when sync_interval is not null
ALTER TABLE leagues
ADD CONSTRAINT check_sync_interval_range
CHECK (sync_interval IS NULL OR (sync_interval >= 5 AND sync_interval <= 60));

-- Add column comment for documentation
COMMENT ON COLUMN leagues.sync_interval IS 'Auto-sync polling interval in minutes (5-60). Default: 20 minutes. Only used when couch_managers_room_id is set.';

-- =============================================================================
-- Migration Notes:
-- =============================================================================
-- 1. sync_interval default is 20 minutes per NFR-I4
-- 2. Valid range is 5-60 minutes (enforced by CHECK constraint)
-- 3. Works in conjunction with couch_managers_room_id from migration 011
-- 4. Polling only occurs when:
--    - couch_managers_room_id is NOT NULL
--    - User is on the draft page
-- 5. Used by:
--    - Story 9.3: useDraftSync hook reads this value for setInterval
--    - Future: League settings form can allow users to configure
-- =============================================================================
