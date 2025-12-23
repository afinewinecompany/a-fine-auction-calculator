/**
 * useActiveDrafts Hook
 *
 * Fetches active drafts from the database with automatic polling every 30 seconds.
 * Returns drafts with status 'active', 'paused', or 'error', sorted by last activity.
 *
 * Story: 13.2 - Display Active Drafts List
 *
 * @example
 * ```tsx
 * const { drafts, loading, error, refetch } = useActiveDrafts();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 * return <DraftsList drafts={drafts} />;
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ActiveDraft } from '../types/admin.types';

/** Polling interval in milliseconds (30 seconds) */
const POLLING_INTERVAL = 30000;

export interface UseActiveDraftsResult {
  /** List of active drafts */
  drafts: ActiveDraft[];
  /** Whether the initial fetch is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually trigger a refetch */
  refetch: () => Promise<void>;
}

export function useActiveDrafts(): UseActiveDraftsResult {
  const [drafts, setDrafts] = useState<ActiveDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if we have drafts without adding to dependencies
  const hasDraftsRef = useRef(false);

  const fetchActiveDrafts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Database not configured');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error: dbError } = await supabase
        .from('drafts')
        .select(
          `
          id,
          status,
          started_at,
          last_activity,
          error_message,
          league:leagues(name, team_count, budget),
          user:users(email, full_name)
        `
        )
        .in('status', ['active', 'paused', 'error'])
        .order('last_activity', { ascending: false });

      if (dbError) {
        setError('Failed to fetch active drafts');
        // Keep existing drafts on error (polling failure resilience)
        if (!hasDraftsRef.current) {
          setDrafts([]);
        }
      } else {
        // Type assertion needed because Supabase returns nested objects for joins
        const fetchedDrafts = data as unknown as ActiveDraft[];
        setDrafts(fetchedDrafts);
        hasDraftsRef.current = fetchedDrafts.length > 0;
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Keep existing drafts on error (polling failure resilience)
      if (!hasDraftsRef.current) {
        setDrafts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchActiveDrafts();

    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      fetchActiveDrafts();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchActiveDrafts]);

  return { drafts, loading, error, refetch: fetchActiveDrafts };
}
