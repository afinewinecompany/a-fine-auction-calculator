/**
 * Draft Completion Metrics Service
 *
 * Service layer for fetching draft completion metrics from the database.
 * Calls the get_draft_completion_metrics_30d() RPC function.
 *
 * Story: 13.8 - Track Draft Completion Rates
 *
 * @example
 * ```tsx
 * const metrics = await getDraftCompletionMetrics();
 * console.log(metrics.completionRate); // 85.5
 * ```
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { DraftCompletionMetrics, DailyCompletionRate } from '../types/admin.types';

/**
 * Response type from the database RPC function
 */
interface DatabaseMetricsResponse {
  total_drafts: number;
  completed_drafts: number;
  abandoned_drafts: number;
  error_drafts: number;
  completion_rate: number;
  daily_rates: Array<{ date: string; completionRate: number }>;
}

/**
 * Fetch draft completion metrics for the last 30 days
 *
 * @returns Draft completion metrics including totals, rates, and daily breakdown
 * @throws Error if database is not configured or query fails
 */
export async function getDraftCompletionMetrics(): Promise<DraftCompletionMetrics> {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('get_draft_completion_metrics_30d');

  if (error) {
    throw new Error(`Failed to fetch draft completion metrics: ${error.message}`);
  }

  // RPC returns an array with a single row
  const row = (data as DatabaseMetricsResponse[])?.[0];

  if (!row) {
    // Return empty metrics if no data
    return {
      totalDrafts: 0,
      completedDrafts: 0,
      abandonedDrafts: 0,
      errorDrafts: 0,
      completionRate: 0,
      dailyRates: [],
    };
  }

  // Transform database response to our TypeScript interface
  const dailyRates: DailyCompletionRate[] = (row.daily_rates || []).map(
    (rate: { date: string; completionRate: number }) => ({
      date: rate.date,
      completionRate: Number(rate.completionRate) || 0,
    })
  );

  return {
    totalDrafts: Number(row.total_drafts) || 0,
    completedDrafts: Number(row.completed_drafts) || 0,
    abandonedDrafts: Number(row.abandoned_drafts) || 0,
    errorDrafts: Number(row.error_drafts) || 0,
    completionRate: Number(row.completion_rate) || 0,
    dailyRates,
  };
}

/**
 * Check if completion rate is below the NFR-R3 target (80%)
 *
 * @param rate - Completion rate percentage
 * @returns True if rate is below 80% target
 */
export function isBelowTarget(rate: number): boolean {
  return rate < 80;
}
