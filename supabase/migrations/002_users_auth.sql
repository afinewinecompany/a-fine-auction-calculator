-- Migration 002: Users Table and Auth Schema
-- Purpose: Consolidate profiles table into users table with enhanced schema
-- This migration drops the profiles table from 001_initial_schema.sql and creates
-- a new users table with all required columns for authentication and profile data.

-- ============================================================================
-- STEP 1: Drop existing profiles table and related objects
-- ============================================================================

-- Drop the trigger first (depends on the table)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop the existing handle_new_user trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the profiles table (cascade will drop policies)
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- STEP 2: Create consolidated users table
-- ============================================================================

-- Create users table with all required columns
-- Combines: original profiles columns + new users story requirements
CREATE TABLE IF NOT EXISTS users (
  -- Primary key linked to Supabase Auth
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- Required: email for user identification (from this story's requirements)
  email TEXT NOT NULL UNIQUE,

  -- Optional: display name for UI (renamed from username)
  display_name TEXT,

  -- Optional: avatar URL for profile pictures
  avatar_url TEXT,

  -- Preserved from profiles: admin flag for Epic 13 admin features
  is_admin BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- STEP 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

-- Policy: Users can view their own profile data only
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile data only
-- WITH CHECK ensures the update doesn't change id to another user's id
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile row
-- This is needed for the trigger to work, but also allows manual insertion
-- Note: is_admin = false constraint prevents privilege escalation via direct INSERT
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id AND is_admin = false);

-- Policy: Users can delete their own profile
-- Allows users to delete their own data for account cleanup
CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- STEP 5: Create/Update Functions
-- ============================================================================

-- Function to automatically update updated_at timestamp on any update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at timestamp
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user record when auth user is created
-- SECURITY DEFINER allows this function to bypass RLS (runs with creator's permissions)
-- This is necessary because the trigger fires before the user session exists
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Extract display_name from user metadata if provided during signup
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle duplicate - this shouldn't happen but be defensive
    RAISE WARNING 'User record already exists for id: %', NEW.id;
    RETURN NEW;
  WHEN others THEN
    -- Log error but don't break auth signup
    RAISE WARNING 'Failed to create user record for id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: Create Trigger for Auto-Creation
-- ============================================================================

-- Trigger to automatically create users record when new auth user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STEP 7: Grant Permissions
-- ============================================================================

-- Ensure authenticated users can access the users table through RLS policies
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;

-- ============================================================================
-- Migration Notes:
-- ============================================================================
-- 1. This migration consolidates the profiles table into users table
-- 2. All RLS policies ensure users can only access their own data (NFR-S7)
--    - SELECT: Users can only view their own row
--    - UPDATE: Users can only update their own row
--    - INSERT: Users can only insert their own row with is_admin=false
--    - DELETE: Users can only delete their own row
-- 3. The handle_new_user() trigger automatically creates a users record
--    when a new auth.users record is created (signup)
-- 4. SECURITY DEFINER on handle_new_user() allows it to bypass RLS
-- 5. The is_admin column is preserved for future Epic 13 admin features
-- 6. INSERT policy prevents privilege escalation by requiring is_admin=false
-- 7. Exception handling in handle_new_user() prevents auth signup failures
-- 8. If any existing profiles data needs migration, run a separate data
--    migration script before applying this migration
-- ============================================================================
