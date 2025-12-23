-- Extend API Health Logs Migration
-- Story: 13.10 - Drill Down into Error Logs
--
-- Adds status_code and request_url columns to api_health_logs table
-- to support detailed error log drill-down functionality.

-- Add status_code column for HTTP status codes (e.g., 500, 503, 429)
ALTER TABLE api_health_logs
ADD COLUMN IF NOT EXISTS status_code INTEGER;

-- Add request_url column for the endpoint that was called
ALTER TABLE api_health_logs
ADD COLUMN IF NOT EXISTS request_url TEXT;

-- Add comments for new columns
COMMENT ON COLUMN api_health_logs.status_code IS 'HTTP status code returned by the API (e.g., 500, 503, 429). Null for successful calls or connection timeouts.';
COMMENT ON COLUMN api_health_logs.request_url IS 'The API endpoint URL that was called. Used for debugging and error analysis.';

-- Create index for efficient error log queries
-- Optimizes filtering by API name and error status with timestamp ordering
CREATE INDEX IF NOT EXISTS idx_api_health_logs_error_drilldown
  ON api_health_logs(api_name, checked_at DESC)
  WHERE status IN ('degraded', 'down');

-- Create index for status code filtering
CREATE INDEX IF NOT EXISTS idx_api_health_logs_status_code
  ON api_health_logs(status_code)
  WHERE status_code IS NOT NULL;
