-- Connection Metrics Functions Migration
-- Story: 13.5 - View Connection Success Metrics
--
-- Creates RPC functions for calculating 7-day success metrics and daily rates
-- from api_health_logs table for connection reliability monitoring.

-- Function to get 7-day connection success metrics for all APIs
CREATE OR REPLACE FUNCTION get_connection_metrics_7d()
RETURNS TABLE (
  api_name TEXT,
  success_rate NUMERIC,
  total_calls BIGINT,
  successful_calls BIGINT,
  failed_calls BIGINT
) AS $$
  SELECT
    api_name,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'healthy') * 100.0 /
      NULLIF(COUNT(*), 0),
      2
    ) as success_rate,
    COUNT(*) as total_calls,
    COUNT(*) FILTER (WHERE status = 'healthy') as successful_calls,
    COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) as failed_calls
  FROM api_health_logs
  WHERE checked_at >= NOW() - INTERVAL '7 days'
  GROUP BY api_name;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_connection_metrics_7d IS 'Returns 7-day success metrics (success rate, total/successful/failed calls) for each API';

-- Function to get daily success rates for the last 7 days (for trend chart)
CREATE OR REPLACE FUNCTION get_daily_success_rates()
RETURNS TABLE (
  api_name TEXT,
  date DATE,
  success_rate NUMERIC,
  total_calls BIGINT,
  successful_calls BIGINT
) AS $$
  SELECT
    api_name,
    DATE(checked_at) as date,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'healthy') * 100.0 /
      NULLIF(COUNT(*), 0),
      2
    ) as success_rate,
    COUNT(*) as total_calls,
    COUNT(*) FILTER (WHERE status = 'healthy') as successful_calls
  FROM api_health_logs
  WHERE checked_at >= NOW() - INTERVAL '7 days'
  GROUP BY api_name, DATE(checked_at)
  ORDER BY api_name, date;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_daily_success_rates IS 'Returns daily success rates for each API over the last 7 days (for trend charts)';

-- Function to get detailed metrics for a specific day (for drill-down on chart click)
CREATE OR REPLACE FUNCTION get_daily_connection_details(target_date DATE)
RETURNS TABLE (
  api_name TEXT,
  success_rate NUMERIC,
  total_calls BIGINT,
  successful_calls BIGINT,
  failed_calls BIGINT,
  avg_response_time_ms NUMERIC
) AS $$
  SELECT
    api_name,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'healthy') * 100.0 /
      NULLIF(COUNT(*), 0),
      2
    ) as success_rate,
    COUNT(*) as total_calls,
    COUNT(*) FILTER (WHERE status = 'healthy') as successful_calls,
    COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) as failed_calls,
    ROUND(AVG(response_time_ms)::NUMERIC, 2) as avg_response_time_ms
  FROM api_health_logs
  WHERE DATE(checked_at) = target_date
  GROUP BY api_name;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_daily_connection_details IS 'Returns detailed connection metrics for a specific date (for chart drill-down)';
