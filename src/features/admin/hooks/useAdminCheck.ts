/**
 * useAdminCheck Hook
 *
 * Verifies if the current authenticated user has admin privileges.
 * Queries the Supabase users table for the is_admin flag.
 *
 * Story: 13.1 - Create Admin Dashboard Route
 *
 * @example
 * ```tsx
 * const { isAdmin, loading, error } = useAdminCheck();
 *
 * if (loading) return <Loading />;
 * if (!isAdmin) return <Navigate to="/" />;
 * return <AdminDashboard />;
 * ```
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/features/auth/stores/authStore';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AdminCheckResult {
  /** Whether the current user has admin privileges */
  isAdmin: boolean;
  /** Whether the admin check is still loading */
  loading: boolean;
  /** Error message if admin check failed */
  error: string | null;
}

export function useAdminCheck(): AdminCheckResult {
  const user = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      // If no user, not an admin
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // If Supabase not configured, cannot verify admin status
      if (!isSupabaseConfigured()) {
        setError('Admin service not configured');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabase();
        const { data, error: dbError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (dbError) {
          setError('Failed to verify admin status');
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.is_admin ?? false);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading, error };
}
