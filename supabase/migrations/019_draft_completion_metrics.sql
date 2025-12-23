-- Migration 019: Draft Completion Metrics
-- Epic 13 - Story 13.8 - Date: 2025-12-23
-- Creates drafts table (if not exists) and RPC function for completion metrics

-- ============================================================================
-- DRAFTS TABLE
-- Main table for tracking draft sessions and their completion status
-- Required by Story 13.2, 13.8 and other admin monitoring features
-- ============================================================================

CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned', 'error')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for drafts
CREATE INDEX IF NOT EXISTS idx_drafts_league_id ON drafts(league_id);
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_started_at ON drafts(started_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Users can view their own drafts
CREATE POLICY "Users can view their own drafts"
  ON drafts FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all drafts
CREATE POLICY "Admins can view all drafts"
  ON drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Users can insert their own drafts
CREATE POLICY "Users can insert their own drafts"
  ON drafts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own drafts
CREATE POLICY "Users can update their own drafts"
  ON drafts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on drafts table
CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RPC FUNCTION: get_draft_completion_metrics_30d
-- Returns 30-day draft completion statistics for admin dashboard
-- Story: 13.8 - Track Draft Completion Rates
-- ============================================================================

CREATE OR REPLACE FUNCTION get_draft_completion_metrics_30d()
RETURNS TABLE (
  total_drafts BIGINT,
  completed_drafts BIGINT,
  abandoned_drafts BIGINT,
  error_drafts BIGINT,
  completion_rate NUMERIC,
  daily_rates JSONB
) AS $$
DECLARE
  thirty_days_ago TIMESTAMPTZ := NOW() - INTERVAL '30 days';
BEGIN
  RETURN QUERY
  WITH
  -- Calculate overall metrics
  overall_metrics AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COUNT(*) FILTER (WHERE status = 'abandoned') AS abandoned,
      COUNT(*) FILTER (WHERE status = 'error') AS errors
    FROM drafts
    WHERE started_at >= thirty_days_ago
  ),
  -- Calculate daily completion rates
  daily_data AS (
    SELECT
      DATE(started_at) AS draft_date,
      COUNT(*) AS day_total,
      COUNT(*) FILTER (WHERE status = 'completed') AS day_completed
    FROM drafts
    WHERE started_at >= thirty_days_ago
    GROUP BY DATE(started_at)
    ORDER BY draft_date
  )
  SELECT
    om.total AS total_drafts,
    om.completed AS completed_drafts,
    om.abandoned AS abandoned_drafts,
    om.errors AS error_drafts,
    CASE
      WHEN om.total > 0 THEN ROUND((om.completed * 100.0 / om.total), 2)
      ELSE 0
    END AS completion_rate,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'date', dd.draft_date::TEXT,
          'completionRate', CASE
            WHEN dd.day_total > 0 THEN ROUND((dd.day_completed * 100.0 / dd.day_total), 2)
            ELSE 0
          END
        ) ORDER BY dd.draft_date
      ) FROM daily_data dd),
      '[]'::JSONB
    ) AS daily_rates
  FROM overall_metrics om;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admin check done in app)
GRANT EXECUTE ON FUNCTION get_draft_completion_metrics_30d() TO authenticated;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON drafts TO authenticated;
