/**
 * Error Rate Service
 *
 * Provides error rate calculation and trend analysis for API integrations.
 * Queries the api_health_logs table using RPC functions for efficient
 * time-windowed aggregations.
 *
 * Story: 13.4 - View Error Rates with Automated Alerts
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ErrorRate, ErrorRateTrend } from '../types/admin.types';

/** Error rate threshold percentage (5%) */
export const ERROR_THRESHOLD = 5;

/** API display name mapping */
const API_DISPLAY_NAMES: Record<string, string> = {
  couch_managers: 'Couch Managers',
  fangraphs: 'Fangraphs',
  google_sheets: 'Google Sheets',
};

/** Database response types */
interface ErrorRate24hRow {
  api_name: string;
  error_rate_24h: number | null;
  error_count: number;
  total_checks: number;
}

interface ErrorRate1hRow {
  api_name: string;
  error_rate_1h: number | null;
}

/**
 * Calculate trend direction by comparing recent (1h) vs historical (24h) error rates
 *
 * @param rate24h - Error rate over 24 hours
 * @param rate1h - Error rate over last 1 hour (undefined if no data)
 * @returns Trend direction: 'up', 'down', or 'stable'
 */
function calculateTrend(rate24h: number, rate1h: number | undefined): ErrorRateTrend {
  // No recent data means stable (can't determine trend)
  if (rate1h === undefined || rate1h === null) {
    return 'stable';
  }

  // Difference threshold of 1% to avoid noise
  const diff = rate1h - rate24h;
  if (Math.abs(diff) < 1) {
    return 'stable';
  }

  // Recent rate higher than historical = trending up (worse)
  return diff > 0 ? 'up' : 'down';
}

/**
 * Fetch error rates for all APIs over the last 24 hours with trend analysis
 *
 * @returns Array of error rate data for each API
 */
export async function getErrorRates(): Promise<ErrorRate[]> {
  if (!isSupabaseConfigured()) {
    // Return empty data when Supabase is not configured
    return [];
  }

  const supabase = getSupabase();

  // Fetch 24h and 1h error rates in parallel
  const [rates24hResult, rates1hResult] = await Promise.all([
    supabase.rpc('get_error_rates_24h'),
    supabase.rpc('get_error_rates_1h'),
  ]);

  // Handle errors
  if (rates24hResult.error) {
    console.error('Failed to fetch 24h error rates:', rates24hResult.error);
    throw new Error('Failed to fetch error rates');
  }

  if (rates1hResult.error) {
    console.error('Failed to fetch 1h error rates:', rates1hResult.error);
    // Continue with 24h data only - trend will be 'stable'
  }

  const rates24h: ErrorRate24hRow[] = rates24hResult.data ?? [];
  const rates1h: ErrorRate1hRow[] = rates1hResult.data ?? [];

  // Create a map for quick 1h rate lookup
  const rates1hMap = new Map<string, number>();
  for (const rate of rates1h) {
    if (rate.error_rate_1h !== null) {
      rates1hMap.set(rate.api_name, rate.error_rate_1h);
    }
  }

  // Transform database results to ErrorRate interface
  return rates24h.map((rate): ErrorRate => {
    const errorRate24h = rate.error_rate_24h ?? 0;
    const rate1h = rates1hMap.get(rate.api_name);
    const trend = calculateTrend(errorRate24h, rate1h);

    return {
      apiName: API_DISPLAY_NAMES[rate.api_name] ?? rate.api_name,
      apiKey: rate.api_name as ErrorRate['apiKey'],
      errorRate24h,
      errorCount: rate.error_count,
      totalChecks: rate.total_checks,
      trend,
      isAboveThreshold: errorRate24h >= ERROR_THRESHOLD,
    };
  });
}

/**
 * Count the number of APIs with error rates above the threshold
 *
 * @param errorRates - Array of error rate data
 * @returns Number of APIs above threshold
 */
export function countAlertsAboveThreshold(errorRates: ErrorRate[]): number {
  return errorRates.filter(rate => rate.isAboveThreshold).length;
}
