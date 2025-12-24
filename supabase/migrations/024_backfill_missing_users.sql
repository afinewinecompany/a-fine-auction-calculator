-- Migration 024: Backfill Missing User Records
-- Purpose: Create user records for auth users who don't have a profile yet
-- Issue: Some users (especially OAuth) may not have had their profile created by handle_new_user() trigger

-- ============================================================================
-- STEP 1: Insert missing user records from auth.users
-- ============================================================================

-- Insert records for any auth.users that don't have a corresponding users record
-- This handles users who signed up before the trigger was created or if the trigger failed
INSERT INTO users (id, email, display_name, is_admin, onboarding_completed)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', NULL),
  FALSE,
  FALSE
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- ============================================================================
-- Migration Notes:
-- ============================================================================
-- 1. This backfills user records for any authenticated users missing profiles
-- 2. Extracts display_name from various OAuth metadata fields (Google uses 'name' or 'full_name')
-- 3. Sets is_admin to FALSE for security
-- 4. Sets onboarding_completed to FALSE so they see the onboarding flow
-- 5. This is safe to run multiple times (LEFT JOIN ensures no duplicates)
-- ============================================================================
