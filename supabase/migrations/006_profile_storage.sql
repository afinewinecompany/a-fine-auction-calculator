-- Profile Storage Migration
-- Story: 2.6 - Implement Profile Management
--
-- Creates the avatars storage bucket and RLS policies for secure avatar uploads.
-- Users can only upload/update/delete their own avatars in their user folder.

-- ============================================================================
-- Storage Bucket: avatars
-- ============================================================================

-- Create avatars bucket (if using Supabase CLI/migrations)
-- Note: Storage buckets are typically created via Supabase Dashboard or API
-- This migration documents the expected configuration

-- To create via Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create new bucket named 'avatars'
-- 3. Set Public = true (avatars are publicly viewable)
-- 4. Set File size limit = 2MB
-- 5. Set Allowed MIME types = image/jpeg, image/png, image/webp

-- ============================================================================
-- Storage RLS Policies
-- ============================================================================

-- Drop existing policies first for idempotency
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Policy: Users can upload their own avatar
-- File must be in folder named after their user ID: avatars/{userId}/filename.ext
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Anyone can view avatars (avatars are public)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- Verification Comments
-- ============================================================================

-- Users table verification (from Story 2.1):
-- The users table already has display_name and avatar_url columns:
--   display_name TEXT
--   avatar_url TEXT
--
-- RLS policies for users table (from Story 2.1):
--   - "Users can view their own profile" ON users FOR SELECT
--   - "Users can update their own profile" ON users FOR UPDATE
--
-- These policies ensure users can only read/update their own profile data.
