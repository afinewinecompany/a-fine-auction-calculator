-- Migration: 022_inflation_performance_logs.sql
-- Story: 13.11 - View Inflation Calculation Performance Metrics
-- Purpose: Create inflation performance logging infrastructure for NFR-M4/NFR-M5

-- =============================================================================
-- Inflation Performance Logs Table
-- =============================================================================
-- Tracks latency metrics for inflation calculations to enable performance
-- monitoring and optimization.

CREATE TABLE IF NOT EXISTS inflation_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Calculation type (basic, position, tier, budget_depletion)
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('basic', 'position', 'tier', 'budget_depletion')),

  -- Latency in milliseconds
  latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0),

  -- Context: number of players processed
  player_count INTEGER,

  -- Optional: reference to draft for correlation
  draft_id UUID,

  -- Timestamp when calculation was performed
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Record creation timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient time-based queries (24h window)
CREATE INDEX idx_inflation_perf_calculated_at
  ON inflation_performance_logs(calculated_at DESC);

-- Index for filtering by calculation type
CREATE INDEX idx_inflation_perf_type
  ON inflation_performance_logs(calculation_type);

-- Composite index for type + time queries
CREATE INDEX idx_inflation_perf_type_time
  ON inflation_performance_logs(calculation_type, calculated_at DESC);

-- =============================================================================
-- RPC: Get Inflation Latency Percentiles
-- =============================================================================
-- Calculates median, p95, and p99 latency percentiles for the last 24 hours.
-- Uses PostgreSQL PERCENTILE_CONT for accurate percentile calculations.

CREATE OR REPLACE FUNCTION get_inflation_latency_percentiles()
RETURNS TABLE (
  median_latency NUMERIC,
  p95_latency NUMERIC,
  p99_latency NUMERIC,
  total_calculations BIGINT,
  calculations_per_minute NUMERIC
) AS $$
DECLARE
  time_window_start TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
  minutes_in_window NUMERIC := 60 * 24; -- 1440 minutes in 24 hours
BEGIN
  RETURN QUERY
  WITH calc_stats AS (
    SELECT
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as median_latency,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency,
      COUNT(*) as total_calculations
    FROM inflation_performance_logs
    WHERE calculated_at >= time_window_start
  )
  SELECT
    COALESCE(cs.median_latency, 0)::NUMERIC as median_latency,
    COALESCE(cs.p95_latency, 0)::NUMERIC as p95_latency,
    COALESCE(cs.p99_latency, 0)::NUMERIC as p99_latency,
    COALESCE(cs.total_calculations, 0) as total_calculations,
    ROUND(COALESCE(cs.total_calculations, 0)::NUMERIC / minutes_in_window, 2) as calculations_per_minute
  FROM calc_stats cs;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RPC: Get Hourly Latency Trend
-- =============================================================================
-- Returns hourly median latencies for the last 24 hours for trend chart.

CREATE OR REPLACE FUNCTION get_hourly_latency_trend()
RETURNS TABLE (
  hour TIMESTAMPTZ,
  median_latency NUMERIC,
  calculation_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH hourly_data AS (
    SELECT
      date_trunc('hour', calculated_at) as hour_bucket,
      latency_ms
    FROM inflation_performance_logs
    WHERE calculated_at >= NOW() - INTERVAL '24 hours'
  )
  SELECT
    hd.hour_bucket as hour,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY hd.latency_ms)::NUMERIC as median_latency,
    COUNT(*) as calculation_count
  FROM hourly_data hd
  GROUP BY hd.hour_bucket
  ORDER BY hd.hour_bucket ASC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RPC: Get Inflation Performance Metrics (Combined)
-- =============================================================================
-- Returns all performance metrics in a single call for efficiency.
-- Used by the InflationPerformanceWidget.

CREATE OR REPLACE FUNCTION get_inflation_performance_metrics()
RETURNS TABLE (
  median_latency NUMERIC,
  p95_latency NUMERIC,
  p99_latency NUMERIC,
  total_calculations BIGINT,
  calculations_per_minute NUMERIC,
  hourly_latencies JSONB
) AS $$
DECLARE
  time_window_start TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
  minutes_in_window NUMERIC := 60 * 24; -- 1440 minutes in 24 hours
BEGIN
  RETURN QUERY
  WITH
  -- Calculate overall percentiles
  percentiles AS (
    SELECT
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as median_latency,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency,
      COUNT(*) as total_calculations
    FROM inflation_performance_logs
    WHERE calculated_at >= time_window_start
  ),
  -- Calculate hourly medians for trend
  hourly AS (
    SELECT
      date_trunc('hour', calculated_at) as hour_bucket,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as median_latency
    FROM inflation_performance_logs
    WHERE calculated_at >= time_window_start
    GROUP BY hour_bucket
    ORDER BY hour_bucket ASC
  )
  SELECT
    COALESCE(p.median_latency, 0)::NUMERIC as median_latency,
    COALESCE(p.p95_latency, 0)::NUMERIC as p95_latency,
    COALESCE(p.p99_latency, 0)::NUMERIC as p99_latency,
    COALESCE(p.total_calculations, 0) as total_calculations,
    ROUND(COALESCE(p.total_calculations, 0)::NUMERIC / minutes_in_window, 2) as calculations_per_minute,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'hour', h.hour_bucket,
          'medianLatency', ROUND(h.median_latency::NUMERIC, 2)
        )
        ORDER BY h.hour_bucket ASC
      ) FROM hourly h),
      '[]'::JSONB
    ) as hourly_latencies
  FROM percentiles p;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Enable RLS (Row Level Security)
-- =============================================================================
-- Performance logs are admin-only for reading, but any user can write
-- (logs are created during normal inflation calculations)

ALTER TABLE inflation_performance_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert performance logs
-- (needed for normal inflation calculations during drafts)
CREATE POLICY "Users can insert performance logs"
  ON inflation_performance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can read performance logs
CREATE POLICY "Admins can read performance logs"
  ON inflation_performance_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION get_inflation_latency_percentiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_hourly_latency_trend() TO authenticated;
GRANT EXECUTE ON FUNCTION get_inflation_performance_metrics() TO authenticated;

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE inflation_performance_logs IS
  'Tracks latency metrics for inflation calculations (Story 13.11, NFR-M4/NFR-M5)';

COMMENT ON FUNCTION get_inflation_latency_percentiles() IS
  'Returns median, p95, p99 latency percentiles for last 24 hours';

COMMENT ON FUNCTION get_hourly_latency_trend() IS
  'Returns hourly median latencies for 24h trend chart';

COMMENT ON FUNCTION get_inflation_performance_metrics() IS
  'Combined metrics endpoint for InflationPerformanceWidget';
