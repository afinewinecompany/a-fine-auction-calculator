import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables and provide clear error messaging
const validateConfig = (): { url: string; key: string } | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

    console.error(
      `[Supabase] Missing required environment variables: ${missing.join(', ')}.\n` +
        'Create a .env.local file with your Supabase credentials.\n' +
        'See README.md for setup instructions.'
    );
    return null;
  }
  return { url: supabaseUrl, key: supabaseAnonKey };
};

const config = validateConfig();

// Create typed Supabase client instance
// Returns null if credentials are not configured (allows graceful handling)
export const supabase: SupabaseClient<Database> | null = config
  ? createClient<Database>(config.url, config.key)
  : null;

/**
 * Get the Supabase client, throwing an error if not configured.
 * Use this when Supabase is required for the operation.
 */
export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabase) {
    throw new Error(
      'Supabase client not initialized. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local'
    );
  }
  return supabase;
};

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = (): boolean => supabase !== null;

// Re-export Database type for convenience
export type { Database };
