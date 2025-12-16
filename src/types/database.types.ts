/**
 * Database Schema Type Definitions
 *
 * PLACEHOLDER TYPES - Manually created to match migration schema.
 * These types were NOT auto-generated from the database.
 *
 * To regenerate from actual Supabase schema (recommended after schema changes):
 * 1. npx supabase login
 * 2. npx supabase link --project-ref ybfhcynumeqqlnhvnoqr
 * 3. npx supabase gen types typescript --project-id ybfhcynumeqqlnhvnoqr > src/types/database.types.ts
 *
 * Current schema based on:
 * - supabase/migrations/001_initial_schema.sql (dropped profiles table)
 * - supabase/migrations/002_users_auth.sql (created users table)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      /**
       * Users table - stores application-specific user data
       * Linked to Supabase auth.users via foreign key on id
       * Created by migration 002_users_auth.sql
       */
      users: {
        Row: {
          /** UUID primary key, references auth.users(id) */
          id: string;
          /** User's email address (from auth.users) - NOT NULL, UNIQUE */
          email: string;
          /** Optional display name for UI */
          display_name: string | null;
          /** Optional avatar/profile picture URL */
          avatar_url: string | null;
          /** Admin flag for Epic 13 admin features */
          is_admin: boolean;
          /** Record creation timestamp */
          created_at: string;
          /** Record last update timestamp */
          updated_at: string;
        };
        Insert: {
          /** Required: UUID from auth.users */
          id: string;
          /** Required: email address */
          email: string;
          /** Optional: display name */
          display_name?: string | null;
          /** Optional: avatar URL */
          avatar_url?: string | null;
          /** Optional: defaults to false */
          is_admin?: boolean;
          /** Optional: defaults to NOW() */
          created_at?: string;
          /** Optional: defaults to NOW() */
          updated_at?: string;
        };
        Update: {
          /** Cannot update id (primary key) */
          id?: never;
          /** Can update email */
          email?: string;
          /** Can update display name */
          display_name?: string | null;
          /** Can update avatar URL */
          avatar_url?: string | null;
          /** Can update admin status (admin only) */
          is_admin?: boolean;
          /** Cannot directly update created_at */
          created_at?: never;
          /** Auto-updated by trigger, but can be set */
          updated_at?: string;
        };
        // Note: Foreign key references auth.users(id) but Supabase type generation
        // doesn't include auth schema relationships. Empty array to avoid type confusion.
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      /** Function to auto-update updated_at timestamp */
      update_updated_at_column: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      /** Function to auto-create users record on auth signup */
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// =============================================================================
// Type Helpers
// =============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
