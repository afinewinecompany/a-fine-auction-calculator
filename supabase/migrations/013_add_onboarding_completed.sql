-- Migration 013: Add onboarding_completed field to users table
-- Purpose: Track whether user has completed initial onboarding flow
-- Story: 11.6 - Create Basic Onboarding Flow

-- ============================================================================
-- STEP 1: Add onboarding_completed column
-- ============================================================================

-- Add onboarding_completed field (defaults to FALSE for new users)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- STEP 2: Update existing users to null (they haven't seen the new onboarding)
-- ============================================================================

-- Set existing users to null (will be treated as incomplete)
-- New users will get FALSE by default from the column definition
UPDATE users
SET onboarding_completed = NULL
WHERE onboarding_completed IS NOT NULL;

-- ============================================================================
-- Migration Notes:
-- ============================================================================
-- 1. onboarding_completed tracks whether user has completed onboarding modal
-- 2. NULL or FALSE indicates onboarding incomplete → show modal
-- 3. TRUE indicates onboarding complete → skip modal
-- 4. Existing users get NULL to indicate they haven't seen new onboarding
-- 5. New users get FALSE by default
-- ============================================================================
