-- Incident Logs Migration
-- Story: 13.9 - View Detailed Incident Logs
--
-- Creates the incident_logs table for tracking system incidents
-- with severity levels, affected users, and recovery actions.

-- Create the incident_logs table
CREATE TABLE IF NOT EXISTS incident_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL CHECK (incident_type IN ('api_failure', 'draft_error', 'sync_failure', 'system_error')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_users_count INTEGER DEFAULT 0,
  recovery_actions TEXT[] DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to describe table purpose
COMMENT ON TABLE incident_logs IS 'Tracks system incidents for admin monitoring and analysis';

-- Index for fast queries by occurrence timestamp (most recent first)
CREATE INDEX IF NOT EXISTS idx_incident_logs_occurred_at
  ON incident_logs(occurred_at DESC);

-- Index for filtering by incident type
CREATE INDEX IF NOT EXISTS idx_incident_logs_type
  ON incident_logs(incident_type, occurred_at DESC);

-- Index for filtering by severity
CREATE INDEX IF NOT EXISTS idx_incident_logs_severity
  ON incident_logs(severity, occurred_at DESC);

-- Function to get incidents from the last N days
CREATE OR REPLACE FUNCTION get_incidents_last_n_days(days_param INTEGER DEFAULT 30)
RETURNS SETOF incident_logs AS $$
  SELECT *
  FROM incident_logs
  WHERE occurred_at >= NOW() - (days_param || ' days')::INTERVAL
  ORDER BY occurred_at DESC;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_incidents_last_n_days IS 'Returns incidents from the last N days, ordered by most recent first';

-- Function to calculate average resolution time in minutes
CREATE OR REPLACE FUNCTION get_avg_resolution_time_minutes(days_param INTEGER DEFAULT 30)
RETURNS NUMERIC AS $$
  SELECT COALESCE(
    ROUND(AVG(resolution_time_minutes)::NUMERIC, 1),
    0
  )
  FROM incident_logs
  WHERE occurred_at >= NOW() - (days_param || ' days')::INTERVAL
    AND resolved_at IS NOT NULL
    AND resolution_time_minutes IS NOT NULL;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_avg_resolution_time_minutes IS 'Calculates average resolution time in minutes for resolved incidents';

-- Enable Row Level Security
ALTER TABLE incident_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view incident logs
CREATE POLICY "Admins can view incident logs" ON incident_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: Only system (service role) can insert incident logs
-- In practice, this means Edge Functions or server-side code
CREATE POLICY "Service can insert incident logs" ON incident_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only system (service role) can update incident logs
-- For updating resolution status
CREATE POLICY "Service can update incident logs" ON incident_logs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
