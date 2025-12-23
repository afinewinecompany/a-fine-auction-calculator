/**
 * Connection Metrics Service
 *
 * Provides 7-day connection success metrics and daily rates for API integrations.
 * Queries the api_health_logs table using RPC functions for efficient
 * time-windowed aggregations.
 *
 * Story: 13.5 - View Connection Success Metrics
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  ConnectionMetrics,
  DailySuccessRate,
  DailyConnectionDetails,
} from '../types/admin.types';

/** API display name mapping */
const API_DISPLAY_NAMES: Record<string, string> = {
  couch_managers: 'Couch Managers',
  fangraphs: 'Fangraphs',
  google_sheets: 'Google Sheets',
};

/** Success rate thresholds for color coding */
export const SUCCESS_THRESHOLDS = {
  /** Green: >=95% */
  GREEN: 95,
  /** Yellow: 90-95% */
  YELLOW: 90,
} as const;

/**
 * Get success rate color based on thresholds
 * - Green: >=95%
 * - Yellow: 90-95%
 * - Red: <90%
 */
export function getSuccessRateColor(successRate: number): 'green' | 'yellow' | 'red' {
  if (successRate >= SUCCESS_THRESHOLDS.GREEN) return 'green';
  if (successRate >= SUCCESS_THRESHOLDS.YELLOW) return 'yellow';
  return 'red';
}

/** Database response types */
interface Metrics7dRow {
  api_name: string;
  success_rate: number | null;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
}

interface DailyRateRow {
  api_name: string;
  date: string;
  success_rate: number | null;
  total_calls: number;
  successful_calls: number;
}

interface DailyDetailsRow {
  api_name: string;
  success_rate: number | null;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  avg_response_time_ms: number | null;
}

/**
 * Fetch 7-day connection metrics for all APIs with daily rates for trend chart
 *
 * @returns Array of connection metrics for each API
 */
export async function getConnectionMetrics(): Promise<ConnectionMetrics[]> {
  if (!isSupabaseConfigured()) {
    // Return empty data when Supabase is not configured
    return [];
  }

  const supabase = getSupabase();

  // Fetch 7-day metrics and daily rates in parallel
  // Note: Using type assertions because RPC function types are defined in migrations
  // but not yet regenerated in database.types.ts
  const [metrics7dResult, dailyRatesResult] = await Promise.all([
    supabase.rpc('get_connection_metrics_7d' as never),
    supabase.rpc('get_daily_success_rates' as never),
  ]);

  // Handle errors
  if (metrics7dResult.error) {
    console.error('Failed to fetch 7d connection metrics:', metrics7dResult.error);
    throw new Error('Failed to fetch connection metrics');
  }

  if (dailyRatesResult.error) {
    console.error('Failed to fetch daily success rates:', dailyRatesResult.error);
    // Continue with 7d data only - daily rates will be empty
  }

  const metrics7d = (metrics7dResult.data ?? []) as Metrics7dRow[];
  const dailyRates = (dailyRatesResult.data ?? []) as DailyRateRow[];

  // Create a map for quick daily rates lookup by API name
  const dailyRatesMap = new Map<string, DailySuccessRate[]>();
  for (const rate of dailyRates) {
    const existing = dailyRatesMap.get(rate.api_name) ?? [];
    existing.push({
      date: rate.date,
      successRate: rate.success_rate ?? 0,
    });
    dailyRatesMap.set(rate.api_name, existing);
  }

  // Transform database results to ConnectionMetrics interface
  return metrics7d.map((metrics): ConnectionMetrics => {
    const apiDailyRates = dailyRatesMap.get(metrics.api_name) ?? [];
    // Sort by date ascending for chart display
    apiDailyRates.sort((a, b) => a.date.localeCompare(b.date));

    return {
      apiName: API_DISPLAY_NAMES[metrics.api_name] ?? metrics.api_name,
      apiKey: metrics.api_name as ConnectionMetrics['apiKey'],
      successRate7d: metrics.success_rate ?? 0,
      totalCalls: metrics.total_calls,
      successfulCalls: metrics.successful_calls,
      failedCalls: metrics.failed_calls,
      dailyRates: apiDailyRates,
    };
  });
}

/**
 * Fetch detailed connection metrics for a specific date (drill-down)
 *
 * @param date - Target date in YYYY-MM-DD format
 * @returns Array of daily connection details for each API
 */
export async function getDailyConnectionDetails(date: string): Promise<DailyConnectionDetails[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabase();

  // Note: Using type assertion because RPC function type is defined in migrations
  // but not yet regenerated in database.types.ts
  const { data, error } = await supabase.rpc(
    'get_daily_connection_details' as never,
    {
      target_date: date,
    } as never
  );

  if (error) {
    console.error('Failed to fetch daily connection details:', error);
    throw new Error('Failed to fetch daily connection details');
  }

  const rows = (data ?? []) as DailyDetailsRow[];

  return rows.map(
    (row): DailyConnectionDetails => ({
      apiName: API_DISPLAY_NAMES[row.api_name] ?? row.api_name,
      successRate: row.success_rate ?? 0,
      totalCalls: row.total_calls,
      successfulCalls: row.successful_calls,
      failedCalls: row.failed_calls,
      avgResponseTimeMs: row.avg_response_time_ms,
    })
  );
}

/**
 * Count APIs with low success rates (below 95%)
 *
 * @param metrics - Array of connection metrics
 * @returns Number of APIs below green threshold
 */
export function countLowSuccessRateApis(metrics: ConnectionMetrics[]): number {
  return metrics.filter(m => m.successRate7d < SUCCESS_THRESHOLDS.GREEN).length;
}
