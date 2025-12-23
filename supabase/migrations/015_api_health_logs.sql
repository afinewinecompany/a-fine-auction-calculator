-- API Health Logs Migration
-- Story: 13.3 - Monitor API Health for Integrations
--
-- Creates the api_health_logs table for tracking API health check history
-- and supporting error rate calculation for admin monitoring.

-- Create the api_health_logs table
CREATE TABLE IF NOT EXISTS api_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL CHECK (api_name IN ('couch_managers', 'fangraphs', 'google_sheets')),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to describe table purpose
COMMENT ON TABLE api_health_logs IS 'Tracks API health check results for monitoring and analytics';

-- Index for fast queries by API name and timestamp
CREATE INDEX IF NOT EXISTS idx_api_health_logs_api_name_checked_at
  ON api_health_logs(api_name, checked_at DESC);

-- Index for finding recent errors quickly
CREATE INDEX IF NOT EXISTS idx_api_health_logs_errors
  ON api_health_logs(api_name, checked_at DESC)
  WHERE error_message IS NOT NULL;

-- Function to calculate error rate for the last 100 health checks
CREATE OR REPLACE FUNCTION get_api_error_rate(api_name_param TEXT)
RETURNS NUMERIC AS $$
  SELECT
    COALESCE(
      ROUND(
        COUNT(*) FILTER (WHERE status IN ('degraded', 'down'))::NUMERIC /
        NULLIF(COUNT(*), 0) * 100,
        2
      ),
      0
    )
  FROM (
    SELECT status
    FROM api_health_logs
    WHERE api_name = api_name_param
    ORDER BY checked_at DESC
    LIMIT 100
  ) recent_calls;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_api_error_rate IS 'Calculates error rate percentage for the last 100 API health checks';

-- Enable Row Level Security
ALTER TABLE api_health_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view health logs
CREATE POLICY "Admins can view api health logs" ON api_health_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: Only system (service role) can insert health logs
-- In practice, this means Edge Functions or server-side code
CREATE POLICY "Service can insert api health logs" ON api_health_logs
  FOR INSERT
  WITH CHECK (true);
