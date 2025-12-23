-- Migration 009: Daily Projection Sync Cron Job
-- Epic 4 - Story 4.6 - Date: 2025-12-17
--
-- Purpose: Schedule daily sync of Fangraphs projections at 2 AM UTC
--
-- NOTE: pg_cron setup requires Supabase Dashboard or CLI configuration.
-- This migration contains the SQL commands to run AFTER pg_cron is enabled.
--
-- To enable pg_cron in Supabase:
-- 1. Go to Database > Extensions in Supabase Dashboard
-- 2. Search for "pg_cron" and enable it
-- 3. Run this migration to create the cron job

-- ============================================================================
-- STEP 1: Enable pg_net extension (required for HTTP calls from cron)
-- ============================================================================

-- pg_net is usually already enabled in Supabase, but we ensure it exists
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================================================
-- STEP 2: Enable pg_cron extension
-- ============================================================================

-- pg_cron must be enabled from Supabase Dashboard first
-- This is a validation that it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    RAISE NOTICE 'pg_cron extension not found. Please enable it from Supabase Dashboard > Database > Extensions';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Create helper function for Edge Function calls
-- ============================================================================

-- This function calls the daily-projection-sync Edge Function
-- It's called by the cron job and handles the HTTP request
-- Note: net.http_post is async and returns a request_id (bigint), not a response
CREATE OR REPLACE FUNCTION invoke_daily_projection_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  supabase_url text;
  service_key text;
BEGIN
  -- Get settings (with fallbacks for safety)
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  -- Validate settings exist
  IF supabase_url IS NULL OR service_key IS NULL THEN
    RAISE WARNING 'Missing app.settings.supabase_url or service_role_key - cannot invoke sync';
    RETURN;
  END IF;

  -- Make async HTTP POST request to Edge Function using pg_net
  -- net.http_post returns a request_id for tracking (async by design)
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/daily-projection-sync',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) INTO request_id;

  -- Log the request (response comes async, check net._http_response table if needed)
  RAISE NOTICE 'Daily projection sync request sent, request_id: %', request_id;

EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Failed to invoke daily projection sync: %', SQLERRM;
END;
$$;

-- ============================================================================
-- STEP 4: Schedule the cron job (2 AM UTC daily)
-- ============================================================================

-- NOTE: This requires pg_cron to be enabled first.
-- If pg_cron is not available, this will be skipped.
DO $outer$
BEGIN
  -- Check if pg_cron is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove existing job if it exists (idempotent)
    PERFORM cron.unschedule('daily-fangraphs-sync');

    -- Schedule new job at 2 AM UTC daily
    -- Cron expression: minute hour day-of-month month day-of-week
    -- '0 2 * * *' = At 02:00 (2 AM) every day
    PERFORM cron.schedule(
      'daily-fangraphs-sync',
      '0 2 * * *',
      'SELECT invoke_daily_projection_sync()'
    );

    RAISE NOTICE 'Cron job "daily-fangraphs-sync" scheduled for 2 AM UTC daily';
  ELSE
    RAISE NOTICE 'pg_cron not available. Skipping cron job creation.';
    RAISE NOTICE 'To enable: Go to Supabase Dashboard > Database > Extensions > pg_cron';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Failed to schedule cron job: %', SQLERRM;
END $outer$;

-- ============================================================================
-- STEP 5: Create view for cron job monitoring (only if pg_cron is available)
-- ============================================================================

-- View to check scheduled jobs (admin use)
-- Only create if pg_cron is enabled, otherwise skip
DO $view$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    EXECUTE $sql$
      CREATE OR REPLACE VIEW cron_job_status AS
      SELECT
        jobid,
        schedule,
        command,
        nodename,
        nodeport,
        database,
        username,
        active
      FROM cron.job
      WHERE jobname = 'daily-fangraphs-sync'
    $sql$;

    -- Grant access to authenticated users (RLS will further restrict)
    EXECUTE 'GRANT SELECT ON cron_job_status TO authenticated';

    RAISE NOTICE 'cron_job_status view created successfully';
  ELSE
    RAISE NOTICE 'Skipping cron_job_status view creation - pg_cron not available';
  END IF;
END $view$;

-- ============================================================================
-- Migration Notes:
-- ============================================================================
-- 1. This migration requires pg_cron to be enabled from Supabase Dashboard
-- 2. The cron job runs at 2 AM UTC daily (0 2 * * *)
-- 3. It calls the daily-projection-sync Edge Function
-- 4. The Edge Function handles:
--    - Finding leagues using Fangraphs
--    - Fetching updated projections
--    - Upserting data
--    - Logging results
--    - Alerting on high error rates
-- 5. Monitoring available via:
--    - projection_sync_logs table
--    - cron_job_status view
--    - Supabase function logs
--
-- To manually test the sync:
--   SELECT invoke_daily_projection_sync();
--
-- To check cron job status:
--   SELECT * FROM cron_job_status;
--
-- To view recent sync logs:
--   SELECT * FROM projection_sync_logs ORDER BY created_at DESC LIMIT 10;
-- ============================================================================
