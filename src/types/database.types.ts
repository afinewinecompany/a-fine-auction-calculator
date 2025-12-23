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
 * - supabase/migrations/003_leagues.sql (created leagues table)
 * - supabase/migrations/004_player_projections.sql (created player_projections table)
 * - supabase/migrations/010_draft_tables.sql (created drafted_players and rosters tables)
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
          /** Whether user has completed onboarding flow */
          onboarding_completed: boolean | null;
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
          /** Optional: onboarding completion status, defaults to false */
          onboarding_completed?: boolean | null;
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
          /** Can update onboarding completion status */
          onboarding_completed?: boolean | null;
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
      /**
       * Leagues table - stores fantasy baseball league configurations
       * Created by migration 003_leagues.sql
       * Story: 3.1 - Create Leagues Database Table
       */
      leagues: {
        Row: {
          /** UUID primary key */
          id: string;
          /** UUID of the user who owns this league, references users(id) */
          user_id: string;
          /** User-defined league name - NOT NULL */
          name: string;
          /** Number of teams in the league (8-20) - NOT NULL */
          team_count: number;
          /** Per-team auction budget ($100-$500) - NOT NULL */
          budget: number;
          /** Number of hitter roster spots */
          roster_spots_hitters: number | null;
          /** Number of pitcher roster spots */
          roster_spots_pitchers: number | null;
          /** Number of bench roster spots */
          roster_spots_bench: number | null;
          /** Scoring format: 5x5, 6x6, or points */
          scoring_type: string | null;
          /** Couch Managers room ID for automatic sync (Story 9.2) */
          couch_managers_room_id: string | null;
          /** Record creation timestamp */
          created_at: string;
          /** Record last update timestamp */
          updated_at: string;
        };
        Insert: {
          /** Optional: auto-generated UUID */
          id?: string;
          /** Required: user ID (set by RLS policy to auth.uid()) */
          user_id: string;
          /** Required: league name */
          name: string;
          /** Required: team count (8-20) */
          team_count: number;
          /** Required: budget ($100-$500) */
          budget: number;
          /** Optional: hitter roster spots */
          roster_spots_hitters?: number | null;
          /** Optional: pitcher roster spots */
          roster_spots_pitchers?: number | null;
          /** Optional: bench roster spots */
          roster_spots_bench?: number | null;
          /** Optional: scoring type */
          scoring_type?: string | null;
          /** Optional: Couch Managers room ID */
          couch_managers_room_id?: string | null;
          /** Optional: defaults to NOW() */
          created_at?: string;
          /** Optional: defaults to NOW() */
          updated_at?: string;
        };
        Update: {
          /** Cannot update id (primary key) */
          id?: never;
          /** Cannot update user_id (foreign key) */
          user_id?: never;
          /** Can update league name */
          name?: string;
          /** Can update team count */
          team_count?: number;
          /** Can update budget */
          budget?: number;
          /** Can update hitter roster spots */
          roster_spots_hitters?: number | null;
          /** Can update pitcher roster spots */
          roster_spots_pitchers?: number | null;
          /** Can update bench roster spots */
          roster_spots_bench?: number | null;
          /** Can update scoring type */
          scoring_type?: string | null;
          /** Can update Couch Managers room ID */
          couch_managers_room_id?: string | null;
          /** Cannot directly update created_at */
          created_at?: never;
          /** Auto-updated by trigger, but can be set */
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leagues_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      /**
       * Player Projections table - stores player projection data
       * Created by migration 004_player_projections.sql
       */
      player_projections: {
        Row: {
          id: string;
          league_id: string;
          player_name: string;
          team: string | null;
          positions: string[] | null;
          projected_value: number | null;
          projection_source: string;
          stats_hitters: Json | null;
          stats_pitchers: Json | null;
          tier: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          player_name: string;
          team?: string | null;
          positions?: string[] | null;
          projected_value?: number | null;
          projection_source: string;
          stats_hitters?: Json | null;
          stats_pitchers?: Json | null;
          tier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          league_id?: never;
          player_name?: string;
          team?: string | null;
          positions?: string[] | null;
          projected_value?: number | null;
          projection_source?: string;
          stats_hitters?: Json | null;
          stats_pitchers?: Json | null;
          tier?: string | null;
          created_at?: never;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'player_projections_league_id_fkey';
            columns: ['league_id'];
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
        ];
      };
      /**
       * Drafted Players table - tracks which players have been drafted
       * Created by migration 010_draft_tables.sql
       * Story: 6.1 - Create Draft State Database Tables
       */
      drafted_players: {
        Row: {
          /** UUID primary key */
          id: string;
          /** UUID of the league this draft belongs to */
          league_id: string;
          /** UUID of the drafted player, references player_projections(id) */
          player_id: string;
          /** Team number that drafted this player */
          drafted_by_team: number;
          /** Auction price paid for the player */
          auction_price: number;
          /** Timestamp when the player was drafted */
          drafted_at: string;
          /** Record creation timestamp */
          created_at: string;
        };
        Insert: {
          /** Optional: auto-generated UUID */
          id?: string;
          /** Required: league ID */
          league_id: string;
          /** Required: player ID from projections */
          player_id: string;
          /** Required: team number that drafted this player */
          drafted_by_team: number;
          /** Required: auction price paid */
          auction_price: number;
          /** Optional: defaults to NOW() */
          drafted_at?: string;
          /** Optional: defaults to NOW() */
          created_at?: string;
        };
        Update: {
          /** Cannot update id (primary key) */
          id?: never;
          /** Cannot update league_id */
          league_id?: never;
          /** Cannot update player_id */
          player_id?: never;
          /** Can update drafted_by_team */
          drafted_by_team?: number;
          /** Can update auction_price */
          auction_price?: number;
          /** Can update drafted_at */
          drafted_at?: string;
          /** Cannot directly update created_at */
          created_at?: never;
        };
        Relationships: [
          {
            foreignKeyName: 'drafted_players_league_id_fkey';
            columns: ['league_id'];
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drafted_players_player_id_fkey';
            columns: ['player_id'];
            referencedRelation: 'player_projections';
            referencedColumns: ['id'];
          },
        ];
      };
      /**
       * Rosters table - stores team roster state
       * Created by migration 010_draft_tables.sql
       * Story: 6.1 - Create Draft State Database Tables
       */
      rosters: {
        Row: {
          /** UUID primary key */
          id: string;
          /** UUID of the league this roster belongs to */
          league_id: string;
          /** Team number (unique within league) */
          team_number: number;
          /** Remaining budget for this team */
          budget_remaining: number;
          /** Array of player IDs on this roster */
          players: Json;
          /** Record creation timestamp */
          created_at: string;
          /** Record last update timestamp */
          updated_at: string;
        };
        Insert: {
          /** Optional: auto-generated UUID */
          id?: string;
          /** Required: league ID */
          league_id: string;
          /** Required: team number */
          team_number: number;
          /** Required: starting budget */
          budget_remaining: number;
          /** Optional: defaults to empty array */
          players?: Json;
          /** Optional: defaults to NOW() */
          created_at?: string;
          /** Optional: defaults to NOW() */
          updated_at?: string;
        };
        Update: {
          /** Cannot update id (primary key) */
          id?: never;
          /** Cannot update league_id */
          league_id?: never;
          /** Cannot update team_number (part of unique constraint) */
          team_number?: never;
          /** Can update budget_remaining */
          budget_remaining?: number;
          /** Can update players list */
          players?: Json;
          /** Cannot directly update created_at */
          created_at?: never;
          /** Auto-updated by trigger, but can be set */
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rosters_league_id_fkey';
            columns: ['league_id'];
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
        ];
      };
      /**
       * API Health Logs table - tracks API health check results
       * Created by migration 015_api_health_logs.sql
       * Extended by migration 021_api_health_logs_extend.sql
       * Story: 13.3 - Monitor API Health for Integrations
       * Story: 13.10 - Drill Down into Error Logs
       */
      api_health_logs: {
        Row: {
          /** UUID primary key */
          id: string;
          /** API name: couch_managers, fangraphs, or google_sheets */
          api_name: 'couch_managers' | 'fangraphs' | 'google_sheets';
          /** Health status: healthy, degraded, or down */
          status: 'healthy' | 'degraded' | 'down';
          /** Response time in milliseconds, nullable */
          response_time_ms: number | null;
          /** Error message if any, nullable */
          error_message: string | null;
          /** HTTP status code returned by API, nullable (Story 13.10) */
          status_code: number | null;
          /** API endpoint URL that was called, nullable (Story 13.10) */
          request_url: string | null;
          /** Timestamp when health check was performed */
          checked_at: string;
          /** Record creation timestamp */
          created_at: string;
        };
        Insert: {
          /** Optional: auto-generated UUID */
          id?: string;
          /** Required: API name */
          api_name: 'couch_managers' | 'fangraphs' | 'google_sheets';
          /** Required: health status */
          status: 'healthy' | 'degraded' | 'down';
          /** Optional: response time */
          response_time_ms?: number | null;
          /** Optional: error message */
          error_message?: string | null;
          /** Optional: HTTP status code (Story 13.10) */
          status_code?: number | null;
          /** Optional: request URL (Story 13.10) */
          request_url?: string | null;
          /** Optional: defaults to NOW() */
          checked_at?: string;
          /** Optional: defaults to NOW() */
          created_at?: string;
        };
        Update: {
          /** Cannot update id (primary key) */
          id?: never;
          /** Can update api_name */
          api_name?: 'couch_managers' | 'fangraphs' | 'google_sheets';
          /** Can update status */
          status?: 'healthy' | 'degraded' | 'down';
          /** Can update response_time_ms */
          response_time_ms?: number | null;
          /** Can update error_message */
          error_message?: string | null;
          /** Can update status_code (Story 13.10) */
          status_code?: number | null;
          /** Can update request_url (Story 13.10) */
          request_url?: string | null;
          /** Can update checked_at */
          checked_at?: string;
          /** Cannot directly update created_at */
          created_at?: never;
        };
        Relationships: [];
      };
      /**
       * Google OAuth Tokens table - stores OAuth tokens for Google Sheets integration
       * Created by migration 005_google_oauth_tokens.sql
       * Story: 4.2 - Implement Google Sheets OAuth Integration
       */
      google_oauth_tokens: {
        Row: {
          /** UUID primary key, references users(id) */
          user_id: string;
          /** OAuth access token */
          access_token: string;
          /** OAuth refresh token */
          refresh_token: string;
          /** Token expiration timestamp */
          expires_at: string;
          /** Record creation timestamp */
          created_at: string;
          /** Record update timestamp */
          updated_at: string;
        };
        Insert: {
          /** Required: user ID */
          user_id: string;
          /** Required: access token */
          access_token: string;
          /** Required: refresh token */
          refresh_token: string;
          /** Required: expiration timestamp */
          expires_at: string;
          /** Optional: defaults to NOW() */
          created_at?: string;
          /** Optional: defaults to NOW() */
          updated_at?: string;
        };
        Update: {
          /** Cannot update user_id (primary key) */
          user_id?: never;
          /** Can update access_token */
          access_token?: string;
          /** Can update refresh_token */
          refresh_token?: string;
          /** Can update expires_at */
          expires_at?: string;
          /** Cannot directly update created_at */
          created_at?: never;
          /** Auto-updated by trigger */
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'google_oauth_tokens_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      /**
       * Notifications table - stores admin-broadcasted notifications
       * Created by migration 018_notifications.sql
       * Story: 13.7 - Broadcast In-App Notifications
       */
      notifications: {
        Row: {
          /** UUID primary key */
          id: string;
          /** Notification title */
          title: string;
          /** Notification message body */
          message: string;
          /** Notification type: info, warning, or error */
          type: 'info' | 'warning' | 'error';
          /** Target user ID (null for broadcast to all users) */
          target_user_id: string | null;
          /** ID of the admin who sent the notification */
          sent_by: string;
          /** Timestamp when the notification was sent */
          sent_at: string;
          /** Record creation timestamp */
          created_at: string;
        };
        Insert: {
          /** Optional: auto-generated UUID */
          id?: string;
          /** Required: notification title */
          title: string;
          /** Required: notification message */
          message: string;
          /** Required: notification type */
          type: 'info' | 'warning' | 'error';
          /** Optional: target user ID (null for all users) */
          target_user_id?: string | null;
          /** Optional: auto-set by RLS to auth.uid() */
          sent_by?: string;
          /** Optional: defaults to NOW() */
          sent_at?: string;
          /** Optional: defaults to NOW() */
          created_at?: string;
        };
        Update: {
          /** Cannot update id (primary key) */
          id?: never;
          /** Can update title */
          title?: string;
          /** Can update message */
          message?: string;
          /** Can update type */
          type?: 'info' | 'warning' | 'error';
          /** Can update target_user_id */
          target_user_id?: string | null;
          /** Cannot update sent_by */
          sent_by?: never;
          /** Cannot update sent_at */
          sent_at?: never;
          /** Cannot update created_at */
          created_at?: never;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_target_user_id_fkey';
            columns: ['target_user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_sent_by_fkey';
            columns: ['sent_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      /**
       * Drafts table - tracks draft sessions and their completion status
       * Created by migration 019_draft_completion_metrics.sql
       * Story: 13.2 - Display Active Drafts List
       * Story: 13.8 - Track Draft Completion Rates
       */
      drafts: {
        Row: {
          /** UUID primary key */
          id: string;
          /** UUID of the league this draft belongs to */
          league_id: string;
          /** UUID of the user who started this draft */
          user_id: string;
          /** Draft status: active, paused, completed, abandoned, or error */
          status: 'active' | 'paused' | 'completed' | 'abandoned' | 'error';
          /** Timestamp when the draft was started */
          started_at: string;
          /** Timestamp when the draft was completed (nullable) */
          completed_at: string | null;
          /** Timestamp of last activity */
          last_activity: string;
          /** Error message if status is 'error' (nullable) */
          error_message: string | null;
          /** Record creation timestamp */
          created_at: string;
          /** Record last update timestamp */
          updated_at: string;
        };
        Insert: {
          /** Optional: auto-generated UUID */
          id?: string;
          /** Required: league ID */
          league_id: string;
          /** Required: user ID */
          user_id: string;
          /** Optional: defaults to 'active' */
          status?: 'active' | 'paused' | 'completed' | 'abandoned' | 'error';
          /** Optional: defaults to NOW() */
          started_at?: string;
          /** Optional: completion timestamp */
          completed_at?: string | null;
          /** Optional: defaults to NOW() */
          last_activity?: string;
          /** Optional: error message */
          error_message?: string | null;
          /** Optional: defaults to NOW() */
          created_at?: string;
          /** Optional: defaults to NOW() */
          updated_at?: string;
        };
        Update: {
          /** Cannot update id (primary key) */
          id?: never;
          /** Cannot update league_id */
          league_id?: never;
          /** Cannot update user_id */
          user_id?: never;
          /** Can update status */
          status?: 'active' | 'paused' | 'completed' | 'abandoned' | 'error';
          /** Can update started_at */
          started_at?: string;
          /** Can update completed_at */
          completed_at?: string | null;
          /** Can update last_activity */
          last_activity?: string;
          /** Can update error_message */
          error_message?: string | null;
          /** Cannot directly update created_at */
          created_at?: never;
          /** Auto-updated by trigger */
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'drafts_league_id_fkey';
            columns: ['league_id'];
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drafts_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      /**
       * Inflation Performance Logs table - tracks latency metrics for inflation calculations
       * Created by migration 022_inflation_performance_logs.sql
       * Story: 13.11 - View Inflation Calculation Performance Metrics
       */
      inflation_performance_logs: {
        Row: {
          /** UUID primary key */
          id: string;
          /** Calculation type: basic, position, tier, or budget_depletion */
          calculation_type: 'basic' | 'position' | 'tier' | 'budget_depletion';
          /** Latency in milliseconds */
          latency_ms: number;
          /** Number of players processed (optional context) */
          player_count: number | null;
          /** Optional reference to draft for correlation */
          draft_id: string | null;
          /** Timestamp when calculation was performed */
          calculated_at: string;
          /** Record creation timestamp */
          created_at: string;
        };
        Insert: {
          /** Optional: auto-generated UUID */
          id?: string;
          /** Required: calculation type */
          calculation_type: 'basic' | 'position' | 'tier' | 'budget_depletion';
          /** Required: latency in milliseconds */
          latency_ms: number;
          /** Optional: player count */
          player_count?: number | null;
          /** Optional: draft ID */
          draft_id?: string | null;
          /** Optional: defaults to NOW() */
          calculated_at?: string;
          /** Optional: defaults to NOW() */
          created_at?: string;
        };
        Update: {
          /** Cannot update id (primary key) */
          id?: never;
          /** Can update calculation_type */
          calculation_type?: 'basic' | 'position' | 'tier' | 'budget_depletion';
          /** Can update latency_ms */
          latency_ms?: number;
          /** Can update player_count */
          player_count?: number | null;
          /** Can update draft_id */
          draft_id?: string | null;
          /** Can update calculated_at */
          calculated_at?: string;
          /** Cannot directly update created_at */
          created_at?: never;
        };
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
      /** Function to calculate API error rate for the last 100 checks */
      get_api_error_rate: {
        Args: { api_name_param: string };
        Returns: number;
      };
      /** Function to get draft completion metrics for the last 30 days */
      get_draft_completion_metrics_30d: {
        Args: Record<string, never>;
        Returns: {
          total_drafts: number;
          completed_drafts: number;
          abandoned_drafts: number;
          error_drafts: number;
          completion_rate: number;
          daily_rates: Array<{ date: string; completionRate: number }>;
        }[];
      };
      /** Function to get error rates for the last 24 hours */
      get_error_rates_24h: {
        Args: Record<string, never>;
        Returns: {
          api_name: string;
          error_rate_24h: number | null;
          error_count: number;
          total_checks: number;
        }[];
      };
      /** Function to get error rates for the last 1 hour */
      get_error_rates_1h: {
        Args: Record<string, never>;
        Returns: {
          api_name: string;
          error_rate_1h: number | null;
        }[];
      };
      /**
       * Function to get inflation calculation performance metrics
       * Created by migration 022_inflation_performance_logs.sql
       * Story: 13.11 - View Inflation Calculation Performance Metrics
       */
      get_inflation_performance_metrics: {
        Args: Record<string, never>;
        Returns: {
          median_latency: number;
          p95_latency: number;
          p99_latency: number;
          total_calculations: number;
          calculations_per_minute: number;
          hourly_latencies: Json;
        }[];
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
