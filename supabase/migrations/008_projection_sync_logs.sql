-- Migration 008: Projection Sync Logs Table
-- Epic 4 - Story 4.6 - Date: 2025-12-17
--
-- Purpose: Track daily sync operations for Fangraphs projections
-- - Logs success/failure status for each league sync
-- - Records duration for performance monitoring (NFR-P5: 10s per league)
-- - Enables admin monitoring and alerting

-- ============================================================================
-- STEP 1: Create projection_sync_logs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS projection_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- League reference (nullable for global sync operations)
  league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,

  -- Projection source (e.g., 'Fangraphs - Steamer', 'Fangraphs - ZiPS')
  projection_source TEXT NOT NULL,

  -- Sync status: 'success' or 'failure'
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),

  -- Number of players updated in this sync
  players_updated INTEGER DEFAULT 0,

  -- Error message (only populated on failure)
  error_message TEXT,

  -- Duration of sync operation in milliseconds (for NFR-P5 monitoring)
  duration_ms INTEGER,

  -- Sync timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,

  -- Record creation timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Create indexes for common queries
-- ============================================================================

-- Index for filtering by league
CREATE INDEX IF NOT EXISTS idx_sync_logs_league ON projection_sync_logs(league_id);

-- Index for filtering by status (finding failures)
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON projection_sync_logs(status);

-- Index for time-based queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON projection_sync_logs(created_at DESC);

-- Composite index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_sync_logs_source_status ON projection_sync_logs(projection_source, status);

-- ============================================================================
-- STEP 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE projection_sync_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

-- Policy: Only admin users can view sync logs
-- This uses is_admin column from users table (see migration 002)
CREATE POLICY "Admins can view sync logs"
  ON projection_sync_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Note: Service role (used by Edge Functions) bypasses RLS entirely.
-- No INSERT policy needed for regular users - only the cron job via
-- service role should insert sync logs. This prevents users from
-- injecting fake sync log entries.

-- ============================================================================
-- STEP 5: Grant Permissions
-- ============================================================================

-- Grant permissions to authenticated users (access controlled by RLS)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON projection_sync_logs TO authenticated;

-- Service role has full access (used by Edge Functions)
-- Note: service_role bypasses RLS by default

-- ============================================================================
-- Migration Notes:
-- ============================================================================
-- 1. league_id is nullable to support global/aggregate sync logs
-- 2. duration_ms enables NFR-P5 monitoring (10s per league target)
-- 3. Only admins can view logs to prevent information disclosure
-- 4. Service role inserts logs from Edge Function (daily-projection-sync)
-- 5. Indexes support:
--    - Per-league history queries
--    - Failure analysis
--    - Recent sync status dashboard
--    - Source-specific monitoring
-- ============================================================================
