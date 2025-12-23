-- Error Rate Functions Migration
-- Story: 13.4 - View Error Rates with Automated Alerts
--
-- Creates RPC functions for calculating 24-hour and 1-hour error rates
-- from api_health_logs table for admin monitoring.

-- Function to get 24-hour error rates for all APIs
CREATE OR REPLACE FUNCTION get_error_rates_24h()
RETURNS TABLE (
  api_name TEXT,
  error_rate_24h NUMERIC,
  error_count BIGINT,
  total_checks BIGINT
) AS $$
  SELECT
    api_name,
    ROUND(
      COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) * 100.0 /
      NULLIF(COUNT(*), 0),
      2
    ) as error_rate_24h,
    COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) as error_count,
    COUNT(*) as total_checks
  FROM api_health_logs
  WHERE checked_at >= NOW() - INTERVAL '24 hours'
  GROUP BY api_name;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_error_rates_24h IS 'Returns error rate percentage for each API over the last 24 hours';

-- Function to get 1-hour error rates for trend calculation
CREATE OR REPLACE FUNCTION get_error_rates_1h()
RETURNS TABLE (
  api_name TEXT,
  error_rate_1h NUMERIC
) AS $$
  SELECT
    api_name,
    ROUND(
      COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) * 100.0 /
      NULLIF(COUNT(*), 0),
      2
    ) as error_rate_1h
  FROM api_health_logs
  WHERE checked_at >= NOW() - INTERVAL '1 hour'
  GROUP BY api_name;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_error_rates_1h IS 'Returns error rate percentage for each API over the last 1 hour (for trend calculation)';
