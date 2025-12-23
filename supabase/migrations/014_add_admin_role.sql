-- Migration 014: Add Admin Role Enhancements
-- Purpose: Add RLS policies and helper functions for admin role verification
-- Story: 13.1 - Create Admin Dashboard Route
-- Note: is_admin column already exists in users table from migration 002

-- ============================================================================
-- STEP 1: Create function to check admin status
-- ============================================================================

-- Function to check if a user is an admin
-- SECURITY DEFINER allows this function to bypass RLS (needed for route protection)
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, FALSE) FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Add RLS policy for admin access to view all users
-- ============================================================================

-- Drop policy if exists for idempotency
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Policy: Admins can view all users (for admin dashboard features)
-- Regular users can still only view their own profile (existing policy)
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

-- ============================================================================
-- STEP 3: Grant execute permission on the function
-- ============================================================================

GRANT EXECUTE ON FUNCTION is_user_admin TO authenticated;

-- ============================================================================
-- Migration Notes:
-- ============================================================================
-- 1. is_user_admin() function allows checking admin status without RLS issues
-- 2. SECURITY DEFINER on function allows it to query users table directly
-- 3. New "Admins can view all users" policy enables admin dashboard features
-- 4. Regular users unaffected - existing "Users can view own profile" still works
-- 5. Use is_user_admin(auth.uid()) in application code to verify admin status
-- ============================================================================
