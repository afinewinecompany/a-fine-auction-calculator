/**
 * Inflation Performance Metrics Service
 *
 * Service layer for fetching inflation calculation performance metrics from the database.
 * Calls the get_inflation_performance_metrics() RPC function.
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 *
 * @example
 * ```tsx
 * const metrics = await getInflationPerformanceMetrics();
 * console.log(metrics.medianLatency); // 45
 * console.log(metrics.p99Latency);     // 120
 * ```
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { InflationPerformanceMetrics, HourlyLatencyPoint } from '../types/admin.types';

/**
 * Response type from the database RPC function
 */
interface DatabaseMetricsResponse {
  median_latency: number;
  p95_latency: number;
  p99_latency: number;
  total_calculations: number;
  calculations_per_minute: number;
  hourly_latencies: Array<{ hour: string; medianLatency: number }>;
}

/**
 * Fetch inflation performance metrics for the last 24 hours
 *
 * @returns Inflation performance metrics including percentiles, totals, and hourly trend
 * @throws Error if database is not configured or query fails
 */
export async function getInflationPerformanceMetrics(): Promise<InflationPerformanceMetrics> {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('get_inflation_performance_metrics');

  if (error) {
    throw new Error(`Failed to fetch inflation performance metrics: ${error.message}`);
  }

  // RPC returns an array with a single row
  const row = (data as DatabaseMetricsResponse[])?.[0];

  if (!row) {
    // Return empty metrics if no data
    return {
      medianLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      totalCalculations: 0,
      calculationsPerMinute: 0,
      hourlyLatencies: [],
    };
  }

  // Transform database response to our TypeScript interface
  const hourlyLatencies: HourlyLatencyPoint[] = (row.hourly_latencies || []).map(
    (point: { hour: string; medianLatency: number }) => ({
      hour: point.hour,
      medianLatency: Number(point.medianLatency) || 0,
    })
  );

  return {
    medianLatency: Number(row.median_latency) || 0,
    p95Latency: Number(row.p95_latency) || 0,
    p99Latency: Number(row.p99_latency) || 0,
    totalCalculations: Number(row.total_calculations) || 0,
    calculationsPerMinute: Number(row.calculations_per_minute) || 0,
    hourlyLatencies,
  };
}
