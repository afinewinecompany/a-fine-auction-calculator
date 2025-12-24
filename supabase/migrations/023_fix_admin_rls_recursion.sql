-- Migration 023: Fix Admin RLS Policy Recursion
-- Purpose: Fix infinite recursion in "Admins can view all users" policy
-- Issue: The policy uses a subquery on users table which causes recursion

-- ============================================================================
-- STEP 1: Drop the problematic policy
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- ============================================================================
-- STEP 2: Recreate policy using the SECURITY DEFINER function
-- ============================================================================

-- The is_user_admin() function from migration 014 is SECURITY DEFINER,
-- which means it bypasses RLS and won't cause recursion
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR
    is_user_admin(auth.uid())
  );

-- ============================================================================
-- Migration Notes:
-- ============================================================================
-- 1. The original policy used a subquery: (SELECT is_admin FROM users WHERE id = auth.uid())
-- 2. This caused infinite recursion because the policy checks users to access users
-- 3. Using is_user_admin() function (SECURITY DEFINER) bypasses RLS and fixes the issue
-- 4. The function was already created in migration 014
-- ============================================================================
